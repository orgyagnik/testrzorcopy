export const TaskboardValidator = (agency, developer, clientHappyStatus, agencyName) => [
    {
        name: "agency",
        inputName: "agencyInput",
        value: agency,
        validation: ['required'],
    },
    {
        name: "developer",
        inputName: "developerInput",
        value: developer,
        validation: ['required'],
    },
    {
        name: "client happy status",
        inputName: "clientHappyStatusInput",
        value: clientHappyStatus,
        validation: ['required'],
    },
    {
        name: "agency name",
        inputName: "agencyNameInput",
        value: agencyName,
        validation: ['required'],
    },
];

export const QAboardValidator = (agency, developer, task, taskDescription) => [
    {
        name: "agency",
        inputName: "agencyInput",
        value: agency,
        validation: ['required'],
    },
    {
        name: "QA",
        inputName: "developerInput",
        value: developer,
        validation: ['required'],
    },
    {
        name: "task",
        inputName: "taskInput",
        value: task,
        validation: ['required'],
    },
    {
        name: "task description",
        inputName: "taskDescriptionInput",
        value: taskDescription,
        validation: ['required'],
    }
];

export const CustomBoardValidator = (project, developer, clientHappyStatus, hours) => [
    {
        name: "project",
        inputName: "projectInput",
        value: project,
        validation: ['required'],
    },
    {
        name: "QA",
        inputName: "developerInput",
        value: developer,
        validation: ['required'],
    },
    {
        name: "client happy status",
        inputName: "clientHappyStatusInput",
        value: clientHappyStatus,
        validation: ['required'],
    },
    {
        name: "hours",
        inputName: "hoursInput",
        value: hours,
        validation: ['required'],
    },
];

export const CustomBoardDeveloperAddValidator = (developer) => [
    {
        name: "developer",
        inputName: "developerInput",
        value: developer,
        validation: ['required'],
    },
];

export const ResourceAddValidator = (agency, developer, clientHappyStatus, agencyName, startDate, endDate) => [
    {
        name: "agency",
        inputName: "agencyInput",
        value: agency,
        validation: ['required'],
    },
    {
        name: "developer",
        inputName: "developerInput",
        value: developer,
        validation: ['required'],
    },
    {
        name: "client happy status",
        inputName: "clientHappyStatusInput",
        value: clientHappyStatus,
        validation: ['required'],
    },
    {
        name: "agency name",
        inputName: "agencyNameInput",
        value: agencyName,
        validation: ['required'],
    },
    {
        name: "start date",
        inputName: "startDate",
        value: startDate,
        validation: ['required','startDate'],
    },
    {
        name: "end date",
        inputName: "endDate",
        value: endDate,
        validation: ['required','endDate'],
    },
];