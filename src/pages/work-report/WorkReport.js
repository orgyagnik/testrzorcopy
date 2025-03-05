import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, Button, Dropdown, Offcanvas } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { pagination, office_display_date_format_with_time, office_display_date_format, indian_date_format, popperConfig, databaseRoleCode } from '../../settings';
import moment from 'moment';
import { check, capitalizeFirstWithRemoveUnderScore } from "../../utils/functions.js";
import { toast } from 'react-toastify';
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import { confirmAlert } from 'react-confirm-alert';
import { DELETE_WORK_REPORT } from '../../modules/lang/WorkReport';
import Select from 'react-select';
import { Link, useHistory } from "react-router-dom";
import RangeDatePickerControl from '../../modules/custom/RangeDatePickerControl';
import { format } from 'date-fns';
import ViewWorkReport from './ViewWorkReport';
import SingleDatePickerControl from '../../modules/custom/SingleDatePicker';

function WorkReport({ userData, name }) {
  //let { id } = useParams();
  let id = undefined;
  let history = useHistory();
  const currentURL = window.location.pathname;

  if (currentURL.includes("/view-work-report/")) {
    id = currentURL.replace("/view-work-report/", '');
  }

  const [showViewWorkReportModal, setShowViewWorkReportModal] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [reloadPage, setReloadPage] = useState(false);
  const [ticketSystemList, setTicketSystemList] = useState([]);
  const [page, setPage] = useState(1);
  const [searchFilter, setSearchFilter] = useState('');
  const [sort, setSort] = useState('desc');
  const [sortby, setSortBy] = useState('id');
  const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [startDate, setStartDate] = useState(userData.role_code === databaseRoleCode.adminCode ? moment()._d : moment().startOf('month')._d);
  const [endDate, setEndDate] = useState(userData.role_code === databaseRoleCode.adminCode ? moment()._d : moment(moment().endOf('month').format('YYYY-MM-DD'))._d);

  const [staffList, setStaffList] = useState([]);
  const [staffId, setStaffId] = useState(0);
  const [reportId, setReportId] = useState([]);
  const [designationOption, setDesignationOption] = useState([]);
  const [designation, setDesignation] = useState(0);
  const [teamMemberOption, setTeamMemberOption] = useState([]);
  const [teamMember, setTeamMember] = useState(0);

  const [exportData, setExportData] = useState([]);
  const [tableLoader, setTableLoader] = useState(false);

  const [showManageStaffSidebar, setShowManageStaffSidebar] = useState(false);
  const [staffForNotSendWorkReport, setStaffForNotSendWorkReport] = useState([]);
  const [startDateForNotSend, setStartDateForNotSend] = useState(userData.role_code === databaseRoleCode.adminCode ? moment()._d : moment().startOf('month')._d);
  const [reloadPageForNotSendReport, setReloadPageForNotSendReport] = useState(false);
  const msCloseManageStaffSidebar = () => setShowManageStaffSidebar(false);
  const msShowManageStaffSidebar = () => setShowManageStaffSidebar(true);
  const dropdownRef = useRef();
  const [isPageOffcanvasisActive, setIsPageOffcanvasisActive] = useState(false);
  
  useEffect(() => {
    if(currentURL === '/work-report'){
      setShowViewWorkReportModal(false);
      // setReloadPage(!reloadPage);
    }

    if (id !== undefined && `${id}` !== `${reportId}`) {
      if (currentURL === `/view-work-report/${id}`) {
        setReportId(id);
        setShowViewWorkReportModal(true);
      }
    }
  }, [id]);

  useEffect(() => {
    if(isPageOffcanvasisActive){
      if (userData.role_code !== databaseRoleCode.employeeCode) {
        APIService.getAllMembers('?role_code=office_staff')
          .then((response) => {
            if (response.data?.status) {
              let newStaffList = response.data?.data.map(item => {
                return { label: item.name, value: item.id }
              });
              setStaffList([{ label: 'All Staff', value: 0 }, ...newStaffList]);
            }
          });
      }

      if (userData.role_code !== databaseRoleCode.adminCode) {
        APIService.getAllTeamMembers()
          .then((response) => {
            if (response.data?.status) {
              setTeamMemberOption([{ label: 'Select Member', value: 0 }, { label: 'All Member', value: -1 }, ...response.data?.data]);
            }
          });
      }

      if (userData.role_code !== databaseRoleCode.employeeCode) {
        APIService.getDesignationList()
          .then((response) => {
            if (response.data?.status) {
              let newDesignationList = response.data?.data.map(item => {
                return { label: item.name, value: item.id }
              });
              setDesignationOption([{ label: 'All Designation', value: 0 }, ...newDesignationList]);
            }
          });
      }
    }

  }, [isPageOffcanvasisActive]);
  
  useEffect(() => {
    fetchWorkReportList();
    setFirstLoad(false);
  }, [sort, sortby, page, perPageSize]);

  useEffect(() => {
    if (firstLoad === false) {
      setPage(1);
      if (page === 1) {        
        const timer = setTimeout(() => {
          fetchWorkReportList();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [searchFilter, reloadPage]);
  
  useEffect(() => {    
    if (startDateForNotSend && check(['workreport.not_send_report'], userData?.role.getPermissions) && showManageStaffSidebar) {
      let params = "?";
      params = params + "sort=desc&limit=1000&page=1&sort_by=staffid";
      params = params + "&startdate=" + format(startDateForNotSend, "yyyy-MM-dd");
      params = params + "&enddate=" + format(startDateForNotSend, "yyyy-MM-dd");
      APIService.getWorkReportNotSendList(params)
        .then((response) => {
          if (response.data?.status) {
            setStaffForNotSendWorkReport(response.data?.data);
          }
        });
    }
    else {
      setStaffForNotSendWorkReport([]);
    }
  }, [reloadPageForNotSendReport, showManageStaffSidebar]);

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

  const fetchWorkReportList = () => {
    setTableLoader(true);
    let params = "?";
    params = params + "sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby;
    if (searchFilter !== '') {
      params = params + "&search=" + searchFilter;
    }
    if (staffId !== 0) {
      params = params + "&search_by_staff=" + staffId;
    }
    if (startDate && endDate) {
      params = params + "&startdate=" + format(startDate, "yyyy-MM-dd");
      params = params + "&enddate=" + format(endDate, "yyyy-MM-dd");
    }
    if (`${designation}` !== '0') {
      params = params + "&designation=" + designation;
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
    APIService.getWorkReportList(params)
      .then((response) => {
        if (response.data?.status) {
          let newData = response.data?.data;
          setTotalPages(response.data?.pagination?.total_pages);
          setTotalRecords(response.data?.pagination?.total_records);
          setTicketSystemList(newData);
          setTableLoader(false);
          let exportHeader = ["Report Date", "Early Punchout", "Draft", "Employee", "Total Hours", 'Full / Half Day', "Date Added"];
          let exportData = [];
          newData?.map(item => {
            exportData.push(
              {
                report_date: item.report_date ? format(new Date(item.report_date), office_display_date_format) : '',
                early_punchout: item.early_punchout === 1 ? "Yes" : "No",
                draft: item.save_as_draft === 1 ? "Yes" : "No",
                name: item.addedby_name ? item.addedby_name : '',
                total_hours: item.total_hours ? item.total_hours : '',
                working_day: item.working_day !== '' && item.working_day !== null ? capitalizeFirstWithRemoveUnderScore(item.working_day) : '',
                created_at: item.created_at ? format(new Date(item.created_at), office_display_date_format_with_time) : '',
              });
            return '';
          });
          setExportData({ fileName: "work-report-data", sheetTitle: "Work Report", exportHeader: exportHeader, exportData: exportData });
        }
      });
  }

  const viewTicketData = async (id) => {
    setReportId(id);
    setShowViewWorkReportModal(true);
    window.history.replaceState(null, '', `/view-work-report/${id}`);
  };

  let columns = [
    {
      Header: 'Report Date',
      id: 'report_date',
      accessor: (row) => row?.report_date && format(new Date(row?.report_date), office_display_date_format),
      Cell: ({ row }) => (
        <>
          {row?.original?.report_date && format(new Date(row?.original?.report_date), office_display_date_format)}
          <span className='text-danger'>
            {`${row?.original?.save_as_draft === 1 ? ' [Draft]' : ''}`}
            {`${row?.original?.early_punchout === 1 ? ' [Early Punch-Out]' : ''}`}
          </span>
        </>
      ),
    },
    {
      Header: 'Employee',
      id: 'addedby_name',
      accessor: (row) => row?.addedby_name,
      Cell: ({ row }) => (
        <>
          <div className='cursor-pointer text-primary' onClick={() => { viewTicketData(row?.original?.id); }}>{row.original.addedby_name}</div>
        </>
      ),
    },
    {
      Header: 'Total Hours',
      id: 'total_hours',
      accessor: (row) => row?.total_hours,
    },
    {
      Header: 'Full / Half Day',
      id: 'working_day',
      accessor: (row) => row?.working_day,
      Cell: ({ row }) => (
        <>
          {row?.original.working_day !== '' && row?.original.working_day !== null ? capitalizeFirstWithRemoveUnderScore(row?.original.working_day) : ''}
        </>
      ),
    },
    {
      Header: 'Date Added',
      id: 'created_at',
      accessor: (row) => row?.created_at && format(new Date(row?.created_at), office_display_date_format_with_time),
    },
  ];

  if (check(['workreport.update', 'workreport.delete', 'workreport.view'], userData?.role.getPermissions)) {
    columns = [
      ...columns,
      {
        Header: 'Action',
        disableSortBy: true,
        accessor: (row) => (
          <>
            <Dropdown className="category-dropdown edit-task-dropdown">
              <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="cursor-pointer" id="edit-task"><button size="sm" className='btn btn-white circle-btn btn-icon btn-sm'><i className="fa-solid fa-ellipsis-vertical"></i></button></Dropdown.Toggle>
              <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2" popperConfig={popperConfig}>
                <Dropdown.Item onClick={() => { viewTicketData(row?.id); }}>
                  View
                </Dropdown.Item>

                {(format(new Date(row.report_date), 'dd-MM-yyyy') === moment().format('DD-MM-YYYY') && row?.staff_id === userData?.id) || (userData?.id === 41 && (format(new Date(row.report_date), indian_date_format) === format(new Date(moment().subtract(1, 'days')), indian_date_format))) ?
                  <>
                    <PermissionCheck permissions={['workreport.update']}>
                      <Dropdown.Item onClick={() => { handleWorkReportEdit(row?.id) }}>
                        Edit
                      </Dropdown.Item>
                    </PermissionCheck>
                    <PermissionCheck permissions={['workreport.delete']}>
                      <Dropdown.Item className="text-danger" onClick={() => { handleTicketDelete(row?.id, format(new Date(row?.report_date), 'yyyy-MM-dd')) }}>
                        Delete
                      </Dropdown.Item>
                    </PermissionCheck>
                  </>
                  : ''}
              </Dropdown.Menu>
            </Dropdown>
          </>
        ),
      },
    ]
  }

  const handleTicketDelete = async (id, date) => {
    confirmAlert({
      title: 'Confirm',
      message: DELETE_WORK_REPORT,
      buttons: [
        {
          label: 'Yes',
          className: 'btn btn-primary btn-lg',
          onClick: () => {
            let params = {};
            params["work_report_id"] = id;
            params["report_date"] = date;
            APIService.deleteWorkReport(params)
              .then((response) => {
                if (response.data?.status) {
                  toast.success(response.data?.message, {
                    position: toast.POSITION.TOP_RIGHT
                  });
                  setReloadPage(!reloadPage);
                  setShowViewWorkReportModal(false);
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

  const handleWorkReportEdit = async (id) => {
    history.push(`/edit-work-report/${id}`);
  };

  const handleStaffSelect = e => {
    setStaffId(e.value);
  };

  const handleTeamMemberSelect = e => {
    setTeamMember(e.value);
  };

  const handleFilter = async (e) => {
    setReloadPage(!reloadPage);
  };

  const handleClearFilter = async (e) => {
    setStaffId(0);
    setStartDate(userData.role_code === databaseRoleCode.adminCode ? moment()._d : moment().startOf('month')._d);
    setEndDate(userData.role_code === databaseRoleCode.adminCode ? moment()._d : moment(moment().endOf('month').format('YYYY-MM-DD'))._d);
    setReloadPage(!reloadPage);
    setDesignation(0);
    setTeamMember(0);
  };

  const onChangeDateRange = dates => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  }

  const handleDesignationSelect = (selectedDesignation) => {
    setDesignation(selectedDesignation?.value);
  };

  const handleFilterForNotSendReport = async (e) => {
    setReloadPageForNotSendReport(!reloadPageForNotSendReport);
  };
  
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

  return (
    <>
      <Sidebar />
      <ViewWorkReport showViewWorkReportModal={showViewWorkReportModal} setShowViewWorkReportModal={setShowViewWorkReportModal} reportId={reportId} />
      <div className="main-content">
        <Header pagename={name} headerFilterButton={<Button onClick={cstPageOffcanvasisShow} variant="outline-secondary" size="md" type="button" className='ms-auto d-xl-none d-block'>Filter <i className="icon-filter ms-2"></i></Button>} />
        <div className="inner-content pt-0 px-0">
          <div className="leave-page">
            <div className="bg-white py-3 px-4 px-xl-7 page-inner-header">
              <Row>
                <Col xl={6} xs={12} className="me-md-auto d-flex flex-wrap gap-2">
                  <PermissionCheck permissions={['workreport.create']}>
                    <Link to="/add-work-report" className="btn btn-primary btn-md"><i className="icon-add me-2"></i> Add New</Link>
                  </PermissionCheck>
                  <PermissionCheck permissions={['workreport.not_send_report']}>
                    <Button variant="soft-secondary"  size='md' onClick={msShowManageStaffSidebar}>Not Send Report</Button>
                  </PermissionCheck>
                  <PermissionCheck permissions={['workreport.delay_task_report']}>
                    <Link to="/delay-task-report" className="btn btn-soft-secondary btn-md"> Delay Task Report</Link>
                  </PermissionCheck>
                </Col>
                <Col xl={6} xs={12}>
                  <div className='position-relative'>
                    <Button onClick={cstPageOffcanvasisShow} variant="outline-secondary" size="md" type="button" className='ms-auto d-xl-block d-none'>Filter <i className="icon-filter ms-2"></i></Button>
                    <div className={"custom-page-offcanvas filter-show-desktop " + (isPageOffcanvasisActive ? 'active' : '')} ref={dropdownRef}>
                      <div className='custom-page-offcanvas-header border-bottom border-gray-100 py-2 px-4'>
                        <h5 className='m-0'>Filter</h5>
                        <Button type="button" variant="white" size='sm' className="btn-icon circle-btn btn" onClick={cstPageOffcanvasisHide}><i className="icon-cancel"></i></Button>
                      </div>
                      <div className='custom-page-offcanvas-body p-4'>
                        <Row className="g-4 justify-content-xl-end">
                          {userData?.role_code === databaseRoleCode.adminCode ?
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
                            <RangeDatePickerControl
                              selected={startDate}
                              startDate={startDate}
                              endDate={endDate}
                              indian={true}
                              onChange={onChangeDateRange}
                            />
                          </Col>
                          <Col xs={12} className='mt-4'>
                            <hr className='m-0' />
                          </Col>
                          <Col xl="auto" className='d-flex gap-2 flex-row-reverse justify-content-sm-start justify-content-between'>
                            <Button variant="primary" size="md" type="button" onClick={() => { handleFilter() }}>Search</Button>
                            <Button variant="soft-secondary" size="md" type="button" onClick={() => { handleClearFilter() }}> <span>Clear Filter</span></Button>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

            </div>
            <div className="pt-4 pt-lg-5 pt-xl-9 px-0 px-lg-4 px-xl-7">
              <Card className="rounded-10 p-4 p-xl-6">
                <Card.Body className="p-0">
                  <DataTableWithPagination columns={columns} data={ticketSystemList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isExportable={true} exportData={exportData} />
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
        <Offcanvas show={showManageStaffSidebar} onHide={msCloseManageStaffSidebar} className="manage-staff-sidebar" placement="end">
          <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
            <div className="d-flex align-items-center">
              <h3 className="mb-0">Not Send Work Report</h3>
            </div>
            <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={msCloseManageStaffSidebar}>
              <i className="icon-cancel"></i>
            </button>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">
            <SimpleBar className="offcanvas-inner">
              <div className="p-6">
                <Row className="g-2 g-xl-4">
                  <Col xxl={9} xl={9} lg={9} md={9} sm={12}>
                    <SingleDatePickerControl
                      selected={startDateForNotSend}
                      onDateChange={(date) => setStartDateForNotSend(date)}
                      onChange={(date) => setStartDateForNotSend(date)}
                      className={`form-control control-md`}
                    />
                  </Col>
                  <Col xxl={3} xl={3} lg={3} md={3} sm={12}>
                    <Button variant="primary" size="md" type="button" onClick={() => { handleFilterForNotSendReport() }}>Search</Button>
                  </Col>
                </Row>
                <hr />
                <div className="staff-list">
                  {staffForNotSendWorkReport?.map((staff, staff_index) => (
                    <div className="staff-detail border border-gray-100 rounded-6" key={staff_index}>
                      <Link to={`/user-detail/${staff.staffid}`} target="_blank" className="font-weight-medium text-nowrap text-gray-700">{`${staff.firstname} ${staff.lastname}`}</Link>&nbsp;<span className='text-danger'>{`${staff?.save_as_draft === 1 ? ' [Draft]' : ''}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SimpleBar>
          </Offcanvas.Body>
        </Offcanvas>
        <Footer />
      </div>
    </>
  );
}
const mapStateToProps = (state) => ({
  userData: state.Auth.user
})

export default connect(mapStateToProps)(WorkReport)