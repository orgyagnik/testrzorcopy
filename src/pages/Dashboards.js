import React, { useEffect, useState, useRef  } from 'react';
import Sidebar from '../modules/main/Sidebar';
import Header from '../modules/main/Header';
import Footer from '../modules/main/Footer';
import { Accordion, Card, Col, Row, ListGroup, Dropdown, Button, Badge, Tabs, Tab, OverlayTrigger, Tooltip as TooltipReact } from 'react-bootstrap';
import "react-dates/initialize";
import { Link, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { toast } from 'react-toastify';
import APIService from "../api/APIService";
import { setFavoritesTask } from "../store/reducers/App";
import Store from "../store";
import { databaseRoleCode, display_date_format, popperConfig, leaveStatusList, office_display_date_format_for_date, office_display_date_format_with_time, monthList } from '../settings';
import moment from 'moment';
import { DELETE_FAVOURITETASK } from '../modules/lang/Task';
import { confirmAlert } from 'react-confirm-alert';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Tooltip } from "bootstrap";
import StaticDataTable from "../modules/custom/DataTable/StaticDataTable";
import { getLeaveStatus, check, getLeaveOnlyStatus } from "../utils/functions.js";
import PermissionCheck from "../modules/Auth/PermissionCheck";
import { format } from 'date-fns';
import Select from 'react-select';
import CalendarViewIcon from "../assets/img/icons/calendar-view.svg";
//import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { useLocation } from "react-router-dom";
import Chart from 'react-apexcharts';
import CountryMap from "./CountryMap";

