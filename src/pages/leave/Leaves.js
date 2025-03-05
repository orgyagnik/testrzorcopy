import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, Button, Form, Offcanvas, Spinner, OverlayTrigger, Tooltip, Dropdown } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { pagination, office_display_date_format_for_date, office_display_date_format_with_time, leaveStatusList, popperConfig, monthList, thresholdStatusDateLimit, hrStaffId, allowedUserIds } from '../../settings';
import moment from 'moment';
import { getLeaveIcons, getLeaveStatus, getLeaveOnlyStatus, check } from "../../utils/functions.js";
import { databaseRoleCode } from '../../settings';
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import SingleDatePickerControl from '../../modules/custom/SingleDatePicker';
import { validateForm } from "../../utils/validator.js";
import { LeaveValidator } from "../../modules/validation/LeaveValidator";
import Select from 'react-select';
import { toast } from 'react-toastify';
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import { DELETE_LEAVE } from '../../modules/lang/Leave';
import { confirmAlert } from 'react-confirm-alert';
import { format } from 'date-fns';
import { useLocation, Link } from "react-router-dom";
import ReadMoreReadLess from "../../modules/custom/ReadMoreReadLess";
import RangeDatePickerControl from '../../modules/custom/RangeDatePickerControl';

function Leaves({ userData, name }) {
  const search = useLocation().search;
  const searchStaffId = new URLSearchParams(search).get('q');
  const [showAddLeaveModal, setShowAddLeaveModal] = useState(false);
  const cstSetCloseAddLeaveModal = () => setShowAddLeaveModal(false);
  const cstShowAddLeaveModal = () => setShowAddLeaveModal(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [reloadPage, setReloadPage] = useState(false);
  const [date, setDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [approvedLeaveList, setApprovedLeaveList] = useState([]);
  const [remainLeaveList, setRemainLeaveList] = useState([]);
  const [leaveTypeList, setLeaveTypeList] = useState([]);
  const [leaveList, setLeaveList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');
  const [saveProcess, setSaveProcess] = useState(false);
  const [sort, setSort] = useState(userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.hrCode ? 'asc' : pagination.sorting);
  const [sortby, setSortBy] = useState(userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.hrCode ? 'status' : 'ticketid');
  const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordForLeave);

  const [formErrors, setFormErrors] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [staffId, setStaffId] = useState(searchStaffId ? parseInt(searchStaffId) : 0);
  const [yearList, setYearList] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [designationOption, setDesignationOption] = useState([]);
  const [designation, setDesignation] = useState(0);
  const [month, setMonth] = useState(userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.hrCode ?  new Date().getMonth() + 1 : 0);
  const [leaveId, setLeaveId] = useState(0);
  const [leaveType, setLeaveType] = useState('');
  const [leaveStatus, setLeaveStatus] = useState(1);
  const [halfDayLeave, setHalfDayLeave] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');

  const [pageDesignRefresh, setPageDesignRefresh] = useState(true);
  const [exportData, setExportData] = useState([]);
  const [tableLoader, setTableLoader] = useState(false);
  const [filterdate, setFilterDate] = useState(null);
  const [approvedLeaveCount, setApprovedLeaveCount] = useState(0);
  const [disapprovedLeaveCount, setDisapprovedLeaveCount] = useState(0);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  let leaveStatusNote = useRef();
  const dropdownRef = useRef();
  const [thresholdDateList, setThresholdDateList] = useState([]);
  const [isEmployeeLeave, setIsEmployeeLeave] = useState(false);
  const [staffIdForEmployee, setStaffIdForEmployee] = useState(0);
  const [addLeaveStaffList, setAddLeaveStaffList] = useState([]);
  
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

  useEffect(() => {
    let params1 = '?role_code=office_staff';
    if (`${designation}` !== '0') {
      params1 = params1 + "&designation=" + designation;
    }
    APIService.getAllMembers(params1)
      .then((response) => {
        if (response.data?.status) {
          let newStaffList = response.data?.data.map(item => {
            return { label: item.name, value: item.id }
          });
          setStaffList([{ label: 'All Employee', value: 0 }, ...newStaffList]);
          setAddLeaveStaffList([{ label: 'Select Employee', value: 0 }, ...newStaffList]);
        }
        else {
          setStaffList([{ label: 'All Employee', value: 0 }]);
          setAddLeaveStaffList([{ label: 'Select Employee', value: 0 }]);
        }
        if (firstLoad === false) {
          setStaffId(0);
        }
      });
  }, [designation]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearTempList = [{ label: "Select Year", value: 0 }];
    for (let i = currentYear - 3; i <= currentYear + 1; i++) {
      yearTempList.push({ label: i, value: i });
    }
    setYearList(yearTempList);

    APIService.getDesignationList()
      .then((response) => {
        if (response.data?.status) {
          let newDesignationList = response.data?.data.map(item => {
            return { label: item.name, value: item.id }
          });
          setDesignationOption([{ label: 'All Designation', value: 0 }, ...newDesignationList]);
        }
      });
  }, []);

  useEffect(() => {
    fetchLeaveList();
    setFirstLoad(false);  
  }, [sort, sortby, page, perPageSize, pageDesignRefresh]);

  useEffect(() => {
    if (firstLoad === false) {
      setPage(1);
      if (page === 1) {
        const timer = setTimeout(() => {
          fetchLeaveList();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [searchFilter, staffId, reloadPage, year, month, designation, filterdate]);

  const fetchLeaveList = () => { 
    setTableLoader(true);
    let params = "?";
    params = params + "sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby;
    if (searchFilter !== '') {
      params = params + "&search=" + searchFilter;
    }
    if (staffId !== 0) {
      params = params + "&staff_id=" + staffId;
    }
    if (year !== 0) {
      params = params + "&year=" + year;
    }
    if (month !== 0) {
      params = params + "&month=" + month;
    }
    if (`${designation}` !== '0') {
      params = params + "&designation=" + designation;
    }
    if (filterdate) {
      params = params + "&filter_date=" + format(filterdate, "yyyy-MM-dd");
    }

    APIService.getLeaveLists(params)
      .then((response) => {
        if (response.data?.status) {
          setTotalPages(response.data?.pagination?.total_pages);
          setTotalRecords(response.data?.pagination?.total_records);
          let newData = response.data?.data?.applied_leaves;
          setLeaveList(newData);
          setRemainLeaveList(response.data?.data?.remain_leaves);
          setThresholdDateList(response.data?.data?.threshold_leave_count);
          setApprovedLeaveList(response.data?.data?.approved_leaves);
          setLeaveTypeList(response?.data?.data?.leave_types);
          setTableLoader(false);
          setApprovedLeaveCount(response?.data?.data?.approved_count);
          setDisapprovedLeaveCount(response?.data?.data?.disapproved_count);
          setPendingLeaveCount(response?.data?.data?.pending_count);

          let exportHeader = ["#", "Employee", "Start Date", "End Date", "Total Days", "Reason", "Status", "Leave Type", "Date Added"];
          let exportData = [];
          newData?.map(item => {
            exportData.push(
              {
                ticketid: item.ticketid,
                empname: item.empname,
                startdate: item.startdate ? moment(item.startdate).format(office_display_date_format_for_date) : '',
                enddate: item.enddate ? moment(item.enddate).format(office_display_date_format_for_date) : '',
                totaldays: item.totaldays,
                message: item.message,
                status: getLeaveOnlyStatus(item?.status),
                leave_type: item.leave_type,
                dateadded: item.dateadded ? format(new Date(item.dateadded), office_display_date_format_with_time) : '',
              });
            return '';
          });
          setExportData({ fileName: "leave-data", sheetTitle: "Leaves", exportHeader: exportHeader, exportData: exportData });
        }
      });
  }

  let columns = [
    {
      Header: '#',
      id: 'ticketid',
      accessor: (row) => (
        <>
          <span>{row?.ticketid}</span>
        </>
      )
    },
    {
      Header: 'Employee',
      id: 'empname',
      accessor: (row) => (
        <>
          {userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.hrCode ?
            <span className='cursor-pointer text-primary' onClick={() => setStaffId(row?.assigned)}>{row?.empname}</span>
            :
            <span>{row?.empname}</span>
          }
        </>
      )
    },
    {
      Header: 'Reason',
      id: 'leave_reason',
      accessor: (row) => (
        <ReadMoreReadLess longText={row?.message} />
      ),
      disableSortBy: true,
    },
    {
      Header: 'Status',
      id: 'status',
      accessor: (row) => <>
        
        {userData?.role_code === databaseRoleCode.employeeCode &&
          row?.note && row?.status === 3 ? (
            <OverlayTrigger 
              placement="top" 
              overlay={<Tooltip id={`tooltip-status-${row?.ticketid}`}>{row?.note}</Tooltip>}
            >
              <span>
                {getLeaveStatus(row?.status)}
              </span>
            </OverlayTrigger>
          ) : 
          getLeaveStatus(row?.status)
        }
      </>,
    },
    {
      Header: 'Leave Type',
      id: 'leave_type',
      accessor: (row) => row?.leave_type,
    },
    {
      Header: 'Total Days',
      id: 'totaldays',
      accessor: (row) => row?.totaldays,
    },
    {
      Header: 'Start Date',
      id: 'startdate',
      accessor: (row) => row?.startdate && moment(new Date(row?.startdate)).format(office_display_date_format_for_date),
    },
    {
      Header: 'End Date',
      id: 'enddate',
      accessor: (row) => row?.enddate && moment(new Date(row?.enddate)).format(office_display_date_format_for_date),
    },    
    {
      Header: 'Added By',
      id: 'addedbyname',
      accessor: (row) => row?.addedbyname,
    },
    {
      Header: 'Date Applied',
      id: 'dateadded',
      //accessor: (row) => row?.dateadded && moment(new Date(row?.dateadded)).format(display_date_format_with_time),
      accessor: (row) => row?.dateadded && format(new Date(row?.dateadded), office_display_date_format_with_time),
    },
  ];

  // if (userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.hrCode) {
  //   columns = [
  //     ...columns,
  //     {
  //       Header: 'Weekend Or Holiday Leave',
  //       id: 'weekend_or_holiday_leave',
  //       disableSortBy: true,
  //       accessor: (row) => row?.weekend_or_holiday_leave,
  //     },
  //   ];
  // }

  if (userData?.role_code === databaseRoleCode.adminCode) {
    columns = [
      ...columns,
      {
        Header: 'Action By',
        id: 'approvebyname',
        accessor: (row) => (
          <>
            {row?.approvebyname}
            {row?.note !== '' &&
              <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-note-${row?.ticketid}`}>{row?.note}</Tooltip>}>
                <i className="fa-solid fa-circle-info ms-1"></i>
              </OverlayTrigger>
            }
          </>
        )
      },
    ];
  }

  if (check(['leaves.update', 'leaves.delete'], userData?.role.getPermissions)) {
    columns = [
      ...columns,
      {
        Header: 'Action',
        disableSortBy: true,
        accessor: (row) => (
          <>
            {(row?.status === 1 || userData?.role_code === databaseRoleCode.adminCode || userData?.id === hrStaffId) &&
              <Dropdown className="category-dropdown edit-task-dropdown">
                <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="cursor-pointer" id="edit-task"><button size="sm" className='btn btn-white circle-btn btn-icon btn-sm'><i className="fa-solid fa-ellipsis-vertical"></i></button></Dropdown.Toggle>
                <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2" popperConfig={popperConfig}>
                  {(row?.status === 1) && (row?.assigned === userData?.id || userData?.role_code === databaseRoleCode.adminCode || userData?.id === hrStaffId) ?
                    <PermissionCheck permissions={['leaves.update']}>
                      <Dropdown.Item onClick={() => { handleLeaveEdit(row?.ticketid) }}>
                        Edit
                      </Dropdown.Item>
                    </PermissionCheck>
                    : ''
                  }
                  {leaveStatusList?.filter(function (arr) { return arr.value !== row?.status; }).map((leaveStatus, index) => (
                    <PermissionCheck permissions={['leave_status.update']} key={index}>
                      <Dropdown.Item onClick={() => { handleLeaveStatus(row?.ticketid, leaveStatus.value) }}>
                        Mark as {leaveStatus.label}
                      </Dropdown.Item>
                    </PermissionCheck>
                  ))
                  }
                  {(row?.status === 1) && (row?.assigned === userData?.id || userData?.role_code === databaseRoleCode.adminCode || userData?.id === hrStaffId) ?
                    <PermissionCheck permissions={['leaves.delete']}>
                      <Dropdown.Item className="text-danger" onClick={() => { handleLeaveDelete(row?.ticketid) }}>
                        Delete
                      </Dropdown.Item>
                    </PermissionCheck>
                    : ''
                  }
                </Dropdown.Menu>
              </Dropdown>
            }
          </>
        ),
      },
    ]
  }

  const handleLeaveEdit = async (ticketid) => {
    let editLeaveData = leaveList.filter(function (arr) {
      return arr.ticketid === ticketid;
    });
    if (editLeaveData.length > 0) {
      clearControl();
      let data = editLeaveData[0];
      
      setDate(moment(data?.startdate)._d);
      setDueDate(moment(data?.enddate)._d);
      setLeaveType(data?.leave_type);
      setHalfDayLeave(data?.half_leave === 1 ? true : false);
      setLeaveStatus(data?.status);
      setLeaveReason(data?.message);
      setLeaveId(data?.ticketid);
      setIsEmployeeLeave((data?.added_by === data?.assigned || data?.added_by === 0) ? false : true);
      setStaffIdForEmployee(data?.assigned);
      cstShowAddLeaveModal();
    }
  };

  const applyForLeave = async () => {
    clearControl();
    cstShowAddLeaveModal();
  };

  const CustomUI = ({ onClose, params }) => {

    const handleSubmitStatusNote = () => {
      params["note"] = leaveStatusNote?.current?.value ? leaveStatusNote?.current?.value : '';
      updateLeaveStatus(params);
      onClose();
    };

    return (
      <div className="react-confirm-alert">
        <div className="react-confirm-alert-body">
          <h1>Confirm</h1>
          {/* {plan_type === 'Monthly' ? CANCEL_MONTHLY_SUBSCRIPTION : CANCEL_YEARLY_SUBSCRIPTION} */}
          <Form.Group className="mb-5 mt-3 w-100">
            <Form.Label className='float-start'>Note</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Enter Note" ref={leaveStatusNote} className={`form-control`} maxLength={300} />
          </Form.Group>
          <div className="react-confirm-alert-button-group">
            <button className="btn btn-primary btn-lg" label="Confirm" onClick={(e) => { handleSubmitStatusNote(); }}>Submit</button>
            <button className="btn btn-outline-secondary btn-lg" label="No" onClick={onClose}>No</button>
          </div>
        </div>
      </div>
    );
  };

  const handleLeaveStatus = async (ticketid, status) => {
    let params = {};
    params["ticketid"] = ticketid;
    params["status"] = status;
    if (userData?.role_code === databaseRoleCode.adminCode) {
      updateLeaveStatus(params);
    }
    else {
      confirmAlert({
        customUI: ({ onClose }) => {
          return <CustomUI onClose={onClose} params={params} />
        }
      });
    }
  };

  const updateLeaveStatus = async (params) => {
    APIService.updateLeaveStatus(params)
      .then((response) => {
        if (response.data?.status) {
          setPageDesignRefresh(!pageDesignRefresh);
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

  const handleLeaveDelete = async (ticketid) => {
    confirmAlert({
      title: 'Confirm',
      message: DELETE_LEAVE,
      buttons: [
        {
          label: 'Yes',
          className: 'btn btn-primary btn-lg',
          onClick: () => {
            let params = {};
            params["ticketid"] = ticketid;
            APIService.deleteLeave(params)
              .then((response) => {
                if (response.data?.status) {
                  let newLeaveList = leaveList.filter(function (arr) {
                    setPageDesignRefresh(!pageDesignRefresh);
                    return arr.ticketid !== ticketid;
                  });
                  setLeaveList(newLeaveList);
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

  const handleStaffSelect = e => {
    setStaffId(e.value);
  };

  const handleDesignationSelect = (selectedDesignation) => {
    setDesignation(selectedDesignation?.value);
  };

  const handleYearSelect = e => {
    setYear(e.value);
  };

  const handleMonthSelect = e => {
    setMonth(e.value);
  };

  const addUpdateLeave = async () => {
    setSaveProcess(true);
    setFormErrors([]);
    
    let validate = validateForm((LeaveValidator(date, halfDayLeave ? 'Not required' : dueDate, leaveType, leaveReason, isEmployeeLeave ? staffIdForEmployee === 0 ? '' : staffIdForEmployee : 'Not required' )));
    if (Object.keys(validate).length) {
      setSaveProcess(false);
      setFormErrors(validate);
    }
    else {
      let params = {};
      params["status"] = leaveStatus;
      params["subject"] = leaveReason;
      params["message"] = leaveReason;
      params["startdate"] = format(date, "yyyy-MM-dd");
      let totalDay = 0, half_leave = 0, enddate = null;
      if (halfDayLeave) {
        totalDay = 0.5;
        half_leave = 1;
        enddate = format(date, "yyyy-MM-dd");
      }
      else {
        
        let difference = Math.abs(dueDate.getTime() - date.getTime());
        
        totalDay = Math.floor( Math.round(difference / (1000 * 3600 * 24)) ) + 1;
        
        enddate = format(dueDate, "yyyy-MM-dd");
      }
      params["enddate"] = enddate;
      params["totaldays"] = totalDay;
      params["leave_type"] = leaveType;
      params["half_leave"] = half_leave;
      params["assigned"] = isEmployeeLeave === true ? staffIdForEmployee : userData?.id;
      params["is_employee_leave"] = isEmployeeLeave;

      if (leaveId === 0) {
        APIService.addLeave(params)
          .then((response) => {
            if (response.data?.status) {
              toast.success(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
              setReloadPage(!reloadPage);

              clearControl();
              cstSetCloseAddLeaveModal();
              setSaveProcess(false);
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
        params['ticketid'] = leaveId;
        APIService.updateLeave(params)
          .then((response) => {
            if (response.data?.status) {
              toast.success(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
              setReloadPage(!reloadPage);
              clearControl();
              cstSetCloseAddLeaveModal();
              setSaveProcess(false);
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

  const clearControl = async () => { 
    setDate(null);
    setDueDate(null);
    setLeaveType('');
    setHalfDayLeave(false);
    setLeaveStatus(1);
    setLeaveReason('');
    setLeaveId(0);
    setFormErrors([]);
    setFilterDate(null);
    setIsEmployeeLeave(false);
    setStaffIdForEmployee(0);
  };

  const handleClearFilter = async (e) => {
    setStaffId(0);
    setYear(new Date().getFullYear());
    setDesignation(0);
    setMonth(userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.hrCode ?  new Date().getMonth() + 1 : 0);
    setFilterDate(null);
  };

  const [isPageOffcanvasisActive, setIsPageOffcanvasisActive] = useState(false);
  const cstPageOffcanvasisShow = () => {
      setIsPageOffcanvasisActive(true);
      const mediaQuery = window.matchMedia('(max-width: 1199px)')
      if (mediaQuery.matches) {
        document.body.style.overflow = 'hidden';
      }
  };
  const cstPageOffcanvasisHide = () => {
      setIsPageOffcanvasisActive(false);
      document.body.style.overflow = '';
  };

  const closeFilterDropdown = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsPageOffcanvasisActive(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', closeFilterDropdown);
    return () => {
      document.removeEventListener('mousedown', closeFilterDropdown);
    };
  }, []);

  const getColorClass = (percentage, date) => {
    const isWeekend = moment(date).isoWeekday() === 6 || moment(date).isoWeekday() === 7;
    if (isWeekend){ 
      return 'bg-gray-100';     
    }else{
      if (percentage >= 100) {
        return 'bg-red-50';
      } else if (percentage >= 70) {
        return 'bg-yellow-50';
      } else {
        return 'bg-green-50';
      }
    }
  };

  const getTextClass = (percentage, date) => {
    const isWeekend = moment(date).isoWeekday() === 6 || moment(date).isoWeekday() === 7;
    if (isWeekend){ 
      return 'text-gray';     
    }else{
      if (percentage >= 100) {
        return 'text-danger';
      } else if (percentage >= 70) {
        return 'text-orange';
      } else {
        return 'text-success';
      }
    }
  };

  const getBorderClass = (percentage, date) => {
    const isWeekend = moment(date).isoWeekday() === 6 || moment(date).isoWeekday() === 7;
    if (isWeekend){ 
      return 'border-top-gray';     
    }else{
      if (percentage >= 100) {
        return 'border-top-danger';
      } else if (percentage >= 70) {
        return 'border-top-orange';
      } else {
        return 'border-top-success';
      }
    }
  };
  
  const disabledDates = [
    ...(userData.id !== hrStaffId ? [
      new Date(2024, 7, 16), // Remember, JavaScript dates start counting months from 0 (January) to 11 (December)
      new Date(2024, 7, 20),
      new Date(2024, 4, 6),
      new Date(2024, 5, 3),
      new Date(2024, 5, 10),
    ] : [])
  ];

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Header pagename={name} headerFilterButton={<Button onClick={cstPageOffcanvasisShow} variant="outline-secondary" size="md" type="button" className='ms-auto d-xl-none d-block'>Filter <i className="icon-filter ms-2"></i></Button>}/>
        <div className="inner-content pt-0 px-0">
          <div className="leave-page">
            <div className="bg-white py-3 px-4 px-lg-7 page-inner-header">
              <Row>
                <Col xl={6} xs={12}>
                  <Row className='g-2'>
                    <Col xs="auto">
                      <PermissionCheck permissions={['leaves.create']}>
                        <Button variant="primary" size="md" className='text-nowrap' onClick={applyForLeave}><i className="icon-add me-2"></i> Add Leave</Button>
                      </PermissionCheck>                      
                    </Col>
                    <Col xs="auto">
                      <PermissionCheck permissions={['leaves.today_approved_list']}>
                        <Link to={'/today-approved-leave'} className='text-nowrap btn btn-primary btn-md'>Today Approved Leave</Link>
                      </PermissionCheck>
                      {
                        ((userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.hrCode) || staffId !== 0 && filterdate !== null) ?
                          <>
                            <h3 className="d-inline-block mt-1 ms-3">Approved : { approvedLeaveCount }</h3>
                            <h3 className="d-inline-block mt-1 ms-3">Pending : { pendingLeaveCount }</h3>
                            <h3 className="d-inline-block mt-1 ms-3">Disapproved : { disapprovedLeaveCount }</h3>
                          </>
                          :
                          <></>
                      }
                    </Col>
                  </Row>
                </Col>
                
                <Col xl={6} xs={12}> 
                  <div className='position-relative'>
                    <Button onClick={cstPageOffcanvasisShow} variant="outline-secondary" size="md" type="button" className='ms-auto d-xl-block d-none'>Filter <i className="icon-filter ms-2"></i></Button>
                    <div className={"custom-page-offcanvas filter-show-desktop " + (isPageOffcanvasisActive ? 'active' : '')} ref={dropdownRef}>
                      <div className='custom-page-offcanvas-header border-bottom border-gray-100 py-2 px-4'>
                          <h5 className='m-0'>Filter</h5>
                          <Button variant="outline-secondary" className='ms-auto me-4' size="sm" type="button" onClick={() => { handleClearFilter() }}> <span>Clear Filter</span></Button>
                          <Button type="button" variant="white" size='sm' className="btn-icon circle-btn btn" onClick={cstPageOffcanvasisHide}><i className="icon-cancel"></i></Button>
                      </div>
                      <div className='custom-page-offcanvas-body p-4'>
                          <Row className="g-4 justify-content-xl-end">  
                              {userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.hrCode ?
                              <>
                                <Col xs={12}>

                                  <Select styles={customStyles} className="control-md custom-select" options={designationOption} onChange={handleDesignationSelect}
                                    value={designationOption.filter(function (option) {
                                      return option.value === designation;
                                    })} />
                                </Col>
                                <Col xs={12}>
                                  <Select styles={customStyles} className="control-md custom-select" options={staffList} onChange={handleStaffSelect}
                                    value={staffList.filter(function (option) {
                                      return option.value === staffId;
                                    })} />
                                </Col>                                
                                <Col xs={12}>
                                  <SingleDatePickerControl
                                    selected={filterdate}
                                    onChange={(date) => setFilterDate(date)}
                                    isClearable
                                    indian={true}
                                    className={`form-control ${formErrors.date && 'is-invalid'}`}
                                  />
                                </Col>
                              </>
                              : ''
                            }
                            <Col xs={12}>
                                <Select styles={customStyles} className="control-md custom-select" options={monthList} onChange={handleMonthSelect}
                                  value={monthList.filter(function (option) {
                                    return option.value === month;
                                  })} />
                            </Col>
                            <Col xs={12}>
                              <Select styles={customStyles} className="control-md custom-select" options={yearList} onChange={handleYearSelect} placeholder={<div>Select Year</div>}
                                value={yearList.filter(function (option) {
                                  return option.value === year;
                                })} />
                            </Col>                            
                          </Row>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
            <div className="pt-4 pt-lg-9 px-4 px-lg-7">
              {
                (userData?.role_code !== databaseRoleCode.adminCode && userData?.role_code !== databaseRoleCode.hrCode) || staffId !== 0 ?
                  <>
                    <h3 className="mb-4">Approved Leaves:</h3>
                    <Row className="row-cols-3 row-cols-md-5 mb-7 g-3">
                      {leaveTypeList.map((type, index) => (
                        <Col key={index}>
                          <Card className="rounded-12 border border-gray-100 leave-card">
                            <Card.Body className="p-3 px-xxl-4">
                              <Row className="align-items-center">
                                <Col className="col-sm-auto d-xl-block d-none">
                                  {getLeaveIcons(type)}
                                </Col>
                                <Col>
                                  <span className="h2 mb-0">{(approvedLeaveList[type] === null || approvedLeaveList[type] === undefined) ? 0 : approvedLeaveList[type] > 0 ? approvedLeaveList[type] : 0}</span>
                                  <span className="caption text-gray-600 d-block mb-1">{type}</span>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                    {year === new Date().getFullYear() &&
                      <>
                        <h3 className="mb-4">Remaining Leaves:</h3>
                        <Row className="row-cols-3 row-cols-md-5 mb-7 g-3">
                          {leaveTypeList.map((type, index) => (
                            <Col key={index}>
                              <Card className="rounded-12 border border-gray-100 leave-card">
                                <Card.Body className="p-3 px-xxl-4">
                                  <Row className="align-items-center">
                                    <Col className="col-sm-auto d-xl-block d-none">
                                      {getLeaveIcons(type)}
                                    </Col>
                                    <Col>
                                      <span className="h2 mb-0">{(remainLeaveList[type] == null) ? 0 : remainLeaveList[type] > 0 ? remainLeaveList[type] : 0}</span>
                                      <span className="caption text-gray-600 d-block mb-1">{type}</span>
                                    </Col>
                                  </Row>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </>
                    }
                     
                  </>
                  : <></>
              }
                {Object.values(thresholdDateList).some(({ used_leave_percentage, remaining_lave_count }) => used_leave_percentage !== null || (remaining_lave_count !== 0 && remaining_lave_count !== null) ) ?       
                  <>
                    <Row className='g-2'>                            
                      <Col xl={9} xs={12}>
                        <h3 className="mb-4">Threshold Status:</h3>
                      </Col>                     
                    </Row>

                    <Row className='g-1 mb-7'>
                      { Object.keys(thresholdDateList)
                        .filter(date => moment(date).year() !== 2023)
                        .map((date, index) => (
                        <Col xs="auto" key={index}>
                          <div className={`rounded-12 text-center leave-card card py-3 px-2 threshold-card ${getBorderClass(thresholdDateList[date]?.used_leave_percentage, date)}`}>
                              <div className={`threshold-date ${getColorClass(thresholdDateList[date]?.used_leave_percentage, date)} ${getTextClass(thresholdDateList[date]?.used_leave_percentage, date)} text-center d-flex align-items-center justify-content-center lh-1 text-center`}>
                                  { moment(date).format('D') }
                              </div>
                              <div className='threshold-month font-12 lh-1 dark-2 mt-2 mb-3'>
                                  { moment(date).format('MMM').toUpperCase() }
                              </div>
                              <div className='threshold-per font-12 lh-1 font-weight-semibold'>
                                {moment(date).isoWeekday() !== 6 && moment(date).isoWeekday() !== 7 ? 
                                  'AVL:' + (thresholdDateList[date]?.remaining_lave_count !== null ? thresholdDateList[date]?.remaining_lave_count : 0) : 
                                  'NA'
                                }

                              </div>
                          </div>
                        </Col>
                      ))}                     
                    </Row>       
                  </>  
                   : ''                
                } 
              <Card className="rounded-10 p-4 p-xl-6">
                <Card.Body className="p-0 leave-table">
                  <DataTableWithPagination columns={columns} data={leaveList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isBulkAction={false} exportData={exportData} CustomclassName="leave-list-table" />
                </Card.Body>
              </Card>
            </div>
          </div>
          <Offcanvas show={showAddLeaveModal} onHide={cstSetCloseAddLeaveModal} className="add-leave-sidebar" placement="end">
            <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
              <div className="d-flex align-items-center">
                <h3 className="m-0">Apply for leaves</h3>
              </div>
              <ul className="ovrlay-header-icons">
                <li>
                  <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={cstSetCloseAddLeaveModal}>
                    <i className="icon-cancel"></i>
                  </button>
                </li>
              </ul>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
              <Form onSubmit={async e => { e.preventDefault(); await addUpdateLeave() }}>
                <SimpleBar className="offcanvas-inner">
                  <div className="p-6">
                    <Row className="g-7">
                      
                      {(userData?.role_code === databaseRoleCode.adminCode ) || (userData?.role_code === databaseRoleCode.hrCode && userData?.id === hrStaffId) ?
                        <Col xs={12} >
                            
                            <Form.Check type="checkbox" id="allow-customer-task-view" label="Is other employee leave" value={isEmployeeLeave} checked={isEmployeeLeave} onChange={(e) => { setIsEmployeeLeave(e.target.checked) }}/>
                          
                            {formErrors.isEmployeeLeaveInput && (
                              <span className="text-danger">{formErrors.isEmployeeLeaveInput}</span>
                            )}
                        </Col>
                        : ''
                      }
                      {isEmployeeLeave === true &&
                        <Col xs={12} >                                                                           
                          <Form.Label className="d-block">Employee<span className='validation-required-direct'></span></Form.Label>
                          <Select styles={customStyles} classNamePrefix="react-select" className={`custom-select ${formErrors.isEmployeeInput && 'is-react-select-invalid'}`} options={addLeaveStaffList} onChange={(e) => setStaffIdForEmployee(e.value)}
                              value={addLeaveStaffList.filter(function (option) {
                                  return option.value === staffIdForEmployee;
                              })} />
                          {formErrors.isEmployeeInput && (
                              <span className="text-danger">{formErrors.isEmployeeInput}</span>
                          )}
                        </Col>
                      }

                      <Col xs={12} sm={12} md={6}>
                        <Form.Label className="d-block">Start Date<span className='validation-required-direct'></span></Form.Label>
                        <SingleDatePickerControl
                          selected={date}
                          onDateChange={(date) => setDate(date)}
                          onChange={(date) => setDate(date)}
                          minDate={new Date(new Date().getFullYear(), 0, 1)}
                          maxDate={allowedUserIds.includes(userData.id) ? new Date(new Date().getFullYear(), 11, 31) : new Date(new Date().getFullYear(), 5, 30)}
                          isClearable
                          indian={true}
                          className={`form-control ${formErrors.date && 'is-invalid'}`}
                          excludeDates={disabledDates}
                        />
                        
                        {formErrors.date && (
                          <span className="text-danger">{formErrors.date}</span>
                        )}
                      </Col>
                      <Col xs={12} sm={12} md={6}>
                        {!halfDayLeave &&
                          <>
                            <Form.Label className="d-block">End Date<span className='validation-required-direct'></span></Form.Label>
                            <SingleDatePickerControl
                              selected={dueDate}
                              onDateChange={(date) => setDueDate(date)}
                              onChange={(date) => setDueDate(date)}
                              minDate={date ? date : new Date(new Date().getFullYear(), 0, 1)}
                              maxDate={allowedUserIds.includes(userData.id) ? new Date(new Date().getFullYear(), 11, 31) : new Date(new Date().getFullYear(), 5, 30)}
                              isClearable
                              indian={true}
                              className={`form-control ${formErrors.dueDate && 'is-invalid'}`}
                              excludeDates={disabledDates}
                            />
                            {formErrors.dueDate && (
                              <span className="text-danger">{formErrors.dueDate}</span>
                            )}
                          </>
                        }
                      </Col>
                      <Col xs={12} sm={12} md={6}>
                        <Form.Label className="d-block">Leave Type<span className='validation-required-direct'></span></Form.Label>
                        <Form.Select aria-label="Select Leave" value={leaveType} onChange={(e) => { setLeaveType(e.target.value) }} className={`${formErrors.leaveTypeInput && 'is-invalid'}`}>
                          <option value="">Select Leave Type</option>
                          {leaveTypeList?.map((type, index) => (
                            <option value={type} key={index}>{type}</option>
                          ))}
                        </Form.Select>
                        {formErrors.leaveTypeInput && (
                          <span className="text-danger">{formErrors.leaveTypeInput}</span>
                        )}
                      </Col>
                      <Col xs={12} sm={12} md={6}>
                        <Form.Label className="d-block">Half Leave</Form.Label>
                        <Form.Check type="checkbox" id="half-day" checked={halfDayLeave} onChange={(e) => { setHalfDayLeave(e.target.checked); setDueDate(null); }} />
                      </Col>
                      <Col xs={12} >
                        <Form.Label className="d-block">Leave Reason<span className='validation-required-direct'></span></Form.Label>
                        <Form.Control as="textarea" rows={3} placeholder="Add Leave Reason" value={leaveReason} onChange={(e) => { setLeaveReason(e.target.value) }} className={`description-area placeholder-dark  dark-2 ${formErrors.leaveReasonInput && 'is-invalid'}`} maxLength={300} />
                        {formErrors.leaveReasonInput && (
                          <span className="text-danger">{formErrors.leaveReasonInput}</span>
                        )}
                      </Col>
                    </Row>
                    <div className="mt-7 text-end">
                      <Button disabled={saveProcess} variant="primary" size="md" type="submit">
                        {
                          !saveProcess && 'Save'
                        }
                        {
                          saveProcess && <><Spinner size="sm" animation="border" className="me-1" />Save</>
                        }
                      </Button>
                    </div>
                  </div>
                </SimpleBar>
              </Form>
            </Offcanvas.Body>
          </Offcanvas>
        </div>
        <Footer />
      </div>
    </>
  );
}
const mapStateToProps = (state) => ({
  userData: state.Auth.user
})

export default connect(mapStateToProps)(Leaves)