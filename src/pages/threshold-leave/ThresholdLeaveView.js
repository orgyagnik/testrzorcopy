import React, { useState, useEffect } from 'react';
import { Offcanvas, OverlayTrigger, Tooltip } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { office_display_date_format_for_date, databaseRoleCode } from '../../settings';
import moment from 'moment';
import { check } from "../../utils/functions.js";
import ThresholdLeaveAccessDenied from './ThresholdLeaveAccessDenied';

function ThresholdLeaveView({ userData, name, showViewThresholdLeaveModal, setShowViewThresholdLeaveModal, handleThresholdLeaveEdit, thresholdId, handleThresholdLeaveDelete, reloadPage, setReloadPage }) {
   
    const [thresholdData, setThresholdData] = useState(null);
    const [updateThresholdCount, setUpdateThresholdCount] = useState(false);
    const cstSetCloseViewThresholdModal = () => {
        setShowViewThresholdLeaveModal(false);
        window.history.replaceState(null, '', `/threshold-leave-setting`);        
        if (updateThresholdCount) {
            setReloadPage(!reloadPage);
        }
        setUpdateThresholdCount(false);
        setTimeout(() => {
            setThresholdData(null);
        }, 500);
    };

    useEffect(() => {
        if (showViewThresholdLeaveModal) {
            APIService.getThresholdLeaveForEdit(thresholdId)
                .then((response) => {
                    if (response.data?.status) {
                        let data = response.data?.data;
                        setThresholdData(data);
                    }
                });
        }
    }, [showViewThresholdLeaveModal, thresholdId]);
        
  
    return (
        <>
            {thresholdData &&
                <Offcanvas show={showViewThresholdLeaveModal} onHide={cstSetCloseViewThresholdModal} enforceFocus={false} className="add-task-sidebar edit-task-sidebar" placement="end">
                    {thresholdData?.id ?
                        <>
                            <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
                                <div className="d-flex align-items-center">
                                    <h2 className='mb-0 d-xl-block d-none'>{thresholdData?.name}</h2>
                                </div>
                                <ul className="ovrlay-header-icons">
                                    {check(['ticket_system.update'], userData?.role.getPermissions) && (userData?.role_code === databaseRoleCode.adminCode || (thresholdData?.added_by === userData?.id)) ?
                                        <li>
                                            <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-threshold-link`}> Edit</Tooltip>}>
                                                <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={() => { handleThresholdLeaveEdit(thresholdData?.id); }}>
                                                    <i className="icon-edit"></i>
                                                </button>
                                            </OverlayTrigger>
                                        </li>
                                        : ''}
                                    {check(['ticket_system.delete'], userData?.role.getPermissions) && (userData?.role_code === databaseRoleCode.adminCode || (thresholdData?.added_by === userData?.id)) ?
                                        <li>
                                            <OverlayTrigger placement="bottom" overlay={<Tooltip id={`delete-threshold-link`}> Delete</Tooltip>}>
                                                <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={() => { handleThresholdLeaveDelete(thresholdData?.id) }}>
                                                    <i className="icon-delete text-danger"></i>
                                                </button>
                                            </OverlayTrigger>
                                        </li>
                                        : ''}
                                    <li>
                                        <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={cstSetCloseViewThresholdModal}>
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
                                                        <span className="dark-1 font-weight-semibold">Designation Name:</span>
                                                    </div>
                                                    <div className="task-label-right">
                                                        {thresholdData?.designation_name}
                                                    </div>
                                                    <br/>

                                                    <div className="task-label-left mb-lg-2">
                                                        <span className="dark-1 font-weight-semibold">Percentage:</span>
                                                    </div>
                                                    <div className="task-label-right">
                                                        {thresholdData?.percentage}%
                                                    </div>
                                                    <br/>

                                                    <div className="task-label-left mb-lg-2">
                                                        <span className="dark-1 font-weight-semibold">Added By Name:</span>
                                                    </div>
                                                    <div className="task-label-right">
                                                        {thresholdData?.addedby_name}
                                                    </div>
                                                    <br/>

                                                    <div className="task-label-left mb-lg-2">
                                                        <span className="dark-1 font-weight-semibold">Created Date:</span>
                                                    </div>
                                                    <div className="task-label-right">
                                                    {moment(thresholdData?.created_at).format(office_display_date_format_for_date)}
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
                                        <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={cstSetCloseViewThresholdModal}>
                                            <i className="icon-cancel"></i>
                                        </button>
                                    </li>
                                </ul>
                            </Offcanvas.Header>
                            <Offcanvas.Body className="p-0">
                                <SimpleBar className="offcanvas-inner" id='offcanvas-inner'>
                                    <ThresholdLeaveAccessDenied />
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

export default connect(mapStateToProps)(ThresholdLeaveView)