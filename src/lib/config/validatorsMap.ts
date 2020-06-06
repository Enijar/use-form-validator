import { Message, Rule, ValidatorsMap } from "./types";
import messagesMap from "./messagesMap";
import { formatMessage } from "../hooks/use-validators";

function getValueType(value: any): string {
  return value.match(/^\d+$/) ? "number" : typeof value;
}

function getLength(value: any): number {
  const type = getValueType(value);
  if (type === "number") {
    return parseFloat(value);
  }
  return value.length;
}

const validatorsMap: ValidatorsMap = {
  required(value: any): Rule {
    const length = getLength(value);
    return {
      pass: length > 0,
      message(field: string): Message {
        return formatMessage(messagesMap.required, { field });
      },
    };
  },
  min(value: any, min: number): Rule {
    const length = getLength(value);
    return {
      pass: length >= min,
      message(field: string): Message {
        return formatMessage(messagesMap.min, { field, min });
      },
    };
  },
  max(value: any, max: number): Rule {
    const length = getLength(value);
    return {
      pass: length <= max,
      message(field: string): Message {
        return formatMessage(messagesMap.max, { field, max });
      },
    };
  },
  between(value: any, min: number, max: number): Rule {
    const length = getLength(value);
    return {
      pass: length >= min && length <= max,
      message(field: string): Message {
        return formatMessage(messagesMap.between, { field, min, max });
      },
    };
  },
  email(value: any): Rule {
    return {
      pass: /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i.test(
        value
      ),
      message(field: string): Message {
        return formatMessage(messagesMap.email, { field });
      },
    };
  },
  uuid(value:any): Rule {
    return {
      pass: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value
      ),
      message(field: string): Message {
        return formatMessage(messagesMap.uuid, {field})
      }
    }
  },
  required_if(value:any): Rule {
    const args = this.args;
    return {
      pass: (params:any, values:any) => {
        let valid = true;
        let shouldValidate = false;
        args.forEach((rule:any, index:any) => {
          if(values.hasOwnProperty(rule)) {
            if(values[rule] === args[index + 1]) {
              shouldValidate = true;
            } else {
              shouldValidate = false;
            }
          }
        });
        if(shouldValidate) {
          valid = validatorsMap.required(value).pass;
        }
        return valid;
      },
      message(field: string): Message {
        return formatMessage(messagesMap.required_if, {field});
      }
    }
  }
};

export default validatorsMap;
