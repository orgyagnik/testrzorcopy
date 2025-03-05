export const EmailTemplateValidator = (subject, message) => [
    {
        name: "subject",
        inputName: "subjectInput",
        value: subject,
        validation: ['required'],
    },
    {
        name: "message",
        inputName: "messageInput",
        value: message,
        validation: ['required'],
    },
];