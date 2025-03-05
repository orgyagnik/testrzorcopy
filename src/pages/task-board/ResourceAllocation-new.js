import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Col, Row, Modal, Card, Button, Form, Dropdown, Offcanvas, Accordion, Spinner, Badge } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import APIService from "../../api/APIService";
import Select from 'react-select';
import { connect } from "react-redux";
import { check } from "../../utils/functions.js";
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import { DELETE_TASKBOARD, DONE_CUSTOM_TASKBOARD } from '../../modules/lang/Taskboard';
import { databaseRoleCode, popperConfig, taskboardClientHappyStatus, ResourceAllocationEditAccessIds } from '../../settings';
import { filterDropdownOptionByAgencyName } from "../../utils/functions.js";
import { validateForm } from "../../utils/validator.js";
import { ResourceAddValidator } from "../../modules/validation/TaskboardValidator";
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import { format } from 'date-fns';
import moment from 'moment';
import RangeDatePickerControl from '../../modules/custom/RangeDatePickerControl';
import SingleDatePickerControl from '../../modules/custom/SingleDatePicker';

function ResourceAllocation({ userData, name }) {
  const [showAddtaskModal, setShowAddtaskModal] = useState(false);
  const [resourceData, setResourceData] = useState([]);
  const [resourceId, setResourceId] = useState(0);
  const [resourceUserId, setResourceUserId] = useState(0);
  const [designation, setDesignation] = useState(0);
  const [designationOption, setDesignationOption] = useState([]);
  const [projectManager, setProjectManager] = useState(0);
  const [projectManagerOption, setProjectManagerOption] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [refreshDesign, setRefreshDesign] = useState(false);
  const [reloadResource, setReloadResource] = useState(false);
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterStartDate, setFilterStartDate] = useState(moment().startOf('week').add(1, 'day').toDate());
  const [filterEndDate, setFilterEndDate] = useState(moment().endOf('week').subtract(2, 'day').toDate());
  const [isEditable, setIsEditable] = useState(false);

  const cstSetCloseAddtaskModal = () => {
    setShowAddtaskModal(false);
    clearControl();
  }
  const cstShowAddtaskModal = () => setShowAddtaskModal(true);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    APIService.getManageResourceEmployee()
      .then((response) => {
        if (response.data?.status) {
          let newStaffList = response.data?.data?.active_developer?.map(item => {
            return { label: item.name, value: item.staffid }
          });
          SetStaffForManage(response.data?.data);
          setDeveloperOption(newStaffList);
        }
      });

  }, [reloadStaffList]);

  useEffect(() => {
    APIService.getAllAgencyWithPlanForResourceAllocation()
      .then((response) => {
        if (response.data?.status) {
          setAgencyList(response.data?.data);
          setAgencyListForFilter(response.data?.data);
        }
      });
  }, [refreshAgencyPlan]);

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

      if (filterStartDate && filterEndDate) {
          params = params + "&startdate=" + format(filterStartDate, "yyyy-MM-dd");
          params = params + "&enddate=" + format(filterEndDate, "yyyy-MM-dd");
      }

      APIService.getResourceAllocationList(params)
        .then((response) => {
          if (response.data?.status) {
            setResourceData(response.data?.data);
          }
          else {
            setResourceData([]);
          }
        });
    }, 500);
    return () => clearTimeout(timer);
  }, [projectManager, designation, searchFilter, reloadResource, taskType, filterStartDate, filterEndDate]);

  useEffect(() => {

  }, [refreshDesign]);

  const handleDesignationSelect = (selectedDesignation) => {
    setDesignation(selectedDesignation?.value);
    setIsOpenFilter(false);
  };

  const handleProjectManagerSelect = (selectedPc) => {
    setProjectManager(selectedPc?.value);
    setIsOpenFilter(false);
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
      let selectedAgency = agencyList.filter(function (arr) { return arr.id === agency_id; });
      if (selectedAgency.length > 0) {
        agency_name = selectedAgency[0].agency_name;
        current_plan = selectedAgency[0].current_plan;
      }
      setAgency({ id: agency_id, name: agency_name, current_plan: current_plan });
      setHours('');
      setAddOnHours('');
    }
    else {
      setAgency('');
    }
  }

  const handleDeveloperSelect = (selectedDeveloper) => {
    setDeveloper(selectedDeveloper?.value);
  };

  const handleClientHappyStatusSelect = (e) => {
    setClientHappyStatus(e.target.value);
  };

  const addNewCard = (staff_id) => {
    setDeveloper(staff_id);
    cstShowAddtaskModal();
  };

  const handleRemoveResourceAllocation = (id) => {
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
            APIService.removeResourceAllocation(params)
              .then((response) => {
                if (response.data?.status) {
                  let newTaskboard = resourceData?.taskboard_lists?.filter(function (arr) {
                    return arr.id !== id;
                  });
                  let newData = resourceData;
                  newData['taskboard_lists'] = newTaskboard;
                  setResourceData(newData);
                  setRefreshDesign(!refreshDesign);
                  setRefreshAgencyPlan(!refreshAgencyPlan);
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
    setResourceId(0);
    setResourceUserId(0);
    setAgency('');
    setAgencyName('');
    setShowAgencyFields(true);
    setDeveloper('');
    setClientHappyStatus('happy');
    setHours('');
    setAddOnHours('');
    setPriority('');
    setStartDate(moment().add(1, 'weeks').startOf('isoWeek').toDate());
    setEndDate(moment().add(1, 'weeks').endOf('isoWeek').subtract(3, 'days').toDate());    
  }

  const handleEditResourceAllocation = (id) => {
    clearControl();
    setResourceId(id);
    setShowAgencyFields(false);
    let editTaskBoardData = resourceData?.taskboard_lists?.filter(function (arr) {
      return arr.id === id;
    });
    if (editTaskBoardData.length > 0) {
      let data = editTaskBoardData[0];
      setStartDate(moment(data?.start_date)._d);
      setEndDate(moment(data?.end_date)._d);
      let current_plan = 'none';
      let selectedAgency = agencyList.filter(function (arr) { return arr.id === data.agency_id; });
      if (selectedAgency.length > 0) {
        current_plan = selectedAgency[0].current_plan;
      }
      setAgency({ id: data.agency_id, name: data.agency_name, current_plan: current_plan });
      if (data.agency_id === 0) {
        setAgencyName(data.agency_name);
      }
      setDeveloper(data?.staff_id);
      setClientHappyStatus(data?.happy_status);
      setHours(data?.hours);
      setAddOnHours(data?.addon_hours);
      setPriority(data?.priority_order);
      cstShowAddtaskModal();
    }
  };

  const addResourceAllocationCard = async () => {
    setSaveProcess(true);
    setFormErrors([]);
    let validate = validateForm((ResourceAddValidator(resourceId > 0 ? 'not required' : agency.name ? agency.name : '', developer, clientHappyStatus, agency?.id === 0 ? agencyName : 'not required', startDate, endDate)));
    if (Object.keys(validate).length) {
      setSaveProcess(false);
      setFormErrors(validate);
    }
    else {
      const params = {};
      if (resourceId > 0) {
        params['id'] = resourceId;
        params['staff_id'] = developer;
        params['hours'] = hours;
        params['addon_hours'] = addOnHours;
        params['happy_status'] = clientHappyStatus;
        params['priority_order'] = priority; 
        params["start_date"] = format(startDate, "yyyy-MM-dd");
        params["end_date"] = format(endDate, "yyyy-MM-dd");

        APIService.updateResourceAllocationCard(params)
          .then((response) => {
            if (response.data?.status) {
              toast.success(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
              setSaveProcess(false);
              cstSetCloseAddtaskModal();
              setReloadResource(!reloadResource);
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
        params['happy_status'] = clientHappyStatus;
        params['priority_order'] = priority;
        params["start_date"] = format(startDate, "yyyy-MM-dd");
        params["end_date"] = format(endDate, "yyyy-MM-dd");

        APIService.addResourceAllocationCard(params)
          .then((response) => {
            if (response.data?.status) {
              toast.success(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
              setSaveProcess(false);
              cstSetCloseAddtaskModal();
              setReloadResource(!reloadResource);
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

  const handleClearFilter = async (e) => {
    setSearchFilter('');
    setDesignation(0);
    setProjectManager(0);
    setTaskType('');
    setIsOpenFilter(false);
    setFilterStartDate(moment().startOf('week').add(1, 'day').toDate());
    setFilterEndDate(moment().endOf('week').subtract(2, 'day').toDate());
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
    setIsOpenFilter(false);
  };

  const toggleFilterDropdown = () => {
    setIsOpenFilter(!isOpenFilter);
  };

    const handleDoneResourceAllocation = (id) => {
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
                        APIService.doneResourceAllocation(params)
                            .then((response) => {
                                if (response.data?.status) {
                                    let newTaskboard = resourceData?.taskboard_lists?.filter(function (arr) {
                                        return arr.id !== id;
                                    });
                                    let newData = resourceData;
                                    newData['taskboard_lists'] = newTaskboard;
                                    setResourceData(newData);
                                    setReloadResource(!reloadResource);
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

    const onChangeDateRange = dates => {
        const [start, end] = dates;
        setFilterStartDate(start);
        setFilterEndDate(end);
    }

    useEffect(() => {
      const canEditDate = ResourceAllocationEditAccessIds.some(id => id === userData?.id);
      setIsEditable(canEditDate);
      
      setStartDate((moment().add(1, 'weeks').startOf('isoWeek').toDate()));
      setEndDate((moment().add(1, 'weeks').endOf('isoWeek').subtract(3, 'days').toDate()));
      
    }, [isEditable]);

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Header pagename={name ? name : ''}  headerFilterButton={<Button onClick={filterhandleShow} variant="outline-secondary" size="md" type="button" className='ms-auto d-xl-none d-block'>Filter <i className="icon-filter ms-2"></i></Button>}/>
        <div className="inner-content py-0 px-0">
          <div className='weekly-resource-page'>
            {check(['resource_allocation.create'], userData?.role.getPermissions) &&
              <>
                <div className="bg-white py-3 px-4 px-lg-7 taskboard-header page-inner-header">
                  <Row className="g-2 align-items-center">
                    <Col className="col-sm-auto ms-2 font-16 font-weight-medium">
                      {filterStartDate && filterEndDate &&
                        <span>{ filterStartDate ? format(filterStartDate, "dd-MM-yyyy") : ''} to {filterEndDate ? format(filterEndDate, "dd-MM-yyyy") : ''}</span>
                      }
                    </Col>
                    <Col className="d-xl-block d-none col-12 col-xl-4 col-xxl-4 col-xxxl-3 ms-auto ">
                      <div className="search-box w-100">
                        <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                          <span className="icon-serach"></span>
                          <input type="text" className="form-control border-0" placeholder="Search Agency or Employee Name" value={searchFilter} onChange={(e) => { setSearchFilter(e.target.value) }} />
                          <span className='search-clear icon-cancel cursor-pointer p-2 font-12 dark-6' onClick={(e) => { setSearchFilter('') }}></span>
                        </div>
                      </div>
                    </Col>
                    <Col className="d-xl-block d-none col-12 col-xl-4 col-xxl-3">
                      <RangeDatePickerControl
                        selected={filterStartDate}
                        startDate={filterStartDate}
                        endDate={filterEndDate}
                        onChange={onChangeDateRange}
                      />
                    </Col>
                    <Col className="col-12 col-md-auto d-xl-block d-none">
                      <Dropdown show={isOpenFilter} className="taskboard-filter-dropdown" autoClose="outside" ref={dropdownRef}>
                          <Dropdown.Toggle bsPrefix="filter-btn" variant="outline-secondary" size='md' id="dropdown-basic" onClick={toggleFilterDropdown}>
                          Filter <i className="icon-filter ms-2"></i><i className="icon-cancel ms-2"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="down" className="dropdown-menu-end p-0 w-100">
                          <Dropdown.Header className="border-gray-100 border-bottom p-4 d-flex align-items-center">
                            <h5 className='m-0'>Resource Allocation Filter</h5>
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
                        <Col xs="12">                        
                            <RangeDatePickerControl
                              selected={filterStartDate}
                              startDate={filterStartDate}
                              endDate={filterEndDate}
                              onChange={onChangeDateRange}
                            />
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
            <div className="pt-4 pt-lg-5 pt-xl-9 px-0 px-lg-4 px-xl-7">
              <Card className="rounded-10 p-4 p-xl-6">
                <Card.Body className="p-0">
                  <div className="weekly-resource-planing-table-wraper">
                    <table className='weekly-resource-planing-table bg-white table-bordered list-table border-top-0  table'>
                        <thead>
                          <tr>
                            {resourceData?.project_member_list &&
                            <th className='p-0'>
                                <div className='d-flex h-100 w-100'>
                                    <div className='resources-designation d-flex justify-content-between flex-1'>
                                      Resources
                                    </div>
                                    <div className='resources-availability'>
                                      Availability
                                      <br/>
                                      {designation && resourceData?.total_available_hours ?
                                        <Badge pill bg="green-50" className='text-success mt-1 font-12 font-weight-normal py-2 border border-green-200'>{resourceData?.total_available_hours} Hrs</Badge>
                                        :''
                                      }
                                    </div>
                                </div>
                            </th>
                            }
                            {resourceData?.project_member_list &&
                              <>
                                {resourceData?.project_member_list?.map((pr_member, pr_member_index) => (
                                  <th key={`header_${pr_member.staff_id}_${pr_member_index}`}>
                                      {pr_member.fullname} <Badge pill bg="red-50" className='text-danger ms-2 py-1 border border-red-200'>PC</Badge>
                                  </th>
                                ))}
                                <th>
                                  Custom
                                </th>
                              </>
                            }
                            
                           
                          </tr>
                        </thead>
                        <tbody>
                          {resourceData?.employee_lists &&
                            resourceData?.employee_lists?.map((emp, emp_index) => (
                              <tr key={`row_${emp.staff_id}_${emp_index}`}>
                                <td className='p-0'>
                                    <div className='d-flex h-100 w-100'>
                                        <div className='resources-designation d-flex justify-content-between flex-1'>
                                          <span className='me-2'>{emp.fullname}</span>
                                          <PermissionCheck permissions={['resource_allocation.create']}>
                                            <Button variant='primary' className="btn-icon circle-btn ms-auto" onClick={() => addNewCard(emp.staff_id)}> <i className="icon-add"></i></Button>
                                          </PermissionCheck>
                                          
                                        </div>
                                        
                                        <div className='resources-availability'>
                                          {emp.leave_status &&                                             
                                            <Badge pill bg='red-50' className='text-danger border-red-200 font-12 font-weight-normal py-2 border'>{emp.half_leave === 1 ? 'Half Day ' : 'Full Day'}</Badge>   
                                          } 

                                          {!emp.leave_status &&
                                            <Badge pill bg={`${emp.available_hours !== 0 && emp.available_hours > 0 ? 'green-50' : 'red-50'}`} className={`${emp.available_hours !== 0 && emp.available_hours > 0 ? 'text-success border-green-200' : 'text-danger border-red-200'}  font-12 font-weight-normal py-2 border`}>{emp.available_hours} Hrs</Badge>                                            
                                          }
                                        </div>
                                          
                                    </div>
                                </td>
                                          
                                {resourceData?.project_member_list &&
                                  resourceData?.project_member_list?.map((pr_member, pr_member_index) => {
                                    const taskboardData = resourceData?.taskboard_lists?.filter(task => task.staff_id === emp.staff_id && task.pc_id === pr_member.staff_id) || [];

                                    return (
                                      <td key={`data_${emp.staff_id}_${emp_index}_${pr_member_index}`}>
                                        <SimpleBar className="resources-task-card-list">
                                          {taskboardData.map((taskboard, taskboard_index) => (
                                            <div key={taskboard_index} className="inner-card rounded-10 bg-white p-4">
                                              
                                              <div className='d-flex'>
                                                <div className="col-9 me-3">
                                                  <p className="dark-1 mb-2 lh-base"><span className="font-weight-medium">Agency:</span>  {taskboard.agency_name}</p>
                                                </div>
                                                {check(['resource_allocation.update', 'resource_allocation.delete'], userData?.role.getPermissions) &&
                                                  <Dropdown className="ms-auto">
                                                    <Dropdown.Toggle as="a" bsPrefix="d-toggle" className="btn btn-light btn-icon btn-sm shadow-none" id="dropdown-basic">
                                                      <i className="fa-solid fa-ellipsis-vertical"></i>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu align="end" className="dropdown-menu-end p-2" popperConfig={popperConfig}>
                                                      
                                                        
                                                      <PermissionCheck permissions={['resource_allocation.update']}>
                                                        <Dropdown.Item onClick={() => { handleEditResourceAllocation(taskboard.id) }}>Edit</Dropdown.Item>                                                        
                                                      </PermissionCheck>
                                                      <PermissionCheck permissions={['resource_allocation.delete']}>
                                                        <Dropdown.Item onClick={() => { handleRemoveResourceAllocation(taskboard.id) }}>Delete</Dropdown.Item>
                                                      </PermissionCheck>
                                                      <PermissionCheck permissions={['resource_allocation.update']}>
                                                        <Dropdown.Item onClick={() => { handleDoneResourceAllocation(taskboard.id); }}>Completed</Dropdown.Item>
                                                      </PermissionCheck>   
                                                    </Dropdown.Menu>
                                                  </Dropdown>  
                                                }
                                              </div>
                                              <p className="dark-1 mb-2 lh-base"><span className="font-weight-medium">Plan Name:</span> {taskboard.plan_name}</p>
                                              <p className="dark-1 lh-base"><span className="font-weight-medium">Coordinator: </span>
                                                  {taskboard.pc_coordinator.map((pc, pc_index) => (
                                                    <span key={`${emp_index}-${pc_index}`}>{pc_index > 0 ? `, ${pc.name}` : pc.name}</span>
                                                  ))}
                                              </p>
                                              <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex flex-wrap">
                                                {taskboard.hours &&<span className="badge rounded-pill  badge-lg badge-info text-uppercase me-2 mb-1">{taskboard.hours} hrs</span>}
                                                {taskboard.addon_hours &&<span className="badge rounded-pill  badge-lg badge-danger text-uppercase mb-1">Site Addons : {taskboard.addon_hours} hrs</span>}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </SimpleBar>
                                      </td>
                                    );
                                  })
                                }

                                <td key={`custom_${emp.staff_id}_${emp_index}`}>
                                  
                                    <SimpleBar  className="resources-task-card-list">
                                    {resourceData?.taskboard_lists?.filter(function (task) { return task.staff_id === emp.staff_id && task.pc_id === 0; }).map((taskboard, taskboard_cus_index) => (
                                      <div key={`custom_${taskboard_cus_index}`} className="inner-card rounded-10 bg-white p-4">
                                            
                                        <div className='d-flex'>
                                          <div className="col-9 me-3">
                                            <p className="dark-1 mb-2 lh-base"><span className="font-weight-medium">Agency:</span>  {taskboard.agency_name}</p>
                                          </div>
                                          {check(['resource_allocation.update', 'resource_allocation.delete'], userData?.role.getPermissions) &&
                                            <Dropdown className="ms-auto">
                                              <Dropdown.Toggle as="a" bsPrefix="d-toggle" className="btn btn-light btn-icon btn-sm shadow-none" id="dropdown-basic">
                                                <i className="fa-solid fa-ellipsis-vertical"></i>
                                              </Dropdown.Toggle>
                                              <Dropdown.Menu align="end" className="dropdown-menu-end p-2" popperConfig={popperConfig}>
                                                
                                                  
                                                <PermissionCheck permissions={['resource_allocation.update']}>
                                                  <Dropdown.Item onClick={() => { handleEditResourceAllocation(taskboard.id) }}>Edit</Dropdown.Item>                                                        
                                                </PermissionCheck>
                                                <PermissionCheck permissions={['resource_allocation.delete']}>
                                                  <Dropdown.Item onClick={() => { handleRemoveResourceAllocation(taskboard.id) }}>Delete</Dropdown.Item>
                                                </PermissionCheck>
                                                <PermissionCheck permissions={['resource_allocation.update']}>
                                                  <Dropdown.Item onClick={() => { handleDoneResourceAllocation(taskboard.id); }}>Completed</Dropdown.Item>
                                                </PermissionCheck>   
                                              </Dropdown.Menu>
                                            </Dropdown>  
                                          }
                                        </div>
                                        <p className="dark-1 mb-2 lh-base"><span className="font-weight-medium">Plan Name:</span> {taskboard.plan_name}</p>
                                        <p className="dark-1 lh-base"><span className="font-weight-medium">Coordinator: </span>
                                            {taskboard.pc_coordinator.map((pc, pc_index) => (
                                              <span key={`${emp_index}-${pc_index}`}>{pc_index > 0 ? `, ${pc.name}` : pc.name}</span>
                                            ))}
                                        </p>
                                        <div className="d-flex align-items-center justify-content-between">
                                          <div className="d-flex flex-wrap">
                                          {taskboard.hours &&<span className="badge rounded-pill  badge-lg badge-info text-uppercase me-2 mb-1">{taskboard.hours} hrs</span>}
                                          {taskboard.addon_hours &&<span className="badge rounded-pill  badge-lg badge-danger text-uppercase mb-1">Site Addons : {taskboard.addon_hours} hrs</span>}
                                          </div>
                                        </div>
                                      </div>
                                      ))}
                                    </SimpleBar>
                                </td>
                              </tr>
                            ))
                          }
                          
                        </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>
            </div>

            <Modal size="lg" show={showAddtaskModal} onHide={cstSetCloseAddtaskModal} centered>
              <Modal.Header closeButton className="py-5 px-10">
                <Modal.Title className="font-20 dark-1 mb-0">Assign Card</Modal.Title>
              </Modal.Header>
              <Modal.Body className="p-0">
                <div className="invite-people py-9 px-10">
                  <Form onSubmit={async e => { e.preventDefault(); await addResourceAllocationCard() }}>
                    <Row className="g-6">
                        <Col lg={6}>
                          <Form.Label className="form-label-sm">Start Date<span className='validation-required-direct'></span></Form.Label>

                            <SingleDatePickerControl
                              selected={startDate}
                              onDateChange={(startDate) => setStartDate(startDate)}
                              onChange={(startDate) => setStartDate(startDate)}
                              minDate={(moment().add(0, 'weeks').startOf('isoWeek').toDate())}
                              maxDate={(moment().add(1, 'weeks').endOf('isoWeek').subtract(3, 'days').toDate())}
                              disabled={!isEditable}
                              className={`form-control ${formErrors.startDate && 'is-invalid'}`}
                            />            
                          
                          {formErrors.startDate && (
                            <span className="text-danger">{formErrors.startDate}</span>
                          )}
                        </Col>

                        <Col lg={6}>                         
                          <Form.Label className="form-label-sm">End Date<span className='validation-required-direct'></span></Form.Label>
                                                    
                          <SingleDatePickerControl
                              selected={endDate}
                              onDateChange={(startDate) => setEndDate(startDate)}
                              onChange={(startDate) => setEndDate(startDate)}
                              minDate={startDate ? startDate : (moment().add(0, 'weeks').startOf('isoWeek').toDate())}
                              maxDate={(moment().add(1, 'weeks').endOf('isoWeek').subtract(3, 'days').toDate())}
                              disabled={!isEditable}
                              className={`form-control ${formErrors.endDate && 'is-invalid'}`}
                          />
                          {formErrors.endDate && (
                            <span className="text-danger">{formErrors.endDate}</span>
                          )}
                        </Col>

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
                          <Form.Control type="text" value={agency.name} disabled />
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
                              <Col lg={6}>
                                <Form.Label className="form-label-sm">Hours</Form.Label>
                                <Form.Control type="number" step="any" placeholder="Add Hours" value={hours} onChange={(e) => { setHours(e.target.value) }} />
                              </Col>
                              : ''}
                            {(agency?.id === 0) || (agency === '') || (agency && agency.current_plan.includes('addons')) ?
                              <Col lg={6}>
                                <Form.Label className="form-label-sm">Site Addons Hours</Form.Label>
                                <Form.Control type="number" step="any" placeholder="Add Site Addons Hours" value={addOnHours} onChange={(e) => { setAddOnHours(e.target.value) }} />
                              </Col>
                              : ''}
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
          
        </div>

        <Footer />
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
  userData: state.Auth.user
})

export default connect(mapStateToProps)(ResourceAllocation)