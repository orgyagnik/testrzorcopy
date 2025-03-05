import React, { useState, useEffect } from 'react';
import LastSeen from "../../modules/custom/LastSeen";
import AvatarImg from "../../assets/img/placeholder-image.png";
import { Link, useLocation } from "react-router-dom";
import AttaZipImg from "../../assets/img/zip.png";
import AttaPdfImg from "../../assets/img/pdf.png";
import AttaDocImg from "../../assets/img/doc.png";
import AttaExcelImg from "../../assets/img/excel.png";
import { getFileExtensionFromFileName, appHappyText, replaceSpecialCharacters, check } from "../../utils/functions.js";
import { databaseRoleCode, display_date_format_with_time, tinymceInit, attachmentsAllowExtension, attachmentsAllowExtensionMsg } from '../../settings';
import moment from 'moment-timezone';
import { Button, Spinner, Form, Card, Ratio, OverlayTrigger, Tooltip, Row, Col, Popover } from 'react-bootstrap';
import { Editor } from "@tinymce/tinymce-react";
import { toast } from 'react-toastify';
import APIService from "../../api/APIService";
import { validateForm } from "../../utils/validator.js";
import { TaskCommentValidator } from "../../modules/validation/TaskCommentValidator";
import linkifyHtml from 'linkify-html';
import InputMask from "react-input-mask";
import { BILLABLE_HOURS_INFO_MSG, DEV_HOURS_INFO_MSG, BUCKET_HOURS_INFO_MSG, BILLABLE_HOURS_VALIDATE_MSG, LOGGED_DEV_HOURS_VALIDATE_MSG, LOGGED_BUCKET_HOURS_VALIDATE_MSG, COPY_LINK_MSG } from '../../modules/lang/Task';
import { FileUploader } from "react-drag-drop-files";
import AttachmentPreview from './AttachmentPreview';
import LiveClock from 'react-live-clock';
import AttaSvgImg from "../../assets/img/svg.png";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const REACT_APP_TINYMCE_APIKEY = process.env.REACT_APP_TINYMCE_APIKEY;

