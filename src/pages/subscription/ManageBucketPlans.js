import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Button, Spinner, Form, Col, Row } from 'react-bootstrap';
import SubscriptionLeftPanel from './SubscriptionLeftPanel';
import APIService from "../../api/APIService";
import moment from 'moment';
import { pagination, subscription_display_date_format } from '../../settings';
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import { connect } from "react-redux";
import { toast } from 'react-toastify';
import { PLAN_VALIDATION } from '../../modules/lang/Subscription';
import { decryptToken, check } from "../../utils/functions.js";
import Store from "../../store";
import { saveUserObject } from "../../store/reducers/Auth";
import { useHistory } from "react-router-dom";

function ManageBucketPlans({ name, userData }) {
    const history = useHistory();
    const [bucketPlanList, setBucketPlanList] = useState([]);
    const [reloadPage, setReloadPage] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchFilter, setSearchFilter] = useState('');
    const getPermission = localStorage.getItem('syndrome-swain-next');
    const [sort, setSort] = useState("desc");
    const [sortby, setSortBy] = useState("id");
    const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
    const [exportData, setExportData] = useState([]);
    const [tableLoader, setTableLoader] = useState(false);
    const [showUpgradeDowngradePlan, setShowUpgradeDowngradePlan] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('');
    const [planList, setPlanList] = useState([]);
    const [termsCondition, setTermsCondition] = useState(false);
    const [confirmOrderProcess, setConfirmOrderProcess] = useState(false);

    let columns = [
        {
            Header: 'PLAN',
            id: 'plan',
            accessor: (bucketPlanList) => bucketPlanList.plan,
        },
        {
            Header: 'PAID AMOUNT',
            id: 'amount',
            accessor: (bucketPlanList) => (bucketPlanList.amount).toFixed(2),
        },
        {
            Header: 'DISCOUNT AMOUNT',
            id: 'discount_amount',
            accessor: (bucketPlanList) => parseFloat(bucketPlanList.discount_amount).toFixed(2),
        },
        {
            Header: 'TOTAL HOURS',
            id: 'total_hours',
            accessor: (bucketPlanList) => bucketPlanList.total_hours,
        },
        /*{
            Header: 'REMAINING HOURS',
            id: 'remaining_hours',
            accessor: (bucketPlanList) => bucketPlanList.remaining_hours,
        },*/
        {
            Header: 'PURCHASE DATE',
            id: 'created_at',
            accessor: (bucketPlanList) => moment(new Date(bucketPlanList?.created_at)).format(subscription_display_date_format),
        },
        {
            Header: 'EXPIRE DATE',
            id: 'expiry_date',
            accessor: (bucketPlanList) => moment(new Date(bucketPlanList?.expiry_date)).format(subscription_display_date_format),
        },
        {
            Header: 'STATUS',
            id: 'Status',
            accessor: (bucketPlanList) => bucketPlanList.status,
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
    ];

    const fetchBucketPlanList = () => {
        setTableLoader(true);
        let params = "?";
        params = params + "sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby + "&search_by_agency=" + userData?.id;
        APIService.getBucketPlanList(params)
            .then((response) => {
                if (response.data?.status) {
                    setTotalPages(response.data?.pagination?.total_pages);
                    setTotalRecords(response.data?.pagination?.total_records);
                    let newData = response.data?.data;
                    setBucketPlanList(newData);
                    let exportHeader = ["Plan", "Plan Amount", "Discount Amount", "Total Hours", "Purchase Date", "Expire Date", "Status"];
                    let exportData = [];
                    newData?.data?.map(item => {
                        exportData.push(
                            {
                                plan: item.plan ? item.plan : '',
                                unit_amount: item.amount ? parseFloat(item.amount).toFixed(2) : 0,
                                discount_amount: item.discount_amount ? parseFloat(item.discount_amount).toFixed(2) : 0,
                                total_hours: item.total_hours ? item.total_hours : '',
                                created_at: item.created_at ? moment(new Date(item.created_at)).format(subscription_display_date_format) : '',
                                expiry_date: item.expiry_date ? moment(new Date(item.expiry_date)).format(subscription_display_date_format) : '',
                                status: item.status ? item.status : '',
                            });
                        return '';
                    });
                    setExportData({ fileName: "bucket-plans-data", sheetTitle: "Bucket Plans Data", exportHeader: exportHeader, exportData: exportData });
                }
                setTableLoader(false);
            });
    }

    useEffect(() => {
        fetchBucketPlanList();
        setFirstLoad(false);
    }, [sort, sortby, page, perPageSize, reloadPage]);

    useEffect(() => {
        if (firstLoad === false) {
            setPage(1);
            if (page === 1) {
                const timer = setTimeout(() => {
                    fetchBucketPlanList();
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [searchFilter]);

    useEffect(() => {
        let params = {};
        APIService.getStripeBucketPlans(params)
            .then((response) => {
                if (response.data?.status) {
                    setPlanList(response.data?.data);
                }
            });
    }, []);

    const addBucketPlanClick = () => {
        if (getPermission && getPermission === "true") {
            setShowUpgradeDowngradePlan(true);
        }
    }

    const handleUpgradeDowngradePlanCancelClick = () => {
        setShowUpgradeDowngradePlan(false);
        setSelectedPlan('');
    };

    const handlePlanChange = (id, name, amount, total_hours) => {
        setTermsCondition(false);
        setSelectedPlan({ id: id, name: name, amount: amount, total_hours: total_hours });
    };

    const updateProfileRedux = () => {
        let user_role_enc = localStorage.getItem("rz_user_role");
        if (user_role_enc !== null) {
            let user_role = decryptToken(user_role_enc);
            let params = {};
            APIService.getLogedInUser(params, user_role)
                .then((response) => {
                    if (response.data?.status) {
                        Store.dispatch(saveUserObject(response.data?.data));
                    }
                })
        }
    }

    const confirmOrder = async () => {
        if (selectedPlan !== '') {
            setConfirmOrderProcess(true);
            let params = {};
            params['price_plan'] = selectedPlan?.id;
            params['amount'] = selectedPlan?.amount;
            params['plan_name'] = selectedPlan?.name;
            params['total_hours'] = selectedPlan?.total_hours;
            params['plan'] = 'Bucket';
            APIService.upgradeDowngradeBucketPlan(params)
                .then((response) => {
                    setConfirmOrderProcess(false);
                    if (response.data?.status) {
                        toast.success(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setReloadPage(!reloadPage);
                        setShowUpgradeDowngradePlan(false);
                        setSelectedPlan('');
                        setTermsCondition(false);
                        updateProfileRedux();
                    }
                    else {
                        toast.error(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                });
        }
        else {
            toast.error(PLAN_VALIDATION, {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    };

    return (
        <>
            <div>
                <Sidebar />
                <div className="main-content">
                    <Header pagename={name ? name : ''} />
                    <div className="inner-content py-lg-8 px-lg-11 py-md-6 px-md-8 py-4 px-6">
                        <div className="paln-page row">
                            <div className="col-12 col-xl-3 mb-3">
                                <SubscriptionLeftPanel userData={userData} activeMenu="manage-bucket-plans" />
                            </div>
                            <div className="col-12 col-xl-9">
                                <Card className="rounded-10 border border-gray-100 mb-4">
                                    <Card.Body className="p-0">
                                        <div className="d-md-flex flex-wrap align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100 justify-content-between">
                                            <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Manage Bucket Plans </h3>
                                            <div className="d-flex mt-md-0 mt-3 flex-md-row flex-column align-items-start">
                                                {!showUpgradeDowngradePlan && !userData?.current_plan.includes('dev') && getPermission && getPermission === "true" &&
                                                    <Button variant="primary" size="md" className="me-2 mb-md-0 mb-2" onClick={addBucketPlanClick}>Add Bucket Plan</Button>
                                                }
                                                {check(['bucketreport.view'], userData?.role.getPermissions) && userData?.current_plan.includes("bucket") &&
                                                    <Button variant="primary" size="md" className="me-2 mb-md-0 mb-2" onClick={(e) => { history.push('/bucket-tracking-report') }}>Bucket Tracking Report</Button>
                                                }
                                            </div>
                                        </div>
                                    </Card.Body>
                                    <Card.Body className="px-md-4 py-4">
                                        <div className="px-md-3 py-md-3">
                                            <Row className="row-cols-xxl-3 row-cols-xl-2 row-cols-lg-2 row-cols-1 mb-7 g-4">
                                                <Col>
                                                    <Card className="rounded-12 border border-gray-100 leave-card">
                                                        <Card.Body className="p-2 px-xxl-4">
                                                            <Row className="align-items-center">
                                                                <Col className="col-auto d-xxl-block">
                                                                    <span className="badge badge-size-xl rounded-24 py-2 bg-yellow-50 text-orange"><i className="icon-receipt"></i></span>
                                                                </Col>
                                                                <Col>
                                                                    <span className="h3 mb-0">Total Hours</span>
                                                                    <span className="caption text-gray-600 d-block mb-1">{bucketPlanList?.total_plan_hours ? `${bucketPlanList?.total_plan_hours}:00` : '00:00'}</span>
                                                                </Col>
                                                            </Row>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                                <Col>
                                                    <Card className="rounded-12 border border-gray-100 leave-card">
                                                        <Card.Body className="p-2 px-xxl-4">
                                                            <Row className="align-items-center">
                                                                <Col className="col-auto d-xxl-block">
                                                                    <span className="badge badge-size-xl rounded-24 py-2 bg-yellow-50 text-orange"><i className="icon-receipt"></i></span>
                                                                </Col>
                                                                <Col>
                                                                    <span className="h3 mb-0">Used Hours</span>
                                                                    <span className="caption text-gray-600 d-block mb-1">{bucketPlanList?.used_hours ? bucketPlanList?.used_hours : '00:00'}</span>
                                                                </Col>
                                                            </Row>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                                <Col>
                                                    <Card className="rounded-12 border border-gray-100 leave-card">
                                                        <Card.Body className="p-2 px-xxl-4">
                                                            <Row className="align-items-center">
                                                                <Col className="col-auto d-xxl-block">
                                                                    <span className="badge badge-size-xl rounded-24 py-2 bg-yellow-50 text-orange"><i className="icon-receipt"></i></span>
                                                                </Col>
                                                                <Col>
                                                                    <span className="h3 mb-0">Remaining Hours</span>
                                                                    <span className="caption text-gray-600 d-block mb-1">{bucketPlanList?.remaining_hours ? bucketPlanList?.remaining_hours : '00:00'}</span>
                                                                </Col>
                                                            </Row>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            </Row>
                                            {bucketPlanList?.data &&
                                                <DataTableWithPagination columns={columns} data={bucketPlanList?.data} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isBulkAction={false} exportData={exportData} />
                                            }
                                        </div>
                                    </Card.Body>
                                </Card>
                                {showUpgradeDowngradePlan &&
                                    <Card className="rounded-10 border border-gray-100 mb-4">
                                        <Card.Body className="p-0">
                                            <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                                                <h3 className="card-header-title mb-0 my-md-2 ps-md-3 d-flex align-items-center">Add Bucket Plan</h3>
                                                <button className="btn btn-white btn-icon rounded-pill ms-auto" onClick={handleUpgradeDowngradePlanCancelClick}>
                                                    <i className="icon-cancel"></i>
                                                </button>
                                            </div>
                                        </Card.Body>
                                        <Card.Body className="px-md-4 py-4">
                                            <Form onSubmit={async e => { e.preventDefault(); await confirmOrder() }}>
                                                <div className="px-md-3 py-md-3 pricing-template">
                                                    <div className="row justify-content-center">
                                                        {planList.map((plan, index) => (
                                                            <div className="col-md-4" key={index}>
                                                                <div className="plan-card">
                                                                    <input className="form-check-input visually-hidden" type="radio" name="selectplan" value={plan.id} id={plan.id} onChange={(e) => { handlePlanChange(plan.id, plan.nickname, plan.unit_amount, plan.total_hours) }} />
                                                                    <label className="form-check-label border border-gray-100 shadow-dark-80 rounded-10 p-4 px-xl-4 mb-4 d-block" htmlFor={plan.id}>
                                                                        <div className="px-0 px-xxl-3 py-0 py-xxl-2">
                                                                            <h4 className="font-weight-medium mb-0 pt-md-3">{plan.nickname}</h4>
                                                                            <h3 className="d-flex align-items-center">$<span className="monthly">{(plan.unit_amount / 100).toFixed(2)}</span></h3>
                                                                            <div className="mt-4 mb-2 pt-2 d-grid">
                                                                                <div className="btn btn-lg btn-soft-primary px-lg-2">Select Plan <svg className="ms-1" data-name="icons/tabler/chevron right" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16">
                                                                                    <rect data-name="Icons/Tabler/Chevron Right background" width="16" height="16" fill="none"></rect>
                                                                                    <path d="M.26.26A.889.889,0,0,1,1.418.174l.1.086L8.629,7.371a.889.889,0,0,1,.086,1.157l-.086.1L1.517,15.74A.889.889,0,0,1,.174,14.582l.086-.1L6.743,8,.26,1.517A.889.889,0,0,1,.174.36Z" transform="translate(4)" fill="#0D6EFD"></path>
                                                                                </svg>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {selectedPlan !== '' &&
                                                        <div className="select-plan-confirmation text-center mt-7">
                                                            <div className="form-check form-check-sm d-inline-block">
                                                                <input className="form-check-input mt-1" type="checkbox" id="flexCheckChecked2" value={1} checked={termsCondition} onChange={(e) => { setTermsCondition(e.target.checked) }} />
                                                                <label className="form-check-label text-small" htmlFor="flexCheckChecked2">I have read and agree to UnlimitedWP's <a href="https://unlimitedwp.com/unlimitedwp-service-agreement/" target="_blank" rel="noreferrer">Service Agreement.</a></label>
                                                            </div>
                                                            <p className="mb-6">You will be charged ${((selectedPlan?.amount) / 100).toFixed(2)}</p>
                                                            <Button variant="primary" size="lg" type="submit" disabled={!termsCondition}>
                                                                {
                                                                    !confirmOrderProcess && 'Confirm Order'
                                                                }
                                                                {
                                                                    confirmOrderProcess && <><Spinner size="sm" animation="border" className="me-1" />Confirm Order</>
                                                                }
                                                            </Button>
                                                        </div>
                                                    }
                                                </div>
                                            </Form>
                                        </Card.Body>
                                    </Card>
                                }
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        </>
    );
}

const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(ManageBucketPlans)