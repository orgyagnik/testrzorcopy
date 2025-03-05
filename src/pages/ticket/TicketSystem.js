import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, Button, Badge, OverlayTrigger, Tooltip, Dropdown, Spinner } from 'react-bootstrap';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { pagination, office_display_date_format_with_time, popperConfig, databaseRoleCode, ticketPriorityList } from '../../settings';
import { check } from "../../utils/functions.js";
import { toast } from 'react-toastify';
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import { confirmAlert } from 'react-confirm-alert';
import { DELETE_TICKET } from '../../modules/lang/TicketSystem';
import Select from 'react-select';
import { Link, useHistory } from "react-router-dom";
import ViewTicketSystem from './ViewTicketSystem';
import { format } from 'date-fns';

function TicketSystem({ userData, name }) {
  //let { id } = useParams();
  let id = undefined;
  let history = useHistory();
  const currentURL = window.location.pathname;

  if (currentURL.includes("/view-it-ticket/")) {
    id = currentURL.replace("/view-it-ticket/", '');
  }

  const [showViewTicketModal, setShowViewTicketModal] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [reloadPage, setReloadPage] = useState(false);
  const [ticketSystemList, setTicketSystemList] = useState([]);
  const [page, setPage] = useState(1);
  const [searchFilter, setSearchFilter] = useState('');
  const [sort, setSort] = useState(pagination.sorting);
  const [sortby, setSortBy] = useState('id');
  const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [ticketSystemDesignationId, setTicketSystemDesignationId] = useState(0);
  const [ticketPriorityForFilter, setTicketPriorityForFilter] = useState('All');
  const ticketPriorityListForFilter = [{ label: 'All', value: 'All' }, ...ticketPriorityList];
  const [customPrioritySortingSet, setCustomPrioritySortingSet] = useState(false);
  const [refreshForStatusFilter, setRefreshForStatusFilter] = useState(false);
  const [refreshButtonProcess, setRefreshButtonProcess] = useState(false);

  const [staffList, setStaffList] = useState([]);
  const [staffId, setStaffId] = useState(0);
  const [statusList, setStatusList] = useState([]);
  const [statusListForFilter, setStatusListForFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState(0);
  const [ticketId, setTicketId] = useState([]);

  const [exportData, setExportData] = useState([]);
  const [tableLoader, setTableLoader] = useState(false);

  useEffect(() => {
    if(currentURL === '/it-ticket'){
      setShowViewTicketModal(false);
      setReloadPage(!reloadPage);
    }

    if (id !== undefined && `${id}` !== `${ticketId}`) {
      if (currentURL === `/view-it-ticket/${id}`) {
        setTicketId(id);
        setShowViewTicketModal(true);
      }
    }
  }, [id]);

  useEffect(() => {
    APIService.getAllMembers('?role_code=office_staff')
      .then((response) => {
        if (response.data?.status) {
          let newStaffList = response.data?.data.map(item => {
            return { label: item.name, value: item.id }
          });
          setStaffList([{ label: 'All Staff', value: 0 }, ...newStaffList]);
        }
      });

    APIService.getTicketStatus()
      .then((response) => {
        if (response.data?.status) {
          let newStaffList = response.data?.data.map(item => {
            return { label: item.label, value: item.value, backgroundColor: item.backgroundColor }
          });
          setStatusList(newStaffList);
          setStatusListForFilter([{ label: 'All Status', value: 0 }, ...newStaffList]);
        }
      });
  }, []);

  useEffect(() => {
    fetchTicketSystemList();
    setFirstLoad(false);
  }, [sort, sortby, page, perPageSize, refreshForStatusFilter]);

  useEffect(() => {
    if (statusFilter === 1) {
      setSort("asc");
      setSortBy("id");
      setPerPageSize(500);
      setRefreshForStatusFilter(!refreshForStatusFilter);
      setCustomPrioritySortingSet(!customPrioritySortingSet);
    }
    else {
      if (firstLoad === false) {
        setRefreshForStatusFilter(!refreshForStatusFilter);
        setPerPageSize(pagination.perPageRecordDatatable);
      }
    }
  }, [statusFilter]);

  useEffect(() => {
    if (firstLoad === false) {
      setPage(1);
      if (page === 1) {
        const timer = setTimeout(() => {
          fetchTicketSystemList();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [searchFilter, staffId, ticketPriorityForFilter, reloadPage]);

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

  const fetchTicketSystemList = () => {
    setTableLoader(true);
    let params = "?";
    params = params + "sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby;
    if (searchFilter !== '') {
      params = params + "&search=" + searchFilter;
    }
    if (staffId !== 0) {
      params = params + "&search_by_staff=" + staffId;
    }
    if (statusFilter !== 0) {
      params = params + "&search_by_status=" + statusFilter;
    }
    if (ticketPriorityForFilter !== 'All') {
      params = params + "&priority=" + ticketPriorityForFilter;
    }

    APIService.getTicketSystemList(params)
      .then((response) => {
        setRefreshButtonProcess(false);
        if (response.data?.status) {
          let newData = response.data?.data;
          setTotalPages(response.data?.pagination?.total_pages);
          setTotalRecords(response.data?.pagination?.total_records);
          setTicketSystemDesignationId(response.data?.pagination?.TICKET_SYSTEM_DESIGNATION_ID);
          setTicketSystemList(newData);
          setTableLoader(false);
          let exportHeader = ["#", "Title", "Category", 'Priority', "Status", "Added By", "Date Added"];
          let exportData = [];
          newData?.map(item => {
            exportData.push(
              {
                id: item.id,
                name: item.name ? item.name : '',
                category: item.category_name ? item.category_name : '',
                priority: item.priority ? item.priority : '',
                status: item.status_name ? item.status_name : '',
                addedby_name: item.addedby_name ? item.addedby_name : '',
                created_at: item.created_at ? format(new Date(item.created_at), office_display_date_format_with_time) : '',
              });
            return '';
          });
          setExportData({ fileName: "ticket-data", sheetTitle: "Ticket", exportHeader: exportHeader, exportData: exportData });
        }
      });
  }

  const updateTicketStatus = (id, status) => {
    let params = {};
    params["ticketid"] = id;
    params["status"] = status;
    APIService.updateTicketStatus(params)
      .then((response) => {
        if (response.data?.status) {
          setReloadPage(!reloadPage);
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

  const viewTicketData = async (id) => {
    setTicketId(id);
    setShowViewTicketModal(true);
    window.history.replaceState(null, '', `/view-it-ticket/${id}`);
  };

  let columns = [
    {
      Header: '#',
      id: 'id',
      accessor: (row) => row?.id,
    },
    {
      Header: 'Title',
      id: 'name',
      accessor: (row) => row?.name,
      Cell: ({ row }) => (
        <>
          <div className='cursor-pointer text-primary' onClick={() => { viewTicketData(row?.original?.id); }}>{row.original.name}</div>
        </>
      ),
    },
    {
      Header: 'Category',
      id: 'category',
      accessor: (row) => row?.category_name,
    },    
    {
      Header: 'Priority',
      id: 'priority',
      accessor: (row) => row?.priority,
    },
    {
      Header: 'Added By',
      id: 'addedby_name',
      accessor: (row) => row?.addedby_name,
    },
    {
      Header: 'Date Added',
      id: 'created_at',
      accessor: (row) => row?.created_at && format(new Date(row?.created_at), office_display_date_format_with_time),
    },
    {
      Header: 'Status',
      id: 'status',
      disableSortBy: false,
      accessor: (taskList) => taskList.task_status_name,
      Cell: ({ row }) => (
        <>
          {userData?.role_code === databaseRoleCode.adminCode || userData?.designation === ticketSystemDesignationId ?
            <Dropdown>
              <Dropdown.Toggle size='sm' variant={row?.original?.backgroundColor} id={`dropdown-variants-status-${row?.original?.id}`}>
                {row?.original?.status_name}
              </Dropdown.Toggle>

              <Dropdown.Menu popperConfig={popperConfig}>
                {statusList.filter(function (arr) { return arr.value !== row?.original?.status; }).map((status, index) => (
                  <Dropdown.Item key={index} onClick={() => { updateTicketStatus(row?.original?.id, status.value) }}>
                    {`${status.label}`}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            :
            <Badge className="font-weight-semibold font-12 p-2" bg={row?.original?.backgroundColor}>{row?.original?.status_name}</Badge>
          }
        </>
      ),
    },
  ];

  if (check(['ticket_system.update', 'ticket_system.delete', 'ticket_system.view'], userData?.role.getPermissions)) {
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
                {userData?.role_code === databaseRoleCode.adminCode || (row?.status === 1 && row?.added_by === userData?.id) ?
                  <PermissionCheck permissions={['ticket_system.update']}>
                    <Dropdown.Item onClick={() => { handleTicketSystemEdit(row?.id) }}>
                      Edit
                    </Dropdown.Item>
                  </PermissionCheck>
                  : ''}
                {userData?.role_code === databaseRoleCode.adminCode || (row?.status === 1 && row?.added_by === userData?.id) ?
                  <PermissionCheck permissions={['ticket_system.delete']}>
                    <Dropdown.Item className="text-danger" onClick={() => { handleTicketDelete(row?.id) }}>
                      Delete
                    </Dropdown.Item>
                  </PermissionCheck>
                  : ''}
              </Dropdown.Menu>
            </Dropdown>
          </>
        ),
      },
    ]
  }

  const handleTicketDelete = async (id) => {
    confirmAlert({
      title: 'Confirm',
      message: DELETE_TICKET,
      buttons: [
        {
          label: 'Yes',
          className: 'btn btn-primary btn-lg',
          onClick: () => {
            let params = {};
            params["ticketid"] = id;
            APIService.deleteTicketSystem(params)
              .then((response) => {
                if (response.data?.status) {
                  toast.success(response.data?.message, {
                    position: toast.POSITION.TOP_RIGHT
                  });
                  setReloadPage(!reloadPage);
                  setShowViewTicketModal(false);
                  window.history.replaceState(null, '', `/it-ticket`);
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

  const handleTicketSystemEdit = async (id) => {
    history.push(`/edit-it-ticket/${id}`);
  };

  const handleClearFilter = async (e) => {
    setStaffId(0);
    setStatusFilter(0);
    setTicketPriorityForFilter('All');
  };

  const handleStaffSelect = e => {
    setStaffId(e.value);
  };

  const handleStatusSelect = e => {
    setStatusFilter(e.value);    
  };

  const handleTicketPrioritySelectForFilter = (e) => {
    setTicketPriorityForFilter(e.value);
  };
    
  const handleRefreshPage = () => {
    setRefreshButtonProcess(true);
    setReloadPage(!reloadPage);
  }

  const [isPageOffcanvasisActive, setIsPageOffcanvasisActive] = useState(false);
  const cstPageOffcanvasisShow = () => {
      setIsPageOffcanvasisActive(true);
      document.body.style.overflow = 'hidden';
  };
  const cstPageOffcanvasisHide = () => {
      setIsPageOffcanvasisActive(false);
      document.body.style.overflow = '';
  };

  return (
    <>
      <Sidebar />
      <ViewTicketSystem showViewTicketModal={showViewTicketModal} setShowViewTicketModal={setShowViewTicketModal} ticketSystemDesignationId={ticketSystemDesignationId} handleTicketSystemEdit={handleTicketSystemEdit} ticketId={ticketId} handleTicketDelete={handleTicketDelete} statusList={statusList} reloadPage={reloadPage} setReloadPage={setReloadPage} />
      <div className="main-content">
        <Header pagename={name} headerFilterButton={<Button onClick={cstPageOffcanvasisShow} variant="outline-secondary" size="md" type="button" className='ms-auto d-xl-none d-block'>Filter <i className="icon-filter ms-2"></i></Button>}/>
        <div className="inner-content pt-0 px-0">
          <div className="leave-page">
            <div className="bg-white py-3 px-4 px-xl-7 ticket-header page-inner-header">
              <Row className="g-2">
                <Col xl="auto"className="me-md-auto">
                  <PermissionCheck permissions={['ticket_system.create']}>
                    <Link to="/add-it-ticket" className="me-2 btn btn-primary btn-md"><i className="icon-add me-2"></i> Add Ticket</Link>
                  </PermissionCheck>
                  <Button variant="soft-secondary" size='md' onClick={handleRefreshPage}>
                    {
                      !refreshButtonProcess && <><i className="icon-rotate-right"></i></>
                    }
                    {
                      refreshButtonProcess && <><Spinner size="sm" animation="border" variant="white" className="me-1" /></>
                    }
                  </Button>
                </Col>
                <Col> 
                <div className={"custom-page-offcanvas " + (isPageOffcanvasisActive ? 'active' : '')}>
                      <div className='custom-page-offcanvas-header border-bottom border-gray-100 py-2 px-4 d-xl-none'>
                          <h5 className='m-0'>Filter</h5>
                          <Button type="button" variant="white" size='sm' className="btn-icon circle-btn btn" onClick={cstPageOffcanvasisHide}><i className="icon-cancel"></i></Button>
                      </div>
                      <div className='custom-page-offcanvas-body p-xl-0 p-4'>
                          <Row className="g-2 justify-content-xl-end">  
                            <Col xs={12} lg={4} xl={4} xxl={3}>
                              {userData?.role_code === databaseRoleCode.adminCode || userData?.designation === ticketSystemDesignationId ?
                                <Select styles={customStyles} className="control-md custom-select" options={staffList} onChange={handleStaffSelect}
                                  value={staffList.filter(function (option) {
                                    return option.value === staffId;
                                  })} />
                                : ''
                              }
                            </Col>
                            <Col xs={12} lg={4} xl={4} xxl={3}>
                              <Select styles={customStyles} className="control-md custom-select" options={statusListForFilter} onChange={handleStatusSelect} placeholder={<div>Select Status</div>}
                              value={statusListForFilter.filter(function (option) {
                                return option.value === statusFilter;
                              })} />
                            </Col>
                            <Col xs={12} lg={4} xl="auto">
                              <Select styles={customStyles} className="control-md custom-select" options={ticketPriorityListForFilter} onChange={handleTicketPrioritySelectForFilter}
                              value={ticketPriorityListForFilter.filter(function (option) {
                                return option.value === ticketPriorityForFilter;
                              })} />
                            </Col>
                            <Col xs={12} className='mt-4 d-xl-none d-block'>
                                <hr className='m-0' />
                            </Col>
                            <Col xl="auto" className='d-flex gap-2 flex-xl-row flex-row-reverse justify-content-sm-start justify-content-between'>
                                <Button variant="primary" size="md" type="button" onClick={() => { cstPageOffcanvasisHide() }} className='d-xl-none'>Search</Button>
                                <Button variant="soft-secondary" size="md" type="button" onClick={() => { handleClearFilter() }}> Clear </Button>
                            </Col>
                          </Row>
                      </div>
                    </div>
                </Col>
              </Row>
            </div>
            <div className="pt-4 pt-lg-5 pt-xl-9 px-0 px-lg-4 px-xl-7">
              <Card className="rounded-10 p-4 p-xl-6">
                <Card.Body className="p-0">
                  <DataTableWithPagination columns={columns} data={ticketSystemList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isExportable={true} exportData={exportData} customPrioritySorting={statusFilter === 1} customPrioritySortingSet={customPrioritySortingSet} customPrioritySortingcolumns={"id"} />
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

export default connect(mapStateToProps)(TicketSystem)