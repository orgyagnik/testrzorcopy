import React, { useState, useEffect, useRef } from 'react';
import { Dropdown, Button, Form, Offcanvas, InputGroup, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import AdddashedIcon from "../../assets/img/icons/add-dashed.svg";
import SimpleBar from 'simplebar-react';
import SearchIcon from "../../assets/img/icons/serach.svg";
import { Editor } from "@tinymce/tinymce-react";
import { filterDropdownOption, filterDropdownOptionByName, getFileExtensionFromFileName, check, capitalizeFirst, capitalizeForRepeatEvery } from "../../utils/functions.js";
import SingleDatePickerControl from '../../modules/custom/SingleDatePicker';
import APIService from "../../api/APIService";
import AvatarImg from "../../assets/img/placeholder-image.png";
import { toast } from 'react-toastify';
import { validateForm } from "../../utils/validator.js";
import { connect } from "react-redux";
import moment from 'moment';
import { repeatEveryListData, repeatEveryCustomListData, attachmentsAllowExtension, attachmentsAllowExtensionMsg, databaseRoleCode, tinymceInit } from '../../settings';
import { TaskValidator } from "../../modules/validation/TaskValidator";
import Select from 'react-select';
import AttachmentPreview from './AttachmentPreview';
import { FileUploader } from "react-drag-drop-files";
import { Link, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { ASSIGNEDTO_MSG } from '../../modules/lang/Task';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const REACT_APP_TINYMCE_APIKEY = process.env.REACT_APP_TINYMCE_APIKEY;

function AddTaskModal({ showAddtaskModal, setShowAddtaskModal, userData, setRefreshForNewPage, refreshForNewPage, task_type, cstShowViewTaskModal }) {
    let projectTitleval = '';
    let clientTitleval = '';
    const search = useLocation().search;
    const searchProjectId = new URLSearchParams(search).get('pid');
    const [dueDate, setDueDate] = useState(null);
    const [date, setDate] = useState(moment().startOf('day').toDate());
    const [project, setProject] = useState('');
    const [projectTitle, setProjectTitle] = useState('');
    const [projectList, setProjectList] = useState([]);
    const [repeatEveryCustomeList, setRepeatEveryCustomeList] = useState([]);
    const [repeatEveryCustomeListForFilter, setRepeatEveryCustomeListForFilter] = useState([]);
    const [isCustomRepeatEvery, setIsCustomRepeatEvery] = useState(false);
    const [clientList, setClientList] = useState([]);
    const [client, setClient] = useState('');
    const [clientName, setClientName] = useState('');
    const [repeatEvery, setRepeatEvery] = useState('');
    const [selectedAssignedBy, setSelectedAssignedBy] = useState([]);
    const [selectedFollower, setSelectedFollower] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [staffListForFilter, setStaffListForFilter] = useState([]);
    const [followerList, setFollowerList] = useState([]);
    const [followerListForFilter, setFollowerListForFilter] = useState([]);
    const [repeatEveryList, setRepeatEveryList] = useState([]);
    const [repeatEveryListForFilter, setRepeatEveryListForFilter] = useState([]);
    const [customEvery, setCustomEvery] = useState('Select');
    const [uploadOnTaskForClient, setUploadOnTaskForClient] = useState(0);
    const [assignToSearch, setAssignToSearch] = useState('');
    const [followerSearch, setFollowerSearch] = useState('');
    const [repeatEverySearch, setRepeatEverySearch] = useState('');
    const [customEverySeach, setCustomEverySeach] = useState('');
    const [attachmentsFile1, setAttachmentsFile1] = useState([]);

    let totalCyclesInput = useRef();
    let taskNameInput = useRef();
    let noOfTimeRepeatInput = useRef();
    const [infinity, setInfinity] = useState(true);
    const [process, setProcess] = useState(false);
    const [formErrors, setFormErrors] = useState([]);
    const [keywordInput, setKeywordInput] = useState("");
    const [keywordMetrics, setKeywordMetrics] = useState({ volume: 0, difficulty: 0 });


    //for html editor
    const [htmlContent, setHtmlContent] = useState();
    const onEditorChange = (e) => {
        setHtmlContent(e);
    }

    const onEditorClick = (e) => {
        document.getElementById("addTaskModalBody").click();
    }

    const customStyles = {
        option: (styles, { data }) => ({
            ...styles,
            cursor: 'pointer',
            fontWeight: data.isMain ? `bold` : 'normal',
        }),
        control: (styles) => ({
            ...styles,
            cursor: 'pointer',
            backgroundColor: 'white'
        }),
    };

    useEffect(() => {
        if (showAddtaskModal) {
            APIService.getAllProjects("")
                .then((response) => {
                    if (response.data?.status) {
                        let data = response.data?.data;
                        if (userData.role_code === databaseRoleCode.clientCode) {
                            data = data.filter(function (arr) { return arr.create_tasks === 1; });
                        }
                        let temData = data?.map(item => {
                            return { label: item.name, value: item.id }
                        });
                        //check project create permission
                        if (check(['projects.create'], userData?.role.getPermissions)) {
                            setProjectList([{ value: 0, label: "Create Project", isMain: true }, ...temData]);
                        }
                        else {
                            setProjectList(temData);
                        }
                    }
                });

            APIService.getAllClients()
                .then((response) => {
                    if (response.data?.status) {
                        let temData = response.data?.data?.map(item => {
                            return { label: item.name, value: item.id }
                        });
                        //check client create permission
                        if (check(['customers.create'], userData?.role.getPermissions)) {
                            setClientList([{ value: 0, label: "Create Customer", isMain: true }, ...temData]);
                        }
                        else {
                            setClientList(temData);
                        }
                    }
                });

            APIService.getAllMembers('')
                .then((response) => {
                    if (response.data?.status) {
                        setStaffList(response.data?.data);
                        setStaffListForFilter(response.data?.data);
                        setFollowerList(response.data?.data);
                        setFollowerListForFilter(response.data?.data);
                    }
                });

            setRepeatEveryList(repeatEveryListData);
            setRepeatEveryListForFilter(repeatEveryListData);
            setRepeatEveryCustomeList(repeatEveryCustomListData);
            setRepeatEveryCustomeListForFilter(repeatEveryCustomListData);
        }
        if (searchProjectId > 0) {
            setProject(parseInt(searchProjectId));
        }
    }, [showAddtaskModal]);

    const handleProjectSelect = async (selectedProject) => {
        let project_id = parseInt(selectedProject?.value);
        let project_name = selectedProject?.label;
        if (project_name === "Create Project") {
            // not need to call api for get all member because already there in follower state
            setSelectedAssignedBy([]);
            setStaffList(followerList);
            setStaffListForFilter(followerList);
            setProject(project_id);
            setProjectTitle(projectTitleval);
        }
        else {
            setProject(project_id);
            setSelectedAssignedBy([]);
            setProjectTitle('');
            APIService.getAllProjectMembers(project_id)
                .then((response) => {
                    if (response.data?.status) {
                        setStaffList(response.data?.data);
                        setStaffListForFilter(response.data?.data);
                        setUploadOnTaskForClient(response.data.upload_on_task);
                    }
                    else {
                        setStaffList([]);
                        setStaffListForFilter([]);
                    }
                });
        }
    };

    const handleClientSelect = async (selectedClient) => {
        setClient(parseInt(selectedClient?.value));
        if (parseInt(selectedClient?.value) === 0)
            setClientName(clientTitleval);
        else
            setClientName('');
    }

    const onCustomEverySelect = async (e) => {
        handleCustomEverySeach('');
        setCustomEvery(e);
    };

    const handleCustomEverySeach = (value) => {
        setCustomEverySeach(value);
        filterDropdownOption(repeatEveryCustomeList, value, setRepeatEveryCustomeListForFilter);
    }

    const onRepeatEverySelect = async (e) => {
        handleRepeatEverySearch('');
        setRepeatEvery(e);
        if (e === "custom")
            setIsCustomRepeatEvery(true);
        else
            setIsCustomRepeatEvery(false);
    };

    const handleRepeatEverySearch = (value) => {
        setRepeatEverySearch(value);
        filterDropdownOption(repeatEveryList, value, setRepeatEveryListForFilter);
    }

    const onAssignBySelect = (e) => {
        handleAssignToSearch('');
        let id = parseInt(e);
        if (id > 0) {
            let addRemovechk = selectedAssignedBy.filter(function (arr) { return arr.id === id; }).length > 0;
            if (!addRemovechk) {
                let newstaffList = staffList.filter(function (arr) {
                    return arr.id === id;
                })
                setSelectedAssignedBy(selectedAssignedBy.concat(newstaffList));
            }
            else {
                let newstaffList = selectedAssignedBy.filter(function (arr) {
                    return arr.id !== id;
                })
                setSelectedAssignedBy(newstaffList);
            }
        }
    };

    const handleAssignToSearch = (value) => {
        setAssignToSearch(value);
        filterDropdownOptionByName(staffList, value, setStaffListForFilter);
    }

    const onFollowerSelect = (e) => {
        handleFollowerSearch('');
        let id = parseInt(e);
        if (id > 0) {
            let addRemovechk = selectedFollower.filter(function (arr) { return arr.id === id; }).length > 0;
            if (!addRemovechk) {
                let newfollowerList = followerList.filter(function (arr) {
                    return arr.id === id;
                })
                setSelectedFollower(selectedFollower.concat(newfollowerList));
            }
            else {
                let newfollowerList = selectedFollower.filter(function (arr) {
                    return arr.id !== id;
                })
                setSelectedFollower(newfollowerList);
            }
        }
    };

    const handleFollowerSearch = (value) => {
        setFollowerSearch(value);
        filterDropdownOptionByName(followerList, value, setFollowerListForFilter)
    }

    const handleRemoveAttachmentsFile = (img) => {
        let newFileList = attachmentsFile1.filter(function (arr) {
            return arr.source !== img;
        })
        setAttachmentsFile1(newFileList);
    };

    const cstSetCloseAddtaskModal = () => setShowAddtaskModal(false);

    const addTask = async () => {
        setProcess(true);
        setFormErrors([]);
    
        let validate = validateForm((TaskValidator(project === 0 ? 'not required' : project, project === 0 ? projectTitle : 'not required', 'not required', 'not required', taskNameInput.current?.value, date, dueDate, 'not required', repeatEvery === 'custom' ? noOfTimeRepeatInput.current.value : 'not required', repeatEvery === 'custom' ? customEvery === 'Select' ? '' : customEvery : 'not required')));
        if (Object.keys(validate).length) {
            setProcess(false);
            setFormErrors(validate);
        } else {
            const params = new FormData();
            let task_type_new = task_type;
            if (userData?.role_code === databaseRoleCode.clientCode) {
                if (userData?.current_plan.includes('addons')) {
                    task_type_new = 1;
                } else {
                    task_type_new = 0;
                }
            }
            params.append("task_type", task_type_new);
            if (project === 0) {
                params.append("project_name", projectTitle);
    
                if (client !== 0) {
                    params.append("clientid", client ? client : 0);
                } else {
                    params.append("client_name", clientName);
                }
            } else {
                params.append("project_id", project);
            }
    
            params.append("start_date", format(date, "yyyy-MM-dd"));
            if (dueDate !== null && dueDate !== '')
                params.append("due_date", format(dueDate, "yyyy-MM-dd"));
            let assigned_members_list = selectedAssignedBy.map((obj) => obj.id);
            if (userData?.role_code !== databaseRoleCode.clientCode) {
                if (!assigned_members_list.includes(userData?.id))
                    assigned_members_list.push(userData?.id);
            }
            if (userData?.role_code === databaseRoleCode.clientCode) {
                params.append("assigned_members", 0);
            } else {
                params.append("assigned_members", assigned_members_list.join());
            }
            params.append("name", taskNameInput.current.value);
            params.append("description", htmlContent ? htmlContent : '');
            params.append("keywords", keywordInput);
            let every_main = repeatEvery === 'custom' ? `${noOfTimeRepeatInput.current.value} ${customEvery}` : repeatEvery;
            params.append("custom_recurring", repeatEvery === 'custom' ? 1 : 0);
            let every_array = every_main.split(" ");
            if (every_array.length > 1) {
                params.append("repeat_every", every_array[0]);
                params.append("recurring_type", every_array[1]);
            }
            let totCyc = userData?.role_code === databaseRoleCode.clientCode ? 0 : totalCyclesInput?.current?.value ? totalCyclesInput?.current?.value : 0;
            params.append("cycles", infinity ? 0 : totCyc);
            params.append("addedfrom", userData?.id);
            params.append("status", 1);
            params.append("action_Value", 1);
            let assign_followers_list = selectedFollower.map((obj) => obj.id);
            if (assign_followers_list.join() !== '')
                params.append("assign_followers", assign_followers_list.join());
            let len = attachmentsFile1?.length ? attachmentsFile1.length : 0;
            for (let i = 0; i < len; i++) {
                params.append(
                    "attechment",
                    attachmentsFile1[i].file
                );
            }
    
            try {
                // Fetch existing project data
                const projectResponse = await APIService.getProjectForEdit(project);
                if (!projectResponse.data?.status) {
                    throw new Error(
                        projectResponse.data?.message || "Failed to fetch project details"
                    );
                }
    
                const projectData = projectResponse.data?.data;
                let existingKeywords = [];
    
                // Parse existing keywords
                if (projectData.targeted_keywords) {
                    existingKeywords = projectData.targeted_keywords
                        .split(",")
                        .map((k) => k.trim());
                }
    
                // Add new keyword if it doesn't exist
                if (!existingKeywords.includes(keywordInput)) {
                    existingKeywords.push(keywordInput);
                }
    
                // Prepare update parameters with existing data
                const updateParams = new FormData();
                updateParams.append("projectid", project);
                updateParams.append("targeted_keywords", existingKeywords.join(","));
                updateParams.append("name", projectData.name);
                updateParams.append("clientid", projectData.clientid);
                updateParams.append("settings", projectData.settings);
                updateParams.append("assigned_members", projectData.assigned_members);
                updateParams.append("description", projectData.description);
                updateParams.append("website_url", projectData.website_url);
                updateParams.append("language", projectData.language);
                updateParams.append("location", projectData.location);
                updateParams.append("targeted_audience", projectData.targeted_audience);
                updateParams.append("competitors_websites", projectData.competitors_websites);
                updateParams.append("topic_titles", projectData.topic_titles);
                updateParams.append("start_date", projectData.start_date);
                updateParams.append("due_date", projectData.due_date);
    
                await APIService.updateProject(updateParams);
    
                // Fetch keyword metrics before adding the task
                const metricsResponse = await APIService.fetchKeywordMetrics({ keywords: [keywordInput] });
                let metrics = { volume: 0, difficulty: 0 };
                if (metricsResponse.data?.success) {
                    metrics = metricsResponse.data.data[0];
                }

                // Add task with metrics
                params.append("keyword_volume", metrics.keyword_volume || 0);
                params.append("keyword_difficulty", metrics.keyword_difficulty || 0);

                const response = await APIService.addTask(params);
                if (response.data?.status) {
                    toast.success(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                    setProcess(false);
                    setShowAddtaskModal(false);
                    clearControl();
                    setHtmlContent('');
                    cstSetCloseAddtaskModal();
                    setRefreshForNewPage(!refreshForNewPage);
                    cstShowViewTaskModal(response.data?.data?.insertId);
                } else {
                    toast.error(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                    setProcess(false);
                }
            } catch (error) {
                toast.error(error.message || "An error occurred", {
                    position: toast.POSITION.TOP_RIGHT
                });
                setProcess(false);
            }
        }
    }

    const clearControl = async () => {
        setProject('');
        setProjectTitle('');
        setClient('');
        setClientName('');
        if (taskNameInput.current !== undefined)
            taskNameInput.current.value = '';
        setDate(moment().startOf('day').toDate());
        setDueDate(null);
        setSelectedAssignedBy([]);
        setStaffListForFilter(staffList);
        setSelectedFollower([]);
        setFollowerListForFilter(followerList);
        setRepeatEvery('');
        setRepeatEveryListForFilter(repeatEveryList);
        if (totalCyclesInput.current !== undefined)
            totalCyclesInput.current.value = '';
        setInfinity(false);
        /*setEditorState(EditorState.createEmpty());
        setHtmlContent('');*/
        //selectAttachmentsFile([]);
        setAttachmentsFile1([]);
        setIsCustomRepeatEvery(false);
    }

    const handleAttachmentClick = async (file) => {
        window.open(file, '_blank', 'noopener,noreferrer');
    }

    const projectFilterOption = (options, inputValue) => {
        if (inputValue) {
            projectTitleval = inputValue;
            return options.value === 0 || (options.label && options.label.toLowerCase().includes(inputValue.toLowerCase()));
        }
        return true;
    };

    const clientFilterOption = (options, inputValue) => {
        if (inputValue) {
            clientTitleval = inputValue;
            return options.value === 0 || (options.label && options.label.toLowerCase().includes(inputValue.toLowerCase()));
        }
        return true;
    };

    const handleDragAndDropChange = (files) => {
        setFormErrors([]);
        let filesNew = [];
        let fileLength = files.length;
        if (fileLength > 0) {
            for (let i = 0; i < fileLength; i++) {
                const file = files[i];
                let file_ext = getFileExtensionFromFileName(file.name);
                if (attachmentsAllowExtension.includes(file_ext.toLowerCase())) {
                    filesNew.push({ source: URL.createObjectURL(file), name: file.name, size: file.size, file: file });
                }
            }
            setAttachmentsFile1([...filesNew, ...attachmentsFile1]);
        }
    };

    return (
        <>
        
            <Offcanvas show={showAddtaskModal} className="add-task-sidebar" enforceFocus={false} placement="end" keyboard={false} onHide={cstSetCloseAddtaskModal}>
                <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
                    <div className="d-flex align-items-center">
                        {/* <div className="m-0 form-check-sm form-check green-check">
                            <input type="checkbox" id="completedCheck" className="form-check-input" />
                            <label title="" for="completedCheck" className="form-check-label mb-0 dark-1 font-14">Mark Complete</label>
                        </div>
                        <a href="#" className="btn btn-sm btn-outline-primary  ms-3 py-1 h-auto dark-3 border-gray-100 font-weight-medium">Make private</a> */}
                        <h3 className="dark-1 mb-0">{`${task_type === 1 ? 'Add addons task' : 'Add task'}`}</h3>
                    </div>
                    <ul className="ovrlay-header-icons">

                        {/* <li>
                      <button type="button" className="btn-icon circle-btn btn btn-white btn-sm">
                        <i className="icon-attachment"></i>
                      </button>
                    </li> 
                        <li>
                            <OverlayTrigger placement="bottom" overlay={<Tooltip id={`copy-link`}> Copy task link</Tooltip>}>
                                <button type="button" className="btn-icon circle-btn btn btn-white btn-sm">
                                    <i className="icon-link"></i>
                                </button>
                            </OverlayTrigger>
                        </li>
                        <li>

                            <Dropdown className="category-dropdown edit-task-dropdown">
                                <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="cursor-pointer" id="edit-task"><button type="button" className="btn-icon circle-btn btn btn-white btn-sm"><i className="icon-more"></i></button></Dropdown.Toggle>
                                <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2 w-100">
                                    <Dropdown.Item >
                                        Duplicate task
                                    </Dropdown.Item>
                                    <Dropdown.Item className="text-danger">
                                        Delete Task
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </li> */}
                        <li>
                            <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> Close task</Tooltip>}>
                                <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={cstSetCloseAddtaskModal}>
                                    <i className="icon-cancel"></i>
                                </button>
                            </OverlayTrigger>
                        </li>
                    </ul>

                </Offcanvas.Header>
                <Offcanvas.Body className="p-0" id='addTaskModalBody'>
                    <Form onSubmit={async e => { e.preventDefault(); await addTask() }}>
                        <SimpleBar className="offcanvas-inner">
                            <div className="p-6">
                                <Form.Control as="textarea" rows={1} placeholder="Write a task name here..." ref={taskNameInput} className={`task-title placeholder-dark  ${formErrors.taskNameInput && 'is-invalid'}`} />
                                {formErrors.taskNameInput && (
                                    <span className="text-danger">{formErrors.taskNameInput}</span>
                                )}
                                <div className="task-content mt-6 row">
                                    <div className="task-content-list d-lg-block align-items-center col-12 col-md-6 col-lg-6 col-xl-3">
                                        <div className="task-label-left mb-lg-2">
                                            <span className="font-12 dark-1">Project:<span className='validation-required-direct'></span></span>
                                        </div>
                                        <div className="task-label-right">
                                            <Select styles={customStyles} classNamePrefix="react-select" className={`custom-select ${formErrors.projectInput && 'is-react-select-invalid'}`} filterOption={projectFilterOption} options={projectList} onChange={handleProjectSelect}
                                                value={projectList.filter(function (option) {
                                                    return option.value === project;
                                                })} />
                                        </div>
                                        {formErrors.projectInput && (
                                            <span className="text-danger">{formErrors.projectInput}</span>
                                        )}
                                    </div>
                                    <Form.Group className="task-content-list d-lg-block align-items-center col-12 col-md-6 col-lg-6 col-xl-3" controlId="keywordInput">
                                        <div className="task-label-left">
                                            <Form.Label className="font-12 dark-1">Keyword</Form.Label>
                                        </div>
                                        <div className="task-label-right">
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter a keyword"
                                                value={keywordInput}
                                                onChange={(e) => setKeywordInput(e.target.value)}
                                                className={`form-control ${formErrors.keywordInput && "is-invalid"}`}
                                            />
                                        </div>
                                        {formErrors.keywordInput && (
                                            <span className="text-danger">{formErrors.keywordInput}</span>
                                        )}
                                    </Form.Group>
                                    {project === 0 &&
                                        <>
                                            <div className="task-content-list d-lg-block align-items-center col-12 col-md-6 col-lg-6 col-xl-3">
                                                <div className="task-label-left mb-lg-1">
                                                    <span className="font-12 dark-1">Project Title:<span className='validation-required-direct'></span></span>
                                                </div>
                                                <div className="task-label-right">
                                                    <Form.Control autoFocus placeholder="Enter Project Title" className={` ${formErrors.projectTitleInput && 'is-invalid'}`} value={projectTitle} onChange={(e) => { setProjectTitle(e.target.value) }} />
                                                    {formErrors.projectTitleInput && (
                                                        <span className="text-danger">{formErrors.projectTitleInput}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="task-content-list d-lg-block align-items-center col-12 col-md-6 col-lg-6 col-xl-3">
                                                <div className="task-label-left mb-lg-1">
                                                    <span className="font-12 dark-1">Select Customer:</span>
                                                </div>
                                                <div className="task-label-right">
                                                    <Select className='custom-select' styles={customStyles} filterOption={clientFilterOption} options={clientList} onChange={handleClientSelect}
                                                        value={clientList.filter(function (option) {
                                                            return option.value === client;
                                                        })} />
                                                </div>
                                                {formErrors.clientInput && (
                                                    <span className="text-danger">{formErrors.clientInput}</span>
                                                )}
                                            </div>
                                            {client === 0 &&
                                                <div className="task-content-list d-lg-block align-items-center col-12 col-md-6 col-lg-6 col-xl-3">
                                                    <div className="task-label-left mb-lg-1">
                                                        <span className="font-12 dark-1">Customer Name:</span>
                                                    </div>
                                                    <div className="task-label-right">
                                                        <Form.Control autoFocus placeholder="Enter Customer Name" className={` ${formErrors.clientNameInput && 'is-invalid'}`} value={clientName} onChange={(e) => { setClientName(e.target.value) }} />
                                                        {formErrors.clientNameInput && (
                                                            <span className="text-danger">{formErrors.clientNameInput}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            }
                                        </>
                                    }
                                </div>

                                <div className="task-content mt-6 row">
                                    {/* <div className="task-content-list d-lg-block align-items-center col-12 col-md-6 col-lg-6 col-xl-2">
                                        <div className="task-label-left mb-lg-3">
                                            <span className="font-12 dark-1">Start Date:<span className='validation-required-direct'></span></span>
                                        </div>
                                        <div className="task-label-right">
                                            <SingleDatePickerControl
                                                selected={date}
                                                onDateChange={(date) => setDate(date)}
                                                onChange={(date) => setDate(date)}
                                                minDate={ (userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode) ? null : moment().startOf('day').toDate() }
                                                maxDate={dueDate}
                                                className={`form-control ${formErrors.date && 'is-invalid'}`}
                                            />
                                            {formErrors.date && (
                                                <span className="text-danger">{formErrors.date}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="task-content-list d-lg-block align-items-center col-12 col-md-6 col-lg-6 col-xl-2">
                                        <div className="task-label-left mb-lg-3">
                                            <span className="font-12 dark-1">Due Date:</span>
                                        </div>
                                        <div className="task-label-right">
                                            <SingleDatePickerControl
                                                selected={dueDate}
                                                onDateChange={(date) => setDueDate(date)}
                                                onChange={(date) => setDueDate(date)}
                                                minDate={ (userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode) ? null : date ? date : moment().startOf('day').toDate() }
                                                isClearable
                                                className={`form-control ${formErrors.dueDate && 'is-invalid'}`}
                                            />
                                            {formErrors.dueDate && (
                                                <span className="text-danger">{formErrors.dueDate}</span>
                                            )}
                                        </div>
                                    </div> */}
                                    {userData?.role_code !== databaseRoleCode.clientCode &&
                                        <>
                                            <div className="task-content-list d-lg-block align-items-center col-12 col-md-6 col-lg-6 col-xl-4">
                                                <div className="task-label-left mb-lg-3">
                                                    <span className="font-12 dark-1">
                                                        Assigned To
                                                        <OverlayTrigger placement="bottom" overlay={<Tooltip id={`tooltip-hours`}>{ASSIGNEDTO_MSG}</Tooltip>}>
                                                            <i className="fa-solid fa-circle-info ms-1"></i>
                                                        </OverlayTrigger> :
                                                    </span>
                                                </div>
                                                <div className="task-label-right">
                                                    <div className="avatar-group">
                                                        {selectedAssignedBy.map((assignUser, index) => (
                                                            <span className="avatar avatar-md avatar-circle" key={index}>
                                                                {userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode ?
                                                                    <Link to={`/user-detail/${assignUser.id}`}>
                                                                        <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${index}`}> {assignUser.name}</Tooltip>}>
                                                                            {assignUser.profile_image !== '' && assignUser.profile_image !== null ?
                                                                                <img className="avatar-img" src={`${assignUser.profile_image}`} alt={assignUser.name} onError={({ currentTarget }) => {
                                                                                    currentTarget.onerror = null;
                                                                                    currentTarget.src = AvatarImg;
                                                                                }} />
                                                                                :
                                                                                <img className="avatar-img" src={AvatarImg} alt={assignUser.name} />
                                                                            }
                                                                        </OverlayTrigger>
                                                                    </Link>
                                                                    :
                                                                    <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${index}`}> {assignUser.name}</Tooltip>}>
                                                                        {assignUser.profile_image !== '' && assignUser.profile_image !== null ?
                                                                            <img className="avatar-img" src={`${assignUser.profile_image}`} alt={assignUser.name} onError={({ currentTarget }) => {
                                                                                currentTarget.onerror = null;
                                                                                currentTarget.src = AvatarImg;
                                                                            }} />
                                                                            :
                                                                            <img className="avatar-img" src={AvatarImg} alt={assignUser.name} />
                                                                        }
                                                                    </OverlayTrigger>
                                                                }
                                                            </span>
                                                        ))}

                                                        <span className="avatar avatar-md avatar-circle">
                                                            <Dropdown className="project-drop-down category-dropdown " onSelect={onAssignBySelect} autoClose="outside">
                                                                <Dropdown.Toggle as="a" bsPrefix="no-toggle" className="dark-2 font-weight-medium font-12 cursor-pointer" id="assign"><img alt='Add Member' className="avatar-img" src={AdddashedIcon} /></Dropdown.Toggle>
                                                                <Dropdown.Menu as="ul" align="down" className="p-2 w-100">
                                                                    <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                                                                        <div className="search-box w-100">
                                                                            <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                                                                <img src={SearchIcon} alt="Search" />
                                                                                <input type="search" className="form-control border-0" placeholder="Name" value={assignToSearch} onChange={(e) => handleAssignToSearch(e.target.value)} />
                                                                            </div>
                                                                        </div>
                                                                    </Dropdown.Header>
                                                                    <SimpleBar className="dropdown-body">
                                                                        {staffListForFilter.map((drp, index) => (
                                                                            <Dropdown.Item as="li" key={index} eventKey={drp.id} className={`${selectedAssignedBy.filter(function (arr) {
                                                                                return arr.id === drp.id;
                                                                            }).length > 0 ? 'active' : ''}`}>
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
                                                                            </Dropdown.Item>
                                                                        ))}
                                                                    </SimpleBar>
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </span>
                                                    </div>
                                                </div>
                                                {formErrors.selectedAssignedBy && (
                                                    <span className="text-danger">{formErrors.selectedAssignedBy}</span>
                                                )}
                                            </div>
                                            <div className="task-content-list d-lg-block align-items-center col-12 col-md-6 col-lg-6 col-xl-4">
                                                <div className="task-label-left mb-lg-3">
                                                    <span className="font-12 dark-1">Follower:</span>
                                                </div>
                                                <div className="task-label-right">
                                                    <div className="avatar-group">
                                                        {selectedFollower.map((assignUser, index) => (
                                                            <span className="avatar avatar-md avatar-circle" key={index}>
                                                                {userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode ?
                                                                    <Link to={`/user-detail/${assignUser.id}`}>
                                                                        <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${index}`}> {assignUser.name}</Tooltip>}>
                                                                            {assignUser.profile_image !== '' && assignUser.profile_image !== null ?
                                                                                <img className="avatar-img" src={`${assignUser.profile_image}`} alt={assignUser.name} onError={({ currentTarget }) => {
                                                                                    currentTarget.onerror = null;
                                                                                    currentTarget.src = AvatarImg;
                                                                                }} />
                                                                                :
                                                                                <img className="avatar-img" src={AvatarImg} alt={assignUser.name} />
                                                                            }
                                                                        </OverlayTrigger>
                                                                    </Link>
                                                                    :
                                                                    <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${index}`}> {assignUser.name}</Tooltip>}>
                                                                        {assignUser.profile_image !== '' && assignUser.profile_image !== null ?
                                                                            <img className="avatar-img" src={`${assignUser.profile_image}`} alt={assignUser.name} onError={({ currentTarget }) => {
                                                                                currentTarget.onerror = null;
                                                                                currentTarget.src = AvatarImg;
                                                                            }} />
                                                                            :
                                                                            <img className="avatar-img" src={AvatarImg} alt={assignUser.name} />
                                                                        }
                                                                    </OverlayTrigger>
                                                                }
                                                            </span>
                                                        ))}

                                                        <span className="avatar avatar-md avatar-circle">
                                                            <Dropdown className="project-drop-down category-dropdown " onSelect={onFollowerSelect} autoClose="outside">
                                                                <Dropdown.Toggle as="a" bsPrefix="no-toggle" className="dark-2 font-weight-medium font-12 cursor-pointer" id="assign"><img alt='Add Member' className="avatar-img" src={AdddashedIcon} /></Dropdown.Toggle>
                                                                <Dropdown.Menu as="ul" align="down" className="p-2 w-100">
                                                                    <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                                                                        <div className="search-box w-100">
                                                                            <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                                                                <img src={SearchIcon} alt="Search" />
                                                                                <input type="search" className="form-control border-0" placeholder="Name" value={followerSearch} onChange={(e) => handleFollowerSearch(e.target.value)} />
                                                                            </div>
                                                                        </div>
                                                                    </Dropdown.Header>
                                                                    <SimpleBar className="dropdown-body">
                                                                        {followerListForFilter.map((drp, index) => (
                                                                            <Dropdown.Item as="li" key={index} eventKey={drp.id} className={`${selectedFollower.filter(function (arr) {
                                                                                return arr.id === drp.id;
                                                                            }).length > 0 ? 'active' : ''}`}>
                                                                                <div className="d-flex d-flex align-items-center cursor-pointer w-100">
                                                                                    {drp.profile_image !== '' && drp.profile_image !== null ?
                                                                                        <img className="avatar avatar-xs avatar-circle me-1" src={`${drp.profile_image}`} alt={drp.name} onError={({ currentTarget }) => {
                                                                                            currentTarget.onerror = null;
                                                                                            currentTarget.src = AvatarImg;
                                                                                        }} />
                                                                                        :
                                                                                        <img className="avatar avatar-xs avatar-circle me-1" src={AvatarImg} alt={drp.name} />
                                                                                    }
                                                                                    <div className="ps-3">
                                                                                        <div className="font-weight-regular dark-1 font-14 d-block">{drp.name}</div>
                                                                                    </div>
                                                                                </div>
                                                                            </Dropdown.Item>
                                                                        ))}
                                                                    </SimpleBar>
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    }
                                </div>
                                {/* {userData?.role_code !== databaseRoleCode.clientCode && */}
                                <>
                                    {/* <div className="task-content mt-6 row">
                                        <div className="task-content-list d-lg-block align-items-center col-12 col-md-6 col-lg-4 col-xxl-3 col-xxxl-2">
                                            <div className="task-label-left mb-lg-3">
                                                <span className="font-12 dark-1">Repeat every:</span>
                                            </div>
                                            <div className="task-label-right">
                                                <Dropdown className="repeat-every-dropdown" onSelect={onRepeatEverySelect}>
                                                    <Dropdown.Toggle as="div" bsPrefix="dropdown-custom-toggle" className="dark-2 font-12 cursor-pointer bordered-dropdown" id="RepeatEvery"><div className="avatar avatar-md-status bottom-0 end-0 avatar-primary avatar-border me-1 d-inline-block">&nbsp;</div> {repeatEvery !== '' ? capitalizeForRepeatEvery(repeatEvery) : 'Select Repeat Every'}</Dropdown.Toggle>
                                                    <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2 w-100">
                                                        <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                                                            <div className="search-box w-100">
                                                                <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                                                    <img src={SearchIcon} alt="Search" />
                                                                    <input type="search" className="form-control border-0" placeholder="Search..." value={repeatEverySearch} onChange={(e) => handleRepeatEverySearch(e.target.value)} />
                                                                </div>
                                                            </div>
                                                        </Dropdown.Header>
                                                        <SimpleBar className="dropdown-body">
                                                            <Dropdown.Item eventKey={""} >Select Repeat Every</Dropdown.Item>
                                                            {repeatEveryListForFilter.map((drp, index) => (
                                                                <Dropdown.Item key={index} eventKey={drp.value} >{drp.label}</Dropdown.Item>
                                                            ))}
                                                        </SimpleBar>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </div>
                                        </div>
                                        {isCustomRepeatEvery &&
                                            <>
                                                <div className="task-content-list d-lg-block align-items-center col-12 col-md-6 col-lg-4 col-xxl-3 col-xxxl-2">
                                                    <div className="task-label-left mb-lg-3">
                                                        <span className="font-12 dark-1">No of Time:<span className="validation-required-direct"></span></span>
                                                    </div>
                                                    <div className="task-label-right">
                                                        <Form.Control type='number' autoFocus placeholder="Enter No. of time" ref={noOfTimeRepeatInput} />
                                                        {formErrors.noOfTimeRepeatInput && (
                                                            <span className="text-danger">{formErrors.noOfTimeRepeatInput}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="task-content-list d-lg-block align-items-center col-12 col-md-6 col-lg-4 col-xxl-3 col-xxxl-2">
                                                    <div className="task-label-left mb-lg-3">
                                                        <span className="font-12 dark-1">Every:<span className="validation-required-direct"></span></span>
                                                    </div>
                                                    <div className="task-label-right">
                                                        <Dropdown className="" onSelect={onCustomEverySelect}>
                                                            <Dropdown.Toggle as="div" bsPrefix="dropdown-custom-toggle" className="dark-2 bordered-dropdown cursor-pointer" id="CustomEvery"><div className="avatar avatar-md-status bottom-0 end-0 avatar-primary avatar-border me-1 d-inline-block">&nbsp;</div> {capitalizeFirst(customEvery)}</Dropdown.Toggle>
                                                            <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2 w-100">
                                                                <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                                                                    <div className="search-box w-100">
                                                                        <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                                                            <img src={SearchIcon} alt="Search" />
                                                                            <input type="search" className="form-control border-0" placeholder="Search..." value={customEverySeach} onChange={(e) => handleCustomEverySeach(e.target.value)} />
                                                                        </div>
                                                                    </div>
                                                                </Dropdown.Header>
                                                                <SimpleBar className="dropdown-body">
                                                                    {repeatEveryCustomeListForFilter.map((drp, index) => (
                                                                        <Dropdown.Item key={index} as="li" eventKey={drp.value}>{drp.label}</Dropdown.Item>
                                                                    ))}
                                                                </SimpleBar>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                        {formErrors.customEvery && (
                                                            <span className="text-danger">{formErrors.customEvery}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        }
                                    </div>
                                    {repeatEvery !== '' &&
                                        <div className="task-content mt-6 row">
                                            <div className="task-content-list d-lg-block align-items-center col-12 col-md-6 col-lg-4 col-xxl-3 col-xxxl-2">
                                                <div className="task-label-left mb-lg-3">
                                                    <span className="font-12 dark-1">Total Cycles:</span>
                                                </div>
                                                <div className="task-label-right">
                                                    <InputGroup className="inputgroup-default">
                                                        <Form.Control ref={totalCyclesInput} disabled={infinity} type="number" />
                                                        <InputGroup.Text>
                                                            <Form.Check id='chk-infinity' onChange={() => { setInfinity(!infinity); totalCyclesInput.current.value = ''; }} checked={infinity} />Infinity
                                                        </InputGroup.Text>
                                                    </InputGroup>
                                                </div>
                                            </div>
                                        </div>
                                    } */}
                                </>
                                {/* } */}
                                <div className="task-description mt-6">
                                    <span className="font-12 font-weight-semibold dark-1 d-block mb-3">Task Description</span>
                                    {/* <Editor
                                        apiKey={REACT_APP_TINYMCE_APIKEY}
                                        value={htmlContent}
                                        init={tinymceInit}
                                        onEditorChange={onEditorChange}
                                        onClick={onEditorClick}
                                    /> */}
                                    <ReactQuill theme="snow" value={htmlContent} onChange={setHtmlContent} />
                                </div>
                                {/* {userData?.role_code !== databaseRoleCode.clientCode || uploadOnTaskForClient === 1 ?
                                    <div className="task-attachment mt-7">
                                        <span className="font-12 font-weight-semibold dark-1 d-block mb-3">Attachments</span>
                                        <FileUploader handleChange={handleDragAndDropChange} multiple={true} name="file" types={attachmentsAllowExtension} maxSize={10} children={<div className="custom-flie-input"><span><i className='icon-attachment me-2'></i> Upload or drop a file right here</span></div>} onTypeError={(e) => { setFormErrors({ fileUploader: `${e} ${attachmentsAllowExtensionMsg}` }); }} onSizeError={(e) => { setFormErrors({ fileUploader: `${e} file size should less than 10MB` }); }} />
                                        {formErrors.fileUploader && (
                                            <span className="text-danger d-block">{formErrors.fileUploader}</span>
                                        )}
                                        <div className="task-content mt-6 row">
                                            {attachmentsFile1 ? (
                                                attachmentsFile1.map((file, index) => (
                                                    <div className="task-content-list d-lg-block align-items-center col-12 col-md-4 col-lg-3 col-xl-2" key={index}>
                                                        <AttachmentPreview file={file} handleRemoveAttachmentsFile={handleRemoveAttachmentsFile} handleAttachmentClick={handleAttachmentClick} />
                                                    </div>
                                                ))
                                            ) : (
                                                <span>No file selected</span>
                                            )}
                                        </div>
                                    </div> : ''
                                } */}
                            </div>


                        </SimpleBar>
                        <div className="add-comment-area action-bottom-bar-fixed action-bottom-bar-lg px-6 py-3 border-top border-gray-100 text-end">
                            <Button disabled={process} className="me-2" variant="soft-secondary" size="md" type="button" onClick={() => { clearControl(); cstSetCloseAddtaskModal(); }}>Cancel</Button>
                            <Button disabled={process} variant="primary" size="md" type="submit">
                                {
                                    !process && 'Save'
                                }
                                {
                                    process && <><Spinner size="sm" animation="border" className="me-1" />Save</>
                                }
                            </Button>
                        </div>
                    </Form>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}

const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(AddTaskModal)
