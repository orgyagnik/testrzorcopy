export const TaskValidator = (project, projectTitleInput, client, clientNameInput, taskNameInput, date, dueDate, selectedAssignedBy, noOfTimeRepeat, customEvery) => [
    {
        name: "project",
        inputName: "projectInput",
        value: project,
        validation: ['required'],
    },
    {
        name: "project name",
        inputName: "projectTitleInput",
        value: projectTitleInput,
        validation: ['required'],
    },
    {
        name: "client",
        inputName: "clientInput",
        value: client,
        validation: ['required'],
    },
    {
        name: "client name",
        inputName: "clientNameInput",
        value: clientNameInput,
        validation: ['required'],
    },
    {
        name: "task name",
        inputName: "taskNameInput",
        value: taskNameInput,
        validation: ['required'],
    },
    {
        name: "start date",
        inputName: "date",
        value: date,
        validation: ['required','date'],
    },
    /*{
        name: "due date",
        inputName: "dueDate",
        value: dueDate,
        validation: ['required','date'],
    },*/
    {
        name: "assign members",
        inputName: "selectedAssignedBy",
        value: selectedAssignedBy,
        validation: ['required'],
    },
    {
        name: "repeat no of time",
        inputName: "noOfTimeRepeatInput",
        value: noOfTimeRepeat,
        validation: ['required'],
    },
    {
        name: "repeat every",
        inputName: "customEvery",
        value: customEvery,
        validation: ['required'],
    }
]; 