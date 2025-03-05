import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { connect } from "react-redux";
import NoPermission from '../auth/NoPermission';
import { databaseRoleCode, display_date_format, pagination } from '../../settings';
import moment from 'moment';
import { Col, Row, Button, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import APIService from "../../api/APIService";
import RangeDatePickerControl from '../../modules/custom/RangeDatePickerControl';
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import { format } from 'date-fns';

function HourlyReport({ name, userData }) {
    const [startDate, setStartDate] = useState(moment().startOf('month')._d);
    const [endDate, setEndDate] = useState(moment(moment().endOf('month').format('YYYY-MM-DD'))._d);
    const [firstLoad, setFirstLoad] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchFilter, setSearchFilter] = useState('');
    const [sort, setSort] = useState("desc");
    const [sortby, setSortBy] = useState("id");
    const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
    const [hourList, setHourList] = useState([]);
    const [reloadPage, setReloadPage] = useState(false);

    const [exportData, setExportData] = useState([]);
    const [tableLoader, setTableLoader] = useState(false);

    useEffect(() => {
        if (userData.role_code === databaseRoleCode.adminCode || userData.role_code === databaseRoleCode.accountantCode) {
            fetchHourList();
            setFirstLoad(false);
        }
    }, [sort, sortby, page, perPageSize]);

    useEffect(() => {
        if (firstLoad === false) {
            setPage(1);
            if (page === 1) {
                const timer = setTimeout(() => {
                    fetchHourList();
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [searchFilter, reloadPage]);

    const fetchHourList = () => {
        setTableLoader(true);
        let params = "?limit=" + perPageSize + "&page=" + page + "&sort=" + sort + "&sort_by=" + sortby;
        if (startDate && endDate) {
            params = params + "&startdate=" + format(startDate, "yyyy-MM-dd");
            params = params + "&enddate=" + format(endDate, "yyyy-MM-dd");
        }
        if (searchFilter !== '') {
            params = params + "&search=" + searchFilter;
        }

        APIService.getHourlyStatsReport(params)
            .then((response) => {
                if (response.data?.status) {
                    setTotalPages(response.data?.pagination?.total_pages);
                    setTotalRecords(response.data?.pagination?.total_records);
                    setHourList(response.data?.data);
                    setTableLoader(false);
                    let exportHeader = ["Date", "Dev Agency Hours", "Addon Agency Hours", "Total Agency Hours", "Dev Assigned Hours", "Addon Assigned Hours", "Total Assigned Hours", "Employee Leave Hours", "Available Employee Hours (- Leaves)", "Total Employee Hours", "Actual Agency Consumption", "Ideal Availability", "Actual Availability"];
                    let exportData = [];
                    response.data?.data?.map(item => {
                        exportData.push(
                            {
                                created_at: item.created_at,
                                total_dev_agency_hours: item.total_dev_agency_hours,
                                total_addon_agency_hours: item.total_addon_agency_hours,
                                total_agency_hours: item.total_agency_hours,
                                total_dev_assigned_emp_hours: item.total_dev_assigned_emp_hours,
                                total_addon_assigned_emp_hours: item.total_addon_assigned_emp_hours,
                                total_assigned_emp_hours: item.total_assigned_emp_hours,
                                total_today_leave_hours: item.total_today_leave_hours,
                                available_emp_hours: item.available_emp_hours,
                                total_emp_hours: item.total_emp_hours,
                                actual_agency_onsumption: item.actual_agency_onsumption,
                                ideal_availability: item.ideal_availability,
                                actual_availability: item.actual_availability,
                            });
                        return '';
                    });
                    setExportData({ fileName: "Hourly Report", sheetTitle: "Hourly Report", exportHeader: exportHeader, exportData: exportData });
                }
            });
    }

    let columns = [
        {
            Header: 'Date',
            id: 'created_at',
            accessor: (list) => list.created_at && moment(list.created_at).format(display_date_format),
        },
        {
            Header: 'Dev Agency Hours',
            id: 'total_dev_agency_hours',
            disableSortBy: true,
            accessor: (list) => list.total_dev_agency_hours,
        },
        {
            Header: 'Addon Agency Hours',
            id: 'total_addon_agency_hours',
            disableSortBy: true,
            accessor: (list) => list.total_addon_agency_hours,
        },
        {
            Header: 'Total Agency Hours',
            id: 'total_agency_hours',
            disableSortBy: true,
            accessor: (list) => list.total_agency_hours,
        },
        {
            Header: 'Dev Assigned Hours',
            id: 'total_dev_assigned_emp_hours',
            disableSortBy: true,
            accessor: (list) => list.total_dev_assigned_emp_hours,
        },
        {
            Header: 'Addon Assigned Hours',
            id: 'total_addon_assigned_emp_hours',
            disableSortBy: true,
            accessor: (list) => list.total_addon_assigned_emp_hours,
        },
        {
            Header: 'Total Assigned Hours',
            id: 'total_assigned_emp_hours',
            disableSortBy: true,
            accessor: (list) => list.total_assigned_emp_hours,
        },
        {
            Header: 'Employee Leave Hours',
            id: 'total_today_leave_hours',
            disableSortBy: true,
            accessor: (list) => list.total_today_leave_hours,
        },
        {
            Header: 'Available Employee Hours (- Leaves)',
            id: 'available_emp_hours',
            disableSortBy: true,
            accessor: (list) => list.available_emp_hours,
        },
        {
            Header: 'Total Employee Hours',
            id: 'total_emp_hours',
            disableSortBy: true,
            accessor: (list) => list.total_emp_hours,
        },
        {
            Header: 'Actual Agency Consumption',
            id: 'actual_agency_onsumption',
            disableSortBy: true,
            accessor: (list) => `${list.actual_agency_onsumption}%`,
        },
        {
            Header: 'Ideal Availability',
            id: 'ideal_availability',
            disableSortBy: true,
            accessor: (list) => `${list.ideal_availability}%`,
        },
        {
            Header: 'Actual Availability',
            id: 'actual_availability',
            disableSortBy: true,
            accessor: (list) => `${list.actual_availability}%`,
        },
    ];

    const onChangeDateRange = dates => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    }

    const handleFilter = async (e) => {
        setReloadPage(!reloadPage);
    };

    const handleClearFilter = async (e) => {
        setStartDate(null);
        setEndDate(null);
        setSearchFilter('');
        setReloadPage(!reloadPage);
    };

    return (
        <>
            {userData.role_code === databaseRoleCode.adminCode || userData.role_code === databaseRoleCode.accountantCode ?
                <>
                    <div>
                        <Sidebar />
                        <div className="main-content">
                            <Header pagename={name ? name : ''} />
                            <div className="inner-content pt-0 px-0">
                                <div className="hourly-report-page">
                                    <div className="bg-white py-3 px-4 px-lg-7 page-inner-header">
                                        <Row className="g-2 g-xl-4 justify-content-md-end">
                                            <Col xs={12} sm={12} md={2}>
                                                <RangeDatePickerControl
                                                    selected={startDate}
                                                    startDate={startDate}
                                                    endDate={endDate}
                                                    onChange={onChangeDateRange}
                                                />
                                            </Col>
                                            <Col md="auto" sm={12}>
                                                <Button variant="primary" size="md" type="button" onClick={() => { handleFilter() }}>Search</Button>
                                            </Col>
                                            <Col md="auto" sm={12}>
                                                <OverlayTrigger placement='bottom' overlay={<Tooltip>Clear Filter</Tooltip>}>
                                                    <Button variant="soft-secondary" size="md" type="button" onClick={() => { handleClearFilter() }}><span className="icon-cancel"></span></Button>
                                                </OverlayTrigger>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                                <div className="pt-9 px-4 px-lg-7">
                                    <Card className="rounded-10 p-6">
                                        <Card.Body className="p-0 hourly-report-table">
                                            <DataTableWithPagination  columns={columns} data={hourList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isBulkAction={false} exportData={exportData} />
                                        </Card.Body>
                                    </Card>
                                </div>
                            </div>
                            <Footer />
                        </div>
                    </div>
                </>
                :
                <NoPermission />
            }
        </>

    );
}

const mapStateToProps = state => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(HourlyReport)