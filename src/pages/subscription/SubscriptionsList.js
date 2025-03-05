import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Col, Row, Card, Spinner } from 'react-bootstrap';
import { Eye } from 'react-bootstrap-icons';
import APIService from "../../api/APIService";
import { subscription_list_display_date_format, pagination, databaseRoleCode } from '../../settings';
import moment from 'moment';
import { capitalizeFirst } from "../../utils/functions.js";
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

function SubscriptionsList({ name, userData }) {
    const [firstLoad, setFirstLoad] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchFilter, setSearchFilter] = useState('');
    const [sort, setSort] = useState(pagination.sorting);
    const [sortby, setSortBy] = useState('id');
    const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
    const [subscriptionList, setSubscriptionList] = useState([]);
    const [exportData, setExportData] = useState([]);
    const [tableLoader, setTableLoader] = useState(false);

    const fetchSubscriptionList = () => {
        setTableLoader(true);
        let params = "?sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby;
        if (searchFilter !== '') {
            params = params + "&search=" + searchFilter;
        }
        APIService.getSubscriptionList(params)
            .then((response) => {
                if (response.data?.status) {
                    setTotalPages(response.data?.pagination?.total_pages);
                    setTotalRecords(response.data?.pagination?.total_records);
                    let newData = response.data?.data;
                    setSubscriptionList(newData);
                    setTableLoader(false);
                    let exportHeader = ["#", "Name", "Agency Name", "Email", "Renewal Date", "Upcoming Invoice Amount", "Plan Name", "Plan Type", "Status"];
                    let exportData = [];
                    newData?.subscriptions?.map(item => {
                        exportData.push(
                            {
                                id: item.id,
                                name: item.name ? item.name : '',
                                agency_name: item.agency_name ? item.agency_name : '',
                                email: item.email ? item.email : '',
                                next_renewal_date: item.next_renewal_date ? moment(item.next_renewal_date).format("DD MMM") : '',
                                next_upcoming_amount: `$${item.next_upcoming_amount.toFixed(2)}`,
                                plan_nick_name: item.plan_nick_name ? item.plan_nick_name : '',
                                plan_type: item.plan_type ? item.plan_type : '',
                                status: item.status ? item.status : '',
                            });
                        return '';
                    });
                    setExportData({ fileName: "subscription-list", sheetTitle: "Subscription List", exportHeader: exportHeader, exportData: exportData });
                }
                else {
                    setSubscriptionList([]);
                }
            });
    }

    useEffect(() => {
        fetchSubscriptionList();
        setFirstLoad(false);
    }, [sort, sortby, page, perPageSize]);

    useEffect(() => {
        if (firstLoad === false) {
            setPage(1);
            if (page === 1) {
                const timer = setTimeout(() => {
                    fetchSubscriptionList();
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [searchFilter]);

    let columns = [
        {
            Header: '#',
            id: 'staffid',
            accessor: (row) => row?.id,
        },
        {
            Header: 'Name',
            id: 'name',
            accessor: (row) => row?.name,
        },
        {
            Header: 'Agency Name',
            id: 'agency_name',
            accessor: (row) => row?.agency_name,
        },
        {
            Header: 'Email',
            id: 'email',
            accessor: (row) => row?.email,
        },
        {
            Header: 'Renewal Date',
            id: 'next_renewal_date',
            accessor: (row) => row?.next_renewal_date && moment(new Date(row?.next_renewal_date)).format(subscription_list_display_date_format),
        },
    ];

    if (userData?.role_code === databaseRoleCode.adminCode) {
        columns = [
            ...columns,
            {
                Header: 'Upcoming Invoice Amount',
                id: 'next_upcoming_amount',
                accessor: (row) => `$${row?.next_upcoming_amount.toFixed(2)}`,
            },
        ];
    }

    columns = [
        ...columns,
        {
            Header: 'Plan Name',
            id: 'plan_nick_name',
            accessor: (row) => row?.plan_nick_name,
        },
        {
            Header: 'Plan Type',
            id: 'plan_type',
            accessor: (row) => row?.plan_type,
        },
        {
            Header: 'Status',
            id: 'status',
            disableSortBy: false,
            accessor: (row) => row?.status,
            Cell: ({ row }) => (
                <>
                    <span className={`badge badge-sm ${row?.original?.status === 'active' ? 'badge-success' : 'badge-danger'} font-weight-semibold ms-2 font-12`}>{capitalizeFirst(row?.original?.status)}</span>
                </>
            ),
        },
    ];

    if (userData?.role_code === databaseRoleCode.adminCode) {
        columns = [
            ...columns,
            {
                Header: 'Action',
                disableSortBy: true,
                accessor: (row) => (
                    <>
                        <Link to={`/subscription-invoice/${row?.id}`} className="btn-icon circle-btn btn btn-white btn-sm mx-auto"><Eye /></Link>
                    </>
                ),
            },
        ];
    }

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <Header pagename={name} />
                <div className="inner-content subscription-list-page">
                    {subscriptionList?.subscriptions ?
                        <>
                            <Row className="row-cols-xxxl-6 row-cols-md-3 row-cols-sm-2 mb-7 g-2 g-md-3 g-xl-5">
                                {subscriptionList?.active_subscriptions !== undefined &&
                                    <Col xs="12">
                                        <Card className="rounded-12 border border-gray-100 leave-card">
                                            <Card.Body className="p-3 px-xxl-4">
                                                <Row className="align-items-center">
                                                    <Col>
                                                        <span className="h2 mb-0">{subscriptionList?.active_subscriptions}</span>
                                                        <span className="caption text-gray-600 d-block mb-1">Active Subscriptions</span>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                }
                                {subscriptionList?.unpaid_subscriptions !== undefined &&
                                    <Col xs="12">
                                        <Card className="rounded-12 border border-gray-100 leave-card">
                                            <Card.Body className="p-3 px-xxl-4">
                                                <Row className="align-items-center">
                                                    <Col>
                                                        <span className="h2 mb-0">{subscriptionList?.unpaid_subscriptions}</span>
                                                        <span className="caption text-gray-600 d-block mb-1">Unpaid Subscriptions</span>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                }
                                {subscriptionList?.pending_cancellation !== undefined &&
                                    <Col xs="12">
                                        <Card className="rounded-12 border border-gray-100 leave-card">
                                            <Card.Body className="p-3 px-xxl-4">
                                                <Row className="align-items-center">
                                                    <Col>
                                                        <span className="h2 mb-0">{subscriptionList?.pending_cancellation}</span>
                                                        <span className="caption text-gray-600 d-block mb-1">Pending Subscriptions</span>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                }
                                {subscriptionList?.expired_subscriptions !== undefined &&
                                    <Col xs="12">
                                        <Card className="rounded-12 border border-gray-100 leave-card">
                                            <Card.Body className="p-3 px-xxl-4">
                                                <Row className="align-items-center">
                                                    <Col>
                                                        <span className="h2 mb-0">{subscriptionList?.expired_subscriptions}</span>
                                                        <span className="caption text-gray-600 d-block mb-1">Expired Subscriptions</span>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                }
                                {subscriptionList?.trialing_subscriptions !== undefined &&
                                    <Col xs="12">
                                        <Card className="rounded-12 border border-gray-100 leave-card">
                                            <Card.Body className="p-3 px-xxl-4">
                                                <Row className="align-items-center">
                                                    <Col>
                                                        <span className="h2 mb-0">{subscriptionList?.trialing_subscriptions}</span>
                                                        <span className="caption text-gray-600 d-block mb-1">Trialing Subscriptions</span>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                }
                                {subscriptionList?.this_month_total !== undefined && userData.role_code === databaseRoleCode.adminCode &&
                                    <Col xs="12">
                                        <Card className="rounded-12 border border-gray-100 leave-card">
                                            <Card.Body className="p-3 px-xxl-4">
                                                <Row className="align-items-center">
                                                    <Col>
                                                        <span className="h2 mb-0">${subscriptionList?.this_month_total}</span>
                                                        <span className="caption text-gray-600 d-block mb-1">{moment().startOf("month").format('MMMM')} Remaining Amount</span>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                }
                            </Row>
                            <Card className="rounded-10 p-6">
                                <Card.Body className="p-0 static-datatable-card-body">
                                    <DataTableWithPagination columns={columns} data={subscriptionList?.subscriptions} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isExportable={true} exportData={exportData} />
                                </Card.Body>
                            </Card>
                        </>
                        :
                        <Spinner className='me-1' animation="border" variant="primary" />
                    }
                </div>
                <Footer />
            </div>
        </>
    );
}

const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(SubscriptionsList)