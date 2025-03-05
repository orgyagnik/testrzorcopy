import React, { useState, useEffect } from 'react';
import { Offcanvas, Badge } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import ReportAccessDenied from './ReportAccessDenied';
import { office_display_date_format, office_display_date_format_with_time } from '../../settings';
import { format } from 'date-fns';
import { replaceSpecialCharacters } from "../../utils/functions.js";
import linkifyHtml from 'linkify-html';
import { Link } from "react-router-dom";

function ViewWorkReport({ userData, showViewWorkReportModal, setShowViewWorkReportModal, reportId , defaultURL = '/work-report'}) {
    const [workReportData, setWorkReportData] = useState(null);
    const cstSetCloseViewWorkReportModal = () => {
        setShowViewWorkReportModal(false);
        window.history.replaceState(null, '', defaultURL);
        setTimeout(() => {
            setWorkReportData(null);
        }, 500);
    };

    useEffect(() => {
        if (showViewWorkReportModal) {
            APIService.viewWorkReportById(reportId)
                .then((response) => {
                    if (response.data?.status) {
                        let data = response.data?.data;
                        setWorkReportData(data);
                    }
                });
        }
    }, [showViewWorkReportModal, reportId]);

    return (
        <>
            {workReportData &&
                <Offcanvas show={showViewWorkReportModal} onHide={cstSetCloseViewWorkReportModal} className="add-task-sidebar" placement="end">
                    {workReportData?.id ?
                        <>
                            <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
                                <div className="work-report-detail-title d-flex align-items-center order-xl-1 order-1">
                                    <h3 className='me-auto mb-0'>{workReportData?.addedby_name} : {workReportData?.report_date && format(new Date(workReportData?.report_date), office_display_date_format)} {workReportData?.save_as_draft === 1 && <span className='text-danger'>[Draft]</span>} {workReportData?.early_punchout === 1 && <span className='text-danger'>[Early Punch-Out]</span>}</h3>
                                </div>
                                <ul className="ovrlay-header-icons ms-md-auto order-xl-2 order-3">
                                    <li>
                                        Date Added: {workReportData?.created_at && format(new Date(workReportData?.created_at), office_display_date_format_with_time)}
                                    </li>
                                    <li>
                                        Total Hours: {workReportData?.total_hours}
                                    </li>
                                    <li>
                                        {workReportData?.working_day === 'half_day' ?
                                            <Badge bg="warning" className="font-weight-semibold font-12 badge-sm">Half Day</Badge>
                                            :
                                            <Badge bg="success" className="font-weight-semibold font-12 badge-sm">Full Day</Badge>
                                        }
                                    </li>
                                </ul>
                                <button type="button" className="btn-icon circle-btn btn btn-white btn-sm ms-md-4 order-xl-3 order-2" onClick={cstSetCloseViewWorkReportModal}>
                                    <i className="icon-cancel"></i>
                                </button>
                            </Offcanvas.Header>
                            <Offcanvas.Body className="p-6">
                                <SimpleBar className="offcanvas-inner">
                                    {workReportData?.work_data?.map((row) => (
                                        <div key={row.id} className="work-report-row d-flex flex-md-nowrap flex-wrap border-bottom border-gray-100">
                                            <div className="work-report-left">
                                                <div className="work-report-list d-flex mb-3">
                                                    <div className="work-report-list-title font-16 font-weight-semibold">
                                                        <span>Working Hours:</span>
                                                    </div>
                                                    <div className="work-report-list-detail font-16 ms-1">
                                                        <span>{row?.working_hours}</span>
                                                    </div>
                                                </div>
                                                <div className="work-report-list d-flex mb-3">
                                                    <div className="work-report-list-title font-16 font-weight-semibold">
                                                        <span>Status:</span>
                                                    </div>
                                                    <div className="work-report-list-detail font-16 ms-1">
                                                        <span>{row?.status_name}</span>
                                                    </div>
                                                </div>
                                                <div className="work-report-list d-flex mb-3">
                                                    <div className="work-report-list-title font-16 font-weight-semibold">
                                                        <span>Deadline Match:</span>
                                                    </div>
                                                    <div className="work-report-list-detail font-16 ms-1">
                                                        <span>{row?.deadline_match}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="work-report-right">
                                                <div className="work-report-list d-flex mb-3">
                                                    <div className="work-report-list-title font-16 font-weight-semibold">
                                                        <span>Project:</span>
                                                    </div>
                                                    <div className="work-report-list-detail font-16 ms-1">
                                                        {row?.project_id !== 0 ?
                                                            <Link to={`/project-detail/${row.project_id}`} target="_blank">{row?.project_name}</Link>
                                                            :
                                                            <span>Other</span>
                                                        }
                                                    </div>
                                                </div>
                                                <div className="work-report-list d-flex mb-3">
                                                    <div className="work-report-list-title font-16 font-weight-semibold">
                                                        <span>Task:</span>
                                                    </div>
                                                    <div className="work-report-list-detail font-16 ms-1">
                                                        {row?.task_id !== 0 ?
                                                            <Link to={row?.task_type === 1 ? `/view-site-addons-task/${row.task_id}` : `/view-task/${row.task_id}`} target="_blank">{row?.task_name}</Link>
                                                            :
                                                            <span>{row?.task_name}</span>
                                                        }
                                                    </div>
                                                </div>
                                                {row?.deadline_match !== 'On Time' ?
                                                    <div className="work-report-list d-flex mb-3">
                                                        <div className="work-report-list-title font-16 font-weight-semibold">
                                                            <span>Reason:</span>
                                                        </div>
                                                        <div className="work-report-list-detail font-16 ms-1">                                                            
                                                            <span>{row?.reason}</span>
                                                        </div>
                                                    </div>
                                                    : ''
                                                }

                                                {row?.task_id === 0 || row?.task_id === '' ?
                                                    <div className="work-report-content mt-4">
                                                        <h5 className="font-16 font-weight-semibold mb-2">Description:</h5>
                                                        <div dangerouslySetInnerHTML={{ __html: replaceSpecialCharacters(linkifyHtml(row?.description && row?.description !== undefined && row?.description !== "undefined" ? row?.description : '<p class="text-muted">No description for this task</p>')).replaceAll("<a ", "<a rel='nofollow' target='_blank' ") }}></div>
                                                    </div>
                                                : ''}
                                            </div>
                                        </div>
                                    ))}
                                </SimpleBar>
                            </Offcanvas.Body>
                        </>
                        :
                        <>
                            <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
                                <div className="d-flex align-items-center"><h2 className='mb-0'>Access Denied</h2></div>
                                <ul className="ovrlay-header-icons">
                                    <li>
                                        <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={cstSetCloseViewWorkReportModal}>
                                            <i className="icon-cancel"></i>
                                        </button>
                                    </li>
                                </ul>
                            </Offcanvas.Header>
                            <Offcanvas.Body className="p-0">
                                <SimpleBar className="offcanvas-inner" id='offcanvas-inner'>
                                    <ReportAccessDenied />
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

export default connect(mapStateToProps)(ViewWorkReport)