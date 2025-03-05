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
import { getBucketPlanStatus } from "../../utils/functions.js";

function BucketPlanList({ name, userData }) {
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
        let exportHeader = ["Agency Name", "Plan", "Paid Amount", "Discount Amount", "Total Hours", "Purchase Date", "Expire Date", "Status"];
        let exportData = [];
        data?.map(item => {
            exportData.push(
                {
                    agency_name: item.agency_name ? item.agency_name : '',
                    plan: item.plan ? item.plan : '-',
                    amount: item.amount ? parseFloat(item.amount).toFixed(2) : '',
                    discount_amount: item.discount_amount ? parseFloat(item.discount_amount).toFixed(2) : '',
                    total_hours: item.total_hours ? item.total_hours : '',
                    created_at: item.created_at ? moment(new Date(item.created_at)).format(subscription_display_date_format) : '',
                    expiry_date: item.expiry_date ? moment(new Date(item.expiry_date)).format(subscription_display_date_format) : '',
                    Status: item.status ? item.status : '',
                });
            return '';
        });
        setExportData({ fileName: "bucket-payment-list", sheetTitle: "Bucket Payment List", exportHeader: exportHeader, exportData: exportData });
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
        if (startDate && endDate) {
            params = params + "&startdate=" + format(startDate, "yyyy-MM-dd");
            params = params + "&enddate=" + format(endDate, "yyyy-MM-dd");
        }

        APIService.getBucketPlanList(params)
            .then((response) => {
                if (response.data?.status) {
                    setTotalPages(response.data?.pagination?.total_pages);
                    setTotalRecords(response.data?.pagination?.total_records);
                    let newData = response.data?.data?.data;
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
        fetchProjectList();
        setFirstLoad(false);
    }, [sort, sortby, page, perPageSize]);

    useEffect(() => {
        if (firstLoad === false) {
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
            let params = "?search_by_plan=Bucket";
            APIService.getAllAgency(params)
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

    /*const handleDownloadReceipt = (url) => {
        APIService.downloadReceipt(`?url=${url}`)
            .then((response) => {
                if (response.data?.status) {
                    
                }
                else {

                }
            });
    }*/

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
            Header: 'Agency Name',
            id: 'agency_name',
            accessor: (reportList) => reportList.agency_name,
        },
        {
            Header: 'Plan',
            id: 'plan',
            accessor: (reportList) => reportList.plan,
        },
        {
            Header: 'Paid Amount',
            id: 'amount',
            accessor: (reportList) => reportList.amount ? parseFloat(reportList.amount).toFixed(2) : '',
        },
        {
            Header: 'Discount Amount',
            id: 'discount_amount',
            accessor: (reportList) => reportList.discount_amount ? parseFloat(reportList.discount_amount).toFixed(2) : '',
        },
        {
            Header: 'Total Hours',
            id: 'total_hours',
            accessor: (reportList) => reportList.total_hours,
        },
        {
            Header: 'Balance Hours',
            id: 'balance_hours',
            accessor: (reportList) => reportList.remaining_hours,
        },
        {
            Header: 'Used / Purchase',
            id: 'used_hours',
            accessor: (reportList) => {
                const usedHours = parseFloat(reportList.total_hours) - parseFloat(reportList.remaining_hours);
                return usedHours <= 0 ? `${usedHours.toFixed(2)}` : `-${usedHours.toFixed(2)}`;
            },
        },
        {
            Header: 'Purchase Date',
            id: 'created_at',
            accessor: (reportList) => reportList.created_at ? moment(new Date(reportList.created_at)).format(subscription_display_date_format) : '',
        },
        {
            Header: 'Expire Date',
            id: 'expiry_date',
            disableSortBy: true,
            accessor: (reportList) => reportList.expiry_date ? moment(new Date(reportList.expiry_date)).format(subscription_display_date_format) : '',
        },
        {
            Header: 'Status',
            id: 'status',
            accessor: (row) => <>
                {getBucketPlanStatus(row?.status)}
            </>,
        },
        {
            Header: 'Action',
            disableSortBy: true,
            accessor: (row) => (
                <>
                    {row?.download_link &&
                        <a href={row?.download_link} target='_blank'>View Receipt</a>
                    }
                </>
            ),
        },
        // {
        //     Header: 'Action',
        //     disableSortBy: true,
        //     accessor: (row) => (
        //         <>
        //             {row?.download_link &&
        //                 <span className='text-primary cursor-pointer' onClick={() => { handleDownloadReceipt(row?.download_link) }}>Download PDF</span>
        //             }
        //         </>
        //     ),
        // },
    ];

    const handleAgencySelect = (selectedAgency) => {
        setAgency(selectedAgency?.value);
    };

    const handleFilter = async (e) => {
        setReloadPage(!reloadPage);
    };

    const handleClearFilter = async (e) => {
        setAgency(userData?.role_code === databaseRoleCode.agencyCode || userData?.role_code === databaseRoleCode.agencyMemberCode ? userData?.id : 0);
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
                                <Row className="g-2 justify-content-md-end">
                                    {userData?.role_code !== databaseRoleCode.agencyCode && userData?.role_code !== databaseRoleCode.clientCode && userData?.role_code !== databaseRoleCode.agencyMemberCode &&
                                        <Col xxl={3} xl={4} sm={6}>
                                            <Select styles={customStyles} className="control-md custom-select" options={agencyList} onChange={handleAgencySelect}
                                                value={agencyList.filter(function (option) {
                                                    return option.value === agency;
                                                })} />
                                        </Col>
                                    }
                                    <Col xxl={3} xl={4} sm={6}>
                                        <RangeDatePickerControl
                                            selected={startDate}
                                            startDate={startDate}
                                            endDate={endDate}
                                            onChange={onChangeDateRange}
                                        />
                                    </Col>
                                    <Col xs={12} className='mt-4 d-xl-none'>
                                        <hr className='m-0' />
                                    </Col>
                                    <Col xl="auto" className='d-flex gap-2 flex-xl-row flex-row-reverse justify-content-lg-start justify-content-between '>
                                        <Button variant="primary" size="md" type="button" onClick={() => { handleFilter() }}>Search</Button>
                                        <OverlayTrigger placement='bottom' overlay={<Tooltip>Clear Filter</Tooltip>}>
                                            <Button variant="soft-secondary" size="md" type="button" onClick={() => { handleClearFilter() }}><span>Clear Filter</span></Button>
                                        </OverlayTrigger>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>
                    <div className="pt-0 pt-xl-5 pt-xl-9 px-0 px-lg-4 px-xl-7">
                        <Card className="rounded-10 p-4 p-xl-6 bucketplan-list-table">
                            <Card.Body className="p-0">
                                <DataTableWithPagination columns={columns} data={reportList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isBulkAction={false} exportData={exportData} />
                            </Card.Body>
                        </Card>
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

export default connect(mapStateToProps)(BucketPlanList)