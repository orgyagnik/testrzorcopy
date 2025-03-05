export const UserValidator = (firstName, lastName, email, phone, role, designation, dobDate, gender, password, confirmPassword, agency, agencyNameInput, country, state, cityInput, zipCodeInput, workLocation, dateOfJoining) => [
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
    name: "email",
    inputName: "emailInput",
    value: email,
    validation: ['required', 'email'],
    message: {
      //required: 'This field is required ',
      email: 'The email must be a valid email address.'
    }
  },
  {
    name: "phone number",
    inputName: "phoneInput",
    value: phone,
    validation: ['required', 'phone'],
  },
  {
    name: "role",
    inputName: "roleInput",
    value: role,
    validation: ['required'],
  },
  {
    name: "designation",
    inputName: "designationInput",
    value: designation,
    validation: ['required'],
  },
  {
    name: "date of birth",
    inputName: "dobDate",
    value: dobDate,
    validation: ['required', 'date'],
  },
  {
    name: "gender",
    inputName: "gender",
    value: gender,
    validation: ['required'],
  },
  {
    name: "password",
    inputName: "passwordInput",
    value: password,
    validation: ['password'],
  },
  {
    name: "confirm password",
    inputName: "confirmPasswordInput",
    value: confirmPassword,
    validation: ['password', `confirmed:${password}`],
  },
  {
    name: "agency",
    inputName: "agencyInput",
    value: agency,
    validation: ['required'],
  },
  {
    name: "agencyNameInput",
    inputName: "agencyNameInput",
    value: agencyNameInput,
    validation: ['required'],
  },
  {
    name: "country",
    inputName: "country",
    value: country,
    validation: ['required'],
  },
  {
    name: "state",
    inputName: "state",
    value: state,
    validation: ['required'],
  },
  {
    name: "cityInput",
    inputName: "cityInput",
    value: cityInput,
    validation: ['required'],
  },
  {
    name: "zipCodeInput",
    inputName: "zipCodeInput",
    value: zipCodeInput,
    validation: ['required'],
  },
  {
    name: "work from home",
    inputName: "workFormHomeInput",
    value: workLocation,
    validation: ['required'],
  },
  {
    name: "date of joining",
    inputName: "dateOfJoiningInput",
    value: dateOfJoining,
    validation: ['required'],
  }
];

export const EditUserValidator = (firstName, lastName, email, phone, role, designation, dobDate, gender, agency, agencyNameInput, timezone, workLocation, dateOfJoining) => [
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
    name: "email",
    inputName: "emailInput",
    value: email,
    validation: ['required', 'email'],
  },
  {
    name: "phone number",
    inputName: "phoneInput",
    value: phone,
    validation: ['required', 'phone'],
  },
  {
    name: "role",
    inputName: "roleInput",
    value: role,
    validation: ['required'],
  },
  {
    name: "designation",
    inputName: "designationInput",
    value: designation,
    validation: ['required'],
  },
  {
    name: "date of birth",
    inputName: "dobDate",
    value: dobDate,
    validation: ['required', 'date'],
  },
  {
    name: "gender",
    inputName: "gender",
    value: gender,
    validation: ['required'],
  },
  {
    name: "agency",
    inputName: "agencyInput",
    value: agency,
    validation: ['required'],
  },
  {
    name: "agencyNameInput",
    inputName: "agencyNameInput",
    value: agencyNameInput,
    validation: ['required'],
  },
  {
    name: "timezone",
    inputName: "timezoneInput",
    value: timezone,
    validation: ['required'],
  },
  {
    name: "work from home",
    inputName: "workFormHomeInput",
    value: workLocation,
    validation: ['required'],
  },
  {
    name: "date of joining",
    inputName: "dateOfJoiningInput",
    value: dateOfJoining,
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

export const UserBulkActionValidator = (agency, projectManager) => [
  {
    name: "agency",
    inputName: "agencyInput",
    value: agency,
    validation: ['required'],
  },
  {
    name: "project manager",
    inputName: "projectManagerInput",
    value: projectManager,
    validation: ['required'],
  }
]; 