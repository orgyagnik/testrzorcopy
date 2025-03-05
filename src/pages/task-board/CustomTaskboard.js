import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Col, Row, Modal, Button, Form, Dropdown, Offcanvas, Spinner } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import APIService from "../../api/APIService";
import Select from 'react-select';
import { connect } from "react-redux";
import { getTaskboardHappyStatus, check } from "../../utils/functions.js";
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import { DELETE_CUSTOM_TASKBOARD, DONE_CUSTOM_TASKBOARD, DELETE_CUSTOM_DEVELOPER } from '../../modules/lang/Taskboard';
import { databaseRoleCode, taskboardClientHappyStatus, popperConfig } from '../../settings';
import { validateForm } from "../../utils/validator.js";
import { CustomBoardValidator, CustomBoardDeveloperAddValidator } from "../../modules/validation/TaskboardValidator";
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import MoveIcon from "../../assets/img/icons/move.svg";

function CustomTaskboard({ userData, name }) {
    const [showAddtaskModal, setShowAddtaskModal] = useState(false);
    const [taskBoardData, setTaskBoardData] = useState([]);
    const [taskBoardId, setTaskBoardId] = useState(0);
    const [searchFilter, setSearchFilter] = useState('');
    const [refreshDesign, setRefreshDesign] = useState(false);
    const [reloadTaskboard, setReloadTaskboard] = useState(false);
    const [project, setProject] = useState('');
    const [projectList, setProjectList] = useState([]);
    const [developer, setDeveloper] = useState('');
    const [developerOption, setDeveloperOption] = useState([]);
    const [clientHappyStatus, setClientHappyStatus] = useState('happy');
    const [hours, setHours] = useState('');
    const [priority, setPriority] = useState('');
    const [saveProcess, setSaveProcess] = useState(false);
    const [saveDeveloperProcess, setSaveDeveloperProcess] = useState(false);
    const [formErrors, setFormErrors] = useState([]);
    const [staffForManage, SetStaffForManage] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [staffId, setStaffId] = useState('');
    const [reloadStaffList, setReloadStaffList] = useState(false);

    const cstSetCloseAddtaskModal = () => {
        setShowAddtaskModal(false);
        clearControl();
    }
    const cstShowAddtaskModal = () => setShowAddtaskModal(true);
    const [showManageStaffSidebar, setShowManageStaffSidebar] = useState(false);

    const msCloseManageStaffSidebar = () => setShowManageStaffSidebar(false);
    const msShowManageStaffSidebar = () => setShowManageStaffSidebar(true);

    useEffect(() => {
        if(showManageStaffSidebar || showAddtaskModal){
            APIService.getCustomDeveloperList()
                .then((response) => {
                    if (response.data?.status) {
                        let newStaffList = response.data?.data?.active_developer?.map(item => {
                            return { label: item.name, value: item.staffid }
                        });
                        setDeveloperOption(newStaffList);
                        SetStaffForManage(response.data?.data);
                    }
                });
            APIService.getAllMembers('?role_code=office_staff')
                .then((response) => {
                    if (response.data?.status) {
                        let newStaffList = response.data?.data.map(item => {
                            return { label: item.name, value: item.id }
                        });
                        setStaffList([{ label: 'All', value: 0 }, ...newStaffList]);
                    }
                });
        }
    }, [reloadStaffList, showManageStaffSidebar, showAddtaskModal]);

    useEffect(() => {
        if(showAddtaskModal){
            APIService.getAllProjects("")
                .then((response) => {
                    if (response.data?.status) {
                        let data = response.data?.data;
                        let temData = data?.map(item => {
                            return { label: item.name, value: item.id }
                        });
                        setProjectList(temData);
                    }
                });
            
        }
    }, [showAddtaskModal]);

    useEffect(() => {
        const timer = setTimeout(() => {
            let params = "?";
            params = params + "sort=asc&limit=1000&page=1&sort_by=priority_order";
            if (searchFilter !== '') {
                params = params + "&search=" + searchFilter;
            }

            APIService.getCustomTaskBoardList(params)
                .then((response) => {
                    if (response.data?.status) {
                        setTaskBoardData(response.data?.data);
                    }
                    else {
                        setTaskBoardData([]);
                    }
                });
        }, 500);
        return () => clearTimeout(timer);
    }, [searchFilter, reloadTaskboard]);

    useEffect(() => {

    }, [refreshDesign]);

    const handleProjectChange = (selectedProject) => {
        setProject(selectedProject);
    }

    const handleDeveloperSelect = (selectedDeveloper) => {
        setDeveloper(selectedDeveloper?.value);
    };

    const handleClientHappyStatusSelect = (e) => {
        setClientHappyStatus(e.target.value);
    };

    const addNewCard = (staff_id) => {
        clearControl();
        setDeveloper(staff_id);
        cstShowAddtaskModal();
    };

    const handleRemoveTaskBoard = (id) => {
        confirmAlert({
            title: 'Confirm',
            message: DELETE_CUSTOM_TASKBOARD,
            buttons: [
                {
                    label: 'Yes',
                    className: 'btn btn-primary btn-lg',
                    onClick: () => {
                        let params = {};
                        params["id"] = id;
                        APIService.removeCustomTaskboard(params)
                            .then((response) => {
                                if (response.data?.status) {
                                    let newTaskboard = taskBoardData?.taskboard_lists?.filter(function (arr) {
                                        return arr.id !== id;
                                    });
                                    let newData = taskBoardData;
                                    newData['taskboard_lists'] = newTaskboard;
                                    setTaskBoardData(newData);
                                    setRefreshDesign(!refreshDesign);
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
    }

    const handleDoneTaskBoard = (id) => {
        confirmAlert({
            title: 'Confirm',
            message: DONE_CUSTOM_TASKBOARD,
            buttons: [
                {
                    label: 'Yes',
                    className: 'btn btn-primary btn-lg',
                    onClick: () => {
                        let params = {};
                        params["id"] = id;
                        params["status"] = 1;
                        APIService.doneCustomTaskboard(params)
                            .then((response) => {
                                if (response.data?.status) {
                                    let newTaskboard = taskBoardData?.taskboard_lists?.filter(function (arr) {
                                        return arr.id !== id;
                                    });
                                    let newData = taskBoardData;
                                    newData['taskboard_lists'] = newTaskboard;
                                    setTaskBoardData(newData);
                                    setRefreshDesign(!refreshDesign);
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
    }

    const clearControl = async () => {
        setTaskBoardId(0);
        setProject('');
        setDeveloper('');
        setClientHappyStatus('happy');
        setHours('');
        setPriority('');
        setFormErrors([]);
    }

    const handleEditTaskBoard = (id) => {
        clearControl();
        setTaskBoardId(id);
        let editTaskBoardData = taskBoardData?.taskboard_lists?.filter(function (arr) {
            return arr.id === id;
        });
        if (editTaskBoardData.length > 0) {
            let data = editTaskBoardData[0];
            setProject({ label: data?.project_name, value: data?.project_id });
            setDeveloper(data?.staff_id);
            setClientHappyStatus(data?.happy_status);
            setHours(data?.hours);
            setPriority(data?.priority_order ? data?.priority_order : '');
            cstShowAddtaskModal();
        }
    };

    const addTaskboardCard = async () => {
        setSaveProcess(true);
        setFormErrors([]);
        let validate = validateForm((CustomBoardValidator(project.label ? project.label : '', developer, clientHappyStatus, hours)));
        if (Object.keys(validate).length) {
            setSaveProcess(false);
            setFormErrors(validate);
        }
        else {
            const params = {};
            if (taskBoardId > 0) {
                params['id'] = taskBoardId;
                params['project_id'] = project.value ? project.value : 0;
                params['project_name'] = project.label ? project.label : '';
                params['staff_id'] = developer;
                params['hours'] = hours;
                params['addon_hours'] = 0;
                params['happy_status'] = clientHappyStatus;
                params['priority_order'] = priority;
                APIService.updateCustomTaskboardCard(params)
                    .then((response) => {
                        if (response.data?.status) {
                            toast.success(response.data?.message, {
                                position: toast.POSITION.TOP_RIGHT
                            });
                            setSaveProcess(false);
                            cstSetCloseAddtaskModal();
                            setReloadTaskboard(!reloadTaskboard);
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
                params['project_id'] = project.value ? project.value : 0;
                params['project_name'] = project.label ? project.label : '';
                params['staff_id'] = developer;
                params['hours'] = hours;
                params['addon_hours'] = 0;
                params['happy_status'] = clientHappyStatus;
                params['priority_order'] = priority;
                APIService.addCustomTaskboardCard(params)
                    .then((response) => {
                        if (response.data?.status) {
                            toast.success(response.data?.message, {
                                position: toast.POSITION.TOP_RIGHT
                            });
                            setSaveProcess(false);
                            cstSetCloseAddtaskModal();
                            setReloadTaskboard(!reloadTaskboard);
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

    const SetStaffListIndex = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    const onDragEndDrop = (result) => {
        if (!result.destination) {
            return;
        }
        const ListNew = SetStaffListIndex(
            staffForManage?.active_developer,
            result.source.index,
            result.destination.index
        );
        let staffForManageNew = {};
        staffForManageNew['active_developer'] = ListNew;
        staffForManageNew['deactive_developer'] = staffForManage?.deactive_developer;
        SetStaffForManage(staffForManageNew);

        var priority_arr = ListNew.map(function (value) {
            return value.staffid;
        });

        const params = new FormData();
        params.append("staffids", priority_arr);
        params.append("status", false);
        params.append("type", "priority");

        APIService.setCustomStaffListPriority(params)
            .then((response) => {
                if (response.data?.status) {
                    setReloadTaskboard(!reloadTaskboard);
                }
                else {
                    SetStaffForManage(staffForManage);
                }
            });
    }

    const handleStaffActiveDeactive = (staffid) => {
        confirmAlert({
            title: 'Confirm',
            message: DELETE_CUSTOM_DEVELOPER,
            buttons: [
                {
                    label: 'Yes',
                    className: 'btn btn-primary btn-lg',
                    onClick: () => {
                        const params = new FormData();
                        params.append("staffids", staffid);
                        params.append("status", true);

                        APIService.setCustomStaffListPriority(params)
                            .then((response) => {
                                if (response.data?.status) {
                                    toast.success(response.data?.message, {
                                        position: toast.POSITION.TOP_RIGHT
                                    });
                                    setReloadTaskboard(!reloadTaskboard);
                                    setReloadStaffList(!reloadStaffList);
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

    const handleStaffSelect = e => {
        setStaffId(e.value);
    };

    const addCustomTaskboardDeveloper = async () => {
        setSaveDeveloperProcess(true);
        setFormErrors([]);
        let validate = validateForm((CustomBoardDeveloperAddValidator(staffId)));
        if (Object.keys(validate).length) {
            setSaveDeveloperProcess(false);
            setFormErrors(validate);
        }
        else {
            const params = new FormData();
            params.append("staffids", staffId);
            params.append("status", false);

            APIService.setCustomStaffListPriority(params)
                .then((response) => {
                    if (response.data?.status) {
                        toast.success(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setReloadTaskboard(!reloadTaskboard);
                        setReloadStaffList(!reloadStaffList);
                        setSaveDeveloperProcess(false);
                        setStaffId('');
                    }
                    else {
                        toast.error(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setSaveDeveloperProcess(false);
                        setStaffId('');
                    }
                });
        }
    };

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <Header pagename={name ? name : ''} />
                <div className="inner-content py-0 px-0">
                    <div className='taskboard-page'>
                        {check(['custom_taskboard.create'], userData?.role.getPermissions) &&
                            <>
                                <div className="bg-white py-3 px-4 px-lg-7 taskboard-header page-inner-header">
                                    <Row className="g-2 align-items-center">
                                        <Col className="col-12 col-sm-4 col-md-auto">
                                            <Button variant="primary" size='md' className='w-100' onClick={msShowManageStaffSidebar}>Manage Staff</Button>
                                        </Col>
                                        <Col className="col-12 col-sm-8 col-md-6 col-lg-6 col-xl-5 col-xxl-4 col-xxxl-3">
                                            <div className="search-box w-100">
                                                <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                                    <span className="icon-serach"></span>
                                                    <input type="text" className="form-control border-0" placeholder="Search Project or Employee Name" value={searchFilter} onChange={(e) => { setSearchFilter(e.target.value) }} />
                                                    <span className='search-clear icon-cancel cursor-pointer p-2 font-12 dark-6' onClick={(e) => { setSearchFilter('') }}></span>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </>
                        }
                        <div className="pt-9 px-4 px-lg-7">
                            <div className={databaseRoleCode.employeeCode === userData?.role_code ? 'taskboard-inner pb-4' : 'taskboard-inner pb-4 horizontal-scroll'}>
                                <div className="card-row row g-4 flex-nowrap">
                                    {taskBoardData?.employee_lists &&
                                        taskBoardData?.employee_lists?.map((emp, emp_index) => (
                                            <div className="card-col col-12" key={emp_index}>
                                                <div className="task-card rounded-10">
                                                    <div className="d-flex align-items-center">
                                                        <p className="mb-0 me-2 font-weight-medium">{emp.fullname}
                                                            {emp.leave_status && <span className="text-danger ms-2">On {emp.half_leave === 1 ? 'Half Day ' : ''} Leave</span>}
                                                        </p>
                                                        <PermissionCheck permissions={['custom_taskboard.create']}>
                                                            <Button variant={emp.leave_status ? 'danger' : 'primary'} onClick={() => addNewCard(emp.staff_id)} className="btn-icon circle-btn ms-auto"> <i className="icon-add"></i> <span></span> </Button>
                                                        </PermissionCheck>
                                                    </div>
                                                    <SimpleBar className="task-card-list mt-3">
                                                        {taskBoardData?.taskboard_lists?.filter(function (arr) { return arr.staff_id === emp.staff_id; }).map((taskboard, index) => (
                                                            <div className="inner-card rounded-10 bg-white p-4" key={`${emp_index}-${index}`}>
                                                                <div className='d-flex'>
                                                                    <div className="col-9 me-3">
                                                                        <p className="dark-1 mb-2 lh-base"><span className="font-weight-medium">Project:</span> {taskboard.project_name}</p>
                                                                    </div>
                                                                    {check(['custom_taskboard.update', 'custom_taskboard.delete'], userData?.role.getPermissions) &&
                                                                        <Dropdown className="ms-auto">
                                                                            <Dropdown.Toggle as="a" bsPrefix="d-toggle" className="btn btn-light btn-icon btn-sm shadow-none" id="dropdown-basic">
                                                                                <i className="fa-solid fa-ellipsis-vertical"></i>
                                                                            </Dropdown.Toggle>
                                                                            <Dropdown.Menu align="end" className="dropdown-menu-end p-2" popperConfig={popperConfig}>
                                                                                <PermissionCheck permissions={['custom_taskboard.update']}>
                                                                                    <Dropdown.Item onClick={() => { handleEditTaskBoard(taskboard.id) }}>Edit</Dropdown.Item>
                                                                                </PermissionCheck>
                                                                                <PermissionCheck permissions={['custom_taskboard.delete']}>
                                                                                    <Dropdown.Item onClick={() => { handleRemoveTaskBoard(taskboard.id) }}>Delete</Dropdown.Item>
                                                                                </PermissionCheck>
                                                                                <PermissionCheck permissions={['custom_taskboard.update']}>
                                                                                    <Dropdown.Item onClick={() => { handleDoneTaskBoard(taskboard.id); }}>Completed</Dropdown.Item>
                                                                                </PermissionCheck>
                                                                            </Dropdown.Menu>
                                                                        </Dropdown>
                                                                    }
                                                                </div>
                                                                <div className="d-flex align-items-center justify-content-between">
                                                                    <div className="d-flex flex-wrap">
                                                                        <span className="badge rounded-pill  badge-lg badge-warning text-uppercase me-2 mb-1">{taskboard.display_date}</span>
                                                                        {taskboard.hours && <span className="badge rounded-pill  badge-lg badge-info text-uppercase me-2 mb-1">{taskboard.hours} hrs</span>}
                                                                    </div>
                                                                    <>{getTaskboardHappyStatus(taskboard.happy_status)}</>
                                                                </div>
                                                            </div>

                                                        ))}
                                                    </SimpleBar>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <Modal size="lg" show={showAddtaskModal} onHide={cstSetCloseAddtaskModal} centered>
                        <Modal.Header closeButton className="py-5 px-10">
                            <Modal.Title className="font-20 dark-1 mb-0">Assign Card</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-0">
                            <div className="invite-people py-9 px-10">
                                <Form onSubmit={async e => { e.preventDefault(); await addTaskboardCard() }}>
                                    <Row className="g-6">
                                        <Col lg={12}>
                                            <Form.Label className="form-label-sm">Project<span className='validation-required-direct'></span></Form.Label>
                                            <Select styles={customStyles} isDisabled={taskBoardId > 0} classNamePrefix="react-select" className={`custom-select ${formErrors.projectInput && 'is-react-select-invalid'}`} options={projectList} onChange={handleProjectChange} placeholder={<div>Select Project</div>}
                                                value={projectList.filter(function (option) {
                                                    return option.value === project?.value;
                                                })} />
                                            {formErrors.projectInput && (
                                                <span className="text-danger">{formErrors.projectInput}</span>
                                            )}
                                        </Col>
                                        <Col lg={6}>
                                            <Form.Label className="form-label-sm">Developer<span className='validation-required-direct'></span></Form.Label>
                                            <Select styles={customStyles} classNamePrefix="react-select" className={`custom-select ${formErrors.developerInput && 'is-react-select-invalid'}`} options={developerOption} onChange={handleDeveloperSelect}
                                                value={developerOption.filter(function (option) {
                                                    return option.value === developer;
                                                })} />
                                            {formErrors.developerInput && (
                                                <span className="text-danger">{formErrors.developerInput}</span>
                                            )}
                                        </Col>
                                        <Col lg={6}>
                                            <Form.Label className="form-label-sm">Status<span className='validation-required-direct'></span></Form.Label>
                                            <Form.Select value={clientHappyStatus} onChange={handleClientHappyStatusSelect}>
                                                {taskboardClientHappyStatus.map((status, st_index) => (
                                                    <option key={st_index} value={status.value}>{status.label}</option>
                                                ))}
                                                {formErrors.clientHappyStatusInput && (
                                                    <span className="text-danger">{formErrors.clientHappyStatusInput}</span>
                                                )}
                                            </Form.Select>
                                        </Col>
                                        <Col lg={12}>
                                            <p className='mb-1'><b>Note: </b>15 mins = 0.25, 30 mins = 0.50, 45 mins = 0.75, hour = 1,2,3</p>
                                            <Row>
                                                <Col lg={6}>
                                                    <Form.Label className="form-label-sm">Hours<span className='validation-required-direct'></span></Form.Label>
                                                    <Form.Control type="number" step="any" min={0} placeholder="Add Hours" value={hours} onChange={(e) => { setHours(e.target.value) }} className={`${formErrors.hoursInput && 'is-invalid'}`} />
                                                    {formErrors.hoursInput && (
                                                        <span className="text-danger">{formErrors.hoursInput}</span>
                                                    )}
                                                </Col>
                                                {userData?.role_code === databaseRoleCode.adminCode &&
                                                    <Col lg={6}>
                                                        <Form.Label className="form-label-sm">Priority</Form.Label>
                                                        <Form.Control type="number" min={0} placeholder="Priority" value={priority} onChange={(e) => { setPriority(e.target.value) }} />
                                                    </Col>
                                                }
                                            </Row>
                                        </Col>
                                        <Col lg={12} className="text-end">
                                            <Button variant="soft-secondary" size="md" type="button" onClick={cstSetCloseAddtaskModal}>Cancel</Button>
                                            <Button disabled={saveProcess} variant="primary ms-3" size="md" type="submit">
                                                {
                                                    !saveProcess && 'Save'
                                                }
                                                {
                                                    saveProcess && <><Spinner size="sm" animation="border" className="me-1" />Save</>
                                                }
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                        </Modal.Body>
                    </Modal>
                </div>
                <Offcanvas show={showManageStaffSidebar} onHide={msCloseManageStaffSidebar} className="manage-staff-sidebar" placement="end">
                    <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
                        <div className="d-flex align-items-center">
                            <h3 className="mb-0">Manage Staff</h3>
                        </div>
                        <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={msCloseManageStaffSidebar}>
                            <i className="icon-cancel"></i>
                        </button>
                    </Offcanvas.Header>
                    <Offcanvas.Body className="p-0">
                        <SimpleBar className="offcanvas-inner">
                            <div className="p-6">
                                <Form onSubmit={async e => { e.preventDefault(); await addCustomTaskboardDeveloper() }}>
                                    <Row className="g-2">
                                        <Col xs={9} sm={10}>
                                            <Select styles={customStyles} classNamePrefix="react-select" className={`control-md custom-select ${formErrors.developerInput && 'is-react-select-invalid'}`} options={staffList} onChange={handleStaffSelect} placeholder={<div>Select Developer</div>}
                                                value={staffList.filter(function (option) {
                                                    return option.value === staffId;
                                                })} />
                                            {formErrors.developerInput && (
                                                <span className="text-danger">{formErrors.developerInput}</span>
                                            )}
                                        </Col>
                                        <Col xs={3} sm={2}>
                                            <Button disabled={saveDeveloperProcess} variant="primary" size="md" className='w-100' type="submit">
                                                {
                                                    !saveDeveloperProcess && 'Add'
                                                }
                                                {
                                                    saveDeveloperProcess && <><Spinner size="sm" animation="border" className="me-1" />Add</>
                                                }
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                                <hr />
                                <h4 className="accordion-header mt-5 mb-3">Staff List</h4>
                                <DragDropContext onDragEnd={onDragEndDrop}>
                                    <Droppable droppableId="droppable">
                                        {(provided, snapshot) => (
                                            <div className="staff-list" ref={provided.innerRef} {...provided.droppableProps}>
                                                {staffForManage?.active_developer?.map((staff, staff_index) => (
                                                    <Draggable draggableId={`${staff_index}`} key={staff_index} index={staff_index}>
                                                        {(provided) => (
                                                            <div className="staff-detail border border-gray-100 rounded-6" ref={provided.innerRef} {...provided.draggableProps} key={staff_index} data-p={staff.priority}>
                                                                <div className="move-cell" {...provided.dragHandleProps}><div className="move-icon"><img src={MoveIcon} alt="Drop" /></div></div>
                                                                <span>{staff.name}</span>
                                                                <button type="button" className="ms-auto btn-icon circle-btn text-danger btn btn-white btn-sm" onClick={(e) => { handleStaffActiveDeactive(staff.staffid) }}><i className="icon-delete"></i></button>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </div>
                        </SimpleBar>
                    </Offcanvas.Body>
                </Offcanvas>
                <Footer />
            </div>
        </>
    );
}

const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(CustomTaskboard)