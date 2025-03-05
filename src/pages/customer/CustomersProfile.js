import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Spinner, Row, Col, Form, Button, InputGroup, Tab, Tabs, Modal } from 'react-bootstrap';
import CustomerLeftPanel from './CustomerLeftPanel';
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import { useParams } from "react-router-dom";
import APIService from "../../api/APIService";
import { toast } from 'react-toastify';
import { validateForm } from "../../utils/validator.js";
import { CompanyValidator } from "../../modules/validation/CompanyValidator";
import { Globe } from 'react-bootstrap-icons';
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import { display_date_format_with_time, pagination, databaseRoleCode } from '../../settings';
import moment from 'moment';
import { DELETE_CONTACT_ADMINS } from '../../modules/lang/Customer';
import { confirmAlert } from 'react-confirm-alert';
import Select from 'react-select';
import { connect } from "react-redux";

function CustomersProfile({ userData, name }) {
  const [process, setProcess] = useState(true);
  const [saveProcess, setSaveProcess] = useState(false);
  let { id } = useParams();
  const [company, setCompany] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [formErrors, setFormErrors] = useState([]);

  const [firstLoad, setFirstLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');
  const [sort, setSort] = useState(pagination.sorting);
  const [sortby, setSortBy] = useState('staff_id');
  const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
  const [exportData, setExportData] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [activeTab, SetActiveTab] = useState("customer_details");
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [assignAdminSaveProcess, setAssignAdminSaveProcess] = useState(false);
  const [reloadPage, setReloadPage] = useState(false);

  const [showAssignAdminModal, setShowAssignAdminModal] = useState(false);
  const [tableLoader, setTableLoader] = useState(false);

  const cstSetCloseAssignAdminModal = () => {
    setShowAssignAdminModal(false);
  }

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
    APIService.getClientForEdit(id)
      .then((response) => {
        if (response.data?.status) {
          setCompany(response.data?.data?.company);
          setWebsite(response.data?.data?.website);
          setCompanyName(response.data?.data?.company);
        }
        setProcess(false);
      });
    APIService.getAllMembers('?role_code=agency_user')
      .then((response) => {
        if (response.data?.status) {
          let newStaffList = response.data?.data.map(item => {
            return { label: item.name, value: item.id }
          });
          setStaffList(newStaffList);
        }
      });
  }, []);

  useEffect(() => {
    fetchCustomerAdmins();
    setFirstLoad(false);
  }, [sort, sortby, page, perPageSize]);

  useEffect(() => {
    if (firstLoad === false) {
      setPage(1);
      if (page === 1) {
        const timer = setTimeout(() => {
          fetchCustomerAdmins();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [searchFilter, reloadPage]);

  const fetchCustomerAdmins = () => {
    setTableLoader(true);
    let params = `?userid=${id}&`;
    params = params + "sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby + "&company_id=" + id;
    if (searchFilter !== '') {
      params = params + "&search=" + searchFilter;
    }

    APIService.getCustomerAdmins(params)
      .then((response) => {
        if (response.data?.status) {
          setTotalPages(response.data?.pagination?.total_pages);
          setTotalRecords(response.data?.pagination?.total_records);
          setContactList(response.data?.data);
          let selectedStaffList = response.data?.data.map(item => {
            return { label: item.name, value: item.staff_id }
          });
          setSelectedStaff(selectedStaffList);
          setTableLoader(false);

          let exportHeader = ["Staff Member", "Date Assigned"];
          let exportData = [];
          response.data?.data?.map(item => {
            exportData.push(
              {
                id: item.name,
                last_login: item.date_assigned ? moment(item.date_assigned).format(display_date_format_with_time) : ''
              });
            return '';
          });
          setExportData({ fileName: "contact-data", sheetTitle: "Contacts", exportHeader: exportHeader, exportData: exportData });
          setProcess(false);
        }
      });
  }

  const saveCustomerDetails = async () => {
    setSaveProcess(true);
    setFormErrors([]);
    let validate = validateForm((CompanyValidator(company)));
    if (Object.keys(validate).length) {
      setSaveProcess(false);
      setFormErrors(validate);
    }
    else {
      let params = {};
      params["company"] = company;
      params["website"] = website;
      params["userid"] = id;
      APIService.updateClient(params)
        .then((response) => {
          if (response.data?.status) {
            toast.success(response.data?.message, {
              position: toast.POSITION.TOP_RIGHT
            });
            setCompanyName(company);
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
  };

  let columns = [
    {
      Header: 'Staff Member',
      id: 'name',
      accessor: (row) => row?.name,
    },
    {
      Header: 'Date Assigned',
      id: 'date_assigned',
      accessor: (row) => row?.date_assigned && moment(new Date(row?.date_assigned)).format(display_date_format_with_time),
    },
    {
      Header: 'Action',
      disableSortBy: true,
      Cell: ({ row }) => (
        <>
          <PermissionCheck permissions={['customers.delete']}>
            <button type="button" className="btn-icon circle-btn btn btn-dark-100 font-12 btn-sm ms-2" onClick={() => { handleDeleteAdmins(row?.original?.staff_id) }}><i className="icon-delete"></i></button>
          </PermissionCheck>
        </>
      ),
    }
  ];

  const handleDeleteAdmins = async (staffid) => {
    confirmAlert({
      title: 'Confirm',
      message: DELETE_CONTACT_ADMINS,
      buttons: [
        {
          label: 'Yes',
          className: 'btn btn-primary btn-lg',
          onClick: () => {
            let params = {};
            params["userid"] = id;
            params["staffid"] = staffid;
            APIService.deleteCustomerAdmins(params)
              .then((response) => {
                if (response.data?.status) {
                  toast.success(response.data?.message, {
                    position: toast.POSITION.TOP_RIGHT
                  });
                  fetchCustomerAdmins();
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

  const handleStaffSelect = (selectedPC) => {
    setSelectedStaff(selectedPC);
  };

  const saveCustomerAdmin = async () => {
    setAssignAdminSaveProcess(true);
    setFormErrors([]);
    let params = {};
    params["userid"] = id;
    let main_result = selectedStaff.map(a => a.value);
    params["staffids"] = main_result.length > 0 ? main_result.join(',') : '';;
    APIService.addCustomerAdmins(params)
      .then((response) => {
        if (response.data?.status) {
          toast.success(response.data?.message, {
            position: toast.POSITION.TOP_RIGHT
          });
          setReloadPage(!reloadPage);
          cstSetCloseAssignAdminModal();
          setAssignAdminSaveProcess(false);
        }
        else {
          toast.error(response.data?.message, {
            position: toast.POSITION.TOP_RIGHT
          });
          setAssignAdminSaveProcess(false);
        }
      })
      .catch((error) => {
        toast.error(error, {
          position: toast.POSITION.TOP_RIGHT
        });
        setAssignAdminSaveProcess(false);
      });
  };

  return (
    <div>
      <Sidebar />
      <div className="main-content">
        <Header pagename={name ? name : ''} />
        <div className="inner-content">
          <div className="paln-page row">
            <div className="col-12 col-xl-3 mb-3">
              <CustomerLeftPanel activeMenu="profile" companyName={companyName} id={id} process={process} />
            </div>
            <div className="col-12 col-xl-9">
              <Card className="rounded-10 border border-gray-100 mb-4">
                <Card.Body className="p-0">
                  <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                    <h3 className="card-header-title mb-0 my-md-2 ps-md-3 d-flex align-items-center">Profile </h3>
                  </div>
                </Card.Body>
                <Card.Body className="px-md-4 py-4">
                  <div className="px-md-3 py-md-3">
                    {process ?
                      <Spinner className='me-1' animation="border" variant="primary" />
                      :
                      <>
                        <Tabs activeKey={activeTab} id="completeCard" className="custom-tab mb-3 border-gray-100 align-items-center" onSelect={(e) => { SetActiveTab(e) }}>
                          <Tab eventKey="customer_details" title="Customer Details" className="px-0 pt-3">
                            <Form onSubmit={async e => { e.preventDefault(); await saveCustomerDetails() }}>
                              <Row className="g-4">
                                <Col xs={12} md={6}>
                                  <Form.Label className="d-block">Company<span className='validation-required-direct'></span></Form.Label>
                                  <Form.Control placeholder="Company" className={`description-area placeholder-dark dark-2 ${formErrors.companyInput && 'is-invalid'}`} value={company} onChange={(e) => { setCompany(e.target.value) }} />
                                  {formErrors.companyInput && (
                                    <span className="text-danger">{formErrors.companyInput}</span>
                                  )}
                                </Col>
                                <Col xs={12} md={6}>
                                  <Form.Label className="d-block">Website</Form.Label>
                                  <InputGroup>
                                    <Form.Control placeholder="Website" className={`h-auto placeholder-dark  dark-2`} value={website ? website : ''} onChange={(e) => { setWebsite(e.target.value) }} />
                                    {website &&
                                      
                                        <a href={website.includes("http") ? website : `http://${website}`} rel="noreferrer" target="_blank" className='btn btn-outline-secondary'><Globe /></a>
                                      
                                    }
                                  </InputGroup>
                                </Col>
                                <Col xs={12}>
                                    <PermissionCheck permissions={['customers.update']}>
                                      <Button disabled={saveProcess} variant="primary" size="md" type="submit">
                                        {
                                          !saveProcess && 'Save'
                                        }
                                        {
                                          saveProcess && <><Spinner size="sm" animation="border" className="me-1" />Save</>
                                        }
                                      </Button>
                                    </PermissionCheck>
                                </Col>
                              </Row>
                              
                            </Form>
                          </Tab>
                          <Tab eventKey="customer_admins" title="Customer Admins" className="px-0 pt-3">
                            {userData.role_code === databaseRoleCode.adminCode || userData.role_code === databaseRoleCode.agencyCode || userData.role_code === databaseRoleCode.agencyMemberCode ?
                              <Button variant="primary" size="md" type="button" className='mb-5' onClick={() => { setShowAssignAdminModal(true) }}>Assign admin</Button>
                              : ''
                            }
                            <DataTableWithPagination columns={columns} data={contactList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isBulkAction={false} exportData={exportData} />
                          </Tab>
                        </Tabs>
                      </>
                    }
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
          <Modal size="lg" show={showAssignAdminModal} onHide={cstSetCloseAssignAdminModal} centered>
            <Modal.Header closeButton className="py-5 px-5 px-lg-10">
              <Modal.Title className="font-20 dark-1 mb-0">Assign Admin</Modal.Title>
            </Modal.Header>
            <Modal.Body className="py-5 py-lg-9 px-5 px-lg-10">
              <Form onSubmit={async e => { e.preventDefault(); await saveCustomerAdmin() }}>
                <Row className="g-9">
                  <Col sm={12} md={12} lg={12}>
                    <Select styles={customStyles} options={staffList} onChange={handleStaffSelect} closeMenuOnSelect={false} className='custom-select' isMulti value={selectedStaff} />
                  </Col>
                  <Col lg={12} className="text-end">
                    <Button variant="soft-secondary" size="md" type="button" onClick={cstSetCloseAssignAdminModal}>Cancel</Button>
                    <Button disabled={assignAdminSaveProcess} variant="primary ms-3" size="md" type="submit">
                      {
                        !assignAdminSaveProcess && 'Save'
                      }
                      {
                        assignAdminSaveProcess && <><Spinner size="sm" animation="border" className="me-1" />Save</>
                      }
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Modal.Body>
          </Modal>
        </div>
        <Footer />
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  userData: state.Auth.user
})

export default connect(mapStateToProps)(CustomersProfile)