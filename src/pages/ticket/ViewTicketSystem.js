import React, { useState, useEffect, Suspense } from 'react';
import { Offcanvas, OverlayTrigger, Tooltip, Form, Button, Spinner, DropdownButton, Dropdown } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { office_display_date_format_for_date, databaseRoleCode, tinymceInit } from '../../settings';
import moment from 'moment';
import { check, replaceSpecialCharacters } from "../../utils/functions.js";
import linkifyHtml from 'linkify-html';
import { Editor } from "@tinymce/tinymce-react";
import TicketComment from './TicketComment';
import { confirmAlert } from 'react-confirm-alert';
import { DELETE_TICKET_COMMENT } from '../../modules/lang/TicketSystem';
import { toast } from 'react-toastify';
import { TicketCommentValidator } from "../../modules/validation/TicketSystemValidator";
import { validateForm } from "../../utils/validator.js";
import TicketAccessDenied from './TicketAccessDenied';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const REACT_APP_TINYMCE_APIKEY = process.env.REACT_APP_TINYMCE_APIKEY;
const LazyDescription = React.lazy(() => import('../../modules/custom/LazyDescription'));

function ViewTicketSystem({ userData, name, showViewTicketModal, setShowViewTicketModal, ticketSystemDesignationId, handleTicketSystemEdit, ticketId, handleTicketDelete, statusList, reloadPage, setReloadPage }) {
    const [ticketData, setTicketData] = useState(null);
    const [formErrors, setFormErrors] = useState([]);
    const [hideCommentForm, setHideCommentForm] = useState(true);
    const [process, setProcess] = useState(false);
    const [ticketCommentProcess, setTicketCommentProcess] = useState(true);
    const [ticketComment, setTicketComment] = useState(null);
    const [refreshComment, setRefreshComment] = useState(false);
    const [ticketStatus, setTicketStatus] = useState(null);
    const [updateTicketCount, setUpdateTicketCount] = useState(false);
    const cstSetCloseViewTicketModal = () => {
        setShowViewTicketModal(false);
        window.history.replaceState(null, '', `/it-ticket`);
        clearControl();
        if (updateTicketCount) {
            setReloadPage(!reloadPage);
        }
        setUpdateTicketCount(false);
        setTimeout(() => {
            setTicketData(null);
        }, 500);
    };

    //for html editor
    const [htmlContent, setHtmlContent] = useState();
    const onEditorChange = (e) => {
        setHtmlContent(e);
    }

    useEffect(() => {
        if (showViewTicketModal) {
            APIService.getTicketForEdit(ticketId)
                .then((response) => {
                    if (response.data?.status) {
                        let data = response.data?.data;
                        setTicketData(data);
                        setTicketStatus({ status: data?.status_name, backgroundColor: data?.backgroundColor });
                    }
                });
        }
    }, [showViewTicketModal, ticketId]);

    useEffect(() => {
        setTicketCommentProcess(true);
        if (showViewTicketModal) {
            APIService.getTicketComment(`?ticket_id=${ticketId}`)
                .then((response) => {
                    if (response.data?.status) {
                        setTicketComment(response.data?.data);
                    }
                    setTicketCommentProcess(false);
                });
        }
    }, [showViewTicketModal, refreshComment, ticketId]);

    const addTicketComment = async () => {
        setProcess(true);
        setFormErrors([]);
        let validate = validateForm((TicketCommentValidator(htmlContent ? htmlContent : '')));
        if (Object.keys(validate).length) {
            setProcess(false);
            setFormErrors(validate);
        }
        else {
            const params = new FormData();
            params.append("ticket_id", ticketId);
            params.append("content", htmlContent ? htmlContent : '');
            params.append("staff_id", userData?.id);

            APIService.addTicketComment(params)
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

    const handleDeleteTicketComment = (id) => {
        confirmAlert({
            title: 'Confirm',
            message: DELETE_TICKET_COMMENT,
            buttons: [
                {
                    label: 'Yes',
                    className: 'btn btn-primary btn-lg',
                    onClick: () => {
                        let params = {};
                        params["commentid"] = id;
                        APIService.deleteTicketComment(params)
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

    const updateTicketStatus = (id, status) => {
        let params = {};
        params["ticketid"] = id;
        params["status"] = status;
        APIService.updateTicketStatus(params)
            .then((response) => {
                if (response.data?.status) {
                    setUpdateTicketCount(true);
                    let task_status_new = statusList.filter(function (arr) { return arr.value === status; });
                    if (task_status_new.length > 0) {
                        setTicketStatus({ status: task_status_new[0]?.label, backgroundColor: task_status_new[0]?.backgroundColor });
                    }
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
            {ticketData &&
                <Offcanvas show={showViewTicketModal} onHide={cstSetCloseViewTicketModal} enforceFocus={false} className="add-task-sidebar edit-task-sidebar" placement="end">
                    {ticketData?.id ?
                        <>
                            <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
                                <div className="d-flex align-items-center">
                                    <h2 className='mb-0 d-xl-block d-none'>{ticketData?.name}</h2>
                                </div>
                                <ul className="ovrlay-header-icons">
                                    {check(['ticket_system.update'], userData?.role.getPermissions) && (userData?.role_code === databaseRoleCode.adminCode || (ticketData?.status === 1 && ticketData?.added_by === userData?.id)) ?
                                        <li>
                                            <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> Edit Ticket</Tooltip>}>
                                                <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={() => { handleTicketSystemEdit(ticketData?.id); }}>
                                                    <i className="icon-edit"></i>
                                                </button>
                                            </OverlayTrigger>
                                        </li>
                                        : ''}
                                    {check(['ticket_system.delete'], userData?.role.getPermissions) && (userData?.role_code === databaseRoleCode.adminCode || (ticketData?.status === 1 && ticketData?.added_by === userData?.id)) ?
                                        <li>
                                            <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> Delete Ticket</Tooltip>}>
                                                <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={() => { handleTicketDelete(ticketData?.id) }}>
                                                    <i className="icon-delete text-danger"></i>
                                                </button>
                                            </OverlayTrigger>
                                        </li>
                                        : ''}
                                    <li>
                                        <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={cstSetCloseViewTicketModal}>
                                            <i className="icon-cancel"></i>
                                        </button>
                                    </li>
                                </ul>
                            </Offcanvas.Header>
                            <Offcanvas.Body className="p-0">
                                <div className="d-flex flex-xl-nowrap flex-wrap h-100">
                                    <div className="left-content p-6 flex-fill order-xl-1 order-2">
                                        <SimpleBar className="offcanvas-inner">
                                            <Suspense fallback={<div>Loading description...</div>}>
                                                <div className="task-content-list d-lg-block align-items-center">
                                                    <div className="task-label-left mb-lg-2">
                                                        <span className="dark-1 font-weight-semibold">Description:</span>
                                                    </div>
                                                    <div className="task-label-right">
                                                        <LazyDescription descriptionData={ticketData} />
                                                    </div>
                                                </div>
                                            </Suspense>
                                          
                                            <Form onSubmit={async e => { e.preventDefault(); await addTicketComment() }}>
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
                                            {ticketCommentProcess ?
                                                <><Spinner size="md" animation="border" className="mt-8" /></>
                                                :
                                                ticketComment?.length > 0 &&
                                                <>
                                                    <div className="comment-area mt-12">
                                                        {ticketComment.length > 0 && ticketComment?.map((comment, index) => (
                                                            <div key={index} id={`comment_${comment.id}`}>
                                                                {comment?.content !== "[task_attachment]" || comment?.attachments.length > 0 ?
                                                                    <div className="comment-list mb-3 p-6 pb-1">
                                                                        <div key={index}>
                                                                            <TicketComment comment={comment} userData={userData} handleDeleteTicketComment={handleDeleteTicketComment} setRefreshComment={setRefreshComment} refreshComment={refreshComment} />
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
                                                <h3 className="d-xl-none mb-5">{ticketData?.name}</h3>
                                                <h4 className="mb-4">Ticket Info
                                                </h4>
                                                <div className="task-content-list d-sm-flex align-items-center">
                                                    <div className="task-label-left">
                                                        <span className="font-14 dark-1 font-weight-semibold align-top">Created By:</span>
                                                    </div>
                                                    <div className="task-label-right ms-sm-2">{ticketData?.addedby_name}</div>
                                                </div>
                                                <div className="task-content-list d-sm-flex align-items-center">
                                                    <div className="task-label-left">
                                                        <span className="font-14 dark-1 align-top font-weight-semibold">Created Date:</span>
                                                    </div>
                                                    <div className="task-label-right ms-sm-2">{moment(ticketData?.created_at).format(office_display_date_format_for_date)}</div>
                                                </div>
                                                <div className="task-content-list d-sm-flex align-items-center">
                                                    <div className="task-label-left">
                                                        <span className="font-14 dark-1 align-top font-weight-semibold">Status:</span>
                                                    </div>
                                                    <div className="task-label-right ms-sm-2">
                                                        {userData?.role_code === databaseRoleCode.adminCode || userData?.designation === ticketSystemDesignationId ?
                                                            <DropdownButton
                                                                as="a"
                                                                id="dropdown-variants-status-1"
                                                                variant={ticketStatus?.backgroundColor}
                                                                title={ticketStatus?.status}
                                                                size='sm'
                                                                className='p-0 sidebar-status-dropdown'
                                                            >
                                                                {statusList.filter(function (arr) { return arr.label !== ticketStatus?.status; }).map((status, index) => (
                                                                    <Dropdown.Item key={index} onClick={() => { updateTicketStatus(ticketData?.id, status.value) }}>
                                                                        {`${status.label}`}
                                                                    </Dropdown.Item>
                                                                ))}
                                                            </DropdownButton>
                                                            :
                                                            <Dropdown className="project-drop-down category-dropdown">
                                                                <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="dark-2 font-weight-normal font-12" id="status">
                                                                    {ticketData?.status_name}
                                                                </Dropdown.Toggle>
                                                            </Dropdown>
                                                        }
                                                    </div>
                                                </div>
                                                <div className="task-content-list d-sm-flex align-items-center">
                                                    <div className="task-label-left">
                                                        <span className="font-14 dark-1 align-top font-weight-semibold">Category:</span>
                                                    </div>
                                                    <div className="task-label-right ms-sm-2">{ticketData?.category_name}</div>
                                                </div>
                                                <div className="task-content-list d-sm-flex align-items-center">
                                                    <div className="task-label-left">
                                                        <span className="font-14 dark-1 align-top font-weight-semibold">Priority:</span>
                                                    </div>
                                                    <div className="task-label-right ms-sm-2">{ticketData?.priority}</div>
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
                                        <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={cstSetCloseViewTicketModal}>
                                            <i className="icon-cancel"></i>
                                        </button>
                                    </li>
                                </ul>
                            </Offcanvas.Header>
                            <Offcanvas.Body className="p-0">
                                <SimpleBar className="offcanvas-inner" id='offcanvas-inner'>
                                    <TicketAccessDenied />
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

export default connect(mapStateToProps)(ViewTicketSystem)