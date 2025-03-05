import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import SimpleBar from 'simplebar-react';
import { Card, Spinner, Form, Button, Dropdown, Offcanvas, Row, Col, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import CustomerLeftPanel from './CustomerLeftPanel';
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import APIService from "../../api/APIService";
import moment from 'moment';
import { display_date_format_with_time, pagination, popperConfig } from '../../settings';
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import DefaultProfile from "../../assets/img/placeholder-image.png";
import { generateRandomPassword, check } from "../../utils/functions.js";
import { validateForm } from "../../utils/validator.js";
import { ContactValidator } from "../../modules/validation/CompanyValidator";
import { confirmAlert } from 'react-confirm-alert';
import { DELETE_CONTACT } from '../../modules/lang/Customer';
import { connect } from "react-redux";

function CustomersContacts({ name, userData }) {
    const [firstLoad, setFirstLoad] = useState(true);
    const [contactList, setContactList] = useState([]);
    const [activeContactList, setActiveContactList] = useState([]);
    const [process, setProcess] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchFilter, setSearchFilter] = useState('');
    const [sort, setSort] = useState(pagination.sorting);
    const [sortby, setSortBy] = useState('id');
    const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
    const [exportData, setExportData] = useState([]);
    const [activeContactListRefresh, setActiveContactListRefresh] = useState(false);
    let { id } = useParams();
    const [companyName, setCompanyName] = useState('');
    const [reloadPage, setReloadPage] = useState(false);

    const [showAddContactModal, setShowAddContactModal] = useState(false);
    const cstSetCloseAddContactModal = () => setShowAddContactModal(false);
    const cstShowAddContactModal = () => setShowAddContactModal(true);
    const [saveProcess, setSaveProcess] = useState(false);
    const [formErrors, setFormErrors] = useState([]);

    const [contactId, setContactId] = useState(0);
    const profileInput = useRef(null);
    const passwordInput = useRef(null);
    const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState(DefaultProfile);
    const [contactProfile, setContactProfile] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [position, setPosition] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [direction, setDirection] = useState('');
    const [password, setPassword] = useState('');
    const [primaryContact, setPrimaryContact] = useState(false);
    const [doNotSendEmail, setDoNotSendEmail] = useState(true);
    const [sendPasswordEmail, setSendPasswordEmail] = useState(false);
    const [permissionProject, setPermissionProject] = useState(true);
    const [notificationProject, setNotificationProject] = useState(true);
    const [notificationProjectTask, setNotificationProjectTask] = useState(true);
    const [tableLoader, setTableLoader] = useState(false);

    useEffect(() => {
        fetchCustomerContactList();
        setFirstLoad(false);
    }, [sort, sortby, page, perPageSize]);

    useEffect(() => {
        if (firstLoad === false) {
            setPage(1);
            if (page === 1) {
                const timer = setTimeout(() => {
                    fetchCustomerContactList();
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [searchFilter, reloadPage]);

    useEffect(() => {
        APIService.getClientForEdit(id)
            .then((response) => {
                if (response.data?.status) {
                    setCompanyName(response.data?.data?.company);
                }
            });
    }, []);

    useEffect(() => {
    }, [activeContactListRefresh]);

    const fetchCustomerContactList = () => {
        setTableLoader(true);
        let params = "?";
        params = params + "sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby + "&company_id=" + id;
        if (searchFilter !== '') {
            params = params + "&search=" + searchFilter;
        }

        APIService.getContactLists(params)
            .then((response) => {
                if (response.data?.status) {
                    setTotalPages(response.data?.pagination?.total_pages);
                    setTotalRecords(response.data?.pagination?.total_records);
                    setContactList(response.data?.data);
                    setTableLoader(false);
                    let activecontactListData = response.data?.data?.map(({ active, id }) => {
                        if (active === 1)
                            return id;
                        else
                            return 0;
                    })
                    setActiveContactList(activecontactListData);

                    let exportHeader = ["#", "First Name", "Last Name", "Email", "Company", "Phone", "Position", "Last Login", "Active / In-Active"];
                    let exportData = [];
                    response.data?.data?.map(item => {
                        exportData.push(
                            {
                                id: item.id,
                                firstname: item.firstname,
                                lastname: item.lastname,
                                email: item.email ? item.email : '',
                                company: item.company,
                                phonenumber: item.phonenumber ? item.phonenumber : '',
                                position: item.position ? item.position : '',
                                last_login: item.last_login ? moment(item.last_login).format(display_date_format_with_time) : '',
                                active: item.active === 1 ? 'Active' : 'In-Active',
                            });
                        return '';
                    });
                    setExportData({ fileName: "contact-data", sheetTitle: "Contacts", exportHeader: exportHeader, exportData: exportData });
                    setProcess(false);
                }
            });
    }

    let columns = [
        {
            Header: 'First Name',
            id: 'firstname',
            accessor: (row) => row?.firstname,
        },
        {
            Header: 'Last Name',
            id: 'lastname',
            accessor: (row) => row?.lastname,
        },
        {
            Header: 'Email',
            id: 'email',
            accessor: (row) => row?.email,
        },
        {
            Header: 'Phone',
            id: 'phonenumber',
            accessor: (row) => row?.phonenumber,
        },
        {
            Header: 'Position',
            id: 'title',
            accessor: (row) => row?.position,
        },
        {
            Header: 'Last Login',
            id: 'last_login',
            accessor: (row) => row?.last_login && moment(new Date(row?.last_login)).format(display_date_format_with_time),
        },
        {
            Header: 'Active',
            id: 'active',
            accessor: (row) => (
                <>
                    <Form.Check type="switch" id={`active-radio-${row?.id}`} checked={activeContactList.indexOf(row?.id) > -1} onChange={(e) => { handleContactActiveDeactive(row?.id, e) }} />
                </>
            ),
        },
    ];

    if (check(['customers.update', 'customers.delete'], userData?.role.getPermissions)) {
        columns = [
            ...columns,
            {
                Header: 'Action',
                disableSortBy: true,
                Cell: ({ row }) => (
                    <>
                        <Dropdown className="category-dropdown edit-task-dropdown">
                            <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="cursor-pointer" id="edit-task"><button size="sm" className='btn btn-white circle-btn btn-icon btn-sm'><i className="fa-solid fa-ellipsis-vertical"></i></button></Dropdown.Toggle>
                            <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2" popperConfig={popperConfig}>
                                <PermissionCheck permissions={['customers.update']}>
                                    <Dropdown.Item onClick={() => { editCustomerContact(row?.original?.id) }}>
                                        Edit
                                    </Dropdown.Item>
                                </PermissionCheck>
                                <PermissionCheck permissions={['customers.delete']}>
                                    <Dropdown.Item className="text-danger" onClick={() => { deleteCustomerContact(row?.original?.id) }}>
                                        Delete
                                    </Dropdown.Item>
                                </PermissionCheck>
                            </Dropdown.Menu>
                        </Dropdown>
                    </>
                ),
            },
        ]
    }

    const deleteCustomerContact = (id) => {
        confirmAlert({
            title: 'Confirm',
            message: DELETE_CONTACT,
            buttons: [
                {
                    label: 'Yes',
                    className: 'btn btn-primary btn-lg',
                    onClick: () => {
                        let params = {};
                        params["id"] = id;
                        APIService.deleteContact(params)
                            .then((response) => {
                                if (response.data?.status) {
                                    toast.success(response.data?.message, {
                                        position: toast.POSITION.TOP_RIGHT
                                    });
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

    const editCustomerContact = (id) => {
        let editContactData = contactList.filter(function (arr) {
            return arr.id === id;
        });
        if (editContactData.length > 0) {
            clearControl();
            let data = editContactData[0];
            setContactId(id);
            setFirstName(data.firstname);
            setLastName(data.lastname);
            setPosition(data.position);
            setEmail(data.email);
            setPhone(data.phonenumber);
            setDirection(data.direction);
            setPassword('');
            setPrimaryContact(data.is_primary === 1);
            if (data.profile_image) {
                setProfileImagePreviewUrl(data.profile_image);
            }
            setPermissionProject(data.permission_id === 6);
            setNotificationProject(data.project_emails === 1);
            setNotificationProjectTask(data.task_emails === 1);
            cstShowAddContactModal();
        }
    };

    const handleContactActiveDeactive = (userid, e) => {
        const params = new FormData();
        params.append("userid", userid);
        params.append("status", e.target.checked ? 1 : 0);
        params.append("type", 'contact');
        let currentStatus = e.target.checked;

        APIService.updateCustomerActiveDeactive(params)
            .then((response) => {
                if (response.data?.status) {
                    toast.success(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                    if (currentStatus) {
                        let activeContactListData = activeContactList;
                        activeContactListData.push(userid);
                        setActiveContactList(activeContactListData);
                        setActiveContactListRefresh(!activeContactListRefresh);
                    }
                    else {
                        let activeContactListData = activeContactList.filter(function (mapUserid) {
                            return mapUserid !== userid && mapUserid !== 0;
                        });
                        setActiveContactList(activeContactListData);
                        setActiveContactListRefresh(!activeContactListRefresh);
                    }
                }
                else {
                    toast.error(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            });
    }

    const addContact = async () => {
        clearControl();
        cstShowAddContactModal();
    };

    const clearControl = async () => {
        setFormErrors([]);
        setProfileImagePreviewUrl(DefaultProfile);
        setContactId(0);
        setContactProfile('');
        setFirstName('');
        setLastName('');
        setPosition('');
        setEmail('');
        setPhone('');
        setDirection('');
        setPassword('');
        setPrimaryContact(false);
        setDoNotSendEmail(false);
        setSendPasswordEmail(false);
        setPermissionProject(true);
        setNotificationProject(true);
        setNotificationProjectTask(true);
    };

    const addUpdateContact = async () => {
        setSaveProcess(true);
        setFormErrors([]);
        let validate = validateForm((ContactValidator(firstName, lastName, email, contactId === 0 ? password : 'Sam@123456')));
        if (Object.keys(validate).length) {
            setSaveProcess(false);
            setFormErrors(validate);
        }
        else {
            const params = new FormData();
            params.append("userid", id);
            params.append("firstname", firstName);
            params.append("lastname", lastName);
            params.append("email", email);
            if (password !== '') {
                params.append("password", password);
            }
            params.append("phonenumber", phone);
            params.append("position", position);
            params.append("direction", direction);
            params.append("is_primary", primaryContact ? 1 : 0);
            params.append("project_emails", notificationProject ? 1 : 0);
            params.append("task_emails", notificationProjectTask ? 1 : 0);
            params.append("send_email", !doNotSendEmail ? 1 : 0);
            params.append("send_password_email", sendPasswordEmail ? 1 : 0);
            if (contactProfile !== '') {
                params.append(
                    "profile_image",
                    contactProfile
                );
            }
            if (permissionProject)
                params.append("permissions", 6);

            if (contactId === 0) {
                APIService.addContact(params)
                    .then((response) => {
                        if (response.data?.status) {
                            toast.success(response.data?.message, {
                                position: toast.POSITION.TOP_RIGHT
                            });
                            setReloadPage(!reloadPage);
                            clearControl();
                            cstSetCloseAddContactModal();
                            setSaveProcess(false);
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
            else {
                params.append("id", contactId);
                APIService.updateContact(params)
                    .then((response) => {
                        if (response.data?.status) {
                            toast.success(response.data?.message, {
                                position: toast.POSITION.TOP_RIGHT
                            });
                            setReloadPage(!reloadPage);
                            clearControl();
                            cstSetCloseAddContactModal();
                            setSaveProcess(false);
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
        }
    };

    const OpenFileChoose = async (e) => {
        profileInput.current.click();
    }

    const photoUpdateForPreview = async (e) => {
        e.preventDefault();
        const reader = new FileReader();
        const file = e.target.files[0];
        setContactProfile(file);
        reader.onloadend = () => {
            setProfileImagePreviewUrl(reader.result);
        }
        reader.readAsDataURL(file);
    }

    return (
        <div>
            <Sidebar />
            <div className="main-content">
                <Header pagename={name ? name : ''} />
                <div className="inner-content">
                    <div className="paln-page row">
                        <div className="col-12 col-xl-3 mb-3">
                            <CustomerLeftPanel activeMenu="contacts" companyName={companyName} id={id} process={process} />
                        </div>
                        <div className="col-12 col-xl-9">
                            <Card className="rounded-10 border border-gray-100 mb-4">
                                <Card.Body className="p-0">
                                    <div className="d-md-flex flex-wrap align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100 justify-content-between">
                                        <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Contacts </h3>
                                        <div className="d-flex mt-md-0 mt-3 flex-md-row flex-column align-items-start">
                                            <PermissionCheck permissions={['customers.create']}>
                                                <Button variant="primary" size="md" type="button" onClick={addContact}>New Contact</Button>
                                            </PermissionCheck>
                                        </div>
                                    </div>
                                </Card.Body>
                                <Card.Body className="p-0 p-md-4">
                                    <div className="pt-2 pt-md-2">
                                        {process ?
                                            <Spinner className='me-1' animation="border" variant="primary" />
                                            :
                                            <>
                                                <DataTableWithPagination columns={columns} data={contactList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isBulkAction={false} exportData={exportData} />
                                            </>
                                        }
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                    <Offcanvas show={showAddContactModal} onHide={cstSetCloseAddContactModal} className="add-leave-sidebar" placement="end">
                        <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
                            <div className="d-flex align-items-center">
                                <h3 className="m-0">Contact</h3>
                            </div>
                            <ul className="ovrlay-header-icons">
                                <li>
                                    <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={cstSetCloseAddContactModal}>
                                        <i className="icon-cancel"></i>
                                    </button>
                                </li>
                            </ul>
                        </Offcanvas.Header>
                        <Offcanvas.Body className="p-0">
                            <Form onSubmit={async e => { e.preventDefault(); await addUpdateContact() }}>
                                <SimpleBar className="offcanvas-inner">
                                    <div className="p-6">
                                        <Row className="g-7">
                                            <Col xs={12} sm={12} md={12}>
                                                <div className="profile-uploader mx-auto">
                                                    <div className="upload-btn-wrap">
                                                        <button type="button" className="btn-icon circle-btn btn btn-dark-100 font-12 btn-sm" onClick={OpenFileChoose}>
                                                            <i className="icon-edit"></i>
                                                        </button>
                                                    </div>
                                                    <div className="profile-image-upload-block">
                                                        <img src={profileImagePreviewUrl} alt="Profile" className="profile-image placeholder-profile" />
                                                        <input id="photo-upload" type="file" className='d-none' alt='Profile Image' accept="image/png, image/gif, image/jpeg" ref={profileInput} onChange={photoUpdateForPreview} />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col xs={12} sm={12} md={12}>
                                                <Form.Label className="d-block">First Name<span className='validation-required-direct'></span></Form.Label>
                                                <Form.Control className={`description-area placeholder-dark  dark-2 ${formErrors.firstNameInput && 'is-invalid'}`} value={firstName} onChange={(e) => { setFirstName(e.target.value) }} />
                                                {formErrors.firstNameInput && (
                                                    <span className="text-danger">{formErrors.firstNameInput}</span>
                                                )}
                                            </Col>
                                            <Col xs={12} sm={12} md={12}>
                                                <Form.Label className="d-block">Last Name<span className='validation-required-direct'></span></Form.Label>
                                                <Form.Control className={`description-area placeholder-dark  dark-2 ${formErrors.lastNameInput && 'is-invalid'}`} value={lastName} onChange={(e) => { setLastName(e.target.value) }} />
                                                {formErrors.lastNameInput && (
                                                    <span className="text-danger">{formErrors.lastNameInput}</span>
                                                )}
                                            </Col>
                                            <Col xs={12} sm={12} md={12}>
                                                <Form.Label className="d-block">Position</Form.Label>
                                                <Form.Control className={`description-area placeholder-dark  dark-2`} value={position} onChange={(e) => { setPosition(e.target.value) }} />
                                            </Col>
                                            <Col xs={12} sm={12} md={12}>
                                                <Form.Label className="d-block">Email<span className='validation-required-direct'></span></Form.Label>
                                                <Form.Control className={`description-area placeholder-dark  dark-2 ${formErrors.emailInput && 'is-invalid'}`} value={email} onChange={(e) => { setEmail(e.target.value) }} />
                                                {formErrors.emailInput && (
                                                    <span className="text-danger">{formErrors.emailInput}</span>
                                                )}
                                            </Col>
                                            {!sendPasswordEmail &&
                                                <Col xs={12} sm={12} md={12}>
                                                    <Form.Label className="d-block">Password{contactId === 0 && <span className='validation-required-direct'></span>}</Form.Label>
                                                    <InputGroup className="mb-3">
                                                        <Form.Control type='password' className={`description-area placeholder-dark  dark-2 ${formErrors.passwordInput && 'is-invalid'}`} ref={passwordInput} value={password} onChange={(e) => { setPassword(e.target.value) }} />
                                                        <InputGroup.Text id="basic-addon1" className='cursor-pointer' onClick={() => { passwordInput.current.type === 'text' ? passwordInput.current.type = "password" : passwordInput.current.type = "text" }}>
                                                            <i className="fa fa-eye"></i>
                                                        </InputGroup.Text>
                                                        <InputGroup.Text className='cursor-pointer' id="basic-addon1" onClick={() => { generateRandomPassword(setPassword) }}>
                                                            <i className="fa fa-refresh"></i>
                                                        </InputGroup.Text>
                                                    </InputGroup>
                                                    {contactId !== 0 &&
                                                        <p className="text-muted">Note: if you populate this field, password will be changed on this contact.</p>
                                                    }
                                                    {formErrors.passwordInput && (
                                                        <span className="text-danger">{formErrors.passwordInput}</span>
                                                    )}
                                                </Col>
                                            }
                                            <Col xs={12} sm={12} md={12}>
                                                <Form.Label className="d-block">Phone</Form.Label>
                                                <Form.Control type='number' className={`description-area placeholder-dark  dark-2`} value={phone} onChange={(e) => { setPhone(e.target.value) }} />
                                            </Col>
                                            <hr className='my-3' />
                                            <Col xs={12} sm={12} md={12} className="mt-2">
                                                <Form.Check type="checkbox" id="primary-contact" label="Primary Contact" checked={primaryContact} onChange={(e) => { setPrimaryContact(e.target.checked) }} />
                                                <Form.Check type="checkbox" id="send-set-password-email" label="Send set password link to email" checked={sendPasswordEmail} onChange={(e) => { setSendPasswordEmail(e.target.checked); generateRandomPassword(setPassword) }} />
                                            </Col>
                                            {/* for temp hide */}
                                            {1 === 0 &&
                                                <>
                                                    <hr className='my-3' />
                                                    <Col xs={12} sm={12} md={12} className="mt-2">
                                                        <Form.Label className="d-block">Permissions</Form.Label>
                                                        <p className="text-danger">Make sure to set appropriate permissions for this contact</p>
                                                        <Form.Check type="switch" id="permissions-project" label="Projects" checked={permissionProject} onChange={(e) => { setPermissionProject(e.target.checked); }} />
                                                    </Col>
                                                    <hr className='my-3' />
                                                    <Col xs={12} sm={12} md={12} className="mt-2">
                                                        <Form.Label className="d-block">Email Notifications</Form.Label>
                                                        <Row>
                                                            <Col xs={4} sm={4} md={4} className="mt-2">
                                                                <Form.Check type="switch" id="email-notification-project" label="Project" checked={notificationProject} onChange={(e) => { setNotificationProject(e.target.checked); }} />
                                                            </Col>
                                                            <Col xs={8} sm={8} md={8} className="mt-2">
                                                                <Form.Check type="switch" id="email-notification-task" label={(<>Task<OverlayTrigger placement="top" overlay={<Tooltip id="button-tooltip">Only project related tasks</Tooltip>} >
                                                                    <span className='cursor-pointer'><i className="fa fa-question-circle ms-2"></i></span>
                                                                </OverlayTrigger></>)} checked={notificationProjectTask} onChange={(e) => { setNotificationProjectTask(e.target.checked); }} />
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </>
                                            }
                                        </Row>
                                    </div>
                                </SimpleBar>
                                <div className="add-comment-area  px-6 py-3 border-top border-gray-100 text-end">
                                    <Button disabled={saveProcess} variant="primary" size="md" type="submit">
                                        {
                                            !saveProcess && 'Save'
                                        }
                                        {
                                            saveProcess && <><Spinner size="sm" animation="border" className="me-1" />Save</>
                                        }
                                    </Button>
                                </div>
                            </Form>
                        </Offcanvas.Body>
                    </Offcanvas>
                </div>
                <Footer />
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(CustomersContacts)