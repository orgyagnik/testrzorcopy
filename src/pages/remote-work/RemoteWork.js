import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, Button, Form, Offcanvas, Spinner, OverlayTrigger, Tooltip, Dropdown } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { pagination, office_display_date_format_for_date, office_display_date_format_with_time, leaveStatusList, popperConfig, monthList, allowedUserIds } from '../../settings';
import moment from 'moment';
import { getLeaveStatus, getLeaveOnlyStatus, check, getFileExtensionFromFileName } from "../../utils/functions.js";
import { databaseRoleCode, attachmentsAllowExtension, attachmentsAllowExtensionMsg } from '../../settings';
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import SingleDatePickerControl from '../../modules/custom/SingleDatePicker';
import { validateForm } from "../../utils/validator.js";
import { RemoteWorkValidator } from "../../modules/validation/RemoteWorkValidator";
import Select from 'react-select';
import { toast } from 'react-toastify';
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import { DELETE_REMOTE_WORK, DELETE_ATTACHMENT } from '../../modules/lang/RemoteWork';
import { confirmAlert } from 'react-confirm-alert';
import { format } from 'date-fns';
import { useLocation, useHistory } from "react-router-dom";
import ReadMoreReadLess from "../../modules/custom/ReadMoreReadLess";
import NoPermission from '../auth/NoPermission';
import { FileUploader } from "react-drag-drop-files";
import AttachmentPreview from '../task/AttachmentPreview';
import ViewRemoteWork from './ViewRemoteWork';

