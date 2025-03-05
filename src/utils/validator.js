import validator from 'validator';
// import moment from 'moment';
// import { date_format } from '../settings';
import { isDate, capitalizeFirst } from './functions'

const chkRequired = (value) => {
    if (value === '' || value === null) {
        return false;
    }
    return true;
};

const chkString = (value) => {
    const string_regex = /^[A-Za-z]+$/
    if (!string_regex.test(value)) {
        return false;
    }
    return true;
}

const chkEmail = (value) => {
    /*const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!regex.test(values.emailInput)) {
      errors.emailInput = "The email must be a valid email address.";
    }*/
    if (!validator.isEmail(value)) {
        return false;
    }
    return true;
};

const chkPhone = (value) => {
    let newValue = value.replaceAll("-", "").replaceAll("_", "").replaceAll("+", "");
    //var phone_regex = /^\d{10}$/;
    var phone_regex = /^(0|[1-9][0-9]*)$/;
    if (!newValue.match(phone_regex)) {
        return false;
    }
    return true;
};

const chkDate = (value) => {
    if (isDate(value) === false) {
        return false;
    }
    return true;
};

const chkPassword = (value) => {
    var password_regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[=<>{}|"()+.:;/_~#?!@$%^&*-]).{8,}$/;
    if (!value.match(password_regex)) {
        return false;
    }
    return true;
};

const chkMinLength = (value, length) => {
    if (value.length < length) {
        return false;
    }
    return true;
};

const chkMaxLength = (value, length) => {
    if (value.length > length) {
        return false;
    }
    return true;
};

const chkLength = (value, length) => {
    if (value.length !== length) {
        return false;
    }
    return true;
};

const chkMatchValidation = (value, matchWithValue) => {
    if (value !== matchWithValue) {
        return false;
    }
    return true;
};

export const validateForm = (validateFields) => {
    let errors = [];
    validateFields.map((field) => (
        field.validation.map((validate) => (
            (() => {
                let leng = 0;
                if ((validate.includes(":"))) {
                    //leng = parseInt(validate.split(':')[1]);
                    leng = validate.split(':')[1];
                }
                switch (validate) {
                    case 'required':
                        if (!chkRequired(field.value)) {
                            errors[field.inputName] = field.message !== undefined && field.message[validate] ? field.message[validate] : `The ${field.name} field is required.`;
                        }
                        return true;
                    case 'string':
                        if (field.value && !chkString(field.value)) {
                            errors[field.inputName] = field.message !== undefined && field.message[validate] ? field.message[validate] : `Please enter valid ${field.name}.`;
                        }
                        return true;
                    case 'email':
                        if (field.value && !chkEmail(field.value)) {
                            errors[field.inputName] = field.message !== undefined && field.message[validate] ? field.message[validate] : `The ${field.name} must be a valid email address.`;
                        }
                        return true;
                    case 'phone':
                        if (field.value && !chkPhone(field.value)) {
                            errors[field.inputName] = field.message !== undefined && field.message[validate] ? field.message[validate] : `Please enter valid ${field.name}.`;
                        }
                        return true;
                    case 'date':
                        if (field.value && !chkDate(field.value)) {
                            errors[field.inputName] = field.message !== undefined && field.message[validate] ? field.message[validate] : `Please enter valid ${field.name}.`;
                        }
                        return true;
                    case 'password':
                        if (!chkPassword(field.value)) {
                            errors[field.inputName] = field.message !== undefined && field.message[validate] ? field.message[validate] : `${capitalizeFirst(field.name)} should have 8 characters including special character, capital letter & number.`;
                        }
                        return true;
                    case `minlength:${leng}`:
                        if (!chkMinLength(field.value, leng)) {
                            errors[field.inputName] = field.message !== undefined && field.message[validate] ? field.message[validate] : `${capitalizeFirst(field.name)} must be more than ${leng} characters.`;
                        }
                        return true;
                    case `maxlength:${leng}`:
                        if (field.value && !chkMaxLength(field.value, leng)) {
                            errors[field.inputName] = field.message !== undefined && field.message[validate] ? field.message[validate] : `${capitalizeFirst(field.name)} must be less than ${leng} characters.`;
                        }
                        return true;
                    case `length:${leng}`:
                        if (field.value && !chkLength(field.value, leng)) {
                            errors[field.inputName] = field.message !== undefined && field.message[validate] ? field.message[validate] : `${capitalizeFirst(field.name)} must be ${leng} characters.`;
                        }
                        return true;
                    case `confirmed:${leng}`:
                        if (field.value && !chkMatchValidation(field.value, leng)) {
                            errors[field.inputName] = field.message !== undefined && field.message[validate] ? field.message[validate] : `Password and confirm password does not match.`;
                        }
                        return true;
                    default:
                        return true;
                }
            })()
        ))
    ))
    return errors;
};

export const formDataToObject = (formData) => {
    let object = {};
    
    formData.forEach((value, key) => {
      // Parse JSON strings back to objects if necessary
      if (value.startsWith("[") || value.startsWith("{")) {
        try {
          object[key] = JSON.parse(value);
        } catch (e) {
          object[key] = value; // If parsing fails, keep as string
        }
      } else {
        object[key] = value;
      }
    });
  
    return object;
  };

  export const KeywordDifficultyToText = (value) => {
    if (value > 50) {
      return 'hard';
    } else if (value > 25) {
      return 'medium';
    } else {
      return 'easy';
    }
  }
  