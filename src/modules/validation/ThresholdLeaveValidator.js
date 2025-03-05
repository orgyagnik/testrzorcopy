export const ThresholdLeaveValidator = (designation, employeeCount, leaveSlot) => [
    {
        name: "designation",
        inputName: "designationInput",
        value: designation,
        validation: ['required'],
    },
    {
        name: "employeeCount",
        inputName: "employeeCountInput",
        value: employeeCount,
        validation: ['required'],
    },
    {
        name: "leaveSlot",
        inputName: "leaveSlotInput",
        value: leaveSlot,
        validation: ['required'],
    } 
]; 
