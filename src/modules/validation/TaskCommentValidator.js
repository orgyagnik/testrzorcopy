export const TaskCommentValidator = (comment, commentHours, loggedDevHours, loggedBucketHours) => [
    {
        name: "comment",
        inputName: "commentInput",
        value: comment,
        validation: ['required'],
    },
    {
        name: "billable hours",
        inputName: "commentHoursInput",
        value: commentHours,
        validation: ['required'],
    },
    {
        name: "logged dev plan hours",
        inputName: "loggedDevHoursInput",
        value: loggedDevHours,
        validation: ['required'],
    },
    {
        name: "logged bucket plan hours",
        inputName: "loggedBucketHoursInput",
        value: loggedBucketHours,
        validation: ['required'],
    }
]; 