import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, Button, Spinner, Modal, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import AvatarImg from "../../assets/img/placeholder-image.png";
import APIService from "../../api/APIService";
import { useLocation, Link } from "react-router-dom";
import { pagination, databaseRoleCode, display_date_format_with_time } from '../../settings';
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { ACTIVE_DEACTIVE_MESSAGE, USER_BULK_ACTION } from '../../modules/lang/User';
import UserListLoader from '../../modules/custom/SkeletonLoader/UserListLoader';
import LastSeen from "../../modules/custom/LastSeen";
import moment from 'moment';
import Select from 'react-select';
import { connect } from "react-redux";
import { UserBulkActionValidator } from "../../modules/validation/UserValidator";
import { validateForm } from "../../utils/validator.js";
import { check, encryptToken } from "../../utils/functions.js";

function Users({ userData, name }) {
   const searchLocation = useLocation().search;
   const searchDesignation = new URLSearchParams(searchLocation).get('designation');
   const [page, setPage] = useState(1);
   const [staffList, setStaffList] = useState([]);
   const [process, setProcess] = useState(false);
   const [pageLoader, setPageLoader] = useState(true);
   const [showButton, setShowButton] = useState(false);
   const [reloadList, setReloadList] = useState(false);
   const [search, setSearch] = useState('');
   const [sort, setSort] = useState("desc");
   const [sortby, setSortBy] = useState("created_at");
   const [refrashLoad, setRefrashLoad] = useState(false);
   const [firstLoad, setFirstLoad] = useState(true);
   const [designationOption, setDesignationOption] = useState([]);
   const [designation, setDesignation] = useState(searchDesignation ? parseInt(searchDesignation) : 0);
   const [roleList, setRoleList] = useState([]);
   const [role, setRole] = useState(0);
   const [totalRecords, setTotalRecords] = useState(0);
   const [activeCustomerFilter, setActiveCustomerFilter] = useState(true);

   //Bulk action 
   const [saveProcess, setSaveProcess] = useState(false);
   const [showBulkActionModal, setShowBulkActionModal] = useState(false);
   const [projectManagerOption, setProjectManagerOption] = useState([]);
   const [projectManager, setProjectManager] = useState([]);
   const [agencyOption, setAgencyOption] = useState([]);
   const [agency, setAgency] = useState([]);
   const [formErrors, setFormErrors] = useState([]);
   const [primaryPc, setPrimaryPc] = useState(false);
   const [deletePc, setDeletePc] = useState(false);
   const dropdownRef = useRef();

   const cstSetCloseBulkActionModal = () => {
      setShowBulkActionModal(false);
      setTimeout(() => {
         clearControl();
      }, 200);
   }

   const cstSetShowBulkActionModal = () => {
      setShowBulkActionModal(true);
      clearControl();
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

   const handleProjectManagerSelect = (selectedPC) => {
      setProjectManager(selectedPC);
      if (selectedPC.length > 1) {
         setPrimaryPc(false);
      }
   };

   const handleAgencySelect = (selectedPC) => {
      setAgency(selectedPC);
   };

   useEffect(() => {

   }, [refrashLoad]);


   const fetchUserList = () => {
      //let params = "?";
      let params = "?is_not_staff=0&";
      params = params + "sort=" + sortby + ':' + sort + "&limit=" + pagination.sorting + "&limit=" + pagination.perPageRecordForUser + "&page=" + page;
      if (search !== '') {
         params = params + "&search=" + search;
      }
      if (`${designation}` !== '0') {
         params = params + "&designation=" + designation;
      }
      if (`${role}` !== '0') {
         params = params + "&role=" + role;
      }
      if (activeCustomerFilter)
         params = params + "&active=1";

      APIService.getStaffList(params)
         .then((response) => {
            if (response.data?.status) {
               setShowButton(response.data?.pagination?.total_pages > page);
               setTotalRecords(response.data?.pagination?.total_records);
               let newData = [];
               if (page === 1) {
                  newData = response.data?.data;
               }
               else {
                  newData = staffList.concat(response.data?.data);
               }
               setProcess(false);
               setStaffList(newData);
               setPageLoader(false);
            }
         });
   }

   useEffect(() => {
      fetchUserList();
      setFirstLoad(false);
   }, [page]);

   const handleSearchChange = async (e) => {
      setSearch(e.target.value);
      /*if (e.target.value.length > 3 || e.target.value === '') {
         fetchUserList()
      }*/
   };

   useEffect(() => {
      if (firstLoad === false) {
         setPage(1);
         //if (search.length > 2 || search === '') {
         if (page === 1) {
            const timer = setTimeout(() => {
               fetchUserList();
            }, 500);
            return () => clearTimeout(timer);
         }
         //}
      }
   }, [designation, role, reloadList, activeCustomerFilter]);

   useEffect(() => {
      if (firstLoad === false) {
         setPage(1);
         if (search.length > 2 || search === '') {
            const timer = setTimeout(() => {
               fetchUserList();
            }, 500);
            return () => clearTimeout(timer);
         }
      }
   }, [search]);


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

      if (check(['roles.view'], userData?.role.getPermissions)) {
         APIService.getRoleList()
            .then((response) => {
               if (response.data?.status) {
                  let newRoleList = response.data?.data.filter(items => {
                     return items.code !== databaseRoleCode.agencyCode && items.code !== databaseRoleCode.agencyMemberCode && items.code !== databaseRoleCode.clientCode;
                  })
                     .map(item => {
                        return { label: item.name, value: item.roleid }
                     });
                  setRoleList([{ label: 'All Roles', value: 0 }, ...newRoleList]);
               }
            });
      }

      APIService.getAllMembers(`?role_code=project_manager`)
         .then((response) => {
            if (response.data?.status) {
               let newStaffList = response.data?.data.map(item => {
                  return { label: item.name, value: item.id }
               });
               setProjectManagerOption(newStaffList);
            }
         });

      APIService.getAllAgency(`?role_code=project_manager`)
         .then((response) => {
            if (response.data?.status) {
               let newStaffList = response.data?.data.map(item => {
                  return { label: item.agency_name, value: item.staffid }
               });
               setAgencyOption(newStaffList);
            }
         });
   }, []);

   const handleClearFilter = async (e) => {
      setPage(1);
      setSearch('');
      setDesignation(0);
      setRole(0);
      setActiveCustomerFilter(true);
   };

   const handleEnableDisableStaff = async (staffid, active, index) => {
      let active_deactive_status = "activate";
      if (active === 0) {
         active_deactive_status = "deactivate";
      }
      confirmAlert({
         title: 'Confirm',
         message: ACTIVE_DEACTIVE_MESSAGE.replace("{active_deactive_status}", active_deactive_status),
         buttons: [
            {
               label: 'Yes',
               className: 'btn btn-primary btn-lg',
               onClick: () => {
                  let params = {};
                  params["staffid"] = staffid;
                  params["active"] = active;
                  APIService.enableDisableStaff(params)
                     .then((response) => {
                        if (response.data?.status) {
                           let newstaffList = staffList;
                           newstaffList[index].active = active;
                           setStaffList(newstaffList);
                           setRefrashLoad(!refrashLoad);
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

   const handleLoadMore = async (e) => {
      setPage(page + 1);
      setProcess(true);
   };

   const handleDesignationSelect = (selectedDesignation) => {
      setDesignation(selectedDesignation?.value);
   };

   const handleRoleSelect = (selectedRole) => {
      setRole(selectedRole?.value);
   };

   const handleBulkActions = async () => {
      setSaveProcess(true);
      let validate = validateForm((UserBulkActionValidator(agency.length > 0 ? 'Not Required' : '', projectManager.length > 0 ? 'Not Required' : '')));
      if (Object.keys(validate).length) {
         setFormErrors(validate);
         setSaveProcess(false);
      }
      else {
         confirmAlert({
            title: 'Confirm',
            message: USER_BULK_ACTION,
            buttons: [
               {
                  label: 'Yes',
                  className: 'btn btn-primary btn-lg',
                  onClick: () => {
                     const params = {};
                     let agencyIdsList = agency.map((obj) => obj.value);
                     let agencyIds = agencyIdsList.join();
                     let pcIdsList = projectManager.map((obj) => obj.value);
                     let pcIds = pcIdsList.join();
                     params['agencyids'] = agencyIds;
                     params['pc_members'] = pcIds;
                     params['is_primary'] = primaryPc ? 1 : 0;
                     params['is_remove'] = deletePc ? 1 : 0;

                     APIService.userBulkAction(params)
                        .then((response) => {
                           if (response.data?.status) {
                              cstSetCloseBulkActionModal();
                              setTimeout(() => {
                                 toast.success(response.data?.message, {
                                    position: toast.POSITION.TOP_RIGHT
                                 });
                              }, 200);
                              setSaveProcess(false);
                              setReloadList(!reloadList);
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
               },
               {
                  label: 'No',
                  className: 'btn btn-outline-secondary btn-lg',
                  onClick: () => {
                     setSaveProcess(false);
                  }
               }
            ]
         });
      }
   }

   const clearControl = async () => {
      setAgency([]);
      setProjectManager([]);
      setPrimaryPc(false);
      setDeletePc(false);
   }

   const copyUserEmail = (email) => {
      navigator.clipboard.writeText(email);
   };

   const loginUser = (id) => {
      const params = {};
      params['staff_id'] = id;
      APIService.autoLogin(params)
         .then((response) => {
            if (response.data?.status) {
               //Old token set 
               localStorage.setItem("accessToken_old", localStorage.getItem("rz_access_token"));
               localStorage.setItem("refreshToken_old", localStorage.getItem("rz_refresh_token"));
               localStorage.setItem("rz_user_role_old", localStorage.getItem("rz_user_role"));

               //New token set
               localStorage.setItem("rz_access_token", encryptToken(response.data?.data.access_token));
               localStorage.setItem("rz_refresh_token", encryptToken(response.data?.data.refresh_token));
               localStorage.setItem("rz_user_role", encryptToken(response.data?.data.role));
               window.location = "/";
            }
            else {
               toast.error(response.data?.message, {
                  position: toast.POSITION.TOP_RIGHT
               });
            }
         })
         .catch((error) => {
            toast.error(error, {
               position: toast.POSITION.TOP_RIGHT
            });
         });
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

   return (
      <>
         <Sidebar />
         <div className="main-content">
            <Header pagename={name ? name : ''} headerFilterButton={<Button onClick={cstPageOffcanvasisShow} variant="outline-secondary" size="md" type="button" className='ms-auto d-xl-none d-block'>Filter <i className="icon-filter ms-2"></i></Button>}/>
            <div className="inner-content py-0 px-0">
               <div className="people-section">
                  {userData.role_code === databaseRoleCode.agencyCode ?
                     <div className="user-search-box mb-7 px-4 px-lg-7 mt-7">
                        <div className="input-group border-bottom border-gray-100 px-0 align-items-center">
                           <span className="icon-serach"></span>
                           <input type="text" className="form-control border-0 background-transparent" value={search} onChange={handleSearchChange} placeholder="Search for people" />
                           <Button variant="white" size="md" type="button" onClick={handleClearFilter}><i className="icon-cancel"></i></Button>
                        </div>
                     </div>
                     :
                     <div className="bg-white py-3 px-4 px-xl-7 taskboard-header page-inner-header">
                        <Row className="g-2 g-lg-4">
                           <Col xs="auto" >
                              <PermissionCheck permissions={['users.update']}>
                                 <Button className="bulk-action-btn" variant="soft-secondary" size="md" onClick={cstSetShowBulkActionModal}>Bulk Actions</Button>
                              </PermissionCheck>
                           </Col>
                           <Col xs="auto">
                              <h3 className="mt-2">Total Users: {totalRecords ? totalRecords : 0}</h3>
                           </Col>
                           <Col xs="auto" className='ms-auto d-none d-md-block'>
                              <div className="search-box size-md w-100">
                                 <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                    <span className="icon-serach"></span>
                                    <input type="text" className="form-control border-0" placeholder="Search for people" value={search} onChange={handleSearchChange} />
                                    <span className='search-clear icon-cancel cursor-pointer p-2 font-12 dark-6' onClick={(e) => { setSearch('') }}></span>
                                 </div>
                              </div>
                           </Col>
                           <Col xs="auto"> 
                           <div className='position-relative'>
                              <Button onClick={cstPageOffcanvasisShow} variant="outline-secondary" size="md" type="button" className='ms-auto d-xl-block d-none'>Filter <i className="icon-filter ms-2"></i></Button>
                                 <div className={"custom-page-offcanvas filter-show-desktop " + (isPageOffcanvasisActive ? 'active' : '')} ref={dropdownRef}>
                                    <div className='custom-page-offcanvas-header border-bottom border-gray-100 py-2 px-4'>
                                       <h5 className='m-0'>Filter</h5>
                                       <Button variant="outline-secondary" className='ms-auto' size="sm" type="button" onClick={() => { handleClearFilter() }}> <span>Clear Filter</span></Button>
                                       <Button type="button" variant="white" size='sm' className="btn-icon circle-btn btn" onClick={cstPageOffcanvasisHide}><i className="icon-cancel"></i></Button>
                                    </div>
                                    <div className='custom-page-offcanvas-body p-4'>
                                       <Row className="g-2 g-lg-4 justify-content-xl-end">  
                                          <Col xs={12}>
                                             <Select styles={customStyles} className="control-md custom-select" options={designationOption} onChange={handleDesignationSelect}
                                             value={designationOption.filter(function (option) {
                                                return option.value === designation;
                                             })} />
                                          </Col>
                                          <Col xs={12}>
                                             <Select styles={customStyles} className="control-md custom-select" options={roleList} onChange={handleRoleSelect}
                                             value={roleList.filter(function (option) {
                                                return option.value === role;
                                             })} />
                                          </Col>
                                          <Col xs={12} className='d-md-none'>
                                             <div className="search-box size-md w-100">
                                                <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                                   <span className="icon-serach"></span>
                                                   <input type="text" className="form-control border-0" placeholder="Search for people" value={search} onChange={handleSearchChange} />
                                                   <span className='search-clear icon-cancel cursor-pointer p-2 font-12 dark-6' onClick={(e) => { setSearch('') }}></span>
                                                </div>
                                             </div>
                                          </Col>
                                          <Col xs={12}>
                                             <Form.Check className='mb-0 mt-md-2 mt-4 ms-md-auto' type="checkbox" id="exclude-inactive-users" label="Exclude Inactive Users" value="1" checked={activeCustomerFilter} onChange={(e) => setActiveCustomerFilter(e.target.checked)} />
                                          </Col>
                                          <Col xs={12} className='mt-4 d-xl-none d-block'>
                                             <hr className='m-0' />
                                          </Col>
                                          <Col xl="auto" className='d-flex d-xl-none gap-2 flex-row-reverse justify-content-sm-start justify-content-between'>
                                             <Button variant="primary" size="md" type="button" onClick={() => { cstPageOffcanvasisHide() }}>Search</Button>
                                             <Button variant="soft-secondary" size="md" type="button" onClick={() => { handleClearFilter() }}> <span>Clear Filter</span></Button>
                                          </Col>
                                          {/* <Col xl="auto" className='d-flex gap-2 flex-xl-row flex-row-reverse justify-content-sm-start justify-content-between'>
                                             <Button variant="primary" size="md" type="button" onClick={() => { cstPageOffcanvasisHide() }} className='d-xl-none'>Search</Button>
                                             <Button variant="soft-secondary" size="md" type="button" onClick={() => { handleClearFilter() }}> Clear </Button>
                                          </Col> */}
                                       </Row>
                                    </div>
                                 </div>
                              </div>
                           </Col>
                           
                        </Row>
                     </div>
                  }
                  <div className="pt-4 pt-lg-5 pt-xl-9 px-4 px-xl-7">
                     {pageLoader ?
                        <UserListLoader perPageRecord={pagination.perPageRecordForUser} />
                        :
                        <>
                           <Row className="g-xxl-5 g-4 row-cols-xxxl-5">
                              {check(['users.create'], userData?.role.getPermissions) &&
                                 <Col xxl={3} xl={4} lg={4} md={4} sm={6}>
                                    <Card className="border rounded-5 p-6 border-gray-100 h-100 add-people cursor-pointer">
                                       <Link to="/add-user" className="p-0 text-center d-flex flex-column justify-content-center card-body">
                                          {/* <Card.Body className="p-0 text-center d-flex flex-column justify-content-center"> */}
                                          <div className="add-card-icon mx-auto mb-5">
                                             <span className="icon-add"></span>
                                          </div>
                                          <p className="mb-0 font-14">Add teammate</p>
                                          {/* </Card.Body> */}
                                       </Link>
                                    </Card>
                                 </Col>
                              }
                              {staffList.length > 0 &&
                                 staffList.map((staff, index) => (
                                    <Col xxl={3} xl={4} lg={4} md={4} sm={6} key={index}>
                                       <Card className={`border rounded-5 p-6 h-100 overflow-hidden people-card ${staff.active === 0 ? 'border-danger' : 'border-gray-100'}`}>
                                          <Card.Body className="p-0 text-center d-flex flex-column justify-content-center">
                                             <div className="flex-1">
                                                {staff.profile_image !== '' && staff.profile_image !== null ?
                                                   <img className="avatar-img mb-5 mx-auto" src={`${staff.profile_image}`} alt="Avatar" />
                                                   :
                                                   <img className="avatar-img mb-5 mx-auto" src={AvatarImg} alt="Avatar" />
                                                }
                                                <p className="font-14 font-weight-semibold dark-1 mb-1 lh-base">
                                                   {userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode ?
                                                      <Link className="dark-1" to={`/user-detail/${staff.id}`}>{`${staff.full_name}`}</Link>
                                                      : `${staff.full_name}`
                                                   }
                                                </p>
                                                <a href={`mailto:${staff?.email}`} className="font-12 dark-3">{staff.email}</a>
                                                {staff.designation_name &&
                                                   <p className="font-12 font-weight-semibold dark-1 mt-3 mb-0 lh-base">Designation:&nbsp;<span className="font-weight-regular">{staff.designation_name}</span></p>}
                                                {staff.role_code === databaseRoleCode.agencyCode || staff.role_code === databaseRoleCode.agencyMemberCode ?
                                                   <>
                                                      <p className="font-12 font-weight-semibold dark-1 mt-3 mb-0 lh-base">Agency:&nbsp;
                                                         {staff?.pc_members.length > 0 ?
                                                            <OverlayTrigger overlay={<Tooltip>
                                                               {staff?.pc_members?.map((pcUser, pcIndex) => (
                                                                  <span className="font-weight-regular" key={pcIndex}>{pcIndex + 1 === staff?.pc_members.length ? pcUser.name : `${pcUser.name}, `}</span>
                                                               ))}
                                                            </Tooltip>}>
                                                               <span className="font-weight-regular">{staff.agency_name}</span>
                                                            </OverlayTrigger>
                                                            :
                                                            <span className="font-weight-regular">{staff.agency_name}</span>
                                                         }
                                                      </p>
                                                   </>
                                                   : ''
                                                }
                                                <p className="font-12 font-weight-semibold dark-1 mt-3 mb-0 lh-base">
                                                   Role:&nbsp;<span className='font-weight-regular'>
                                                      {staff.role_code === databaseRoleCode.agencyCode && 'UnlimitedWP Customer'}
                                                      {staff.role_code === databaseRoleCode.agencyMemberCode && 'Agency Member'}
                                                      {staff.role_code !== databaseRoleCode.agencyMemberCode && staff.role_code !== databaseRoleCode.agencyCode && staff.role}</span>
                                                </p>
                                                <p className="font-12 font-weight-semibold dark-1 mt-3 mb-0 lh-base">Last Login:&nbsp;{staff.last_login && staff.last_login !== null ?
                                                   <OverlayTrigger placement="bottom" overlay={<Tooltip id={`tooltip-1`}> {moment(staff.last_login).format(display_date_format_with_time)}</Tooltip>}>
                                                      <span className='font-weight-regular'>
                                                         <LastSeen date={Date.parse(moment(staff.last_login).format())} />
                                                      </span>
                                                   </OverlayTrigger>
                                                   : 'Never'}
                                                </p>
                                             </div>
                                             <div className='card-actions'>
                                                <ul>

                                                   <PermissionCheck permissions={['users.update']}>
                                                      <li>
                                                         <OverlayTrigger placement="bottom" overlay={<Tooltip id="Edit-User"> Edit User</Tooltip>}>
                                                            <Link to={`/edit-user/${staff.id}`} className="btn-icon-edit btn-icon circle-btn btn btn-icon-secondary btn-sm" title='Edit User'><i className="icon-edit"></i></Link>
                                                         </OverlayTrigger>
                                                      </li>
                                                   </PermissionCheck>
                                                   <li>
                                                      <OverlayTrigger placement="bottom" overlay={<Tooltip id="Copy-User-Email"> Copy User Email</Tooltip>}>
                                                         <span className="btn-icon-link btn-icon circle-btn btn btn-icon-secondary btn-sm" onClick={(e) => { copyUserEmail(staff.email) }} title='Copy User Email'><i className="icon-link"></i></span>
                                                      </OverlayTrigger>
                                                   </li>
                                                   {userData.role_code === databaseRoleCode.adminCode &&
                                                      <OverlayTrigger placement="bottom" overlay={<Tooltip id="Login-User"> Login User Account</Tooltip>}>
                                                         <li>
                                                            <span className="btn-icon-login btn-icon circle-btn btn btn-icon-secondary btn-sm" onClick={(e) => { loginUser(staff.id) }} title='Login User Account'><i className="fa-regular fa-user"></i></span>
                                                         </li>
                                                      </OverlayTrigger>
                                                   }
                                                   <PermissionCheck permissions={['users.delete']}>
                                                      <li>
                                                         <OverlayTrigger placement="bottom" overlay={<Tooltip id="Activate-Deactivate-User"> Activate / Deactivate User</Tooltip>}>
                                                            {staff.active === 0 ?
                                                               <Form.Check type="switch" id="staff-deactive-radio" checked={false} onChange={(e) => { handleEnableDisableStaff(staff.id, 1, index) }} />
                                                               :
                                                               <Form.Check type="switch" id="staff-deactive-radio" checked={true} onChange={(e) => { handleEnableDisableStaff(staff.id, 0, index) }} />
                                                            }
                                                         </OverlayTrigger>
                                                      </li>
                                                   </PermissionCheck>
                                                </ul>
                                             </div>
                                          </Card.Body>
                                       </Card>
                                    </Col>
                                 ))}
                           </Row>
                           {staffList.length === 0 &&
                              <Card className='border rounded-5 p-20 h-100 people-card border-gray-100 mt-20'>
                                 <Card.Body className="p-0 text-center d-flex flex-column justify-content-center">
                                    <div className="add-card-icon mx-auto mb-5 p-5 bg-danger rounded-full">
                                       <span className="icon-close1 font-24  text-white"></span>
                                    </div>
                                    <h2 className="mb-0 text-danger">Record Not Found!!!</h2>
                                 </Card.Body>
                              </Card>
                           }
                           <Row className="g-xxl-5 g-4">
                              <Col xxl={12} xl={12} lg={12} md={12} sm={12} className="text-center">
                                 {showButton &&
                                    <Button disabled={process} variant="primary" size="md" type="button" className='mt-4 margin-auto' onClick={handleLoadMore}>
                                       {
                                          !process && 'Load More'
                                       }
                                       {
                                          process && <><Spinner size="sm" animation="grow" className="me-1" />Load More</>
                                       }
                                    </Button>
                                 }
                              </Col>
                           </Row>
                        </>}
                  </div>
               </div>

               <Modal size="lg" show={showBulkActionModal} onHide={cstSetCloseBulkActionModal} centered>
                  <Modal.Header closeButton className="py-5 px-10">
                     <Modal.Title className="font-20 dark-1 mb-0">Bulk Actions</Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="p-0">
                     <div className="invite-people py-9 px-10">
                        <Form onSubmit={async e => { e.preventDefault(); await handleBulkActions() }}>
                           <Row className="g-6">
                              <Col lg={12}>
                                 <Form.Label className="mb-2">Select Project Manager<span className='validation-required-direct'></span></Form.Label>
                                 <Select styles={customStyles} className='custom-select' options={projectManagerOption} onChange={handleProjectManagerSelect} closeMenuOnSelect={false} isMulti value={projectManager} />
                                 {formErrors.projectManagerInput && (
                                    <span className="text-danger">{formErrors.projectManagerInput}</span>
                                 )}
                              </Col>
                              {projectManager.length < 2 && !deletePc &&
                                 <Col lg={2}>
                                    <Form.Check type="checkbox" id="primary-contact" label="Is Primary" checked={primaryPc} onChange={(e) => setPrimaryPc(e.target.checked)} />
                                 </Col>
                              }
                              <Col lg={2}>
                                 <Form.Check type="checkbox" id="delete-contact" label="Delete" checked={deletePc} onChange={(e) => setDeletePc(e.target.checked)} />
                              </Col>
                              <Col lg={12}>
                                 <Form.Label className="mb-2">Select Project Agency<span className='validation-required-direct'></span></Form.Label>
                                 <Select styles={customStyles} className='custom-select' options={agencyOption} onChange={handleAgencySelect} closeMenuOnSelect={false} isMulti value={agency} />
                                 {formErrors.agencyInput && (
                                    <span className="text-danger">{formErrors.agencyInput}</span>
                                 )}
                              </Col>
                              <Col lg={12} className="text-end">
                                 <Button variant="soft-secondary" size="md" type="button" onClick={cstSetCloseBulkActionModal}>Cancel</Button>
                                 <Button disabled={saveProcess} variant="primary ms-3" size="md" type="submit">
                                    {
                                       !saveProcess && 'Confirm'
                                    }
                                    {
                                       saveProcess && <><Spinner size="sm" animation="border" className="me-1" />Confirm</>
                                    }
                                 </Button>
                              </Col>
                           </Row>
                        </Form>
                     </div>
                  </Modal.Body>
               </Modal>

            </div>
            <Footer />
         </div>
      </>
   );
}

const mapStateToProps = (state) => ({
   userData: state.Auth.user
})
export default connect(mapStateToProps)(Users)