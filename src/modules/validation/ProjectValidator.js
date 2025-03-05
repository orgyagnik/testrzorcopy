export const ProjectValidator = (nameval, clientval) => [
    {
      name: "name",
      inputName: "nameInput",
      value: nameval,
      validation: ['required'],
    },
    {
      name: "client",
      inputName: "clientInput",
      value: clientval,
      validation: ['required'],
    }
  ]; 

  export const ProjectBulkActionValidator = (projects, assignMembers) => [
    {
      name: "project",
      inputName: "projectsInput",
      value: projects,
      validation: ['required'],
    },
    {
      name: "assign to",
      inputName: "assignMembersInput",
      value: assignMembers,
      validation: ['required'],
    }
  ]; 