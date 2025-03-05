import React, { useState, useEffect } from 'react';
import { Offcanvas, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { databaseRoleCode, office_display_date_format_for_date } from '../../settings';
import { check, replaceSpecialCharacters } from "../../utils/functions.js";
import moment from 'moment-timezone';
import SimpleBar from 'simplebar-react';
import linkifyHtml from 'linkify-html';
import NoticeAccessDenied from './NoticeAccessDenied';

function ViewNotice({ userData, showViewNoticeModal, setShowViewNoticeModal, setReloadPage, reloadPage, handleNoticeEdit, handleNoticeDelete, noticeId }) {

    const [noticeData, setNoticeData] = useState(null);
    const [updateNoticeCount, setUpdateNoticeCount] = useState(false);
    const [formErrors, setFormErrors] = useState([]);    

    const cstSetCloseViewNoticeModal = () => {
        setShowViewNoticeModal(false);
        window.history.replaceState(null, '', `/notices`);
        clearControl();
        if (updateNoticeCount) {
            setReloadPage(!reloadPage);
        }
        setUpdateNoticeCount(false);
        setTimeout(() => {
            setNoticeData(null);
        }, 500);
    };

    const clearControl = async () => {
        setFormErrors([]);        
    }

    useEffect(() => {
        if (showViewNoticeModal) {
            APIService.getNoticeForEdit(noticeId)
                .then((response) => {
                    if (response.data?.status) {
                        let data = response.data?.data;
                        setNoticeData(data);
                    }
                });
        }
    }, [setShowViewNoticeModal, noticeId]);

    return (
        <>
            {noticeData &&
                <Offcanvas show={showViewNoticeModal} onHide={cstSetCloseViewNoticeModal} enforceFocus={false} className="add-task-sidebar edit-task-sidebar" placement="end">
                    {noticeData?.id ?
                        <>
                            <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
                                <div className="d-flex align-items-center">
                                    <h2 className='mb-0 d-xl-block d-none'>Info</h2>
                                </div>
                                <ul className="ovrlay-header-icons">
                                    {check(['notice.update'], userData?.role.getPermissions) && (userData?.role_code === databaseRoleCode.adminCode || (noticeData?.status === 1 && noticeData?.added_by === userData?.id)) ?
                                        <li>
                                            <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> Edit Notice</Tooltip>}>
                                                <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={() => { handleNoticeEdit(noticeData?.id); }}>
                                                    <i className="icon-edit"></i>
                                                </button>
                                            </OverlayTrigger>
                                        </li>
                                        : ''}
                                    {check(['notice.delete'], userData?.role.getPermissions) && (userData?.role_code === databaseRoleCode.adminCode || (noticeData?.status === 1 && noticeData?.added_by === userData?.id)) ?
                                        <li>
                                            <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> Delete Notice</Tooltip>}>
                                                <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={() => { handleNoticeDelete(noticeData?.id) }}>
                                                    <i className="icon-delete text-danger"></i>
                                                </button>
                                            </OverlayTrigger>
                                        </li>
                                        : ''}
                                    <li>
                                        <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={cstSetCloseViewNoticeModal}>
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
                                                    <span className="dark-1 font-weight-semibold">Description:</span>
                                                </div>
                                                <div className="task-label-right">
                                                    <div dangerouslySetInnerHTML={{ __html: replaceSpecialCharacters(linkifyHtml(noticeData?.message && noticeData?.message !== undefined && noticeData?.message !== "undefined" ? noticeData?.message : '<p class="text-muted">No message for this notice</p>')).replaceAll("<a ", "<a rel='nofollow' target='_blank' ") }}></div>
                                                </div>
                                            </div>
                                            
                                            
                                        </SimpleBar>
                                    </div>
                                    <div className="right-content p-6 order-xl-2 order-1">
                                        <SimpleBar className="right-content-inner" id='right-content-inner'>
                                            <div className="task-content">
                                                <h3 className="d-xl-none mb-5">{noticeData?.name}</h3>
                                                <h4 className="mb-4">Notice Info
                                                </h4>
                                               
                                                <div className="task-content-list d-sm-flex align-items-center">
                                                    <div className="task-label-left">
                                                        <span className="font-14 dark-1 align-top font-weight-semibold">Created Date:</span>
                                                    </div>
                                                    <div className="task-label-right ms-sm-2">{moment(noticeData?.created_at).format(office_display_date_format_for_date)}</div>
                                                </div>

                                                <div className="task-content-list d-lg-flex align-items-center">
                                                    <div className="task-label-left mb-lg-0">
                                                        <span className="font-12 dark-1"><span className='font-weight-semibold'>Start Date:</span></span>
                                                    </div>
                                                    <div className="task-label-right ms-lg-2">
                                                        <span className="font-12 dark-1">{moment(noticeData?.start_date).format(office_display_date_format_for_date)}</span>
                                                    </div>
                                                </div>
                                                <div className="task-content-list d-lg-flex align-items-center">
                                                    <div className="task-label-left mb-lg-0">
                                                        <span className="font-12 dark-1"><span className='font-weight-semibold'>Due Date:</span></span>
                                                    </div>
                                                    <div className="task-label-right ms-lg-2">
                                                        <span className="font-12 dark-1">{noticeData.end_date !== null && moment(noticeData?.end_date).format(office_display_date_format_for_date)}</span>
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
                                        <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={cstSetCloseViewNoticeModal}>
                                            <i className="icon-cancel"></i>
                                        </button>
                                    </li>
                                </ul>
                            </Offcanvas.Header>
                            <Offcanvas.Body className="p-0">
                                <SimpleBar className="offcanvas-inner" id='offcanvas-inner'>
                                    <NoticeAccessDenied />
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
  
export default connect(mapStateToProps)(ViewNotice)