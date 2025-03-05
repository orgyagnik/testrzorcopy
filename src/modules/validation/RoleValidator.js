export const RoleValidator = (nameval, codeval) => [
    {
      name: "role name",
      inputName: "nameInput",
      value: nameval,
      validation: ['required'],
    },
    {
      name: "role code",
      inputName: "codeInput",
      value: codeval,
      validation: ['required'],
    }
  ]; 