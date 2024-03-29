import { errorCodes } from '../error-codes.js';
import { ValidationError } from '../validation-error.js';
import { Message, formatMessage } from '../utils/format-message.js';

export type NonEmptyErrorDetails = {
  value: string;
  ignoreWhitespace: boolean;
};

export function nonEmpty(options: {
  ignoreWhitespace?: boolean;
  message?: Message<NonEmptyErrorDetails>;
} = {}) {
  return (value: string) => {
    const ignoreWhitespace = options.ignoreWhitespace || false;
    const message = options.message || formatNonEmptyError;
    const valueToCheck = ignoreWhitespace ? value.trim() : value;
    if (!valueToCheck) {
      const details: NonEmptyErrorDetails = { value, ignoreWhitespace };
      const errorMessage = formatMessage(message, details);
      throw new ValidationError(errorMessage, {
        details,
        code: errorCodes.emptyString,
      });
    }
  };
}

function formatNonEmptyError({ ignoreWhitespace }: NonEmptyErrorDetails) {
  if (ignoreWhitespace) {
    return (
      'The value must be a non-empty string and ' +
      'contain not only whitespace characters.'
    );
  }
  return 'The value must be a non-empty string.';
}
