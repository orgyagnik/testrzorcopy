import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, Button, OverlayTrigger, Tooltip, Form } from 'react-bootstrap';
import APIService from "../../api/APIService";
import { pagination, databaseRoleCode } from '../../settings';
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import { format } from 'date-fns';
import Select from 'react-select';
import { connect } from "react-redux";
import RangeDatePickerControl from '../../modules/custom/RangeDatePickerControl';
import NoPermission from '../auth/NoPermission';
import { Link } from "react-router-dom";

function BucketTrackingReportByTask({ name, userData }) {
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
        let exportHeader = ["Task", "Project", "Hours"];
        let exportData = [];
        data?.map(item => {
            exportData.push(
                {
                    task_name: item.task_name ? item.task_name : '-',
                    project_name: item.project_name ? item.project_name : '-',
                    hours: item.total_task_hours ? item.total_task_hours : '00:00',
                });
            return '';
        });
        exportData.push(
            {
                task_name: '',
                project_name: 'Total Hours',
                hours: sumWorkingHours(data),
            });
        setExportData({ fileName: "bucket-tracking-report-by-task", sheetTitle: "Bucket Tracking Report", exportHeader: exportHeader, exportData: exportData });
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
        if (startDate && endDate) {
            params = params + "&startdate=" + format(startDate, "yyyy-MM-dd");
            params = params + "&enddate=" + format(endDate, "yyyy-MM-dd");
        }

        APIService.getBucketTrackingReportByTask(params)
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
        if (userData?.current_plan.includes("bucket") || (userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode)) {
            fetchProjectList();
            setFirstLoad(false);
        }
    }, [sort, sortby, page, perPageSize]);

    useEffect(() => {
        if (firstLoad === false && (userData?.current_plan.includes("bucket") || (userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode))) {
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
        if (userData?.current_plan.includes("bucket") || (userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode)) {
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
        }
    }, [agency]);

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
            if (list.task_id === data.task_id)
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
            Header: 'Task',
            id: 'task_name',
            accessor: (reportList) => reportList.task_name ? reportList.task_name : '-',
            Cell: ({ row }) => (
                <>
                    <Link to={`/view-task/${row?.original?.task_id}`} target="_blank">{row?.original?.task_name}</Link>
                </>
            ),
        },
        {
            Header: 'Project',
            id: 'project_name',
            accessor: (reportList) => reportList.project_name ? reportList.project_name : '-',
            Cell: ({ row }) => (
                <>
                    <Link to={`/project-detail/${row?.original?.project_id}`} target="_blank">{row?.original?.project_name}</Link>
                </>
            ),
        },
        {
            Header: 'Hours',
            disableSortBy: true,
            id: 'total_task_hours',
            accessor: (reportList) => reportList.total_task_hours,
        },
    ];

    if (userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.accountantCode || userData?.role_code === databaseRoleCode.pcCode) {
        columns = [
            ...columns,
            {
                Header: <>Billable Hours <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-hours`}>These are billable hours added by the developer</Tooltip>}>
                <i className="fa-solid fa-circle-info ms-1"></i>
                </OverlayTrigger></>,
                id: 'total_billable_hours',
                disableSortBy: true,
                accessor: (reportList) => reportList.total_billable_hours,
            }
        ];
    }

    const handleAgencySelect = (selectedAgency) => {
        setAgency(selectedAgency?.value);
    };

    const handleProjectSelect = (selectedProject) => {
        setProject(selectedProject?.value);
    };

    const handleFilter = async (e) => {
        setReloadPage(!reloadPage);
    };

    const handleClearFilter = async (e) => {
        setAgency(userData?.role_code === databaseRoleCode.agencyCode || userData?.role_code === databaseRoleCode.agencyMemberCode ? userData?.id : 0);
        setProject(0);
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

    const sumWorkingHours = (reportList) => {
        let totalHours = 0;
        reportList.forEach((row) => {
            if (row.total_task_hours !== '' && row.total_task_hours !== '00:00' && row.total_task_hours !== null && row.total_task_hours.includes(':') && !row.total_task_hours.includes('_')) {
                const [hoursPart, minutesPart] = row.total_task_hours.split(':');
                const numericHours = parseInt(hoursPart, 10);
                const numericMinutes = parseInt(minutesPart, 10) / 60;
                totalHours += numericHours + numericMinutes;
            }
        });
        const formattedHours = Math.floor(totalHours);
        const formattedMinutes = Math.round((totalHours - formattedHours) * 60);
        return `${formattedHours.toString().padStart(2, '0')}:${formattedMinutes.toString().padStart(2, '0')}`;
    };

    const sumBillableHours = (reportList) => {
        let totalHours = 0;
        reportList.forEach((row) => {
            if (row.total_billable_hours !== '' && row.total_billable_hours !== '00:00' && row.total_billable_hours !== null && row.total_billable_hours.includes(':') && !row.total_billable_hours.includes('_')) {
                const [hoursPart, minutesPart] = row.total_billable_hours.split(':');
                const numericHours = parseInt(hoursPart, 10);
                const numericMinutes = parseInt(minutesPart, 10) / 60;
                totalHours += numericHours + numericMinutes;
            }
        });
        const formattedHours = Math.floor(totalHours);
        const formattedMinutes = Math.round((totalHours - formattedHours) * 60);
        return `${formattedHours.toString().padStart(2, '0')}:${formattedMinutes.toString().padStart(2, '0')}`;
    };

    const TableFooter = () => {
        return (
            !tableLoader && reportList.length > 0 &&
            <tfoot>
                <tr>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th>Total Hours: {sumWorkingHours(reportList)}</th>
                    {(userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.accountantCode || userData?.role_code === databaseRoleCode.pcCode) && <th>Total Billable Hours: {sumBillableHours(reportList)}</th> }
                </tr>
            </tfoot>
        )
    };

    return (
        userData?.current_plan.includes("bucket") || (userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode) ?
            <>
                <Sidebar />
                <div className="main-content">
                    <Header pagename={name} headerFilterButton={<Button onClick={cstPageOffcanvasisShow} variant="outline-secondary" size="md" type="button" className='ms-auto d-xl-none d-block'>Filter <i className="icon-filter ms-2"></i></Button>} />
                    <div className="inner-content pt-0 px-0">
                        <div className="bg-white py-0 px-0 py-xl-3 px-xl-7 page-inner-header">
                            <div className={"custom-page-offcanvas " + (isPageOffcanvasisActive ? 'active' : '')}>
                                <div className='custom-page-offcanvas-header border-bottom border-gray-100 py-2 px-4 d-xl-none'>
                                    <h5 className='m-0'>Filter</h5>
                                    <Button type="button" variant="white" size='sm' className="btn-icon circle-btn btn" onClick={cstPageOffcanvasisHide}><i className="icon-cancel"></i></Button>
                                </div>
                                <div className='custom-page-offcanvas-body p-xl-0 p-4'>
                                    <Row className="g-2 g-xl-4 justify-content-md-end">
                                        <Col className="me-md-auto">
                                            <Link to="/bucket-tracking-report" onClick={() => {cstPageOffcanvasisHide();}} className='text-nowrap btn btn-primary btn-md'>Detailed Report</Link>
                                        </Col>
                                        {userData?.role_code !== databaseRoleCode.agencyCode && userData?.role_code !== databaseRoleCode.clientCode && userData?.role_code !== databaseRoleCode.agencyMemberCode &&
                                            <Col xl={3} sm={6}>
                                                <Select styles={customStyles} className="control-md custom-select" options={agencyList} onChange={handleAgencySelect}
                                                    value={agencyList.filter(function (option) {
                                                        return option.value === agency;
                                                    })} />
                                            </Col>
                                        }
                                        <Col xl={3} sm={6}>
                                            <Select styles={customStyles} className="control-md custom-select" options={projectList} onChange={handleProjectSelect}
                                                value={projectList.filter(function (option) {
                                                    return option.value === project;
                                                })} />
                                        </Col>
                                        <Col xl={3} sm={6}>
                                            <RangeDatePickerControl
                                                selected={startDate}
                                                startDate={startDate}
                                                endDate={endDate}
                                                onChange={onChangeDateRange}
                                            />
                                        </Col>
                                        <Col xl="auto" className='d-flex gap-2 flex-xl-row flex-row-reverse justify-content-lg-start justify-content-between '>
                                            <Button variant="primary" size="md" type="button" onClick={() => { handleFilter(); cstPageOffcanvasisHide(); }}>Search</Button>
                                            <OverlayTrigger placement='bottom' overlay={<Tooltip>Clear Filter</Tooltip>}>
                                                <Button variant="soft-secondary" size="md" type="button" onClick={() => { handleClearFilter() }}><span className="icon-cancel d-xl-inline-block d-none"></span> <span className='d-xl-none'>Clear Filter</span></Button>
                                            </OverlayTrigger>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </div>
                        <div className="pt-3 pt-xl-9 px-4 px-xl-7">
                            <Card className="rounded-10 p-6">
                                <Card.Body className="p-0">
                                    <DataTableWithPagination columns={columns} data={reportList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isBulkAction={false} exportData={exportData} TableFooter={TableFooter} />
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

export default connect(mapStateToProps)(BucketTrackingReportByTask)