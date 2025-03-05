import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Dropdown, Card, Col, Row, Tooltip, OverlayTrigger, Form, Spinner, Button } from 'react-bootstrap';
import APIService from "../../api/APIService";
import moment from 'moment';
import { pagination, popperConfig, databaseRoleCode, display_date_format_with_time } from '../../settings';
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { connect } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import LastSeen from "../../modules/custom/LastSeen";
import { ACTIVE_DEACTIVE_MESSAGE } from '../../modules/lang/User';
import { check, encryptToken } from "../../utils/functions.js";
import UserListLoader from '../../modules/custom/SkeletonLoader/UserListLoader';
import AvatarImg from "../../assets/img/placeholder-image.png";
import { CheckLg } from 'react-bootstrap-icons';

function AgencyUsers({ name, userData }) {
    const history = useHistory();
    const [staffList, setStaffList] = useState([]);
    const [firstLoad, setFirstLoad] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchFilter, setSearchFilter] = useState('');
    const [sort, setSort] = useState("desc");
    const [sortby, setSortBy] = useState("created_at");
    const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
    const [exportData, setExportData] = useState([]);
    const [reloadPage, setReloadPage] = useState(false);
    const [activeUserFilter, setActiveUserFilter] = useState(true);
    const [activeUserList, setActiveUserList] = useState([]);
    const [tableLoader, setTableLoader] = useState(false);
    const [pageLoader, setPageLoader] = useState(true);
    const [showButton, setShowButton] = useState(false);
    const [process, setProcess] = useState(false);
    const [refrashLoad, setRefrashLoad] = useState(false);

    const fetchUserList = () => {
        setTableLoader(true);
        let params = "?is_not_staff=1&";
        params = params + "sort=" + sortby + ':' + sort + "&limit=" + perPageSize + "&page=" + page;
        if (searchFilter !== '') {
            params = params + "&search=" + searchFilter;
        }
        if (activeUserFilter)
            params = params + "&active=1";

        APIService.getAgencyList(params)
            .then((response) => {
                if (response.data?.status) {
                    setTotalPages(response.data?.pagination?.total_pages);
                    setTotalRecords(response.data?.pagination?.total_records);
                    let newData = response.data?.data;
                    setStaffList(newData);
                    setTableLoader(false);
                    let activeUserListData = newData.map(({ active, id }) => {
                        if (active === 1)
                            return id;
                        else
                            return 0;
                    })
                    setActiveUserList(activeUserListData);
                    let exportHeader = ["#", "Name", "Email", "Agency", "Role", "Last Login", "Active / Deactive"];
                    let exportData = [];
                    newData?.map(item => {
                        exportData.push(
                            {
                                id: item.id,
                                name: `${item.firstname} ${item.lastname}`,
                                email: item.email ? item.email : '',
                                agency: item.agency_name ? item.agency_name : '',
                                role: item.role ? item.role : '',
                                last_login: item.last_login ? moment(item.last_login).format(display_date_format_with_time) : '',
                                active: item.active === 1 ? 'Active' : 'Deactive',
                            });
                        return '';
                    });
                    setExportData({ fileName: "agency-user-data", sheetTitle: "Agency User", exportHeader: exportHeader, exportData: exportData });
                }
            });
    }

    useEffect(() => {
        if (userData.role.code !== databaseRoleCode.clientCode && userData.role.code !== databaseRoleCode.agencyCode && userData.role.code !== databaseRoleCode.agencyMemberCode) {
            fetchUserList();
            setFirstLoad(false);
        }
    }, [sort, sortby, page, perPageSize]);

    useEffect(() => {
        if (userData.role.code !== databaseRoleCode.clientCode && userData.role.code !== databaseRoleCode.agencyCode && userData.role.code !== databaseRoleCode.agencyMemberCode) {
            if (firstLoad === false) {
                setPage(1);
                if (page === 1) {
                    const timer = setTimeout(() => {
                        fetchUserList();
                    }, 500);
                    return () => clearTimeout(timer);
                }
            }
        }
    }, [searchFilter, activeUserFilter, reloadPage]);

    const fetchUserListForAgency = () => {
        //let params = "?";
        let params = "?is_not_staff=1&";
        params = params + "sort=" + pagination.sorting + "&limit=" + pagination.perPageRecordForUser + "&page=" + page;
        if (searchFilter !== '') {
            params = params + "&searchFilter=" + searchFilter;
        }
        if (activeUserFilter)
            params = params + "&active=1";

        APIService.getAgencyList(params)
            .then((response) => {
                if (response.data?.status) {
                    setShowButton(response.data?.pagination?.total_pages > page);
                    setTotalRecords(response.data?.pagination?.total_records);
                    let newData = [];
                    if (page === 1) {
                        newData = response.data?.data;
                    }
                    else {
                        newData = staffList.concat(response.data?.data);
                    }
                    setProcess(false);
                    setStaffList(newData);
                    setPageLoader(false);
                }
            });
    }

    useEffect(() => {
        if (userData.role.code === databaseRoleCode.clientCode || userData.role.code === databaseRoleCode.agencyCode || userData.role.code === databaseRoleCode.agencyMemberCode) {
            fetchUserListForAgency();
            setFirstLoad(false);
        }
    }, [page]);

    useEffect(() => {
        if (userData.role.code === databaseRoleCode.clientCode || userData.role.code === databaseRoleCode.agencyCode || userData.role.code === databaseRoleCode.agencyMemberCode) {
            if (firstLoad === false) {
                setPage(1);
                //if (search.length > 2 || search === '') {
                if (page === 1) {
                    const timer = setTimeout(() => {
                        fetchUserListForAgency();
                    }, 500);
                    return () => clearTimeout(timer);
                }
                //}
            }
        }
    }, [searchFilter, activeUserFilter, reloadPage]);

    useEffect(() => {
    }, [refrashLoad]);

    const handleUserEdit = async (id) => {
        history.push(`/edit-agency-user/${id}`);
    };

    const handleEnableDisableStaff = async (staffid, e) => {
        let active_deactive_status = "activate";
        let active = e.target.checked ? 1 : 0;
        if (active === 0) {
            active_deactive_status = "deactivate";
        }
        confirmAlert({
            title: 'Confirm',
            message: ACTIVE_DEACTIVE_MESSAGE.replace("{active_deactive_status}", active_deactive_status),
            buttons: [
                {
                    label: 'Yes',
                    className: 'btn btn-primary btn-lg',
                    onClick: () => {
                        let params = {};
                        params["staffid"] = staffid;
                        params["active"] = active;
                        APIService.enableDisableStaff(params)
                            .then((response) => {
                                if (response.data?.status) {
                                    setReloadPage(!reloadPage);
                                    toast.success(response.data?.message, {
                                        position: toast.POSITION.TOP_RIGHT
                                    });
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

    let columns = [
        {
            Header: 'Name',
            id: 'full_name',
            accessor: (staffList) => staffList.full_name,
            Cell: ({ row }) => (
                <>
                    {userData.role.code !== databaseRoleCode.clientCode && userData.role.code !== databaseRoleCode.agencyCode && userData.role.code !== databaseRoleCode.agencyMemberCode ?
                        <Link className="dark-1" to={`/agency-user-detail/${row?.original?.id}`}>{`${row?.original?.full_name}`}</Link>
                        : `${row?.original?.full_name}`
                    }
                </>
            ),
        },
        {
            Header: 'Email',
            id: 'email',
            accessor: (staffList) => staffList.email,
        },
        {
            Header: 'Agency',
            id: 'agency_name',
            accessor: (staffList) => staffList.agency_name,
        },
        {
            Header: 'Role',
            id: 'role',
            accessor: (staffList) => staffList.role_name,
        },
        {
            Header: 'Last Login',
            id: 'last_login',
            accessor: (staffList) => staffList.last_login,
            Cell: ({ row }) => (
                <>
                    {row?.original?.last_login && row?.original?.last_login !== null ?
                        <OverlayTrigger placement="bottom" overlay={<Tooltip id={`tooltip-1`}> {moment(row?.original?.last_login).format(display_date_format_with_time)}</Tooltip>}>
                            <span className='font-weight-regular'>
                                <LastSeen date={Date.parse(moment(row?.original?.last_login).format())} />
                            </span>
                        </OverlayTrigger>
                        : 'Never'
                    }
                </>
            ),
        },
        // {
        //     Header: 'Project Manager',
        //     id: 'pc_members',
        //     disableSortBy: true,
        //     accessor: (staffList) => staffList.pc_members,
        //     Cell: ({ row }) => (
        //         <>
        //             {row?.original?.pc_members.length > 0 ?
        //                 row?.original?.pc_members?.map((pcUser, pcIndex) => (
        //                     <span className="font-weight-regular" key={pcIndex}>{pcIndex + 1 === row?.original?.pc_members.length ? pcUser.name : `${pcUser.name}, `}</span>
        //                 ))
        //                 : ''
        //             }
        //         </>
        //     ),
        // },
    ];

    if (check(['agency_users.update'], userData?.role.getPermissions)) {
        columns = [
            ...columns,
            {
                Header: 'Active',
                id: 'active',
                disableSortBy: true,
                accessor: (row) => (
                    <>
                        <Form.Check type="switch" id={`active-radio-${row?.id}`} checked={activeUserList.indexOf(row?.id) > -1} onChange={(e) => { handleEnableDisableStaff(row?.id, e) }} />
                    </>
                ),
            },
        ];
    }
    console.log("userd: ", userData)

    if (check(['agency_users.update'], userData?.role.getPermissions)) {
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
                                <PermissionCheck permissions={['agency_users.update']}>
                                    <Dropdown.Item onClick={() => { handleUserEdit(row?.original?.id) }}>
                                        Edit
                                    </Dropdown.Item>
                                </PermissionCheck>
                                {userData.role.code === databaseRoleCode.adminCode &&
                                    <Dropdown.Item onClick={() => { loginUser(row?.original?.id) }}>
                                        Login User Account
                                    </Dropdown.Item>
                                }
                            </Dropdown.Menu>
                        </Dropdown>
                    </>
                ),
            },
        ]
    }

    const loginUser = (id) => {
        const params = {};
        params['user_id'] = id;
        APIService.autoLogin(params)
            .then((response) => {
                if (response.data?.status) {
                    //Old token set 
                    localStorage.setItem("accessToken_old", localStorage.getItem("rz_access_token"));
                    localStorage.setItem("refreshToken_old", localStorage.getItem("rz_refresh_token"));
                    localStorage.setItem("rz_user_role_old", localStorage.getItem("rz_user_role"));

                    //New token set
                    localStorage.setItem("rz_access_token", encryptToken(response.data?.data.access_token));
                    localStorage.setItem("rz_refresh_token", encryptToken(response.data?.data.refresh_token));
                    localStorage.setItem("rz_user_role", encryptToken(response.data?.data.role));
                    window.location = "/";
                }
                else {
                    toast.error(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            })
            .catch((error) => {
                toast.error(error, {
                    position: toast.POSITION.TOP_RIGHT
                });
            });
    };

    const handleLoadMore = async (e) => {
        setPage(page + 1);
        setProcess(true);
    };

    const copyUserEmail = (email) => {
        navigator.clipboard.writeText(email);
    };

    const handleEnableDisableStaffForAgency = async (staffid, active, index) => {
        let active_deactive_status = "activate";
        if (active === 0) {
           active_deactive_status = "deactivate";
        }
        confirmAlert({
           title: 'Confirm',
           message: ACTIVE_DEACTIVE_MESSAGE.replace("{active_deactive_status}", active_deactive_status),
           buttons: [
              {
                 label: 'Yes',
                 className: 'btn btn-primary btn-lg',
                 onClick: () => {
                    let params = {};
                    params["staffid"] = staffid;
                    params["active"] = active;
                    APIService.enableDisableStaff(params)
                       .then((response) => {
                          if (response.data?.status) {
                             let newstaffList = staffList;
                             newstaffList[index].active = active;
                             setStaffList(newstaffList);
                             setRefrashLoad(!refrashLoad);
                             toast.success(response.data?.message, {
                                position: toast.POSITION.TOP_RIGHT
                             });
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

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <Header pagename={name} />
                <div className="inner-content pt-0 px-0">
                    <div className="bg-white py-3 px-4 px-xl-7 page-inner-header">
                        <Row className='g-4 align-items-center'>
                            <Col md="auto">
                            {userData.role.code !== databaseRoleCode.agencyCode &&
                                <PermissionCheck permissions={['agency_users.create']}>
                                    <Link to="/add-agency" className="btn btn-primary btn-md"><i className="icon-add me-2"></i> Add New Agency</Link>
                                </PermissionCheck>
                            }
                            </Col>
                            <Col md="auto">
                                <PermissionCheck permissions={['agency_users.create']}>
                                    <Link to="/add-agency-user" className="btn btn-primary btn-md"><i className="icon-add me-2"></i> Add New Members</Link>
                                </PermissionCheck>
                            </Col>
                            <Col md="auto">
                                <h3 className="d-inline-block mb-0">Total Agency Members: {totalRecords ? totalRecords : 0}</h3>
                            </Col>
                            <Col lg={12} xl={4} className="d-flex justify-content-xl-end ms-auto">
                                <Form.Check className='mb-0 ms-xl-auto' type="checkbox" id="exclude-inactive-agency-member" label="Exclude Inactive Agency Member" value="1" checked={activeUserFilter} onChange={(e) => setActiveUserFilter(e.target.checked)} />
                            </Col>
                        </Row>
                    </div>
                    <div className="pt-4 pt-lg-5 pt-xl-9 px-0 px-lg-4 px-xl-7">
                        {userData.role.code !== databaseRoleCode.clientCode && userData.role.code !== databaseRoleCode.agencyCode && userData.role.code !== databaseRoleCode.agencyMemberCode ?
                            <Card className="rounded-10 p-4 p-xl-6">
                                <Card.Body className="p-0 agency-member-table">
                                    <DataTableWithPagination columns={columns} data={staffList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isBulkAction={false} exportData={exportData} />
                                </Card.Body>
                            </Card>
                            :
                            <>
                                {pageLoader ?
                                    <UserListLoader perPageRecord={pagination.perPageRecordForUser} />
                                    :
                                    <>
                                        <Row className="g-xxl-5 g-4 row-cols-xxxl-5">
                                            {staffList.length > 0 &&
                                                staffList.map((staff, index) => (
                                                    <Col xxl={3} xl={4} lg={4} md={4} sm={6} key={index}>
                                                        <Card className={`border rounded-5 p-6 h-100 overflow-hidden people-card ${staff.active === 0 ? 'border-danger' : 'border-gray-100'}`}>
                                                            <Card.Body className="p-0 text-center d-flex flex-column justify-content-center">
                                                                <div className="flex-1">
                                                                    {staff.profile_image !== '' && staff.profile_image !== null ?
                                                                        <img className="avatar-img mb-5 mx-auto" src={`${staff.profile_image}`} alt="Avatar" />
                                                                        :
                                                                        <img className="avatar-img mb-5 mx-auto" src={AvatarImg} alt="Avatar" />
                                                                    }
                                                                    <p className="font-14 font-weight-semibold dark-1 mb-1 lh-base">
                                                                        {userData.role.code !== databaseRoleCode.clientCode && userData.role.code !== databaseRoleCode.agencyCode && userData.role.code !== databaseRoleCode.agencyMemberCode ?
                                                                            <Link className="dark-1" to={`/user-detail/${staff.id}`}>{`${staff.firstname} ${staff.lastname}`}</Link>
                                                                            : `${staff.firstname} ${staff.lastname}`
                                                                        }
                                                                    </p>
                                                                    <a href={`mailto:${staff?.email}`} className="font-12 dark-3">{staff.email}</a>
                                                                    {staff.designation_name &&
                                                                        <p className="font-12 font-weight-semibold dark-1 mt-3 mb-0 lh-base">Designation:&nbsp;<span className="font-weight-regular">{staff.designation_name}</span></p>}
                                                                    {staff.role.code === databaseRoleCode.agencyCode || staff.role.code === databaseRoleCode.agencyMemberCode ?
                                                                        <>
                                                                            <p className="font-12 font-weight-semibold dark-1 mt-3 mb-0 lh-base">Agency:&nbsp;
                                                                                {staff?.pc_members.length > 0 ?
                                                                                    <OverlayTrigger overlay={<Tooltip>
                                                                                        {staff?.pc_members?.map((pcUser, pcIndex) => (
                                                                                            <span className="font-weight-regular" key={pcIndex}>{pcIndex + 1 === staff?.pc_members.length ? pcUser.name : `${pcUser.name}, `}</span>
                                                                                        ))}
                                                                                    </Tooltip>}>
                                                                                        <span className="font-weight-regular">{staff.agency_name}</span>
                                                                                    </OverlayTrigger>
                                                                                    :
                                                                                    <span className="font-weight-regular">{staff.agency_name}</span>
                                                                                }
                                                                            </p>
                                                                        </>
                                                                        : ''
                                                                    }
                                                                    <p className="font-12 font-weight-semibold dark-1 mt-3 mb-0 lh-base">
                                                                        Role:&nbsp;<span className='font-weight-regular'>
                                                                            {staff.role.code === databaseRoleCode.agencyCode && 'UnlimitedWP Customer'}
                                                                            {staff.role.code === databaseRoleCode.agencyMemberCode && 'Agency Member'}
                                                                            {staff.role.code !== databaseRoleCode.agencyMemberCode && staff.role.code !== databaseRoleCode.agencyCode && staff.role}</span>
                                                                    </p>
                                                                    <p className="font-12 font-weight-semibold dark-1 mt-3 mb-0 lh-base">Last Login:&nbsp;{staff.last_login && staff.last_login !== null ?
                                                                        <OverlayTrigger placement="bottom" overlay={<Tooltip id={`tooltip-1`}> {moment(staff.last_login).format(display_date_format_with_time)}</Tooltip>}>
                                                                            <span className='font-weight-regular'>
                                                                                <LastSeen date={Date.parse(moment(staff.last_login).format())} />
                                                                            </span>
                                                                        </OverlayTrigger>
                                                                        : 'Never'}
                                                                    </p>
                                                                </div>
                                                                <div className='card-actions'>
                                                                    <ul>

                                                                        <PermissionCheck permissions={['agency_users.update']}>
                                                                            <li>
                                                                                <OverlayTrigger placement="bottom" overlay={<Tooltip id="Edit-User"> Edit User</Tooltip>}>
                                                                                    <Link to={`/edit-agency-user/${staff.id}`} className="btn-icon-edit btn-icon circle-btn btn btn-icon-secondary btn-sm" title='Edit User'><i className="icon-edit"></i></Link>
                                                                                </OverlayTrigger>
                                                                            </li>
                                                                        </PermissionCheck>
                                                                        <li>
                                                                            <OverlayTrigger placement="bottom" overlay={<Tooltip id="Copy-User-Email"> Copy User Email</Tooltip>}>
                                                                                <span className="btn-icon-link btn-icon circle-btn btn btn-icon-secondary btn-sm" onClick={(e) => { copyUserEmail(staff.email) }} title='Copy User Email'><i className="icon-link"></i></span>
                                                                            </OverlayTrigger>
                                                                        </li>
                                                                        <PermissionCheck permissions={['agency_users.delete']}>
                                                                            <li>
                                                                                <OverlayTrigger placement="bottom" overlay={<Tooltip id="Activate-Deactivate-User"> Activate / Deactivate User</Tooltip>}>
                                                                                    {staff.active === 0 ?
                                                                                        <Form.Check type="switch" id="staff-deactive-radio" checked={false} onChange={(e) => { handleEnableDisableStaffForAgency(staff.id, 1, index) }} />
                                                                                        :
                                                                                        <Form.Check type="switch" id="staff-deactive-radio" checked={true} onChange={(e) => { handleEnableDisableStaffForAgency(staff.id, 0, index) }} />
                                                                                    }
                                                                                </OverlayTrigger>
                                                                            </li>
                                                                        </PermissionCheck>
                                                                    </ul>
                                                                </div>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                ))}
                                        </Row>
                                        {staffList.length === 0 &&
                                            <Card className='border rounded-5 p-20 h-100 people-card border-gray-100 mt-20'>
                                                <Card.Body className="p-0 text-center d-flex flex-column justify-content-center">
                                                    <div className="add-card-icon mx-auto mb-5 p-5 bg-danger rounded-full">
                                                        <span className="icon-close1 font-24  text-white"></span>
                                                    </div>
                                                    <h2 className="mb-0 text-danger">Record Not Found!!!</h2>
                                                </Card.Body>
                                            </Card>
                                        }
                                        <Row className="g-xxl-5 g-4">
                                            <Col xxl={12} xl={12} lg={12} md={12} sm={12} className="text-center">
                                                {showButton &&
                                                    <Button disabled={process} variant="primary" size="md" type="button" className='mt-4 margin-auto' onClick={handleLoadMore}>
                                                        {
                                                            !process && 'Load More'
                                                        }
                                                        {
                                                            process && <><Spinner size="sm" animation="grow" className="me-1" />Load More</>
                                                        }
                                                    </Button>
                                                }
                                            </Col>
                                        </Row>
                                    </>}
                            </>
                        }
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

export default connect(mapStateToProps)(AgencyUsers)