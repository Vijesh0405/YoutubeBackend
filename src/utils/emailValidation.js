import { validate } from "email-validator";
const checkEmailFormat = (email) => {
  return validate(email);
};

export { checkEmailFormat };
