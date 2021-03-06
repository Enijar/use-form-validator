import * as React from "react";
import { Data, Errors, Messages, Rules, Validator } from "./config/types";
import useValidators, { formatMessage } from "./hooks/use-validators";

export default function useFormValidator(
  data: Data,
  rules: Rules,
  messages: Messages = {}
): any {
  const [valid, setValid] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<Errors>({});
  const validators = useValidators(rules);

  const getValue = React.useCallback(
    (value: any, defaultValue: string = ""): any => {
      const type = typeof value;
      if (type === "undefined") {
        return defaultValue;
      }
      if (type === "string") {
        return value.trim();
      }
      return value;
    },
    []
  );

  React.useEffect(() => {
    const errors: Errors = {};
    let valid = true;
    for (const field in validators) {
      if (!validators.hasOwnProperty(field)) {
        continue;
      }
      const value: any = getValue(data[field]);
      for (let i = 0, length = validators[field].length; i < length; i++) {
        const validator: Validator = validators[field][i];
        const { pass, message } = validator.test(value, ...validator.args);
        if (pass) {
          continue;
        }
        valid = false;
        if (!errors.hasOwnProperty(field)) {
          errors[field] = [];
        }
        if (
          messages.hasOwnProperty(field) &&
          messages[field].hasOwnProperty(validator.name)
        ) {
          errors[field].push(formatMessage(messages[field][validator.name]));
        } else if (messages.hasOwnProperty(validator.name)) {
          errors[field].push(formatMessage(messages[validator.name]));
        } else {
          errors[field].push(message(field));
        }
      }
    }
    setErrors(errors);
    setValid(valid);
  }, [validators, data, messages, getValue]);

  return {
    valid,
    errors: {
      all() {
        const allErrors: string[] = [];
        for (const field in errors) {
          if (!errors.hasOwnProperty(field)) {
            continue;
          }
          errors[field].forEach(
            (error: string): void => void allErrors.push(error)
          );
        }
        return allErrors;
      },
      get(field: string): string[] {
        return errors[field] || [];
      },
      first(field: string): string {
        return (errors[field] || [])[0] || null;
      },
    },
  };
}
