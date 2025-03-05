export const MeetingNoteValidator = (agency, date, agenda) => [
    {
        name: "agency",
        inputName: "agencyInput",
        value: agency,
        validation: ['required'],
    },
    {
        name: "date",
        inputName: "dateInput",
        value: date,
        validation: ['required','date'],
    },
    {
        name: "agenda",
        inputName: "agendaInput",
        value: agenda,
        validation: ['required'],
    },
]; 