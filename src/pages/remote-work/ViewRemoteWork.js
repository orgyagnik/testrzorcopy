import React, { useState, useEffect, useCallback } from 'react';
import { Offcanvas, OverlayTrigger, Tooltip, Form, Button, Spinner, Card, Ratio, Row, Col, DropdownButton, Dropdown } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { office_display_date_format_for_date, databaseRoleCode, tinymceInit, attachmentsAllowExtension, attachmentsAllowExtensionMsg, office_display_date_format_with_time, display_date_format } from '../../settings';
import moment from 'moment';
import { check, replaceSpecialCharacters, getFileExtensionFromFileName } from "../../utils/functions.js";
import linkifyHtml from 'linkify-html';
import { Editor } from "@tinymce/tinymce-react";
import RemoteWorkComment from './RemoteWorkComment';
import { confirmAlert } from 'react-confirm-alert';
import { DELETE_REMOTE_WORK_COMMENT, DELETE_ATTACHMENT } from '../../modules/lang/RemoteWork';
import { toast } from 'react-toastify';
import { RemoteWorkCommentValidator } from "../../modules/validation/RemoteWorkValidator";
import { validateForm } from "../../utils/validator.js";
import RemoteWorkAccessDenied from './RemoteWorkAccessDenied';
import AttaSvgImg from "../../assets/img/svg.png";
import AttaZipImg from "../../assets/img/zip.png";
import AttaPdfImg from "../../assets/img/pdf.png";
import AttaDocImg from "../../assets/img/doc.png";
import AttaExcelImg from "../../assets/img/excel.png";
import { FileUploader } from "react-drag-drop-files";
import AttachmentPreview from '../task/AttachmentPreview';
import { format } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const REACT_APP_TINYMCE_APIKEY = process.env.REACT_APP_TINYMCE_APIKEY;

