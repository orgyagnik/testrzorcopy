import React, { useState, useEffect } from 'react';
import { Modal, Dropdown, Button, Form, Offcanvas, InputGroup, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
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
import { confirmAlert } from 'react-confirm-alert';
import { DELETE_ATTACHMENT, ASSIGNEDTO_MSG } from '../../modules/lang/Task';
import Select from 'react-select';
import AttachmentPreview from './AttachmentPreview';
import { FileUploader } from "react-drag-drop-files";
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const REACT_APP_TINYMCE_APIKEY = process.env.REACT_APP_TINYMCE_APIKEY;

function EditTaskModal({ pageType, showEditTaskModal, setShowEditTaskModal, taskId, setRefreshForNewPage, refreshForNewPage, task_type, siteAddonURL, tasksURL, favouriteURL, userData, deleteTask, cstShowViewTaskModal, search, setTaskId, showRatingModal }) {
    const cstSetCloseEdittaskModal = () => {
        if (task_type === 1)
            window.history.replaceState(null, '', `${siteAddonURL}${search}`);
        else if (task_type === 3)
            window.history.replaceState(null, '', `${favouriteURL}${search}`);
        else
            window.history.replaceState(null, '', `${tasksURL}${search}`);
        setShowEditTaskModal(false);
        setTimeout(() => {
            clearControl();
            if (window.location.pathname === "/tasks") {
                setTaskId(0);
            }
        }, 500);
    };
    const [dueDate, setDueDate] = useState(null);
    const [date, setDate] = useState(null);
    const [passedCycles, setPassedCycles] = useState(0);
    const [project, setProject] = useState('');
    const [status, setStatus] = useState('');
    const [projectList, setProjectList] = useState([]);
    const [repeatEveryCustomeList, setRepeatEveryCustomeList] = useState([]);
    const [repeatEveryCustomeListForFilter, setRepeatEveryCustomeListForFilter] = useState([]);
    const [isCustomRepeatEvery, setIsCustomRepeatEvery] = useState(false);
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
    const [customNoOfTimeRepeat, setCustomNoOfTimeRepeat] = useState('Select');
    const [uploadOnTaskForClient, setUploadOnTaskForClient] = useState(0);
    const [assignToSearch, setAssignToSearch] = useState('');
    const [followerSearch, setFollowerSearch] = useState('');
    const [repeatEverySearch, setRepeatEverySearch] = useState('');
    const [customEverySeach, setCustomEverySeach] = useState('');

    const [attachmentsFile1, setAttachmentsFile1] = useState([]);
    const [attachmentsFileForEdit, setAttachmentsFileForEdit] = useState([]);
    const [taskStatusList, setTaskStatusList] = useState([]);

    //let totalCyclesInput = useRef();
    //let taskNameInput = useRef();
    const [totalCycles, setTotalCycles] = useState('');
    const [taskName, setTaskName] = useState(false);
    //let noOfTimeRepeatInput = useRef();
    const [infinity, setInfinity] = useState(false);
    const [process, setProcess] = useState(false);
    const [formErrors, setFormErrors] = useState([]);
    const [addedFrom, setAddedFrom] = useState(0);
    const [isAddedFromContact, setIsAddedFromContact] = useState(0);
    const [selectedStatus, setSelectedStatus] = useState(null); // Define state for selected status
    const [generatedOutline, setGeneratedOutline] = useState(''); // Add state for generated article
    const [generatedArticle, setGeneratedArticle] = useState(''); // Add state for generated article


    //for html editor
    const [htmlContent, setHtmlContent] = useState();

    const [showPublishModal, setShowPublishModal] = useState(false);
    const [publishUrl, setPublishUrl] = useState('');

    const handlePublish = () => {
        if (publishUrl.trim() !== "") {
            changeTaskStatusWithUrl(taskId, 5, publishUrl); // Assuming 5 is the ID for "Published"
            setShowPublishModal(false);
            setPublishUrl("");
        } else {
            toast.error("Please enter a valid URL", {
                position: toast.POSITION.TOP_RIGHT,
            });
        }
    };

    const changeTaskStatusWithUrl = (taskId, statusId, publishUrl = null) => {
        const params = {
            taskid: taskId,
            status: statusId,
            user_entered_url: publishUrl
        };

        APIService.updateTask(params)
            .then((response) => {
                if (response.data?.status) {
                    toast.success("Task status updated successfully", {
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    setRefreshForNewPage((prev) => !prev);
                    if (statusId === 5) {
                        showRatingModal(taskId); // Show the rating modal
                    }
                } else {
                    toast.error("Failed to update task status", {
                        position: toast.POSITION.TOP_RIGHT,
                    });
                }
            })
            .catch((error) => {
                toast.error("An error occurred", {
                    position: toast.POSITION.TOP_RIGHT,
                });
            });
    };


    const formatOutlineContent = (content) => {
        // Example formatting logic (you can customize this as needed)
        return content
        .replace(/(\*\*.*?\*\*):/g, '<h3>$1</h3>') // Convert bold text followed by a colon to h3
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove asterisks from bold text
        .replace(/(\d+\.\s)/g, '<br/>$1') // Convert numbered items to plain text with line breaks
        .replace(/(\n\n)/g, '<br/><br/>') // Convert double newlines to paragraph breaks
        .replace(/(\n)/g, '<br/>'); // Convert single newlines to line breaks
  };

    const formatArticleContent = (content) => {
        return content
            .replace(/^###\s*(.*)$/gm, '<h3>$1</h3>')
            .replace(/^##\s*(.*)$/gm, '<h2>$1</h2>')
            .replace(/^#\s*(.*)$/gm, '<h1>$1</h1>')
            .replace(/(\*\*.*?\*\*):/g, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/(\d+\.\s)/g, '<br/>$1')
            .replace(/(\n\n)/g, '<br/><br/>')
            .replace(/(\n)/g, '<br/>');
    };

    const onEditorChange = (e) => {
        setHtmlContent(e);
    }

    const onEditorClick = (e) => {
        document.getElementById("addTaskModalBody").click();
    }

    useEffect(() => {
        const status_id = '50,60';
        if (showEditTaskModal) {
            clearControl();
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
                        setProjectList(temData);
                    }
                });

            APIService.getAllMembers('')
                .then((response) => {
                    if (response.data?.status) {
                        //setStaffList(response.data?.data);
                        //setStaffListForFilter(response.data?.data);
                        setFollowerList(response.data?.data);
                        setFollowerListForFilter(response.data?.data);
                    }
                });

            setRepeatEveryList(repeatEveryListData);
            setRepeatEveryListForFilter(repeatEveryListData);
            setRepeatEveryCustomeList(repeatEveryCustomListData);
            setRepeatEveryCustomeListForFilter(repeatEveryCustomListData);

            APIService.getTaskStatus(status_id) // Pass the status_id to the API call
            .then((response) => {
              if (response.data?.status) {
                let taskStatusListNew = response.data?.data;
      
                // Filter to only include "Pending Approval" and "Hold"
                // taskStatusListNew = taskStatusListNew.filter(status => 
                //   status.label === "Pending Approval" || status.label === "Rejected"
                // );
      
                setTaskStatusList(taskStatusListNew);
                // let count = 0;
                // if (assignedToMe) {
                //   count = count + 1;
                // }
                // if (recurringTask) {
                //   count = count + 1;
                // }
                // if (myFollowingTasks) {
                //   count = count + 1;
                // }
                // setSelectedCount(taskStatusListNew.filter(arr => arr.isChecked === true).length + count);
                // console.log("Filtered Task Status List:", taskStatusListNew);
              }
            });

            APIService.getTaskById(taskId)
                .then((response) => {
                    if (response.data?.status) {
                        let taskData = response.data?.data;
                        if (taskData?.total_cycles > 0)
                            setPassedCycles(taskData?.total_cycles);
                        if (taskData.duedate !== null)
                            setDueDate(moment(taskData.duedate)._d);
                        setStatus(taskData.task_status_name);
                        setDate(moment(taskData.startdate)._d);
                        setProject(taskData.project_id);
                        setAddedFrom(taskData?.addedfrom);
                        setIsAddedFromContact(taskData?.is_added_from_contact);
                        if (userData.role_code !== databaseRoleCode.clientCode) {
                            APIService.getAllProjectMembers(taskData.project_id)
                                .then((response) => {
                                    if (response.data?.status) {
                                        setStaffList(response.data?.data);
                                        setStaffListForFilter(response.data?.data);
                                    }
                                    else {
                                        setStaffList([]);
                                        setStaffListForFilter([]);
                                    }
                                });
                        }
                        setSelectedAssignedBy(taskData.assigned_members);
                        setSelectedFollower(taskData.assigned_followers);
                        setUploadOnTaskForClient(taskData?.settings?.upload_on_tasks);
                        setAttachmentsFileForEdit(taskData.attachments);
                        if (taskData.custom_recurring === 1) {
                            setIsCustomRepeatEvery(true);
                            setRepeatEvery('custom');
                            setCustomEvery(taskData.recurring_type);
                            setCustomNoOfTimeRepeat(taskData.repeat_every);
                        }
                        else {
                            if (taskData.repeat_every !== '') {
                                setRepeatEvery(`${taskData.repeat_every} ${taskData.recurring_type}`);
                            }
                            else {
                                setRepeatEvery('');
                            }
                            setIsCustomRepeatEvery(false);
                        }
                        setTaskName(taskData.name);
                        if (taskData.cycles === 0) {
                            setInfinity(true);
                            setTotalCycles("");
                        }
                        else {
                            setInfinity(false);
                            setTotalCycles(taskData.cycles);
                        }
                        setHtmlContent(taskData.description);
                        setGeneratedOutline(formatOutlineContent(taskData.generated_outline));
                        setGeneratedArticle(formatArticleContent(taskData.generated_article)); 
                    }
                });

        }
    }, [showEditTaskModal]);

    const handleActionChange = (taskId, actionValue, description) => {
        const params = {
            taskid: taskId, // Ensure this matches the expected parameter name in the backend
            action_value: actionValue,
            status: 1, // Set the status to "0"
            description: description
        };
    
        APIService.updateTask(params)
            .then((response) => {
                if (response.data?.status) {
                    toast.success("Action updated successfully", {
                        position: toast.POSITION.TOP_RIGHT,
                    });
                    setRefreshForNewPage(!refreshForNewPage); // Refresh the task list
                } else {
                    toast.error("Failed to update action", {
                        position: toast.POSITION.TOP_RIGHT,
                    });
                }
            })
            .catch((error) => {
                toast.error("An error occurred", {
                    position: toast.POSITION.TOP_RIGHT,
                });
            });
    };

    const filteredTaskStatusList = taskStatusList.filter(status => {
        if (pageType === 'ArticlePage') {
            return status.label !== "Pending Approval" && status.label !== "Rejected";
        }
        else if (pageType === 'Mytask') {
            return status.label === "Pending Approval" || status.label === "Rejected";
        } 
        return true; // Default case, if needed
    });

    const handleProjectSelect = async (selectedProject) => {
        let project_id = parseInt(selectedProject?.value);
        setProject(project_id);

        setSelectedAssignedBy([]);
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

    const copyTaskLink = () => {
        if (task_type === 1) {
            navigator.clipboard.writeText(`${window.location.origin}/view-site-addons-task/${taskId}`);
        }
        else {
            navigator.clipboard.writeText(`${window.location.origin}/view-task/${taskId}`);
        }
    };

    const onStatusSelect = async (e) => {
        setStatus(e);
    };

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

    const handleRemoveAttachmentsFileFromEdit = (id) => {
        confirmAlert({
            title: 'Confirm',
            message: DELETE_ATTACHMENT,
            buttons: [
                {
                    label: 'Yes',
                    className: 'btn btn-primary btn-lg',
                    onClick: () => {
                        let params = {};
                        params["fileid"] = id;
                        params["id"] = taskId;
                        APIService.removeAttachment(params)
                            .then((response) => {
                                if (response.data?.status) {
                                    let newFileList = attachmentsFileForEdit.filter(function (arr) {
                                        return arr.id !== id;
                                    })
                                    setAttachmentsFileForEdit(newFileList);
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

    const editTask = async () => {
        setProcess(true);
        setFormErrors([]);
        let validate = validateForm((TaskValidator(project, 'not required', 'not required', 'not required', taskName, date, dueDate, selectedAssignedBy.length > 0 ? 'not required' : '', repeatEvery === 'custom' ? customNoOfTimeRepeat === 'Select' ? '' : customNoOfTimeRepeat : 'not required', repeatEvery === 'custom' ? customEvery === 'Select' ? '' : customEvery : 'not required')));
        if (Object.keys(validate).length) {
            setProcess(false);
            setFormErrors(validate);
        }
        else {
            const params = new FormData();
            params.append("project_id", project);
            params.append("taskid", taskId);
            params.append("start_date", format(date, "yyyy-MM-dd"));
            if (dueDate !== null && dueDate !== '')
                params.append("due_date", format(dueDate, "yyyy-MM-dd"));
            let assigned_members_list = selectedAssignedBy.map((obj) => obj.id);
            params.append("assigned_members", assigned_members_list.join());
            params.append("name", taskName);
            params.append("description", htmlContent ? htmlContent : '');
            let every_main = repeatEvery === 'custom' ? `${customNoOfTimeRepeat} ${customEvery}` : repeatEvery;
            params.append("custom_recurring", repeatEvery === 'custom' ? 1 : 0);
            let every_array = every_main.split(" ");
            if (every_array.length > 1) {
                params.append("repeat_every", every_array[0]);
                params.append("recurring_type", every_array[1]);
            }
            params.append("cycles", infinity ? 0 : totalCycles);
            let statusNew = 1;
            let selectedStatus = taskStatusList.filter(function (arr) { return arr.label === status; });
            if (selectedStatus.length > 0) {
                statusNew = selectedStatus[0].id;
            }
            if (statusNew === 1/* The ID corresponding to "Approved" */) {
                params.append("action_value", 1);
            }
            params.append("status", statusNew);
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

            params.append("generated_article", generatedArticle);
            params.append("generated_outline", generatedOutline);

            if (statusNew === 5) { // Assuming 5 is the ID for "Published"
                setShowPublishModal(true);
            } else {
                APIService.updateTask(params)
                    .then((response) => {
                        if (response.data?.status) {
                            setRefreshForNewPage(!refreshForNewPage);
                            toast.success(response.data?.message, {
                                position: toast.POSITION.TOP_RIGHT
                            });
                            setProcess(false);
                            if (task_type === 1)
                                window.history.replaceState(null, '', `${siteAddonURL}${search}`);
                            else if (task_type === 3)
                                window.history.replaceState(null, '', `${favouriteURL}${search}`);
                            else
                                window.history.replaceState(null, '', `${tasksURL}${search}`);
                            setShowEditTaskModal(false);
                            clearControl();
                            cstShowViewTaskModal(taskId);
                        } else {
                            toast.error(response.data?.message, {
                                position: toast.POSITION.TOP_RIGHT
                            });
                            setProcess(false);
                        }
                    })
                    .catch((error) => {
                        toast.error(error, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setProcess(false);
                    });
            }
        }
    }

    const clearControl = async () => {
        setProject('');
        setTaskName('');
        setDate(null);
        setDueDate(null);
        setSelectedAssignedBy([]);
        setStaffListForFilter(staffList);
        setSelectedFollower([]);
        setFollowerListForFilter(followerList);
        setRepeatEvery('');
        setRepeatEveryListForFilter(repeatEveryList);
        setTotalCycles('');
        setInfinity(false);
        setHtmlContent('');
        //selectAttachmentsFile([]);
        setAttachmentsFile1([]);
        setIsCustomRepeatEvery(false);
        setStatus('');
    }

    const handleAttachmentClick = async (file) => {
        window.open(file, '_blank', 'noopener,noreferrer');
    }

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

    return (
        <>
            {status &&
                <Offcanvas show={showEditTaskModal} className="add-task-sidebar" enforceFocus={false} placement="end" keyboard={false} onHide={cstSetCloseEdittaskModal}>
                    <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
                        <div className="d-flex align-items-center">
                            <h3 className="dark-1 mb-0">Edit task</h3>
                        </div>
                        <ul className="ovrlay-header-icons">
                            <li>
                                <OverlayTrigger placement="bottom" overlay={<Tooltip id={`copy-link`}> Copy task link</Tooltip>}>
                                    <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={copyTaskLink}>
                                        <i className="icon-link"></i>
                                    </button>
                                </OverlayTrigger>
                            </li>
                            {check(['tasks.delete'], userData?.role.getPermissions) &&
                                <>
                                    {userData?.role_code !== databaseRoleCode.clientCode || (userData?.role_code === databaseRoleCode.clientCode && addedFrom === userData?.id && isAddedFromContact === 1) ?
                                        <li>
                                            <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> Delete task</Tooltip>}>
                                                <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={() => { deleteTask(taskId) }}>
                                                    <i className="icon-delete text-danger"></i>
                                                </button>
                                            </OverlayTrigger>
                                        </li>
                                    : '' }
                                </>
                            }
                            <li>
                                <OverlayTrigger placement="bottom" overlay={<Tooltip id={`edit-task-link`}> Close task</Tooltip>}>
                                    <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={cstSetCloseEdittaskModal}>
                                        <i className="icon-cancel"></i>
                                    </button>
                                </OverlayTrigger>
                            </li>
                        </ul>

                    </Offcanvas.Header>
                    <Offcanvas.Body className="p-0" id='addTaskModalBody'>
                        <Form onSubmit={async e => { e.preventDefault(); await editTask() }}>
                            <SimpleBar className="offcanvas-inner">
                                <div className="p-6">
                                    <Form.Control as="textarea" rows={1} placeholder="Write a task name" value={taskName} onChange={(e) => { setTaskName(e.target.value) }} className={`visual-text-area task-title placeholder-dark font-weight-medium dark-2 ${formErrors.taskNameInput && 'is-invalid'}`} />
                                    {formErrors.taskNameInput && (
                                        <span className="text-danger">{formErrors.taskNameInput}</span>
                                    )}
                                    <div className="task-content mt-6 row">
                                        <div className="task-content-list d-lg-block align-items-center col-12 col-md-6 col-lg-6 col-xl-3">
                                            <div className="task-label-left mb-lg-3" >
                                                <span className="font-12 dark-1">Project:<span className='validation-required-direct'></span></span>
                                            </div>
                                            <div className="task-label-right">
                                                <Select styles={customStyles} classNamePrefix="react-select" className={`custom-select ${formErrors.projectInput && 'is-react-select-invalid'}`} options={projectList} onChange={handleProjectSelect}
                                                    value={projectList.filter(function (option) {
                                                        return option.value === project;
                                                    })} />
                                            </div>
                                            {formErrors.projectInput && (
                                                <span className="text-danger">{formErrors.projectInput}</span>
                                            )}
                                        </div>
                                        <div className="task-content-list d-lg-block align-items-center col-12 col-md-6 col-lg-6 col-xl-3">
                                            <div className="task-label-left mb-lg-3">
                                                <span className="font-12 dark-1">Status:</span>
                                            </div>
                                            <div className="task-label-right">
                                            <Dropdown className="project-drop-down category-dropdown" onSelect={onStatusSelect}>
    <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="dark-2 font-12 cursor-pointer bordered-dropdown" id="TaskStatus">
        <div className="avatar avatar-sm-status bottom-0 end-0 avatar-info avatar-border me-1 d-inline-block">&nbsp;</div>
        {status !== '' ? status : 'Select Status'}
    </Dropdown.Toggle>
    <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2 w-100">
        <SimpleBar className="dropdown-body">
            {filteredTaskStatusList.map((drp, index) => (
                <Dropdown.Item key={index} as="li" eventKey={drp.label}>{drp.label}</Dropdown.Item>
            ))}            
            {pageType === 'Mytask' && (
                <Dropdown.Item
                    key="approved" // Add a unique key
                    as="li" // Ensure it matches the structure
                    eventKey="Approved" // Use eventKey for consistency
                >
                    Approved
                </Dropdown.Item>
            )}
        </SimpleBar>
    </Dropdown.Menu>
</Dropdown>
                                            </div>
                                        </div>
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
                                                    minDate={ (userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode) ? null : new Date() }
                                                    maxDate={dueDate}
                                                    isClearable
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
                                                    minDate={ (userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode) ? null : date ? date : new Date() }
                                                    isClearable
                                                    className={`form-control ${formErrors.dueDate && 'is-invalid'}`}
                                                />
                                                {formErrors.date && (
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
                                                            <span className='validation-required-direct'></span></span>
                                                    </div>
                                                    <div className="task-label-right">
                                                        <div className="avatar-group">
                                                            {selectedAssignedBy && selectedAssignedBy.map((assignUser, index) => (
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
                                                                    <Dropdown.Toggle as="a" bsPrefix="no-toggle" className="dark-2 font-weight-medium font-12 cursor-pointer" id="assign"><img className="avatar-img" alt='Profile' src={AdddashedIcon} /></Dropdown.Toggle>
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
                                                                            {staffListForFilter && staffListForFilter.map((drp, index) => (
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
                                                            {selectedFollower && selectedFollower.map((assignUser, index) => (
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
                                                                    <Dropdown.Toggle as="a" bsPrefix="no-toggle" className="dark-2 font-weight-medium font-12 cursor-pointer" id="assign"><img alt='Add User' className="avatar-img" src={AdddashedIcon} /></Dropdown.Toggle>
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
                                                                                <Dropdown.Item as="li" key={index} eventKey={drp.id} className={`${selectedFollower && selectedFollower.filter(function (arr) {
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
                                                    <Dropdown className="repeat-every-dropdown category-dropdown" onSelect={onRepeatEverySelect}>
                                                        <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="dark-2 font-12 cursor-pointer bordered-dropdown" id="RepeatEvery"><div className="avatar avatar-sm-status bottom-0 end-0 avatar-info avatar-border me-1 d-inline-block">&nbsp;</div> {repeatEvery !== '' ? capitalizeForRepeatEvery(repeatEvery) : 'Select Repeat Every'}</Dropdown.Toggle>
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
                                                            <Form.Control type='number' placeholder="Enter No. of time" value={customNoOfTimeRepeat} onChange={(e) => { setCustomNoOfTimeRepeat(e.target.value) }} />
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
                                                            <Dropdown className="project-drop-down category-dropdown" onSelect={onCustomEverySelect}>
                                                                <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="dark-2 font-12 cursor-pointer bordered-dropdown" id="CustomEvery"><div className="avatar avatar-sm-status bottom-0 end-0 avatar-info avatar-border me-1 d-inline-block">&nbsp;</div> {capitalizeFirst(customEvery)}</Dropdown.Toggle>
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
                                        </div> */}
                                        {repeatEvery !== '' &&
                                            <div className="task-content mt-6 row">
                                                <div className="task-content-list d-lg-block align-items-center col-12 col-md-6 col-lg-4 col-xxl-3 col-xxxl-2">
                                                    <div className="task-label-left mb-lg-3">
                                                        <span className="font-12 dark-1">Total Cycles: Passed: {passedCycles}</span>
                                                    </div>
                                                    <div className="task-label-right">
                                                        <InputGroup className="inputgroup-default">
                                                            <Form.Control value={totalCycles} onChange={(e) => { setTotalCycles(e.target.value) }} disabled={infinity} type="number" />
                                                            <InputGroup.Text>
                                                                <Form.Check id='chk-infinity' onChange={() => { setInfinity(!infinity); setTotalCycles(''); }} checked={infinity} />Infinity
                                                            </InputGroup.Text>
                                                        </InputGroup>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    </>
                                    {/* } */}
                                    <div className="p-6">
                                    

                                    {pageType === 'ArticlePage' ? (
                                        <div className="article-description mt-6">
                                            <span className="font-12 font-weight-semibold dark-1 d-block mb-3">Article Content</span>
                                            <ReactQuill theme="snow" value={generatedArticle} onChange={setGeneratedArticle} />
                                        </div>
                                    ) : (
                                        <div className="task-description mt-6">
                                            <span className="font-12 font-weight-semibold dark-1 d-block mb-3">Outline Content</span>
                                            <ReactQuill theme="snow" value={generatedOutline} onChange={setGeneratedOutline} />
                                        </div>
                                    )}

                                    
                                </div>

                                    {/* {userData?.role_code !== databaseRoleCode.clientCode || uploadOnTaskForClient === 1 ?
                                        <div className="task-attachment mt-7">
                                            <span className="font-12 font-weight-semibold dark-1 d-block mb-3">Attachments</span>
                                            <FileUploader handleChange={handleDragAndDropChange} multiple={true} name="file" types={attachmentsAllowExtension} maxSize={10} children={<div className="custom-flie-input"><span><i className='icon-attachment me-2'></i> Upload or drop a file right here</span></div>} onTypeError={(e) => { setFormErrors({ fileUploader: `${e} ${attachmentsAllowExtensionMsg}` }); }} onSizeError={(e) => { setFormErrors({ fileUploader: `${e} file size should less than 10MB` }); }} />
                                            {formErrors.fileUploader && (
                                                <span className="text-danger d-block">{formErrors.fileUploader}</span>
                                            )}
                                            <div className="mt-6 row">
                                                {attachmentsFile1 && (
                                                    attachmentsFile1.map((file, index) => (
                                                        <div className="d-lg-block align-items-center col-6 col-sm-4 col-lg-3 col-xl-2" key={index}>
                                                            <AttachmentPreview file={file} handleRemoveAttachmentsFile={handleRemoveAttachmentsFile} handleAttachmentClick={handleAttachmentClick} />
                                                        </div>
                                                    ))
                                                )}
                                                {attachmentsFileForEdit && attachmentsFileForEdit.map((file, index) => (
                                                    <div className="d-lg-block align-items-center col-6 col-sm-4 col-lg-3 col-xl-2" key={index}>
                                                        <AttachmentPreview file={file} handleRemoveAttachmentsFile={handleRemoveAttachmentsFileFromEdit} handleAttachmentClick={handleAttachmentClick} editMode={true} />
                                                    </div>
                                                ))}
                                                {(attachmentsFile1 && attachmentsFile1.length === 0) && attachmentsFileForEdit && (attachmentsFileForEdit.length === 0) &&
                                                    <span>No file selected</span>
                                                }
                                            </div>
                                        </div> : ''
                                    } */}
                                </div>


                            </SimpleBar>
                            <div className="add-comment-area action-bottom-bar-fixed action-bottom-bar-lg px-6 py-3 border-top border-gray-100 text-end">
                            <Button 
                                    disabled={process} 
                                    variant="primary" 
                                    size="md" 
                                    type="submit"
                                    onClick={() => {
                                        if (selectedStatus === "Approved") {
                                            handleActionChange(taskId, 1);
                                        }
                                        // Add any other save logic here
                                    }}
                                >
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
            }
            <Modal
                show={showPublishModal}
                onHide={() => setShowPublishModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Enter URL for Publishing</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="publishUrl">
                            <Form.Label>URL</Form.Label>
                            <Form.Control
                                type="url"
                                placeholder="Enter URL"
                                value={publishUrl}
                                onChange={(e) => setPublishUrl(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPublishModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handlePublish}>
                        Publish
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(EditTaskModal)