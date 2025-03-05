import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Dropdown, Card, Col, Row, Tooltip, OverlayTrigger, Badge, Modal, Form, Spinner, Button } from 'react-bootstrap';
import APIService from "../../api/APIService";
import moment from 'moment';
import { pagination, display_date_format, popperConfig, databaseRoleCode } from '../../settings';
import { check } from "../../utils/functions.js";
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { DELETE_PROJECT } from '../../modules/lang/Project';
import { connect } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import Select from 'react-select';
import SimpleBar from 'simplebar-react';
import AvatarImg from "../../assets/img/placeholder-image.png";
import ReactImageFallback from "react-image-fallback";
import { ProjectBulkActionValidator } from "../../modules/validation/ProjectValidator";
import { validateForm } from "../../utils/validator.js";
import { PROJECT_BULK_ACTION } from '../../modules/lang/Project';

function ProjectList({ name, userData }) {
    const history = useHistory();
    // const customerId = new URLSearchParams(search).get('customer_id');
    let isBulkAction = userData?.role.code === databaseRoleCode.adminCode || userData?.role.code === databaseRoleCode.pcCode || userData?.role.code === databaseRoleCode.accountantCode || userData?.role.code === databaseRoleCode.agencyCode || userData?.role.code === databaseRoleCode.agencyMemberCode ? true : false;
    const [projectList, setProjectList] = useState([]);
    const [firstLoad, setFirstLoad] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchFilter, setSearchFilter] = useState('');
    const [sort, setSort] = useState("desc");
    const [sortby, setSortBy] = useState("id");
    const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
    const [exportData, setExportData] = useState([]);
    const [agencyList, setAgencyList] = useState([]);
    const [agency, setAgency] = useState(0);
    const [reloadPage, setReloadPage] = useState(false);
    const [tableLoader, setTableLoader] = useState(false);

    const [showBulkActionModal, setShowBulkActionModal] = useState(false);
    const [saveProcess, setSaveProcess] = useState(false);
    const [formErrors, setFormErrors] = useState([]);
    const [projectMembers, setProjectMembers] = useState([]);
    const [assignedMember, setAssignedMember] = useState([]);
    const [pageDesignRefresh, setPageDesignRefresh] = useState(true);
    const [agencyData, setAgencyData] = useState([]);

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

    const cstSetCloseBulkActionModal = () => {
        setShowBulkActionModal(false);
        setTimeout(() => {
            clearControl();
        }, 200);
    }

    const clearControl = async () => {
        setAssignedMember([]);
    }

    const prepareExportData = (data) => {
        let exportHeader = '';
        if (userData?.role.code !== databaseRoleCode.clientCode) {
            exportHeader = ["#", "Project Name", "Customer", "Start Date", "Due Date", "Status", "Members"];
        }
        else {
            exportHeader = ["#", "Project Name", "Start Date", "Due Date", "Status", "Members"];
        }
        let exportData = [];
        data?.map(item => {
            if (userData?.role.code !== databaseRoleCode.clientCode) {
                exportData.push(
                    {
                        id: item.id,
                        name: item.name,
                        clientname: item.clientname ? item.clientname : '',
                        start_date: item.start_date ? moment(item.start_date).format(display_date_format) : '',
                        deadline: item.deadline ? moment(item.deadline).format(display_date_format) : '',
                        status_name: item.status_name,
                        assign_member: item.assign_member.length > 0 ? (item.assign_member?.map((user, index) => { return user.name; })).join() : ''
                    });
            }
            else {
                exportData.push(
                    {
                        id: item.id,
                        name: item.name,
                        start_date: item.start_date ? moment(item.start_date).format(display_date_format) : '',
                        deadline: item.deadline ? moment(item.deadline).format(display_date_format) : '',
                        status_name: item.status_name,
                        assign_member: item.assign_member.length > 0 ? (item.assign_member?.map((user, index) => { return user.name; })).join() : ''
                    });
            }
            return '';
        });
        setExportData({ fileName: "projects-data", sheetTitle: "Projects", exportHeader: exportHeader, exportData: exportData });
    }

    const fetchProjectList = () => {
        setTableLoader(true);
        let params = "?";
        params = params + "sort=" + sort + ":" + sortby + "&limit=" + perPageSize + "&page=" + page;
        if (searchFilter !== '') {
            params = params + "&search=" + searchFilter;
        }
        if (agency !== 0) {
            params = params + "&user_id=" + agency;
        }

        APIService.getProjectList(params)
            .then((response) => {
                if (response.data?.status) {
                    setTotalPages(response.data?.pagination?.total_pages);
                    setTotalRecords(response.data?.pagination?.total_records);
                    let newData = response.data?.data;
                    setProjectList(newData);
                    setTableLoader(false);
                    prepareExportData(newData);
                }
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
    }, [searchFilter, agency, reloadPage]);

    

    useEffect(() => {
        APIService.getAllAgency()
            .then((response) => {
                if (response.data?.status) {
                    let newAgencyList = response.data?.data.map(item => {
                        return { label: item.agency_name, value: item.staffid }
                    });
                    setAgencyList([{ label: 'All Agency', value: 0 }, ...newAgencyList]);
                    setAgencyData(response.data?.data); // Store the agency data for later use
                }
            });

        // APIService.getProjectStatus()
        //     .then((response) => {
        //         if (response.data?.status) {
        //             setProjectStatusList(response.data?.data);
        //         }
        //     });


        if (userData?.role.code === databaseRoleCode.adminCode || userData?.role.code === databaseRoleCode.pcCode || userData?.role.code === databaseRoleCode.accountantCode) {
            APIService.getAllMembers('?role.code=office_staff')
                .then((response) => {
                    if (response.data?.status) {
                        let newStaffList = response.data?.data.map(item => {
                            return { label: item.name, value: item.staffid }
                        });
                        setProjectMembers(newStaffList);
                    }
                });
        }

        if (userData?.role.code === databaseRoleCode.agencyCode || userData?.role.code === databaseRoleCode.agencyMemberCode) {
            APIService.getAllMembers('?role.code=agency_user')
                .then((response) => {
                    if (response.data?.status) {
                        let newStaffList = response.data?.data.map(item => {
                            return { label: item.name, value: item.id }
                        });
                        setProjectMembers(newStaffList);
                    }
                });
        }
    }, []);

    useEffect(() => {
    }, [pageDesignRefresh]);

    const handleProjectEdit = async (id) => {
        history.push(`/edit-project/${id}`);
    };

    const handleProjectDelete = (id, name) => {
        confirmAlert({
            title: 'Confirm',
            message: DELETE_PROJECT.replace("{project_name}", name),
            buttons: [
                {
                    label: 'Yes',
                    className: 'btn btn-primary btn-lg',
                    onClick: () => {
                        APIService.deleteProject(id)
                            .then((response) => {
                                if (response.data?.status) {
                                    let newProjectList = projectList.filter(function (arr) {
                                        return arr.id !== id;
                                    })
                                    setProjectList(newProjectList);
                                    toast.success(response.data?.message, {
                                        position: toast.POSITION.TOP_RIGHT
                                    });
                                    setTotalRecords(totalRecords - 1);
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
    }

    const onSelectAllCheck = (e) => {
        let tempList = projectList;
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
        setProjectList(tempList);
        setPageDesignRefresh(!pageDesignRefresh);
        prepareExportData(tempList);
    }

    const onItemCheck = (e, data) => {
        let tempList = projectList;
        let selectedChk = e.target;
        tempList.forEach(list => {
            if (list.id === data.id)
                list.selected = selectedChk.checked;
        });
        setProjectList(tempList);
        setPageDesignRefresh(!pageDesignRefresh);

        //for selected task export
        if (projectList.filter(function (arr) { return arr.selected === true; }).length > 0) {
            let tempListNew = projectList.filter(function (arr) { return arr.selected === true; });
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
                    <Form.Check className="d-flex align-items-center form-check-md mb-0" checked={projectList.length > 0 && projectList.length === projectList.filter(function (arr) { return arr.selected === true; }).length} onChange={(e) => onSelectAllCheck(e)} />
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
            Header: 'Project Name',
            id: 'name',
            accessor: (projectList) => projectList.name,
            Cell: ({ row }) => (
                <>
                    <Link to={`/project-detail/${row?.original?.id}`}>{row?.original?.name}</Link>
                </>
            ),
        },
    ];

    if (userData?.role.code !== databaseRoleCode.clientCode) {
        columns = [
            ...columns,
            {
                Header: 'Agency',
                id: 'agency',
                accessor: (projectList) => {
                    const matchedAgency = projectList.assign_member.reduce((acc, member) => {
                        const agency = agencyData.find(agency => agency.staffid === member.id);
                        return agency ? agency.agency_name : acc;
                    }, 'None');

                    return matchedAgency;
                },
                Cell: ({ value }) => (
                    <span>{value}</span>
                ),
            },
        ];
    }

    const updateProjectStatus = (id, status) => {
        let params = {};
        params["projectid"] = id;
        params["status"] = status;
        APIService.updateProjectStatus(params)
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

    // columns = [
    //     ...columns,
    //     {
    //         Header: 'Status',
    //         id: 'status',
    //         disableSortBy: false,
    //         accessor: (projectList) => projectList.status_name,
    //         Cell: ({ row }) => (
    //             <>
    //                 {check(['projects.update'], userData?.role.getPermissions) ?
    //                     <Dropdown>
    //                         <Dropdown.Toggle size='sm' variant={row?.original?.backgroundColor} id={`dropdown-variants-status-${row?.original?.id}`}>
    //                             {row?.original?.status_name}
    //                         </Dropdown.Toggle>

    //                         <Dropdown.Menu popperConfig={popperConfig}>
    //                             {projectStatusList.filter(function (arr) { return arr.name !== row?.original?.status_name; }).map((status, index) => (
    //                                 <Dropdown.Item key={index} onClick={() => { updateProjectStatus(row?.original?.id, status.id) }}>
    //                                     {`Mark as ${status.name}`}
    //                                 </Dropdown.Item>
    //                             ))}
    //                         </Dropdown.Menu>
    //                     </Dropdown>
    //                     :
    //                     <Badge className="font-weight-semibold font-12 p-2" bg={row?.original?.backgroundColor}>{row?.original?.status_name}</Badge>
    //                 }
    //             </>
    //         ),
    //     },
    // ];

    if (userData.role.code !== databaseRoleCode.clientCode) {
        columns = [
            ...columns,
            {
                Header: 'Members',
                id: 'assign_member',
                disableSortBy: true,
                accessor: (taskList) => taskList.assign_member,
                Cell: ({ row }) => (
                    <>
                        <div className="avatar-group">
                            {row?.original?.assign_member?.map((user, index) => {
                                return index < 5 &&
                                    <span className="avatar avatar-sm avatar-circle" key={index}>
                                        {userData.role.code !== databaseRoleCode.clientCode && userData.role.code !== databaseRoleCode.agencyCode && userData.role.code !== databaseRoleCode.agencyMemberCode ?
                                            <Link to={`${user.is_not_staff === 1 ? '/agency-user-detail/' : '/user-detail/'}${user.id}`}>
                                                <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${user.name}`}> {user.name}</Tooltip>}>
                                                    {user.profile_image !== '' && user.profile_image !== null ?
                                                        <ReactImageFallback
                                                            src={`${user.profile_image}`}
                                                            fallbackImage={AvatarImg}
                                                            initialImage={AvatarImg}
                                                            alt={user.name}
                                                            className="avatar-img" />
                                                        :
                                                        <img className="avatar-img" src={AvatarImg} alt={user.name} />
                                                    }
                                                </OverlayTrigger>
                                            </Link>
                                            :
                                            <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${user.name}`}> {user.name}</Tooltip>}>
                                                {user.profile_image !== '' && user.profile_image !== null ?
                                                    <ReactImageFallback
                                                        src={`${user.profile_image}`}
                                                        fallbackImage={AvatarImg}
                                                        initialImage={AvatarImg}
                                                        alt={user.name}
                                                        className="avatar-img" />
                                                    :
                                                    <img className="avatar-img" src={AvatarImg} alt={user.name} />
                                                }
                                            </OverlayTrigger>
                                        }
                                    </span>
                            })}
                            {row?.original?.assign_member?.length > 5 &&
                                <span className="avatar avatar-sm avatar-circle">
                                    <Dropdown className="assigned-drop-down category-dropdown h-100" autoClose="outside">
                                        <Dropdown.Toggle as="a" bsPrefix="no-toggle" className="dark-2 font-weight-medium font-12 cursor-pointer" id="assign"><div className="avatar-initials avatar-dark-light border-transprant">+{row?.original?.assign_member.length - 5}</div></Dropdown.Toggle>
                                        <Dropdown.Menu as="ul" align="down" className="p-2" popperConfig={popperConfig}>
                                            <SimpleBar className="dropdown-body">
                                                {row?.original?.assign_member?.map((drp, index) => (
                                                    <Dropdown.Item as="li" key={index} eventKey={drp.id}>
                                                        {userData.role.code !== databaseRoleCode.clientCode && userData.role.code !== databaseRoleCode.agencyCode && userData.role.code !== databaseRoleCode.agencyMemberCode ?
                                                            <div className="d-flex d-flex align-items-center cursor-pointer w-100">
                                                                <Link to={`${drp.is_not_staff === 1 ? '/agency-user-detail/' : '/user-detail/'}${drp.id}`}>
                                                                    {drp.profile_image !== '' && drp.profile_image !== null ?
                                                                        <img className="avatar avatar-md avatar-circle me-1" src={`${drp.profile_image}`} alt={drp.name} onError={({ currentTarget }) => {
                                                                            currentTarget.onerror = null;
                                                                            currentTarget.src = AvatarImg;
                                                                        }} />
                                                                        :
                                                                        <img className="avatar avatar-md avatar-circle me-1" src={AvatarImg} alt={drp.name} />
                                                                    }
                                                                </Link>
                                                                <div className="ps-3">
                                                                    <Link to={`${drp.is_not_staff === 1 ? '/agency-user-detail/' : '/user-detail/'}${drp.id}`}>
                                                                        <div className="font-weight-regular dark-1 font-14 d-block">{drp.name}</div>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                            :
                                                            <div className="d-flex d-flex align-items-center cursor-pointer w-100">
                                                                {drp.profile_image !== '' && drp.profile_image !== null ?
                                                                    <img className="avatar avatar-md avatar-circle me-1" src={`${drp.profile_image}`} alt={drp.name} onError={({ currentTarget }) => {
                                                                        currentTarget.onerror = null;
                                                                        currentTarget.src = AvatarImg;
                                                                    }} />
                                                                    :
                                                                    <img className="avatar avatar-md avatar-circle me-1" src={AvatarImg} alt={drp.name} />
                                                                }
                                                                <div className="ps-3">
                                                                    <div className="font-weight-regular dark-1 font-14 d-block">{drp.name}</div>
                                                                </div>
                                                            </div>
                                                        }
                                                    </Dropdown.Item>
                                                ))}
                                            </SimpleBar>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </span>
                            }
                        </div>
                    </>
                ),
            }
        ];
    }

    if (check(['projects.update', 'projects.delete'], userData?.role.getPermissions)) {
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
                                <PermissionCheck permissions={['projects.update']}>
                                    <Dropdown.Item onClick={() => { handleProjectEdit(row?.original?.id) }}>
                                        Edit
                                    </Dropdown.Item>
                                </PermissionCheck>
                                <PermissionCheck permissions={['projects.delete']}>
                                    <Dropdown.Item className="text-danger" onClick={() => { handleProjectDelete(row?.original?.id, row?.original?.name) }}>
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

    const handleAgencySelect = (selectedAgency) => {
        setAgency(selectedAgency?.value);
    };

    const handleBulkAction = (e) => {
        if (projectList.filter(function (arr) { return arr.selected === true; }).length > 0) {
            setShowBulkActionModal(true);
        }
        else {
            toast.error("Please select any project", {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    }

    const handleBulkActions = async () => {
        setSaveProcess(true);
        let validate = validateForm((ProjectBulkActionValidator('Not Required', assignedMember.length > 0 ? 'Not Required' : '')));
        if (Object.keys(validate).length) {
            setFormErrors(validate);
            setSaveProcess(false);
        }
        else {
            confirmAlert({
                title: 'Confirm',
                message: PROJECT_BULK_ACTION,
                buttons: [
                    {
                        label: 'Yes',
                        className: 'btn btn-primary btn-lg',
                        onClick: () => {
                            const params = {};
                            let selectedProjectData = projectList.filter(function (arr) { return arr.selected === true; });
                            let projectIdsList = selectedProjectData.map((obj) => obj.id);
                            let projectId = projectIdsList;
                            let assignedMemberIds = assignedMember.map((obj) => obj.value);
                            let assignIds = assignedMemberIds;
                            params['projectIds'] = projectId;
                            params['userIds'] = assignIds;

                            APIService.projectBulkAction(params)
                                .then((response) => {
                                    if (response.data?.status) {
                                        cstSetCloseBulkActionModal();
                                        setTimeout(() => {
                                            toast.success(response.data?.message, {
                                                position: toast.POSITION.TOP_RIGHT
                                            });
                                        }, 200);
                                        setSaveProcess(false);
                                        setReloadPage(!reloadPage);
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
                    },
                    {
                        label: 'No',
                        className: 'btn btn-outline-secondary btn-lg',
                        onClick: () => {
                            setSaveProcess(false);
                        }
                    }
                ]
            });
        }
    }

    const handleAssignedMember = (selectedPC) => {
        setAssignedMember(selectedPC);
    };

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <Header pagename={name} />
                <div className="inner-content pt-0 px-0">
                    <div className="bg-white py-3 px-4 px-xl-7 page-inner-header">
                        <Row className="g-2 g-xl-4">
                            <Col xs={12} sm={12} md={9}>
                                <PermissionCheck permissions={['projects.create']}>
                                    <Link to="/add-project" className="me-2 btn btn-primary btn-md"><i className="icon-add me-2"></i> Add New</Link>
                                </PermissionCheck>
                                <h3 className="d-inline-block mt-1 ms-3">Total Projects: {totalRecords ? totalRecords : 0}</h3>
                            </Col>
                            {userData?.role.code !== databaseRoleCode.agencyCode && userData?.role.code !== databaseRoleCode.agencyMemberCode && userData?.role.code !== databaseRoleCode.clientCode &&
                                <Col xs={12} sm={12} md={3}>
                                    <Select styles={customStyles} className="control-md custom-select" options={agencyList} onChange={handleAgencySelect}
                                        value={agencyList.filter(function (option) {
                                            return option.value === agency;
                                        })} />
                                </Col>
                            }
                        </Row>
                    </div>
                    <div className="pt-4 pt-xl-5 pt-xl-9 px-0 px-lg-4 px-xl-7">
                        <Card className="rounded-10 p-4 p-xl-6">
                            <Card.Body className="p-0 project-list-table">
                                <DataTableWithPagination columns={columns} data={projectList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isBulkAction={isBulkAction} handleBulkAction={handleBulkAction} exportData={exportData} />
                            </Card.Body>
                        </Card>
                    </div>

                    <Modal size="lg" show={showBulkActionModal} onHide={cstSetCloseBulkActionModal} centered>
                        <Modal.Header closeButton className="py-5 px-10">
                            <Modal.Title className="font-20 dark-1 mb-0">Bulk Actions</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-0">
                            <div className="invite-people py-9 px-10">
                                <Form onSubmit={async e => { e.preventDefault(); await handleBulkActions() }}>
                                    <Row className="g-6">
                                        <Col lg={12}>
                                            <Form.Label className="mb-2">Assign To:</Form.Label>
                                            <Select styles={customStyles} className='custom-select' options={projectMembers} onChange={handleAssignedMember} closeMenuOnSelect={false} isMulti value={assignedMember} />
                                            {formErrors.assignMembersInput && (
                                                <span className="text-danger">{formErrors.assignMembersInput}</span>
                                            )}
                                        </Col>
                                        <Col lg={12} className="text-end">
                                            <Button variant="soft-secondary" size="md" type="button" onClick={cstSetCloseBulkActionModal}>Cancel</Button>
                                            <Button disabled={saveProcess} variant="primary ms-3" size="md" type="submit">
                                                {
                                                    !saveProcess && 'Confirm'
                                                }
                                                {
                                                    saveProcess && <><Spinner size="sm" animation="border" className="me-1" />Confirm</>
                                                }
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                        </Modal.Body>
                    </Modal>

                </div>
                <Footer />
            </div>
        </>
    );
}

const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(ProjectList)