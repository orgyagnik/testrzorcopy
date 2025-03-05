import React, { useState, useEffect, useCallback } from 'react';
import LastSeen from "../../modules/custom/LastSeen";
import AvatarImg from "../../assets/img/placeholder-image.png";
import { Link, useLocation } from "react-router-dom";
import { appHappyText, replaceSpecialCharacters, getFileExtensionFromFileName } from "../../utils/functions.js";
import { databaseRoleCode, tinymceInit, office_display_date_format_with_time, attachmentsAllowExtension, attachmentsAllowExtensionMsg } from '../../settings';
import moment from 'moment-timezone';
import { Button, Spinner, Form, OverlayTrigger, Tooltip, Row, Col, Card, Ratio } from 'react-bootstrap';
import { Editor } from "@tinymce/tinymce-react";
import { toast } from 'react-toastify';
import APIService from "../../api/APIService";
import { validateForm } from "../../utils/validator.js";
import linkifyHtml from 'linkify-html';
import { RemoteWorkCommentValidator } from "../../modules/validation/RemoteWorkValidator";
import { format } from 'date-fns';
import { FileUploader } from "react-drag-drop-files";
import AttachmentPreview from '../task/AttachmentPreview';
import AttaSvgImg from "../../assets/img/svg.png";
import AttaZipImg from "../../assets/img/zip.png";
import AttaPdfImg from "../../assets/img/pdf.png";
import AttaDocImg from "../../assets/img/doc.png";
import AttaExcelImg from "../../assets/img/excel.png";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const REACT_APP_TINYMCE_APIKEY = process.env.REACT_APP_TINYMCE_APIKEY;

