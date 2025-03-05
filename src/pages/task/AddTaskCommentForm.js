import React, { useState, useEffect } from 'react';
import { Button, Form, Spinner, OverlayTrigger, Tooltip, Row, Col, Popover } from 'react-bootstrap';
import { attachmentsAllowExtension, attachmentsAllowExtensionMsg, databaseRoleCode, tinymceInit } from '../../settings';
import { Editor } from "@tinymce/tinymce-react";
import { validateForm } from "../../utils/validator.js";
import { TaskCommentValidator } from "../../modules/validation/TaskCommentValidator";
import APIService from "../../api/APIService";
import { toast } from 'react-toastify';
import { getFileExtensionFromFileName, check } from "../../utils/functions.js";
import { Link } from "react-router-dom";
import { BILLABLE_HOURS_INFO_MSG, DEV_HOURS_INFO_MSG, BUCKET_HOURS_INFO_MSG, BILLABLE_HOURS_VALIDATE_MSG, LOGGED_DEV_HOURS_VALIDATE_MSG, LOGGED_BUCKET_HOURS_VALIDATE_MSG } from '../../modules/lang/Task';
import { FileUploader } from "react-drag-drop-files";
import AttachmentPreview from './AttachmentPreview';
import InputMask from "react-input-mask";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const REACT_APP_TINYMCE_APIKEY = process.env.REACT_APP_TINYMCE_APIKEY;

