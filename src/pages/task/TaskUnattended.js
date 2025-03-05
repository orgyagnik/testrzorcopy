import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, Form } from 'react-bootstrap';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { pagination, display_date_format_with_time } from '../../settings';
import moment from 'moment';
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import { Link } from "react-router-dom";

function TaskUnattended({ userData, name }) {
    const [firstLoad, setFirstLoad] = useState(true);
    const [leaveList, setLeaveList] = useState([]);
    const [page, setPage] = useState(1);
    const [searchFilter, setSearchFilter] = useState('');
    const [sort, setSort] = useState(pagination.sorting);
    const [sortby, setSortBy] = useState('taskid');
    const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [selectedType, setSelectedType] = useState('Developer');

    const [exportData, setExportData] = useState([]);
    const [tableLoader, setTableLoader] = useState(false);

    const [selectedHours, setSelectedHours] = useState('');

    useEffect(() => {
        fetchStaffRatingReport();
        setFirstLoad(false);
    }, [sort, sortby, page, perPageSize]);

    useEffect(() => {
        if (firstLoad === false) {
            setPage(1);
            if (page === 1) {
                const timer = setTimeout(() => {
                    fetchStaffRatingReport();
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [searchFilter, selectedType, selectedHours]);

    const fetchStaffRatingReport = () => {
        setTableLoader(true);
        let params = "?";
        params = params + "sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby;
        if (searchFilter !== '') {
            params = params + "&search=" + searchFilter;
        }

        if (selectedType !== '') {
            params = params + "&type=" + selectedType;
        }

        if (selectedHours !== '') {
            params = params + "&hours=" + selectedHours;
        }

        APIService.getTaskUnattended(params)
            .then((response) => {
                if (response.data?.status) {
                    let newData = response.data?.data;
                    setTotalPages(response.data?.pagination?.total_pages);
                    setTotalRecords(response.data?.pagination?.total_records);
                    setLeaveList(newData);
                    setTableLoader(false);
                    let exportHeader = ["#", "Task Name", "Agency Name", "Comment Date"];
                    let exportData = [];
                    newData?.map(item => {
                        exportData.push(
                            {
                                id: item.taskid,
                                name: item.name ? item.name : '',
                                agency_name: item.agency_name ? item.agency_name : '',
                                dateadded: item.dateadded ? moment(item.dateadded).format(display_date_format_with_time) : '',
                            });
                        return '';
                    });
                    setExportData({ fileName: "task-unattended", sheetTitle: "Task Unattended", exportHeader: exportHeader, exportData: exportData });
                }
            });
    }

    let columns = [
        {
            Header: '#',
            id: 'taskid',
            accessor: (row) => row?.taskid,
        },
        {
            Header: 'Task Name',
            id: 'name',
            accessor: (row) => row?.name,
            Cell: ({ row }) => (
                <>
                    <Link to={row?.original?.task_type === 1 ? `/view-site-addons-task/${row?.original?.taskid}` : `/view-task/${row?.original?.taskid}`}>{row?.original?.name}</Link>
                </>
            ),
        },
        {
            Header: 'Agency Name',
            id: 'agency_name',
            accessor: (row) => row?.agency_name,
        },
        {
            Header: 'Comment Date',
            id: 'dateadded',
            accessor: (row) => row?.dateadded && moment(new Date(row?.dateadded)).format(display_date_format_with_time),
        },
    ];

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <Header pagename={name} />
                <div className="inner-content pt-0 px-0">
                    <div className="task-unattached-page">
                        <div className="bg-white py-3 px-4 px-lg-7 page-inner-header">
                            <Row className="g-2 g-xl-4 justify-content-md-end">
                                <Col xs={12} sm={12} md={2}>
                                    <Form.Select aria-label="Select Type" value={selectedType} onChange={(e) => { setSelectedType(e.target.value) }}>
                                        {/* <option value=''>Select Type</option> */}
                                        <option value='Agency'>Agency</option>
                                        <option value='Developer'>Developer</option>
                                    </Form.Select>
                                </Col>

                                <Col xs={12} sm={12} md={2}>
                                    <Form.Select aria-label="Select Hours" value={selectedHours} onChange={(e) => { setSelectedHours(e.target.value) }}>
                                        <option value=''>Select Hours</option>
                                        <option value='0'>0 Hours</option>
                                        <option value='12'>12 Hours</option>
                                        <option value='24'>24 Hours</option>
                                    </Form.Select>
                                </Col>

                            </Row>
                        </div>
                        <div className="pt-4 pt-lg-5 pt-xl-9 px-0 px-lg-4 px-xl-7">
                            <Card className="rounded-10 p-4 p-xl-6">
                                <Card.Body className="p-0">
                                    <DataTableWithPagination columns={columns} data={leaveList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isExportable={true} exportData={exportData} />
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

export default connect(mapStateToProps)(TaskUnattended)