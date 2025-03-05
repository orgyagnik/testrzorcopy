import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import APIService from "../../api/APIService";
import { Card, Col, Row, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import { pagination, display_date_format_with_time } from '../../settings';
import moment from 'moment';
import RangeDatePickerControl from '../../modules/custom/RangeDatePickerControl';
import { format } from 'date-fns';

export default function ActivityLog(props) {
    const [firstLoad, setFirstLoad] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchFilter, setSearchFilter] = useState('');
    const [sort, setSort] = useState(pagination.sorting);
    const [sortby, setSortBy] = useState('id');
    const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
    const [logList, setLogList] = useState([]);
    const [exportData, setExportData] = useState([]);
    const [tableLoader, setTableLoader] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [reloadPage, setReloadPage] = useState(false);

    const fetchLogList = () => {
        setTableLoader(true);
        let params = "?sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby;
        if (searchFilter !== '') {
            params = params + "&search=" + searchFilter;
        }
        if (startDate && endDate) {
            params = params + "&startdate=" + format(startDate, "yyyy-MM-dd");
            params = params + "&enddate=" + format(endDate, "yyyy-MM-dd");
        }
        APIService.getActivityLogList(params)
            .then((response) => {
                if (response.data?.status) {
                    setTotalPages(response.data?.pagination?.total_pages);
                    setTotalRecords(response.data?.pagination?.total_records);
                    setLogList(response.data?.data);
                    setTableLoader(false);
                    let exportHeader = ["#", "Name", "Description", "Date"];
                    let exportData = [];
                    response.data?.data?.map(item => {
                        exportData.push(
                            {
                                id: item.id,
                                staffid: item.staffid ? item.staffid : '',
                                description: item.description ? item.description : '',
                                date: item.date ? moment(item.date).format(display_date_format_with_time) : '',
                            });
                        return '';
                    });
                    setExportData({ fileName: "Activity Log", sheetTitle: "Activity Log", exportHeader: exportHeader, exportData: exportData });
                }
                else {
                    setLogList([]);
                }
            });
    }

    useEffect(() => {
        fetchLogList();
        setFirstLoad(false);
    }, [sort, sortby, page, perPageSize]);

    useEffect(() => {
        if (firstLoad === false) {
            setPage(1);
            if (page === 1) {
                const timer = setTimeout(() => {
                    fetchLogList();
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [searchFilter, reloadPage]);

    const columns = [
        {
            Header: 'Name',
            id: 'staffid',
            accessor: (logList) => logList.staffid ? logList.staffid : '',
        },
        {
            Header: 'Description',
            id: 'description',
            accessor: (logList) => logList.description,
        },
        {
            Header: 'Date',
            id: 'date',
            accessor: (logList) => logList.date && moment(logList.date).format(display_date_format_with_time),
        },
    ];

    const handleClearFilter = async (e) => {
        setStartDate(null);
        setEndDate(null);
        setSearchFilter('');
        setReloadPage(!reloadPage);
    };

    const handleFilter = async (e) => {
        setReloadPage(!reloadPage);
    };

    const onChangeDateRange = dates => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    }

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <Header pagename={props.name ? props.name : ''} />
                <div className="inner-content pt-0 px-0">
                    <div className="bg-white py-3 px-4 px-xl-7 page-inner-header">
                        <Row className="g-2 g-xl-4 justify-content-md-end">
                            <Col xs={12} sm={7} md={6} xl={4} xxl={3}>
                                <RangeDatePickerControl
                                    selected={startDate}
                                    startDate={startDate}
                                    endDate={endDate}
                                    onChange={onChangeDateRange}
                                />
                            </Col>
                            <Col sm="auto" xs={12} className='d-flex flex-sm-row flex-row-reverse'>
                                <Button variant="primary" size="md" type="button" onClick={() => { handleFilter() }} className='me-sm-2 ms-sm-0 ms-2'>Search</Button>
                                <OverlayTrigger placement='bottom' overlay={<Tooltip>Clear Filter</Tooltip>}>
                                    <Button variant="soft-secondary" size="md" type="button" onClick={() => { handleClearFilter() }}><span>Clear</span></Button>
                                </OverlayTrigger>
                            </Col>
                        </Row>
                    </div>
                    <div className="pt-4 pt-lg-5 pt-xl-9 px-0 px-lg-4 px-xl-7">
                        <Card className="rounded-10 p-4 p-xl-6">
                            <Card.Body className="p-0 activity-log-table">
                                <DataTableWithPagination columns={columns} data={logList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isExportable={true} exportData={exportData} />
                            </Card.Body>
                        </Card>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}
