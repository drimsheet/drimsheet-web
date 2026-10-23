import type { ISignupFormValues } from '@/auth/components/signup-form/types';
import type { IUserSignupReq } from '@/shared/lib/api/Api';

function toRequest(values: ISignupFormValues): IUserSignupReq {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    password: values.password,
  };
}

export const signupMapper = Object.freeze({ toRequest });
