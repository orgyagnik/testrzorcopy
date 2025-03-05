import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, Button } from 'react-bootstrap';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { pagination, office_display_date_format, databaseRoleCode } from '../../settings';
import moment from 'moment';
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import Select from 'react-select';
import { useHistory } from "react-router-dom";
import RangeDatePickerControl from '../../modules/custom/RangeDatePickerControl';
import { format } from 'date-fns';
import ViewWorkReport from './ViewWorkReport';

function DelayTaskReport({ userData, name }) {
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
  const [startDate, setStartDate] = useState(moment().subtract(1, 'day')._d);
  const [endDate, setEndDate] = useState(moment().subtract(1, 'day')._d);

  const [staffList, setStaffList] = useState([]);
  const [staffId, setStaffId] = useState(0);
  const [reportId, setReportId] = useState([]);
  const [teamMemberOption, setTeamMemberOption] = useState([]);
  const [teamMember, setTeamMember] = useState(-1);

  const [exportData, setExportData] = useState([]);
  const [tableLoader, setTableLoader] = useState(false);
  const [reloadPageForNotSendReport, setReloadPageForNotSendReport] = useState(false);  
  const dropdownRef = useRef();

  useEffect(() => {
    if (id !== undefined && `${id}` !== `${reportId}`) {
      if (currentURL === `/view-work-report/${id}`) {
        setReportId(id);
        setShowViewWorkReportModal(true);
      }
    }
  }, [id]);

  useEffect(() => {
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
            setTeamMemberOption([{ label: 'All Member', value: -1 }, ...response.data?.data]);
          }
        });
    }

  }, []);

  useEffect(() => {
    fetchDelayTaskReportList();
    setFirstLoad(false);
  }, [sort, sortby, page, perPageSize, teamMemberOption]);

  useEffect(() => {
    if (firstLoad === false) {
      setPage(1);
      if (page === 1) {
        const timer = setTimeout(() => {
          fetchDelayTaskReportList();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [searchFilter, reloadPage]);

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

  const fetchDelayTaskReportList = () => {
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
    APIService.getDelayTaskReportList(params)
      .then((response) => {
        if (response.data?.status) {
          let newData = response.data?.data;
          setTotalPages(response.data?.pagination?.total_pages);
          setTotalRecords(response.data?.pagination?.total_records);
          setTicketSystemList(newData);
          setTableLoader(false);
          let exportHeader = ["Report Date", "Employee", "Project", 'Task', "Reason"];
          let exportData = [];
          newData?.map(item => {
            exportData.push(
              {
                report_date: item.report_date ? format(new Date(item.report_date), office_display_date_format) : '',                
                name: item.addedby_name ? item.addedby_name : '',
                project_name: item.project_name ? item.project_name : '',
                task_name: item.task_name ? item.task_name : '',
                reason: item.reason ? item.reason : '',

              });
            return '';
          });
          setExportData({ fileName: "delay-task-report-data", sheetTitle: "Delay Task Report", exportHeader: exportHeader, exportData: exportData });
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
          {row?.original?.report_date && <div className='cursor-pointer text-primary' onClick={() => { viewTicketData(row?.original?.id); }}>{format(new Date(row?.original?.report_date), office_display_date_format)}</div>}
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
          {row.original.addedby_name}
        </>
      ),
    },    
    {
      Header: 'Project',
      id: 'project_name',
      accessor: (row) => row?.project_name ? row?.project_name : '-',
    },
    {
        Header: 'Task',
        id: 'task_name',
        accessor: (row) => row?.task_name ? row?.task_name : '-',
    },
    {
        Header: 'Reason',
        id: 'reason',
        accessor: (row) => row?.reason ? row?.reason : '-',
    },
  ];

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
    setStartDate(moment().subtract(1, 'day')._d);
    setEndDate(moment().subtract(1, 'day')._d);
    setReloadPage(!reloadPage);
    setTeamMember(-1);
  };

  const onChangeDateRange = dates => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  }

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

  return (
    <>
      <Sidebar />
      <ViewWorkReport showViewWorkReportModal={showViewWorkReportModal} setShowViewWorkReportModal={setShowViewWorkReportModal} reportId={reportId} defaultURL = {'/delay-task-report'}/>
      <div className="main-content">
        <Header pagename={name} headerFilterButton={<Button onClick={cstPageOffcanvasisShow} variant="outline-secondary" size="md" type="button" className='ms-auto d-xl-none d-block'>Filter <i className="icon-filter ms-2"></i></Button>} />
        <div className="inner-content pt-0 px-0">
          <div className="leave-page">
            <div className="bg-white py-3 px-4 px-xl-7 page-inner-header">
              <Row>
                
                <Col xl={12} xs={12}>
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
                                <Select styles={customStyles} className="control-md custom-select" options={staffList} onChange={handleStaffSelect}
                                  value={staffList.filter(function (option) {
                                    return option.value === staffId;
                                  })} />
                              </Col>
                            </>
                            :
                            <>
                              {teamMemberOption.length > 1 &&
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
       
        <Footer />
      </div>
    </>
  );
}
const mapStateToProps = (state) => ({
  userData: state.Auth.user
})

export default connect(mapStateToProps)(DelayTaskReport)