export default function AddTaskCommentForm({ initialContent,userData, setFormErrors, formErrors, clearControl, task_type, checkPermissionForLoggedDevHours, taskData, loggedDevHours, setLoggedDevHours, checkPermissionForLoggedBucketHours, loggedBucketHours, setLoggedBucketHours, commentHours, setCommentHours, commentVisibleToClient, taskId, attachmentsFile1, setAttachmentsFile1, setReloadTaskTotalWorkingHours, reloadTaskTotalWorkingHours, setRefreshComment, refreshComment, setHideCommentForm, hideCommentForm, setCommentVisibleToClient, checkPermissionForBillableHours, handleAttachmentClick, setPage }) {
    const [process, setProcess] = useState(false);
    const [htmlContent, setHtmlContent] = useState('');

    // Add useEffect to update content when initialContent changes
    useEffect(() => {
        if (initialContent) {
        setHtmlContent(initialContent);
        setHideCommentForm(false); // Show the comment form when content is received
        }
    }, [initialContent]);

    //for html editor
    const onEditorChange = (e) => {
        setHtmlContent(e);
    }

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

    const validateHoursAndMinutes = (input) => {
        if (input) {
            let [hours, minutes] = input.split(':').map(Number);
            if ((hours === 24 && minutes === 0) || (hours >= 0 && hours < 24 && minutes >= 0 && minutes <= 59)) {
                return input;
            }
        }
        return '';
    };

    const addTaskComment = async () => {
        setProcess(true);
        setFormErrors([]);
        let loggedHoursPermission = 'not required';
        if (task_type === 0) {
            if (checkPermissionForLoggedDevHours(taskData?.current_plan) && (loggedDevHours === '' || loggedDevHours.includes('_')) && checkPermissionForLoggedBucketHours(taskData?.current_plan) && (loggedBucketHours === '' || loggedBucketHours.includes('_'))) {
                loggedHoursPermission = '';
            }
            else if (checkPermissionForLoggedDevHours(taskData?.current_plan) && (loggedDevHours === '' || loggedDevHours.includes('_')) && !checkPermissionForLoggedBucketHours(taskData?.current_plan)) {
                loggedHoursPermission = '';
            }
            else if (checkPermissionForLoggedBucketHours(taskData?.current_plan) && (loggedBucketHours === '' || loggedBucketHours.includes('_')) && !checkPermissionForLoggedDevHours(taskData?.current_plan)) {
                loggedHoursPermission = '';
            }
        }
        // let billableHoursValidate = commentHours ? commentHours.includes('_') ? '' : commentHours : '';
        let billableHoursValidate;
        if (!commentHours) {
            billableHoursValidate = '';
        } else {
            billableHoursValidate = validateHoursAndMinutes(commentHours);
            if (!billableHoursValidate) {
                setProcess(false);
                setFormErrors({ commentHoursInput: BILLABLE_HOURS_VALIDATE_MSG });
                return;
            }
        }

        if (userData?.role_code === databaseRoleCode.pcCode || userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.accountantCode) {
            billableHoursValidate = 'not required';
        }

        // Dev and bucket Validation        
        if(loggedHoursPermission === ''){
            loggedHoursPermission = '';
        }else{
        
            if (loggedDevHours || loggedBucketHours ) {                
                loggedHoursPermission = 'not required';
                if (loggedDevHours && !validateHoursAndMinutes(loggedDevHours)) {                
                    setProcess(false);
                    setFormErrors({ loggedDevHoursInput: LOGGED_DEV_HOURS_VALIDATE_MSG });
                    return;
                }else if (loggedBucketHours && !validateHoursAndMinutes(loggedBucketHours)) {                
                    setProcess(false);
                    setFormErrors({ loggedBucketHoursInput: LOGGED_BUCKET_HOURS_VALIDATE_MSG });
                    return;
                }
            } 
        }

        
        let validate = validateForm((TaskCommentValidator('htmlContent', billableHoursValidate, loggedHoursPermission, loggedHoursPermission)));
        if (Object.keys(validate).length) {
            setProcess(false);
            setFormErrors(validate);
        }
        /*else if (commentHours === "00:00" && checkPermissionForBillableHours()) {
          setProcess(false);
          setFormErrors({ commentHoursInput: 'The billable hours field is required.' });
        }
        else if (loggedDevHours === "00:00" && checkPermissionForLoggedDevHours(taskData?.current_plan)) {
          setProcess(false);
          setFormErrors({ loggedDevHoursInput: 'The logged dev plan hours field is required.' });
        }
        else if (loggedBucketHours === "00:00" && checkPermissionForLoggedBucketHours(taskData?.current_plan)) {
          setProcess(false);
          setFormErrors({ loggedBucketHoursInput: 'The logged bucket plan hours field is required.' });
        }*/
        else {
            const params = new FormData();
            if (userData?.role_code === databaseRoleCode.clientCode) {
                params.append("staffid", 0);
                //params.append("contact_id", userData?.userid);
                params.append("contact_id", userData?.id);
                params.append("comment_visible_to_client", 0);
                //all can see when comment put from client side
            }
            else if (userData?.role_code === databaseRoleCode.agencyCode || userData?.role_code === databaseRoleCode.agencyMemberCode) {
                params.append("staffid", userData?.id);
                params.append("contact_id", 0);
                params.append("comment_visible_to_client", commentVisibleToClient ? 0 : 2);
                //if checkbox check than client cannot see else agency and employees can see
            }
            else {
                params.append("staffid", userData?.id);
                params.append("contact_id", 0);
                params.append("comment_visible_to_client", commentVisibleToClient ? 1 : 0);
                //if checkbox check than  client and agency cannot see else employee can see
            }
            params.append("taskid", taskId);
            let len = attachmentsFile1?.length ? attachmentsFile1.length : 0;
            for (let i = 0; i < len; i++) {
                params.append(
                    "attechment",
                    attachmentsFile1[i].file
                );
            }
            let htmlContentMain = len > 0 ? `${htmlContent}[task_attachment]` : htmlContent;
            params.append("content", htmlContentMain);
            params.append("billable_hours", commentHours ? commentHours.includes('_') ? '00:00' : commentHours : '00:00');
            params.append("dev_logged_hours", loggedDevHours ? loggedDevHours.includes('_') ? '00:00' : loggedDevHours : '00:00');
            params.append("bucket_logged_hours", loggedBucketHours ? loggedBucketHours.includes('_') ? '00:00' : loggedBucketHours : '00:00');
            params.append("current_plan", taskData?.current_plan);
            params.append("agency_id", taskData?.agency_id);
            params.append("project_id", taskData?.project_id);
            params.append("task_type", task_type);
            
            APIService.addTaskComment(params)
                .then((response) => {
                    if (response.data?.status) {
                        setReloadTaskTotalWorkingHours(!reloadTaskTotalWorkingHours);
                        toast.success(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setProcess(false);
                        setRefreshComment(!refreshComment);
                        clearControl();
                        setTimeout(() => {
                            setPage(1);
                        }, 500);
                        setHtmlContent('');
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

    return (
        <Form onSubmit={async e => { e.preventDefault(); await addTaskComment() }}>
            <div className="task-description mt-6">
                {/* <span className="font-14 font-weight-semibold dark-1 d-block mb-3">Comments</span> */}
                {/* <Editor
                    apiKey={REACT_APP_TINYMCE_APIKEY}
                    //initialValue=""
                    value={htmlContent}
                    init={tinymceInit}
                    onEditorChange={onEditorChange}
                    onFocus={() => { setHideCommentForm(false); }}
                /> */}
                    {/* <ReactQuill theme="snow" value={htmlContent} onChange={setHtmlContent} onFocus={() => { setHideCommentForm(false); }} />
                    {formErrors.commentInput && (
                        <span className="text-danger">{formErrors.commentInput}</span>
                    )} */}
                {/* {userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyMemberCode &&
                    <Form.Check type="checkbox" className='mt-2' id='dont-show-to-customer' label="Don't Show to Agency/Customer" value={1} checked={commentVisibleToClient} onChange={(e) => { setCommentVisibleToClient(e.target.checked) }} />
                } */}
                {/* {(userData.role_code === databaseRoleCode.agencyCode || userData.role_code === databaseRoleCode.agencyMemberCode) &&
                    <div className='d-block'>
                        <Form.Check type="checkbox" className='mt-2 d-inline-block' id='show-to-customer' label="Show this comment to customer" value={1} checked={commentVisibleToClient} onChange={(e) => { setCommentVisibleToClient(e.target.checked) }} disabled={taskData?.settings?.view_task_comments === 1 ? false : true} />
                        {taskData?.settings?.view_task_comments === 1 ? '' :
                            <>
                                <OverlayTrigger placement="right" trigger="click" rootClose overlay={<Popover id="popover-basic">
                                    <Popover.Body>
                                        {check(['projects.update'], userData?.role.getPermissions) ?
                                            <>
                                                This checkbox is disabled from project setting, <Link to={`/edit-project/${taskData?.project_id}`}>click here</Link> to update your project setting.
                                            </>
                                            :
                                            <>To enable this checkbox please contact to administrator.</>
                                        }

                                    </Popover.Body>
                                </Popover>}>
                                    <i className="fa-solid fa-circle-info ms-2 cursor-pointer"></i>
                                </OverlayTrigger>
                            </>
                        }
                    </div>
                } */}
            </div>
            {!hideCommentForm &&
                <>
                    <div className="task-attachment mt-8">
                        <Row className='g-5'>
                            {checkPermissionForBillableHours() ?
                                <Col xs={12} sm={12} md={4}>
                                    <span className="font-14 font-weight-semibold dark-1 d-block mb-3">Billable Hours
                                        <OverlayTrigger placement="bottom" overlay={<Tooltip id={`tooltip-hours`}>{BILLABLE_HOURS_INFO_MSG}</Tooltip>}>
                                            <i className="fa-solid fa-circle-info ms-2"></i>
                                        </OverlayTrigger>
                                    </span>
                                    <div className='position-relative custom-time-picker'>
                                        <InputMask
                                            mask="99:99"
                                            placeholder="HH:MM"
                                            value={commentHours}
                                            onChange={(e) => { setCommentHours(e.target.value) }}
                                            className={`form-control ${formErrors.commentHoursInput && 'is-timepicker-invalid'}`}
                                        />
                                        <span className='icon-cancel cursor-pointer p-2 date-picker-clear dark-7 font-12' onClick={(e) => { setCommentHours('') }}></span>
                                    </div>
                                    {formErrors.commentHoursInput && (
                                        <span className="text-danger d-block">{formErrors.commentHoursInput}</span>
                                    )}
                                </Col>
                                : ''
                            }
                            {checkPermissionForLoggedDevHours(taskData?.current_plan) && task_type === 0 ?
                                <Col xs={12} sm={12} md={4}>
                                    <span className="font-14 font-weight-semibold dark-1 d-block mb-3">Logged dev plan hours
                                        <OverlayTrigger placement="bottom" overlay={<Tooltip id={`tooltip-hours`}>{DEV_HOURS_INFO_MSG}</Tooltip>}>
                                            <i className="fa-solid fa-circle-info ms-2"></i>
                                        </OverlayTrigger>
                                    </span>
                                    <div className='position-relative custom-time-picker'>
                                        <InputMask
                                            mask="99:99"
                                            placeholder="HH:MM"
                                            value={loggedDevHours}
                                            onChange={(e) => { setLoggedDevHours(e.target.value) }}
                                            className={`form-control ${formErrors.loggedDevHoursInput && 'is-timepicker-invalid'}`}
                                        />
                                        <span className='icon-cancel cursor-pointer p-2 date-picker-clear dark-7 font-12' onClick={(e) => { setLoggedDevHours('') }}></span>
                                    </div>
                                    {formErrors.loggedDevHoursInput && (
                                        <span className="text-danger d-block">{formErrors.loggedDevHoursInput}</span>
                                    )}
                                </Col>
                                : ''
                            }
                            {checkPermissionForLoggedBucketHours(taskData?.current_plan) && task_type === 0 ?
                                <Col xs={12} sm={12} md={4}>
                                    <span className="font-14 font-weight-semibold dark-1 d-block mb-3">Logged bucket plan hours
                                        <OverlayTrigger placement="bottom" overlay={<Tooltip id={`tooltip-hours`}>{BUCKET_HOURS_INFO_MSG}</Tooltip>}>
                                            <i className="fa-solid fa-circle-info ms-2"></i>
                                        </OverlayTrigger>
                                    </span>
                                    <div className='position-relative custom-time-picker'>
                                        <InputMask
                                            mask="99:99"
                                            placeholder="HH:MM"
                                            value={loggedBucketHours}
                                            onChange={(e) => { setLoggedBucketHours(e.target.value) }}
                                            className={`form-control ${formErrors.loggedBucketHoursInput && 'is-timepicker-invalid'}`}
                                        />
                                        <span className='icon-cancel cursor-pointer p-2 date-picker-clear dark-7 font-12' onClick={(e) => { setLoggedBucketHours('') }}></span>
                                    </div>
                                    {formErrors.loggedBucketHoursInput && (
                                        <span className="text-danger d-block">{formErrors.loggedBucketHoursInput}</span>
                                    )}
                                </Col>
                                : ''
                            }
                        </Row>
                        {/* <Row className='mt-6'>
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
                        </div> */}
                    </div>
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
    );
}
