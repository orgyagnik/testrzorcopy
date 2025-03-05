export const RemoteWorkValidator = (date, dueDate, reason) => [
    {
        name: "start date",
        inputName: "date",
        value: date,
        validation: ['required','date'],
    },
    {
        name: "due date",
        inputName: "dueDate",
        value: dueDate,
        validation: ['required','date'],
    },
    {
        name: "reason",
        inputName: "reasonInput",
        value: reason,
        validation: ['required'],
    }
    
]; 

export const RemoteWorkCommentValidator = (comment) => [
    {
        name: "comment",
        inputName: "commentInput",
        value: comment,
        validation: ['required'],
    },
]; 
