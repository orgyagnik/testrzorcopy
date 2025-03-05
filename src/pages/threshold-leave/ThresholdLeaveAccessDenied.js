import React from 'react';
import accessImg from "../../assets/img/access-denied.jpg";

export default function ThresholdLeaveAccessDenied() {
    return <>
        <div className="no-permition-page">
            <div className="no-permition-block shadow-1">
                <img src={accessImg} alt="No Access" />
                <h1 className="text-danger">Access Denied</h1>
                <p className="font-18 mb-0 dark-1">Sorry, but you don't have permission to access this Threshold.</p>
            </div>
        </div>
    </>
}