let tooltipInstance = null;
function Dashboard({ name, user, favoritesTask, userData }) {
  const history = useHistory();
  const [agencyDashboardData, setAgencyDashboardData] = useState([]);
  const [calendarLeaveList, setCalendarLeaveList] = useState([]);
  const [calendarStartEndDate, setCalendarStartEndDate] = useState(null);
  const [dashboardHoursStats, setDashboardHoursStats] = useState([]);
  const [taskSummary, setTaskSummary] = useState([]);

  const [activeTab, SetActiveTab] = useState("today_leaves");
  const [leaveList, setLeaveList] = useState([]);
  const [reloadLeaveList, setReloadLeaveList] = useState([]);
  
  const [bucketPlanExpireList, setBucketPlanExpireList] = useState([]);
  const [reloadBucketPlanExpireList, setReloadBucketPlanExpireList] = useState([]);

  const [tableViewleaveList, setTableViewLeaveList] = useState('');

  const [searchFilter, setSearchFilter] = useState('');
  const [month, setMonth] = useState(user?.role_code === databaseRoleCode.adminCode || user?.role_code === databaseRoleCode.hrCode ?  new Date().getMonth() + 1 : 0);
  const [yearList, setYearList] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [designationOption, setDesignationOption] = useState([]);
  const [designation, setDesignation] = useState(0);
  const myDivRef = useRef(null);
  const search = useLocation().search;
  const [graphData, setGraphData] = useState([]);
  let task_type = 0;
  const [refresh, setRefresh] = useState(false);
  const [refreshForNewPage, setRefreshForNewPage] = useState(false);
  const [refreshButtonProcess, setRefreshButtonProcess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Calculate total tasks
  const totalTasks = 
  (taskSummary['awaiting-feedback'] || 0) +
  (taskSummary['published'] || 0) +
  (taskSummary['rejected'] || 0) +
  (taskSummary['in-progress'] || 0) +
  (taskSummary['not-started'] || 0) +
  (taskSummary['pending-approval'] || 0) +
  (taskSummary['internal-review'] || 0);

  const topicsApprovedCount = 
  (taskSummary['not-started'] || 0) +
  (taskSummary['awaiting-feedback'] || 0) +
  (taskSummary['testing'] || 0) +
  (taskSummary['in-progress'] || 0) +
  (taskSummary['published'] || 0);

  const handleRefreshPage = () => {
    setRefresh(!refresh);
    setRefreshForNewPage(!refreshForNewPage);
    setRefreshButtonProcess(true);
  }
  useEffect(() => {
    // Call handleRefreshPage when 'pending-approval' or 'rejected' values change
    handleRefreshPage();
  }, [taskSummary['pending-approval'], taskSummary['rejected']]);

  // useEffect(() => {
  //   let task_type_new = userData?.role_code === databaseRoleCode.clientCode ? '0,1' : task_type;
  //   let params = "?task_type=" + task_type_new;
  //   APIService.getTaskSummary(params)
  //     .then((response) => {
  //       if (response.data?.status) {
  //         setTaskSummary(response.data?.data);
  //         console.log(response.data?.data);
  //       }
  //     });
  // }, [refresh, refreshForNewPage]);

  useEffect(() => {
    // Directly use the calculated values for totalTasks, topicsApprovedCount, etc.
    // Ensure these values are updated in the state whenever the underlying data changes
    const seriesData = [
      totalTasks, // Topics Generated
      topicsApprovedCount, // Topics Approved
      taskSummary['pending-approval'] || 0, // Topics Pending Approval
      taskSummary['rejected'] || 0, // Topics Rejected
    ];
  
    setGraphData([{
      name: "Task Counts",
      data: seriesData,
      markers: {
        colors: ['#f1ecfe'],
      }
    }]);
  
    // This effect should depend on the variables it uses
  }, [totalTasks, topicsApprovedCount, taskSummary]);

// Ensure the chartOptions are correctly set up for the graph
const chartOptions = {
  chart: {
    type: 'area',
    height: 350,
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    colors: ['#7152F3']
  },
  markers: {
    size: 0, // Make markers invisible by default
    colors: ['#f1ecfe'],
    strokeColors: '#f1ecfe',
    strokeWidth: 2,
    hover: {
      size: 5, // Size of the marker on hover
      sizeOffset: 2
    }
  },
  xaxis: {
    categories: [
      'Generated', 'Approved', 'Pending Approval', 'Rejected'
    ],
    labels: {
    
      minHeight: 50,
      style: {
        colors: [],
        fontSize: '12px',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontWeight: 400,
        cssClass: 'apexcharts-xaxis-label',
      },
    },
    axisBorder: {
      show: true
    },
    axisTicks: {
      show: true
    }
  },
  tooltip: {
    marker: {
      show: true,
      fillColors: ['#7152F3']
    },
    x: {
      format: 'dd/MM/yy HH:mm'
    },
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      colorStops: [
        {
          offset: 0,
          color: "#f1ecfe",
          opacity: 0.7
        },
        {
          offset: 90,
          color: "#f1ecfe",
          opacity: 0.9
        },
        {
          offset: 100,
          color: "#f1ecfe",
          opacity: 0.9
        }
      ],
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 90, 100]
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

  useEffect(() => {
    if (user.role.code === databaseRoleCode.agencyCode || user.role.code === databaseRoleCode.agencyMemberCode) {
      let params = {};
      APIService.agencyDashboard(params)
        .then((response) => {
          if (response.data?.status) {
            setAgencyDashboardData(response.data?.data);
          }
        });
    }
    // setTimeout(() => {
    //   if (user.role.code === databaseRoleCode.adminCode || user.role.code === databaseRoleCode.accountantCode) {
    //     let params1 = "";
    //     APIService.dashboardHoursStats(params1)
    //       .then((response) => {
    //         if (response.data?.status) {
    //           setDashboardHoursStats(response.data?.data);
    //         }
    //       });
    //   }
    // }, 2000);
    // if (user.role.code === databaseRoleCode.clientCode) {
    //   let params = "?task_type=0,1";
    //   APIService.getTaskSummary(params)
    //     .then((response) => {
    //       if (response.data?.status) {
    //         setTaskSummary(response.data?.data);
    //       }
    //     });
    // }
  }, []);

  // useEffect(() => {
  //   if (user.role.code === databaseRoleCode.employeeCode || user.role.code === databaseRoleCode.pcCode || user.role.code === databaseRoleCode.accountantCode || user.role.code === databaseRoleCode.adminCode || user.role.code === databaseRoleCode.hrCode || user.role.code === databaseRoleCode.teamLeadCode || user.role.code === databaseRoleCode.projectManageAiCode) {
  //     APIService.getDashboardLeaveLists('')
  //       .then((response) => {
  //         if (response.data?.status) {
  //           setLeaveList(response.data?.data);
  //         }
  //       });
  //   }
  // }, [reloadLeaveList]);

  useEffect(() => {
    if ((user.role.code === databaseRoleCode.adminCode || user.role.code === databaseRoleCode.hrCode) && calendarStartEndDate !== null) {
      let params1 = `?status=1,2&startdate=${calendarStartEndDate.start}&enddate=${calendarStartEndDate.end}&view=${calendarStartEndDate.view}`;
      APIService.getLeaveCalendar(params1)
        .then((response) => {
          if (response.data?.status) {
            setCalendarLeaveList(response.data?.data);
          }
        });
    }
  }, [calendarStartEndDate]);

  const handleAddRemoveFavorite = (status, taskId) => {
    confirmAlert({
      title: 'Confirm',
      message: DELETE_FAVOURITETASK,
      buttons: [
        {
          label: 'Yes',
          className: 'btn btn-primary btn-lg',
          onClick: () => {
            let params = {};
            params["taskid"] = parseInt(taskId);
            params["remove"] = status;
            params["staffid"] = user.role.code === databaseRoleCode.clientCode ? user?.userid : user?.id;
            APIService.addRemoveFavorite(params)
              .then((response) => {
                if (response.data?.status) {
                  toast.success(response.data?.message, {
                    position: toast.POSITION.TOP_RIGHT
                  });
                  APIService.getFavavoriteTasks()
                    .then((response) => {
                      if (response.data?.status) {
                        Store.dispatch(setFavoritesTask(response.data?.data));
                      }
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

  const handleMouseEnter = (info) => {
    if (info.event.extendedProps.description) {
      tooltipInstance = new Tooltip(info.el, {
        title: info.event.extendedProps.description,
        html: true,
        placement: "top",
        trigger: "hover",
        container: "body"
      });

      tooltipInstance.show();
    }
  };

  const handleMouseLeave = (info) => {
    if (tooltipInstance) {
      tooltipInstance.dispose();
      tooltipInstance = null;
    }
  };

  let leaveColumns = [
    {
      name: 'Employee',
      id: 'empname',
      sortable: true,
      filterable: true,
      selector: (row) => row?.empname,
      cell: (row) => <>
        {user?.role_code === databaseRoleCode.adminCode || user?.role_code === databaseRoleCode.hrCode ?
          <Link to={`/leaves?q=${row.assigned}`} className="dark-1">{row.empname}</Link>
          :
          <span>{row?.empname}</span>
        }
      </>,
    },
    {
      name: 'Start Date',
      id: 'startdate',
      sortable: true,
      filterable: true,
      selector: (row) => row?.startdate && moment(new Date(row?.startdate)).format(office_display_date_format_for_date),
    },
    {
      name: 'End Date',
      id: 'enddate',
      sortable: true,
      filterable: true,
      selector: (row) => row?.enddate && moment(new Date(row?.enddate)).format(office_display_date_format_for_date),
    },
    {
      name: 'Total Days',
      id: 'totaldays',
      sortable: true,
      filterable: true,
      selector: (row) => row?.totaldays,
    },
  ];

  if (user?.role_code === databaseRoleCode.adminCode || user?.role_code === databaseRoleCode.hrCode) {
    leaveColumns = [
      ...leaveColumns,
      {
        name: 'Reason',
        id: 'leave_reason',
        sortable: false,
        filterable: true,
        width: "420px",
        selector: (row) => row?.message,
      },
      {
        name: 'Status',
        id: 'status',
        sortable: true,
        filterable: true,
        selector: (row) => getLeaveOnlyStatus(row?.status),
        cell: (row) => <>
          {getLeaveStatus(row?.status)}
        </>,
      },
      {
        name: 'Leave Type',
        id: 'leave_type',
        sortable: true,
        filterable: true,
        selector: (row) => row?.leave_type,
      },
      {
        name: 'Date Added',
        id: 'dateadded',
        sortable: true,
        filterable: true,
        selector: (row) => row?.dateadded && format(new Date(row?.dateadded), office_display_date_format_with_time),
        //selector: (row) => row?.dateadded && moment(new Date(row?.dateadded)).format(display_date_format_with_time),
        width: "180px",
      },
    ];
  }

  if (check(['leaves.update', 'leaves.delete'], user?.permission) && user?.role_code === databaseRoleCode.adminCode) {
    leaveColumns = [
      ...leaveColumns,
      {
        name: 'Action',
        id: 'action',
        sortable: false,
        filterable: false,
        cell: (row) => (
          <>
            {(row?.status === 1 || user?.role_code === databaseRoleCode.adminCode) &&
              <Dropdown className="category-dropdown edit-task-dropdown">
                <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="cursor-pointer" id="edit-task"><button size="sm" className='btn btn-white circle-btn btn-icon btn-sm'><i className="fa-solid fa-ellipsis-vertical"></i></button></Dropdown.Toggle>
                <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2" popperConfig={popperConfig}>
                  {user?.role_code === databaseRoleCode.adminCode &&
                    leaveStatusList?.filter(function (arr) { return arr.value !== row?.status; }).map((leaveStatus, index) => (
                      <PermissionCheck permissions={['leaves.update']} key={index}>
                        <Dropdown.Item onClick={() => { handleLeaveStatus(row?.ticketid, leaveStatus.value) }}>
                          Mark as {leaveStatus.label}
                        </Dropdown.Item>
                      </PermissionCheck>
                    ))
                  }
                </Dropdown.Menu>
              </Dropdown>
            }
          </>
        ),
      },
    ]
  }

  const handleLeaveStatus = async (ticketid, status) => {
    let params = {};
    params["ticketid"] = ticketid;
    params["status"] = status;
    APIService.updateLeaveStatus(params)
      .then((response) => {
        if (response.data?.status) {
          toast.success(response.data?.message, {
            position: toast.POSITION.TOP_RIGHT
          });
          setReloadLeaveList(!reloadLeaveList);
        }
        else {
          toast.error(response.data?.message, {
            position: toast.POSITION.TOP_RIGHT
          });
        }
      });
  };

  const handleCalendarLeaveClick = (e) => {
    handleMouseLeave("");
    history.push(`/leaves?q=${e.event.id}`);
  }

  useEffect(() => {
    if (user.role.code === databaseRoleCode.accountantCode) {
      APIService.getBucketPlanExpireList('')
        .then((response) => {
          if (response.data?.status) {
            setBucketPlanExpireList(response.data?.data);
          }
        });
    }
  }, [reloadBucketPlanExpireList]);

  let bucketPlanExpireColumns = [
    {
      name: 'Agency Name',
      id: 'agency_name',
      sortable: true,
      filterable: true,
      selector: (row) => row?.agency_name,      
    },
    {
      name: 'Balance',
      id: 'remaining_hours',
      sortable: true,
      filterable: true,
      selector: (row) => row?.remaining_hours, 
      cell: (row) => <>        
          <span className='text-danger'>{row?.remaining_hours}</span>
      </>,     
    }    
  ];

  useEffect(() => {
    if(check(['leaves.calendar_view'], user?.permission)){
    
      let params = "";
      if (searchFilter !== '') {
        params+= `?search=${searchFilter}`;
      }

      if (month !== 0) {
        params += (params === "") ? `?month=${month}` : `&month=${month}`;
      }

      if (year !== 0) {
        params += (params === "") ? `?year=${year}` : `&year=${year}`;
      }

      if (`${designation}` !== '0') {
        params += (params === "") ? `?designation=${designation}` : `&designation=${designation}`;
      }
      
      APIService.getDashboardLeaveListTableView(params)
        .then((response) => {
          if (response.data?.status) {
            setTableViewLeaveList(response.data?.data);
          }
        });
    
    }
  }, [searchFilter, month, year, designation]);

  const handleSearchInputChange = (value) => {
    setSearchFilter(value);
  };

  const handleMonthSelect = e => {
    setMonth(e.value);
  };

  const handleClearFilter = async (e) => {
    setMonth(user?.role_code === databaseRoleCode.adminCode || user?.role_code === databaseRoleCode.hrCode ?  new Date().getMonth() + 1 : 0);
    setYear(new Date().getFullYear());
    setDesignation(0);
  };

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearTempList = [{ label: "Select Year", value: 0 }];
    for (let i = currentYear - 3; i <= currentYear + 1; i++) {
      yearTempList.push({ label: i, value: i });
    }
    setYearList(yearTempList);
  },[]);

  const handleYearSelect = e => {
    setYear(e.value);
  };

  const handleDesignationSelect = (selectedDesignation) => {
    setDesignation(selectedDesignation?.value);
  };

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
  }, []);

  const scrollToLeaveList = () => {
    if (myDivRef.current) {
      myDivRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <div>
        <Sidebar />
        <div className="main-content">
          <Header pagename={name ? name : ''} />
          <div className="inner-content">
            {user.role.code === databaseRoleCode.clientCode &&
              <>
                
                {/* <Row className="g-4 mb-7">
                  <Col xs={6} md={4} xl={4} xxl={2} >
                    <Card className="rounded-12 border border-gray-100 leave-card h-100">
                      <Card.Body className="p-3 px-xxl-4">
                        <Row className="align-items-center">
                          <Col>
                            <span className="h2 mb-0">{taskSummary['not-started-results-assign-me'] ? taskSummary['not-started-results-assign-me'] : 0}</span>
                            <span className="text-gray-600 d-block mb-1 font-weight-medium">Not Started</span>
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
                            <span className="h2 mb-0">{taskSummary['pending-approval-results-assign-me'] ? taskSummary['pending-approval-results-assign-me'] : 0}</span>
                            <span className="text-gray-600 d-block mb-1 font-weight-medium">Pending Approval</span>
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
                            <span className="h2 mb-0">{taskSummary['in-progress-assign-me'] ? taskSummary['in-progress-assign-me'] : 0}</span>
                            <span className="d-block mb-1 font-weight-medium text-primary">In Progress</span>
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
                            <span className="h2 mb-0">{taskSummary['testing-assign-me'] ? taskSummary['testing-assign-me'] : 0}</span>
                            <span className="d-block mb-1 font-weight-medium text-warning">Testing</span>
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
                            <span className="h2 mb-0">{taskSummary['awaiting-feedback-assign-me'] ? taskSummary['awaiting-feedback-assign-me'] : 0}</span>
                            <span className="d-block mb-1 font-weight-medium text-info">Awaiting Feedback</span>
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
                            <span className="h2 mb-0">{taskSummary['hold-assign-me'] ? taskSummary['hold-assign-me'] : 0}</span>
                            <span className="d-block mb-1 font-weight-medium text-danger">On Hold</span>
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
                            <span className="h2 mb-0">{taskSummary['complete-assign-me'] ? taskSummary['complete-assign-me'] : 0}</span>
                            <span className="d-block mb-1 font-weight-medium text-success">Complete</span>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row> */}
              </>
            }
            <Row className="mb-4 g-3 justify-content-center">
              {/* Link to Projects */}
              <Col xs={6} sm={4} md={2}>
                <Link to="/projects" className="text-decoration-none">
                  <Card className="rounded-10 border-0 shadow-sm h-100" style={{ backgroundColor: '#fff', maxWidth: '200px' }}>
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                      <i className="icon-listing mb-1" style={{ fontSize: '1.2rem', color: '#000' }}></i>
                      <h6 className="text-center m-0" style={{ fontSize: '0.9rem', color: '#000' }}>
                        Projects
                      </h6>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>

              {/* Link to Tasks */}
              <Col xs={6} sm={4} md={2}>
                <Link to="/tasks" className="text-decoration-none">
                  <Card className="rounded-10 border-0 shadow-sm h-100" style={{ backgroundColor: '#fff', maxWidth: '200px' }}>
                    <Card.Body className="p-2 d-flex flex-column align-items-center justify-content-center">
                      <i className="icon-task mb-1" style={{ fontSize: '1.2rem', color: '#000' }}></i>
                      <h6 className="text-center m-0" style={{ fontSize: '0.9rem', color: '#000' }}>
                        Tasks
                      </h6>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>

              {/* Link to Articles */}
              <Col xs={6} sm={4} md={2}>
                <Link to="/article-tasks" className="text-decoration-none">
                  <Card className="rounded-10 border-0 shadow-sm h-100" style={{ backgroundColor: '#fff', maxWidth: '200px' }}>
                    <Card.Body className="p-2 d-flex flex-column align-items-center justify-content-center">
                      <i className="icon-report mb-1" style={{ fontSize: '1.2rem', color: '#000' }}></i>
                      <h6 className="text-center m-0" style={{ fontSize: '0.9rem', color: '#000' }}>
                        Articles
                      </h6>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>

                {/* Link to Notes */}
                <Col xs={6} sm={4} md={2}>
                <Link to="/meeting-note" className="text-decoration-none">
                  <Card className="rounded-10 border-0 shadow-sm h-100" style={{ backgroundColor: '#fff', maxWidth: '200px' }}>
                    <Card.Body className="p-2 d-flex flex-column align-items-center justify-content-center">
                      <i className="icon-listing mb-1" style={{ fontSize: '1.2rem', color: '#000' }}></i>
                      <h6 className="text-center m-0" style={{ fontSize: '0.9rem', color: '#000' }}>
                        Meeting Notes
                      </h6>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            </Row>
            <Row className="mt-5 mb-4 g-4 justify-content-center"> 
              {/* Topics Overview Section */}
              <Col xs={12} md={6}>
                <Card className="rounded-10 border border-gray-100" style={{ backgroundColor: '#fff' }}>
                  <Card.Body className="d-flex flex-column" style={{ padding: '0' }}>
                    <div className="graph-section" style={{ padding: '20px' }}>
                      <h2 style={{ marginBottom: '40px' }}>Topics Overview</h2>
                      <Chart options={chartOptions} series={graphData} type="area" height={300} />
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Customers Demographic Section */}
              <Col xs={12} md={6}>
                <Card className="rounded-10 border border-gray-100 p-5" style={{ backgroundColor: '#fff' }}> {/* Updated styles to match Task Overview */}
                  <div className="flex justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Customers Demographic
                      </h2>
                      {/* <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                        Number of customer based on country
                      </p> */}
                    </div>
                    {/* Dropdown and MoreDotIcon components can be re-enabled or adjusted as needed */}
                  </div>
                  <div className="px-4 py-6 my-6 overflow-hidden rounded-2xl dark:border-gray-800 sm:px-6">
                    <CountryMap />
                  </div>
                  {/* Additional content for demographic details */}
                </Card>
              </Col>
            </Row>
            {(user.role.code === databaseRoleCode.agencyCode || user.role.code === databaseRoleCode.agencyMemberCode) && agencyDashboardData ?
              <Row className="mt-5 mb-8 g-4">
                <Col xs={12} xl={6} xxl={6}>
                  <Card className="rounded-10 border border-gray-100 mb-4 h-100">
                    <Card.Body className="p-0 flex-grow-0 flex-shrink-0">
                      <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                        <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Schedule Call</h3>
                      </div>
                    </Card.Body>
                    <Card.Body className="p-0">
                      {agencyDashboardData?.schedule_call_data?.calendly_url !== '' &&
                        <iframe title='Call' className="h-100 rounded-10 shedule-call-ifrme" src={agencyDashboardData?.schedule_call_data?.calendly_url}></iframe>
                      }
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12} xl={6} xxl={6}>
                  <Card className="rounded-10 border border-gray-100 mb-4 h-100">
                    <Card.Body className="p-0">
                      <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                        <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Quick Links</h3>
                      </div>
                    </Card.Body>
                    <Card.Body className="px-md-4 py-4">
                      <div className="px-md-3 py-md-3">
                        <div className="list-group list-group-flush">
                          {agencyDashboardData?.quick_links?.map((ql, index) => (
                            <div className="list-group-item py-lg-4 py-xl-5" key={index}>
                              <div className="row">
                                <div className="col-auto">
                                  <span className="avatar avatar-xs avatar-circle">
                                    <span className="avatar-initials avatar-dark-light border-transprant"><i className="icon-link"></i></span>
                                  </span>
                                </div>
                                <div className="col ps-0">
                                  {ql.name === "access@unlimitedwp.com" ?
                                    <>Our LastPass email: <a href={`mailto:${ql.name}`} rel="noreferrer" className="">{ql.name}</a></>
                                    :
                                    <a href={ql.link ? ql.link : '#'} target={ql.link ? '_blank' : ''} rel="noreferrer" className="dark-1">{ql.name}</a>
                                  }
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              : ''
            }
            <Accordion defaultActiveKey={['0', '1', '2']} alwaysOpen className="dashboard-accordion">
              {user.role.code !== databaseRoleCode.clientCode && favoritesTask.length > 0 &&
                <Accordion.Item eventKey="2">
                  <Accordion.Header as="h4">Recent Favourite Task</Accordion.Header>
                  <Accordion.Body>
                    <Row className="g-5">
                      {favoritesTask.map((fav, index) => (
                        <Col xl={3} md={4} sm={6} key={index}>
                          <Card className="border rounded-10 p-4 border-gray-100 project-card h-100">
                            <Card.Body className="p-0">
                              <div className="d-flex align-items-center mb-4">
                                <Badge className="fw-normal p-2 font-weight-semibold font-12" bg={fav.backgroundColor}>{fav.task_status_name}</Badge>
                                <Dropdown className="ms-auto">
                                  <Dropdown.Toggle as="a" bsPrefix="d-toggle" className="btn btn-white circle-btn btn-icon btn-sm" id="dropdown-basic">
                                    <i className="fa-solid fa-ellipsis-vertical"></i>
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu align="end" className="dropdown-menu-end p-2">
                                    <Dropdown.Item href="#" onClick={() => handleAddRemoveFavorite(1, fav.taskId)}>Remove from favorites</Dropdown.Item>
                                    <Dropdown.Item onClick={() => history.push(fav?.task_type === 1 ? `/edit-site-addons-task/${fav.taskId}` : `/edit-task/${fav.taskId}`)}>Edit Task</Dropdown.Item>
                                    <Dropdown.Item onClick={() => history.push(fav?.task_type === 1 ? `/view-site-addons-task/${fav.taskId}` : `/view-task/${fav.taskId}`)}>View Task</Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              </div>
                              <Card.Title className="dark-1"> <Link to={fav?.task_type === 1 ? `/view-site-addons-task/${fav.taskId}` : `/view-task/${fav.taskId}`}>{fav.task_name}</Link> <br /><span className="font-weight-normal dark-5 mt-1 d-block font-12"><Link className='dark-1' to={`/project-detail/${fav?.project_id}`}>({fav.project_name})</Link></span></Card.Title>
                              <ListGroup as="ul" className="mt-6">
                                <ListGroup.Item as="li" className="d-flex justify-content-between align-items-start border-0 py-1 font-12 mt-1 dark-1" >
                                  <div className="me-auto">Start Date</div>
                                  <div>{moment(fav?.startdate).format(display_date_format)}</div>
                                </ListGroup.Item>
                                <ListGroup.Item as="li" className="d-flex justify-content-between align-items-start border-0 py-1 font-12 mt-1" >
                                  <div className="me-auto">Due Date</div>
                                  <div>{fav?.duedate ? moment(fav?.duedate).format(display_date_format) : '-'}</div>
                                </ListGroup.Item>
                              </ListGroup>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              }
            </Accordion>
            {/* Bucket Plan Expire Code */}
            {/* {user.role.code === databaseRoleCode.accountantCode && bucketPlanExpireList ?
              <Row className="mt-6">
                <Col xs={12}>
                  <Card className="rounded-10 border border-gray-100 mb-4">
                    <Card.Body className="p-0">
                      <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                        <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Bucket Plan Expire</h3>                        
                      </div>
                    </Card.Body>
                    <Card.Body className="px-md-4 py-4">
                      <div className="px-md-3 py-md-3">
                          <StaticDataTable columns={bucketPlanExpireColumns} data={bucketPlanExpireList} isExport={false} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              : ''
            } */}
            {/* End Bucket Plan Expire Code */}
            {/* {user.role.code === databaseRoleCode.employeeCode || user.role.code === databaseRoleCode.pcCode || user.role.code === databaseRoleCode.accountantCode || user.role.code === databaseRoleCode.adminCode || user.role.code === databaseRoleCode.hrCode || user.role.code === databaseRoleCode.teamLeadCode || user.role.code === databaseRoleCode.projectManageAiCode ?
              <Row className="mt-6">
                <Col xs={12}>
                  <Card className="rounded-10 border border-gray-100 mb-4">
                    <Card.Body className="p-0">
                      <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                        <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Leave Update</h3>
                        <div className="ms-auto">
                          <Link to='/leaves' className='btn btn-outline-secondary btn-sm'>Go to Leave Page</Link>
                          {(check(['leaves.calendar_view'], user?.permission)) ?

                            <OverlayTrigger key={`overlay-calendar-view`} placement="top" overlay={<TooltipReact id={`TooltipReact-calendar-view`}> Leavelist</TooltipReact>}>
                              <button className='btn btn-outline-secondary btn-sm ms-2' onClick={scrollToLeaveList}><img src={CalendarViewIcon} alt="Calendar View" style={{ width: '18px', height: '18px' }} /></button>
                            </OverlayTrigger>
                            : ''
                          }
                        </div>
                      </div>
                    </Card.Body>
                    <Card.Body className="px-md-4 py-4">
                      <div className="px-md-3 py-md-3">
                        <Tabs activeKey={activeTab} id="completeCard" className="custom-tab leave-custom-tab  mb-3 border-gray-100 align-items-center" onSelect={(e) => { SetActiveTab(e) }}>
                          <Tab eventKey="today_leaves" title="Today's Leave update" className="px-0 pt-3 custom-tabpanel">
                            {leaveList?.today_leaves &&
                              <StaticDataTable columns={leaveColumns} data={leaveList?.today_leaves} isExport={false} />
                            }
                          </Tab>
                          {user.role.code === databaseRoleCode.pcCode || user.role.code === databaseRoleCode.accountantCode || user.role.code === databaseRoleCode.adminCode || user.role.code === databaseRoleCode.hrCode || user.role.code === databaseRoleCode.teamLeadCode || user.role.code === databaseRoleCode.projectManageAiCode?
                            <Tab eventKey="tomorrow_leaves" title="Tomorrow's Leave update" className="px-0 pt-3 custom-tabpanel">
                              {leaveList?.tomorrow_leaves &&
                                <StaticDataTable columns={leaveColumns} data={leaveList?.tomorrow_leaves} isExport={false} />
                              }
                            </Tab>
                            : ''}
                          
                          {user.role.code === databaseRoleCode.pcCode || user.role.code === databaseRoleCode.adminCode ?
                            <Tab eventKey="next_week_leaves" title="Next 7 Days Leave update" className="px-0 pt-3 custom-tabpanel">
                              {leaveList?.next_week_leaves &&
                                <StaticDataTable columns={leaveColumns} data={leaveList?.next_week_leaves} isExport={false} />
                              }
                            </Tab>
                            : ''}

                          {user.role.code === databaseRoleCode.adminCode || user.role.code === databaseRoleCode.hrCode ?
                            <Tab eventKey="pending_approval_leaves" title="Pending Approval" className="px-0 pt-3 custom-tabpanel">
                              {leaveList?.pending_leaves &&
                                <StaticDataTable columns={leaveColumns} data={leaveList?.pending_leaves} isExport={false} />
                              }
                            </Tab>
                            : ''}
                        </Tabs>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              : ''
            } */}



            {/* {user.role.code === databaseRoleCode.adminCode || user.role.code === databaseRoleCode.accountantCode ?
              <Row className="mt-8">
                <Col xs={12} xl={12} xxl={12}>
                  <Card className="rounded-10 border border-gray-100 mb-4">
                    <Card.Body className="p-0">
                      <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                        <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Hours Stats</h3>
                        <div className="ms-auto">
                          <Link to='/hourly-report' className='btn btn-outline-secondary btn-sm'>View Full Report</Link>
                        </div>
                      </div>
                    </Card.Body>
                    <Card.Body className="px-md-4 py-4">
                      <div className="px-md-3 py-md-3">
                        <Row className="g-4">
                          <Col xs={12} sm={6} xxl={4}>
                            <Card className="rounded-10 border border-gray-100 h-100 card">
                              <Card.Body className="px-3 py-3 py-xl-3 py-xxl-4 px-xl-6 px-xxl-8">
                                <div className="list-group list-group-flush">
                                  <div className="py-5 list-group-item border-gray-100">
                                    <div className="row g-0  align-items-center">
                                      <div className="col-8">
                                        <span className="font-weight-semibold text-gray-600 fs-18 me-2">Ideal Developer Availability</span>
                                      </div>
                                      <div className="col-4 text-end">
                                        <span className="text-gray-600 font-weight-semibold fs-18">{dashboardHoursStats?.ideal_availability ? dashboardHoursStats?.ideal_availability : 0}%</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="py-5 list-group-item border-gray-100">
                                    <div className="row g-0  align-items-center">
                                      <div className="col-8">
                                        <span className="font-weight-medium text-gray-600 fs-16 me-2">Ideal Agency Consumption</span>
                                      </div>
                                      <div className="col-4 text-end">
                                        <span className="text-gray-600 font-weight-medium fs-16">{dashboardHoursStats?.total_agency_hours ? dashboardHoursStats?.total_agency_hours : 0} Hrs</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="py-5 list-group-item border-gray-100">
                                    <div className="row g-0  align-items-center">
                                      <div className="col-8">
                                        <span className="font-weight-medium text-gray-600 fs-16 me-2">Dev Agency Hours</span>
                                      </div>
                                      <div className="col-4 text-end">
                                        <span className="text-gray-600 font-weight-medium fs-16">{dashboardHoursStats?.dev_agency_hours ? dashboardHoursStats?.dev_agency_hours : 0} Hrs</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="py-5 list-group-item border-gray-100">
                                    <div className="row g-0  align-items-center">
                                      <div className="col-8">
                                        <span className="font-weight-medium text-gray-600 fs-16 me-2">Addon Agency Hours</span>
                                      </div>
                                      <div className="col-4 text-end">
                                        <span className="text-gray-600 font-weight-medium fs-16">{dashboardHoursStats?.addon_agency_hours ? dashboardHoursStats?.addon_agency_hours : 0} Hrs</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col xs={12} sm={6} xxl={4}>
                            <Card className="rounded-10 border border-gray-100 h-100 card">
                              <Card.Body className="px-3 py-3 py-xl-3 py-xxl-4 px-xl-6 px-xxl-8">
                                <div className="list-group list-group-flush">
                                  <div className="py-5 list-group-item border-gray-100">
                                    <div className="row g-0  align-items-center">
                                      <div className="col-8">
                                        <span className="font-weight-semibold text-gray-600 fs-18 me-2">Actual Developer Availability</span>
                                      </div>
                                      <div className="col-4 text-end">
                                        <span className="text-gray-600 font-weight-semibold fs-18">{dashboardHoursStats?.actual_availability ? dashboardHoursStats?.actual_availability : 0}%</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="py-5 list-group-item border-gray-100">
                                    <div className="row g-0  align-items-center">
                                      <div className="col-8">
                                        <span className="font-weight-medium text-gray-600 fs-16 me-2">Actual Agency Consumption</span>
                                      </div>
                                      <div className="col-4 text-end">
                                        <span className="text-gray-600 font-weight-medium fs-16">{dashboardHoursStats?.total_assigned_emp_hours ? dashboardHoursStats?.total_assigned_emp_hours : 0} Hrs ({dashboardHoursStats?.actual_agency_onsumption ? dashboardHoursStats?.actual_agency_onsumption : 0}%)</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="py-5 list-group-item border-gray-100">
                                    <div className="row g-0  align-items-center">
                                      <div className="col-8">
                                        <span className="font-weight-medium text-gray-600 fs-16 me-2">Dev Agency Hours</span>
                                      </div>
                                      <div className="col-4 text-end">
                                        <span className="text-gray-600 font-weight-medium fs-16">{dashboardHoursStats?.dev_assigned_emp_hours ? dashboardHoursStats?.dev_assigned_emp_hours : 0} Hrs</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="py-5 list-group-item border-gray-100">
                                    <div className="row g-0  align-items-center">
                                      <div className="col-8">
                                        <span className="font-weight-medium text-gray-600 fs-16 me-2">Addon Agency Hours</span>
                                      </div>
                                      <div className="col-4 text-end">
                                        <span className="text-gray-600 font-weight-medium fs-16">{dashboardHoursStats?.addon_assigned_emp_hours ? dashboardHoursStats?.addon_assigned_emp_hours : 0} Hrs</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col xs={12} sm={6} xxl={4}>
                            <Card className="rounded-10 border border-gray-100 h-100 card">
                              <Card.Body className="px-3 py-3 py-xl-3 py-xxl-4 px-xl-6 px-xxl-8">
                                <div className="list-group list-group-flush">
                                  <div className="py-5 list-group-item border-gray-100">
                                    <div className="row g-0  align-items-center">
                                      <div className="col-8">
                                        <span className="font-weight-medium text-gray-600 fs-16 me-2">Employee Hours</span>
                                      </div>
                                      <div className="col-4 text-end">
                                        <span className="text-gray-600 font-weight-medium fs-16">{dashboardHoursStats?.total_emp_hours ? dashboardHoursStats?.total_emp_hours : 0} Hrs</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="py-5 list-group-item border-gray-100">
                                    <div className="row g-0  align-items-center">
                                      <div className="col-8">
                                        <span className="font-weight-medium text-gray-600 fs-16 me-2">Leave Hours</span>
                                      </div>
                                      <div className="col-4 text-end">
                                        <span className="text-gray-600 font-weight-medium fs-16">{dashboardHoursStats?.total_today_leave_hours ? dashboardHoursStats?.total_today_leave_hours : 0} Hrs</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="py-5 list-group-item border-gray-100">
                                    <div className="row g-0  align-items-center">
                                      <div className="col-8">
                                        <span className="font-weight-medium text-gray-600 fs-16 me-2">Available Hours</span>
                                      </div>
                                      <div className="col-4 text-end">
                                        <span className="text-gray-600 font-weight-medium fs-16">{dashboardHoursStats?.available_emp_hours ? dashboardHoursStats?.available_emp_hours : 0} Hrs</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              : ''
            } */}
            {/* {user.role.code === databaseRoleCode.adminCode || user.role.code === databaseRoleCode.hrCode ?
              <Row className="mt-6">
                <Col xs={12}>
                  <Card className="rounded-10 border border-gray-100 mb-4">
                    <Card.Body className="p-0">
                      <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                        <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Leave Calendar</h3>
                      </div>
                    </Card.Body>
                    <Card.Body className="px-md-4 py-4">
                      <div className="px-md-3 py-md-3">
                        <FullCalendar
                          initialView='dayGridMonth'
                          headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                          }}
                          themeSystem="Simplex"
                          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                          views={{
                            dayGridMonth: {
                              dayMaxEventRows: 8,
                            },
                            timeGridWeek: {
                              dayMaxEventRows: 8,
                            },
                            timeGridDay: {
                              dayMaxEventRows: false,
                            }
                          }}
                          contentHeight={'auto'}
                          contentWidth={'auto'}
                          events={calendarLeaveList}
                          eventClick={handleCalendarLeaveClick}
                          datesSet={(arg) => {
                            setCalendarStartEndDate({ start: moment(arg.start).format("YYYY-MM-DD"), end: moment(arg.end).format("YYYY-MM-DD"), view: arg.view.type });
                          }}
                          eventMouseEnter={handleMouseEnter}
                          eventMouseLeave={handleMouseLeave}
                        />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              : ''
            } */}
            {/* Leave design list start */}            
            {/* {tableViewleaveList &&
              <Row className="mt-6" ref={myDivRef}>
                  <Col xs={12}>
                    <Card className="rounded-10 border border-gray-100 mb-4">
                      <Card.Body className="p-0">
                        <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                          <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Leave List</h3>
                        </div>
                      </Card.Body>
                      <Card.Body className="px-md-4 py-4">
                      <div className='pb-4 page-inner-header shadow-none'>
                        <Row className="g-2 align-items-center">
                          <Col className="col-6 col-sm-auto">
                            <ul className='nav'>
                              <li className='me-6 d-flex align-items-center'>
                                <span className="avatar avatar-xs-status bottom-0 end-0 avatar-danger me-2">&nbsp;</span>
                                <span>SL Leave</span>
                              </li>
                              <li className='me-6 d-flex align-items-center'>
                                <span className="avatar avatar-xs-status bottom-0 end-0 bg-cyan-500 me-2">&nbsp;</span>
                                <span>CL Leave</span>
                              </li>
                              <li className='me-6 d-flex align-items-center'>
                                <span className="avatar avatar-xs-status bottom-0 end-0 bg-orange-500 me-2">&nbsp;</span>
                                <span>PL Leave</span>
                              </li>
                              <li className='me-6 d-flex align-items-center'>
                                <span className="avatar avatar-xs-status bottom-0 end-0 avatar-primary me-2">&nbsp;</span>
                                <span>UL Leave</span>
                              </li>
                              <li className='me-6 d-flex align-items-center'>
                                <span className="avatar avatar-xs-status bottom-0 end-0 bg-purple-500 me-2">&nbsp;</span>
                                <span>Comp-Off</span>
                              </li>
                              <li className='me-6 d-flex align-items-center'>
                                <span className="avatar avatar-xs-status bottom-0 end-0 bg-gray-200 me-2">&nbsp;</span>
                                <span>Off day</span>
                              </li>
                            </ul>                                         
                          </Col>
                          <Col className="d-xl-block d-none col-12 col-xl-4 col-xxl-4 col-xxxl-3 ms-auto ">
                            <div className="search-box w-100">
                              <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                <span className="icon-serach"></span>
                                <input type="text" className="form-control border-0" placeholder="Search Employee Name" value={searchFilter} onChange={(e) => handleSearchInputChange(e.target.value)}/>
                                <span className='search-clear icon-cancel cursor-pointer p-2 font-12 dark-6' onClick={(e) => { handleSearchInputChange('') }}></span>
                              </div>
                            </div>
                          </Col>
                          <Col className="col-12 col-md-auto">
                            <Dropdown className="taskboard-filter-dropdown" autoClose="outside">
                                <Dropdown.Toggle bsPrefix="filter-btn" variant="outline-secondary" size='md' id="dropdown-basic">
                                Filter <i className="icon-filter ms-2"></i><i className="icon-cancel ms-2"></i>
                              </Dropdown.Toggle>
                              <Dropdown.Menu align="down" className="dropdown-menu-end p-0 w-100">
                                <Dropdown.Header className="border-gray-100 border-bottom p-4 d-flex align-items-center">
                                  <h5 className='m-0'>Leave List Filter</h5>
                                  <Button variant="outline-secondary" size='sm' className="ms-auto" onClick={() => { handleClearFilter() }}>Clear Filter</Button>
                                </Dropdown.Header>
                                    <div className='p-4'>
                                      <Col Col xs={12}>
                                        <Select styles={customStyles} className="control-md mb-3 custom-select" options={designationOption} onChange={handleDesignationSelect}
                                        value={designationOption.filter(function (option) {
                                          return option.value === designation;
                                        })} />
                                      </Col>
                                      <Col xs={12}>
                                        <Select styles={customStyles} className="control-md mb-3 custom-select" options={monthList} onChange={handleMonthSelect}
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
                                    </div>
                                    
                              </Dropdown.Menu>
                            </Dropdown>
                          </Col>
                        </Row>
                        </div>
                        <div className="leave-list-table-wrapper">
                          <table className='leave-list-table-wrapper-table bg-white table-bordered list-table border-top-0 table'>
                              <thead>
                                <tr>
                                  <th>Employee Name</th>
                                  {tableViewleaveList?.date_group &&
                                    tableViewleaveList?.date_group?.map((date, date_index) => (
                                      <th key={`head_${date_index}`}>{date?.day_of_week}</th> 
                                    ))
                                  }
                                </tr>
                              </thead>
                              <tbody>
                                {tableViewleaveList?.employee_list &&
                                    tableViewleaveList?.employee_list?.map((emp, emp_index) => (
                                      <tr key={`row_${emp_index}`}>
                                          <td>{emp?.fullname}</td>
                                          
                                          {tableViewleaveList?.date_group &&
                                            tableViewleaveList?.date_group?.map((date, date_index) => {

                                              const empLeaveData = tableViewleaveList.leave_data.find(leave => leave.assigned === emp.staff_id && leave.startdate <= date.date && leave.enddate >= date.date);

                                              const leaveTypeClass = empLeaveData ? `${empLeaveData.leave_type.toLowerCase()}-leave` : '';
                                              const leaveType = empLeaveData ? empLeaveData?.half_leave : '';

                                              return (        
                                                leaveType === 'Half' ?
                                                  <OverlayTrigger key={`overlay-${date_index}`} placement="top" overlay={<TooltipReact id={`TooltipReact-${date_index}`}> {leaveType}</TooltipReact>}>     
                                                
                                                    <td key={`date_${date_index}`} className={`${date.leave_type ? date.leave_type : ''} ${leaveTypeClass}`}><div className='leave-inner'><span>{date.day}</span></div></td>

                                                  </OverlayTrigger>
                                                :
                                                  <td key={`date_${date_index}`} className={`${date.leave_type ? date.leave_type : ''} ${leaveTypeClass}`}><div className='leave-inner'><span>{date.day}</span></div></td>
                                              );

                                            })
                                          }
                                      </tr>
                                    ))
                                }
                              
                              </tbody>
                          </table>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
              </Row>
            } */}
            {/* Leave design list End */}
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}

const mapStateToProps = state => ({
  user: state.Auth.user,
  favoritesTask: state.App.favoritesTask,
})

export default connect(mapStateToProps)(Dashboard)