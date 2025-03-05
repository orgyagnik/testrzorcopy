export const LeaveValidator = (date, dueDate, leaveType, leaveReason, isEmployeeInput) => [
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
        name: "leave type",
        inputName: "leaveTypeInput",
        value: leaveType,
        validation: ['required'],
    },
    {
        name: "leave reason",
        inputName: "leaveReasonInput",
        value: leaveReason,
        validation: ['required'],
    },
    {
        name: "Employee",
        inputName: "isEmployeeInput",
        value: isEmployeeInput,
        validation: ['required'],
    },
    
]; 

export const LeaveBucketValidator = (employee, year, leaveType, leavesAllowed, leaveDescription) => [
    {
        name: "employee",
        inputName: "staffInput",
        value: employee,
        validation: ['required'],
    },
    {
        name: "year",
        inputName: "yearInput",
        value: year,
        validation: ['required'],
    },    
    {
        name: "leave type",
        inputName: "leaveTypeInput",
        value: leaveType,
        validation: ['required'],
    },
    {
        name: "leaves allowed",
        inputName: "leavesAllowedInput",
        value: leavesAllowed,
        validation: ['required'],
    },
    {
        name: "description",
        inputName: "leaveDescriptionInput",
        value: leaveDescription,
        validation: ['required'],
    },
]; 