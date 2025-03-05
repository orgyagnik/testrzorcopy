export const NoticeValidator = (startDate, endDate, startTime, endTime, message, color, role) => [
    {
        name: "startDate",
        inputName: "startDateInput",
        value: startDate,
        validation: ['required'],
    },
    {
        name: "startTime",
        inputName: "startTimeInput",
        value: startTime,
        validation: ['required'],
    },
    {
        name: "endDate",
        inputName: "endDateInput",
        value: endDate,
        validation: ['required'],
    },
    {
        name: "endTime",
        inputName: "endTimeInput",
        value: endTime,
        validation: ['required'],
    },
    {
        name: "role",
        inputName: "roleInput",
        value: role,
        validation: ['required'],
    },
    {
        name: "message",
        inputName: "messageInput",
        value: message,
        validation: ['required'],
    },
    {
        name: "color",
        inputName: "colorInput",
        value: color,
        validation: ['required'],
    },
]; 
