import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Col, Row, Modal, Button, Form, Dropdown, Offcanvas, Accordion, Spinner } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import APIService from "../../api/APIService";
import Select from 'react-select';
//import moment from 'moment';
import { connect } from "react-redux";
import { getTaskboardHappyStatus, check } from "../../utils/functions.js";
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import { DELETE_TASKBOARD } from '../../modules/lang/Taskboard';
import { databaseRoleCode, taskboardClientHappyStatus, popperConfig, pcHeadId } from '../../settings';
import { filterDropdownOptionByAgencyName } from "../../utils/functions.js";
import { validateForm } from "../../utils/validator.js";
import { TaskboardValidator } from "../../modules/validation/TaskboardValidator";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import MoveIcon from "../../assets/img/icons/move.svg";
import RateCompleteTask from './RateCompleteTask';
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import { Link } from "react-router-dom";

function Taskboard({ userData, name }) {
  const [showAddtaskModal, setShowAddtaskModal] = useState(false);
  const [taskBoardData, setTaskBoardData] = useState([]);
  const [taskBoardId, setTaskBoardId] = useState(0);
  const [taskBoardUserId, setTaskBoardUserId] = useState(0);
  const [designation, setDesignation] = useState(0);
  const [designationOption, setDesignationOption] = useState([]);
  const [projectManager, setProjectManager] = useState(0);
  const [projectManagerOption, setProjectManagerOption] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [refreshDesign, setRefreshDesign] = useState(false);
  const [reloadTaskboard, setReloadTaskboard] = useState(false);
  const [reloadStaffList, setReloadStaffList] = useState(false);
  const [refreshAgencyPlan, setRefreshAgencyPlan] = useState(false);
  const [agency, setAgency] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [agencyList, setAgencyList] = useState([]);
  const [agencyListForFilter, setAgencyListForFilter] = useState([]);
  const [developer, setDeveloper] = useState('');
  const [developerOption, setDeveloperOption] = useState([]);
  const [staffForManage, SetStaffForManage] = useState([]);
  const [clientHappyStatus, setClientHappyStatus] = useState('happy');
  const [hours, setHours] = useState('');
  const [addOnHours, setAddOnHours] = useState('');
  const [priority, setPriority] = useState('');
  const [saveProcess, setSaveProcess] = useState(false);
  const [formErrors, setFormErrors] = useState([]);
  const [showAgencyFields, setShowAgencyFields] = useState(true);
  const [agencySearch, setAgencySearch] = useState('');
  const [taskType, setTaskType] = useState('');
  const [taskTypeList, setTaskTypeList] = useState([]);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const dropdownRef = useRef();
  const [bucketHours, setBucketHours] = useState('');
  const [planName, setPlanName] = useState('');

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
  
  const [isEditTaskBoardView, setIsEditTaskBoardView] = useState(false);

  useEffect(() => {
    
    if(isOpenFilter){
      APIService.getDesignationList()
        .then((response) => {
          if (response.data?.status) {
            let newDesignationList = response.data?.data.map(item => {
              return { label: item.name, value: item.id }
            });
            setDesignationOption([{ label: 'All Designation', value: 0 }, ...newDesignationList]);
          }
        });

      APIService.getAllMembers(`?role_code=project_manager`)
        .then((response) => {
          if (response.data?.status) {
            let newStaffList = response.data?.data?.map(item => {
              return { label: item.name, value: item.id }
            });
            setProjectManagerOption([{ label: 'All Project Manager', value: 0 }, ...newStaffList]);
          }
        });

      setTaskTypeList([{ label: 'All', value: '' }, { label: 'Dev', value: 'hours' }, { label: 'Site Addons', value: 'addon_hours' }]);
    }
  }, [isOpenFilter]);

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

  useEffect(() => {
    if(showManageStaffSidebar || showAddtaskModal){
      APIService.getManageEmploye()
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
    if(showAddtaskModal && !isEditTaskBoardView){
      APIService.getAllAgencyWithPlan()
      .then((response) => {
        if (response.data?.status) {
          setAgencyList(response.data?.data);
          setAgencyListForFilter(response.data?.data);
        }
      });
    }
  }, [refreshAgencyPlan, showAddtaskModal]);

  useEffect(() => {
    const timer = setTimeout(() => {
      let params = "?";
      params = params + "sort=asc&limit=1000&page=1&sort_by=created_at";
      if (projectManager !== 0) {
        params = params + "&coordinator=" + projectManager;
      }
      if (designation !== 0) {
        params = params + "&designation=" + designation;
      }
      if (searchFilter !== '') {
        params = params + "&search=" + searchFilter;
      }
      if (taskType !== '') {
        params = params + "&card_type=" + taskType;
      }

      APIService.getTaskBoardList(params)
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
  }, [projectManager, designation, searchFilter, reloadTaskboard, taskType]);

  useEffect(() => {

  }, [refreshDesign]);

  const handleDesignationSelect = (selectedDesignation) => {
    setDesignation(selectedDesignation?.value);
    // setIsOpenFilter(false);
  };

  const handleProjectManagerSelect = (selectedPc) => {
    setProjectManager(selectedPc?.value);
    // setIsOpenFilter(false);
  };

  const handleAgencySearch = (value) => {
    setAgencySearch(value);
    filterDropdownOptionByAgencyName(agencyList, value, setAgencyListForFilter);
  }
  
  const handleAgencyRadioChange = (e) => {
    handleAgencySearch('');
    let agency_id = parseInt(e.target.value);
    if (agency_id === 0) {
      setAgency({ id: 0, name: 'Custom', current_plan: '' });
    }
    else if (agency_id > 0) {
      let agency_name = '';
      let current_plan = 'none';
      let agency_plan_name = '';
      let selectedAgency = agencyList.filter(function (arr) { return arr.id === agency_id; });
      if (selectedAgency.length > 0) {
        agency_name = selectedAgency[0].agency_name;
        current_plan = selectedAgency[0].current_plan;
        agency_plan_name = selectedAgency[0].plan_name;
      }
      setAgency({ id: agency_id, name: agency_name, current_plan: current_plan });
      setHours('');
      setAddOnHours('');
      setBucketHours('');
      setPlanName(agency_plan_name);
    }
    else {
      setAgency('');
      setPlanName('');
    }
  }

  const handleDeveloperSelect = (selectedDeveloper) => {
    setDeveloper(selectedDeveloper?.value);
  };

  const handleClientHappyStatusSelect = (e) => {
    setClientHappyStatus(e.target.value);
  };

  const addNewCard = async (staff_id) => {
    setDeveloper(staff_id);    
    cstShowAddtaskModal();
  };

  const handleRemoveTaskBoard = (id) => {
    confirmAlert({
      title: 'Confirm',
      message: DELETE_TASKBOARD,
      buttons: [
        {
          label: 'Yes',
          className: 'btn btn-primary btn-lg',
          onClick: () => {
            let params = {};
            params["id"] = id;
            APIService.removeTaskboard(params)
              .then((response) => {
                if (response.data?.status) {
                  let newTaskboard = taskBoardData?.taskboard_lists?.filter(function (arr) {
                    return arr.id !== id;
                  });
                  let newData = taskBoardData;
                  newData['taskboard_lists'] = newTaskboard;
                  setTaskBoardData(newData);
                  setRefreshDesign(!refreshDesign);
                  setRefreshAgencyPlan(!refreshAgencyPlan);
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
    setAgency('');
    setAgencyName('');
    setShowAgencyFields(true);
    setDeveloper('');
    setClientHappyStatus('happy');
    setHours('');
    setAddOnHours('');
    setPriority('');
    setIsEditTaskBoardView(false);
    setBucketHours('');
    setPlanName('');
    setFormErrors('');
  }

  const handleEditTaskBoard = async (id) => {
    clearControl();
    setTaskBoardId(id);
    setShowAgencyFields(false);
    setIsEditTaskBoardView(true);

    APIService.getTaskBoardForEdit(id)
      .then((response) => {
        if (response?.data?.status) {
          let data = response?.data?.data;
          // setStartDate(moment(data?.start_date)._d);
          // setEndDate(moment(data?.end_date)._d);

          let current_plan = data?.current_plan ? data?.current_plan : 'none';    
          setAgency({ id: data?.agency_id, name: data?.agency_name, current_plan: current_plan });

          if (data.agency_id === 0) {
            setAgencyName(data.agency_name);
          }
          setDeveloper(data?.staff_id);
          setClientHappyStatus(data?.happy_status);
          setHours(data?.hours);
          setAddOnHours(data?.addon_hours);
          setPriority(data?.priority_order);
          setBucketHours(data?.bucket_hours);
          cstShowAddtaskModal();   
          setPlanName(data?.agency_plan_name);
        }
    });      
  };
  
  const addTaskboardCard = async () => {
    setSaveProcess(true);
    setFormErrors([]);
    let validate = validateForm((TaskboardValidator(
      taskBoardId > 0 ? 'not required' : agency.name ? agency.name : '', 
      developer, clientHappyStatus, 
      agency?.id === 0 ? agencyName : 'not required',       
    )));
         
    if (Object.keys(validate).length) {
      setSaveProcess(false);
      setFormErrors(validate);    
    }else if (agency && ((agency.current_plan.includes('dev') || agency.current_plan.includes('bucket')) && agency.current_plan.includes('addons')) && (!hours && !bucketHours && !addOnHours)) {      
      setSaveProcess(false);
      setFormErrors({ commanHoursInput: 'Either hours or bucket hours or addon hours field is required.' });
    }else if (agency && (agency.current_plan.includes('dev') || agency.current_plan.includes('bucket')) && !agency.current_plan.includes('addons') && (!hours && !bucketHours)) {      
      setSaveProcess(false);
      setFormErrors({ commanHoursInput: 'Either hours or bucket hours field is required.' });
    }else if (agency && agency.current_plan.includes('addons') && !(agency.current_plan.includes('dev') || agency.current_plan.includes('bucket')) && (!addOnHours)) {      
      setSaveProcess(false);
      setFormErrors({ commanHoursInput: 'The addon hours field is required.' });
    }  
    else {
      const params = {};
      if (taskBoardId > 0) {
        params['id'] = taskBoardId;
        params['staff_id'] = developer;
        params['hours'] = hours;
        params['addon_hours'] = addOnHours;
        params['bucket_hours'] = bucketHours;
        params['happy_status'] = clientHappyStatus;
        params['priority_order'] = priority;
        params['agency_plan_name'] = planName;
        APIService.updateTaskboardCard(params)
          .then((response) => {
            if (response.data?.status) {
              toast.success(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
              setSaveProcess(false);
              cstSetCloseAddtaskModal();
              setReloadTaskboard(!reloadTaskboard);
              setRefreshAgencyPlan(!refreshAgencyPlan);
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
        if (agency?.id === 0) {
          params['agency_id'] = 0;
          params['agency_name'] = agencyName;
        }
        else {
          params['agency_id'] = agency.id ? agency.id : 0;
          params['agency_name'] = agency.name ? agency.name : '';
        }
        params['staff_id'] = developer;
        params['hours'] = hours;
        params['addon_hours'] = addOnHours;
        params['bucket_hours'] = bucketHours;
        params['happy_status'] = clientHappyStatus;
        params['priority_order'] = priority;
        params['agency_plan_name'] = planName;
        APIService.addTaskboardCard(params)
          .then((response) => {
            if (response.data?.status) {
              toast.success(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
              setSaveProcess(false);
              cstSetCloseAddtaskModal();
              setReloadTaskboard(!reloadTaskboard);
              setRefreshAgencyPlan(!refreshAgencyPlan);
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

    APIService.setStaffListPriority(params)
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

    APIService.setStaffListPriority(params)
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
    setDesignation(0);
    setProjectManager(0);
    setTaskType('');
    setIsOpenFilter(false);
    setIsEditTaskBoardView(false);
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

  const handleTaskTypeSelect = (selected) => {
    setTaskType(selected?.value);
    // setIsOpenFilter(false);
  };

  const toggleFilterDropdown = () => {
    setIsOpenFilter(!isOpenFilter);
  };

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Header pagename={name ? name : ''}  headerFilterButton={<Button onClick={filterhandleShow} variant="outline-secondary" size="md" type="button" className='ms-auto d-xl-none d-block'>Filter <i className="icon-filter ms-2"></i></Button>}/>
        <div className="inner-content py-0 px-0">
          <div className='taskboard-page'>
            {check(['taskboards.create'], userData?.role.getPermissions) &&
              <>
                <div className="bg-white py-3 px-4 px-lg-7 taskboard-header page-inner-header">
                  <Row className="g-2 align-items-center">
                    <Col className="col-6 col-sm-auto">
                      <Button variant="primary" size='md' className='w-100' onClick={msShowManageStaffSidebar}>Manage Staff</Button>
                    </Col>
                    {userData?.role_code === databaseRoleCode.adminCode || userData?.designation === pcHeadId ?
                      <Col className="col-6 col-sm-auto">
                        <Link to='/staff-rating' className='btn btn-outline-secondary btn-md w-100' target='_blank'>Staff Rating</Link>
                      </Col> : ''
                    }
                    {userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.accountantCode ||userData?.designation === pcHeadId  ?
                      <Col className="col-6 col-sm-auto">
                        <Link to='/taskboard-hours-report' className='btn btn-outline-secondary btn-md w-100 px-2 px-sm-5' target='_blank'>Agency Hourly Report</Link>
                      </Col> : ''
                    }
                    {userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.accountantCode || userData?.designation === pcHeadId ?
                      <Col className="col-6 col-sm-auto">
                        <Link to='/taskboard-staff-hours-report' className='btn btn-outline-secondary btn-md w-100' target='_blank'>Staff Hourly Report</Link>
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
                            <h5 className='m-0'>Taskboard Filter</h5>
                            <Button variant="outline-secondary" size='sm' className="ms-auto" onClick={() => { handleClearFilter() }}>Clear Filter</Button>
                          </Dropdown.Header>
                              <div className='p-4'>
                                <div className='mb-4'>
                                    <Select styles={customStyles}   className="control-md custom-select" classNamePrefix="react-select" options={designationOption} onChange={handleDesignationSelect}
                                  value={designationOption.filter(function (option) {
                                    return option.value === designation;
                                  })} />
                                </div>
                                <div className='mb-4'>
                                <Select  styles={customStyles} className="control-md custom-select" classNamePrefix="react-select" options={projectManagerOption} onChange={handleProjectManagerSelect}
                                  value={projectManagerOption.filter(function (option) {
                                    return option.value === projectManager;
                                  })} />
                                </div>
                                <div>
                                  <Select styles={customStyles} className="control-md custom-select" classNamePrefix="react-select" options={taskTypeList} onChange={handleTaskTypeSelect}
                                    value={taskTypeList.filter(function (option) {
                                      return option.value === taskType;
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
                          <Select styles={customStyles} className="control-md custom-select" options={designationOption} onChange={handleDesignationSelect}
                            value={designationOption.filter(function (option) {
                              return option.value === designation;
                            })} />
                        </Col>
                        <Col xs="12">
                          <Select styles={customStyles} className="control-md custom-select" options={projectManagerOption} onChange={handleProjectManagerSelect}
                            value={projectManagerOption.filter(function (option) {
                              return option.value === projectManager;
                            })} />
                        </Col>
                        <Col xs="12">
                          <Select styles={customStyles} className="control-md custom-select" options={taskTypeList} onChange={handleTaskTypeSelect}
                            value={taskTypeList.filter(function (option) {
                              return option.value === taskType;
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
                              {!emp.leave_status && (!taskType && !projectManager && !designation && !searchFilter) ?
                                emp.available_hours !== 0 && emp.available_hours > 0 ? <span className="text-success ms-2"> Available Hours: {emp.available_hours}</span>
                                : emp.available_hours < 0 ? <span className="text-danger ms-2"> Available Hours: {emp.available_hours}</span> : <span className="text-danger ms-2">Full</span> 
                                : ''
                              }
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
                                    <p className="dark-1 mb-2 lh-base"><span className="font-weight-medium">Agency:</span> {taskboard.agency_name}</p>
                                  </div>
                                  {check(['taskboards.update', 'taskboards.delete'], userData?.role.getPermissions) &&
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
                                      </Dropdown.Menu>
                                    </Dropdown>
                                  }
                                </div>
                                <p className="dark-1 mb-2 lh-base"><span className="font-weight-medium">Plan Name:</span> {taskboard.plan_name}</p>
                                <p className="dark-1 lh-base"><span className="font-weight-medium">Coordinator: </span>
                                  {taskboard.pc_coordinator.map((pc, pc_index) => (
                                    <span key={`${emp_index}-${index}-${pc_index}`}>{pc_index > 0 ? `, ${pc.name}` : pc.name}</span>
                                  ))}
                                </p>
                                <div className="d-flex align-items-center justify-content-between">
                                  <div className="d-flex flex-wrap">
                                    {/* <span className="badge rounded-pill  badge-lg badge-warning text-uppercase me-2 mb-1">{moment(new Date(taskboard.created_at)).format("DD MMM")}</span> */}
                                    <span className="badge rounded-pill  badge-lg badge-warning text-uppercase me-2 mb-1">{taskboard.display_date}</span>
                                    {taskboard.hours && <span className="badge rounded-pill  badge-lg badge-info text-uppercase me-2 mb-1">{taskboard.hours} hrs</span>}

                                    {taskboard?.bucket_hours && <span className="badge rounded-pill  badge-lg badge-info text-uppercase me-2 mb-1">Bucket: {taskboard?.bucket_hours} hrs</span>}

                                    {taskboard.addon_hours && <span className="badge rounded-pill  badge-lg badge-danger text-uppercase mb-1">Site Addons : {taskboard.addon_hours} hrs</span>}
                                  </div>
                                  <>{getTaskboardHappyStatus(taskboard.happy_status)}</>
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
                    {showAgencyFields ?
                      <Col lg={12}>
                        <Form.Label className="form-label-sm">Agency<span className='validation-required-direct'></span></Form.Label>
                        <Dropdown className="category-dropdown w-100 project-drop-down">
                          <Dropdown.Toggle as="span" bsPrefix="dropdown-custom-toggle" className={`dark-3 font-weight-medium font-14 cursor-pointer d-block ${formErrors.agencyInput && 'is-dropdown-invalid'}`} id="selectAgency">{agency.name ? agency.name : 'Select Agency'}</Dropdown.Toggle>
                          <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2 w-100">
                            <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                              <div className="search-box w-100">
                                <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                  <i className='icon-serach'></i>
                                  <input type="search" className="form-control border-0" placeholder="Search Agency..." value={agencySearch} onChange={(e) => handleAgencySearch(e.target.value)} />
                                </div>
                              </div>
                            </Dropdown.Header>
                            <SimpleBar className="dropdown-body">
                              <Dropdown.Item as="li">
                                <Form.Check className="m-0 form-check-sm">
                                  <Form.Check.Input type="radio" name="categoryRadio" id="agency-radio-custom" checked={agency.id === 0} onChange={handleAgencyRadioChange} value={0} />
                                  <Form.Check.Label htmlFor="agency-radio-custom">Custom </Form.Check.Label>
                                </Form.Check>
                              </Dropdown.Item>
                              {agencyListForFilter.map((agency_drp, index) => (
                                <Dropdown.Item as="li" key={index}>
                                  <Form.Check className="m-0 form-check-sm">
                                    <Form.Check.Input type="radio" name="categoryRadio" id={`agency-radio-${index}`} checked={agency.id === agency_drp.id} onChange={handleAgencyRadioChange} value={agency_drp.id} />
                                    <Form.Check.Label htmlFor={`agency-radio-${index}`}>{agency_drp.agency_name} <div className="font-12 dark-5 d-flex justify-content-between font-weight-normal mt-1"><div className="col-4"><strong className="font-weight-semibold">Plan:</strong> {agency_drp.plan_name}</div> <div className="col-4"><strong className="font-weight-semibold">Dev Total Hours: </strong>{agency_drp.total_hours}</div> <div className="col-4"><strong className="font-weight-semibold">Dev Remaining hours: </strong>{agency_drp.remaining_hours}</div></div></Form.Check.Label>
                                  </Form.Check>
                                </Dropdown.Item>
                              ))}
                            </SimpleBar>
                          </Dropdown.Menu>
                        </Dropdown>
                        {formErrors.agencyInput && (
                          <span className="text-danger">{formErrors.agencyInput}</span>
                        )}
                      </Col>
                      :
                      <Col lg={12}>
                        <Form.Label className="form-label-sm">Agency</Form.Label>
                        <Form.Control type="text" value={agency?.name || ''} disabled />
                      </Col>
                    }
                    {agency?.id === 0 && showAgencyFields &&
                      <Col lg={12}>
                        <Form.Label className="form-label-sm">Agency Name<span className='validation-required-direct'></span></Form.Label>
                        <Form.Control placeholder="Agency Name" value={agencyName} onChange={(e) => { setAgencyName(e.target.value) }} className={`${formErrors.agencyNameInput && 'is-invalid'}`} />
                        {formErrors.agencyNameInput && (
                          <span className="text-danger">{formErrors.agencyNameInput}</span>
                        )}
                      </Col>
                    }
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
                    
                    {(agency?.id === 0) || (agency === '') || (agency && agency.current_plan.includes('bucket')) || (agency && agency.current_plan.includes('dev')) || (agency && agency.current_plan.includes('addons')) ?
                      <Col lg={12}>
                        <p className='mb-1'><b>Note: </b>15 mins = 0.25, 30 mins = 0.50, 45 mins = 0.75, hour = 1,2,3</p>
                        <Row>
                          {(agency?.id === 0) || (agency === '') || (agency && agency.current_plan.includes('bucket')) || (agency && agency.current_plan.includes('dev')) ?
                            <>
                              <Col lg={4}>
                                <Form.Label className="form-label-sm">Hours</Form.Label>
                                <Form.Control type="number" step="any" placeholder="Add Hours" value={hours} onChange={(e) => { setHours(e.target.value) }} />                               
                              </Col>   
                              
                              <Col lg={4}>
                                <Form.Label className="form-label-sm">Bucket Hours</Form.Label>
                                <Form.Control type="number" step="any" placeholder="Add Bucket Hours" value={bucketHours} onChange={(e) => { setBucketHours(e.target.value) }} />
                              </Col>
                              {formErrors.hoursOrBucketHoursInput && (
                                  <span className="text-danger">{formErrors.hoursOrBucketHoursInput}</span>
                              )}
                            </>
                            : ''
                          }
                          {(agency?.id === 0) || (agency === '') || (agency && agency.current_plan.includes('addons')) ?
                          <>
                            <Col lg={4}>
                              <Form.Label className="form-label-sm">Site Addons Hours</Form.Label>
                              <Form.Control type="number" step="any" placeholder="Add Site Addons Hours" value={addOnHours} onChange={(e) => { setAddOnHours(e.target.value) }} />
                            </Col>
                          </>
                            : ''}
                          {formErrors.commanHoursInput && (
                              <span className="text-danger">{formErrors.commanHoursInput}</span>
                          )}
                        </Row>
                      </Col>
                      : ''}
                    {userData?.role_code === databaseRoleCode.adminCode &&
                      <Col lg={6}>
                        <Form.Label className="form-label-sm">Priority</Form.Label>
                        <Form.Control type="number" placeholder="Priority" value={priority} onChange={(e) => { setPriority(e.target.value) }} />
                      </Col>
                    }
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
        <RateCompleteTask ratingCompleteShow={ratingCompleteShow} setShowRatingCompleteModal={setShowRatingCompleteModal} taskBoardId={taskBoardId} setTaskBoardId={setTaskBoardId} taskBoardUserId={taskBoardUserId} setTaskBoardUserId={setTaskBoardUserId} userData={userData} reloadTaskboard={reloadTaskboard} setReloadTaskboard={setReloadTaskboard} />
        <Footer />
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
  userData: state.Auth.user
})

export default connect(mapStateToProps)(Taskboard)