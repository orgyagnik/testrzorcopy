export const TicketSystemValidator = (ticketTitle, priority, category, description) => [
    {
        name: "title",
        inputName: "ticketTitleInput",
        value: ticketTitle,
        validation: ['required'],
    },
    {
        name: "priority",
        inputName: "priorityInput",
        value: priority,
        validation: ['required'],
    },
    {
        name: "category",
        inputName: "categoryInput",
        value: category,
        validation: ['required'],
    },
    {
        name: "description",
        inputName: "descriptionInput",
        value: description,
        validation: ['required'],
    },
]; 

export const TicketCommentValidator = (comment) => [
    {
        name: "comment",
        inputName: "commentInput",
        value: comment,
        validation: ['required'],
    },
]; 