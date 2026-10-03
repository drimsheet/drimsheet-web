import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import config from '../api-gen.config.js';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const TRANSLATION_FILE_PATH = path.resolve(
  'src/shared/i18n/locales/en/api-errors.json'
);

async function fetchErrorKeysFromGitHub() {
  const url = `https://raw.githubusercontent.com/${config.org}/${config.repo}/${config.branch}/generated/error-keys.json`;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3.raw',
      Authorization: GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : '',
      Cache: 'no-cache',
    },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch error keys: ${res.status} ${res.statusText}`
    );
  }

  return await res.json();
}

async function syncErrorKeys() {
  try {
    const errorKeys = await fetchErrorKeysFromGitHub();

    if (!Array.isArray(errorKeys)) {
      throw new Error('Fetched error keys is not an array.');
    }

    // Ensure translation file exists
    if (!fs.existsSync(TRANSLATION_FILE_PATH)) {
      fs.writeFileSync(
        TRANSLATION_FILE_PATH,
        JSON.stringify({}, null, 2),
        'utf-8'
      );
    }

    // Read current translations
    const rawData = fs.readFileSync(TRANSLATION_FILE_PATH, 'utf-8');
    let translations = {};
    try {
      translations = JSON.parse(rawData);
    } catch (e) {
      throw new Error(`Invalid JSON in ${TRANSLATION_FILE_PATH}`);
    }

    // Remove keys that no longer exist in the source
    const sourceKeys = new Set(errorKeys);
    let removedKeysCount = 0;
    Object.keys(translations).forEach((key) => {
      if (!sourceKeys.has(key)) {
        delete translations[key];
        removedKeysCount++;
      }
    });

    // Append missing keys
    let addedKeysCount = 0;
    errorKeys.forEach((key) => {
      if (typeof translations[key] === 'undefined') {
        translations[key] = '';
        addedKeysCount++;
      }
    });

    // Write back updated translations
    if (addedKeysCount > 0 || removedKeysCount > 0) {
      fs.writeFileSync(
        TRANSLATION_FILE_PATH,
        JSON.stringify(translations, null, 2) + '\n',
        'utf-8'
      );
    }

    if (addedKeysCount > 0) {
      console.log(
        `✅ Added ${addedKeysCount} new error key(s) to ${TRANSLATION_FILE_PATH}`
      );
    }

    if (removedKeysCount > 0) {
      console.log(
        `✅ Removed ${removedKeysCount} obsolete error key(s) from ${TRANSLATION_FILE_PATH}`
      );
    }

    // Verify all keys have non-empty translations
    const missingTranslations = [];
    errorKeys.forEach((key) => {
      if (!translations[key] || translations[key].trim() === '') {
        missingTranslations.push(key);
      }
    });

    if (missingTranslations.length > 0) {
      console.error('❌ The following error keys are missing translations:');
      missingTranslations.forEach((key) => console.error(`  - ${key}`));
      console.error(
        `\nPlease provide translations in ${TRANSLATION_FILE_PATH} and commit the changes before pushing.`
      );
      process.exit(1);
    }

    console.log('✅ All error keys are translated.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to sync error keys:', err);
    process.exit(1);
  }
}

syncErrorKeys();
