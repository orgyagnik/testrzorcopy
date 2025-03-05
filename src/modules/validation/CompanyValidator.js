export const CompanyValidator = (company) => [
    {
        name: "company name",
        inputName: "companyInput",
        value: company,
        validation: ['required'],
    }
]; 

export const ContactValidator = (firstName, lastName, email, password) => [
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
        name: "password",
        inputName: "passwordInput",
        value: password,
        validation: ['password'],
    }
  ]; 