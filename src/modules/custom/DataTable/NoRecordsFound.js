import React from "react";

export default function NoRecordsFound({ icon = "fas fa-users" }) {

    return <>
        <div style={{
            height: '20vh',
            textAlign: 'center',
            background: '#eceef1',
        }}>
            <h1 style={{
                paddingTop: '45px',
            }}><i className={icon}/></h1>
            <h5 style={{
                padding: '10px',
            }}>
                No Data Found (Please try to change filter range!)
            </h5>
        </div>
    </>
}