export default function TaskComment({ comment, handleAttachmentClick, userData, handleDeleteTaskComment, setRefreshComment, refreshComment, openImageViewer, handleDeleteTaskCommentAttachment, handleDownloadAttachmentsZip, setReloadTaskTotalWorkingHours, reloadTaskTotalWorkingHours, taskData, checkPermissionForLoggedDevHours, checkPermissionForLoggedBucketHours, task_type, taskComment, setTaskComment }) {
    const searchHash = useLocation().hash;
    const [isEditing, setIsEditing] = useState(false);
    const [commentFormErrors, setCommentFormErrors] = useState([]);
    const [processEdit, setProcessEdit] = useState(false);
    const [commentHours, setCommentHours] = useState(comment?.billable_hours);
    const [loggedDevHours, setLoggedDevHours] = useState(comment?.dev_logged_hours);
    const [loggedBucketHours, setLoggedBucketHours] = useState(comment?.bucket_logged_hours);
    const [attachmentsFile1, setAttachmentsFile1] = useState([]);
    const [commentVisibleToClient, setCommentVisibleToClient] = useState(((userData?.role_code === databaseRoleCode.agencyCode || userData?.role_code === databaseRoleCode.agencyMemberCode) && comment.comment_visible_to_client === 0) || comment.comment_visible_to_client === 1 ? true : false);
    const onEditorChange = (e) => {
        setHtmlContent(e);
    }

    const [htmlContent, setHtmlContent] = useState(comment?.content.replaceAll('[task_attachment]', ''));

    const handleDragAndDropChange = (files) => {
        setCommentFormErrors([]);
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

    const editTaskComment = (attachments_length) => {
        setProcessEdit(true);
        setCommentFormErrors([]);
        let loggedHoursPermission = 'not required';
        if (task_type === 0) {
            let loggedDevHoursNew = loggedDevHours ? loggedDevHours.includes('_') ? '' : loggedDevHours : '';
            let loggedBucketHoursNew = loggedBucketHours ? loggedBucketHours.includes('_') ? '' : loggedBucketHours : '';
            if (checkPermissionForLoggedDevHours(taskData?.current_plan) && (loggedDevHoursNew === '') && checkPermissionForLoggedBucketHours(taskData?.current_plan) && loggedBucketHoursNew === '') {
                loggedHoursPermission = '';
            }
            else if (checkPermissionForLoggedDevHours(taskData?.current_plan) && loggedDevHoursNew === '' && !checkPermissionForLoggedBucketHours(taskData?.current_plan)) {
                loggedHoursPermission = '';
            }
            else if (checkPermissionForLoggedBucketHours(taskData?.current_plan) && loggedBucketHoursNew === '' && !checkPermissionForLoggedDevHours(taskData?.current_plan)) {
                loggedHoursPermission = '';
            }
        }
        // Billable Hours
        let billableHoursValidate;
        if (!commentHours) {
            billableHoursValidate = '';
        } else {
            billableHoursValidate = validateHoursAndMinutes(commentHours);
            if (!billableHoursValidate) {
                setProcessEdit(false);
                setCommentFormErrors({ commentHoursInput: BILLABLE_HOURS_VALIDATE_MSG });
                return;
            }
        }

        // Dev and bucket Validation        
        if(loggedHoursPermission === ''){
            loggedHoursPermission = '';
        }else{
        
            if (!validateHoursAndMinutes(loggedDevHours)) {
                setProcessEdit(false);
                setCommentFormErrors({ loggedDevHoursInput: LOGGED_DEV_HOURS_VALIDATE_MSG });
                return;
            }
            if (!validateHoursAndMinutes(loggedBucketHours)) {
                setProcessEdit(false);
                setCommentFormErrors({ loggedBucketHoursInput: LOGGED_BUCKET_HOURS_VALIDATE_MSG });
                return;
            }
        }

        let validate = validateForm((TaskCommentValidator('htmlContent', billableHoursValidate, loggedHoursPermission, loggedHoursPermission)));
        if (Object.keys(validate).length) {
            setProcessEdit(false);
            setCommentFormErrors(validate);
        }
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
            params.append("commentid", comment.id);
            let htmlContentNew = htmlContent.replaceAll('[task_attachment]', '');
            let len = attachmentsFile1?.length ? attachmentsFile1.length : 0;
            for (let i = 0; i < len; i++) {
                params.append(
                    "attechment",
                    attachmentsFile1[i].file
                );
            }
            let attachments_lengthNew = attachments_length + len;
            let htmlContentMain = attachments_lengthNew > 0 ? `${htmlContentNew}[task_attachment]` : htmlContentNew;
            params.append("content", htmlContentMain);
            params.append("billable_hours", commentHours ? commentHours.includes('_') ? '00:00' : commentHours : '00:00');
            params.append("dev_logged_hours", loggedDevHours ? loggedDevHours.includes('_') ? '00:00' : loggedDevHours : '00:00');
            params.append("bucket_logged_hours", loggedBucketHours ? loggedBucketHours.includes('_') ? '00:00' : loggedBucketHours : '00:00');
            params.append("current_plan", taskData?.current_plan);
            params.append("task_type", task_type);

            params.append("project_id", taskData?.project_id);

            APIService.EditTaskComment(params)
                .then((response) => {
                    if (response.data?.status) {
                        toast.success(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setProcessEdit(false);
                        setRefreshComment(!refreshComment);
                        setIsEditing(false);
                        setReloadTaskTotalWorkingHours(!reloadTaskTotalWorkingHours);
                        const updatedComments = taskComment.map(row => {
                            if (row.id === comment.id) {
                                return response.data?.data;
                            }
                            return row;
                        });
                        setTaskComment(updatedComments);
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

    const getTimezoneFromAbbreviation = (abbreviation) => {
        const timezoneMappings = {
            IST: 'Asia/Kolkata',
            EST: 'America/New_York',
            MST: 'America/Denver',
            CST: 'America/Chicago',
            PST: 'America/Los_Angeles',
            YST: 'America/Whitehorse',
        };
        const uppercaseAbbreviation = abbreviation.toUpperCase();
        const ianaTimezone = timezoneMappings[uppercaseAbbreviation];
        return ianaTimezone;
    };

    const copyTaskLink = (taskId, task_type, commentid) => { 
        if (task_type === 1) {
            navigator.clipboard.writeText(`${window.location.origin}/view-site-addons-task/${taskId}`);
        }
        else {
            navigator.clipboard.writeText(`${window.location.origin}/view-task/${taskId}#comment_${commentid}`);
        }
        toast.success(COPY_LINK_MSG, { position: toast.POSITION.TOP_RIGHT });
    };

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
                    <div className="comments-header d-flex align-items-md-start">
                        <div className="d-flex flex-md-row flex-column align-items-md-start">
                            <div className="d-flex flex-column">
                                <div className="d-flex align-items-center">
                                    {userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode ?
                                        <Link to={`${comment.is_not_staff === 1 ? '/agency-user-detail/' : '/user-detail/'}${comment.staffid}`} className="commnets-name font-weight-medium text-nowrap">{comment.name}</Link>
                                        : <span className="commnets-name font-weight-medium text-nowrap">{comment.name}</span>
                                    }
                                    {comment?.is_not_staff === 1 && userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode && comment?.time_zone && comment?.time_zone !== '' &&
                                        <>
                                            {comment?.time_zone.toLowerCase() === 'est' || comment?.time_zone.toLowerCase() === 'cst' || comment?.time_zone.toLowerCase() === 'ist' || comment?.time_zone.toLowerCase() === 'mst' || comment?.time_zone.toLowerCase() === 'pst' || comment?.time_zone.toLowerCase() === 'yst' ?
                                                <OverlayTrigger placement="top" overlay={<Tooltip>Current Time: <LiveClock className="" format={display_date_format_with_time} ticking={true} timezone={getTimezoneFromAbbreviation(comment?.time_zone)} /></Tooltip>}>
                                                    <i className="fa-regular fa-clock dark-2 ms-2 font-10"></i>
                                                </OverlayTrigger>
                                                :
                                                <OverlayTrigger placement="top" overlay={<Tooltip>Current Time: <LiveClock className="" format={display_date_format_with_time} ticking={true} timezone={comment?.time_zone} /></Tooltip>}>
                                                    <i className="fa-regular fa-clock dark-2 ms-2 font-10"></i>
                                                </OverlayTrigger>
                                            }
                                        </>
                                    }
                                    {comment.contact_id === 0 && comment?.is_not_staff === 0 && (userData.role_code === databaseRoleCode.agencyCode || userData.role_code === databaseRoleCode.agencyMemberCode) ?
                                        <OverlayTrigger placement="top" overlay={<Tooltip>Current Time: <LiveClock className="" format={display_date_format_with_time} ticking={true} timezone={"Asia/Kolkata"} /></Tooltip>}>
                                            <i className="fa-regular fa-clock dark-2 ms-2 font-10"></i>
                                        </OverlayTrigger>
                                        : ''
                                    }
                                </div>
                                {comment.designation_name &&
                                    <span className="font-10 text-nowrap d-block">{comment.designation_name}</span>
                                }
                                <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${comment.id}`}> {moment.tz(comment.date, 'America/New_York').tz(moment.tz.guess()).format(display_date_format_with_time)}</Tooltip>}>
                                    <a href={`#comment_${comment.id}`} className="commnets-time dark-2 font-12 mt-1 text-nowrap d-md-inline-block d-block">
                                        <LastSeen date={Date.parse(moment(comment.date).format())} />
                                    </a>
                                </OverlayTrigger>
                            </div>
                            {comment.contact_id > 0 && userData.role_code !== databaseRoleCode.clientCode &&
                                <span className="client-designation font-12 border border-gray-500 rounded-5 ms-4">Customer</span>
                            }
                            {userData?.role_code !== databaseRoleCode.clientCode &&
                                <>
                                    {comment?.comment_visible_to_client === 1 &&
                                        <p className='text-danger my-0 ms-md-4 w-100 font-12 text-nowrap'>[Not visible to Agency/Customer]</p>
                                    }
                                    {comment?.comment_visible_to_client === 2 &&
                                        <p className='text-danger my-0 ms-md-4 w-100 font-12 text-nowrap'>[Not visible to Customer]</p>
                                    }
                                    {(userData?.role_code === databaseRoleCode.agencyCode || userData?.role_code === databaseRoleCode.agencyMemberCode) && comment?.comment_visible_to_client !== 2 ?
                                        <p className='text-success my-0 ms-md-4 w-100 font-12 text-nowrap'>[This comment is visible to customer]</p>
                                        : ''
                                    }
                                </>
                            }
                        </div>
                        <div className="d-flex align-items-md-center ms-auto">
                            <OverlayTrigger placement="bottom" overlay={<Tooltip id={`copy-link`}> Copy Comment link</Tooltip>}>
                                <span className='text-primary cursor-pointer' onClick={() => { copyTaskLink(taskData?.id, 0, comment.id) }}>
                                    <i className="icon-link"></i>
                                </span>
                            </OverlayTrigger>
                            {userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.adminCode && userData?.id === comment.staffid &&
                                <>
                                    {!isEditing &&
                                        <Button size='sm' className='ms-4 btn-icon circle-btn text-primary' variant="white" onClick={() => { setIsEditing(true) }}><i className="icon-edit"></i></Button>}
                                    <Button size='sm' className='ms-2 btn-icon circle-btn text-danger' variant="white" onClick={() => { handleDeleteTaskComment(comment.id); setIsEditing(false); }}><i className="icon-delete"></i></Button>
                                </>
                            }
                            {userData.role_code === databaseRoleCode.adminCode &&
                                <>
                                    {!isEditing &&
                                        <Button size='sm' className='ms-4 btn-icon circle-btn text-primary' variant="white" onClick={() => { setIsEditing(true) }}><i className="icon-edit"></i></Button>}
                                    <Button size='sm' className='ms-2 btn-icon circle-btn text-danger' variant="white" onClick={() => { handleDeleteTaskComment(comment.id); setIsEditing(false); }}><i className="icon-delete"></i></Button>
                                </>
                            }
                            {/*userData.role_code === databaseRoleCode.clientCode && userData?.userid === comment.contact_id &&*/
                                userData.role_code === databaseRoleCode.clientCode && userData?.id === comment.contact_id &&
                                <>
                                    {!isEditing &&
                                        <Button size='sm' className='ms-4 btn-icon circle-btn text-primary' variant="white" onClick={() => { setIsEditing(true) }}><i className="icon-edit"></i></Button>}
                                    <Button size='sm' className='ms-2 btn-icon circle-btn text-danger' variant="white" onClick={() => { handleDeleteTaskComment(comment.id); setIsEditing(false); }}><i className="icon-delete"></i></Button>
                                </>
                            }
                        </div>
                    </div>
                    {/* {comment?.is_not_staff === 1 && userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode && comment?.time_zone && comment?.time_zone !== '' &&
                        <>
                            {comment?.time_zone.toLowerCase() === 'est' || comment?.time_zone.toLowerCase() === 'cst' || comment?.time_zone.toLowerCase() === 'ist' || comment?.time_zone.toLowerCase() === 'mst' || comment?.time_zone.toLowerCase() === 'pst' || comment?.time_zone.toLowerCase() === 'yst' ?
                                <LiveClock className="commnets-time dark-2 font-12 mt-1 text-nowrap d-md-inline-block d-block" format={display_date_format_with_time} ticking={true} timezone={getTimezoneFromAbbreviation(comment?.time_zone)} />
                                :
                                <LiveClock className="commnets-time dark-2 font-12 mt-1 text-nowrap d-md-inline-block d-block" format={display_date_format_with_time} ticking={true} timezone={comment?.time_zone} />
                            }
                        </>
                    }
                    {comment.contact_id === 0 && comment?.is_not_staff === 0 && (userData.role_code === databaseRoleCode.agencyCode || userData.role_code === databaseRoleCode.agencyMemberCode) ?
                        <LiveClock className="commnets-time dark-2 font-12 mt-1 text-nowrap d-md-inline-block d-block" format={display_date_format_with_time} ticking={true} timezone={"Asia/Kolkata"} />
                        : ''
                    } */}
                    <div className="comments-body pt-3">
                        {!isEditing && comment?.content && comment?.content !== '[task_attachment]' && <p dangerouslySetInnerHTML={{ __html: replaceSpecialCharacters(linkifyHtml(appHappyText(comment?.content))).replaceAll('[task_attachment]', '').replaceAll("<a ", "<a rel='nofollow' target='_blank' ") }}></p>}
                        {isEditing &&
                            <div className='mt-4 mb-4'>
                                <Form onSubmit={async e => { e.preventDefault(); await editTaskComment(comment?.attachments.length) }}>
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
                                    {userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyMemberCode &&
                                        <Form.Check type="checkbox" className='mt-2' id={`show-to-customer-${comment.id}`} label="Don't Show to Agency/Customer" value={1} checked={commentVisibleToClient} onChange={(e) => { setCommentVisibleToClient(e.target.checked) }} />
                                    }
                                    {/* {(userData.role_code === databaseRoleCode.agencyCode || userData.role_code === databaseRoleCode.agencyMemberCode) &&
                                        <div className='d-block'>
                                            <Form.Check type="checkbox" className='mt-2 d-inline-block' id={`show-to-customer-${comment.id}`} label="Show this comment to customer" value={1} checked={commentVisibleToClient} onChange={(e) => { setCommentVisibleToClient(e.target.checked) }} disabled={taskData?.settings?.view_task_comments === 1 ? false : true} />
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
                                    {userData?.role_code === databaseRoleCode.adminCode ?
                                        <Row className=''>
                                            <Col xs={12} sm={12} md={4}>
                                                <span className="font-14 font-weight-semibold dark-1 d-block mb-1 mt-4">Billable Hours
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
                                                        className={`form-control ${commentFormErrors.commentHoursInput && 'is-timepicker-invalid'}`}
                                                    />
                                                    <i className='icon-cancel cursor-pointer p-2 date-picker-clear dark-7 font-12' onClick={(e) => { setCommentHours('') }}></i>
                                                </div>
                                                {commentFormErrors.commentHoursInput && (
                                                    <span className="text-danger d-block">{commentFormErrors.commentHoursInput}</span>
                                                )}
                                            </Col>
                                            {task_type === 0 && Math.abs(new Date() - new Date(comment.date)) / (1000 * 60 * 60) < 24 &&
                                                <>
                                                    <Col xs={12} sm={12} md={4}>
                                                        <span className={`font-14 font-weight-semibold dark-1 d-block mb-1 mt-4 ${taskData?.current_plan.includes('dev') ? '' : 'text-danger'} `}>Logged dev plan hours
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
                                                                className={`form-control ${commentFormErrors.loggedDevHoursInput && 'is-timepicker-invalid'}`}
                                                            />
                                                            <i className='icon-cancel cursor-pointer p-2 date-picker-clear dark-7 font-12' onClick={(e) => { setLoggedDevHours('') }}></i>
                                                        </div>
                                                        {commentFormErrors.loggedDevHoursInput && (
                                                            <span className="text-danger d-block">{commentFormErrors.loggedDevHoursInput}</span>
                                                        )}
                                                    </Col>
                                                    <Col xs={12} sm={12} md={4}>
                                                        <span className={`font-14 font-weight-semibold dark-1 d-block mb-1 mt-4 ${taskData?.current_plan.includes('bucket') ? '' : 'text-danger'} `}>Logged bucket plan hours
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
                                                                className={`form-control ${commentFormErrors.loggedBucketHoursInput && 'is-timepicker-invalid'}`}
                                                            />
                                                            <i className='icon-cancel cursor-pointer p-2 date-picker-clear dark-7 font-12' onClick={(e) => { setLoggedBucketHours('') }}></i>
                                                        </div>
                                                        {commentFormErrors.loggedBucketHoursInput && (
                                                            <span className="text-danger d-block">{commentFormErrors.loggedBucketHoursInput}</span>
                                                        )}
                                                    </Col>
                                                </>
                                            }
                                        </Row>
                                        : ''
                                    }
                                    {/* <Row className='mt-6'>
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
                                    </div> */}
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
                                    return <div className="col-12 col-md-4 col-lg-2 col-xl-2 text-center" key={index}>
                                        <div className='attachment_div'>
                                            <Card className="border border-gray-100 bg-white">
                                                <Card.Body className="position-relative p-0">
                                                    <div className="action-buttons-row position-absolute w-100 d-flex align-items-center justify-content-end p-2">
                                                        <a href={cmt_att.file_path} download className='btn-icon circle-btn btn btn-light btn-sm text-info'><i className='icon-download'></i></a>
                                                        {userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.adminCode && userData?.id === comment.staffid &&
                                                            <Button size='sm' className='ms-1 btn-icon circle-btn text-danger' variant="light" onClick={() => { handleDeleteTaskCommentAttachment(cmt_att.id, taskData?.id, comment.id); setIsEditing(false); }}><i className="icon-delete"></i></Button>
                                                        }
                                                        {userData.role_code === databaseRoleCode.adminCode &&
                                                            <Button size='sm' className='ms-1 btn-icon circle-btn text-danger' variant="light" onClick={() => { handleDeleteTaskCommentAttachment(cmt_att.id, taskData?.id, comment.id); setIsEditing(false); }}><i className="icon-delete"></i></Button>
                                                        }
                                                        {/*userData.role_code === databaseRoleCode.clientCode && userData?.userid === comment.contact_id &&*/
                                                            userData.role_code === databaseRoleCode.clientCode && userData?.id === comment.contact_id &&
                                                            <Button size='sm' className='ms-1 btn-icon circle-btn text-danger' variant="light" onClick={() => { handleDeleteTaskCommentAttachment(cmt_att.id, taskData?.id, comment.id); setIsEditing(false); }}><i className="icon-delete"></i></Button>
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
                                                            {file_ext === 'xlsx' || file_ext === 'xlsm' || file_ext === 'xlsb' || file_ext === 'xltx' || file_ext === 'xltm' || file_ext === 'xls' || file_ext === 'xlt' || file_ext === 'csv' ?
                                                                <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {cmt_att.file_name}</Tooltip>}>
                                                                    <Card.Img variant="top" src={AttaExcelImg} alt="Attachments" title={cmt_att.file_title} />
                                                                </OverlayTrigger>
                                                                : ''}
                                                            {file_ext !== 'svg' && file_ext !== 'zip' && file_ext !== 'pdf' && file_ext !== 'doc' && file_ext !== 'docx' && file_ext !== 'xlsx' && file_ext !== 'xlsm' && file_ext !== 'xlsb' && file_ext !== 'xltx' && file_ext !== 'xltm' && file_ext !== 'xls' && file_ext !== 'xlt' && file_ext !== 'csv' &&
                                                                <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> {cmt_att.file_name}</Tooltip>}>
                                                                    <Card.Img variant="top" className='cursor-pointer' src={cmt_att.file_path} onClick={() => openImageViewer(comment?.attachments, cmt_att.file_path)} alt="Attachments" title={cmt_att.file_title} />
                                                                </OverlayTrigger>
                                                            }
                                                        </>
                                                    </Ratio>
                                                </Card.Body>
                                            </Card>
                                        </div>
                                        {/* <img className="rounded-5 img-fluid" src={file_ext === 'zip' ? AttaZipImg : cmt_att.file_path} onClick={() => handleAttachmentClick(cmt_att.file_path)} alt="Attachments" /> */}
                                    </div>
                                })}
                                {/* <div className='text-center'>
                                <Button variant="outline-secondary" size="md" type="button" onClick={() => { handleDownloadAttachmentsZip(comment.id, 'comment') }} className='mt-6'><i className="icon-download me-2"></i>Download All (.zip)</Button>
                            </div> */}
                            </div>
                        }
                    </div>
                </div>
            </div>
            {(userData?.role_code !== databaseRoleCode.agencyCode && userData?.role_code !== databaseRoleCode.clientCode && userData?.role_code !== databaseRoleCode.agencyMemberCode && comment?.billable_hours !== '00:00') || ((userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.pcCode || userData?.role_code === databaseRoleCode.accountantCode) && comment?.dev_logged_hours !== '00:00') || ((userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.pcCode || userData?.role_code === databaseRoleCode.accountantCode) && comment?.bucket_logged_hours !== '00:00') || (userData?.role_code === databaseRoleCode.agencyCode && taskData?.current_plan.includes('bucket') && comment?.bucket_logged_hours !== '00:00') ?
                <div className='billable-hrs'>
                    <ul>
                        {userData?.role_code !== databaseRoleCode.agencyCode && userData?.role_code !== databaseRoleCode.clientCode && userData?.role_code !== databaseRoleCode.agencyMemberCode && comment?.billable_hours !== '00:00' &&
                            <li className='font-12'>Billable hours:<span className="font-weight-semibold ms-1">{comment?.billable_hours}</span></li>
                        }
                        {(userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.pcCode || userData?.role_code === databaseRoleCode.accountantCode) && comment?.dev_logged_hours !== '00:00' ?
                            <li className='font-12'>Logged dev plan hours:<span className="font-weight-semibold ms-1">{comment?.dev_logged_hours}</span></li>
                            : ''}
                        {(userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.pcCode || userData?.role_code === databaseRoleCode.accountantCode) && comment?.bucket_logged_hours !== '00:00' ?
                            <li className='font-12'>Logged bucket plan hours:<span className="font-weight-semibold ms-1">{comment?.bucket_logged_hours}</span></li>
                            : ''}
                        {userData?.role_code === databaseRoleCode.agencyCode && taskData?.current_plan.includes('bucket') && comment?.bucket_logged_hours !== '00:00' ?
                            <li className='font-12'>Logged bucket plan hours:<span className="font-weight-semibold ms-1">{comment?.bucket_logged_hours}</span></li>
                            : ''}
                    </ul>
                </div>
                : ''}
        </>
    );
}
