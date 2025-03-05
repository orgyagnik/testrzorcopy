import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Accordion, Dropdown, Form, ButtonGroup, Button, Spinner, Offcanvas, Row, Col, Card, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import SearchIcon from '../../assets/img/icons/serach.svg';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ViewTaskModal from './ViewTaskModal';
import EditTaskModal from './EditTaskModal';
import APIService from '../../api/APIService';
import TaskListAccordion from './TaskListAccordion';
import { connect } from "react-redux";
import { filterDropdownOptionByName, filterDropdownOptionByAgencyName, capitalizeFirst } from "../../utils/functions.js";
import { useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import { databaseRoleCode, display_date_format } from '../../settings';
import moment from 'moment';
import { DELETE_TASK } from '../../modules/lang/Task';
import RatingReviewModal from './RatingReviewModal';
import TaskList from './TaskList';
import AddTaskModal from '../../pages/task/AddTaskModal';
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import PlanDetails from "./PlanDetails"
import { setFavoritesTask } from "../../store/reducers/App";
import Store from "../../store";
import Select from 'react-select';
import StaticDataTable from "../../modules/custom/DataTable/StaticDataTable";
import RangeDatePickerControl from '../../modules/custom/RangeDatePickerControl';
import ArticleList from './ArticleList.js';

function Mytask({ userData, name }) {
  //let { id } = useParams();
  let id = undefined;
  const search = useLocation().search;
  const searchProjectId = new URLSearchParams(search).get('pid');
  const searchProjectName = new URLSearchParams(search).get('pname');
  const customerId = new URLSearchParams(search).get('customer_id');
  const staffIdFilter = new URLSearchParams(search).get('staff_id');
  const currentURL = window.location.pathname;
  const siteAddonURL = "/site-addons-tasks";
  const favouriteURL = "/favourite-tasks";
  const tasksURL = "/tasks";
  let task_type = 0;
  if (currentURL.includes("site-addons-task")) {
    task_type = 1;
  }
  else if (currentURL.includes("favourite-task")) {
    task_type = 3;
  }

  if (currentURL.includes("/admin/tasks/view/")) {
    id = currentURL.replace("/admin/tasks/view/", '');
  }
  else if (currentURL.includes("/edit-task/")) {
    id = currentURL.replace("/edit-task/", '');
  }
  else if (currentURL.includes("/edit-site-addons-task/")) {
    id = currentURL.replace("/edit-site-addons-task/", '');
  }
  else if (currentURL.includes("/edit-favourite-task/")) {
    id = currentURL.replace("/edit-favourite-task/", '');
  }
  else if (currentURL.includes("/view-task/")) {
    id = currentURL.replace("/view-task/", '');
  }
  else if (currentURL.includes("/view-site-addons-task/")) {
    id = currentURL.replace("/view-site-addons-task/", '');
  }
  else if (currentURL.includes("/view-favourite-task/")) {
    id = currentURL.replace("/view-favourite-task/", '');
  }

  /*if (currentURL === siteAddonURL || currentURL === tasksURL || currentURL === favouriteURL) {
    id = undefined;
  }*/
  //const history = useHistory();
  const [showViewTaskModal, setShowViewTaskModal] = useState(false);
  const [refreshButtonProcess, setRefreshButtonProcess] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskStatusList, setTaskStatusList] = useState([]);
  const [taskSummary, setTaskSummary] = useState([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [calendarToggle, setCalendarToggle] = useState(3);
  //const [refrashLoad, setRefrashLoad] = useState(false);
  const [assignedToMe, setAssignedToMe] = useState(databaseRoleCode.employeeCode === userData?.role_code ? true : false);
  const [myFollowingTasks, setMyFollowingTasks] = useState(false);
  const [recurringTask, setRecurringTask] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [calendarTaskList, setCalendarTaskList] = useState([]);
  const [calendarStartEndDate, setCalendarStartEndDate] = useState({ start: moment().startOf('month').format("YYYY-MM-DD"), end: moment().endOf('month').format("YYYY-MM-DD") });
  const [project, setProject] = useState(parseInt(searchProjectId) > 0 ? { id: searchProjectId, name: searchProjectName } : '');
  const [projectList, setProjectList] = useState([]);
  const [projectListForFilter, setProjectListForFilter] = useState([]);
  const [agency, setAgency] = useState('');
  const [agencyList, setAgencyList] = useState([]);
  const [agencyList1, setAgencyList1] = useState([]);
  const [agencyListForFilter, setAgencyListForFilter] = useState([]);
  //const [showPriorityButton, setShowPriorityButton] = useState(userData?.role_code === databaseRoleCode.agencyCode || userData?.role_code === databaseRoleCode.agencyMemberCode ? true : false);
  const [showPriorityButton, setShowPriorityButton] = useState(false);
  const [taskId, setTaskId] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [projectReload, setProjectReload] = useState(false);
  const [reloadTaskStatusList, setReloadTaskStatusList] = useState(false);
  const [refreshForNewPage, setRefreshForNewPage] = useState(false);
  const [refreshForList, setRefreshForList] = useState(false);
  const [taskStroke, setTaskStroke] = useState([]);
  const [taskStrokeRefresh, setTaskStrokeRefresh] = useState(false);
    const [searchFilter, setSearchFilter] = useState('');

  const [projectSearch, setProjectSearch] = useState('');
  const [agencySearch, setAgencySearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [staffListForFilter, setStaffListForFilter] = useState([]);
  const [staffId, setStaffId] = useState([]);
  const [agencySiteList, setAgencySiteList] = useState([]);

  const [showAddtaskModal, setShowAddtaskModal] = useState(false);
  const cstShowAddtaskModal = () => setShowAddtaskModal(true);
  const [showViewSiteList, setShowViewSiteList] = useState(false);
  const cstShowViewSiteList = () => setShowViewSiteList(true);
  const cstHideViewSiteList = () => setShowViewSiteList(false);

  //Rating And Review
  const [ratingModalShow, setShowRatingModal] = useState(false);
  const [taskIdForRating, SetTaskIdForRating] = useState(0);

  const [customerList, setCustomerList] = useState([]);
  const [customer, setCustomer] = useState('');
  const [filterCustomerId, setFilterCustomerId] = useState(0);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerListForFilter, setCustomerListForFilter] = useState([]);
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [lastOpenedTaskId, setLastOpenedTaskId] = useState(null);

  const location = useLocation();
  const [projectId, setProjectId] = useState(null);

    // useEffect(() => {
    //     const queryParams = new URLSearchParams(location.search);
    //     const projectIdFromUrl = queryParams.get('projectId');
    //     setProjectId(projectIdFromUrl);

    //     if (projectIdFromUrl) {
    //         // Fetch project details using the project ID
    //         APIService.getProjectDetails(projectIdFromUrl)
    //             .then(response => {
    //                 if (response.data?.status) {
    //                     const projectData = response.data?.data;
    //                     const agencyId = projectData.agency_id;
    //                     const agencyName = projectData.agency_name;
    //                     setAgency({ id: agencyId, name: agencyName });
    //                 }
    //             })
    //             .catch(error => {
    //                 console.error("Error fetching project details:", error);
    //             });
    //     }
    // }, [location.search]);

  const showRatingModal = (tid) => {
    setShowRatingModal(true);
    SetTaskIdForRating(tid);
  }

  const cstShowViewTaskModal = (id) => {
    setTaskId(id);
  
    // Taskid store in local storage
    localStorage.setItem(`lastOpenedTask_${userData.role_code}_${userData.id}`, id.toString());
  
    setShowViewTaskModal(true);
  
    // Add blur effect to inner-content
    const innerContent = document.querySelector('.inner-content');
    if (innerContent) {
      innerContent.classList.add('blur-effect');
    }
  
    if (task_type === 1) {
      window.history.replaceState(null, '', `/view-site-addons-task/${id}`);
    } else if (task_type === 3) {
      window.history.replaceState(null, '', `/view-favourite-task/${id}`);
    } else {
      window.history.replaceState(null, '', `/view-task/${id}`);
    }
  };

  // Function to remove blur effect when modal is closed
  const handleCloseModal = () => {
    setShowViewTaskModal(false);

    const innerContent = document.querySelector('.inner-content');
    if (innerContent) {
      innerContent.classList.remove('blur-effect');
    }
  };

  const cstShowEditTaskModal = (id) => {
    setTaskId(id);
    setShowEditTaskModal(true);
    if (task_type === 1) {
      window.history.replaceState(null, '', `/edit-site-addons-task/${id}`);
    }
    else if (task_type === 3) {
      window.history.replaceState(null, '', `/edit-favourite-task/${id}`);
    }
    else {
      window.history.replaceState(null, '', `/edit-task/${id}`);
    }
  }

  const deleteTask = (id, keyword, projectId) => {
    confirmAlert({
      title: 'Confirm',
      message: DELETE_TASK,
      buttons: [
        {
          label: 'Yes',
          className: 'btn btn-primary btn-lg',
          onClick: async () => {
            let params = {};
            params["taskid"] = id;
            try {
              const response = await APIService.deleteTask(params);
              if (response.data?.status) {
                // Update the project to remove the keyword
                await updateProjectKeywords(keyword, projectId);
  
                // Existing code to handle task deletion
                let newTaskStroke = taskStroke;
                newTaskStroke.push({ id: id, status: 0 });
                setTaskStroke(newTaskStroke);
                setRefreshForNewPage(!refreshForNewPage);
                setShowEditTaskModal(false);
                setShowViewTaskModal(false);
                if (task_type === 1)
                  window.history.replaceState(null, '', `${siteAddonURL}${search}`);
                else if (task_type === 3)
                  window.history.replaceState(null, '', `${favouriteURL}${search}`);
                else
                  window.history.replaceState(null, '', `${tasksURL}${search}`);
                toast.success(response.data?.message, {
                  position: toast.POSITION.TOP_RIGHT
                });
                APIService.getFavavoriteTasks()
                  .then((response) => {
                    if (response.data?.status) {
                      Store.dispatch(setFavoritesTask(response.data?.data));
                    }
                  });
              } else {
                toast.error(response.data?.message, {
                  position: toast.POSITION.TOP_RIGHT
                });
              }
            } catch (error) {
              toast.error("An error occurred while deleting the task", {
                position: toast.POSITION.TOP_RIGHT
              });
            }
          }
        },
        {
          label: 'No',
          className: 'btn btn-outline-secondary btn-lg',
          onClick: () => {}
        }
      ]
    });
  };
  
  const updateProjectKeywords = async (keywordToRemove, projectId) => {
    try {
      // Fetch existing project data
      const projectResponse = await APIService.getProjectForEdit(projectId);
      if (!projectResponse.data?.status) {
        throw new Error(
          projectResponse.data?.message || "Failed to fetch project details"
        );
      }
  
      const projectData = projectResponse.data?.data;
      let existingKeywords = [];
  
      // Check if targeted_keywords is defined and is a string
      if (typeof projectData.targeted_keywords === 'string') {
        existingKeywords = projectData.targeted_keywords
          .split(",")
          .map((k) => k.trim());
      }
  
      // Remove the keyword
      const updatedKeywords = existingKeywords.filter(
        (keyword) => keyword !== keywordToRemove
      );
  
      // Prepare update parameters
      const params = new FormData();
      params.append("projectid", projectId);
      params.append("name", projectData.name);
      params.append("clientid", projectData.clientid);
      params.append("settings", JSON.stringify(projectData.settings));
  
      const assigned_members_list = projectData.assign_members.map(member => member.id);
      params.append("assigned_members", assigned_members_list.join());
      params.append("description", projectData.description || "");
      params.append("website_url", projectData.website_url);
      if (projectData.language) {
        params.append("language", projectData.language);
      }
      if (projectData.location) {
        params.append("location", projectData.location);
      }
      params.append("targeted_audience", projectData.targeted_audience);
      params.append("competitors_websites", projectData.competitors_websites);
      params.append("targeted_keywords", updatedKeywords.join(","));
      params.append("topic_titles", projectData.topic_titles);
  
      if (projectData.start_date) params.append("start_date", projectData.start_date);
      if (projectData.deadline) params.append("due_date", projectData.deadline);
  
      console.log("Update Project Params:", Object.fromEntries(params));
  
      // Update the project
      const updateResponse = await APIService.updateProject(params);
      console.log("Update Project Response:", updateResponse);
  
      if (!updateResponse.data?.status) {
        throw new Error(
          updateResponse.data?.message || "Failed to update project"
        );
      }
      toast.success("Project updated successfully", {
        position: toast.POSITION.TOP_RIGHT
      });
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project", {
        position: toast.POSITION.TOP_RIGHT
      });
    }
  };

  const updateTaskStatus = (id, status) => {
    let params = {};
    params["taskid"] = id;
    params["status"] = status;
    APIService.updateTaskStatus(params)
      .then((response) => {
        if (response.data?.status) {
          //setRefresh(!refresh);
          setRefreshForNewPage(!refreshForNewPage);
          if (calendarToggle === 1) {
            let newTaskStroke = taskStroke;
            newTaskStroke.push({ id: id, status: status });
            setTaskStroke(newTaskStroke);
            setTaskStrokeRefresh(!taskStrokeRefresh);
          }
          else {
            setTaskStroke([]);
          }
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

  useEffect(() => {
  }, [taskStrokeRefresh]);

  const handlecalendarToggle = (id) => {
    setCalendarToggle(id);
  }

  const handleTaskListCheckChange = (e) => {
    let selectedChk = e.target;
    let taskStatusListNew = taskStatusList;
    if (selectedChk.value === "All Tasks") {
      taskStatusListNew.forEach(list => {
        list.isChecked = selectedChk.checked;
      });
    }
    else {
      taskStatusListNew.forEach(list => {
        if (list.label === selectedChk.value)
          list.isChecked = selectedChk.checked;
      });
    }
    setTaskStatusList(taskStatusListNew);
    let count = 0;
    if (assignedToMe) {
      count = count + 1;
    }
    if (recurringTask) {
      count = count + 1;
    }
    if (myFollowingTasks) {
      count = count + 1;
    }
    setSelectedCount(taskStatusListNew.filter(function (arr) { return arr.isChecked === true; }).length + count);
    setRefreshForList(!refreshForList);
  }

  const handleAssignedToMeSelect = (e) => {
    setAssignedToMe(e.target.checked);

    let count = 0;
    if (e.target.checked) {
      count = count + 1;
    }
    if (recurringTask) {
      count = count + 1;
    }
    if (myFollowingTasks) {
      count = count + 1;
    }
    setSelectedCount(taskStatusList.filter(function (arr) { return arr.isChecked === true; }).length + count);
  }

  const handleMyFollowingTasksSelect = (e) => {
    setMyFollowingTasks(e.target.checked);
    let count = 0;
    if (assignedToMe) {
      count = count + 1;
    }
    if (recurringTask) {
      count = count + 1;
    }
    if (e.target.checked) {
      count = count + 1;
    }
    setSelectedCount(taskStatusList.filter(function (arr) { return arr.isChecked === true; }).length + count);
  }

  const handleRecurringTask = (e) => {
    setRecurringTask(e.target.checked);
    let count = 0;
    if (assignedToMe) {
      count = count + 1;
    }
    if (e.target.checked) {
      count = count + 1;
    }
    if (myFollowingTasks) {
      count = count + 1;
    }
    setSelectedCount(taskStatusList.filter(function (arr) { return arr.isChecked === true; }).length + count);
  }

  /*const handlePriorityButtonClick = (e) => {
    if (task_type === 1) {
      history.push(`/set-site-addons-task-priority/${agency.id}`);
    }
    else {
      history.push(`/set-task-priority/${agency.id}`);
    }
  }*/

  const handleClearFilter = (e) => {
    setReloadTaskStatusList(!reloadTaskStatusList);
    setTimeout(() => {
      setAssignedToMe(databaseRoleCode.employeeCode === userData?.role_code ? true : false);
      setMyFollowingTasks(false);
      setRecurringTask(false);
      setProject('');
      setAgency('');
      setStaffId([]);
      setShowPriorityButton(false);
      setProjectReload(!projectReload);
      setSelectedCount(5);
      setCustomer('');
      setFilterCustomerId(0);
      setFilterStartDate('');
      setFilterEndDate('');
    }, 1000);
  }

  const handleCopyFilter = (e) => {
    let staff_id_list = staffId.map((obj) => obj.id);
    let staffIds = staff_id_list.join(",");
    let filterLink = window.location.href;
    if (staffId.length > 0) {
      if (task_type === 1) {
        filterLink = `${window.location.origin}/site-addons-tasks?staff_id=${staffIds}`;
      }
      else {
        filterLink = `${window.location.origin}/tasks?staff_id=${staffIds}`;
      }
    }
    navigator.clipboard.writeText(filterLink);
  }

  const handleProjectSearch = (value) => {
    setProjectSearch(value);
    filterDropdownOptionByName(projectList, value, setProjectListForFilter);
  }

  const handleStaffSearch = (value) => {
    setStaffSearch(value);
    filterDropdownOptionByName(staffList, value, setStaffListForFilter);
  }

  const handleProjectRadioChange = (e) => {
    const selectedProjectId = parseInt(e.target.value);
    if (selectedProjectId) {
        const selectedProject = projectList.find(proj => proj.id === selectedProjectId);
        if (selectedProject) {
            setProject({ id: selectedProject.id, name: selectedProject.name });
        }
    } else {
        setProject({ id: '', name: '' });
    }
};

  const handleStaffListChange = (e) => {
    handleStaffSearch('');
    let staff_id = parseInt(e.target.value);
    if (e.target.checked) {
      let newStaffId = staffList.filter(function (arr) { return arr.id === staff_id; });
      setStaffId([newStaffId[0], ...staffId]);
    }
    else {
      let newStaffId = staffId.filter(function (arr) { return arr.id !== staff_id; });
      setStaffId(newStaffId);
    }
  }

  const handleAgencySearch = (value) => {
    setAgencySearch(value);
    filterDropdownOptionByAgencyName(agencyList, value, setAgencyListForFilter);
  }

  const handleAgencyRadioChange = (e) => {
    handleAgencySearch('');
    let agency_id = parseInt(e.target.value);
    if (agency_id > 0) {
      let agency_name = '';
      let selectedAgency = agencyList.filter(function (arr) { return arr.staffid === agency_id; });
      if (selectedAgency.length > 0) {
        agency_name = selectedAgency[0].agency_name;
      }
      setAgency({ id: agency_id, name: agency_name });
      if (userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.pcCode || userData?.role_code === databaseRoleCode.accountantCode || userData?.role_code === databaseRoleCode.agencyCode || userData?.role_code === databaseRoleCode.agencyMemberCode)
        setShowPriorityButton(true);
      else
        setShowPriorityButton(false);
    }
    else {
      setAgency('');
      setShowPriorityButton(false);
    }
    setProjectReload(!projectReload);
  }

  const handleCalendarTaskClick = (e) => {
    cstShowViewTaskModal(e.event.id);
  }


  useEffect(() => {
    APIService.getAllAgency()
        .then((response) => {
            if (response.data?.status) {
                setAgencyList(response.data?.data);
                let newAgencyList = response.data?.data.map(item => {
                    return { label: item.agency_name, value: item.staffid }
                });
                setAgencyList1([{ label: 'All Agency', value: '' }, ...newAgencyList]);
                setAgencyListForFilter(response.data?.data);
            }
        });
}, []);

useEffect(() => {

    APIService.getAllMembers('')
      .then((response) => {
        if (response.data?.status) {
          setStaffList(response.data?.data);
          let staffData = response.data?.data;
          setStaffListForFilter(staffData);
          if (staffIdFilter !== null) {
            let selectedIds = staffIdFilter.split(',');
            let newselectedIds = selectedIds.map(item => {
              let selectedStaff = staffData.filter(function (arr) { return `${arr.id}` === `${item}`; });
              return selectedStaff[0];
            });
            setStaffId(newselectedIds);
          }
        }
        else {
          setStaffList([]);
          setStaffListForFilter([]);
        }
      });

  }, []);

  useEffect(() => {
    const status_id = "pending,rejected"; // Send as query parameter
    let params = "?";
    params = params + "status=" + status_id;
    
    APIService.getArticleList(params)
      .then((response) => {
        if (response.data?.status) {
          let taskStatusListNew = response.data?.data;
          console.log("Task Status List New:", taskStatusListNew);
          // Filter to only include "Pending Approval" and "Rejected"
         
  
          setTaskStatusList(taskStatusListNew);
          let count = 0;
          if (assignedToMe) count += 1;
          if (recurringTask) count += 1;
          if (myFollowingTasks) count += 1;
  
          setSelectedCount(
            taskStatusListNew.filter((arr) => arr.isChecked === true).length +
              count
          );
          console.log("Filtered Task Status List:", taskStatusListNew);
        }
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
      });
  }, [reloadTaskStatusList]);
  

useEffect(() => {
  const queryParams = new URLSearchParams(location.search);
  const projectIdFromUrl = queryParams.get('projectId');

  APIService.getAllProjects()
      .then((response) => {
          if (response.data?.status) {
              const projectData = response.data?.data;
              setProjectList(projectData);
              setProjectListForFilter(projectData);

              // If a projectId is present in the URL, set the project state
              if (projectIdFromUrl) {
                  const selectedProject = projectData.find(proj => proj.id === parseInt(projectIdFromUrl));
                  if (selectedProject) {
                      setProject({ id: selectedProject.id, name: selectedProject.name });
                  }
              }
          }
      });
}, [location.search]);

  useEffect(() => {
    if(currentURL === tasksURL || currentURL === siteAddonURL || currentURL === favouriteURL){
      setShowViewTaskModal(false);
      const innerContent = document.querySelector('.inner-content');
      if (innerContent) {
        innerContent.classList.remove('blur-effect');
      }
      setShowEditTaskModal(false);
      // setRefreshForList(!refreshForList);
      const storedTaskId = localStorage.getItem(`lastOpenedTask_${userData.role_code}_${userData.id}`);
      setLastOpenedTaskId(parseInt(storedTaskId));

    }
    if (id !== undefined && `${id}` !== `${taskId}`) {
      setShowViewTaskModal(false);
      setShowEditTaskModal(false);
      if (currentURL === `/admin/tasks/view/${id}`) {
        setTaskId(id);
        setShowViewTaskModal(true);
      }
      else {
        if (currentURL === `/edit-task/${id}` || currentURL === `/edit-site-addons-task/${id}` || currentURL === `/edit-favourite-task/${id}`) {
          setTaskId(id);
          setShowEditTaskModal(true);
        }
        if (currentURL === `/view-task/${id}` || currentURL === `/view-site-addons-task/${id}` || currentURL === `/view-favourite-task/${id}`) {
          setTaskId(id);
          setShowViewTaskModal(true);
        }
      }
    }
  }, [id, currentURL]);

  useEffect(() => {
  }, [refreshForList]);

  useEffect(() => {
    if (agency !== '' && task_type === 1) {
      let params = "?search_by_agency=" + agency.id;
      APIService.getAgencySitesListForAll(params)
        .then((response) => {
          if (response.data?.status) {
            setAgencySiteList(response.data?.data);
          }
        });
    }
  }, [agency]);

  useEffect(() => {
    let assigned_id = assignedToMe === true ? userData?.id : 0;
    let my_following_tasks = myFollowingTasks === true ? userData?.id : 0;
    let task_type_new = userData?.role_code === databaseRoleCode.clientCode ? '0,1' : task_type;
    let params = "?assigned_to_me=" + assigned_id + "&task_type=" + task_type_new + "&my_following_tasks=" + my_following_tasks;
    if (recurringTask) {
      params = params + "&recurring=1";
    }
    if (project !== '') {
      params = params + "&search_by_project=" + project.id;
    }
    if (agency !== '') {
      params = params + "&search_by_agency=" + agency.id;
    }
    if (staffId.length > 0) {
      let staff_id_list = staffId.map((obj) => obj.id);
      params = params + "&staffid=" + staff_id_list.join(",");
    }
    // params = params + `&customer_id=${customerId ? customerId : 0}`;
    params = params + `&customer_id=${filterCustomerId > 0 ? filterCustomerId : customerId ? customerId : 0}`;

    if (calendarToggle === 1) {
      APIService.getTaskListByStatus(params)
        .then((response) => {
          if (response.data?.status) {
            setTaskList(response.data?.data);
          }
          setRefreshButtonProcess(false);
        });
    }
  }, [project, agency, assignedToMe, staffId, myFollowingTasks, recurringTask, refresh, calendarToggle, filterCustomerId]);

  useEffect(() => {
    
    let assigned_id = assignedToMe === true ? userData?.id : 0;
    let my_following_tasks = myFollowingTasks === true ? userData?.id : 0;
    let task_type_new = userData?.role_code === databaseRoleCode.clientCode ? '0,1' : task_type;
    
    let params = "?assigned_to_me=" + assigned_id + "&task_type=" + task_type_new + "&my_following_tasks=" + my_following_tasks;
    if (recurringTask) {
      params = params + "&recurring=1";
    }
    if (project !== '') {
      params = params + "&search_by_project=" + project.id;
    }
    if (agency !== '') {
      params = params + "&search_by_agency=" + agency.id;
    }
    if (staffId.length > 0) {
      let staff_id_list = staffId.map((obj) => obj.id);
      params = params + "&staffid=" + staff_id_list.join(",");
    }
    // params = params + `&customer_id=${customerId ? customerId : 0}`;
    params = params + `&customer_id=${filterCustomerId > 0 ? filterCustomerId : customerId ? customerId : 0}`;
    
    //for calendar
    if (calendarToggle === 2) {
      params = params + `&startdate=${calendarStartEndDate.start}`;
      params = params + `&enddate=${calendarStartEndDate.end}`;
      
      APIService.getTaskListForCalendar(params)
        .then((response) => {
          if (response.data?.status) {
            setCalendarTaskList(response.data?.data);
          }
          setRefreshButtonProcess(false);
        });
    }
  }, [project, agency, assignedToMe, myFollowingTasks, staffId, recurringTask, refresh, calendarStartEndDate, filterCustomerId]);

  const handleRefreshPage = () => {
    setRefresh(!refresh);
    setRefreshForNewPage(!refreshForNewPage);
    setRefreshButtonProcess(true);
  }
  useEffect(() => {
    // Call handleRefreshPage when 'pending-approval' or 'rejected' values change
    handleRefreshPage();
  }, [taskSummary['pending'], taskSummary['rejected']]);

  useEffect(() => {
    let task_type_new = userData?.role_code === databaseRoleCode.clientCode ? '0,1' : task_type;
    let params = "?task_type=" + task_type_new;
    const assigned_id =  userData?.id;
    params = params + "&assigned_to_me=" + assigned_id;
    APIService.getTaskSummary(params)
      .then((response) => {
        if (response.data?.status) {
          setTaskSummary(response.data?.data);
          console.log('taskSummary',response.data?.data);
        }
      });
  }, [refresh, refreshForNewPage]);

// Calculate total tasks
const totalTasks = 
    (taskSummary['awaiting-feedback'] || 0) +
    (taskSummary['published'] || 0) +
    (taskSummary['rejected'] || 0) + // Change 'hold' to 'rejected'
    (taskSummary['in-progress'] || 0) +
    (taskSummary['not-started'] || 0) +
    (taskSummary['pending'] || 0) +
    (taskSummary['internal-review'] || 0);

  // Calculate total tasks assigned to me
  const totalAssignedTasks = 
    (taskSummary['awaiting-feedback-assign-me'] || 0) +
    (taskSummary['published-assign-me'] || 0) +
    (taskSummary['rejected-assign-me'] || 0) +
    (taskSummary['in-progress-assign-me'] || 0) +
    (taskSummary['not-started-results-assign-me'] || 0) +
    (taskSummary['pending-approval-assign-me'] || 0) +
    (taskSummary['internal-review-assign-me'] || 0);

  const [filtershow, filtersetShow] = useState(false);

  const filterhandleClose = () => filtersetShow(false);
  const filterhandleShow = () => filtersetShow(true);

  const customStyles = {
    option: (styles, state) => ({
      ...styles,
      cursor: 'pointer',
    }),
    control: (styles, state) => ({
      ...styles,
      cursor: 'pointer',
      boxShadow: "none",
      border: state.isFocused && "none"
    }),
  };

  const handleAgencySelect = (selectedAgency) => {
    let agency_id = parseInt(selectedAgency?.value);
    if (agency_id > 0) {
      let agency_name = '';
      let selectedAgency = agencyList.filter(function (arr) { return arr.staffid === agency_id; });
      if (selectedAgency.length > 0) {
        agency_name = selectedAgency[0].agency_name;
      }
      setAgency({ id: agency_id, name: agency_name });
      if (userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.pcCode || userData?.role_code === databaseRoleCode.agencyCode || userData?.role_code === databaseRoleCode.agencyMemberCode)
        setShowPriorityButton(true);
      else
        setShowPriorityButton(false);
    }
    else {
      setAgency('');
      setShowPriorityButton(false);
    }
    //setProjectReload(!projectReload);
  };

  let siteColumns = [
    {
      name: 'Site',
      id: 'site',
      sortable: true,
      filterable: true,
      selector: (row) => row?.site,
      cell: (row) => <>
        {row?.site !== '' ?
          <a href={row.site} target="_blank" rel="noreferrer">{row.site}</a>
          :
          <span>{row?.site}</span>
        }
      </>,
    },
    {
      name: 'Plan',
      id: 'plan',
      sortable: true,
      filterable: true,
      selector: (row) => row?.plan,
    },
    {
      name: 'Type',
      id: 'billingperiod',
      sortable: true,
      filterable: true,
      selector: (row) => row?.billingperiod,
    },
    {
      name: 'Date',
      id: 'date_created',
      sortable: true,
      filterable: true,
      selector: (row) => row?.date_created && moment(new Date(row?.date_created)).format(display_date_format),
    },
  ];

  

  const handleCustomerSelect = (selectedCustomer) => {
    let customer_id = parseInt(selectedCustomer?.value);
    
    if (customer_id > 0) {
      let customer_name = '';
      
      let selectedCustomer = customerList.filter(function (arr) { return arr.value === customer_id; });      
      if (selectedCustomer.length > 0) {
        
        customer_name = selectedCustomer[0].label;
      }
      setCustomer({ id: customer_id, name: customer_name });   
      setFilterCustomerId(customer_id);   
      setRefreshForNewPage(!refreshForNewPage);
     
    }
    else {
      setCustomer('');
      setFilterCustomerId(0);
    }
    // setProjectReload(!projectReload);
  };

  const handleCustomerSearch = (value) => {
    setCustomerSearch(value);
    filterDropdownOptionByAgencyName(customerList, value, setCustomerListForFilter);
  }

  const handleCustomerRadioChange = (e) => {
    setCustomerSearch('');
    let customer_id = parseInt(e.target.value);
    
    if (customer_id > 0) {
      let customer_name = '';
      let selectedAgency = customerList.filter(function (arr) { return arr.value === customer_id; });
      
      if (selectedAgency.length > 0) {
        customer_name = selectedAgency[0].label;
      }
      setCustomer({ id: customer_id, name: customer_name });
      setFilterCustomerId(customer_id);   
 
    }
    else {
      setCustomer('');
      setFilterCustomerId(0);
    }
    // setProjectReload(!projectReload);
  }

  const onChangeDateRange = dates => {
      const [start, end] = dates;
      setFilterStartDate(start);
      setFilterEndDate(end);
  }

  const handleDateClick = (e) => {
    e.stopPropagation();
  };

  const topicsApprovedCount = 
    (taskSummary['not-started'] || 0) +
    (taskSummary['awaiting-feedback'] || 0) +
    (taskSummary['testing'] || 0) +
    (taskSummary['in-progress'] || 0) +
    (taskSummary['published'] || 0);

  // First, let's calculate the assigned topics count
  const topicsApprovedAssignedToMe = 
    (taskSummary['not-started-results-assign-me'] || 0) +
    (taskSummary['awaiting-feedback-assign-me'] || 0) +
    (taskSummary['testing-assign-me'] || 0) +
    (taskSummary['in-progress-assign-me'] || 0) +
    (taskSummary['published-assign-me'] || 0);  
  
  return (
    <>
      <Sidebar />
      <ViewTaskModal fromMytask={true} showApproveOption={true} showViewTaskModal={showViewTaskModal} setShowViewTaskModal={setShowViewTaskModal} taskId={taskId} setRefreshForNewPage={setRefreshForNewPage} refreshForNewPage={refreshForNewPage} task_type={task_type} siteAddonURL={siteAddonURL} tasksURL={tasksURL} favouriteURL={favouriteURL} search={search} cstShowEditTaskModal={cstShowEditTaskModal} deleteTask={deleteTask} showRatingModal={showRatingModal} setTaskId={setTaskId} isArticleView={false} showArticle={false}  />
      <EditTaskModal pageType="Mytask" showEditTaskModal={showEditTaskModal} setShowEditTaskModal={setShowEditTaskModal} taskId={taskId} setRefreshForNewPage={setRefreshForNewPage} refreshForNewPage={refreshForNewPage} task_type={task_type} siteAddonURL={siteAddonURL} tasksURL={tasksURL} favouriteURL={favouriteURL} search={search} deleteTask={deleteTask} cstShowViewTaskModal={cstShowViewTaskModal} setTaskId={setTaskId} />
      <AddTaskModal showAddtaskModal={showAddtaskModal} setShowAddtaskModal={setShowAddtaskModal} setRefreshForNewPage={setRefreshForNewPage} refreshForNewPage={refreshForNewPage} task_type={task_type} siteAddonURL={siteAddonURL} tasksURL={tasksURL} cstShowViewTaskModal={cstShowViewTaskModal} />
      <div className="main-content">
        <Header pagename={name} headerFilterButton={<Button onClick={filterhandleShow} variant="outline-secondary" size="md" type="button" className='ms-auto d-xl-none d-block'>Filter <i className="icon-filter ms-2"></i></Button>}/>
        {/* {(userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode) || (userData?.current_plan.includes(task_type === 0 ? 'dev' : 'addons')) || (userData?.current_plan.includes(task_type === 0 ? 'bucket' : 'addons')) || (task_type === 3) ? */}
        <div className="custom-div">
            <div className={`${task_type !== 3 ? 'mb-7' : ''} d-flex mb-xl-4`}>
              {task_type !== 3 &&
                <>
                  <ButtonGroup size="md" className='me-2'>
                    <input className="btn-check" name="radio" type="radio" autoComplete="off" id="radio-2" value="3" onChange={() => { handlecalendarToggle(3) }} checked={calendarToggle === 3 ? true : false} />
                    <OverlayTrigger placement='bottom' overlay={<Tooltip>List</Tooltip>}>
                      <label tabIndex="0" htmlFor="radio-2" className="btn btn-white"><i className="fa-solid fa-bars-staggered"></i></label>
                    </OverlayTrigger>
                    <input className="btn-check" name="radio" type="radio" autoComplete="off" id="radio-1" value="2" onChange={() => { handlecalendarToggle(2) }} checked={calendarToggle === 2 ? true : false} />
                    <OverlayTrigger placement='bottom' overlay={<Tooltip>Calendar</Tooltip>}>
                      <label tabIndex="0" htmlFor="radio-1" className="btn btn-white"><i className="icon-calendar"></i></label>
                    </OverlayTrigger>
                    <input className="btn-check" name="radio" type="radio" autoComplete="off" id="radio-0" value="1" onChange={() => { handlecalendarToggle(1) }} checked={calendarToggle === 1 ? true : false} />
                    <OverlayTrigger placement='bottom' overlay={<Tooltip>By Status</Tooltip>}>
                      <label tabIndex="0" htmlFor="radio-0" className="btn btn-white"><i className="fa-solid fa-bars"></i></label>
                    </OverlayTrigger>
                  </ButtonGroup>
                  <ButtonGroup size="md">
                    <Button variant="white" onClick={handleRefreshPage}>
                      {
                        !refreshButtonProcess && <><i className="icon-rotate-right"></i></>
                      }
                      {
                        refreshButtonProcess && <><Spinner size="sm" animation="border" variant="primary" className="me-1" /></>
                      }
                    </Button>

                    {/* <Link to={"/kanban-tasks"} variant="primary" type="button" className='btn btn-white'><span className="d-sm-inline d-none">Switch to kan ban</span></Link> */}
                  </ButtonGroup>

                  {(userData.role_code !== databaseRoleCode.agencyMemberCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.clientCode) || userData?.current_plan.includes(task_type === 0 ? 'dev' : 'addons') || userData?.current_plan.includes(task_type === 0 ? 'bucket' : 'addons') || (userData.role_code === databaseRoleCode.clientCode && userData?.current_plan !== "none" && userData?.current_plan !== '') ?
                    <PermissionCheck permissions={['tasks.create']}>
                      <Button variant="primary" type="button" className='btn btn-priamry btn-md ms-3' onClick={cstShowAddtaskModal}><i className="icon-add"></i><span className="ms-2 d-sm-inline d-none">New Task</span></Button>
                    </PermissionCheck>
                    : ''
                  }

                  {userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyMemberCode && agency !== '' && task_type === 1 &&
                    <Button variant="primary" type="button" className='btn btn-priamry btn-md ms-4' onClick={cstShowViewSiteList}>View Site List</Button>
                  }


                  {/* {calendarToggle === 1 &&
                    <Badge className='ms-5 status-badge font-12 d-lg-flex d-none' bg="success" pill>Completed Task :&nbsp;<b> {taskList['all-status-count'] !== undefined ? taskList['all-status-count']['complete'] : 0}</b></Badge>} */}
                </>
              }
              

              {/* Filter For Mobile Start*/}
              <Offcanvas show={filtershow} onHide={filterhandleClose} placement="bottom" className="task-filter-overlay border-top-0">
                <Offcanvas.Header closeButton className="border-gray-100 border-bottom">
                  <Offcanvas.Title>Filter</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="pt-10 pb-35">
                  <Accordion defaultActiveKey="0" className="dashboard-accordion" alwaysOpen>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>Show Task: {`${selectedCount} Selected`}</Accordion.Header>
                      <Accordion.Body className="pt-4">
                        <Dropdown className="category-dropdown project-status" show>
                          <Dropdown.Menu as="ul" align="down" className="p-2 w-100 position-relative shadow-none border-gray-100 border">
                            {taskStatusList.map((taskList, index) => (
                              <Dropdown.Item as="li" key={index}>
                                <Form.Check className="m-0 form-check-sm" type="checkbox" id={`ChkTask${index}`} label={taskList.label} value={taskList.label} checked={taskList.isChecked} onChange={handleTaskListCheckChange} />
                              </Dropdown.Item>
                            ))}
                            {userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyMemberCode &&
                              <>
                                <Dropdown.Item as="li">
                                  <Form.Check className="m-0 form-check-sm" type="checkbox" id="ChkTaskAssignedToMe" label="Assigned to me" value="Assigned to me" checked={assignedToMe} onChange={(e) => { handleAssignedToMeSelect(e) }} />
                                </Dropdown.Item>
                                <Dropdown.Item as="li">
                                  <Form.Check className="m-0 form-check-sm" type="checkbox" id="ChkMyFollowingTasks" label="Tasks i'm following" value="Tasks i'm following" checked={myFollowingTasks} onChange={(e) => { handleMyFollowingTasksSelect(e) }} />
                                </Dropdown.Item>
                              </>
                            }
                            {/* <Dropdown.Item as="li">
                              <Form.Check className="m-0 form-check-sm" type="checkbox" id="ChkTaskRecurring" label="Recurring" value="Recurring" checked={recurringTask} onChange={(e) => { handleRecurringTask(e) }} />
                            </Dropdown.Item> */}
                          </Dropdown.Menu>
                        </Dropdown>
                      </Accordion.Body>
                    </Accordion.Item>
                    {userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.pcCode || userData?.role_code === databaseRoleCode.accountantCode ?
                      <Accordion.Item eventKey="3">
                        <Accordion.Header>
                          By Assigned Member: {staffId.length > 0 ? `${staffId.length} Selected` : 'All'}
                          <Button variant="soft-secondary" size="sm" type="button" className='circle-btn btn-icon ms-3' onClick={() => { handleCopyFilter() }}><i className="fa fa-copy"></i></Button>
                        </Accordion.Header>
                        <Accordion.Body className="pt-4">
                          <Dropdown className="project-drop-down category-dropdown" show>
                            <Dropdown.Menu as="ul" align="down" className="p-2 w-100 position-relative shadow-none border-gray-100 border">
                              <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                                <div className="search-box w-100">
                                  <form>
                                    <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                      <img src={SearchIcon} alt="Search" />
                                      <input type="search" className="form-control border-0" placeholder="Search User..." value={staffSearch} onChange={(e) => { handleStaffSearch(e.target.value) }} />
                                    </div>
                                  </form>
                                </div>
                              </Dropdown.Header>
                              <SimpleBar className="dropdown-body">
                                {staffListForFilter.map((drp, index) => (
                                  <Dropdown.Item as="li" key={index}>
                                    <Form.Check className="m-0 form-check-sm" type="checkbox" name="categoryRadio" id={`project-radio-${index}`} label={drp.name} checked={staffId.filter(function (arr) { return arr.id === drp.id; }).length > 0} onChange={handleStaffListChange} value={drp.id} />
                                  </Dropdown.Item>
                                ))}
                              </SimpleBar>
                            </Dropdown.Menu>
                          </Dropdown>
                        </Accordion.Body>
                      </Accordion.Item>
                      : ''}
                            <Accordion.Item eventKey="1">
            <Accordion.Header>Project: {project.name ? project.name : 'All'}</Accordion.Header>
            <Accordion.Body className="pt-4">
                <Dropdown className="project-drop-down category-dropdown" show>
                    <Dropdown.Menu as="ul" align="down" className="p-2 w-100 position-relative shadow-none border-gray-100 border">
                        <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                            <div className="search-box w-100">
                                <form>
                                    <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                        <img src={SearchIcon} alt="Search" />
                                        <input type="search" className="form-control border-0" placeholder="Search Project..." value={projectSearch} onChange={(e) => { handleProjectSearch(e.target.value) }} />
                                    </div>
                                </form>
                            </div>
                        </Dropdown.Header>
                        <SimpleBar className="dropdown-body">
                            <Dropdown.Item as="li">
                                <Form.Check className="m-0 form-check-sm" type="radio" name="categoryRadio" label="All" id="project-radio-all" checked={project.id === ''} onChange={handleProjectRadioChange} value='' />
                            </Dropdown.Item>
                            {projectListForFilter.map((drp, index) => (
                                <Dropdown.Item as="li" key={index}>
                                    <Form.Check className="m-0 form-check-sm" type="radio" name="categoryRadio" id={`project-radio-${index}`} label={drp.name} checked={project.id === drp.id} onChange={handleProjectRadioChange} value={drp.id} />
                                </Dropdown.Item>
                            ))}
                        </SimpleBar>
                    </Dropdown.Menu>
                </Dropdown>
            </Accordion.Body>
        </Accordion.Item>
                    {userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyMemberCode &&
                      <Accordion.Item eventKey="2">
                        <Accordion.Header>Agency: {agency.name ? agency.name : 'All'}</Accordion.Header>
                        <Accordion.Body className="pt-4">
                          <Dropdown className="agency-drop-down category-dropdown" show>
                            <Dropdown.Menu as="ul" align="down" className="p-2 w-100 position-relative shadow-none border-gray-100 border">
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
                                <Dropdown.Item as="li">
                                  <Form.Check className="m-0 form-check-sm" type="radio" name="agencyRadio" label="All" id="agency-radio-all" checked={agency === ''} onChange={handleAgencyRadioChange} value='' />
                                </Dropdown.Item>
                                {agencyListForFilter.map((drp, index) => (
                                  <Dropdown.Item as="li" key={index}>
                                    <Form.Check className="m-0 form-check-sm" type="radio" name="agencyRadio" id={`agency-radio-${index}`} label={drp.agency_name} checked={agency.id === drp.staffid} onChange={handleAgencyRadioChange} value={drp.staffid} />
                                  </Dropdown.Item>
                                ))}
                              </SimpleBar>
                            </Dropdown.Menu>
                          </Dropdown>
                        </Accordion.Body>
                      </Accordion.Item>
                    }

                    {(userData.role_code === databaseRoleCode.agencyCode || userData.role_code === databaseRoleCode.agencyMemberCode) &&
                      <Accordion.Item eventKey="2">
                        <Accordion.Header>Customer: {customer.name ? customer.name : 'All'}</Accordion.Header>
                        <Accordion.Body className="pt-4">
                          <Dropdown className="customer-drop-down category-dropdown" show>
                            <Dropdown.Menu as="ul" align="down" className="p-2 w-100 position-relative shadow-none border-gray-100 border">
                              <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                                <div className="search-box w-100">
                                  <form>
                                    <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                      <img src={SearchIcon} alt="Search" />
                                      <input type="search" className="form-control border-0" placeholder="Search Customer..." value={customerSearch} onChange={(e) => handleCustomerSearch(e.target.value)} />
                                    </div>
                                  </form>
                                </div>
                              </Dropdown.Header>
                              <SimpleBar className="dropdown-body">
                                <Dropdown.Item as="li">
                                  <Form.Check className="m-0 form-check-sm" type="radio" name="customerRadio" label="All" id="agency-radio-all" checked={customer === ''} onChange={handleCustomerRadioChange} value='' />
                                </Dropdown.Item>
                                
                                {customerListForFilter.map((drp, index) => (
                                  <Dropdown.Item as="li" key={index}>
                                    <Form.Check className="m-0 form-check-sm" type="radio" name="customerRadio" id={`agency-radio-${index}`} label={drp.name} checked={customer.id === drp.id} onChange={handleCustomerRadioChange} value={drp.id} />
                                  </Dropdown.Item>
                                ))}
                              </SimpleBar>
                            </Dropdown.Menu>
                          </Dropdown>
                        </Accordion.Body>
                      </Accordion.Item>
                    }

                    {userData.role_code === databaseRoleCode.accountantCode && calendarToggle === 3 && task_type === 0 &&
                      <Accordion.Item eventKey="6">
                        <Accordion.Header>Date Filter: {filterStartDate && filterEndDate ? 'Selected' : 'Select'}</Accordion.Header>
                        <Accordion.Body className="pt-4">
                          <Dropdown className="customer-drop-down category-dropdown" show>
                            <Dropdown.Menu as="ul" align="down" className="p-2 w-100 position-relative shadow-none border-gray-100 border">
                              
                              <RangeDatePickerControl
                                selected={filterStartDate}
                                startDate={filterStartDate}
                                endDate={filterEndDate}
                                onChange={onChangeDateRange}
                              />
                            </Dropdown.Menu>
                          </Dropdown>
                        </Accordion.Body>
                      </Accordion.Item>
                    }

                  </Accordion>
                </Offcanvas.Body>
                <div className="filter-action-button add-comment-area  px-6 py-3 border-top border-gray-100 text-end">
                    <Button className="me-2" variant="soft-secondary" size="md" type="button" onClick={() => { handleClearFilter(); filterhandleClose(); }}>Clear Filter</Button>
                    <Button variant="primary" size="md" type="submit" onClick={() => { filterhandleClose() }}>Apply</Button>
                </div>
              </Offcanvas>
              {/* Filter For Mobile End*/}
              <div className="d-xl-flex d-none align-items-center ms-auto">
                {/* {showPriorityButton && task_type !== 3 &&
                  <Button variant="primary" size="sm" type="button" className='mr20 margin-auto' onClick={() => { handlePriorityButtonClick() }}>Set Task Priority
                  </Button>
                } */}

                {userData.role_code === databaseRoleCode.accountantCode && calendarToggle === 3 && task_type === 0 &&
                  <>

                    <Dropdown show={showDatePicker} onToggle={(isOpen) => setShowDatePicker(isOpen)} className='project-drop-down me-3'>
                      <Dropdown.Toggle as="div" className="dark-2 font-weight-medium font-12 cursor-pointer" id="alltask">
                        <div className="d-inline-block dark-5"><i className="icon-calendar me-2"></i> </div>
                      </Dropdown.Toggle>
                      <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2 w-100">
                        <Dropdown.Item as="li" onClick={handleDateClick}>
                          <RangeDatePickerControl
                            selected={filterStartDate}
                            startDate={filterStartDate}
                            endDate={filterEndDate}
                            onChange={onChangeDateRange}
                          />
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>

                  </>
                }

                <Dropdown className="category-dropdown project-status" autoClose="outside">
                <Dropdown.Toggle as="div" className="dark-2 font-weight-medium font-12 cursor-pointer" id="alltask">
    <div className="d-inline-block me-2 dark-5">Filter by: </div>
    {`${taskStatusList.filter(status => status.isChecked).length} Selected`} {/* Count only checked statuses */}
</Dropdown.Toggle>
<Dropdown.Menu>
    {taskStatusList.map((status, index) => ( // No need to filter again, as we already filtered in useEffect
        <Dropdown.Item key={index} onClick={() => {/* Handle filter action */}}>
            {status.label}
        </Dropdown.Item>
    ))}
</Dropdown.Menu>
                  <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2 w-100">
                    {taskStatusList.map((taskList, index) => (
                      <Dropdown.Item as="li" key={index}>
                        <Form.Check className="m-0 form-check-sm" type="checkbox" id={`ChkTask${index}`} label={taskList.label} value={taskList.label} checked={taskList.isChecked} onChange={handleTaskListCheckChange} />
                      </Dropdown.Item>
                    ))}
                    {userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyMemberCode &&
                      <>
                        <Dropdown.Item as="li">
                          <Form.Check className="m-0 form-check-sm" type="checkbox" id="ChkTaskAssignedToMe" label="Assigned to me" value="Assigned to me" checked={assignedToMe} onChange={(e) => { handleAssignedToMeSelect(e) }} />
                        </Dropdown.Item>
                        <Dropdown.Item as="li">
                          <Form.Check className="m-0 form-check-sm" type="checkbox" id="ChkMyFollowingTasks" label="Tasks i'm following" value="Tasks i'm following" checked={myFollowingTasks} onChange={(e) => { handleMyFollowingTasksSelect(e) }} />
                        </Dropdown.Item>
                      </>
                    }
                    {/* <Dropdown.Item as="li">
                      <Form.Check className="m-0 form-check-sm" type="checkbox" id="ChkTaskRecurring" label="Recurring" value="Recurring" checked={recurringTask} onChange={(e) => { handleRecurringTask(e) }} />
                    </Dropdown.Item> */}
                  </Dropdown.Menu>
                </Dropdown>
                {userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.pcCode || userData?.role_code === databaseRoleCode.accountantCode ?
                  <Dropdown className="project-drop-down category-dropdown ms-3 ms-xxl-8" autoClose="outside">
                    <Dropdown.Toggle as="div" className="dark-2 font-weight-medium font-12 cursor-pointer" id="projects"><div className="d-inline-block me-2 dark-5">By Assigned Member: </div>{staffId.length > 0 ? `${staffId.length} Selected` : 'All'}</Dropdown.Toggle>
                    <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2 w-100">
                      <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                        <div className="search-box w-100">
                          <form>
                            <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                              <img src={SearchIcon} alt="Search" />
                              <input type="search" className="form-control border-0" placeholder="Search User..." value={staffSearch} onChange={(e) => { handleStaffSearch(e.target.value) }} />
                            </div>
                          </form>
                        </div>
                        <OverlayTrigger overlay={<Tooltip>Copy Assigned Member filter</Tooltip>}>
                          <Button variant="soft-secondary" size="sm" type="button" className='circle-btn btn-icon ms-3' onClick={() => { handleCopyFilter() }}><i className="fa fa-copy"></i></Button>
                        </OverlayTrigger>
                      </Dropdown.Header>
                      <SimpleBar className="dropdown-body">
                        {staffListForFilter.map((drp, index) => (
                          <Dropdown.Item as="li" key={index}>
                            <Form.Check className="m-0 form-check-sm" type="checkbox" name="categoryRadio" id={`project-radio-${index}`} label={drp.name} checked={staffId.filter(function (arr) { return arr.id === drp.id; }).length > 0} onChange={handleStaffListChange} value={drp.id} />
                          </Dropdown.Item>
                        ))}
                      </SimpleBar>
                    </Dropdown.Menu>
                  </Dropdown>
                  : ''}
                <Dropdown className="project-drop-down category-dropdown ms-2 ms-xxl-5">
                  <Dropdown.Toggle as="div" className="dark-2 font-weight-medium font-12 cursor-pointer" id="projects_desktop"><div className="d-inline-block me-2 dark-5">Project: </div>{project.name ? project.name : 'All'}</Dropdown.Toggle>
                  <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2 w-100">
                    <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                      <div className="search-box w-100">
                        <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                          <img src={SearchIcon} alt="Search" />
                          <input type="search" className="form-control border-0" placeholder="Search Project..." value={projectSearch} onChange={(e) => { handleProjectSearch(e.target.value) }} />
                        </div>
                      </div>
                    </Dropdown.Header>
                    <SimpleBar className="dropdown-body">
                      <Dropdown.Item as="li">
                        <Form.Check className="m-0 form-check-sm" type="radio" name="categoryRadio" label="All" id="project-radio-all" checked={project === ''} onChange={handleProjectRadioChange} value='' />
                      </Dropdown.Item>
                      {projectListForFilter.map((drp, index) => (
                        <Dropdown.Item as="li" key={index}>
                          <Form.Check className="m-0 form-check-sm" type="radio" name="categoryRadio" id={`project-radio-${index}_desktop`} label={drp.name} checked={project.id === drp.id} onChange={handleProjectRadioChange} value={drp.id} />
                        </Dropdown.Item>
                      ))}
                    </SimpleBar>
                  </Dropdown.Menu>
                </Dropdown>
                {userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyMemberCode &&
                  <>
                    <div className='selact-agency-dropdown ms-5 ms-xxl-8 d-flex align-items-center'>
                      <div className='d-inline-block me-1 dark-5 font-weight-medium font-12 cursor-pointer'>Agency:</div>
                      <Select
            styles={customStyles}
            className="control-md custom-select bg-transparent"
            classNamePrefix="select"
            options={agencyList1}
            onChange={handleAgencySelect}
            value={agencyList1.find(option => option.value === agency?.id) || agencyList1[0]}
        />
                    </div>
                  </>
                }

                {(userData.role_code === databaseRoleCode.agencyCode || userData.role_code === databaseRoleCode.agencyMemberCode) &&
                  <>
                  
                    <div className='selact-agency-dropdown ms-5 ms-xxl-8 d-flex align-items-center'>
                      <div className='d-inline-block me-1 dark-5 font-weight-medium font-12 cursor-pointer'>Customer:</div>
                      <Select styles={customStyles} className="control-md custom-select bg-transparent" classNamePrefix="select" options={customerList} onChange={handleCustomerSelect}
                        value={customerList.filter(function (option, index) {
                          if (customer !== '') {
                            return option.value === customer?.id;
                          }
                          else {
                            if (index === 0) {
                              return true;
                            }
                          }
                        })} />
                    </div>
                  </>
                }

                <OverlayTrigger overlay={<Tooltip>Clear Filter Data</Tooltip>}>
                  <Button variant="soft-danger" size="sm" type="button" className='circle-btn btn-icon ms-5 ms-xl-8' onClick={() => { handleClearFilter() }}><i className="icon-filter"></i></Button>
                </OverlayTrigger>

              </div>
              
            </div>
            </div>
          <div className="inner-content">            
            
            {task_type !== 3 && calendarToggle !== 2 && taskSummary && userData.role_code !== databaseRoleCode.clientCode &&
              <>
               
                <Row className="g-4 mb-7">
                <Col xs={6} md={4} xl={4} xxl={2}>
                    <Card className="rounded-12 border border-gray-100 leave-card h-100">
                      <Card.Body className="p-3 px-xxl-4">
                        <Row className="align-items-center">
                          <Col>
                            <span className="h2 mb-0">{totalTasks}</span>
                            <span className="caption d-block mb-0 text-primary">Topics Generated</span>
                            {/* <span className="font-12 caption text-gray-600 d-block mb-1">Total tasks assigned to me: {totalAssignedTasks}</span> */}
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={6} md={4} xl={4} xxl={2}>
                    <Card className="rounded-12 border border-gray-100 leave-card h-100">
                      <Card.Body className="p-3 px-xxl-4">
                        <Row className="align-items-center">
                          <Col>
                            <span className="h2 mb-0">{topicsApprovedCount}</span>
                            <span className="caption text-success d-block mb-0">Topics Approved </span>
                            {/* <span className="font-12 caption text-gray-600 d-block mb-1">Tasks assigned to me: {topicsApprovedAssignedToMe}</span> */}
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={6} md={4} xl={4} xxl={2} >
                    <Card className="rounded-12 border border-gray-100 leave-card h-100">
                      <Card.Body className="p-3 px-xxl-4">
                        <Row className="align-items-center">
                          <Col>
                            <span className="h2 mb-0">{taskSummary['pending'] ? taskSummary['pending'] : 0}</span>
                            <span className="caption text-gray-600 d-block mb-0">Topics Approval Pending</span>
                            {/* <span className="font-12 caption text-gray-600 d-block mb-1">Tasks assigned to me: {taskSummary['pending-approval-assign-me'] ? taskSummary['pending-approval-assign-me'] : 0}</span> */}
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                  {/* <Col xs={6} md={4} xl={4} xxl={2} >
                    <Card className="rounded-12 border border-gray-100 leave-card h-100">
                      <Card.Body className="p-3 px-xxl-4">
                        <Row className="align-items-center">
                          <Col>
                            <span className="h2 mb-0">{taskSummary['in-progress'] ? taskSummary['in-progress'] : 0}</span>
                            <span className="d-block mb-1 font-weight-medium text-primary">In Progress</span>
                            <span className="font-12 caption text-gray-600 d-block mb-1">Tasks assigned to me: {taskSummary['in-progress-assign-me'] ? taskSummary['in-progress-assign-me'] : 0}</span>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={6} md={4} xl={4} xxl={2} >
                    <Card className="rounded-12 border border-gray-100 leave-card h-100">
                      <Card.Body className="p-3 px-xxl-4">
                        <Row className="align-items-center">
                          <Col>
                            <span className="h2 mb-0">{taskSummary['testing'] ? taskSummary['testing'] : 0}</span>
                            <span className="d-block mb-1 font-weight-medium text-warning">Testing</span>
                            <span className="font-12 caption text-gray-600 d-block mb-1">Tasks assigned to me: {taskSummary['testing-assign-me'] ? taskSummary['testing-assign-me'] : 0}</span>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={6} md={4} xl={4} xxl={2} >
                    <Card className="rounded-12 border border-gray-100 leave-card h-100">
                      <Card.Body className="p-3 px-xxl-4">
                        <Row className="align-items-center">
                          <Col>
                            <span className="h2 mb-0">{taskSummary['awaiting-feedback'] ? taskSummary['awaiting-feedback'] : 0}</span>
                            <span className="d-block mb-1 font-weight-medium text-info">Awaiting Feedback</span>
                            <span className="font-12 caption text-gray-600 d-block mb-1">Tasks assigned to me: {taskSummary['awaiting-feedback-assign-me'] ? taskSummary['awaiting-feedback-assign-me'] : 0}</span>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col> */}
                  <Col xs={6} md={4} xl={4} xxl={2} >
                    <Card className="rounded-12 border border-gray-100 leave-card h-100">
                      <Card.Body className="p-3 px-xxl-4">
                        <Row className="align-items-center">
                          <Col>
                            <span className="h2 mb-0">{taskSummary['rejected'] ? taskSummary['rejected'] : 0}</span>
                            <span className="caption d-block mb-0 text-danger">Topics Rejected</span>
                            {/* <span className="font-12 caption text-gray-600 d-block mb-1">Tasks assigned to me: {taskSummary['rejected-assign-me'] ? taskSummary['rejected-assign-me'] : 0}</span> */}
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                  {/* <Col xs={6} md={4} xl={4} xxl={2} >
                    <Card className="rounded-12 border border-gray-100 leave-card h-100">
                      <Card.Body className="p-3 px-xxl-4">
                        <Row className="align-items-center">
                          <Col>
                            <span className="h2 mb-0">{taskSummary['complete'] ? taskSummary['complete'] : 0}</span>
                            <span className="d-block mb-1 font-weight-medium text-success">Complete</span>
                            <span className="font-12 caption text-gray-600 d-block mb-1">Tasks assigned to me: {taskSummary['complete-assign-me'] ? taskSummary['complete-assign-me'] : 0}</span>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col> */}
                </Row>
              </>
            }
            {calendarToggle && calendarToggle === 1 &&
              <div>
                <Accordion defaultActiveKey={['0']} alwaysOpen className="dashboard-accordion">
                  {taskStatusList.map((tasklisting, index) => (
                    tasklisting.isChecked && taskList[tasklisting.value] &&
                    <TaskListAccordion key={index} index={`${index}`} source="mytask" setRefreshForNewPage={setRefreshForNewPage} refreshForNewPage={refreshForNewPage} taskStatusDataList={taskList[tasklisting.value]} heading={tasklisting.label} id={tasklisting.id} cstShowViewTaskModal={cstShowViewTaskModal} cstShowEditTaskModal={cstShowEditTaskModal} project={project} agency={agency} assigned_id={assignedToMe === true ? userData?.id : 0} myFollowingTasks={myFollowingTasks === true ? userData?.id : 0} staffId={staffId} recurringTask={recurringTask} projectList={projectList} agencyList={agencyList} deleteTask={deleteTask} updateTaskStatus={updateTaskStatus} taskStatusList={taskStatusList} userData={userData} taskStroke={taskStroke} task_type={task_type} total_task={taskList['all-status-count'][tasklisting.value]} customerId={filterCustomerId > 0 ? filterCustomerId : customerId} />
                  ))}

                </Accordion>
              </div>
            }
            {calendarToggle && calendarToggle === 2 &&
              <div className="card rounded-10 p-6 calander-card task-calendar">
                <FullCalendar
                  initialView='dayGridMonth'
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                  themeSystem="Simplex"
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  dayMaxEventRows={5}
                  contentHeight={'auto'}
                  contentWidth={'auto'}
                  events={calendarTaskList}
                  eventClick={handleCalendarTaskClick}
                  datesSet={(arg) => {
                    setCalendarStartEndDate({ start: moment(arg.start).format("YYYY-MM-DD"), end: moment(arg.end).format("YYYY-MM-DD") });
                  }}
                />
              </div>
            }
            
            {calendarToggle && calendarToggle === 3 &&
              <div className={`card rounded-10 p-6 all-dev-task all-dev-task-with-checkbox`}>
                {taskStatusList.length > 0 &&
                  <TaskList userData={userData} agency={agency} assigned_id={assignedToMe === true ? userData?.id : 0} myFollowingTasks={myFollowingTasks === true ? userData?.id : 0} staffId={staffId} recurringTask={recurringTask} project={project} deleteTask={deleteTask} cstShowViewTaskModal={cstShowViewTaskModal} cstShowEditTaskModal={cstShowEditTaskModal} updateTaskStatus={updateTaskStatus} taskStatusList={taskStatusList} refreshForNewPage={refreshForNewPage} setRefreshForNewPage={setRefreshForNewPage} refreshForList={refreshForList} setRefreshButtonProcess={setRefreshButtonProcess} task_type={task_type} showPriorityButton={showPriorityButton} setShowPriorityButton={setShowPriorityButton} customerId={filterCustomerId > 0 ? filterCustomerId : customerId} filterStartDate= {filterStartDate} filterEndDate={filterEndDate} lastOpenedTaskId = {lastOpenedTaskId}/>
                }
              </div>
            }
            {/* {calendarToggle && calendarToggle === 3 &&
              <div className={`card rounded-10 p-6 all-dev-task all-dev-task-with-checkbox`}>
                {taskStatusList.length > 0 &&
                  <ArticleList
      userData={userData}
      agency={agency}
      assigned_id={assignedToMe === true ? userData?.id : 0}
      myFollowingTasks={myFollowingTasks === true ? userData?.id : 0}
      staffId={staffId}
      recurringTask={recurringTask}
      project={project}
      deleteTask={deleteTask}
      cstShowViewTaskModal={cstShowViewTaskModal}
      cstShowEditTaskModal={cstShowEditTaskModal}
      updateTaskStatus={updateTaskStatus}
      taskStatusList={taskStatusList}
      refreshForNewPage={refreshForNewPage}
      setRefreshForNewPage={setRefreshForNewPage}
      refreshForList={refreshForList}
      setRefreshButtonProcess={setRefreshButtonProcess}
      task_type={task_type}
      showPriorityButton={showPriorityButton}
      setShowPriorityButton={setShowPriorityButton}
      customerId={filterCustomerId > 0 ? filterCustomerId : customerId}
      filterStartDate={filterStartDate}
      filterEndDate={filterEndDate}
      lastOpenedTaskId={lastOpenedTaskId}
    />
                }
              </div>
            } */}
          </div>
        <RatingReviewModal ratingModalShow={ratingModalShow} setShowRatingModal={setShowRatingModal} taskIdForRating={taskIdForRating} SetTaskIdForRating={SetTaskIdForRating} />
        <Modal size="lg" show={showViewSiteList} onHide={cstHideViewSiteList} centered>
          <Modal.Header closeButton className="py-5 px-10">
            <Modal.Title className="font-20 dark-1 mb-0">Site List</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {agencySiteList &&
              <StaticDataTable 

                columns={siteColumns} 
                data={agencySiteList.map((item) => ({
                  ...item,
                  billingperiod: 
                  item.billingperiod === "existing" ? "Legacy" :
                  item.billingperiod === "monthly" ? "Monthly" :
                  item.billingperiod,
                }))}
                isExport={false} />
            }
          </Modal.Body>
        </Modal>
        <Footer />
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
  userData: state.Auth.user
})

export default connect(mapStateToProps)(Mytask)