export default function RemoteWorkComment({ comment, userData, handleDeleteRemoteComment, setRefreshComment, refreshComment, remoteComment, setRemoteComment, handleDeleteRemoteCommentAttachment, remoteData }) {
    const searchHash = useLocation().hash;
    const [isEditing, setIsEditing] = useState(false);
    const [commentFormErrors, setCommentFormErrors] = useState([]);
    const [processEdit, setProcessEdit] = useState(false);
    const onEditorChange = (e) => {
        setHtmlContent(e);
    }

    const [htmlContent, setHtmlContent] = useState(comment?.content);
    const [attachmentsFile1, setAttachmentsFile1] = useState([]);
    const [formErrors, setFormErrors] = useState([]);

    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerImages, setViewerImages] = useState([]);
    const [startIndex, setStartIndex] = useState(0);

    const openImageViewer = useCallback((files, file_path) => {
        setIsViewerOpen(true);
        let selecteImgIndex = 0;
        let mapIndex = 0;
        let Sliderimages = files.map(item => {
          let file_ext = getFileExtensionFromFileName(item.file_path);
          if (file_ext !== 'zip' && file_ext !== 'pdf' && file_ext !== 'doc' && file_ext !== 'docx') {
            if (file_path === item.file_path) {
              selecteImgIndex = mapIndex;
            }
            mapIndex = mapIndex + 1;
            return { url: item.file_path, title: `${item.file_title} | ${item.file_name}` }
          }
          else {
            return { url: '', title: '' }
          }
        });
        Sliderimages = Sliderimages.filter((item) => { return item.url !== '' });
        setStartIndex(selecteImgIndex);
        setViewerImages(Sliderimages);
    }, []);
    
    const closeImageViewer = () => {
        setIsViewerOpen(false);
    };

    const editRemoteWorkComment = () => {
        setProcessEdit(true);
        setCommentFormErrors([]);
        let validate = validateForm((RemoteWorkCommentValidator(htmlContent ? htmlContent : '')));
        if (Object.keys(validate).length) {
            setProcessEdit(false);
            setCommentFormErrors(validate);
        }
        else {
            const params = new FormData();
            params.append("commentid", comment.id);
            params.append("content", htmlContent ? htmlContent : '');
            let len = attachmentsFile1?.length ? attachmentsFile1.length : 0;
            for (let i = 0; i < len; i++) {
                params.append(
                    "attechment",
                    attachmentsFile1[i].file
                );
            }

            APIService.updateRemoteWorkComment(params)
                .then((response) => {
                    if (response.data?.status) {
                        toast.success(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setProcessEdit(false);
                        setRefreshComment(!refreshComment);
                        setIsEditing(false);
                        const updatedComments = remoteComment.map(row => {
                            if (row.id === comment.id) {
                                return response.data?.data;
                            }
                            return row;
                        });
                        setRemoteComment(updatedComments);
                        setAttachmentsFile1([]);
                    }
                    else {
                        toast.error(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setProcessEdit(false);
                    }
                })
                .catch((error) => {
                    toast.error(error, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                    setProcessEdit(false);
                });
        }
    };

    useEffect(() => {
        setIsEditing(false);
        if (searchHash) {
            setTimeout(() => {
                const element = document.getElementById(searchHash.replaceAll("#", ''));
                element.scrollIntoView();
            }, 500);
        }
    }, [comment]);

    const handleDragAndDropChange = (files) => {
        setFormErrors([]);
        let filesNew = [];
        let fileLength = files.length;
        if (fileLength > 0) {
            for (let i = 0; i < fileLength; i++) {
                const file = files[i];
                let file_ext = getFileExtensionFromFileName(file.name);
                if (attachmentsAllowExtension.includes(file_ext.toLowerCase())) {
                    filesNew.push({ source: URL.createObjectURL(file), name: file.name, size: file.size, file: file });
                }
            }
            setAttachmentsFile1([...filesNew, ...attachmentsFile1]);
        }
    };

    const handleRemoveAttachmentsFile = (img) => {
        let newFileList = attachmentsFile1.filter(function (arr) {
            return arr.source !== img;
        })
        setAttachmentsFile1(newFileList);
    };

    const handleAttachmentClick = async (file) => {
        window.open(file, '_blank', 'noopener,noreferrer');
    }

    return (
        <>
            <div className="d-flex w-100">
                <div className="comments-icon">
                    {comment.profile_image !== '' && comment.profile_image !== null ?
                        <img className="avatar-img" src={`${comment.profile_image}`} alt={comment.name} onError={({ currentTarget }) => {
                            currentTarget.onerror = null;
                            currentTarget.src = AvatarImg;
                        }} />
                        :
                        <img className="avatar-img" src={AvatarImg} alt={comment.name} />
                    }
                </div>
                <div className="comments-detail ms-3">
                    <div className="comments-header d-flex align-items-md-center">
                        <div className="d-flex flex-md-row flex-column align-items-md-center">
                            <Link to={`/user-detail/${comment.staffid}`} className="commnets-name font-weight-medium text-nowrap">{comment.name}</Link>
                            <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${comment.id}`}> 
                            {format(new Date(comment.created_at), office_display_date_format_with_time)}
                            </Tooltip>}>
                                <a href={`#comment_${comment.id}`} className="commnets-time dark-2 ms-md-2 font-12 mt-1 text-nowrap d-md-inline-block d-block">
                                    <LastSeen date={Date.parse(moment(comment.created_at).format())} />
                                </a>
                            </OverlayTrigger>
                        </div>
                        <div className="d-flex align-items-md-center ms-auto">                            
                            {userData.role_code === databaseRoleCode.adminCode || userData?.id === comment.staffid ?
                                <>
                                    {!isEditing &&
                                        <Button size='sm' className='ms-4 btn-icon circle-btn text-primary' variant="white" onClick={() => { setIsEditing(true) }}><i className="icon-edit"></i></Button>}
                                    <Button size='sm' className='ms-2 btn-icon circle-btn text-danger' variant="white" onClick={() => { handleDeleteRemoteComment(comment.id); setIsEditing(false); }}><i className="icon-delete"></i></Button>
                                </>
                                : ''}
                        </div>
                    </div>
                    <div className="comments-body pt-3">
                        {!isEditing && comment?.content && comment?.content !== '[task_attachment]' && <p dangerouslySetInnerHTML={{ __html: replaceSpecialCharacters(linkifyHtml(appHappyText(comment?.content))).replaceAll('[task_attachment]', '').replaceAll("<a ", "<a rel='nofollow' target='_blank' ") }}></p>}
                        {isEditing &&
                            <div className='mt-4 mb-4'>
                                <Form onSubmit={async e => { e.preventDefault(); await editRemoteWorkComment() }}>
                                    {/* <Editor
                                        apiKey={REACT_APP_TINYMCE_APIKEY}
                                        //initialValue=""
                                        value={htmlContent}
                                        init={tinymceInit}
                                        onEditorChange={onEditorChange}
                                    /> */}
                                    <ReactQuill theme="snow" value={htmlContent} onChange={setHtmlContent} />
                                    {commentFormErrors.commentInput && (
                                        <span className="text-danger">{commentFormErrors.commentInput}</span>
                                    )}

                                    <Row className='mt-6'>
                                        <Col xs={12} sm={12} md={12}>
                                            <span className="font-14 font-weight-semibold dark-1 d-block mb-3">Attachments</span>
                                            <FileUploader handleChange={handleDragAndDropChange} multiple={true} name="file" types={attachmentsAllowExtension} maxSize={10} children={<div className="custom-flie-input"><span><i className='icon-attachment me-2'></i> Upload or drop a file right here</span></div>} onTypeError={(e) => { setCommentFormErrors({ fileUploader: `${e} ${attachmentsAllowExtensionMsg}` }); }} onSizeError={(e) => { setCommentFormErrors({ fileUploader: `${e} file size should less than 10MB` }); }} />
                                            {commentFormErrors.fileUploader && (
                                                <span className="text-danger d-block">{commentFormErrors.fileUploader}</span>
                                            )}
                                        </Col>
                                    </Row>
                                    <div className="mt-1 g-3 row">
                                        {attachmentsFile1 && (
                                            attachmentsFile1.map((file, index) => (
                                                <div className="d-lg-block align-items-center col-6 col-sm-4 col-lg-3 col-xl-2" key={index}>
                                                    <AttachmentPreview file={file} handleRemoveAttachmentsFile={handleRemoveAttachmentsFile} handleAttachmentClick={handleAttachmentClick} />
                                                </div>
                                            ))
                                        )}
                                        {(attachmentsFile1 && attachmentsFile1.length === 0) &&
                                            <span>No file selected</span>
                                        }
                                    </div>
                                    
                                    <div className='mt-4'>
                                        <Button className="me-2" variant="soft-secondary" size="md" type="button" onClick={() => { setIsEditing(false) }}>Cancel</Button>
                                        <Button disabled={processEdit} variant="primary" size="md" type="submit">
                                            {
                                                !processEdit && 'Save'
                                            }
                                            {
                                                processEdit && <><Spinner size="sm" animation="border" className="me-1" />Save</>
                                            }
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        }
                        {comment?.attachments.length > 0 &&
                            <div className="row g-3">
                                {comment?.attachments.map((cmt_att, index) => {
                                    let file_ext = getFileExtensionFromFileName(cmt_att.file_path);
                                    return <div className="col-6 col-sm-3 col-lg-2 col-xl-2 text-center" key={index}>
                                        <div className='attachment_div'>
                                            <Card className="border border-gray-100 bg-white">
                                                <Card.Body className="position-relative p-0">
                                                    <div className="action-buttons-row position-absolute w-100 d-flex align-items-center justify-content-end p-2">
                                                        <a href={cmt_att.file_path} download className='btn-icon circle-btn btn btn-light btn-sm text-info'><i className='icon-download'></i></a>
                                                        {userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.adminCode && userData?.id === comment.staffid &&
                                                            <Button size='sm' className='ms-1 btn-icon circle-btn text-danger' variant="light" onClick={() => { handleDeleteRemoteCommentAttachment(cmt_att.id, comment.id, remoteData?.id); setIsEditing(false); }}><i className="icon-delete"></i></Button>
                                                        }
                                                        {userData.role_code === databaseRoleCode.adminCode &&
                                                            <Button size='sm' className='ms-1 btn-icon circle-btn text-danger' variant="light" onClick={() => { handleDeleteRemoteCommentAttachment(cmt_att.id, comment.id, remoteData?.id); setIsEditing(false); }}><i className="icon-delete"></i></Button>
                                                        }
                                                        {/*userData.role_code === databaseRoleCode.clientCode && userData?.userid === comment.contact_id &&*/
                                                            userData.role_code === databaseRoleCode.clientCode && userData?.id === comment.contact_id &&
                                                            <Button size='sm' className='ms-1 btn-icon circle-btn text-danger' variant="light" onClick={() => { handleDeleteRemoteCommentAttachment(cmt_att.id, comment.id, remoteData?.id); setIsEditing(false); }}><i className="icon-delete"></i></Button>
                                                        }
                                                    </div>
                                                    <Ratio aspectRatio="4x3">
                                                        <>
                                                            {file_ext === 'svg' &&
                                                                <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {cmt_att.file_name}</Tooltip>}>
                                                                    <Card.Img variant="top" src={AttaSvgImg} alt="Attachments" title={cmt_att.file_title} />
                                                                </OverlayTrigger>
                                                            }
                                                            {file_ext === 'zip' &&
                                                                <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {cmt_att.file_name}</Tooltip>}>
                                                                    <Card.Img variant="top" src={AttaZipImg} alt="Attachments" title={cmt_att.file_title} />
                                                                </OverlayTrigger>
                                                            }
                                                            {file_ext === 'pdf' &&
                                                                <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {cmt_att.file_name}</Tooltip>}>
                                                                    <Card.Img variant="top" src={AttaPdfImg} alt="Attachments" title={cmt_att.file_title} />
                                                                </OverlayTrigger>
                                                            }
                                                            {file_ext === 'doc' || file_ext === 'docx' ?
                                                                <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {cmt_att.file_name}</Tooltip>}>
                                                                    <Card.Img variant="top" src={AttaDocImg} alt="Attachments" title={cmt_att.file_title} />
                                                                </OverlayTrigger>
                                                                : ''}
                                                            {file_ext === 'xlsx' || file_ext === 'xlsm' || file_ext === 'xlsb' || file_ext === 'xltx' || file_ext === 'xltm' || file_ext === 'xls' || file_ext === 'xlt' ?
                                                                <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {cmt_att.file_name}</Tooltip>}>
                                                                    <Card.Img variant="top" src={AttaExcelImg} alt="Attachments" title={cmt_att.file_title} />
                                                                </OverlayTrigger>
                                                                : ''}
                                                            {file_ext !== 'svg' && file_ext !== 'zip' && file_ext !== 'pdf' && file_ext !== 'doc' && file_ext !== 'docx' && file_ext !== 'xlsx' && file_ext !== 'xlsm' && file_ext !== 'xlsb' && file_ext !== 'xltx' && file_ext !== 'xltm' && file_ext !== 'xls' && file_ext !== 'xlt' &&
                                                                <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {cmt_att.file_name}</Tooltip>}>
                                                                    <Card.Img variant="top" className='cursor-pointer' src={cmt_att.file_path} onClick={() => openImageViewer(comment?.attachments, cmt_att.file_path)} alt="Attachments" title={cmt_att.file_title} />
                                                                </OverlayTrigger>
                                                            }
                                                        </>
                                                    </Ratio>
                                                </Card.Body>
                                            </Card>
                                        </div>
                                        
                                    </div>
                                })}
                              
                            </div>
                        }
                    </div>
                </div>
            </div>
        </>
    );
}
