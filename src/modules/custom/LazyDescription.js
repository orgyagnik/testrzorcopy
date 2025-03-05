import React from 'react';
import { replaceSpecialCharacters } from "../../utils/functions.js";
import linkifyHtml from 'linkify-html';

const LazyDescription = ({ descriptionData }) => {   
    return (
        <div>
            {/* Render the description using descriptionData */}
            {descriptionData?.description ? (
                <div dangerouslySetInnerHTML={{ __html: replaceSpecialCharacters(linkifyHtml(descriptionData.description)) }} />

            ) : (
                <p className="text-muted">No description</p>
            )}
        </div>
    );
}

export default LazyDescription;
