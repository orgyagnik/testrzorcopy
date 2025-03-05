import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Dropdown, Form, Tooltip, Table } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import SearchIcon from '../../assets/img/icons/serach.svg';
import ViewTaskModal from './ViewTaskModal';
import EditTaskModal from './EditTaskModal';
import { display_date_format, popperConfig, databaseRoleCode } from '../../settings';
import APIService from '../../api/APIService';
import { connect } from "react-redux";
import { getProjectStatusClass, filterDropdownOptionByAgencyName } from "../../utils/functions.js";
import { useHistory, useParams, Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import moment from 'moment';
import AvatarImg from "../../assets/img/placeholder-image.png";
import MoveIcon from "../../assets/img/icons/move.svg";
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import { DELETE_TASK } from '../../modules/lang/Task';
import RatingReviewModal from './RatingReviewModal';
import ReactImageFallback from "react-image-fallback";

function SetTaskPriority({ userData, name }) {
    const history = useHistory();
    let task_type = 0;
    const currentURL = window.location.pathname;
    if (currentURL.includes("set-site-addons-task-priority")) {
        task_type = 1;
    }
    const [showViewTaskModal, setShowViewTaskModal] = useState(false);
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [taskList, setTaskList] = useState([]);
    const [agency, setAgency] = useState('');
    const [agencyList, setAgencyList] = useState([]);
    const [taskStatusList, setTaskStatusList] = useState([]);
    const [agencyListForFilter, setAgencyListForFilter] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [taskId, setTaskId] = useState(0);
    const [agencySearch, setAgencySearch] = useState('');

    //Rating And Review
    const [ratingModalShow, setShowRatingModal] = useState(false);
    const [taskIdForRating, SetTaskIdForRating] = useState(0);
    const showRatingModal = (tid) => {
        setShowRatingModal(true);
        SetTaskIdForRating(tid);
    }

    let { agency_id } = useParams();
    let previousPage = `/set-task-priority/${agency_id}`;

    const cstShowViewTaskModal = (id) => {
        setTaskId(id);
        setShowViewTaskModal(true);
        window.history.replaceState(null, '', `/view-task/${id}`);
    }

    const cstShowEditTaskModal = (id) => {
        setTaskId(id);
        setShowEditTaskModal(true);
        window.history.replaceState(null, '', `/edit-task/${id}`);
    }

    useEffect(() => {
        APIService.getAllAgency()
            .then((response) => {
                if (response.data?.status) {
                    let agencyListMain = response.data?.data;
                    setAgencyList(agencyListMain);
                    setAgencyListForFilter(agencyListMain);
                    let selectedAgency = agencyListMain.filter(function (arr) { return parseInt(agency_id) === arr.staffid; });
                    if (selectedAgency.length > 0) {
                        setAgency(selectedAgency[0].agency_name);
                    }
                }
            });
        APIService.getTaskStatus()
            .then((response) => {
                if (response.data?.status) {
                    let taskStatusListNew = response.data?.data;
                    setTaskStatusList(taskStatusListNew);
                }
            });
    }, []);

    useEffect(() => {
        let selectedAgency = agencyList.filter(function (arr) { return parseInt(agency_id) === arr.staffid; });
        if (selectedAgency.length > 0) {
            setAgency(selectedAgency[0].agency_name);
        }

        let params = "?";
        params = params + "&sort=asc&limit=10000&page=1&sort_by=priority&search_by_agency=" + agency_id + "&task_type=" + task_type;
        APIService.getTaskList(params)
            .then((response) => {
                if (response.data?.status) {
                    setTaskList(response.data?.data);
                }
                else {
                    setTaskList([]);
                }
            });

    }, [agency_id, refresh]);

    const handleAgencySearch = (value) => {
        setAgencySearch(value);
        filterDropdownOptionByAgencyName(agencyList, value, setAgencyListForFilter);
    }

    const handleAgencyRadioChange = (e) => {
        handleAgencySearch('');
        let agencyNew = e.target.value;
        setAgency(agencyNew);
        let agency_id = 0;
        if (agencyNew !== '') {
            let selectedAgency = agencyList.filter(function (arr) { return arr.name === agencyNew; });
            if (selectedAgency.length > 0) {
                agency_id = selectedAgency[0].staffid;
            }
        }
        history.push(`/set-task-priority/${agency_id}`);
    }

    const SetTaskListIndex = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    const onDragEndDrop = (result) => {
        if (!result.destination) {
            return;
        }
        const taskListNew = SetTaskListIndex(
            taskList,
            result.source.index,
            result.destination.index
        );
        setTaskList(taskListNew);

        var priority_arr = taskListNew.map(function (value, index, array) {
            return value.id;
        });

        const params = new FormData();
        params.append("taskids", priority_arr);

        APIService.setTaskListPriority(params)
            .then((response) => {
                if (response.data?.status) {

                }
                else {
                    setTaskList(taskList);
                }
            });
    }

    const deleteTask = (id) => {
        confirmAlert({
            title: 'Confirm',
            message: DELETE_TASK,
            buttons: [
                {
                    label: 'Yes',
                    className: 'btn btn-primary btn-lg',
                    onClick: () => {
                        let params = {};
                        params["taskid"] = id;
                        APIService.deleteTask(params)
                            .then((response) => {
                                if (response.data?.status) {
                                    let newTaskList = taskList.filter(function (arr) {
                                        return arr.id !== id;
                                    })
                                    setTaskList(newTaskList);
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

    const updateTaskStatus = (id, status) => {
        let params = {};
        params["taskid"] = id;
        params["status"] = status;
        APIService.updateTaskStatus(params)
            .then((response) => {
                if (response.data?.status) {
                    //setRefresh(!refresh);
                    toast.success(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                    if (status === 5) {
                        showRatingModal(id);
                    }
                }
                else {
                    toast.error(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            });
    }

    return (
        <>
            <Sidebar />
            <ViewTaskModal showViewTaskModal={showViewTaskModal} setShowViewTaskModal={setShowViewTaskModal} taskId={taskId} setRefresh={setRefresh} refresh={refresh} previousPage={previousPage} />
            <EditTaskModal showEditTaskModal={showEditTaskModal} setShowEditTaskModal={setShowEditTaskModal} taskId={taskId} setRefresh={setRefresh} refresh={refresh} previousPage={previousPage} />
            <div className="main-content">
                <Header pagename={name} />
                <div className="inner-content">
                    <div className="mb-7 d-flex">
                        <div className="d-flex align-items-center ms-auto">
                            <Dropdown className="project-drop-down category-dropdown ms-8">
                                <Dropdown.Toggle as="div" className="dark-2 font-weight-medium font-12 cursor-pointer" id="agency"><div className="d-inline-block me-2 dark-5">Agency: </div>{agency !== '' ? agency : 'All'}</Dropdown.Toggle>
                                <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2 w-100">
                                    <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                                        <div className="search-box w-100">
                                            <form>
                                                <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                                    <img src={SearchIcon} alt="Search" />
                                                    <input type="search" className="form-control border-0" placeholder="Search Agency..." value={agencySearch} onChange={(e) => handleAgencySearch(e.target.value)} />
                                                </div>
                                            </form>
                                        </div>
                                    </Dropdown.Header>
                                    <SimpleBar className="dropdown-body">
                                        {agencyListForFilter.map((drp, index) => (
                                            <Dropdown.Item as="li" key={index}>
                                                <Form.Check className="m-0 form-check-sm" type="radio" name="agencyRadio" id={`agency-radio-${index}`} label={drp.agency_name} checked={parseInt(agency_id) === drp.staffid} onChange={handleAgencyRadioChange} value={drp.agency_name} />
                                            </Dropdown.Item>
                                        ))}
                                    </SimpleBar>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                    <DragDropContext onDragEnd={onDragEndDrop}>
                        <Table hover className="bg-transparent list-table border-top-0">
                            <thead>
                                <tr>
                                    <th className="column-select"></th>
                                    <th>Priority</th>
                                    <th>Name</th>
                                    <th>Start Date</th>
                                    <th>Due Date</th>
                                    {userData?.role_code !== databaseRoleCode.clientCode &&
                                        <th>Assigned to</th>
                                    }
                                    <th>Project</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <Droppable droppableId="droppable">
                                {(provided, snapshot) => (
                                    <tbody className="border-top-0" ref={provided.innerRef} {...provided.droppableProps} >
                                        {taskList && taskList.map((task, index) => (
                                            <Draggable draggableId={`${index}`} key={index} index={index}>
                                                {(provided) => (
                                                    <tr ref={provided.innerRef} {...provided.draggableProps} key={index} data-p={task.priority}>
                                                        <td className="move-cell" {...provided.dragHandleProps}><div className="move-icon"><img src={MoveIcon} alt="Drop" /></div><Form.Check className="d-flex align-items-center form-check-sm mb-0" aria-label="option 1" /></td>
                                                        <td {...provided.dragHandleProps}> {index + 1}</td>
                                                        <td {...provided.dragHandleProps}> {task.name}</td>
                                                        <td>{task.startdate && moment(task.startdate).format(display_date_format)}</td>
                                                        <td>{task.duedate && moment(task.duedate).format(display_date_format)}</td>
                                                        {userData?.role_code !== databaseRoleCode.clientCode &&
                                                            <td>
                                                                <div className="avatar-group">
                                                                    {task.assign_member?.map((user, index) => {
                                                                        return index < 5 &&
                                                                            <span className="avatar avatar-sm avatar-circle" key={index}>
                                                                                {userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode ?
                                                                                    <Link to={`/user-detail/${user.id}`}>
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
                                                                    {task.assign_member?.length > 5 &&
                                                                        <span className="avatar avatar-xs avatar-circle">
                                                                            <span className="avatar-initials avatar-dark-light border-transprant">{task.assign_member?.length}</span>
                                                                        </span>}
                                                                </div>
                                                            </td>
                                                        }
                                                        <td>
                                                            <span className={`avatar avatar-sm-status bottom-0 end-0 ${getProjectStatusClass(task.project_status)} avatar-border me-1`}>&nbsp;</span>{task.project_name}
                                                        </td>
                                                        <td className="text-center">
                                                            <Dropdown className="category-dropdown edit-task-dropdown">
                                                                <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="cursor-pointer" id="edit-task"><button size="sm" className='btn btn-white circle-btn btn-icon btn-sm'><i className="fa-solid fa-ellipsis-vertical"></i></button></Dropdown.Toggle>
                                                                <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2" popperConfig={popperConfig}>
                                                                    {taskStatusList.filter(function (arr) { return arr.id !== task.task_status; }).map((status, index) => (
                                                                        <PermissionCheck permissions={['tasks.update']} key={index}>
                                                                            <Dropdown.Item onClick={() => { updateTaskStatus(task.id, status.id) }}>
                                                                                {`Mark as ${status.label}`}
                                                                            </Dropdown.Item>
                                                                        </PermissionCheck>
                                                                    ))}
                                                                    <PermissionCheck permissions={['tasks.update']} >
                                                                        <Dropdown.Item onClick={() => { cstShowEditTaskModal(task.id) }}>
                                                                            Edit Task
                                                                        </Dropdown.Item>
                                                                    </PermissionCheck>
                                                                    <PermissionCheck permissions={['tasks.view']}>
                                                                        <Dropdown.Item onClick={() => { cstShowViewTaskModal(task.id) }}>
                                                                            View Task
                                                                        </Dropdown.Item>
                                                                    </PermissionCheck>
                                                                    <PermissionCheck permissions={['tasks.delete']}>
                                                                        <Dropdown.Item className="text-danger" onClick={() => { deleteTask(task.id) }}>
                                                                            Delete Task
                                                                        </Dropdown.Item>
                                                                    </PermissionCheck>
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </td>

                                                    </tr>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </tbody>
                                )}
                            </Droppable>
                        </Table>
                    </DragDropContext>
                </div>
                <RatingReviewModal ratingModalShow={ratingModalShow} setShowRatingModal={setShowRatingModal} taskIdForRating={taskIdForRating} SetTaskIdForRating={SetTaskIdForRating} />
                <Footer />
            </div>
        </>
    );
}

const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(SetTaskPriority)