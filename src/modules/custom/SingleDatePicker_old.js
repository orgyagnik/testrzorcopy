import React, { useState } from 'react';
import { SingleDatePicker } from 'react-dates';
import moment from 'moment';

export default function SingleDatePickerControl(props) {

    const [focused, setFocus] = useState(false);

    const renderMonthElement = ({ month, onMonthSelect, onYearSelect }) => {
        let i
        let years = []
        for (i = moment().year(); i >= moment().year() - 100; i--) {
          years.push(<option value={i} key={`year-${i}`}>{i}</option>)
        }
    
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className='datepicker-custom-control'>
              <select value={month.month()} onChange={(e) => onMonthSelect(month, e.target.value)}>
                {moment.months().map((label, value) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className='datepicker-custom-control'>
              <select value={month.year()} onChange={e => onYearSelect(month, e.target.value)}>
                {years}
              </select>
            </div>
          </div>
        );
      }

    return (
        <SingleDatePicker
            {...props}
            numberOfMonths={1}
            displayFormat="DD-MMM-YYYY"
            showClearDate={true}
            isOutsideRange={() => false}
            placeholder="DD-MMM-YYYY"
            renderMonthElement={renderMonthElement}
            focused={focused}
            onFocusChange={({ focused }) => setFocus(focused)}
            
        />
    );
}