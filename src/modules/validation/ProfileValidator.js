export const ProfileValidator = (firstName, lastName, phonenumber, dobDate, gender, timezone) => [
    {
      name: "first name",
      inputName: "firstNameInput",
      value: firstName,
      validation: ['required'],
    },
    {
      name: "last name",
      inputName: "lastNameInput",
      value: lastName,
      validation: ['required'],
    },
    {
      name: "phonenumber",
      inputName: "phoneInput",
      value: phonenumber,
      validation: ['required','phonenumber'],
    },
    {
      name: "date of birth",
      inputName: "dobDate",
      value: dobDate,
      validation: ['required','date'],
    },
    {
      name: "gender",
      inputName: "gender",
      value: gender,
      validation: ['required'],
    },
    {
      name: "timezone",
      inputName: "timezoneInput",
      value: timezone,
      validation: ['required'],
    }
  ]; 

  export const ChangePasswordValidator = (oldPassword, password, confirmPassword) => [
    {
      name: "old password",
      inputName: "oldPasswordInput",
      value: oldPassword,
      validation: ['required'],
    },
    {
      name: "new password",
      inputName: "passwordInput",
      value: password,
      validation: ['password'],
    },
    {
      name: "confirm password",
      inputName: "confirmPasswordInput",
      value: confirmPassword,
      validation: ['password', `confirmed:${password}`],
    }
  ]; 