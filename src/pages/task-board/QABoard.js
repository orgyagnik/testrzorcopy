import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Col, Row, Modal, Button, Form, Dropdown, Offcanvas, OverlayTrigger, Tooltip, Accordion, Spinner } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import APIService from "../../api/APIService";
import Select from 'react-select';
import moment from 'moment';
import { connect } from "react-redux";
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import { DELETE_QATASKBOARD, TESTED_QATASKBOARD } from '../../modules/lang/Taskboard';
import { databaseRoleCode, popperConfig, pcHeadId } from '../../settings';
import { filterDropdownOptionByName, check } from "../../utils/functions.js";
import { validateForm } from "../../utils/validator.js";
import { QAboardValidator } from "../../modules/validation/TaskboardValidator";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import MoveIcon from "../../assets/img/icons/move.svg";
import RateCompleteTaskQA from './RateCompleteTaskQA';
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import { Link } from "react-router-dom";

function QABoard({ userData, name }) {
  const [showAddtaskModal, setShowAddtaskModal] = useState(false);
  const [taskBoardData, setTaskBoardData] = useState([]);
  const [taskBoardId, setTaskBoardId] = useState(0);
  const [taskBoardUserId, setTaskBoardUserId] = useState(0);
  const [projectManager, setProjectManager] = useState(0);
  const [projectManagerOption, setProjectManagerOption] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [refreshDesign, setRefreshDesign] = useState(false);
  const [reloadTaskboard, setReloadTaskboard] = useState(false);
  const [reloadStaffList, setReloadStaffList] = useState(false);
  const [agency, setAgency] = useState(0);
  const [agencyList, setAgencyList] = useState([]);
  const [agencyForAssign, setAgencyForAssign] = useState(0);
  const [agencyListForAssign, setAgencyListForAssign] = useState([]);
  const [taskType, setTaskType] = useState('');
  const [taskTypeList, setTaskTypeList] = useState([]);
  const [developer, setDeveloper] = useState('');
  const [developerOption, setDeveloperOption] = useState([]);
  const [staffForManage, SetStaffForManage] = useState([]);
  const [hours, setHours] = useState('');
  const [priority, setPriority] = useState('');
  const [saveProcess, setSaveProcess] = useState(false);
  const [formErrors, setFormErrors] = useState([]);
  const [taskSearch, setTaskSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [taskListForFilter, setTaskListForFilter] = useState([]);
  const [taskDescription, setTaskDescription] = useState([]);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const dropdownRef = useRef();

  const [ratingCompleteShow, setShowRatingCompleteModal] = useState(false);
  const showRatingModal = (id, userId) => {
    setTaskBoardId(id);
    setTaskBoardUserId(userId);
    setShowRatingCompleteModal(true);
  }

  const cstSetCloseAddtaskModal = () => {
    setShowAddtaskModal(false);
    clearControl();
  }
  const cstShowAddtaskModal = () => setShowAddtaskModal(true);

  const [showManageStaffSidebar, setShowManageStaffSidebar] = useState(false);

  const msCloseManageStaffSidebar = () => setShowManageStaffSidebar(false);
  const msShowManageStaffSidebar = () => setShowManageStaffSidebar(true);

  useEffect(() => {
    if(isOpenFilter || showAddtaskModal){
      APIService.getAllAgency()
        .then((response) => {
          if (response.data?.status) {
            let newAgencyList = response.data?.data.map(item => {
              return { label: item.agency_name, value: item.staffid }
            });
            setAgencyList([{ label: 'All Agency', value: 0 }, ...newAgencyList]);
            setAgencyListForAssign([{ label: 'Select Agency', value: 0 }, ...newAgencyList]);
          }
        });

      setTaskTypeList([{ label: 'All', value: '' }, { label: 'Dev', value: 0 }, { label: 'Site Addons', value: 1 }]);

      APIService.getAllMembers(`?role_code=project_manager`)
        .then((response) => {
          if (response.data?.status) {
            let newStaffList = response.data?.data?.map(item => {
              return { label: item.name, value: item.id }
            });
            setProjectManagerOption([{ label: 'All Project Manager', value: 0 }, ...newStaffList]);
          }
        });
      }
  }, [isOpenFilter, showAddtaskModal]);

  useEffect(() => {
    if (agencyForAssign !== 0) {
      let params = "?";
      params = params + "task_type=0,1&search_by_agency=" + agencyForAssign;
      APIService.getTaskForQA(params)
        .then((response) => {
          if (response.data?.status) {
            setTaskList(response.data?.data);
            setTaskListForFilter(response.data?.data);
          }
        });
    }
  }, [agencyForAssign]);

  useEffect(() => {
    if(showManageStaffSidebar || showAddtaskModal){
      APIService.getManageQAEmploye()
        .then((response) => {
          if (response.data?.status) {
            let newStaffList = response.data?.data?.active_developer?.map(item => {
              return { label: item.name, value: item.staffid }
            });
            SetStaffForManage(response.data?.data);
            setDeveloperOption(newStaffList);
          }
        });
    }
  }, [reloadStaffList, showManageStaffSidebar, showAddtaskModal]);

  useEffect(() => {
    const timer = setTimeout(() => {
      let params = "?";
      params = params + "sort=asc&limit=1000&page=1&sort_by=created_at";
      if (projectManager !== 0) {
        params = params + "&coordinator=" + projectManager;
      }
      if (agency !== 0) {
        params = params + "&search_by_agency=" + agency;
      }
      if (taskType !== '') {
        params = params + "&task_type=" + taskType;
      }
      if (searchFilter !== '') {
        params = params + "&search=" + searchFilter;
      }

      APIService.getQABoardList(params)
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
  }, [projectManager, agency, searchFilter, reloadTaskboard, taskType]);

  useEffect(() => {

  }, [refreshDesign]);

  const handleAgencySelect = (selectedAgency) => {
    setAgency(selectedAgency?.value);
  };

  const handleAgencyForAssignSelect = (selectedAgency) => {
    setAgencyForAssign(selectedAgency?.value);
    setSelectedTask([]);
  };

  const handleTaskTypeSelect = (selected) => {
    setTaskType(selected?.value);
    // setIsOpenFilter(false);
  };

  const handleProjectManagerSelect = (selectedPc) => {
    setProjectManager(selectedPc?.value);
  };

  const handleTaskSearch = (value) => {
    setTaskSearch(value);
    filterDropdownOptionByName(taskList, value, setTaskListForFilter);
  }

  const handleTaskRadioChange = (e) => {
    handleTaskSearch('');
    setTaskDescription('');
    let task_id = parseInt(e.target.value);
    if (task_id > 0) {
      let task_name = '';
      let selectedTask = taskList.filter(function (arr) { return arr.id === task_id; });
      if (selectedTask.length > 0) {
        task_name = selectedTask[0].name;
      }
      setSelectedTask({ id: task_id, name: task_name });
    }
    else {
      setSelectedTask({ id: 0, name: "Custom Task" });
    }
  }

  const handleTaskRadioChangeForMultiple = (e) => {
    handleTaskSearch('');
    setTaskDescription('');
    let task_id = parseInt(e.target.value);
    if (e.target.checked) {
      if (task_id > 0) {
        let task_name = '';
        let newSelectedTask = taskList.filter(function (arr) { return arr.id === task_id; });
        if (newSelectedTask.length > 0) {
          task_name = newSelectedTask[0].name;
        }
        setSelectedTask([{ id: task_id, name: task_name }, ...selectedTask]);
      }
      else {
        setSelectedTask([{ id: 0, name: "Custom Task" }]);
      }
    }
    else {
      if (selectedTask.length > 1) {
        setSelectedTask(
          selectedTask.filter((data) => data.id !== task_id),
        );
      }
      else {
        setSelectedTask([]);
      }
    }
  }

  const handleDeveloperSelect = (selectedDeveloper) => {
    setDeveloper(selectedDeveloper?.value);
  };

  const addNewCard = (staff_id) => {
    setDeveloper(staff_id);
    cstShowAddtaskModal();
  };

  const handleRemoveTaskBoard = (id) => {
    confirmAlert({
      title: 'Confirm',
      message: DELETE_QATASKBOARD,
      buttons: [
        {
          label: 'Yes',
          className: 'btn btn-primary btn-lg',
          onClick: () => {
            let params = {};
            params["id"] = id;
            APIService.removeQATaskboard(params)
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

  const handleTestedTaskBoard = (id) => {
    confirmAlert({
      title: 'Confirm',
      message: TESTED_QATASKBOARD,
      buttons: [
        {
          label: 'Yes',
          className: 'btn btn-primary btn-lg',
          onClick: () => {
            let params = {};
            params["id"] = id;
            params["status"] = 1;
            APIService.testedQATaskboard(params)
              .then((response) => {
                if (response.data?.status) {
                  setReloadTaskboard(!reloadTaskboard);
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
    setTaskBoardUserId(0);
    setAgencyForAssign(0);
    setDeveloper('');
    setHours('');
    setPriority('');
    setSelectedTask([])
    setTaskDescription('');
    setTaskList([]);
    setTaskListForFilter([]);
  }

  const handleEditTaskBoard = (id) => {
    clearControl();
    setTaskBoardId(id);
    let editTaskBoardData = taskBoardData?.taskboard_lists?.filter(function (arr) {
      return arr.id === id;
    });
    if (editTaskBoardData.length > 0) {
      let data = editTaskBoardData[0];
      setAgencyForAssign(data?.agency_id);
      setDeveloper(data?.staff_id);
      if (data?.task_id > 0) {
        setSelectedTask({ id: data?.task_id, name: data?.task_name });
      }
      else {
        setSelectedTask({ id: 0, name: "Custom Task" });
        setTaskDescription(data?.custom_task_description);
      }
      setHours(data?.hours);
      setPriority(data?.priority_order);
      cstShowAddtaskModal();
    }
  };

  const addTaskboardCard = async () => {
    setSaveProcess(true);
    setFormErrors([]);
    let validate = [];
    if (taskBoardId > 0) {
      validate = validateForm((QAboardValidator(taskBoardId > 0 ? 'not required' : agencyForAssign !== 0 || selectedTask.id === 0 ? agencyForAssign : '', developer, selectedTask.id || selectedTask.id === 0 ? 'not required' : '', selectedTask.id === 0 ? taskDescription : 'not required')));
    }
    else {
      validate = validateForm((QAboardValidator(taskBoardId > 0 ? 'not required' : agencyForAssign !== 0 || selectedTask[0]?.id === 0 ? agencyForAssign : '', developer, selectedTask.length ? 'not required' : '', selectedTask[0]?.id === 0 ? taskDescription : 'not required')));
    }
    if (Object.keys(validate).length) {
      setSaveProcess(false);
      setFormErrors(validate);
    }
    else {
      const params = {};
      if (taskBoardId > 0) {
        params['id'] = taskBoardId;
        params['staff_id'] = developer;
        params['hours'] = hours;
        params['priority_order'] = priority;
        if (selectedTask.id === 0) {
          params['task_id'] = '0';
          params['agency_id'] = 0;
          params['custom_task_description'] = taskDescription;
        }
        else {
          params['task_id'] = selectedTask.id;
          params['agency_id'] = agencyForAssign;
        }

        APIService.updateQATaskboardCard(params)
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
        //params['id'] = taskBoardId;
        params['staff_id'] = developer;
        params['hours'] = hours;
        params['priority_order'] = priority;

        if (selectedTask[0].id === 0) {
          params['task_id'] = '0';
          params['agency_id'] = 0;
          params['custom_task_description'] = taskDescription;
        }
        else {
          let tasks_list = selectedTask.map((obj) => obj.id);
          params['task_id'] = tasks_list.join();
          params['agency_id'] = agencyForAssign;
        }

        APIService.addQAboardCard(params)
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

    APIService.setQAListPriority(params)
      .then((response) => {
        if (response.data?.status) {
          setReloadTaskboard(!reloadTaskboard);
        }
        else {
          SetStaffForManage(staffForManage);
        }
      });
  }

  const handleStaffActiveDeactive = (staffid, e) => {
    const params = new FormData();
    params.append("staffids", staffid);
    params.append("status", !e.target.checked);

    APIService.setQAListPriority(params)
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

  const handleClearFilter = async (e) => {
    setSearchFilter('');
    setAgency(0);
    setTaskType('');
    setProjectManager(0);
    setIsOpenFilter(false);
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

  const [filtershow, filtersetShow] = useState(false);
  const filterhandleClose = () => filtersetShow(false);
  const filterhandleShow = () => filtersetShow(true);

  const toggleFilterDropdown = () => {
    setIsOpenFilter(!isOpenFilter);
  };

  const closeFilterDropdown = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpenFilter(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', closeFilterDropdown);
    return () => {
      document.removeEventListener('mousedown', closeFilterDropdown);
    };
  }, []);

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Header pagename={name ? name : ''} headerFilterButton={<Button onClick={filterhandleShow} variant="outline-secondary" size="md" type="button" className='ms-auto d-xl-none d-block'>Filter <i className="icon-filter ms-2"></i></Button>} />
        <div className="inner-content py-0 px-0">
          <div className='taskboard-page'>
            {check(['taskboards.create'], userData?.role.getPermissions) &&
              <>
                <div className="bg-white py-3 px-4 px-lg-7 taskboard-header page-inner-header">
                  <Row className="g-2 align-items-center">
                    <Col className="col-6 col-sm-auto">
                      <Button variant="primary" size="md" className='w-100' onClick={msShowManageStaffSidebar}>Manage QA</Button>
                    </Col>
                    {userData?.role_code === databaseRoleCode.adminCode || userData?.designation === pcHeadId ?
                      <Col className="col-6 col-sm-auto">
                        <Link to='/qa-staff-rating' className='btn btn-outline-secondary btn-md w-100' target='_blank'>Staff Rating</Link>
                      </Col> : ''
                    }
                    <Col className="d-xl-block d-none col-12 col-xl-4 col-xxl-4 col-xxxl-3 ms-auto ">
                      <div className="search-box w-100">
                        <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                          <span className="icon-serach"></span>
                          <input type="text" className="form-control border-0" placeholder="Search Agency or Employee Name" value={searchFilter} onChange={(e) => { setSearchFilter(e.target.value) }} />
                          <span className='search-clear icon-cancel cursor-pointer p-2 font-12 dark-6' onClick={(e) => { setSearchFilter('') }}></span>
                        </div>
                      </div>
                    </Col>
                    <Col className="col-12 col-md-auto d-xl-block d-none">
                      <Dropdown show={isOpenFilter} className="taskboard-filter-dropdown" autoClose="outside" ref={dropdownRef}>
                          <Dropdown.Toggle bsPrefix="filter-btn" variant="outline-secondary" size='md' id="dropdown-basic" onClick={toggleFilterDropdown}>
                          Filter <i className="icon-filter ms-2"></i><i className="icon-cancel ms-2"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="down" className="dropdown-menu-end p-0 w-100">
                          <Dropdown.Header className="border-gray-100 border-bottom p-4 d-flex align-items-center">
                            <h5 className='m-0'>Qa Board Filter</h5>
                            <Button variant="outline-secondary" size='sm' className="ms-auto" onClick={() => { handleClearFilter() }}>Clear Filter</Button>
                          </Dropdown.Header>
                          <div className='p-4'>
                            <div className='mb-4'>
                              <Select styles={customStyles} className="control-md custom-select" options={agencyList} onChange={handleAgencySelect}
                                value={agencyList.filter(function (option) {
                                  return option.value === agency;
                                })} />
                            </div>
                            <div className='mb-4'>
                              <Select styles={customStyles} className="control-md custom-select" options={taskTypeList} onChange={handleTaskTypeSelect}
                                value={taskTypeList.filter(function (option) {
                                  return option.value === taskType;
                                })} />
                            </div>
                            <div>
                              <Select styles={customStyles} className="control-md custom-select" options={projectManagerOption} onChange={handleProjectManagerSelect}
                                value={projectManagerOption.filter(function (option) {
                                  return option.value === projectManager;
                                })} />
                            </div>
                          </div>

                        </Dropdown.Menu>
                      </Dropdown>
                    </Col>

                  </Row>
                </div>
                {/* Filter For Mobile Start*/}
                <Offcanvas show={filtershow} onHide={filterhandleClose} placement="bottom" className="task-filter-overlay d-xl-none border-top-0">
                  <Offcanvas.Header closeButton className="border-gray-100 border-bottom">
                    <Offcanvas.Title>Filter</Offcanvas.Title>
                  </Offcanvas.Header>
                  <Offcanvas.Body className="py-5">
                    <SimpleBar className="offcanvas-inner">
                      <Row className="g-5 align-items-center">
                        {/* <Col className="col-12 col-md-auto">
                        <Link to='/taskboard-hours-report' className='btn btn-outline-secondary btn-md' target='_blank'>Agency Hourly Report</Link>
                      </Col> */}
                        <Col xs="12">
                          <Select styles={customStyles} className="control-md custom-select" options={agencyList} onChange={handleAgencySelect}
                            value={agencyList.filter(function (option) {
                              return option.value === agency;
                            })} />
                        </Col>
                        <Col xs="12">
                          <Select styles={customStyles} className="control-md custom-select" options={taskTypeList} onChange={handleTaskTypeSelect}
                            value={taskTypeList.filter(function (option) {
                              return option.value === taskType;
                            })} />
                        </Col>
                        <Col xs="12">
                          <Select styles={customStyles} className="control-md custom-select" options={projectManagerOption} onChange={handleProjectManagerSelect}
                            value={projectManagerOption.filter(function (option) {
                              return option.value === projectManager;
                            })} />
                        </Col>
                        <Col xs="12" className="">
                          <div className="search-box w-100">
                            <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                              <span className="icon-serach"></span>
                              <input type="search" className="form-control border-0" placeholder="Search By Agency or Employee Name" value={searchFilter} onChange={(e) => { setSearchFilter(e.target.value) }} />
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </SimpleBar>
                  </Offcanvas.Body>
                  <div className="py-3 px-5 border-top border-gray-100 text-end filter-action-button add-comment-area">
                    <Button variant="soft-secondary" size="md" type="button" onClick={() => { handleClearFilter() }}>Clear Filter</Button>
                    <Button className="ms-4" variant="primary" size="md" type="button" onClick={() => { filterhandleClose(); }}>Apply Filter</Button>
                  </div>
                </Offcanvas>
                {/* Filter For Mobile End*/}
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
                            <PermissionCheck permissions={['taskboards.create']}>
                              <Button variant={emp.leave_status ? 'danger' : 'primary'} onClick={() => addNewCard(emp.staff_id)} className="btn-icon circle-btn ms-auto"> <i className="icon-add"></i> <span></span> </Button>
                            </PermissionCheck>
                          </div>
                          <SimpleBar className="task-card-list mt-3">
                            {taskBoardData?.taskboard_lists?.filter(function (arr) { return arr.staff_id === emp.staff_id; }).map((taskboard, index) => (

                              <div className="inner-card rounded-10 bg-white p-4" key={`${emp_index}-${index}`}>
                                <div className='d-flex'>
                                  <div className="col-9 me-3">
                                    <p className="dark-1 mb-2 lh-base">
                                      <span className="font-weight-medium">Task: </span>
                                      {taskboard?.task_id ?
                                        <Link className="font-weight-medium" to={taskboard?.task_type === 1 ? `/view-site-addons-task/${taskboard?.task_id}` : `/view-task/${taskboard?.task_id}`} target="_blank">{taskboard?.task_name}</Link>
                                        :
                                        <span className="font-weight-medium">Custom Task</span>
                                      }
                                    </p>
                                  </div>
                                  {check(['taskboards.update', 'taskboards.delete'], userData?.role.getPermissions) || taskboard?.is_tested === 0 ?
                                    <Dropdown className="ms-auto">
                                      <Dropdown.Toggle as="a" bsPrefix="d-toggle" className="btn btn-light btn-icon btn-sm shadow-none" id="dropdown-basic">
                                        <i className="fa-solid fa-ellipsis-vertical"></i>
                                      </Dropdown.Toggle>
                                      <Dropdown.Menu align="end" className="dropdown-menu-end p-2" popperConfig={popperConfig}>
                                        <PermissionCheck permissions={['taskboards.update']}>
                                          <Dropdown.Item onClick={() => { handleEditTaskBoard(taskboard.id) }}>Edit</Dropdown.Item>
                                        </PermissionCheck>
                                        <PermissionCheck permissions={['taskboards.delete']}>
                                          <Dropdown.Item onClick={() => { handleRemoveTaskBoard(taskboard.id) }}>Delete</Dropdown.Item>
                                        </PermissionCheck>
                                        <PermissionCheck permissions={['taskboards.update']}>
                                          <Dropdown.Item onClick={() => { showRatingModal(taskboard.id, taskboard.staff_id); }}>Completed</Dropdown.Item>
                                        </PermissionCheck>
                                        {taskboard?.is_tested === 0 &&
                                          <Dropdown.Item onClick={() => { handleTestedTaskBoard(taskboard.id); }}>Tested</Dropdown.Item>
                                        }
                                      </Dropdown.Menu>
                                    </Dropdown>
                                    : ''
                                  }
                                </div>
                                {taskboard?.task_id ?
                                  <>
                                    <p className="dark-1 mb-2 lh-base"><span className="font-weight-medium">Type: </span> {taskboard.task_type === 1 ? 'Site Add-on' : 'Dev'}</p>
                                    <p className="dark-1 mb-2 lh-base"><span className="font-weight-medium">Agency: </span> {taskboard.agency_name}</p>
                                    <p className="dark-1 lh-base"><span className="font-weight-medium">Coordinator: </span>
                                      {taskboard.pc_coordinator.map((pc, pc_index) => (
                                        <span key={`${emp_index}-${index}-${pc_index}`}>{pc_index > 0 ? `, ${pc.name}` : pc.name}</span>
                                      ))}
                                    </p>
                                  </>
                                  :
                                  <p className="dark-1 mb-2 lh-base"><span className="font-weight-medium">Description: </span> {taskboard.custom_task_description}</p>
                                }
                                <div className="d-flex align-items-center justify-content-between">
                                  <div className="d-flex flex-wrap">
                                    <span className="badge rounded-pill  badge-lg badge-warning text-uppercase me-2 mb-1">{moment(new Date(taskboard.created_at)).format("DD MMM")}</span>
                                    {taskboard.hours && <span className="badge rounded-pill  badge-lg badge-info text-uppercase me-2 mb-1">{taskboard.hours} hrs</span>}
                                    {taskboard?.is_tested === 1 && <span className="badge rounded-pill  badge-lg badge-success text-uppercase mb-1">Tested</span>}
                                  </div>
                                </div>
                              </div>

                            ))}
                          </SimpleBar>
                          {/* <Button role="button" onClick={cstShowAddtaskModal} className="btn btn-soft-dark btn-sm"> <i className="icon-add me-1"></i> <span>Assign Task </span> </Button> */}
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
                    <Col lg={6}>
                      <Form.Label className="form-label-sm">Agency<span className='validation-required-direct'></span></Form.Label>
                      <Select styles={customStyles} classNamePrefix="react-select" className={`custom-select ${formErrors.agencyInput && 'is-react-select-invalid'}`} options={agencyListForAssign} onChange={handleAgencyForAssignSelect}
                        value={agencyListForAssign.filter(function (option) {
                          return option.value === agencyForAssign;
                        })} />
                      {formErrors.agencyInput && (
                        <span className="text-danger">{formErrors.agencyInput}</span>
                      )}
                    </Col>
                    <Col lg={6}>
                      <Form.Label className="form-label-sm">QA<span className='validation-required-direct'></span></Form.Label>
                      <Select styles={customStyles} classNamePrefix="react-select" className={`custom-select ${formErrors.developerInput && 'is-react-select-invalid'}`} options={developerOption} onChange={handleDeveloperSelect}
                        value={developerOption.filter(function (option) {
                          return option.value === developer;
                        })} />
                      {formErrors.developerInput && (
                        <span className="text-danger">{formErrors.developerInput}</span>
                      )}
                    </Col>
                    {taskBoardId > 0 ?
                      <Col lg={12}>
                        <Form.Label className="form-label-sm">Task<span className='validation-required-direct'></span></Form.Label>
                        <Dropdown className="category-dropdown w-100 project-drop-down">
                          <Dropdown.Toggle as="span" bsPrefix="dropdown-custom-toggle" className={`dark-3 font-weight-medium font-14 cursor-pointer d-block ${formErrors.taskInput && 'is-dropdown-invalid'}`} id="selectAgency">{selectedTask.name ? selectedTask.name : 'Select Task'}</Dropdown.Toggle>
                          <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2 w-100">
                            <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                              <div className="search-box w-100">
                                <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                  <i className='icon-serach'></i>
                                  <input type="search" className="form-control border-0" placeholder="Search Task..." value={taskSearch} onChange={(e) => handleTaskSearch(e.target.value)} />
                                </div>
                              </div>
                            </Dropdown.Header>
                            <SimpleBar className="dropdown-body">
                              <Dropdown.Item as="li" key={-1}>
                                <Form.Check className="m-0 form-check-sm">
                                  <Form.Check.Input type="radio" name="categoryRadio" id={`agency-radio-custom`} checked={selectedTask.id === 0} onChange={handleTaskRadioChange} value={0} />
                                  <Form.Check.Label htmlFor={`agency-radio-custom`}>Custom Task <div className="font-12 dark-5 d-flex justify-content-between font-weight-normal mt-1"></div></Form.Check.Label>
                                </Form.Check>
                              </Dropdown.Item>
                              {taskListForFilter.map((task_drp, index) => (
                                <Dropdown.Item as="li" key={index}>
                                  <Form.Check className="m-0 form-check-sm">
                                    <Form.Check.Input type="radio" name="categoryRadio" id={`agency-radio-${index}`} checked={task_drp.id === selectedTask.id} onChange={handleTaskRadioChange} value={task_drp.id} />
                                    <Form.Check.Label htmlFor={`agency-radio-${index}`}>{task_drp.name} <div className="font-12 dark-5 d-flex font-weight-normal mt-1"><div className="col-4"><strong className="font-weight-semibold">Task Type:</strong> {task_drp.task_type === 0 ? 'Dev' : 'Site Addons'}</div>
                                      {task_drp.pc_coordinator.length > 0 &&
                                        <div className="col-4"><strong className="font-weight-semibold">PC: </strong>
                                          {task_drp.pc_coordinator.map((pc, pc_index) => (
                                            <p className='d-inline' key={`${index}-${index}-${pc_index}`}>{pc_index > 0 ? `, ${pc.name}` : pc.name}</p>
                                          ))}
                                        </div>
                                      }
                                      {task_drp.emp_name &&
                                        <div className="col-4 text-primary"><strong className="font-weight-semibold">Assigned To: </strong><p className="d-inline">{task_drp.emp_name}</p></div>
                                      }
                                    </div></Form.Check.Label>
                                  </Form.Check>
                                </Dropdown.Item>
                              ))}
                            </SimpleBar>
                          </Dropdown.Menu>
                        </Dropdown>
                        {formErrors.taskInput && (
                          <span className="text-danger">{formErrors.taskInput}</span>
                        )}
                      </Col>
                      :
                      <Col lg={12}>
                        <Form.Label className="form-label-sm">Task<span className='validation-required-direct'></span></Form.Label>
                        <Dropdown className="category-dropdown w-100 project-drop-down">
                          <Dropdown.Toggle as="span" bsPrefix="dropdown-custom-toggle" className={`dark-3 font-weight-medium font-14 cursor-pointer d-block ${formErrors.taskInput && 'is-dropdown-invalid'}`} id="selectAgency">
                            {selectedTask.length > 1 ? `${selectedTask.length} Task selected`
                              :
                              selectedTask.length > 0 ? selectedTask[0].name : 'Select Task'
                            }
                          </Dropdown.Toggle>
                          <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2 w-100">
                            <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                              <div className="search-box w-100">
                                <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                  <i className='icon-serach'></i>
                                  <input type="search" className="form-control border-0" placeholder="Search Task..." value={taskSearch} onChange={(e) => handleTaskSearch(e.target.value)} />
                                </div>
                              </div>
                            </Dropdown.Header>
                            <SimpleBar className="dropdown-body">
                              <Dropdown.Item as="li" key={-1}>
                                <Form.Check className="m-0 form-check-sm">
                                  <Form.Check.Input type="checkbox" name="agency-radio-name" id={`agency-radio-custom`} checked={selectedTask.some((data) => data.id === 0)} onChange={handleTaskRadioChangeForMultiple} value={0} />
                                  <Form.Check.Label htmlFor={`agency-radio-custom`}>Custom Task <div className="font-12 dark-5 d-flex justify-content-between font-weight-normal mt-1"></div></Form.Check.Label>
                                </Form.Check>
                              </Dropdown.Item>
                              {taskListForFilter.map((task_drp, index) => (
                                <Dropdown.Item as="li" key={index}>
                                  <Form.Check className="m-0 form-check-sm">
                                    <Form.Check.Input type="checkbox" name={`agency-radio-name-${index}`} id={`agency-radio-${index}`} checked={selectedTask.some((data) => data.id === task_drp.id)} disabled={selectedTask.some((data) => data.id === 0)} onChange={handleTaskRadioChangeForMultiple} value={task_drp.id} />
                                    <Form.Check.Label htmlFor={`agency-radio-${index}`}>{task_drp.name} <div className="font-12 dark-5 d-flex font-weight-normal mt-1"><div className="col-4"><strong className="font-weight-semibold">Task Type:</strong> {task_drp.task_type === 0 ? 'Dev' : 'Site Addons'}</div>
                                      {task_drp.pc_coordinator.length > 0 &&
                                        <div className="col-4"><strong className="font-weight-semibold">PC: </strong>
                                          {task_drp.pc_coordinator.map((pc, pc_index) => (
                                            <p className='d-inline' key={`${index}-${index}-${pc_index}`}>{pc_index > 0 ? `, ${pc.name}` : pc.name}</p>
                                          ))}
                                        </div>
                                      }
                                      {task_drp.emp_name &&
                                        <div className="col-4 text-primary"><strong className="font-weight-semibold">Assigned To: </strong><p className="d-inline">{task_drp.emp_name}</p></div>
                                      }
                                    </div></Form.Check.Label>
                                  </Form.Check>
                                </Dropdown.Item>
                              ))}
                            </SimpleBar>
                          </Dropdown.Menu>
                        </Dropdown>
                        {formErrors.taskInput && (
                          <span className="text-danger">{formErrors.taskInput}</span>
                        )}
                      </Col>
                    }
                    {selectedTask.length === 1 ?
                      selectedTask[0].id === 0 &&
                      <Col lg={12}>
                        <Form.Label className="form-label-sm">Description<span className='validation-required-direct'></span></Form.Label>
                        <Form.Control as='textarea' placeholder="Description" value={taskDescription} onChange={(e) => { setTaskDescription(e.target.value) }} />
                        {formErrors.taskDescriptionInput && (
                          <span className="text-danger">{formErrors.taskDescriptionInput}</span>
                        )}
                      </Col>
                      : selectedTask.id === 0 &&
                      <Col lg={12}>
                        <Form.Label className="form-label-sm">Description<span className='validation-required-direct'></span></Form.Label>
                        <Form.Control as='textarea' placeholder="Description" value={taskDescription} onChange={(e) => { setTaskDescription(e.target.value) }} />
                        {formErrors.taskDescriptionInput && (
                          <span className="text-danger">{formErrors.taskDescriptionInput}</span>
                        )}
                      </Col>
                    }
                    <Col lg={12}>
                      <p className='mb-1'><b>Note: </b>15 mins = 0.25, 30 mins = 0.50, 45 mins = 0.75, hour = 1,2,3</p>
                      <Row>
                        <Col lg={6}>
                          <Form.Label className="form-label-sm">Hours</Form.Label>
                          <Form.Control type="number" step="any" placeholder="Add Hours" value={hours} onChange={(e) => { setHours(e.target.value) }} />
                        </Col>
                        {userData?.role_code === databaseRoleCode.adminCode &&
                          <Col lg={6}>
                            <Form.Label className="form-label-sm">Priority</Form.Label>
                            <Form.Control type="number" placeholder="Priority" value={priority} onChange={(e) => { setPriority(e.target.value) }} />
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
              <h3 className="mb-0">Manage QA</h3>
            </div>
            <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={msCloseManageStaffSidebar}>
              <i className="icon-cancel"></i>
            </button>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">
            <SimpleBar className="offcanvas-inner">
              <div className="p-6">
                <Accordion defaultActiveKey={['0', '1']} alwaysOpen className="dashboard-accordion">
                  <Accordion.Item eventKey="0">
                    <Accordion.Header as="h4">Active Staff</Accordion.Header>
                    <DragDropContext onDragEnd={onDragEndDrop}>
                      <Accordion.Body>
                        <Droppable droppableId="droppable">
                          {(provided, snapshot) => (
                            <div className="staff-list" ref={provided.innerRef} {...provided.droppableProps}>
                              {staffForManage?.active_developer?.map((staff, staff_index) => (
                                <Draggable draggableId={`${staff_index}`} key={staff_index} index={staff_index}>
                                  {(provided) => (
                                    <div className="staff-detail border border-gray-100 rounded-6" ref={provided.innerRef} {...provided.draggableProps} key={staff_index} data-p={staff.priority}>
                                      <div className="move-cell" {...provided.dragHandleProps}><div className="move-icon"><img src={MoveIcon} alt="Drop" /></div></div>
                                      <span>{staff.name}</span>
                                      <Form.Check type="switch" checked={true} onChange={(e) => { handleStaffActiveDeactive(staff.staffid, e) }} />
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            </div>
                          )}
                        </Droppable>
                      </Accordion.Body>
                    </DragDropContext>
                  </Accordion.Item>
                  <Accordion.Item eventKey="1">
                    <Accordion.Header as="h4">Deactive Staff</Accordion.Header>
                    <Accordion.Body>
                      <div className="staff-list">
                        {staffForManage?.deactive_developer?.map((staff, staff_index) => (
                          <div className="staff-detail border border-gray-100 rounded-6 position-relative" key={staff_index}>
                            <span>{staff.name}</span>
                            <Form.Check type="switch" checked={false} onChange={(e) => { handleStaffActiveDeactive(staff.staffid, e) }} />
                          </div>
                        ))}
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </div>
            </SimpleBar>
          </Offcanvas.Body>
        </Offcanvas>
        <RateCompleteTaskQA ratingCompleteShow={ratingCompleteShow} setShowRatingCompleteModal={setShowRatingCompleteModal} taskBoardId={taskBoardId} setTaskBoardId={setTaskBoardId} taskBoardUserId={taskBoardUserId} setTaskBoardUserId={setTaskBoardUserId} userData={userData} reloadTaskboard={reloadTaskboard} setReloadTaskboard={setReloadTaskboard} />
        <Footer />
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
  userData: state.Auth.user
})

export default connect(mapStateToProps)(QABoard)