import { signupMapper } from '@/auth/lib/mappers/signup.mapper';
import { describe, expect, it } from 'vitest';

describe('signupMapper', () => {
  it('maps only the signup request fields without changing entered values', () => {
    const values = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: ' entered password ',
      passwordConfirmation: ' entered password ',
    };

    expect(signupMapper.toRequest(values)).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: ' entered password ',
    });
  });
});
