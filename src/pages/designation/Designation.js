import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, Button, Form, Offcanvas, Spinner, Dropdown } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { pagination, display_date_format, popperConfig } from '../../settings';
import moment from 'moment';
import { check } from "../../utils/functions.js";
import { validateForm } from "../../utils/validator.js";
import { DesignationValidator } from "../../modules/validation/DesignationValidator";
import { toast } from 'react-toastify';
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import { confirmAlert } from 'react-confirm-alert';
import { DELETE_DESIGNATION } from '../../modules/lang/Designation';

function Designation({ userData, name }) {
  const [showAddDesignationModal, setShowAddDesignationModal] = useState(false);
  const cstSetCloseAddDesignationModal = () => setShowAddDesignationModal(false);
  const cstShowAddDesignationModal = () => setShowAddDesignationModal(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [reloadPage, setReloadPage] = useState(false);
  const [designationList, setDesignationList] = useState([]);
  const [page, setPage] = useState(1);
  const [searchFilter, setSearchFilter] = useState('');
  const [saveProcess, setSaveProcess] = useState(false);
  const [sort, setSort] = useState(pagination.sorting);
  const [sortby, setSortBy] = useState('id');
  const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [formErrors, setFormErrors] = useState([]);
  const [designationId, setDesignationId] = useState(0);
  const [designationTitle, setDesignationTitle] = useState('');

  const [exportData, setExportData] = useState([]);
  const [tableLoader, setTableLoader] 	= useState(false);

  useEffect(() => {
    fetchDesignationList();
    setFirstLoad(false);
  }, [sort, sortby, page, perPageSize]);

  useEffect(() => {
    if (firstLoad === false) {
      setPage(1);
      if (page === 1) {
        const timer = setTimeout(() => {
          fetchDesignationList();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [searchFilter, reloadPage]);

  const fetchDesignationList = () => {
    setTableLoader(true);
    let params = "?";
    params = params + "sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby;
    if (searchFilter !== '') {
      params = params + "&search=" + searchFilter;
    }

    APIService.getDesignationListForAdmin(params)
      .then((response) => {
        if (response.data?.status) {
          let newData = response.data?.data;
          setTotalPages(response.data?.pagination?.total_pages);
          setTotalRecords(response.data?.pagination?.total_records);
          setDesignationList(newData);
          setTableLoader(false);
          let exportHeader = ["#", "Title", "Date Added"];
          let exportData = [];
          newData?.map(item => {
            exportData.push(
              {
                id: item.id,
                name: item.name,
                created_at: item.created_at ? moment(item.created_at).format(display_date_format) : '',
              });
            return '';
          });
          setExportData({ fileName: "designation-data", sheetTitle: "Designation", exportHeader: exportHeader, exportData: exportData });
        }
      });
  }

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
    },
    {
      Header: 'Date Added',
      id: 'created_at',
      accessor: (row) => row?.created_at && moment(new Date(row?.created_at)).format(display_date_format),
    },
  ];

  if (check(['designations.update', 'designations.delete'], userData?.role.getPermissions)) {
    columns = [
      ...columns,
      {
        Header: 'Action',
        disableSortBy: true,
        accessor: (row) => (
          <>
            <Dropdown className="category-dropdown edit-task-dropdown">
              <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="cursor-pointer" id="edit-task"><button size="sm" className='btn btn-white circle-btn btn-icon btn-sm'><i className="fa-solid fa-ellipsis-vertical"></i></button></Dropdown.Toggle>
              <Dropdown.Menu as="ul" align="end" className="dropdown-menu-end p-2" popperConfig={popperConfig}>
                <PermissionCheck permissions={['designations.update']}>
                  <Dropdown.Item onClick={() => { handleLeaveEdit(row?.id) }}>
                    Edit
                  </Dropdown.Item>
                </PermissionCheck>
                <PermissionCheck permissions={['designations.delete']}>
                  <Dropdown.Item className="text-danger" onClick={() => { handleDesignationDelete(row?.id) }}>
                    Delete
                  </Dropdown.Item>
                </PermissionCheck>
              </Dropdown.Menu>
            </Dropdown>
          </>
        ),
      },
    ]
  }

  const handleDesignationDelete = async (id) => {
    confirmAlert({
      title: 'Confirm',
      message: DELETE_DESIGNATION,
      buttons: [
        {
          label: 'Yes',
          className: 'btn btn-primary btn-lg',
          onClick: () => {
            let params = {};
            params["id"] = id;
            APIService.deleteDesignation(params)
              .then((response) => {
                if (response.data?.status) {
                  toast.success(response.data?.message, {
                    position: toast.POSITION.TOP_RIGHT
                  });
                  setReloadPage(!reloadPage);
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

  const handleLeaveEdit = async (id) => {
    let editLeaveData = designationList.filter(function (arr) {
      return arr.id === id;
    });
    if (editLeaveData.length > 0) {
      clearControl();
      let data = editLeaveData[0];
      setDesignationId(data?.id);
      setDesignationTitle(data?.name);
      cstShowAddDesignationModal();
    }
  };

  const addDesignation = async () => {
    clearControl();
    cstShowAddDesignationModal();
  };

  const addUpdateDesignation = async () => {
    setSaveProcess(true);
    setFormErrors([]);
    let validate = validateForm((DesignationValidator(designationTitle)));
    if (Object.keys(validate).length) {
      setSaveProcess(false);
      setFormErrors(validate);
    }
    else {
      let params = {};
      params["name"] = designationTitle;

      if (designationId === 0) {
        APIService.addDesignation(params)
          .then((response) => {
            if (response.data?.status) {
              toast.success(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
              setReloadPage(!reloadPage);
              clearControl();
              cstSetCloseAddDesignationModal();
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
        params['id'] = designationId;
        APIService.updateDesignation(params)
          .then((response) => {
            if (response.data?.status) {
              toast.success(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
              setReloadPage(!reloadPage);
              clearControl();
              cstSetCloseAddDesignationModal();
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
    setDesignationId(0);
    setDesignationTitle('');
    setFormErrors([]);
  };

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Header pagename={name} headerFilterButton={ check(['designations.create'], userData?.role.getPermissions) && <Button variant="primary" size="md" className='ms-auto' onClick={addDesignation}>Add Designation</Button>}/>
        <div className="inner-content pt-0 px-0">
          <div className="leave-page">
            <div className="bg-white py-3 px-4 px-lg-7 leave-header page-inner-header d-xl-block d-none">
              <Row className="g-2 g-xl-4">
                <Col xl={4} lg={3} md={3} className="me-md-auto">
                  <PermissionCheck permissions={['designations.create']}>
                    <Button variant="primary" size="md" onClick={addDesignation}>Add Designation</Button>
                  </PermissionCheck>
                </Col>
              </Row>
            </div>
            <div className="pt-0 pt-xl-5 pt-xl-9 px-0 px-lg-4 px-xl-7">
              <Card className="rounded-10 p-4 p-xl-6">
                <Card.Body className="p-0">
                  <DataTableWithPagination columns={columns} data={designationList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isExportable={true} exportData={exportData} />
                </Card.Body>
              </Card>
            </div>
          </div>
          <Offcanvas show={showAddDesignationModal} onHide={cstSetCloseAddDesignationModal} className="add-leave-sidebar" placement="end">
            <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
              <div className="d-flex align-items-center">
                <h3 className="m-0">Designation</h3>
              </div>
              <ul className="ovrlay-header-icons">
                <li>
                  <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={cstSetCloseAddDesignationModal}>
                    <i className="icon-cancel"></i>
                  </button>
                </li>
              </ul>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
              <Form onSubmit={async e => { e.preventDefault(); await addUpdateDesignation() }}>
                <SimpleBar className="offcanvas-inner">
                  <div className="p-6">
                    <Row className="g-7">
                      <Col xs={12} sm={12} md={12}>
                        <Form.Label className="d-block">Title<span className='validation-required-direct'></span></Form.Label>
                        <Form.Control placeholder="Title" value={designationTitle} onChange={(e) => { setDesignationTitle(e.target.value) }} className={`description-area placeholder-dark  dark-2 ${formErrors.designationTitleInput && 'is-invalid'}`} />
                        {formErrors.designationTitleInput && (
                          <span className="text-danger">{formErrors.designationTitleInput}</span>
                        )}
                      </Col>
                    </Row>
                  </div>
                </SimpleBar>
                <div className="add-comment-area action-bottom-bar-fixed action-bottom-bar-md px-6 py-3 border-top border-gray-100 text-end">
                  <Button disabled={saveProcess} variant="primary" size="md" type="submit">
                    {
                      !saveProcess && 'Save'
                    }
                    {
                      saveProcess && <><Spinner size="sm" animation="border" className="me-1" />Save</>
                    }
                  </Button>
                </div>
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

export default connect(mapStateToProps)(Designation)