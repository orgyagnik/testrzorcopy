import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, Dropdown } from 'react-bootstrap';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { pagination, databaseRoleCode, office_display_date_format_with_time, popperConfig } from '../../settings';
import { format } from 'date-fns';
import { check } from "../../utils/functions.js";
import { toast } from 'react-toastify';
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import { confirmAlert } from 'react-confirm-alert';
import { Link, useHistory } from "react-router-dom";
import ThresholdLeaveView from './ThresholdLeaveView';
import { DELETE_THRESHOLD } from '../../modules/lang/ThresholdLeave';

function ThresholdLeaveList({ userData, name }) {

    let id = undefined;
    let history = useHistory();
    const currentURL = window.location.pathname;
    
    if (currentURL.includes("/view-threshold-leave-setting/")) {  
      
      id = currentURL.replace("/view-threshold-leave-setting/", '');      
    }
   
    const [thresholdLeaveList, setThresholdLeaveList] = useState([]);
    const [page, setPage] = useState(1);
    const [searchFilter, setSearchFilter] = useState('');
    const [firstLoad, setFirstLoad] = useState(true);
    const [sort, setSort] = useState(pagination.sorting);
    const [sortby, setSortBy] = useState('id');
    const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
    const [totalPages, setTotalPages] = useState(1);
    const [tableLoader, setTableLoader] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
  

    const [exportData, setExportData] = useState([]);
    const [thresholdId, setThresholdId] = useState([]);
    const [showViewThresholdLeaveModal, setShowViewThresholdLeaveModal] = useState(false);
    const [reloadPage, setReloadPage] = useState(false);

    useEffect(() => {      
      if (id !== undefined && `${id}` !== `${thresholdId}`) {
        
        if (currentURL === `/view-threshold-leave-setting/${id}`) {
          setThresholdId(id);
          setShowViewThresholdLeaveModal(true);
        }
      }
    }, [id]);

    useEffect(() => {
        if (firstLoad === false) {
          setPage(1);
          if (page === 1) {
            const timer = setTimeout(() => {
                fetchThresholdLeaveList();
            }, 500);
            return () => clearTimeout(timer);
          }
        }
    }, [searchFilter, reloadPage]);

    useEffect(() => {
      fetchThresholdLeaveList();
      setFirstLoad(false);
    }, [sort, sortby, page, perPageSize]);

    const fetchThresholdLeaveList = () => {
        setTableLoader(true);
        let params = "?";
        params = params + "sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby;
        if (searchFilter !== '') {
          params = params + "&search=" + searchFilter;
        }
        
        APIService.getThresholdLeaveList(params)
          .then((response) => {
            if (response.data?.status) {
              let newData = response.data?.data;
              setTotalPages(response.data?.pagination?.total_pages);
              setTotalRecords(response.data?.pagination?.total_records);
              setThresholdLeaveList(newData);
              setTableLoader(false);
              let exportHeader = ["Designation Name", "Total Employees", "Total Leaves", "Threshold Percentage", "Min. Employees", "Min. Applicable Leaves", "Added By Name","Date Added"];
              let exportData = [];
              newData?.map(item => {
                exportData.push(
                  {
                    designation_name: item.designation_name ? item.designation_name : '',
                    total_employee: item.total_employee ? item.total_employee : 0,
                    applicable_leave: item.applicable_leave ? item.applicable_leave : 0,
                    threshold_percentage: item.threshold_percentage ? item.threshold_percentage : 0,
                    employee_count: item.employee_count ? item.employee_count : 0,
                    percentage: item.percentage ? item.percentage+'%' : '',
                    leave_slot: item.leave_slot ? item.leave_slot : 0,
                    addedby_name: item.addedby_name ? item.addedby_name : '',
                    created_at: item.created_at ? format(new Date(item.created_at), office_display_date_format_with_time) : '',
                });
                return '';
              });
              setExportData({ fileName: "threshold-leave-data", sheetTitle: "Threshold Leave Setting", exportHeader: exportHeader, exportData: exportData });
            }
          });
    }

    let columns = [        
        {
            Header: 'Designation Name',
            id: 'designation_name',
            // accessor: (row) => row?.designation_name,
            accessor: (row) => (
              <>
                  <Link to={`/users?designation=${row?.designation_id}`}>{row?.designation_name}</Link>
              </>
            ),
        },
        {
          Header: 'Total Employees',
          id: 'total_employee',
          accessor: (row) => row?.total_employee,
        },
        {
          Header: 'Total Leaves',
          id: 'applicable_leave',
          accessor: (row) => row?.applicable_leave,
        },
        {
          Header: 'Threshold Percentage',
          id: 'threshold_percentage',
          accessor: (row) => row?.threshold_percentage ? row?.threshold_percentage + '%' : '0%',
        },
        {
          Header: 'Min. Employees',
          id: 'employee_count',
          accessor: (row) => row?.employee_count,
        },            
        {
          Header: 'Min. Applicable Leaves',
          id: 'leave_slot',
          accessor: (row) => row?.leave_slot,
          width: 150
        },  
        {
          Header: 'Added By Name',
          id: 'addedby_name',
          accessor: (row) => row?.addedby_name,
          width: 150
        },  
        {
            Header: 'Date Added (IST)',
            id: 'created_at',
            accessor: (row) => row?.created_at && format(new Date(row?.created_at), office_display_date_format_with_time),
        }

    ];

    if (check(['threshold_leave.update', 'threshold_leave.delete', 'threshold_leave.view'], userData?.role.getPermissions)) {
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
                    <Dropdown.Item onClick={() => { viewThresholdLeaveData(row?.id); }}>
                      View
                    </Dropdown.Item>
                    {userData?.role_code === databaseRoleCode.adminCode || (row?.added_by === userData?.id) ?
                      <PermissionCheck permissions={['threshold_leave.update']}>
                        <Dropdown.Item onClick={() => { handleThresholdLeaveEdit(row?.id) }}>
                          Edit
                        </Dropdown.Item>
                      </PermissionCheck>
                      : ''}                     
                    {userData?.role_code === databaseRoleCode.adminCode || (row?.added_by === userData?.id) ?
                      <PermissionCheck permissions={['threshold_leave.delete']}>
                        <Dropdown.Item className="text-danger" onClick={() => { handleThresholdLeaveDelete(row?.id) }}>
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

    const viewThresholdLeaveData = async (id) => {
      setThresholdId(id);
      setShowViewThresholdLeaveModal(true);
      window.history.replaceState(null, '', `/view-threshold-leave-setting/${id}`);
    };

    useEffect(() => {
        fetchThresholdLeaveList();
        setFirstLoad(false);
    }, [sort, sortby, page, perPageSize]);
    
    const handleThresholdLeaveEdit = async (id) => {
      history.push(`/edit-threshold-leave-setting/${id}`);
    };

    const handleThresholdLeaveDelete = async (id) => {
      confirmAlert({
        title: 'Confirm',
        message: DELETE_THRESHOLD,
        buttons: [
          {
            label: 'Yes',
            className: 'btn btn-primary btn-lg',
            onClick: () => {
              let params = {};
              params["id"] = id;

              APIService.deleteThresholdLeave(params)
              .then((response) => {
                if (response.data?.status) {
                  toast.success(response.data?.message, {
                    position: toast.POSITION.TOP_RIGHT
                  });
                  setReloadPage(!reloadPage);
                  setShowViewThresholdLeaveModal(false);
                  window.history.replaceState(null, '', `/threshold-leave-setting`);
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

    return (
        <>        
            <Sidebar />
            <ThresholdLeaveView showViewThresholdLeaveModal={showViewThresholdLeaveModal} setShowViewThresholdLeaveModal={setShowViewThresholdLeaveModal} handleThresholdLeaveEdit={handleThresholdLeaveEdit}  handleThresholdLeaveDelete={handleThresholdLeaveDelete} thresholdId={thresholdId} reloadPage={reloadPage} setReloadPage={setReloadPage} />
            <div className="main-content">
                <Header pagename={name} />
                <div className="inner-content pt-0 px-0">
                    <div className="thrshold-page">

                        <div className="bg-white py-3 px-4 px-lg-7 page-inner-header">
                            <Row className="g-2 lg:g-4">
                                <Col xl={4} lg={3} md={3} className="me-md-auto">
                                    <PermissionCheck permissions={['threshold_leave.create']}>
                                        <Link to="/add-threshold-leave-setting" className="me-2 btn btn-primary btn-md">Add New</Link>
                                    </PermissionCheck>                                   
                                </Col>                               
                            </Row>
                        </div>

                        <div className="pt-4 pt-lg-5 pt-xl-9 px-0 px-lg-4 px-xl-7">
                            <Card className="rounded-10 p-4 p-xl-6">
                                <Card.Body className="p-0 threshold-list-table">
                                  <DataTableWithPagination columns={columns} data={thresholdLeaveList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isExportable={true} exportData={exportData}/>
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
  
export default connect(mapStateToProps)(ThresholdLeaveList)