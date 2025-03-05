import React from 'react';
import ReactReadMoreReadLess from "react-read-more-read-less";

export default function ReadMoreReadLess({ longText }) {
    return (
        <ReactReadMoreReadLess
            charLimit={200}
            readMoreText={"Read more"}
            readLessText={"Read less"}
        >
            {longText}
        </ReactReadMoreReadLess>
    );
}
