import React from 'react';
import { getFileExtensionFromFileName, capitalizeFirst } from "../../utils/functions.js";
import AttaZipImg from "../../assets/img/zip.png";
import AttaPdfImg from "../../assets/img/pdf.png";
import AttaDocImg from "../../assets/img/doc.png";
import AttaExcelImg from "../../assets/img/excel.png";
import { Card, CloseButton, Ratio } from 'react-bootstrap';
import AttaSvgImg from "../../assets/img/svg.png";

export default function AttachmentPreview({ file, handleRemoveAttachmentsFile, handleAttachmentClick, editMode }) {
    let file_ext = getFileExtensionFromFileName(editMode ? file.file_path : file.name);
    return (
        <div className='attachment_div'>
            <Card className="border border-gray-100 bg-white">
                <Card.Body className="position-relative p-0">
                    <CloseButton className="btn-icon circle-btn btn btn-light btn-sm" onClick={() => { handleRemoveAttachmentsFile(editMode ? file.id : file.source) }} />
                    <Ratio aspectRatio="4x3">
                        <>
                            {file_ext === 'svg' &&
                                <Card.Img variant="top" src={AttaSvgImg} onClick={() => handleAttachmentClick(editMode ? file.file_path : file.source)} alt="Attachments" />
                            }
                            {file_ext === 'zip' &&
                                <Card.Img variant="top" src={AttaZipImg} onClick={() => handleAttachmentClick(editMode ? file.file_path : file.source)} alt="Attachments" />
                            }
                            {file_ext === 'pdf' &&
                                <Card.Img variant="top" src={AttaPdfImg} onClick={() => handleAttachmentClick(editMode ? file.file_path : file.source)} alt="Attachments" />
                            }
                            {file_ext === 'doc' || file_ext === 'docx' ?
                                <Card.Img variant="top" src={AttaDocImg} onClick={() => handleAttachmentClick(editMode ? file.file_path : file.source)} alt="Attachments" />
                                : ''}
                            {file_ext === 'xlsx' || file_ext === 'xlsm' || file_ext === 'xlsb' || file_ext === 'xltx' || file_ext === 'xltm' || file_ext === 'xls' || file_ext === 'xlt' || file_ext === 'csv' ?
                                <Card.Img variant="top" src={AttaExcelImg} onClick={() => handleAttachmentClick(editMode ? file.file_path : file.source)} alt="Attachments" />
                                : ''}
                            {file_ext !== 'svg' && file_ext !== 'zip' && file_ext !== 'pdf' && file_ext !== 'doc' && file_ext !== 'docx' && file_ext !== 'xlsx' && file_ext !== 'xlsm' && file_ext !== 'xlsb' && file_ext !== 'xltx' && file_ext !== 'xltm' && file_ext !== 'xls' && file_ext !== 'xlt' && file_ext !== 'csv' &&
                                <Card.Img variant="top" src={editMode ? file.file_path : file.source} onClick={() => handleAttachmentClick(editMode ? file.file_path : file.source)} alt="Attachments" />
                            }
                        </>
                    </Ratio>
                </Card.Body>
                <Card.Footer className="text-muted">
                    <p className='card-containe m-0'> {`${capitalizeFirst(file_ext)} File`} </p>
                </Card.Footer>
            </Card>
        </div>
    );
}
