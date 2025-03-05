import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, Button, OverlayTrigger, Tooltip, Form } from 'react-bootstrap';
import APIService from "../../api/APIService";
import moment from 'moment';
import { pagination, databaseRoleCode, subscription_display_date_format } from '../../settings';
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import { format } from 'date-fns';
import Select from 'react-select';
import { connect } from "react-redux";
import RangeDatePickerControl from '../../modules/custom/RangeDatePickerControl';
import NoPermission from '../auth/NoPermission';
import { Link } from "react-router-dom";

function TimeTrackingReport({ name, userData }) {
    const [firstLoad, setFirstLoad] = useState(true);
    const [page, setPage] = useState(1);
    const [reportList, setReportList] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchFilter, setSearchFilter] = useState('');
    const [sort, setSort] = useState("desc");
    const [sortby, setSortBy] = useState("id");
    const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
    const [exportData, setExportData] = useState([]);
    const [agencyList, setAgencyList] = useState([]);
    const [agency, setAgency] = useState(userData?.role_code === databaseRoleCode.agencyCode || userData?.role_code === databaseRoleCode.agencyMemberCode ? userData?.id : 0);
    const [projectList, setProjectList] = useState([]);
    const [project, setProject] = useState(0);
    const [taskList, setTaskList] = useState([]);
    const [task, setTask] = useState(0);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [reloadPage, setReloadPage] = useState(false);
    const [tableLoader, setTableLoader] = useState(false);
    const [pageDesignRefresh, setPageDesignRefresh] = useState(true);

    const customStyles = {
        option: (styles, state) => ({
            ...styles,
            cursor: 'pointer',
        }),
        control: (styles) => ({
            ...styles,
            cursor: 'pointer',
        }),
    };

    const prepareExportData = (data) => {
        let exportHeader = ["Date", "Task", "Project", "Hours"];
        let exportData = [];
        data?.map(item => {
            exportData.push(
                {
                    date: item.dateadded ? moment(new Date(item.dateadded)).format(subscription_display_date_format) : '',
                    task_name: item.task_name ? item.task_name : '-',
                    project_name: item.project_name ? item.project_name : '-',
                    hours: item.dev_logged_hours ? item.dev_logged_hours : '',
                });
            return '';
        });
        setExportData({ fileName: "time-tracking-report", sheetTitle: "Time Tracking Report", exportHeader: exportHeader, exportData: exportData });
    }

    const fetchProjectList = () => {
        setTableLoader(true);
        let params = "?";
        params = params + "sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby;
        if (searchFilter !== '') {
            params = params + "&search=" + searchFilter;
        }
        if (agency !== 0) {
            params = params + "&search_by_agency=" + agency;
        }
        if (project !== 0) {
            params = params + "&search_by_project=" + project;
        }
        if (task !== 0) {
            params = params + "&search_by_task=" + task;
        }
        if (startDate && endDate) {
            params = params + "&startdate=" + format(startDate, "yyyy-MM-dd");
            params = params + "&enddate=" + format(endDate, "yyyy-MM-dd");
        }

        APIService.getDevTrackingReport(params)
            .then((response) => {
                if (response.data?.status) {
                    setTotalPages(response.data?.pagination?.total_pages);
                    setTotalRecords(response.data?.pagination?.total_records);
                    let newData = response.data?.data;
                    setReportList(newData);
                    prepareExportData(newData);
                }
                else {
                    setReportList([]);
                    setExportData([]);
                }
                setTableLoader(false);
            });
    }

    useEffect(() => {
        if (userData?.current_plan.includes("dev-personalized-addon") || (userData.role_code !== databaseRoleCode.clientCode)) {
            fetchProjectList();
            setFirstLoad(false);
        }
    }, [sort, sortby, page, perPageSize]);

    useEffect(() => {
        if (firstLoad === false && (userData?.current_plan.includes("dev-personalized-addon") || (userData.role_code !== databaseRoleCode.clientCode))) {
            setPage(1);
            if (page === 1) {
                const timer = setTimeout(() => {
                    fetchProjectList();
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [searchFilter, reloadPage]);

    useEffect(() => {
        if (userData?.role_code !== databaseRoleCode.agencyCode && userData?.role_code !== databaseRoleCode.clientCode && userData?.role_code !== databaseRoleCode.agencyMemberCode) {
            APIService.getAllAgency()
                .then((response) => {
                    if (response.data?.status) {
                        let newAgencyList = response.data?.data.map(item => {
                            return { label: item.agency_name, value: item.staffid }
                        });
                        setAgencyList([{ label: 'All Agency', value: 0 }, ...newAgencyList]);
                    }
                });
        }
    }, []);

    useEffect(() => {
        let params = "";
        if (agency !== 0) {
            params = "?search_by_agency=" + agency;
        }
        APIService.getAllProjects(params)
            .then((response) => {
                if (response.data?.status) {
                    let newProjectList = response.data?.data.map(item => {
                        return { label: item.name, value: item.id }
                    });
                    setProjectList([{ label: 'All Project', value: 0 }, ...newProjectList]);
                }
            });
    }, [agency]);

    useEffect(() => {
        let params = "";
        if (project !== 0) {
            params = "?project_id=" + project;
        }
        APIService.getAllTask(params)
            .then((response) => {
                if (response.data?.status) {
                    let newTaskList = response.data?.data.map(item => {
                        return { label: `${item.task_name} - (${item.task_id})`, value: item.task_id }
                    });
                    setTaskList([{ label: 'All Task', value: 0 }, ...newTaskList]);
                }
            });
    }, [project]);

    useEffect(() => {
    }, [pageDesignRefresh]);

    const onSelectAllCheck = (e) => {
        let tempList = reportList;
        if (e.target.checked) {
            tempList.forEach(list => {
                list.selected = true;
            });
        }
        else {
            tempList.forEach(list => {
                list.selected = false;
            });
        }
        setReportList(tempList);
        setPageDesignRefresh(!pageDesignRefresh);
        prepareExportData(tempList);
    }

    const onItemCheck = (e, data) => {
        let tempList = reportList;
        let selectedChk = e.target;
        tempList.forEach(list => {
            if (list.id === data.id)
                list.selected = selectedChk.checked;
        });
        setReportList(tempList);
        setPageDesignRefresh(!pageDesignRefresh);

        //for selected task export
        if (reportList.filter(function (arr) { return arr.selected === true; }).length > 0) {
            let tempListNew = reportList.filter(function (arr) { return arr.selected === true; });
            prepareExportData(tempListNew);
        }
        else {
            prepareExportData(tempList);
        }
    }

    let columns = [
        {
            Header: () => (
                <>
                    <Form.Check className="d-flex align-items-center form-check-md mb-0" checked={reportList.length > 0 && reportList.length === reportList.filter(function (arr) { return arr.selected === true; }).length} onChange={(e) => onSelectAllCheck(e)} />
                </>
            ),
            id: 'select_all',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <Form.Check className="d-flex align-items-center form-check-md mb-0" checked={row?.original?.selected} onChange={(e) => onItemCheck(e, row?.original)} />
                </>
            ),
        },
        {
            Header: 'Date',
            id: 'dateadded',
            accessor: (reportList) => reportList.dateadded ? moment(new Date(reportList.dateadded)).format(subscription_display_date_format) : '',
        },
        {
            Header: 'Task',
            id: 'task_name',
            accessor: (reportList) => reportList.task_name ? reportList.task_name : '-',
            Cell: ({ row }) => (
                <>
                    <Link to={`/view-task/${row?.original?.taskid}`} target="_blank">{row?.original?.task_name}</Link>
                </>
            ),
        },
        {
            Header: 'Project',
            id: 'project_name',
            accessor: (reportList) => reportList.project_name ? reportList.project_name : '-',
            Cell: ({ row }) => (
                <>
                    <Link to={`/project-detail/${row?.original?.rel_id}`} target="_blank">{row?.original?.project_name}</Link>
                </>
            ),
        },
        {
            Header: <>Logged Hours <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-hours`}>These are dev logged hours added by the project coordinator</Tooltip>}>
                <i className="fa-solid fa-circle-info ms-1"></i>
            </OverlayTrigger></>,
            id: 'dev_logged_hours',
            accessor: (reportList) => reportList.dev_logged_hours > '00:00' ? reportList.dev_logged_hours : '-',
        }
    ];

    if (userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.accountantCode || userData?.role_code === databaseRoleCode.pcCode) {
        columns = [
            ...columns,
            {
                Header: <>Billable Hours <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-hours`}>These are billable hours added by the developer</Tooltip>}>
                <i className="fa-solid fa-circle-info ms-1"></i>
                </OverlayTrigger></>,
                id: 'billable_hours',
                accessor: (reportList) => reportList.billable_hours > '00:00' ? reportList.billable_hours : '-',
            }
        ];
    }

    const handleAgencySelect = (selectedAgency) => {
        setAgency(selectedAgency?.value);
    };

    const handleProjectSelect = (selectedProject) => {
        setProject(selectedProject?.value);
    };

    const handleTaskSelect = (selectedTask) => {
        setTask(selectedTask?.value);
    };

    const handleFilter = async (e) => {
        setReloadPage(!reloadPage);
    };

    const handleClearFilter = async (e) => {
        setAgency(userData?.role_code === databaseRoleCode.agencyCode || userData?.role_code === databaseRoleCode.agencyMemberCode ? userData?.id : 0);
        setProject(0);
        setTask(0);
        setStartDate(null);
        setEndDate(null);
        setSearchFilter('');
        setReloadPage(!reloadPage);
    };

    const onChangeDateRange = dates => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    }

    const [isPageOffcanvasisActive, setIsPageOffcanvasisActive] = useState(false);
    const cstPageOffcanvasisShow = () => {
        setIsPageOffcanvasisActive(true);
        document.body.style.overflow = 'hidden';
    };
    const cstPageOffcanvasisHide = () => {
        setIsPageOffcanvasisActive(false);
        document.body.style.overflow = '';
    };

    return (
        userData?.current_plan.includes("dev-personalized-addon") || (userData.role_code !== databaseRoleCode.clientCode) ?
            <>
                <Sidebar />
                <div className="main-content">
                    <Header pagename={name} headerFilterButton={<Button onClick={cstPageOffcanvasisShow} variant="outline-secondary" size="md" type="button" className='ms-auto d-xl-none d-block'>Filter <i className="icon-filter ms-2"></i></Button>} />
                    <div className="inner-content pt-0 px-0">
                        <div className="bg-white py-0 px-0 py-xl-3 px-lg-7 page-inner-header">
                            <div className={"custom-page-offcanvas " + (isPageOffcanvasisActive ? 'active' : '')}>
                                <div className='custom-page-offcanvas-header border-bottom border-gray-100 py-2 px-4 d-xl-none'>
                                    <h5 className='m-0'>Filter</h5>
                                    <Button type="button" variant="white" size='sm' className="btn-icon circle-btn btn" onClick={cstPageOffcanvasisHide}><i className="icon-cancel"></i></Button>
                                </div>
                                <div className='custom-page-offcanvas-body p-xl-0 p-4'>
                                    <Row className="g-2 g-xl-4 justify-content-xl-end">
                                        <Col xs={6} xl="auto" className="me-xl-auto">
                                            <Link to="/time-tracking-report-by-task" className='text-nowrap btn btn-primary btn-md'>Summary Report</Link>
                                            <Link to="/time-tracking-report-by-project" className='ms-3 text-nowrap btn btn-primary btn-md'>Project Report</Link>
                                        </Col>                                        
                                        <Col xs={12} className='d-xl-none d-block'>
                                            <hr className='m-0' />
                                        </Col>
                                        {userData?.role_code !== databaseRoleCode.agencyCode && userData?.role_code !== databaseRoleCode.clientCode && userData?.role_code !== databaseRoleCode.agencyMemberCode &&
                                            <Col xxl={2} xl={2} sm={6}>
                                                <Select styles={customStyles} className="control-md custom-select" options={agencyList} onChange={handleAgencySelect}
                                                    value={agencyList.filter(function (option) {
                                                        return option.value === agency;
                                                    })} />
                                            </Col>
                                        }
                                        <Col xxl={2} xl={2} sm={6}>
                                            <Select styles={customStyles} className="control-md custom-select" options={projectList} onChange={handleProjectSelect}
                                                value={projectList.filter(function (option) {
                                                    return option.value === project;
                                                })} />
                                        </Col>
                                        <Col xxl={2} xl={2} sm={6}>
                                            <Select styles={customStyles} className="control-md custom-select" options={taskList} onChange={handleTaskSelect}
                                                value={taskList.filter(function (option) {
                                                    return option.value === task;
                                                })} />
                                        </Col>
                                        <Col xxl={2} xl={2} sm={6}>
                                            <RangeDatePickerControl
                                                selected={startDate}
                                                startDate={startDate}
                                                endDate={endDate}
                                                onChange={onChangeDateRange}
                                            />
                                        </Col>
                                        <Col xs={12} className='mt-4 d-xl-none d-block'>
                                            <hr className='m-0' />
                                        </Col>
                                        <Col xl="auto" className='d-flex gap-2 flex-xl-row flex-row-reverse justify-content-lg-start justify-content-between '>
                                            <Button variant="primary" size="md" type="button" onClick={() => { handleFilter() }}>Search</Button>
                                            <OverlayTrigger placement='bottom' overlay={<Tooltip>Clear Filter</Tooltip>}>
                                                <Button variant="soft-secondary" size="md" type="button" onClick={() => { handleClearFilter() }}><span className="icon-cancel d-xl-inline-block d-none"></span> <span className='d-xl-none'>Clear Filter</span></Button>
                                            </OverlayTrigger>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </div>
                        <div className="pt-0 pt-xl-5 pt-xl-9 px-0 px-lg-4 px-xl-7">
                            <Card className="rounded-10 p-4 p-xl-6">
                                <Card.Body className="p-0">
                                    <DataTableWithPagination columns={columns} data={reportList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isBulkAction={false} exportData={exportData} />
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                    <Footer />
                </div>
            </>
            :
            <NoPermission />
    );
}

const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(TimeTrackingReport)