function ViewRemoteWork({ userData, name, showViewRemoteModal, setShowViewRemoteModal, remoteId, reloadPage, setReloadPage, statusList }) {
    const [remoteData, setRemoteData] = useState(null);
    const [formErrors, setFormErrors] = useState([]);
    const [hideCommentForm, setHideCommentForm] = useState(true);
    const [process, setProcess] = useState(false);
    const [remoteCommentProcess, setRemoteCommentProcess] = useState(true);
    const [remoteComment, setRemoteComment] = useState(null);
    const [refreshComment, setRefreshComment] = useState(false);
    const [updateRemoteCount, setUpdateRemoteCount] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerImages, setViewerImages] = useState([]);
    const [startIndex, setStartIndex] = useState(0);
    const [attachmentsFile1, setAttachmentsFile1] = useState([]);
    const [remoteStatus, setRemoteStatus] = useState(null);

    const cstSetCloseViewRemoteModal = () => {
        setShowViewRemoteModal(false);
        window.history.replaceState(null, '', `/remote-work`);
        clearControl();
        if (updateRemoteCount) {
            setReloadPage(!reloadPage);
        }
        setUpdateRemoteCount(false);
        setTimeout(() => {
            setRemoteData(null);
        }, 500);
    };

    //for html editor
    const [htmlContent, setHtmlContent] = useState();
    const onEditorChange = (e) => {
        setHtmlContent(e);
    }

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

    useEffect(() => {
        if (showViewRemoteModal) {
            APIService.getRemoteWork(remoteId)
                .then((response) => {
                    if (response.data?.status) {
                        let data = response.data?.data;
                        setRemoteData(data);
                    }
                });
        }
    }, [showViewRemoteModal, remoteId]);

    useEffect(() => {
        setRemoteCommentProcess(true);
        if (showViewRemoteModal) {
            APIService.getRemoteWorkComment(`?remote_id=${remoteId}`)
                .then((response) => {
                    if (response.data?.status) {
                        setRemoteComment(response.data?.data);
                    }
                    setRemoteCommentProcess(false);
                });
        }
    }, [showViewRemoteModal, refreshComment, remoteId]);

    const addRemoteWorkComment = async () => {
        setProcess(true);
        setFormErrors([]);
        let validate = validateForm((RemoteWorkCommentValidator(htmlContent ? htmlContent : '')));
        if (Object.keys(validate).length) {
            setProcess(false);
            setFormErrors(validate);
        }
        else {
            const params = new FormData();
            params.append("remote_id", remoteId);
            params.append("content", htmlContent ? htmlContent : '');
            params.append("staff_id", userData?.id);
            let len = attachmentsFile1?.length ? attachmentsFile1.length : 0;
            for (let i = 0; i < len; i++) {
                params.append(
                    "attechment",
                    attachmentsFile1[i].file
                );
            }

            APIService.addRemoteWorkComment(params)
                .then((response) => {
                    if (response.data?.status) {
                        toast.success(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setProcess(false);
                        setRefreshComment(!refreshComment);
                        clearControl();
                    }
                    else {
                        toast.error(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setProcess(false);
                    }
                })
                .catch((error) => {
                    toast.error(error, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                    setProcess(false);
                });
        }
    }

    const clearControl = async () => {
        setFormErrors([]);
        setHideCommentForm(true);
        setHtmlContent('');
    }

    const handleDeleteRemoteComment = (id) => {
        confirmAlert({
            title: 'Confirm',
            message: DELETE_REMOTE_WORK_COMMENT,
            buttons: [
                {
                    label: 'Yes',
                    className: 'btn btn-primary btn-lg',
                    onClick: () => {
                        let params = {};
                        params["commentid"] = id;
                        APIService.deleteRemoteWorkComment(params)
                            .then((response) => {
                                if (response.data?.status) {
                                    setRefreshComment(!refreshComment);                                    
                                    toast.success(response.data?.message, {
                                        position: toast.POSITION.TOP_RIGHT
                                    });
                                }
                                else {
                                    toast.error(response.data?.message, {
                                        position: toast.POSITION.TOP_RIGHT
                                    });
                                }
                            });
                    }
                },
                {
                    label: 'No',
                    className: 'btn btn-outline-secondary btn-lg',
                    onClick: () => {

                    }
                }
            ]
        });
    }

    const handleRemoveAttachmentsFile = (img) => {
        let newFileList = attachmentsFile1.filter(function (arr) {
            return arr.source !== img;
        })
        setAttachmentsFile1(newFileList);
    };

    const handleAttachmentClick = async (file) => {
        window.open(file, '_blank', 'noopener,noreferrer');
    }

    const handleDeleteRemoteCommentAttachment = (fileid, id, commentId) => {
        confirmAlert({
          title: 'Confirm',
          message: DELETE_ATTACHMENT,
          buttons: [
            {
              label: 'Yes',
              className: 'btn btn-primary btn-lg',
              onClick: () => {
                let params = {};
                params["fileid"] = fileid;
                params["id"] = id;
                APIService.removeAttachment(params)
                  .then((response) => {
                    if (response.data?.status) {
                      setRefreshComment(!refreshComment);
                      setRemoteComment((prevComments) =>
                        prevComments.map((comment) =>
                          comment.id === commentId
                            ? {
                              ...comment,
                              attachments: comment.attachments.filter(
                                (attachment) => attachment.id !== fileid
                              ),
                            }
                            : comment
                        )
                      );
                      toast.success(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                      });
                    }
                    else {
                      toast.error(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                      });
                    }
                  });
    
              }
            },
            {
              label: 'No',
              className: 'btn btn-outline-secondary btn-lg',
              onClick: () => {
    
              }
            }
          ]
        });
    };

    const updateRemoteWorkStatus = (id, status) => {
        let params = {};
        params["id"] = id;
        params["status"] = status;
        APIService.updateRemoteWorkStatus(params)
            .then((response) => {
                if (response.data?.status) {
                    setUpdateRemoteCount(true);
                    let remote_status_new = statusList.filter(function (arr) { return arr.value === status; });
                    if (remote_status_new.length > 0) {
                        setRemoteStatus({ status: remote_status_new[0]?.label, backgroundColor: remote_status_new[0]?.backgroundColor });
                    }
                    setReloadPage(!reloadPage);                    
                    toast.success(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
                else {
                    toast.error(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            });
    }

    return (
        <>
            {remoteData &&
                <Offcanvas show={showViewRemoteModal} onHide={cstSetCloseViewRemoteModal} enforceFocus={false} className="add-task-sidebar edit-task-sidebar" placement="end">
                    {remoteData?.id ?
                        <>
                            <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
                                <div className="d-flex align-items-center">
                                    <h2 className='mb-0 d-xl-block d-none'>{remoteData?.id ? '#'+remoteData?.id : ''} {remoteData?.empname ? '- '+ remoteData?.empname : ''}</h2>
                                </div>
                                <ul className="ovrlay-header-icons">
                                    {check(['remote_work.update'], userData?.role.getPermissions) && (userData?.role_code === databaseRoleCode.adminCode || (remoteData?.status === 1 && remoteData?.added_by === userData?.id)) ?
                                        <li>
                                           
                                        </li>
                                        : ''}
                                    {check(['remote_work.delete'], userData?.role.getPermissions) && (userData?.role_code === databaseRoleCode.adminCode || (remoteData?.status === 1 && remoteData?.added_by === userData?.id)) ?
                                        <li>
                                           
                                        </li>
                                        : ''}
                                    <li>
                                        <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={cstSetCloseViewRemoteModal}>
                                            <i className="icon-cancel"></i>
                                        </button>
                                    </li>
                                </ul>
                            </Offcanvas.Header>
                            <Offcanvas.Body className="p-0">
                                <div className="d-flex flex-xl-nowrap flex-wrap h-100">
                                    <div className="left-content p-6 flex-fill order-xl-1 order-2">
                                        <SimpleBar className="offcanvas-inner">
                                            <div className="task-content-list d-lg-block align-items-center">
                                                <div className="task-label-left mb-lg-2">
                                                    <span className="dark-1 font-weight-semibold">Reason:</span>
                                                </div>
                                                <div className="task-label-right">
                                                    <div dangerouslySetInnerHTML={{ __html: replaceSpecialCharacters(linkifyHtml(remoteData?.message && remoteData?.message !== undefined && remoteData?.message !== "undefined" ? remoteData?.message : '<p class="text-muted">No description for this remote work</p>')).replaceAll("<a ", "<a rel='nofollow' target='_blank' ") }}></div>
                                                </div>
                                            </div>
                                            
                                            {remoteData?.attachments.length > 0 &&
                                                <div className="show-task-attachments mt-7 mb-5">
                                                    <span className="font-14 font-weight-semibold dark-1 d-inline-block mb-4">Attachments</span>
                                                   
                                                    <div className="row g-3">
                                                    {remoteData?.attachments.map((file, index) => {
                                                        let file_ext = getFileExtensionFromFileName(file.file_path);
                                                        return <div className="col-6 col-sm-3 col-md-3 col-lg-3 col-xxl-2 text-center" key={index}>
                                                        <div className='attachment_div'>
                                                            <Card className="border border-gray-100 bg-white">
                                                            <Card.Body className="position-relative p-0">
                                                                <div className="action-buttons-row position-absolute w-100 d-flex align-items-center justify-content-end p-2">
                                                                <a href={file.file_path} download className='btn-icon circle-btn btn btn-light btn-sm'><i className='icon-download'></i></a>
                                                                </div>
                                                                <Ratio aspectRatio="4x3">
                                                                <>
                                                                    {file_ext === 'svg' &&
                                                                    <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {file.file_name}</Tooltip>}>
                                                                        <Card.Img variant="top" src={AttaSvgImg} alt="Attachments" title={file.file_title} />
                                                                    </OverlayTrigger>
                                                                    }
                                                                    {file_ext === 'zip' &&
                                                                    <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {file.file_name}</Tooltip>}>
                                                                        <Card.Img variant="top" src={AttaZipImg} alt="Attachments" title={file.file_title} />
                                                                    </OverlayTrigger>
                                                                    }
                                                                    {file_ext === 'pdf' &&
                                                                    <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {file.file_name}</Tooltip>}>
                                                                        <Card.Img variant="top" src={AttaPdfImg} alt="Attachments" title={file.file_title} />
                                                                    </OverlayTrigger>
                                                                    }
                                                                    {file_ext === 'doc' || file_ext === 'docx' ?
                                                                    <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {file.file_name}</Tooltip>}>
                                                                        <Card.Img variant="top" src={AttaDocImg} alt="Attachments" title={file.file_title} />
                                                                    </OverlayTrigger>
                                                                    : ''}
                                                                    {file_ext === 'xlsx' || file_ext === 'xlsm' || file_ext === 'xlsb' || file_ext === 'xltx' || file_ext === 'xltm' || file_ext === 'xls' || file_ext === 'xlt' ?
                                                                    <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {file.file_name}</Tooltip>}>
                                                                        <Card.Img variant="top" src={AttaExcelImg} alt="Attachments" title={file.file_title} />
                                                                    </OverlayTrigger>
                                                                    : ''}
                                                                    {file_ext !== 'svg' && file_ext !== 'zip' && file_ext !== 'pdf' && file_ext !== 'doc' && file_ext !== 'docx' && file_ext !== 'xlsx' && file_ext !== 'xlsm' && file_ext !== 'xlsb' && file_ext !== 'xltx' && file_ext !== 'xltm' && file_ext !== 'xls' && file_ext !== 'xlt' &&

                                                                    <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {file.file_name}</Tooltip>}>

                                                                        <Card.Img variant="top" className='cursor-pointer' src={file.file_path} onClick={() => openImageViewer(remoteData?.attachments, file.file_path)} alt="Attachments" title={file.file_title} />
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
                                                </div>
                                            }

                                            <Form onSubmit={async e => { e.preventDefault(); await addRemoteWorkComment() }}>
                                                <div className="task-description mt-6">
                                                    <span className="font-14 font-weight-semibold dark-1 d-block mb-3">Comments</span>
                                                    {/* <Editor
                                                        apiKey={REACT_APP_TINYMCE_APIKEY}
                                                        //initialValue=""
                                                        value={htmlContent}
                                                        init={tinymceInit}
                                                        onEditorChange={onEditorChange}
                                                        onFocus={() => { setHideCommentForm(false); }}
                                                    /> */}
                                                    <ReactQuill theme="snow" value={htmlContent} onChange={setHtmlContent} onFocus={() => { setHideCommentForm(false); }} />
                                                    {formErrors.commentInput && (
                                                        <span className="text-danger">{formErrors.commentInput}</span>
                                                    )}
                                                </div>
                                                {!hideCommentForm &&
                                                <>
                                                    <Row className='mt-6'>
                                                        <Col xs={12} sm={12} md={12}>
                                                            <span className="font-14 font-weight-semibold dark-1 d-block mb-3">Attachments</span>
                                                            <FileUploader handleChange={handleDragAndDropChange} multiple={true} name="file" types={attachmentsAllowExtension} maxSize={10} children={<div className="custom-flie-input"><span><i className='icon-attachment me-2'></i> Upload or drop a file right here</span></div>} onTypeError={(e) => { setFormErrors({ fileUploader: `${e} ${attachmentsAllowExtensionMsg}` }); }} onSizeError={(e) => { setFormErrors({ fileUploader: `${e} file size should less than 10MB` }); }} />
                                                            {formErrors.fileUploader && (
                                                                <span className="text-danger d-block">{formErrors.fileUploader}</span>
                                                            )}
                                                        </Col>
                                                    </Row>
                                                    <div className="mt-6 g-3 row">
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
                                                </>
                                                }
                                                {!hideCommentForm &&
                                                    <>
                                                        <div className="mt-8">
                                                            <Button disabled={process} variant="primary" size="md" type="submit">
                                                                {
                                                                    !process && 'Save'
                                                                }
                                                                {
                                                                    process && <><Spinner size="sm" animation="border" className="me-1" />Save</>
                                                                }
                                                            </Button>
                                                        </div>
                                                    </>
                                                }
                                            </Form>
                                            {remoteCommentProcess ?
                                                <><Spinner size="md" animation="border" className="mt-8" /></>
                                                :
                                                remoteComment?.length > 0 &&
                                                <>
                                                    <div className="comment-area mt-12">
                                                        {remoteComment.length > 0 && remoteComment?.map((comment, index) => (
                                                            <div key={index} id={`comment_${comment.id}`}>
                                                                {comment?.content !== "[task_attachment]" || comment?.attachments.length > 0 ?
                                                                    <div className="comment-list mb-3 p-6 pb-1">
                                                                        <div key={index}>
                                                                            <RemoteWorkComment comment={comment} userData={userData} handleDeleteRemoteComment={handleDeleteRemoteComment} setRefreshComment={setRefreshComment} refreshComment={refreshComment} remoteComment={remoteComment} setRemoteComment={setRemoteComment} handleDeleteRemoteCommentAttachment={handleDeleteRemoteCommentAttachment} remoteData={remoteData} />
                                                                        </div>
                                                                    </div>
                                                                    : ''}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            }
                                        </SimpleBar>
                                    </div>
                                    <div className="right-content p-6 order-xl-2 order-1">
                                        <SimpleBar className="right-content-inner" id='right-content-inner'>
                                            <div className="task-content">
                                                <h3 className="d-md-none mb-5">{remoteData?.name}</h3>
                                                <h4 className="mb-4">Remote Work Info
                                                </h4>
                                                <div className="task-content-list d-sm-flex align-items-center">
                                                    <div className="task-label-left">
                                                        <span className="font-14 dark-1 font-weight-semibold align-top">Created By:</span>
                                                    </div>
                                                    <div className="task-label-right ms-sm-2">{remoteData?.addedbyname}</div>
                                                </div>
                                                <div className="task-content-list d-sm-flex align-items-center">
                                                    <div className="task-label-left">
                                                        <span className="font-14 dark-1 align-top font-weight-semibold">Created Date:</span>
                                                    </div>
                                                    <div className="task-label-right ms-sm-2">                                                        
                                                        {remoteData?.created_at ? format(new Date(remoteData?.created_at), office_display_date_format_with_time) : ''}
                                                    </div>
                                                </div>
                                                <div className="task-content-list d-sm-flex align-items-center">
                                                    <div className="task-label-left">
                                                        <span className="font-14 dark-1 align-top font-weight-semibold">Start Date:</span>
                                                    </div>
                                                    <div className="task-label-right ms-sm-2">{moment(remoteData?.startdate).format(display_date_format)}</div>
                                                </div>
                                                <div className="task-content-list d-sm-flex align-items-center">
                                                    <div className="task-label-left">
                                                        <span className="font-14 dark-1 align-top font-weight-semibold">End Date:</span>
                                                    </div>
                                                    <div className="task-label-right ms-sm-2">{moment(remoteData?.enddate).format(display_date_format)}</div>
                                                </div>
                                                <div className="task-content-list d-sm-flex align-items-center">
                                                    <div className="task-label-left">
                                                        <span className="font-14 dark-1 align-top font-weight-semibold">Total Days:</span>
                                                    </div>
                                                    <div className="task-label-right ms-sm-2">{remoteData?.totaldays}</div>
                                                </div>
                                                <div className="task-content-list d-sm-flex align-items-center">
                                                    <div className="task-label-left">
                                                        <span className="font-14 dark-1 align-top font-weight-semibold">Status:</span>
                                                    </div>
                                                    <div className="task-label-right ms-sm-2">
                                                        {userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.hrCode ?
                                                            <DropdownButton
                                                                as="a"
                                                                id="dropdown-variants-status-1"
                                                                variant={remoteStatus?.backgroundColor ? remoteStatus?.backgroundColor : remoteData?.backgroundColor}
                                                                title={remoteStatus?.status ? remoteStatus?.status : remoteData?.status_name}
                                                                size='sm font-14'
                                                                className='p-0 sidebar-status-dropdown'
                                                                
                                                            >
                                                                {statusList.filter(function (arr) { return arr.label !== remoteStatus?.status; }).map((status, index) => (
                                                                    <Dropdown.Item key={index} onClick={() => { updateRemoteWorkStatus(remoteData?.id, status.value) }}>
                                                                        {`${status.label}`}
                                                                    </Dropdown.Item>
                                                                ))}
                                                            </DropdownButton>
                                                            :
                                                            <Dropdown className="project-drop-down category-dropdown">
                                                                <Dropdown.Toggle as="div" bsPrefix="no-toggle" className={` font-weight-normal font-14 ${remoteData?.backgroundColor ? remoteData?.backgroundColor.replace("outline", "text") : ''}`} id="status">
                                                                    {remoteData?.status_name}
                                                                </Dropdown.Toggle>
                                                            </Dropdown>
                                                        }
                                                        
                                                    </div>
                                                </div>
                                                
                                            </div>
                                        </SimpleBar>
                                    </div>
                                </div>
                            </Offcanvas.Body>
                        </>
                        :
                        <>
                            <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
                                <div className="d-flex align-items-center"><h2 className='mb-0'>Access Denied</h2></div>
                                <ul className="ovrlay-header-icons">
                                    <li>
                                        <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={cstSetCloseViewRemoteModal}>
                                            <i className="icon-cancel"></i>
                                        </button>
                                    </li>
                                </ul>
                            </Offcanvas.Header>
                            <Offcanvas.Body className="p-0">
                                <SimpleBar className="offcanvas-inner" id='offcanvas-inner'>
                                    <RemoteWorkAccessDenied />
                                </SimpleBar>
                            </Offcanvas.Body>
                        </>
                    }
                </Offcanvas>
            }
        </>
    );
}

const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(ViewRemoteWork)