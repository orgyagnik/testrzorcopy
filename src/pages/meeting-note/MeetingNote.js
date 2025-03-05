import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, Button, Form, Offcanvas, OverlayTrigger, Tooltip, Spinner } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { pagination, display_date_format, databaseRoleCode, tinymceInit } from '../../settings';
import moment from 'moment-timezone';
import { appHappyText, replaceSpecialCharacters } from "../../utils/functions.js";
import { validateForm } from "../../utils/validator.js";
import { MeetingNoteValidator } from "../../modules/validation/MeetingNoteValidator";
import { toast } from 'react-toastify';
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import { confirmAlert } from 'react-confirm-alert';
import { DELETE_MEETINGNOTE } from '../../modules/lang/MeetingNote';
import Select from 'react-select';
import SingleDatePickerControl from '../../modules/custom/SingleDatePicker';
import { Editor } from "@tinymce/tinymce-react";
import linkifyHtml from 'linkify-html';
import AvatarImg from "../../assets/img/placeholder-image.png";
import { Link } from "react-router-dom";
import { format } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const REACT_APP_TINYMCE_APIKEY = process.env.REACT_APP_TINYMCE_APIKEY;

function MeetingNote({ userData, name }) {
  const [showAddDesignationModal, setShowAddDesignationModal] = useState(false);
  const cstSetCloseAddDesignationModal = () => setShowAddDesignationModal(false);
  const cstShowAddDesignationModal = () => setShowAddDesignationModal(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [reloadPage, setReloadPage] = useState(false);
  const [meetingList, setMeetingList] = useState([]);
  const [page, setPage] = useState(1);
  const [saveProcess, setSaveProcess] = useState(false);
  /*const [searchFilter, setSearchFilter] = useState('');
  const [sort, setSort] = useState(pagination.sorting);
  const [sortby, setSortBy] = useState('id');*/
  const [perPageSize, setPerPageSize] = useState(pagination.perPageRecord);
  const [agencyList, setAgencyList] = useState([]);
  const [agency, setAgency] = useState(0);
  const [projectManager, setProjectManager] = useState(0);
  const [projectManagerOption, setProjectManagerOption] = useState([]);
  const [filterDate, setFilterDate] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [process, setProcess] = useState(false);

  const [formErrors, setFormErrors] = useState([]);
  const [agencyListForAdd, setAgencyListForAdd] = useState([]);
  const [agencyForAdd, setAgencyForAdd] = useState(0);
  const [dateForAdd, setDateForAdd] = useState(null);
  const [agenda, setAgenda] = useState('');
  const [meetingId, setMeetingId] = useState(0);

  //for html editor
  const [htmlContent, setHtmlContent] = useState();
  const onEditorChange = (e) => {
    setHtmlContent(e);
  }

  useEffect(() => {
    APIService.getAllAgency()
      .then((response) => {
        if (response.data?.status) {
          let newAgencyList = response.data?.data.map(item => {
            return { label: item.agency_name, value: item.staffid }
          });
          setAgencyList([{ label: 'All Agency', value: 0 }, ...newAgencyList]);
          setAgencyListForAdd([{ label: 'Select', value: 0 }, ...newAgencyList]);
        }
      });

    APIService.getAllMembers(`?role_code=project_manager_admin`)
      .then((response) => {
        if (response.data?.status) {
          let newStaffList = response.data?.data?.map(item => {
            return { label: item.name, value: item.id }
          });
          setProjectManagerOption([{ label: 'All', value: 0 }, ...newStaffList]);
        }
      });
  }, []);

  useEffect(() => {
    fetchMeetingList();
    setFirstLoad(false);
  }, [page]);

  useEffect(() => {
    if (firstLoad === false) {
      setPage(1);
      if (page === 1) {
        const timer = setTimeout(() => {
          fetchMeetingList();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [reloadPage]);

  const fetchMeetingList = () => {
    let params = "?";
    params = params + "sort=desc&limit=" + pagination.perPageRecord + "&page=" + page + "&sort_by=id";
    /*if (searchFilter !== '') {
      params = params + "&search=" + searchFilter;
    }*/
    if (agency !== 0) {
      params = params + "&search_by_agency=" + agency;
    }
    if (projectManager !== 0) {
      params = params + "&staff_id=" + projectManager;
    }
    if (filterDate) {
      params = params + "&meeting_date=" + format(filterDate, "yyyy-MM-dd");
    }

    APIService.getMeetingList(params)
      .then((response) => {
        if (response.data?.status) {
          let newData = response.data?.data;
          if (page === 1) {
            newData = response.data?.data;
          }
          else {
            newData = meetingList.concat(response.data?.data);
          }
          setProcess(false);
          setMeetingList(newData);
          setShowButton(response.data?.pagination?.total_pages > page);
        }
      });
  }

  const handleMeetingNoteDelete = async (id) => {
    confirmAlert({
      title: 'Confirm',
      message: DELETE_MEETINGNOTE,
      buttons: [
        {
          label: 'Yes',
          className: 'btn btn-primary btn-lg',
          onClick: () => {
            let params = {};
            params["id"] = id;
            APIService.deleteMeetingNote(params)
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

  const handleMeetingNoteEdit = async (id) => {
    let editMeetingNoteData = meetingList.filter(function (arr) {
      return arr.id === id;
    });
    if (editMeetingNoteData.length > 0) {
      clearControl();
      let data = editMeetingNoteData[0];
      setMeetingId(id);
      setAgencyForAdd(data?.agency_id);
      setDateForAdd(moment(data?.meeting_date)._d);
      setAgenda(data?.agenda);
      setHtmlContent(data?.description);
      cstShowAddDesignationModal();
    }
  };

  const addMeetingNote = async () => {
    clearControl();
    cstShowAddDesignationModal();
  };

  const addUpdateMeetingNote = async () => {
    setSaveProcess(true);
    setFormErrors([]);
    let validate = validateForm((MeetingNoteValidator(agencyForAdd !== 0 ? agencyForAdd : '', dateForAdd, agenda)));
    if (Object.keys(validate).length) {
      setSaveProcess(false);
      setFormErrors(validate);
    }
    else {
      let params = {};
      params["staff_id"] = userData?.id;
      params["agency_id"] = agencyForAdd;
      let agencyName = "";
      let selectedAgency = agencyListForAdd.filter(function (arr) { return arr.value === agencyForAdd; });
      if (selectedAgency.length > 0) {
        agencyName = selectedAgency[0].label;
      }
      params["agency_name"] = agencyName;
      params["meeting_date"] = format(dateForAdd, "yyyy-MM-dd");
      params["agenda"] = agenda;
      params["description"] = htmlContent ? htmlContent : '';

      if (meetingId === 0) {
        APIService.addMeetingNote(params)
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
        params['id'] = meetingId;
        APIService.updateMeetingNote(params)
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
    setMeetingId(0);
    setAgencyForAdd(0);
    setDateForAdd(null);
    setAgenda('');
    setFormErrors([]);
    setHtmlContent('');
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

  const handleAgencySelect = (selectedAgency) => {
    setAgency(selectedAgency?.value);
  };

  const handleAgencySelectForAdd = (selectedAgency) => {
    setAgencyForAdd(selectedAgency?.value);
  };

  const handleProjectManagerSelect = (selectedPc) => {
    setProjectManager(selectedPc?.value);
  };

  const handleClearFilter = async (e) => {
    setAgency(0);
    setProjectManager(0);
    setFilterDate(null);
    setReloadPage(!reloadPage);
  };

  const handleFilter = async (e) => {
    setReloadPage(!reloadPage);
  };

  const handleLoadMore = async (e) => {
    setPage(page + 1);
    setPerPageSize(perPageSize + pagination.perPageRecord);
    setProcess(true);
  };

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
      <div className="main-content">
        <Header pagename={name} headerFilterButton={<Button onClick={cstPageOffcanvasisShow} variant="outline-secondary" size="md" type="button" className='ms-auto d-xl-none d-block'>Filter <i className="icon-filter ms-2"></i></Button>}/>
        <div className="inner-content pt-0 px-0">
          <div className="leave-page">
            <div className="bg-white py-3 px-4 px-xl-7 meeting-note-header page-inner-header">
              <Row className="g-2 g-xl-4">
                <Col xl="auto" lg={3} md={3} className="me-md-auto">
                  <PermissionCheck permissions={['meetings.create']}>
                    <Button variant="primary" size="md" onClick={addMeetingNote}>Meeting Note</Button>
                  </PermissionCheck>
                </Col>
                <Col> 
                <div className={"custom-page-offcanvas " + (isPageOffcanvasisActive ? 'active' : '')}>
                      <div className='custom-page-offcanvas-header border-bottom border-gray-100 py-2 px-4 d-xl-none'>
                          <h5 className='m-0'>Filter</h5>
                          <Button type="button" variant="white" size='sm' className="btn-icon circle-btn btn" onClick={cstPageOffcanvasisHide}><i className="icon-cancel"></i></Button>
                      </div>
                      <div className='custom-page-offcanvas-body p-xl-0 p-4'>
                          <Row className="g-2 justify-content-xl-end">  
                            <Col xs={12} lg={4} xl={3} xxl={3}>
                              <Select styles={customStyles} className="control-md custom-select" options={agencyList} onChange={handleAgencySelect}
                                value={agencyList.filter(function (option) {
                                  return option.value === agency;
                                })} />
                            </Col>
                            <Col xs={12} lg={4} xl={3} xxl={3}>
                              <Select styles={customStyles} className="control-md custom-select" options={projectManagerOption} onChange={handleProjectManagerSelect}
                                value={projectManagerOption.filter(function (option) {
                                  return option.value === projectManager;
                                })} />
                            </Col>
                            <Col xs={12} lg={4} xl={3} xxl={3}>
                              <SingleDatePickerControl
                                selected={filterDate}
                                onDateChange={(date) => setFilterDate(date)}
                                onChange={(date) => setFilterDate(date)}
                                dateFormat={"MM-dd-yyyy"}
                                className={`form-control control-md`}
                                isClearable
                              />
                            </Col>
                            <Col xs={12} className='mt-4 d-xl-none d-block'>
                                <hr className='m-0' />
                            </Col>
                            <Col xl="auto" className='d-flex gap-2 flex-xl-row flex-row-reverse justify-content-sm-start justify-content-between'>
                                <Button variant="primary" size="md" type="button" onClick={() => { handleFilter() }}>Search</Button>
                                <Button variant="soft-secondary" size="md" type="button" onClick={() => { handleClearFilter() }}> <span className="icon-cancel d-xl-inline-block d-none"></span> <span className='d-xl-none'>Clear Filter</span></Button>
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
                  <div className="comment-area">
                    {meetingList.length > 0 ?
                      <>
                        {meetingList?.map((meeting, index) => (
                          <div className="comment-list mb-3 p-6" key={index}>
                            <div className="d-flex w-100">
                              <div className="comments-icon">
                                {meeting.profile_image !== '' && meeting.profile_image !== null ?
                                  <img className="avatar-img" src={`${meeting.profile_image}`} alt={meeting.name} onError={({ currentTarget }) => {
                                    currentTarget.onerror = null;
                                    currentTarget.src = AvatarImg;
                                  }} />
                                  :
                                  <img className="avatar-img" src={AvatarImg} alt={meeting.name} />
                                }
                              </div>
                              <div className="comments-detail ms-3">
                                <div className="comments-header d-flex align-items-md-center">
                                  <div className="d-flex flex-md-row flex-column align-items-md-center">
                                    {userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode ?
                                      <Link to={`/user-detail/${meeting.staff_id}`} className="commnets-name font-weight-medium text-nowrap">{meeting.name}</Link>
                                      : <span className="commnets-name font-weight-medium text-nowrap">{meeting.name}</span>
                                    }
                                  </div>
                                  <div className="d-flex align-items-md-center ms-auto">
                                    {userData.role_code === databaseRoleCode.adminCode || meeting.staff_id === userData?.id ?
                                      <>
                                        <PermissionCheck permissions={['meetings.update']}>
                                          <button type="button" className="ms-4 btn-icon circle-btn text-primary btn btn-white btn-sm" onClick={(e) => { handleMeetingNoteEdit(meeting.id) }}><i className="icon-edit"></i></button>
                                        </PermissionCheck>
                                        <PermissionCheck permissions={['meetings.delete']}>
                                          <button type="button" className="ms-2 btn-icon circle-btn text-danger btn btn-white btn-sm" onClick={(e) => { handleMeetingNoteDelete(meeting.id) }}><i className="icon-delete"></i></button>
                                        </PermissionCheck>
                                      </>
                                      : ''}
                                  </div>
                                </div>
                                <p className="m-0 w-100 font-12"><b>Agency:</b> {meeting?.agency_name}</p>
                                <p className="m-0 w-100 font-12"><b>Date:</b> {moment(meeting?.meeting_date).format(display_date_format)}</p>
                                <p className="m-0 w-100 font-12"><b>Agenda:</b> {meeting?.agenda}</p>
                                <div className="comments-body pt-3">
                                  {meeting?.description && <p dangerouslySetInnerHTML={{ __html: replaceSpecialCharacters(linkifyHtml(appHappyText(meeting?.description))).replaceAll("<a ", "<a rel='nofollow' target='_blank' ") }}></p>}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {showButton &&
                          <div className="bg-dark-11 p-2 text-center">
                            <Button disabled={process} variant="white" size="md" type="button" className='bulk-action-btn text-primary' onClick={() => { handleLoadMore(); setPerPageSize(perPageSize * 2); }}>
                              {
                                !process && 'Load More'
                              }
                              {
                                process && <><Spinner size="sm" animation="grow" className="me-1" />Load More</>
                              }
                              <i className="icon-add font-12 ms-2"></i>
                            </Button>
                          </div>
                        }
                      </>
                      :
                      <p className='text-center m-0'>Data not found</p>
                    }
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
          <Offcanvas show={showAddDesignationModal} onHide={cstSetCloseAddDesignationModal} enforceFocus={false} className="add-task-sidebar" placement="end">
            <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
              <div className="d-flex align-items-center">
                <h3 className="m-0">Meeting Note</h3>
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
              <Form onSubmit={async e => { e.preventDefault(); await addUpdateMeetingNote() }}>
                <SimpleBar className="offcanvas-inner">
                  <div className="p-6">
                    <Row className="g-7">
                      <Col xs={12} sm={12} md={6} xl={3}>
                        <Form.Label className="d-block">Agency<span className='validation-required-direct'></span></Form.Label>
                        <Select styles={customStyles} classNamePrefix="react-select" className={`custom-select ${formErrors.agencyInput && 'is-react-select-invalid'}`} options={agencyListForAdd} onChange={handleAgencySelectForAdd}
                          value={agencyListForAdd.filter(function (option) {
                            return option.value === agencyForAdd;
                          })} />
                        {formErrors.agencyInput && (
                          <span className="text-danger">{formErrors.agencyInput}</span>
                        )}
                      </Col>
                      <Col xs={12} sm={12} md={6} xl={3}>
                        <Form.Label className="d-block">Meeting Date<span className='validation-required-direct'></span></Form.Label>
                        <SingleDatePickerControl
                          selected={dateForAdd}
                          onDateChange={(date) => setDateForAdd(date)}
                          onChange={(date) => setDateForAdd(date)}
                          dateFormat={"MM-dd-yyyy"}
                          className={`form-control ${formErrors.dateInput && 'is-invalid'}`}
                          isClearable
                        />
                        {formErrors.dateInput && (
                          <span className="text-danger">{formErrors.dateInput}</span>
                        )}
                      </Col>
                      <Col xs={12}  xl={6}>
                        <Form.Label className="d-block">Agenda<span className='validation-required-direct'></span></Form.Label>
                        <Form.Control placeholder="Agenda" value={agenda} onChange={(e) => { setAgenda(e.target.value) }} className={`placeholder-dark  dark-2 ${formErrors.agendaInput && 'is-invalid'}`} />
                        {formErrors.agendaInput && (
                          <span className="text-danger">{formErrors.agendaInput}</span>
                        )}
                      </Col>
                      <Col xs={12} sm={12} md={12}>
                        <Form.Label className="d-block">Description</Form.Label>
                        {/* <Editor
                          apiKey={REACT_APP_TINYMCE_APIKEY}
                          value={htmlContent}
                          init={tinymceInit}
                          onEditorChange={onEditorChange}
                        /> */}
                        <ReactQuill theme="snow" value={htmlContent} onChange={setHtmlContent} />
                      </Col>
                    </Row>
                  </div>
                </SimpleBar>
                <div className="add-comment-area action-bottom-bar-fixed  px-6 py-3 border-top border-gray-100 text-end">
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

export default connect(mapStateToProps)(MeetingNote)