function RemoteWork({ userData, name }) {

  let id = undefined;
  let history = useHistory();
  const currentURL = window.location.pathname;

  if (currentURL.includes("/view-remote-work/")) {
    id = currentURL.replace("/view-remote-work/", '');
  }

  const search = useLocation().search;
  const searchStaffId = new URLSearchParams(search).get('q');
  const [showAddRemoteWorkModal, setShowAddRemoteWorkModal] = useState(false);
  const cstSetCloseAddRemoteWorkModal = () => setShowAddRemoteWorkModal(false);
  const cstShowAddRemoteWorkModal = () => setShowAddRemoteWorkModal(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [reloadPage, setReloadPage] = useState(false);
  const [date, setDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [leaveList, setLeaveList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');
  const [saveProcess, setSaveProcess] = useState(false);
  const [sort, setSort] = useState(userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.hrCode ? 'asc' : pagination.sorting);
  const [sortby, setSortBy] = useState(userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.hrCode ? 'status' : 'id');
  const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordForLeave);

  const [formErrors, setFormErrors] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [staffId, setStaffId] = useState(searchStaffId ? parseInt(searchStaffId) : 0);
  const [yearList, setYearList] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [designationOption, setDesignationOption] = useState([]);
  const [designation, setDesignation] = useState(0);
  const [month, setMonth] = useState(userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.hrCode ?  new Date().getMonth() + 1 : 0);
  const [remoteId, setRemoteId] = useState(0);
  const [remoteStatus, setRemoteStatus] = useState(1);
  const [halfDay, setHalfDay] = useState(false);
  const [reason, setReason] = useState('');

  const [pageDesignRefresh, setPageDesignRefresh] = useState(true);
  const [exportData, setExportData] = useState([]);
  const [tableLoader, setTableLoader] = useState(false);
  const [filterdate, setFilterDate] = useState(null);
  const [approvedLeaveCount, setApprovedLeaveCount] = useState(0);
  const [disapprovedLeaveCount, setDisapprovedLeaveCount] = useState(0);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  let remoteWorkStatusNote = useRef();
  const dropdownRef = useRef();
  const [teamMemberOption, setTeamMemberOption] = useState([]);
  const [teamMember, setTeamMember] = useState(0);
  const [isMedical, setIsMedical] = useState(false);
  const [attachmentsFile1, setAttachmentsFile1] = useState([]);
  const [attachmentsFileForEdit, setAttachmentsFileForEdit] = useState([]);
  const [showViewRemoteModal, setShowViewRemoteModal] = useState(false);
  const [statusList, setStatusList] = useState([]);
  
  useEffect(() => {
    if(currentURL === '/remote-work'){
      setShowViewRemoteModal(false);
      // setReloadPage(!reloadPage);
    }

    if (id !== undefined && `${id}` !== `${remoteId}`) {
      if (currentURL === `/view-remote-work/${id}`) {
        setRemoteId(id);
        setShowViewRemoteModal(true);
      }
    }
  }, [id]);

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
        }
        else {
          setStaffList([{ label: 'All Employee', value: 0 }]);
        }
        if (firstLoad === false) {
          setStaffId(0);
        }
      });

      APIService.getRemoteWorkStatus()
        .then((response) => {
            if (response.data?.status) {
                let newStaffList = response.data?.data.map(item => {
                    return { label: item.label, value: item.value, backgroundColor: item.backgroundColor }
                });
                setStatusList(newStaffList);
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
    fetchRemoteWorkList();
    setFirstLoad(false);  
  }, [sort, sortby, page, perPageSize, pageDesignRefresh, reloadPage]);

  useEffect(() => {
    if (firstLoad === false) {
      setPage(1);
      if (page === 1) {
        const timer = setTimeout(() => {
          fetchRemoteWorkList();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [searchFilter, staffId, year, month, designation, filterdate, teamMember]);

  const fetchRemoteWorkList = () => { 
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

    if (`${teamMember}` !== '0') {
      if (`${teamMember}` === '-1') {
        let main_result = teamMemberOption.map(a => a.value);
        let main_result1 = main_result.filter((data) => data !== 0 && data !== -1);
        params = params + `&search_by_team_member=${main_result1.length > 0 ? main_result1.join(',') : ''}`;
      }
      else if (teamMember > 0) {
        params = params + "&search_by_team_member=" + teamMember;
      }
    }

    APIService.getRemoteWorkList(params)
      .then((response) => {
        if (response.data?.status) {
          setTotalPages(response.data?.pagination?.total_pages);
          setTotalRecords(response.data?.pagination?.total_records);
          let newData = response.data?.data?.applied_remote_request;
          setLeaveList(newData);
          setTableLoader(false);
          setApprovedLeaveCount(response?.data?.data?.approved_count);
          setDisapprovedLeaveCount(response?.data?.data?.disapproved_count);
          setPendingLeaveCount(response?.data?.data?.pending_count);

          let exportHeader = ["#", "Employee", "Start Date", "End Date", "Total Days", "Reason", "Status", "Date Added"];
          let exportData = [];
          newData?.map(item => {
            exportData.push(
              {
                id: item.id,
                empname: item.empname,
                startdate: item.startdate ? moment(item.startdate).format(office_display_date_format_for_date) : '',
                enddate: item.enddate ? moment(item.enddate).format(office_display_date_format_for_date) : '',
                totaldays: item.totaldays,
                message: item.message,
                status: getLeaveOnlyStatus(item?.status),
                created_at: item.created_at ? format(new Date(item.created_at), office_display_date_format_with_time) : '',
              });
            return '';
          });
          setExportData({ fileName: "remote-work-data", sheetTitle: "RemoteWork", exportHeader: exportHeader, exportData: exportData });
        }
      });
  }

  let columns = [
    {
      Header: '#',
      id: 'id',
      accessor: (row) => (
        <>
          <span>{row?.id}</span>
        </>
      )
    },
    {
      Header: 'Employee',
      id: 'empname',
      accessor: (row) => (
        <>
          <span className='cursor-pointer text-primary' onClick={() => { viewRemoteWorkData(row?.id); }}>{row?.empname}</span>
           
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
              overlay={<Tooltip id={`tooltip-status-${row?.id}`}>{row?.note}</Tooltip>}
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
      id: 'created_at',
      accessor: (row) => row?.created_at && format(new Date(row?.created_at), office_display_date_format_with_time),
    },
  ];

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
              <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-note-${row?.id}`}>{row?.note}</Tooltip>}>
                <i className="fa-solid fa-circle-info ms-1"></i>
              </OverlayTrigger>
            }
          </>
        )
      },
    ];
  }

  if (check(['remote_work.update', 'remote_work.delete'], userData?.role.getPermissions)) {
    columns = [
      ...columns,
      {
        Header: 'Action',
        disableSortBy: true,
        accessor: (row) => (
          <>
            {(row?.status === 1 || userData?.role_code === databaseRoleCode.adminCode) &&
              <Dropdown className="category-dropdown edit-task-dropdown">
                <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="cursor-pointer" id="edit-task"><button size="sm" className='btn btn-white circle-btn btn-icon btn-sm'><i className="fa-solid fa-ellipsis-vertical"></i></button></Dropdown.Toggle>
                <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2" popperConfig={popperConfig}>
                  {(row?.status === 1) && (row?.staffid === userData?.id || userData?.role_code === databaseRoleCode.adminCode) ?
                    <PermissionCheck permissions={['remote_work.update']}>
                      <Dropdown.Item onClick={() => { handleRemoteWorkEdit(row?.id) }}>
                        Edit
                      </Dropdown.Item>
                    </PermissionCheck>
                    : ''
                  }
                  {leaveStatusList?.filter(function (arr) { return arr.value !== row?.status; }).map((remoteStatus, index) => (
                    <PermissionCheck permissions={['remote_work.update_status']} key={index}>
                      <Dropdown.Item onClick={() => { handleRemmoteWorkStatus(row?.id, remoteStatus.value) }}>
                        Mark as {remoteStatus.label}
                      </Dropdown.Item>
                    </PermissionCheck>
                  ))
                  }
                  {(row?.status === 1) && (row?.staffid === userData?.id || userData?.role_code === databaseRoleCode.adminCode) ?
                    <PermissionCheck permissions={['remote_work.delete']}>
                      <Dropdown.Item className="text-danger" onClick={() => { handleRemoteWorkDelete(row?.id) }}>
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

  const handleRemoteWorkEdit = async (id) => {
    let editLeaveData = leaveList.filter(function (arr) {
      return arr.id === id;
    });
    if (editLeaveData.length > 0) {
      clearControl();
      let data = editLeaveData[0];
      
      setDate(moment(data?.startdate)._d);
      setDueDate(moment(data?.enddate)._d);
      setHalfDay(data?.half_day === 1 ? true : false);
      setRemoteStatus(data?.status);
      setReason(data?.message);
      setRemoteId(data?.id);
      cstShowAddRemoteWorkModal();
      setAttachmentsFileForEdit(data?.attachments);
      setIsMedical(data?.is_medical === 1 ? true : false);
    }
  };

  const viewRemoteWorkData = async (id) => {
    setRemoteId(id);
    setShowViewRemoteModal(true);
    window.history.replaceState(null, '', `/view-remote-work/${id}`);
  };

  const applyForRemoteWork = async () => {
    clearControl();
    cstShowAddRemoteWorkModal();
  };

  const CustomUI = ({ onClose, params }) => {

  const handleSubmitStatusNote = () => {
    params["note"] = remoteWorkStatusNote?.current?.value ? remoteWorkStatusNote?.current?.value : '';
    updateRemoteWorkStatus(params);
    onClose();
  };

  useEffect(() => {
    if (userData.role_code !== databaseRoleCode.adminCode) {
      APIService.getAllTeamMembers()
        .then((response) => {
          if (response.data?.status) {
            setTeamMemberOption([{ label: 'Select Member', value: 0 }, { label: 'All Member', value: -1 }, ...response.data?.data]);
          }
        });      
    }
  }, []);

    return (
      <div className="react-confirm-alert">
        <div className="react-confirm-alert-body">
          <h1>Confirm</h1>          
          <Form.Group className="mb-5 mt-3 w-100">
            <Form.Label className='float-start'>Note</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Enter Note" ref={remoteWorkStatusNote} className={`form-control`} maxLength={300} />
          </Form.Group>
          <div className="react-confirm-alert-button-group">
            <button className="btn btn-primary btn-lg" label="Confirm" onClick={(e) => { handleSubmitStatusNote(); }}>Submit</button>
            <button className="btn btn-outline-secondary btn-lg" label="No" onClick={onClose}>No</button>
          </div>
        </div>
      </div>
    );
  };

  const handleRemmoteWorkStatus = async (id, status) => {
    let params = {};
    params["id"] = id;
    params["status"] = status;
    if (userData?.role_code === databaseRoleCode.adminCode) {
      updateRemoteWorkStatus(params);
    }
    else {
      confirmAlert({
        customUI: ({ onClose }) => {
          return <CustomUI onClose={onClose} params={params} />
        }
      });
    }
  };

  const updateRemoteWorkStatus = async (params) => {
    APIService.updateRemoteWorkStatus(params)
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

  const handleRemoteWorkDelete = async (id) => {
    confirmAlert({
      title: 'Confirm',
      message: DELETE_REMOTE_WORK,
      buttons: [
        {
          label: 'Yes',
          className: 'btn btn-primary btn-lg',
          onClick: () => {
            let params = {};
            params["id"] = id;
            APIService.deleteRemoteWork(params)
              .then((response) => {
                if (response.data?.status) {
                  let newLeaveList = leaveList.filter(function (arr) {
                    setPageDesignRefresh(!pageDesignRefresh);
                    return arr.id !== id;
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

  const addUpdateRemoteWork = async () => {
    setSaveProcess(true);
    setFormErrors([]);
    
    let validate = validateForm((RemoteWorkValidator(date, halfDay ? 'Not required' : dueDate, reason)));
    if (Object.keys(validate).length) {
      setSaveProcess(false);
      setFormErrors(validate);
    }
    else {
      const params = new FormData();
      params.append("status", remoteStatus);
      params.append("message", reason);
      params.append("startdate", format(date, "yyyy-MM-dd"));
      let totalDay = 0, half_leave = 0, enddate = null;
      if (halfDay) {
        totalDay = 0.5;
        half_leave = 1;
        enddate = format(date, "yyyy-MM-dd");
      }
      else {
        let difference = dueDate.getTime() - date.getTime();
        totalDay = Math.ceil(difference / (1000 * 3600 * 24)) + 1;
        enddate = format(dueDate, "yyyy-MM-dd");
      }
      params.append("enddate", enddate);
      params.append("totaldays", totalDay);
      params.append("half_day", half_leave);
      params.append("staffid", userData?.id);
      params.append("is_medical", isMedical);
      let len = attachmentsFile1?.length ? attachmentsFile1.length : 0;
      for (let i = 0; i < len; i++) {
          params.append(
              "attechment",
              attachmentsFile1[i].file
          );
      }

      if (remoteId === 0) {
        APIService.addRemoteWorkRequest(params)
          .then((response) => {
            if (response.data?.status) {
              toast.success(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
              setReloadPage(!reloadPage);
              clearControl();
              cstSetCloseAddRemoteWorkModal();
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
        params.append('id', remoteId);
        APIService.updateRemoteWork(params)
          .then((response) => {
            if (response.data?.status) {
              toast.success(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
              setReloadPage(!reloadPage);
              clearControl();
              cstSetCloseAddRemoteWorkModal();
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
    setHalfDay(false);
    setRemoteStatus(1);
    setReason('');
    setRemoteId(0);
    setFormErrors([]);
    setFilterDate(null);
    setAttachmentsFile1([]);
    setIsMedical(false);
    
  };

  const handleClearFilter = async (e) => {
    setStaffId(0);
    setYear(new Date().getFullYear());
    setDesignation(0);
    setMonth(userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.hrCode ?  new Date().getMonth() + 1 : 0);
    setFilterDate(null);
    setTeamMember(0);
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

  useEffect(() => {
    if (userData.role_code !== databaseRoleCode.adminCode) {
      APIService.getAllTeamMembers()
        .then((response) => {
          if (response.data?.status) {
            setTeamMemberOption([{ label: 'Select Member', value: 0 }, { label: 'All Member', value: -1 }, ...response.data?.data]);
          }
        });
    }
  }, []);
  
  const handleTeamMemberSelect = e => {
    setTeamMember(e.value);
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

  const handleRemoveAttachmentsFile = (img) => {
    let newFileList = attachmentsFile1.filter(function (arr) {
        return arr.source !== img;
    })
    setAttachmentsFile1(newFileList);
  };

  const handleAttachmentClick = async (file) => {
    window.open(file, '_blank', 'noopener,noreferrer');
  }
  
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
                    params["id"] = remoteId;
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

  const disabledDates = [
    new Date(2024, 7, 16), // Remember, JavaScript dates start counting months from 0 (January) to 11 (December)
    new Date(2024, 7, 20),
    new Date(2024, 4, 6),
    new Date(2024, 5, 3),
    new Date(2024, 5, 10),

  ];

  return (
    <>
      <Sidebar />

      <ViewRemoteWork showViewRemoteModal={showViewRemoteModal} setShowViewRemoteModal={setShowViewRemoteModal} handleRemoteWorkEdit={handleRemoteWorkEdit} remoteId={remoteId} handleRemoteWorkDelete={handleRemoteWorkDelete} reloadPage={reloadPage} setReloadPage={setReloadPage} statusList={statusList}/>

      <div className="main-content">
        <Header pagename={name} headerFilterButton={<Button onClick={cstPageOffcanvasisShow} variant="outline-secondary" size="md" type="button" className='ms-auto d-xl-none d-block'>Filter <i className="icon-filter ms-2"></i></Button>}/>
        { userData?.is_wfh === 0 ?
          <div className="inner-content pt-0 px-0">
            <div className="remote-work-page">
              <div className="bg-white py-3 px-4 px-lg-7 page-inner-header">
                <Row>
                  <Col xl={7} xxl={7} xs={12}>
                    <Row className='g-2'>
                      <Col xs="auto">
                        <PermissionCheck permissions={['remote_work.create']}>
                          <Button variant="primary" size="md" className='text-nowrap' onClick={applyForRemoteWork}><i className="icon-add me-2"></i> Add Request</Button>
                        </PermissionCheck>                      
                      </Col>
                      <Col xs={12} className='col-md'>                      
                        {
                          ((userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.hrCode) || staffId !== 0 && filterdate !== null) ?
                            <>
                              <Row className='g-2'>
                                <Col>
                                  <Card className="rounded-12 border border-gray-100 leave-card h-100">
                                    <Card.Body className="p-3 p-md:2 px-xxl-4">
                                        <span className="h2 mb-0 d-md-none">{ approvedLeaveCount }</span>
                                        <span className="text-gray-600 d-block font-weight-medium">Approved <span className='d-none d-md-inline'>: { approvedLeaveCount }</span></span>
                                    </Card.Body>
                                  </Card>
                                </Col>
                                <Col>
                                  <Card className="rounded-12 border border-gray-100 leave-card h-100">
                                    <Card.Body className="p-3 p-md:2 px-xxl-4">
                                      <span className="h2 mb-0 d-md-none">{ pendingLeaveCount }</span>
                                        <span className="text-gray-600 d-block font-weight-medium">Pending <span className='d-none d-md-inline'>: { pendingLeaveCount }</span></span>
                                    </Card.Body>
                                  </Card>
                                </Col>
                                <Col>
                                  <Card className="rounded-12 border border-gray-100 leave-card h-100">
                                    <Card.Body className="p-3 p-md:2 px-xxl-4">
                                        <span className="h2 mb-0 d-md-none">{ disapprovedLeaveCount }</span>
                                        <span className="text-gray-600 d-block font-weight-medium">Disapproved <span className='d-none d-md-inline'>: { disapprovedLeaveCount }</span></span>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              </Row>
                            </>
                            :
                            <></>
                        }
                      </Col>
                    </Row>
                  </Col>
                  
                  <Col xl={5} xxl={5} xs={12}> 
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
                                : 
                                <>
                                {teamMemberOption.length > 2 &&
                                  <Col xs={12}>
                                    <Select styles={customStyles} className="control-md custom-select" options={teamMemberOption} onChange={handleTeamMemberSelect}
                                      value={teamMemberOption.filter(function (option) {
                                        return option.value === teamMember;
                                      })} />
                                  </Col>
                                }
                                </>
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
                
                <Card className="rounded-10 p-4 p-xl-6">
                  <Card.Body className="p-0 remote-work-table">
                    <DataTableWithPagination columns={columns} data={leaveList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isBulkAction={false} exportData={exportData} CustomclassName="list-table remote-work-list-table" />
                  </Card.Body>
                </Card>
              </div>
            </div>

            <Offcanvas show={showAddRemoteWorkModal} onHide={cstSetCloseAddRemoteWorkModal} className="add-leave-sidebar" placement="end">
              <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
                <div className="d-flex align-items-center">
                  <h3 className="m-0">Apply for Remote Work</h3>
                </div>
                <ul className="ovrlay-header-icons">
                  <li>
                    <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={cstSetCloseAddRemoteWorkModal}>
                      <i className="icon-cancel"></i>
                    </button>
                  </li>
                </ul>
              </Offcanvas.Header>
              <Offcanvas.Body className="p-0">
                <Form onSubmit={async e => { e.preventDefault(); await addUpdateRemoteWork() }}>
                  <SimpleBar className="offcanvas-inner">
                    <div className="p-6">
                      <Row className="g-7">
                        
                        <Col xs={12} sm={12} md={6}>
                          <Form.Label className="d-block">Start Date<span className='validation-required-direct'></span></Form.Label>
                          <SingleDatePickerControl
                            selected={date}
                            onDateChange={(date) => setDate(date)}
                            onChange={(date) => setDate(date)}
                            minDate={new Date(new Date().getFullYear(), 0, 1)}
                            maxDate={allowedUserIds.includes(userData.id) ? new Date(new Date().getFullYear(), 11, 30) : new Date(new Date().getFullYear(), 5, 30)}
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
                          {!halfDay &&
                            <>
                              <Form.Label className="d-block">End Date<span className='validation-required-direct'></span></Form.Label>
                              <SingleDatePickerControl
                                selected={dueDate}
                                onDateChange={(date) => setDueDate(date)}
                                onChange={(date) => setDueDate(date)}
                                minDate={date ? date : new Date(new Date().getFullYear(), 0, 1)}
                                maxDate={allowedUserIds.includes(userData.id) ? new Date(new Date().getFullYear(), 11, 30) : new Date(new Date().getFullYear(), 5, 30)}
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
                          <Form.Label className="d-block">Half Day</Form.Label>
                          <Form.Check type="checkbox" id="half-day" checked={halfDay} onChange={(e) => { setHalfDay(e.target.checked); setDueDate(null); }} />
                        </Col>

                        <Col xs={12} sm={12} md={6}>
                          <Form.Label className="d-block">Medical</Form.Label>
                          <Form.Check type="checkbox" id="medical" checked={isMedical} onChange={(e) => { setIsMedical(e.target.checked);}} />
                        </Col>
                          
                        {isMedical > 0 &&
                          <div className="task-attachment mt-7">
                              <span className="font-12 font-weight-semibold dark-1 d-block mb-3">Attachments</span>
                              <FileUploader handleChange={handleDragAndDropChange} multiple={true} name="file" types={attachmentsAllowExtension} maxSize={10} children={<div className="custom-flie-input"><span><i className='icon-attachment me-2'></i> Upload or drop a file right here</span></div>} onTypeError={(e) => { setFormErrors({ fileUploader: `${e} ${attachmentsAllowExtensionMsg}` }); }} onSizeError={(e) => { setFormErrors({ fileUploader: `${e} file size should less than 10MB` }); }} />
                              {formErrors.fileUploader && (
                                  <span className="text-danger d-block">{formErrors.fileUploader}</span>
                              )}
                              <div className="task-content mt-2 row">
                                  {attachmentsFile1 && (
                                      attachmentsFile1.map((file, index) => (
                                          <div className="task-content-list d-lg-block align-items-center col-12 col-md-4 col-lg-3 col-xl-3 mb-2" key={index}>
                                              <AttachmentPreview file={file} handleRemoveAttachmentsFile={handleRemoveAttachmentsFile} handleAttachmentClick={handleAttachmentClick} />
                                          </div>
                                      ))
                                  )}
                                  {attachmentsFileForEdit && attachmentsFileForEdit.map((file, index) => (
                                    <div className="d-lg-block align-items-center col-6 col-sm-4 col-lg-3 col-xl-3 mb-2" key={index}>
                                        <AttachmentPreview file={file} handleRemoveAttachmentsFile={handleRemoveAttachmentsFileFromEdit} handleAttachmentClick={handleAttachmentClick} editMode={true} />
                                    </div>
                                  ))} 
                                  {(attachmentsFile1 && attachmentsFile1.length === 0) && attachmentsFileForEdit && (attachmentsFileForEdit.length === 0) &&
                                    <span>No file selected</span>
                                  }
                              </div>
                          </div> 
                      }


                        <Col xs={12} >
                          <Form.Label className="d-block">Reason<span className='validation-required-direct'></span></Form.Label>
                          <Form.Control as="textarea" rows={3} placeholder="Add Remote Reason" value={reason} onChange={(e) => { setReason(e.target.value) }} className={`description-area placeholder-dark  dark-2 ${formErrors.reasonInput && 'is-invalid'}`} maxLength={300} />
                          {formErrors.reasonInput && (
                            <span className="text-danger">{formErrors.reasonInput}</span>
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
        : <NoPermission />
        }
        <Footer />
      </div>
    </>
  );
}
const mapStateToProps = (state) => ({
  userData: state.Auth.user
})

export default connect(mapStateToProps)(RemoteWork)