import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import InputMask from "react-input-mask";
import { date_format, indian_date_format, date_format_placeholderText, indian_date_format_placeholderText } from '../../settings';

export default function SingleDatePickerControl(props) {
    return (
        <DatePicker
            customInput={ <InputMask mask="99-99-9999" type="text" />}     
            className="form-control"
            {...props}
            showMonthDropdown={true}
            showYearDropdown={true}
            scrollableYearDropdown={true}
            yearDropdownItemNumber={50}
            dateFormat={props.indian ? indian_date_format : date_format}
            //filterDate={date => date.getDay() !== 6 && date.getDay() !== 0}
            withPortal={false}
            autoComplete="off"
            placeholderText={props.indian ? indian_date_format_placeholderText : date_format_placeholderText}
        />
    );
}