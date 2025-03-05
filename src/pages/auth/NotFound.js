import React from 'react';
import accessImg from "../../assets/img/not-found.png";
import { Link } from "react-router-dom";

export default function NotFound() {
    return <>
        {/* <div className="no-permition-page">
            <div className="no-permition-block shadow-1">
                <img src={accessImg} alt="No Access" />
                <h1 className="text-danger">404 Page Not Found</h1>
                <p className="font-18 mb-0 dark-1">The page you are looking for doesn't exist.</p>
                <p className="font-18 mb-0 dark-1"><Link to="/login" className="dark-1 text-primary">Go Back</Link></p>
            </div>
        </div> */}

        <div className="not-found-page">
            <div className="not-found-block 1shadow-1">
                <img src={accessImg} alt="No Access" />
                <h1>Page Not Found</h1>
                <p className="font-18 mb-0 dark-1 mb-4">The page you are looking for doesn't exist.</p>
                <p className="font-18 mb-0 dark-1"><Link to="/login" className="dark-1 text-primary">Go Home</Link></p>
            </div>
        </div>
    </>
}
