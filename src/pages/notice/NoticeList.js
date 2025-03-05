import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, Dropdown } from 'react-bootstrap';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { pagination, databaseRoleCode, office_display_date_format_with_time, office_display_date_format_for_date, popperConfig } from '../../settings';
import { format } from 'date-fns';
import { check, replaceSpecialCharacters } from "../../utils/functions.js";
import { toast } from 'react-toastify';
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import { confirmAlert } from 'react-confirm-alert';
import { Link, useHistory } from "react-router-dom";
import moment from 'moment-timezone';
import ViewNotice from './ViewNotice';
import { DELETE_NOTICE } from '../../modules/lang/Notice';
import linkifyHtml from 'linkify-html';

function NoticeList({ userData, name }) {

    let id = undefined;
    let history = useHistory();
    const currentURL = window.location.pathname;

    if (currentURL.includes("/view-notice/")) {
      id = currentURL.replace("/view-notice/", '');
    }
   
    const [noticeList, setNoticeList] = useState([]);
    const [page, setPage] = useState(1);
    const [searchFilter, setSearchFilter] = useState('');
    const [firstLoad, setFirstLoad] = useState(true);
    const [sort, setSort] = useState(pagination.sorting);
    const [sortby, setSortBy] = useState('id');
    const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
    const [totalPages, setTotalPages] = useState(1);
    const [tableLoader, setTableLoader] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [statusFilter, setStatusFilter] = useState(0);
  

    const [exportData, setExportData] = useState([]);
    const [noticeId, setNoticeId] = useState([]);
    const [showViewNoticeModal, setShowViewNoticeModal] = useState(false);
    const [reloadPage, setReloadPage] = useState(false);

    useEffect(() => {
      
      if (id !== undefined && `${id}` !== `${noticeId}`) {
        if (currentURL === `/view-notice/${id}`) {
          setNoticeId(id);
          setShowViewNoticeModal(true);
        }
      }
    }, [id]);

    useEffect(() => {
        if (firstLoad === false) {
          setPage(1);
          if (page === 1) {
            const timer = setTimeout(() => {
                fetchNoticeList();
            }, 500);
            return () => clearTimeout(timer);
          }
        }
    }, [searchFilter, reloadPage]);

    const fetchNoticeList = () => {
        setTableLoader(true);
        let params = "?";
        params = params + "sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby;
            
        APIService.getNoticeList(params)
          .then((response) => {
            // setRefreshButtonProcess(false);
            if (response.data?.status) {
              let newData = response.data?.data;
              setTotalPages(response.data?.pagination?.total_pages);
              setTotalRecords(response.data?.pagination?.total_records);
              setNoticeList(newData);
              setTableLoader(false);
              let exportHeader = ["Notice Title", "Start Date", 'End Date', "Date Added"];
              let exportData = [];
              newData?.map(item => {
                exportData.push(
                  {
                    message: item.message ? item.message : '',
                    start_date: item.start_date ? moment(new Date(item.start_date)).format(office_display_date_format_for_date) : '',
                    end_date: item.end_date ? moment(new Date(item.end_date)).format(office_display_date_format_for_date) : '',
                    created_at: item.created_at ? format(new Date(item.created_at), office_display_date_format_with_time) : '',
                });
                return '';
              });
              setExportData({ fileName: "notice-data", sheetTitle: "Notice", exportHeader: exportHeader, exportData: exportData });
            }
          });
      }

    let columns = [        
        {
            Header: 'Notice',
            id: 'message',
            accessor: (row) => <div dangerouslySetInnerHTML={{ __html: replaceSpecialCharacters(linkifyHtml(row?.message && row?.message !== undefined && row?.message !== "undefined" ? row?.message : '<p class="text-muted"></p>')).replaceAll("<a ", "<a rel='nofollow' target='_blank' ") }}></div>,
        },
        {
            Header: 'Start Date (IST)',
            id: 'start_date',
            accessor: (row) => row?.start_date,
            width: 150
        },
        {
            Header: 'End Date (IST)',
            id: 'end_date',
            accessor: (row) => row?.end_date,
        },
        {
            Header: 'Roles',
            id: 'role',
            disableSortBy: true,
            accessor: 'role',
                Cell: ({ row }) => (
                    <>
                        {row?.original?.role.length > 0 ?
                            row?.original?.role?.map((roleitem, roleIndex) => (
                                <span className="font-weight-regular" key={roleIndex}>{roleIndex + 1 === row?.original?.role.length ? roleitem.name : `${roleitem.name}, `}</span>
                            ))
                            : ''
                        }
                    </>
                ),
        },
        {
          Header: 'Added By',
          id: 'addedby_name',
          accessor: (row) => row?.addedby_name,
        },
        // {
        //     Header: 'Date Added (IST)',
        //     id: 'created_at',
        //     accessor: (row) => row?.created_at && format(new Date(row?.created_at), office_display_date_format_with_time),
        // },
        {
            Header: 'Date Updated (IST)',
            id: 'updated_at',
            accessor: (row) => row?.updated_at && format(new Date(row?.updated_at), office_display_date_format_with_time),
        }

    ];

    if (check(['notice.update', 'notice.delete', 'notice.view'], userData?.role.getPermissions)) {
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
                    {/* <Dropdown.Item onClick={() => { viewNoticeData(row?.id); }}>
                      View
                    </Dropdown.Item> */}
                    {userData?.role_code === databaseRoleCode.adminCode || (row?.added_by === userData?.id) ?
                      <PermissionCheck permissions={['notice.update']}>
                        <Dropdown.Item onClick={() => { handleNoticeEdit(row?.id) }}>
                          Edit
                        </Dropdown.Item>
                      </PermissionCheck>
                      : ''}
                    {userData?.role_code === databaseRoleCode.adminCode || (row?.added_by === userData?.id) ?
                      <PermissionCheck permissions={['notice.delete']}>
                        <Dropdown.Item className="text-danger" onClick={() => { handleNoticeDelete(row?.id) }}>
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

    const viewNoticeData = async (id) => {
      setNoticeId(id);
      setShowViewNoticeModal(true);
      window.history.replaceState(null, '', `/view-notice/${id}`);
    };

    useEffect(() => {
        fetchNoticeList();
        setFirstLoad(false);
    }, [sort, sortby, page, perPageSize]);
    
    const handleNoticeEdit = async (id) => {
      history.push(`/edit-notice/${id}`);
    };

    const handleNoticeDelete = async (id) => {
      confirmAlert({
        title: 'Confirm',
        message: DELETE_NOTICE,
        buttons: [
          {
            label: 'Yes',
            className: 'btn btn-primary btn-lg',
            onClick: () => {
              let params = {};
              params["id"] = id;

              APIService.deleteNotice(params)
              .then((response) => {
                if (response.data?.status) {
                  toast.success(response.data?.message, {
                    position: toast.POSITION.TOP_RIGHT
                  });
                  setReloadPage(!reloadPage);
                  setShowViewNoticeModal(false);
                  window.history.replaceState(null, '', `/notices`);
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
            <ViewNotice showViewNoticeModal={showViewNoticeModal} setShowViewNoticeModal={setShowViewNoticeModal} handleNoticeEdit={handleNoticeEdit} noticeId={noticeId} handleNoticeDelete={handleNoticeDelete} reloadPage={reloadPage} setReloadPage={setReloadPage} />
            <div className="main-content">
                <Header pagename={name} />
                <div className="inner-content pt-0 px-0">
                    <div className="notice-page">

                        <div className="bg-white py-3 px-4 px-lg-7 page-inner-header">
                            <Row className="g-2 lg:g-4">
                                <Col xl={4} lg={3} md={3} className="me-md-auto">
                                    <PermissionCheck permissions={['notice.create']}>
                                        <Link to="/add-notice" className="me-2 btn btn-primary btn-md">New Notice</Link>
                                    </PermissionCheck>                                   
                                </Col>                               
                            </Row>
                        </div>

                        <div className="pt-4 pt-lg-5 pt-xl-9 px-0 px-lg-4 px-xl-7">
                            <Card className="rounded-10 p-4 p-xl-6">
                                <Card.Body className="p-0 notice-list-table">
                                  <DataTableWithPagination columns={columns} data={noticeList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isExportable={false} exportData={exportData} isDragDropContext={statusFilter === 1} customPrioritySorting={statusFilter === 1} />
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
  
export default connect(mapStateToProps)(NoticeList)