import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, Button, Form, Offcanvas, Spinner, Dropdown } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { pagination, display_date_format, popperConfig } from '../../settings';
import moment from 'moment';
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import { validateForm } from "../../utils/validator.js";
import { CompanyValidator } from "../../modules/validation/CompanyValidator";
import { toast } from 'react-toastify';
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import { Link, useHistory } from "react-router-dom";
import { DELETE_CUSTOMER } from '../../modules/lang/Customer';
import { confirmAlert } from 'react-confirm-alert';

function Customers({ userData, name }) {
    let history = useHistory();
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
    const cstSetCloseAddCustomerModal = () => setShowAddCustomerModal(false);
    const cstShowAddCustomerModal = () => setShowAddCustomerModal(true);
    const [firstLoad, setFirstLoad] = useState(true);
    const [reloadPage, setReloadPage] = useState(false);
    const [ignore, setIgnore] = useState(false);
    const [customersSummary, setCustomersSummary] = useState([]);
    const [activeCustomerList, setActiveCustomerList] = useState([]);
    const [customerList, setCustomerList] = useState([]);
    const [page, setPage] = useState(1);
    const [searchFilter, setSearchFilter] = useState('');
    const [process, setProcess] = useState(false);
    const [saveProcess, setSaveProcess] = useState(false);
    const [sort, setSort] = useState(pagination.sorting);
    const [sortby, setSortBy] = useState('userid');
    const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    let companyInput = useRef();
    let websiteInput = useRef();

    const [formErrors, setFormErrors] = useState([]);
    const [activeCustomerFilter, setActiveCustomerFilter] = useState(true);
    //const [activeCustomerListRefresh, setActiveCustomerListRefresh] = useState(false);

    const [exportData, setExportData] = useState([]);
    const [tableLoader, setTableLoader] = useState(false);

    useEffect(() => {
        fetchCustomerList();
        setFirstLoad(false);
    }, [sort, sortby, page, perPageSize, reloadPage]);

    useEffect(() => {
        if (firstLoad === false) {
            setPage(1);
            if (page === 1) {
                const timer = setTimeout(() => {
                    fetchCustomerList();
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [searchFilter, activeCustomerFilter]);

    /*useEffect(() => {
    }, [activeCustomerListRefresh]);*/

    const fetchCustomerList = () => {
        setTableLoader(true);
        let params = "?";
        params = params + "sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby;
        if (searchFilter !== '') {
            params = params + "&search=" + searchFilter;
        }
        if (activeCustomerFilter)
            params = params + "&active=1";

        APIService.getCustomerLists(params)
            .then((response) => {
                if (response.data?.status) {
                    let newData = response.data?.data?.customers;
                    setTotalPages(response.data?.pagination?.total_pages);
                    setTotalRecords(response.data?.pagination?.total_records);
                    setCustomerList(response.data?.data?.customers);
                    setProcess(false);
                    setTableLoader(false);
                    let activeCustomerListData = newData.map(({ active, userid }) => {
                        if (active === 1)
                            return userid;
                        else
                            return 0;
                    })
                    setActiveCustomerList(activeCustomerListData);
                    setCustomersSummary(response.data?.data?.customers_summary);

                    let exportHeader = ["#", "Company", "Primary Contact", "Primary Email", "Phone", "Active / In-Active", "Date Created"];
                    let exportData = [];
                    newData?.map(item => {
                        exportData.push(
                            {
                                userid: item.userid,
                                company: item.company,
                                primary_contact: item.primary_contact ? item.primary_contact : '',
                                email: item.email ? item.email : '',
                                phonenumber: item.phonenumber ? item.phonenumber : '',
                                active: item.active === 1 ? 'Active' : 'In-Active',
                                datecreated: item.datecreated ? moment(item.datecreated).format(display_date_format) : '',
                            });
                        return '';
                    });
                    setExportData({ fileName: "customers-data", sheetTitle: "Customers", exportHeader: exportHeader, exportData: exportData });
                }
            });
    }


    let columns = [
        {
            Header: '#',
            id: 'userid',
            accessor: (row) => row?.userid,
        },
        {
            Header: 'Company',
            id: 'company',
            accessor: (row) => (
                <>
                    <Link to={`/customer/profile/${row?.userid}`}>{row?.company}</Link>
                </>
            ),
        },
        {
            Header: 'Primary Contact',
            id: 'primary_contact',
            accessor: (row) => row?.primary_contact,
        },
        {
            Header: 'Primary Email',
            id: 'email',
            accessor: (row) => row?.email,
        },
        {
            Header: 'Phone',
            id: 'phonenumber',
            accessor: (row) => row?.phonenumber,
        },
        {
            Header: 'Active',
            id: 'active',
            accessor: (row) => (
                <>
                    <Form.Check type="switch" id={`active-radio-${row?.userid}`} checked={activeCustomerList.indexOf(row?.userid) > -1} onChange={(e) => { handleCustomerActiveDeactive(row?.userid, e) }} />
                </>
            ),
        },
        {
            Header: 'Date Created',
            id: 'datecreated',
            accessor: (row) => row?.datecreated && moment(new Date(row?.datecreated)).format(display_date_format),
        },
        {
            Header: 'Action',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <Dropdown className="category-dropdown edit-task-dropdown">
                        <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="cursor-pointer" id="edit-task"><button size="sm" className='btn btn-white circle-btn btn-icon btn-sm'><i className="fa-solid fa-ellipsis-vertical"></i></button></Dropdown.Toggle>
                        <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2" popperConfig={popperConfig}>
                            <PermissionCheck permissions={['customers.view']}>
                                <Dropdown.Item onClick={() => { history.push(`/customer/profile/${row?.original?.userid}`); }}>
                                    View
                                </Dropdown.Item>
                            </PermissionCheck>
                            <PermissionCheck permissions={['customers.delete']}>
                                <Dropdown.Item className="text-danger" onClick={() => { handleDeleteCompany(row?.original?.userid) }}>
                                    Delete
                                </Dropdown.Item>
                            </PermissionCheck>
                        </Dropdown.Menu>
                    </Dropdown>
                </>
            ),
        }
    ];

    const handleDeleteCompany = async (id) => {
        confirmAlert({
            title: 'Confirm',
            message: DELETE_CUSTOMER,
            buttons: [
                {
                    label: 'Yes',
                    className: 'btn btn-primary btn-lg',
                    onClick: () => {
                        let params = {};
                        params["userid"] = id;
                        APIService.deleteClient(params)
                            .then((response) => {
                                if (response.data?.status) {
                                    toast.success(response.data?.message, {
                                        position: toast.POSITION.TOP_RIGHT
                                    });
                                    setTimeout(() => {
                                        history.push("/customers");
                                    }, 1500);
                                    setReloadPage(!reloadPage);
                                }
                                else {
                                    toast.error(response.data?.message, {
                                        position: toast.POSITION.TOP_RIGHT
                                    });
                                }
                            });
                    }
                },
                {
                    label: 'No',
                    className: 'btn btn-outline-secondary btn-lg',
                    onClick: () => {

                    }
                }
            ]
        });
    };

    const handleCustomerActiveDeactive = (userid, e) => {
        const params = new FormData();
        params.append("userid", userid);
        params.append("status", e.target.checked ? 1 : 0);
        params.append("type", 'client');
        //let currentStatus = e.target.checked;

        APIService.updateCustomerActiveDeactive(params)
            .then((response) => {
                if (response.data?.status) {
                    toast.success(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                    /*if (currentStatus) {
                        let activeCustomerListData = activeCustomerList;
                        activeCustomerListData.push(userid);
                        setActiveCustomerList(activeCustomerListData);
                        setActiveCustomerListRefresh(!activeCustomerListRefresh);
                    }
                    else {
                        let activeCustomerListData = activeCustomerList.filter(function (mapUserid) {
                            return mapUserid !== userid && mapUserid !== 0;
                        });
                        setActiveCustomerList(activeCustomerListData);
                        setActiveCustomerListRefresh(!activeCustomerListRefresh);
                    }*/
                    setReloadPage(!reloadPage);
                }
                else {
                    toast.error(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            });
    }

    const addNewCustomer = async () => {
        clearControl();
        cstShowAddCustomerModal();
    };

    const saveNewCustomer = async () => {
        setSaveProcess(true);
        setFormErrors([]);
        let validate = validateForm((CompanyValidator(companyInput.current?.value)));
        if (Object.keys(validate).length) {
            setSaveProcess(false);
            setFormErrors(validate);
        }
        else {
            let params = {};
            params["company"] = companyInput.current?.value;
            params["website"] = websiteInput.current?.value;
            params["ignore"] = ignore ? 1 : 0;
            APIService.addClient(params)
                .then((response) => {
                    if (response.data?.status) {
                        if (response.data?.data?.ignore_status === 1) {
                            setFormErrors({ companyInput: response.data?.message });
                            setSaveProcess(false);
                            setIgnore(true);
                        }
                        else {
                            toast.success(response.data?.message, {
                                position: toast.POSITION.TOP_RIGHT
                            });
                            cstSetCloseAddCustomerModal();
                            setSaveProcess(false);
                            let id = response.data?.data?.insertId;
                            history.push(`/customer/profile/${id}`);
                        }
                    }
                    else {
                        toast.error(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setSaveProcess(false);
                    }
                })
                .catch((error) => {
                    toast.error(error, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                    setSaveProcess(false);
                });
        }
    };

    const clearControl = async () => {
        setFormErrors([]);
        setIgnore(false);
        if (companyInput?.current !== undefined && companyInput.current?.value)
            companyInput.current.value = '';
        if (websiteInput?.current !== undefined && websiteInput.current?.value)
            websiteInput.current.value = '';
    };

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <Header pagename={name} />
                <div className="inner-content pt-0 px-0">
                    <div className="customers-page ">
                        <div className="bg-white py-3 px-4 px-lg-7 page-inner-header">
                            <Row>
                                <Col md={6} >
                                    <PermissionCheck permissions={['customers.create']}>
                                        <Button variant="primary" size="md" className='me-2' onClick={addNewCustomer}>New Customer</Button>
                                    </PermissionCheck>
                                    <PermissionCheck permissions={['customers.view']}>
                                        <Link to="/all-contacts" className='btn btn-primary btn-md'>Contacts</Link>
                                    </PermissionCheck>
                                </Col>
                                <Col md={6} className="d-flex justify-content-md-end">
                                    <Form.Check className='mb-0 mt-md-2 mt-4 ms-md-auto' type="checkbox" id="exclude-inactive-customers" label="Exclude Inactive Customers" value="1" checked={activeCustomerFilter} onChange={(e) => setActiveCustomerFilter(e.target.checked)} />
                                </Col>
                            </Row>
                        </div>
                        <div className="pt-9 px-4 px-lg-7">
                            <h3>Customers Summary:</h3>
                            <Row className="row-cols-2 row-cols-xl-3 row-cols-xxl-6 mb-7">
                                <Col>
                                    <Card className="rounded-12 border border-gray-100 leave-card mt-4">
                                        <Card.Body className="p-3 px-xxl-4">
                                            <Row className="align-items-center">
                                                <Col>
                                                    <span className="h2 mb-0">{customersSummary?.total_customers ? customersSummary?.total_customers : 0}</span>
                                                    <span className="caption text-gray-600 d-block mb-1">Total<br /> Customers</span>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col>
                                    <Card className="rounded-12 border border-gray-100 leave-card mt-4">
                                        <Card.Body className="p-3 px-xxl-4">
                                            <Row className="align-items-center">
                                                <Col>
                                                    <span className="h2 mb-0">{customersSummary?.active_customers ? customersSummary?.active_customers : 0}</span>
                                                    <span className="caption text-gray-600 d-block mb-1">Active<br /> Customers</span>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col>
                                    <Card className="rounded-12 border border-gray-100 leave-card mt-4">
                                        <Card.Body className="p-3 px-xxl-4">
                                            <Row className="align-items-center">
                                                <Col>
                                                    <span className="h2 mb-0">{customersSummary?.inactive_customers ? customersSummary?.inactive_customers : 0}</span>
                                                    <span className="caption text-gray-600 d-block mb-1">Inactive<br /> Customers</span>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col>
                                    <Card className="rounded-12 border border-gray-100 leave-card mt-4">
                                        <Card.Body className="p-3 px-xxl-4">
                                            <Row className="align-items-center">
                                                <Col>
                                                    <span className="h2 mb-0">{customersSummary?.active_conatcts ? customersSummary?.active_conatcts : 0}</span>
                                                    <span className="caption text-gray-600 d-block mb-1">Active<br /> Contacts</span>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col>
                                    <Card className="rounded-12 border border-gray-100 leave-card mt-4">
                                        <Card.Body className="p-3 px-xxl-4">
                                            <Row className="align-items-center">
                                                <Col>
                                                    <span className="h2 mb-0">{customersSummary?.inactive_conatcts ? customersSummary?.inactive_conatcts : 0}</span>
                                                    <span className="caption text-gray-600 d-block mb-1">Inactive<br /> Contacts</span>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col>
                                    <Card className="rounded-12 border border-gray-100 leave-card mt-4">
                                        <Card.Body className="p-3 px-xxl-4">
                                            <Row className="align-items-center">
                                                <Col>
                                                    <span className="h2 mb-0">{customersSummary?.today_logged_in_conatcts ? customersSummary?.today_logged_in_conatcts : 0}</span>
                                                    <span className="caption text-gray-600 d-block mb-1">Contacts<br /> Logged In Today</span>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            <Card className="rounded-10 p-6">
                                <Card.Body className="p-0">
                                    {process ?
                                        <Spinner className='me-1' animation="border" variant="primary" />
                                        :
                                        <>
                                            <DataTableWithPagination columns={columns} data={customerList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isBulkAction={false} exportData={exportData} />
                                        </>
                                    }
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                    <Offcanvas show={showAddCustomerModal} onHide={cstSetCloseAddCustomerModal} className="add-leave-sidebar" placement="end">
                        <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
                            <div className="d-flex align-items-center">
                                <h3 className="m-0">Add New Customer</h3>
                            </div>
                            <ul className="ovrlay-header-icons">
                                <li>
                                    <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={cstSetCloseAddCustomerModal}>
                                        <i className="icon-cancel"></i>
                                    </button>
                                </li>
                            </ul>
                        </Offcanvas.Header>
                        <Offcanvas.Body className="p-0">
                            <Form onSubmit={async e => { e.preventDefault(); await saveNewCustomer() }}>
                                <SimpleBar className="offcanvas-inner">
                                    <div className="p-6">
                                        <Row className="g-7">
                                            <Col xs={12} >
                                                <Form.Label className="d-block">Company<span className='validation-required-direct'></span></Form.Label>
                                                <Form.Control placeholder="Company" ref={companyInput} className={`description-area placeholder-dark  dark-2 ${formErrors.companyInput && 'is-invalid'}`} />
                                                {formErrors.companyInput && (
                                                    <span className="text-danger">{formErrors.companyInput}</span>
                                                )}
                                            </Col>
                                            <Col xs={12} >
                                                <Form.Label className="d-block">Website</Form.Label>
                                                <Form.Control placeholder="Website" ref={websiteInput} className={`placeholder-dark  dark-2`} />
                                            </Col>
                                        </Row>
                                        <div className="mt-7 text-end">
                                            <Button disabled={saveProcess} variant="primary" size="md" type="submit">
                                                {
                                                    !saveProcess && 'Save'
                                                }
                                                {
                                                    saveProcess && <><Spinner size="sm" animation="border" className="me-1" />Save</>
                                                }
                                            </Button>
                                        </div>
                                    </div>
                                </SimpleBar>
                            </Form>
                        </Offcanvas.Body>
                    </Offcanvas>
                </div>
                <Footer />
            </div>
        </>
    );
}
const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(Customers)