import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, Button, Form, OverlayTrigger, Tooltip, Dropdown } from 'react-bootstrap';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { pagination, office_display_date_format_for_date, office_display_date_format_with_time, leaveStatusList, popperConfig } from '../../settings';
import moment from 'moment';
import { getLeaveStatus, getLeaveOnlyStatus, check } from "../../utils/functions.js";
import { databaseRoleCode } from '../../settings';
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import SingleDatePickerControl from '../../modules/custom/SingleDatePicker';
import { toast } from 'react-toastify';
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import { confirmAlert } from 'react-confirm-alert';
import { format } from 'date-fns';
import { Link } from "react-router-dom";
import ReadMoreReadLess from "../../modules/custom/ReadMoreReadLess";

function TodayLeaves({ userData, name }) {
    const [firstLoad, setFirstLoad] = useState(true);
    const [date, setDate] = useState(moment()._d);
    const [leaveList, setLeaveList] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchFilter, setSearchFilter] = useState('');
    const [sort, setSort] = useState(userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.hrCode ? 'asc' : pagination.sorting);
    const [sortby, setSortBy] = useState(userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.hrCode ? 'status' : 'ticketid');
    const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordForLeave);
    const [pageDesignRefresh, setPageDesignRefresh] = useState(true);
    const [exportData, setExportData] = useState([]);
    const [tableLoader, setTableLoader] = useState(false);
    let leaveStatusNote = useRef();

    useEffect(() => {
        fetchLeaveList();
        setFirstLoad(false);
    }, [sort, sortby, page, perPageSize, pageDesignRefresh]);

    useEffect(() => {
        if (firstLoad === false) {
            setPage(1);
            if (page === 1) {
                const timer = setTimeout(() => {
                    fetchLeaveList();
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [searchFilter, date]);

    const fetchLeaveList = () => {
        setTableLoader(true);
        let params = "?";
        params = params + "sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby;
        if (searchFilter !== '') {
            params = params + "&search=" + searchFilter;
        }
        if (date !== 0) {
            params = params + "&approved_date=" + format(date, "yyyy-MM-dd");
        }

        APIService.getTodayApprovedLeaveLists(params)
            .then((response) => {
                if (response.data?.status) {
                    setTotalPages(response.data?.pagination?.total_pages);
                    setTotalRecords(response.data?.pagination?.total_records);
                    let newData = response.data?.data;
                    setLeaveList(newData);
                    setTableLoader(false);

                    let exportHeader = ["#", "Employee", "Start Date", "End Date", "Total Days", "Reason", "Status", "Leave Type", "Date Added"];
                    let exportData = [];
                    newData?.map(item => {
                        exportData.push(
                            {
                                ticketid: item.ticketid,
                                empname: item.empname,
                                startdate: item.startdate ? moment(item.startdate).format(office_display_date_format_for_date) : '',
                                enddate: item.enddate ? moment(item.enddate).format(office_display_date_format_for_date) : '',
                                totaldays: item.totaldays,
                                message: item.message,
                                status: getLeaveOnlyStatus(item?.status),
                                leave_type: item.leave_type,
                                dateadded: item.dateadded ? format(new Date(item.dateadded), office_display_date_format_with_time) : '',
                            });
                        return '';
                    });
                    setExportData({ fileName: "leave-data", sheetTitle: "Leaves", exportHeader: exportHeader, exportData: exportData });
                }
            });
    }

    let columns = [
        {
            Header: '#',
            id: 'ticketid',
            accessor: (row) => (
                <>
                    <span>{row?.ticketid}</span>
                </>
            )
        },
        {
            Header: 'Employee',
            id: 'empname',
            accessor: (row) => (
                <>
                    <span>{row?.empname}</span>
                </>
            )
        },
        {
            Header: 'Reason',
            id: 'leave_reason',
            accessor: (row) => (
                <ReadMoreReadLess longText={row?.message} />
            ),
            disableSortBy: true,
        },
        {
            Header: 'Status',
            id: 'status',
            accessor: (row) => <>
                {getLeaveStatus(row?.status)}
            </>,
        },
        {
            Header: 'Leave Type',
            id: 'leave_type',
            accessor: (row) => row?.leave_type,
        },
        {
            Header: 'Total Days',
            id: 'totaldays',
            accessor: (row) => row?.totaldays,
        },
        {
            Header: 'Start Date',
            id: 'startdate',
            accessor: (row) => row?.startdate && moment(new Date(row?.startdate)).format(office_display_date_format_for_date),
        },
        {
            Header: 'End Date',
            id: 'enddate',
            accessor: (row) => row?.enddate && moment(new Date(row?.enddate)).format(office_display_date_format_for_date),
        },
        {
            Header: 'Date Applied',
            id: 'dateadded',
            //accessor: (row) => row?.dateadded && moment(new Date(row?.dateadded)).format(display_date_format_with_time),
            accessor: (row) => row?.dateadded && format(new Date(row?.dateadded), office_display_date_format_with_time),
        },
    ];

    if (userData?.role_code === databaseRoleCode.adminCode) {
        columns = [
            ...columns,
            {
                Header: 'Action By',
                id: 'approvebyname',
                accessor: (row) => (
                    <>
                        {row?.approvebyname}
                        {row?.note !== '' &&
                            <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-note-${row?.ticketid}`}>{row?.note}</Tooltip>}>
                                <i className="fa-solid fa-circle-info ms-1"></i>
                            </OverlayTrigger>
                        }
                    </>
                )
            },
        ];
    }

    if (check(['leaves.update'], userData?.role.getPermissions)) {
        columns = [
            ...columns,
            {
                Header: 'Action',
                disableSortBy: true,
                accessor: (row) => (
                    <>
                        {(row?.status === 1 || userData?.role_code === databaseRoleCode.adminCode) &&
                            <Dropdown className="category-dropdown edit-task-dropdown">
                                <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="cursor-pointer" id="edit-task"><button size="sm" className='btn btn-white circle-btn btn-icon btn-sm'><i className="fa-solid fa-ellipsis-vertical"></i></button></Dropdown.Toggle>
                                <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2" popperConfig={popperConfig}>
                                    {leaveStatusList?.filter(function (arr) { return arr.value !== row?.status; }).map((leaveStatus, index) => (
                                        <PermissionCheck permissions={['leave_status.update']} key={index}>
                                            <Dropdown.Item onClick={() => { handleLeaveStatus(row?.ticketid, leaveStatus.value) }}>
                                                Mark as {leaveStatus.label}
                                            </Dropdown.Item>
                                        </PermissionCheck>
                                    ))
                                    }
                                </Dropdown.Menu>
                            </Dropdown>
                        }
                    </>
                ),
            },
        ]
    }

    const CustomUI = ({ onClose, params }) => {

        const handleSubmitStatusNote = () => {
            params["note"] = leaveStatusNote?.current?.value ? leaveStatusNote?.current?.value : '';
            updateLeaveStatus(params);
            onClose();
        };

        return (
            <div className="react-confirm-alert">
                <div className="react-confirm-alert-body">
                    <h1>Confirm</h1>
                    {/* {plan_type === 'Monthly' ? CANCEL_MONTHLY_SUBSCRIPTION : CANCEL_YEARLY_SUBSCRIPTION} */}
                    <Form.Group className="mb-5 mt-3 w-100">
                        <Form.Label className='float-start'>Note</Form.Label>
                        <Form.Control as="textarea" rows={3} placeholder="Enter Note" ref={leaveStatusNote} className={`form-control`} maxLength={300} />
                    </Form.Group>
                    <div className="react-confirm-alert-button-group">
                        <button className="btn btn-primary btn-lg" label="Confirm" onClick={(e) => { handleSubmitStatusNote(); }}>Submit</button>
                        <button className="btn btn-outline-secondary btn-lg" label="No" onClick={onClose}>No</button>
                    </div>
                </div>
            </div>
        );
    };

    const handleLeaveStatus = async (ticketid, status) => {
        let params = {};
        params["ticketid"] = ticketid;
        params["status"] = status;
        if (userData?.role_code === databaseRoleCode.adminCode) {
            updateLeaveStatus(params);
        }
        else {
            confirmAlert({
                customUI: ({ onClose }) => {
                    return <CustomUI onClose={onClose} params={params} />
                }
            });
        }
    };

    const updateLeaveStatus = async (params) => {
        APIService.updateLeaveStatus(params)
            .then((response) => {
                if (response.data?.status) {
                    setPageDesignRefresh(!pageDesignRefresh);
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

    const handleClearFilter = async (e) => {
        setDate(moment()._d);
    };

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <Header pagename={name} />
                <div className="inner-content pt-0 px-0">
                    <div className="leave-page">
                        <div className="bg-white py-3 px-4 px-lg-7 page-inner-header">
                            <Row className="g-2 g-xl-4">
                                <Col xl={2} lg={2} md={2} className="me-md-auto">
                                    <Link to={'/leaves'} className='text-nowrap ms-2 btn btn-primary btn-md'>Leave List</Link>
                                </Col>
                                <Col xxl={2} xl={3} lg={3} md={3} sm={6}>
                                    <SingleDatePickerControl
                                        selected={date}
                                        onDateChange={(date) => setDate(date)}
                                        onChange={(date) => setDate(date)}
                                        className={`form-control control-md`}
                                    />
                                </Col>
                                <Col md="auto" sm={12}>
                                    <OverlayTrigger placement='bottom' overlay={<Tooltip>Clear Filter</Tooltip>}>
                                        <Button variant="soft-secondary" size="md" type="button" onClick={() => { handleClearFilter() }}><span className="icon-cancel"></span></Button>
                                    </OverlayTrigger>
                                </Col>
                            </Row>
                        </div>
                        <div className="pt-9 px-4 px-lg-7">
                            <Card className="rounded-10 p-6">
                                <Card.Body className="p-0 leave-table">
                                    <DataTableWithPagination columns={columns} data={leaveList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isBulkAction={false} exportData={exportData} CustomclassName="leave-list-table" />
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}
const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(TodayLeaves)