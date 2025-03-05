export const WorkReportValidator = (date) => [
    {
        name: "date",
        inputName: "dateInput",
        value: date,
        validation: ['required','date'],
    },
]; 