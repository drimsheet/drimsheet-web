import type { TChartConfig } from './types';

function getPayloadConfig(config: TChartConfig, payload: unknown, key: string) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }

  const payloadPayload =
    'payload' in payload &&
    typeof payload.payload === 'object' &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === 'string'
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

function createStyles(id: string, config: TChartConfig) {
  return Object.entries({ light: '', dark: '.dark' })
    .map(([theme, prefix]) => {
      const declarations = Object.entries(config)
        .map(([key, item]) => {
          const color = item.theme?.[theme as 'light' | 'dark'] ?? item.color;

          return color ? `  --color-${key}: ${color};` : '';
        })
        .join('\n');

      return `${prefix} [data-chart="${id}"] {\n${declarations}\n}`;
    })
    .join('\n');
}

const chartHelpers = Object.freeze({ getPayloadConfig, createStyles });
export default chartHelpers;
