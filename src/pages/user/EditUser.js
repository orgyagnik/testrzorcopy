import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Col, Row, Modal, Button, Form, Accordion, Spinner } from 'react-bootstrap';
import SingleDatePickerControl from '../../modules/custom/SingleDatePicker';
import moment from 'moment';
import { toast } from 'react-toastify';
import APIService from "../../api/APIService";
import { validateForm } from "../../utils/validator.js"
//import InputMask from "react-input-mask";
import { useHistory, useParams } from "react-router-dom";
import { decryptToken, capitalizeFirstWithRemoveUnderScore, check } from "../../utils/functions.js";
import DefaultProfile from "../../assets/img/placeholder-image.png";
import { EditUserValidator, ChangePasswordValidator } from "../../modules/validation/UserValidator";
import { connect } from "react-redux";
import { databaseRoleCode } from '../../settings';
import { PASSWORD_CONFIRM_PASSWORD_SAME_VALIDATION } from '../../modules/lang/User';
import Select from 'react-select';
import NoPermission from '../auth/NoPermission';
import { format } from 'date-fns';
import { CheckLg } from 'react-bootstrap-icons';

function EditUser({ userDataNew, name }) {
  const history = useHistory();
  const currentURL = window.location.pathname;
  //["project.create", "role.update", "role.delete", "task.update", "task.delete"]
  const [permissionData, setPermissionData] = useState([]);
  const [permissionList, setPermissionList] = useState([]);
  const [gender, setGender] = useState();
  const [agency, setAgency] = useState("");
  const [agencyNameInput, setAgencyNameInput] = useState("");
  const [agencyList, setAgencyList] = useState([]);
  let firstNameInput = useRef();
  let lastNameInput = useRef();
  let emailInput = useRef();
  let phoneInput = useRef();
  const ProfileInput = useRef(null);
  let emailSignatureInput = useRef();
  let googleDriveInput = useRef();
  let calendlyUrlInput = useRef();
  let agencyProfileInput = useRef();
  //let roleInput = useRef();
  const [roleInput, setRoleInput] = useState('');
  const [dobDate, setDobDate] = useState(null);
  const [process, setProcess] = useState(false);
  const [roleList, setRoleList] = useState([]);
  const [formErrors, setFormErrors] = useState([]);
  let passwordInput = useRef();
  let confirmPasswordInput = useRef();
  const [change_password_process, setChangePasswordProcess] = useState(false);
  const [userData, setUserData] = useState([]);
  const [userEditPermission, setUserEditPermission] = useState(1);
  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState(DefaultProfile);
  const [projectManager, setProjectManager] = useState([]);
  const [projectManagerOption, setProjectManagerOption] = useState([]);
  const [designation, setDesignation] = useState('');
  const [designationOption, setDesignationOption] = useState([]);
  const [twoFactorAuthentication, setTwoFactorAuthentication] = useState(false);
  const [timezoneOption, setTimezoneOption] = useState([]);
  const [timezone, setTimezone] = useState('');
  const [teamLeader, setTeamLeader] = useState([]);
  const [teamLeaderOption, setTeamLeaderOption] = useState([]);
  const [workLocationList, setWorkLocationList] = useState([]);
  const [workLocation, setWorkLocation] = useState('');
  let { id } = useParams();
  const [dateOfJoining, setDateOfJoining] = useState(null);

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
    setWorkLocationList([{ label: 'Select', value: '' }, { label: 'Yes', value: 1 }, { label: 'No', value: 0 }]);
  }, []);

  useEffect(() => {
    //debugger;
    if (check(['roles.view'], userDataNew?.role.getPermissions)) {
      APIService.getRoleList()
        .then((response) => {
          if (response.data?.status) {
            setRoleList(response.data?.data);
          }
        });
    }

    APIService.getDesignationList()
      .then((response) => {
        if (response.data?.status) {
          let newDesignationList = response.data?.data.map(item => {
            return { label: item.name, value: item.id }
          });
          setDesignationOption(newDesignationList);
        }
      });

    APIService.getStaffForEdit(id)
      .then((response) => {
        if (response.data?.status) {
          setUserData(response.data?.data);
          let userD = response.data?.data;
          setUserEditPermission(userD?.edit_user);
          firstNameInput.current.value = userD?.firstname ? userD?.firstname : '';
          lastNameInput.current.value = userD?.lastname ? userD?.lastname : '';
          emailInput.current.value = userD?.email ? userD?.email : '';
          if (phoneInput.current)
            phoneInput.current.value = userD?.phonenumber ? userD?.phonenumber : '';
          if (googleDriveInput.current)
            googleDriveInput.current.value = userD?.google_drive ? userD?.google_drive : '';
          if (calendlyUrlInput.current)
            calendlyUrlInput.current.value = userD?.calendly_url ? userD?.calendly_url : '';
          setAgencyNameInput(userD?.agency_detail?.agency_name ? userD?.agency_detail?.agency_name : '');
          if (agencyProfileInput.current)
            agencyProfileInput.current.value = userD?.agency_profile_preferences ? userD?.agency_profile_preferences : '';
          setRoleInput(userD?.role.id ? userD?.role.id : '');
          setDesignation(userD?.designation ? userD?.designation : '');
          if (emailSignatureInput.current)
            emailSignatureInput.current.value = userD?.email_signature ? userD?.email_signature : '';
          setDobDate(userD?.dob ? moment(userD?.dob).toDate() : null);
          setGender(userD?.gender ? userD?.gender : null);
          setTimezone(userD?.timezone);
          setWorkLocation(userD?.is_wfh);
          setDateOfJoining(userD?.date_of_joining ? moment(userD?.date_of_joining).toDate() : null);

          userD?.profile_image && setProfileImagePreviewUrl(`${userD?.profile_image}`)
          let custom_permission = Array.isArray(userD?.custom_permission) ? userD?.custom_permission : [];
          let default_permission = Array.isArray(userD?.default_permission) ? userD?.default_permission : [];
          if (default_permission !== '' && custom_permission !== '') {
            setPermissionData(default_permission.concat(custom_permission));
          }
          else if (default_permission !== '') {
            setPermissionData(default_permission);
          }
          else {
            setPermissionData(custom_permission);
          }
          //let result = userD?.pc_members.map(a => a.id);
          let result = Array.isArray(userD?.pc_members) ? userD?.pc_members.map(item => {
            return { label: item.name, value: item.id }
          }) : [];
          setProjectManager(result);
          let teamResult = Array.isArray(userD?.team_members) ? userD?.team_members.map(item => {
            return { label: item.name, value: item.id }
          }) : [];
          setTeamLeader(teamResult);
          setTwoFactorAuthentication(userD?.twoFactorAuthentication);
          if (userD?.agency_detail?.id && userD?.agency_detail?.id !== 0 && userD?.agency_detail?.id != null)
            setAgency(userD?.agency_detail?.id);
        }
        else {
          if (currentURL.includes("/edit-agency-user/"))
            history.push("/agency-users");
          else
            history.push("/users");
        }
      });

    // APIService.getPermissionList()
    //   .then((response) => {
    //     if (response.data?.status) {
    //       setPermissionList(response.data?.data);
    //     }
    //   });

    APIService.getAllMembers() 
      .then((response) => {
        if (response.data?.status) {
          let newStaffList = response.data?.data.map(item => {
            return { label: item.name, value: item.staffid }
          });
          let newStaffList1 = newStaffList.filter((item) => { return `${id}` !== `${item.value}` });
          setProjectManagerOption(newStaffList1);
        }
      });

    if (!currentURL.includes("/edit-agency-user/")) {
      APIService.getAllMembers(`?role_code=office_staff`)
        .then((response) => {
          if (response.data?.status) {
            let newStaffList = response.data?.data.map(item => {
              return { label: item.name, value: item.id }
            });
            let newStaffList1 = newStaffList.filter((item) => { return `${id}` !== `${item.value}` });
            setTeamLeaderOption(newStaffList1);
          }
        });
    }

    if (userData.role_code !== databaseRoleCode.agencyCode) {
      APIService.getAllAgency()
        .then((response) => {
          if (response.data?.status) {
            let data = response.data?.data;
            let temData = data?.map(item => {
              return { label: item.agency_name, value: item.agency_id }
            });
            setAgencyList(temData);
          }
        });
    }

    APIService.getTimezoneList()
      .then((response) => {
        if (response.data?.status) {
          setTimezoneOption(response.data?.data);
        }
      });
  }, []);

  const changePassword = async () => {
    setChangePasswordProcess(true);
    setFormErrors([]);

    let validate = validateForm((ChangePasswordValidator('not required', passwordInput.current?.value, confirmPasswordInput.current?.value)));
    if (Object.keys(validate).length) {
      setFormErrors(validate);
      setChangePasswordProcess(false);
    }
    else {
      let params = {};
      params["password"] = passwordInput.current?.value;

      if (passwordInput.current?.value === confirmPasswordInput.current?.value) {
        APIService.staffChangePassword(id, params)
          .then((response) => {
            if (response.data?.status) {
              setShowChangePasswordModal(false);
              toast.success(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
              setChangePasswordProcess(false);
            }
            else {
              toast.error(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
              setChangePasswordProcess(false);
            }
          })
          .catch((error) => {
            toast.error(error, {
              position: toast.POSITION.TOP_RIGHT
            });
            setChangePasswordProcess(false);
          });
      }
      else {
        toast.error(PASSWORD_CONFIRM_PASSWORD_SAME_VALIDATION, {
          position: toast.POSITION.TOP_RIGHT
        });
        setChangePasswordProcess(false);
      }
    }
  }

  const editUser = async () => {
    setProcess(true);
    setFormErrors([]);

    let validate = [];
    if (currentURL.includes("/edit-agency-user/")) {
      validate = validateForm((EditUserValidator(firstNameInput.current?.value, lastNameInput.current?.value, emailInput.current?.value, '1234567890', roleInput, currentURL === "/add-agency-user" ? 'not required' : 'designation', '10/01/2023', 'not required', `${roleInput}` === 'bdb82baa-6ac2-469b-b20c-e6a47454a9dd' ? agency : 'not required', userData.role_code === databaseRoleCode.adminCode && userData.role_code === databaseRoleCode.agencyCode ? agencyNameInput : 'not required', timezone, 'not required', 'not required')));
    }
    else {
      validate = validateForm((EditUserValidator(firstNameInput.current?.value, lastNameInput.current?.value, emailInput.current?.value, '1234567890', roleInput, parseInt(designation) > 0 ? designation : '', '10/01/2023', 'not required', `${roleInput}` === 'bdb82baa-6ac2-469b-b20c-e6a47454a9dd' ? agency : 'not required', userData.role_code === databaseRoleCode.adminCode && userData.role_code === databaseRoleCode.agencyCode ? agencyNameInput : 'not required', 'not required', workLocation, dateOfJoining)));
    }
    if (Object.keys(validate).length) {
      setFormErrors(validate);
      setProcess(false);
    }
    else {
      let params = {
        firstname: firstNameInput.current?.value.trim(),
        lastname: lastNameInput.current?.value.trim(),      
        dob: dobDate ? format(dobDate, "yyyy-MM-dd") : null, // Use null or exclude if not applicable
        gender: gender,
        admin: false, // Ensure boolean value        
        google_drive: googleDriveInput.current?.value ? googleDriveInput.current?.value : null, // Use null or exclude if not applicable
        is_wfh: Boolean(workLocation), // Convert to boolean
        date_of_joining: dateOfJoining ? format(dateOfJoining, "yyyy-MM-dd") : null, // Use null or exclude if not applicable
        timezone: timezone && timezone.includes(' (') ? timezone.split(' (')[0] : timezone,
      };

      params.roleId = roleInput;

      if (emailSignatureInput.current && emailSignatureInput.current.value) {
        params["email_signature"] = emailSignatureInput.current.value;
      }

      if (projectManager && projectManager.length > 0) {
        params["managed_by"] = projectManager.map(pm => pm.value); 
      }

      if (agencyProfileInput.current && agencyProfileInput.current.value) {
        params["agency_profile_preferences"] = agencyProfileInput.current.value;
      }

      if (phoneInput.current && phoneInput.current.value) {
        params.phonenumber = phoneInput.current.value;
      }

      // if (timezone && timezone.includes(' (')) {
      //   params["time_zone"] = timezone.split(' (')[0];
      // }
      // else {
      //   params["time_zone"] = timezone;
      // }

        APIService.editUser(userData.id, params)
        .then((response) => {
          if (response.data?.status) {
            toast.success(response.data?.message, {
              position: toast.POSITION.TOP_RIGHT
            });
            setProcess(false);
            setTimeout(() => {
              if (currentURL.includes("/edit-agency-user/"))
                history.push("/agency-users");
              else
                history.push("/users");
            }, 2000);
          } else {
            toast.error(response.data?.message, {
              position: toast.POSITION.TOP_RIGHT
            });
            setProcess(false);
          }
        })
        .catch((error) => {
          toast.error(error.toString(), {
            position: toast.POSITION.TOP_RIGHT
          });
          setProcess(false);
        });
    }
  }

  const photoUpload = async (e) => {
    e.preventDefault();
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.onloadend = () => {
      const formData = new FormData();
      formData.append(
        "profile_image",
        file,
        file.name
      );
      formData.append("staffid", userData?.id);
      APIService.profilePhotosUpdate(formData, 'staff')
        .then((response) => {
          if (response.data?.status) {
            setProfileImagePreviewUrl(reader.result);
            toast.success(response.data?.message, {
              position: toast.POSITION.TOP_RIGHT
            });
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
    }
    reader.readAsDataURL(file);
  }

  const OpenFileChoose = async (e) => {
    ProfileInput.current.click();
  }

  const DeleteProfilePic = async (e) => {
    let user_role_enc = localStorage.getItem("rz_user_role");
    if (user_role_enc !== null) {
      let user_role = decryptToken(user_role_enc);
      let params = {};
      params['staffid'] = userData?.id;
      APIService.profilePhotosDelete(params, user_role)
        .then((response) => {
          if (response.data?.status) {
            setProfileImagePreviewUrl(DefaultProfile);
            toast.success(response.data?.message, {
              position: toast.POSITION.TOP_RIGHT
            });
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
    }
    else {
      history.push('/');
    }
  }

  const [showchangepasswordModal, setShowChangePasswordModal] = useState(false);
  const cpSetCloseChangePasswordModal = () => setShowChangePasswordModal(false);
  const cpShowChangePasswordModal = () => setShowChangePasswordModal(true);

  const handleChangePermission = (e) => {
    let value = e.target.value;
    if (value !== "") {
      let main_array = value.split(".")
      let params = {};
      let checked = e.target.checked;
      params['staffid'] = userData?.id;
      params['feature'] = main_array[0];
      params['capability'] = main_array[1];
      params['delete'] = !checked
      APIService.staffAddPermission(params)
        .then((response) => {
          if (response.data?.status) {
            if (checked) {
              setPermissionData([...permissionData, value]);
            } else {
              setPermissionData(
                permissionData.filter((data) => data !== value),
              );
            }
            toast.success(response.data?.message, {
              position: toast.POSITION.TOP_RIGHT
            });
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
    }
  };

  const handleProjectManagerSelect = (selectedPC) => {
    //let result = selectedPC.map(a => a.value);
    setProjectManager(selectedPC);
  };

  const handleTeamLeaderSelect = (selectedPC) => {
    setTeamLeader(selectedPC);
  };

  const handleDesignationSelect = (selectedDesignation) => {
    setDesignation(selectedDesignation?.value);
  };

  const handleTwoFactorAuthenticationChange = async (e) => {
    const checked = e.target.checked;
    const params = {
      two_factor_auth_enabled: checked, // Set based on the toggle state
    };

    try {
      const response = await APIService.twoFactorAuthentication(id, params);
      if (response.data?.status) {
        setTwoFactorAuthentication(checked);
        toast.success(response.data?.message, {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        toast.error(response.data?.message, {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred', {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const handleAgencySelect = selectedOption => {
    setAgency(selectedOption.value);
  };

  const handleTimezoneSelect = e => {
    setTimezone(e.label);
  };

  const handleWorkLocationSelect = (e) => {
    setWorkLocation(e.value);
  };
  
  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Header pagename={name ? name : ''} />
        {userEditPermission === 1 || userData.role_code !== databaseRoleCode.agencyCode ?
          <>
            <div className="inner-content d-flex">
              <div className="people-detail d-xl-flex w-100">
                <div className="peaople-left-side rounded-10">
                  <div className="people-sidebar h-100 d-flex flex-column">
                    <div className="people-detail p-6">
                      <div className="profile-uploader mb-5">
                        <div className="upload-btn-wrap">
                          <button type="button" className="btn-icon circle-btn btn btn-dark-100 font-12 btn-sm" onClick={OpenFileChoose}>
                            <i className="icon-edit"></i>
                          </button>
                          <button type="button" className="btn-icon circle-btn btn btn-dark-100 font-12 btn-sm ms-2" onClick={DeleteProfilePic}>
                            <i className="icon-delete"></i>
                          </button>
                        </div>
                        <div className="profile-image-upload-block">
                          <img src={profileImagePreviewUrl} alt="Profile" className="profile-image placeholder-profile" />
                          <input id="photo-upload" type="file" className='d-none' alt='Profile Image' accept="image/png, image/gif, image/jpeg" ref={ProfileInput} onChange={photoUpload} />
                        </div>
                      </div>
                      <h3 className="mb-0">{userData?.firstname} {userData?.lastname}</h3>
                      <a href={`mailto:${userData?.email}`} className="dark-2 font-12">{userData?.email}</a>
                    </div>
                    {userData?.designation_name || userData?.country || userData?.state || userData?.city ?
                      <div className="people-about p-6 border-top border-gray-100">
                        <p className="text-uppercase font-weight-medium dark-1 mb-4">About</p>
                        {userData?.designation_name &&
                          <div className="people-about-list d-flex align-items-center">
                            <span className="icon-frame-59 list-icon font-20 dark-5"></span>
                            <span className="font-12">{userData?.designation_name ? capitalizeFirstWithRemoveUnderScore(userData?.designation_name) : ''}</span>
                          </div>
                        }
                        {userData?.country && userData?.city &&
                          <div className="people-about-list  d-flex align-items-center">
                            <span className="icon-location list-icon font-20 dark-5"></span>
                            <span className="font-12">{userData.city ? `${userData.city},` : ''} {userData.state ? `${userData.state},` : ''} {userData.country ? `${userData.country}.` : ''}</span>
                          </div>
                        }
                      </div> : ''
                    }
                    <div className="people-about p-6 border-top border-gray-100">
                      <p className="text-uppercase font-weight-medium dark-1 mb-4">Security</p>
                      <div className="people-about-list d-flex align-items-center cursor-pointer" onClick={cpShowChangePasswordModal}>
                        <span className="icon-lock list-icon font-16 dark-5"></span>
                        <span className="font-12">Change Password</span>
                      </div>
                      <div className="people-about-list d-flex align-items-center">
                        <span className="icon-factor list-icon font-16 dark-5"></span>
                        <span className="font-12"> Two Factor <br className='d-xl-block d-none' />Authentication </span>
                        <div className="form-check form-switch p-0 mb-0 ms-xl-auto ms-sm-10 ms-auto">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="flexSwitchCheckDefault"
                            checked={twoFactorAuthentication}
                            onChange={handleTwoFactorAuthenticationChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="people-right-side ms-xl-7">
                  <Accordion defaultActiveKey={['0', '1', '2', '3']} alwaysOpen className="dashboard-accordion">
                    <Accordion.Item eventKey="0" className="bg-white rounded-10">
                      <Accordion.Header as="h4" className="pt-6 px-6">Basic Information</Accordion.Header >
                      <Accordion.Body className="pb-9 px-6">
                        <Form onSubmit={async e => { e.preventDefault(); await editUser() }}>
                          <Row className="g-9">
                            <Col sm={12} md={6} xxl={4} className="validation-required">
                              <Form.Label className="mb-2">First Name</Form.Label>
                              <Form.Control type="text" placeholder="Enter First Name" ref={firstNameInput} className={`${formErrors.firstNameInput && 'is-invalid'}`} />
                              {formErrors.firstNameInput && (
                                <span className="text-danger">{formErrors.firstNameInput}</span>
                              )}
                            </Col>
                            <Col sm={12} md={6} xxl={4} className="validation-required">
                              <Form.Label className="mb-2">Last Name</Form.Label>
                              <Form.Control type="text" placeholder="Enter Last Name" ref={lastNameInput} className={`${formErrors.lastNameInput && 'is-invalid'}`} />
                              {formErrors.lastNameInput && (
                                <span className="text-danger">{formErrors.lastNameInput}</span>
                              )}
                            </Col>
                            <Col sm={12} md={6} xxl={4} className="validation-required">
                              <Form.Label className="mb-2">Email</Form.Label>
                              <Form.Control type="text" placeholder="Enter Email" ref={emailInput} disabled={userData.role_code !== databaseRoleCode.adminCode} className={`${formErrors.emailInput && 'is-invalid'}`} />
                              {formErrors.emailInput && (
                                <span className="text-danger">{formErrors.emailInput}</span>
                              )}
                            </Col>
                            {userData.role_code !== databaseRoleCode.agencyCode &&
                              <>
                                <Col sm={12} md={6} xxl={4}>
                                  <Form.Label className="mb-2">Phone</Form.Label>
                                  <Form.Control type="number" placeholder="Enter Phone Number" ref={phoneInput} className={`form-control ${formErrors.phoneInput && 'is-invalid'}`} />
                                  {/* <InputMask mask="999-999-9999" type="text" placeholder="Enter Phone Number" ref={phoneInput} className={`form-control ${formErrors.phoneInput && 'is-invalid'}`} /> */}
                                  {formErrors.phoneInput && (
                                    <span className="text-danger">{formErrors.phoneInput}</span>
                                  )}
                                </Col>
                                {!currentURL.includes("/edit-agency-user/") &&
                                  <Col sm={12} md={6} xxl={4} className="validation-required">
                                    <Form.Label className="mb-2">Designation</Form.Label>
                                    <Select styles={customStyles} classNamePrefix="react-select" className={`custom-select ${formErrors.designationInput && 'is-react-select-invalid'}`} options={designationOption} onChange={handleDesignationSelect}
                                      value={designationOption.filter(function (option) {
                                        return option.value === parseInt(designation);
                                      })} />
                                    {formErrors.designationInput && (
                                      <span className="text-danger">{formErrors.designationInput}</span>
                                    )}
                                  </Col>
                                }
                                {userDataNew.role?.code !== databaseRoleCode.agencyCode &&
                                  <>
                                    <Col sm={12} md={6} xxl={4} className="validation-required">
                                      <Form.Label className="mb-2">Role</Form.Label>
                                      <Form.Select className={`form-control ${formErrors.roleInput && 'is-invalid'}`} onChange={e => setRoleInput(e.target.value)} value={roleInput}>
                                        <option value="0">--Select--</option>
                                        {roleList.map((role, index) => (
                                          role.code !== databaseRoleCode.clientCode &&
                                          <option key={index} value={role.id} disabled={role?.code === databaseRoleCode.agencyCode}>{role.name}</option>
                                        ))}
                                      </Form.Select>
                                      {formErrors.roleInput && (
                                        <span className="text-danger">{formErrors.roleInput}</span>
                                      )}
                                    </Col>
                                    {userData?.role?.code === databaseRoleCode.agencyMemberCode  &&
                                      <Col sm={12} md={6} xxl={4} className="validation-required">
                                        <Form.Label className="mb-2">Agency</Form.Label>
                                        <Select styles={customStyles} classNamePrefix="react-select" className={`custom-select ${formErrors.agencyInput && 'is-react-select-invalid'}`} options={agencyList} onChange={handleAgencySelect}
                                          value={agencyList.filter(function (option) {
                                            return option.value === agency;
                                          })} />
                                        {formErrors.agencyInput && (
                                          <span className="text-danger">{formErrors.agencyInput}</span>
                                        )}
                                      </Col>
                                    }
                                  </>
                                }
                                {!currentURL.includes("/edit-agency-user/") &&
                                  <>
                                    <Col sm={12} md={6} xxl={4}>
                                      <Form.Label className="mb-2">Date of Birth</Form.Label>
                                      <div className="datepicker-default">
                                        <SingleDatePickerControl
                                          selected={dobDate}
                                          onChange={(date) => setDobDate(date)}
                                          onDateChange={(date) => setDobDate(date)}
                                          className={`form-control ${formErrors.dobDate && 'is-invalid'}`}
                                          isClearable
                                        />
                                        {formErrors.dobDate && (
                                          <span className="text-danger">{formErrors.dobDate}</span>
                                        )}
                                      </div>
                                    </Col>

                                    <Col sm={12} md={6} xxl={4} className="validation-required">
                                      <Form.Label className="mb-2">Date of Joining</Form.Label>
                                      <div className="datepicker-default">
                                        <SingleDatePickerControl
                                          selected={dateOfJoining}
                                          onChange={(date) => setDateOfJoining(date)}
                                          onDateChange={(date) => setDateOfJoining(date)}
                                          className={`form-control ${formErrors.dateOfJoiningInput && 'is-invalid'}`}
                                          isClearable
                                        />
                                        {formErrors.dateOfJoiningInput && (
                                          <span className="text-danger">{formErrors.dateOfJoiningInput}</span>
                                        )}
                                      </div>
                                    </Col>
                                  </>
                                }
                                <Col sm={12} md={6} xxl={4}>
                                  <Form.Label className="mb-2">Gender</Form.Label>
                                  <div className="form-check profile-gender d-flex align-items-center ps-0 ms-0 mt-3">
                                    <Form.Check inline label="Male" value="male" name="gender" type="radio" id="gender-male" className="mb-0" checked={gender === "male" ? true : false} onChange={(e) => { setGender('male') }} />
                                    <Form.Check inline label="Female" value="female" name="gender" type="radio" id="gender-female" className="ms-8 mb-0" checked={gender === "female" ? true : false} onChange={(e) => { setGender('female') }} />
                                  </div>
                                  {formErrors.gender && (
                                    <span className="text-danger">{formErrors.gender}</span>
                                  )}
                                </Col>
                                <Col sm={12} md={6} xxl={4}>
                                  <Form.Label className="mb-2">Google Drive</Form.Label>
                                  <Form.Control type="text" ref={googleDriveInput} className={`${formErrors.googleDriveInput && 'is-invalid'}`} />
                                  {formErrors.googleDriveInput && (
                                    <span className="text-danger">{formErrors.googleDriveInput}</span>
                                  )}
                                </Col>
                                {!currentURL.includes("/edit-agency-user/") &&
                                  <Col sm={12} md={6} xxl={4}>
                                    <Form.Label className="mb-2">Calendly URL</Form.Label>
                                    <Form.Control type="text" ref={calendlyUrlInput} className={`${formErrors.calendlyUrlInput && 'is-invalid'}`} />
                                    {formErrors.calendlyUrlInput && (
                                      <span className="text-danger">{formErrors.calendlyUrlInput}</span>
                                    )}
                                  </Col>
                                }
                                <Col sm={12} md={6} xxl={4}>
                                  <Form.Label className="mb-2">Agency Profile And Preference</Form.Label>
                                  <Form.Control type="text" ref={agencyProfileInput} className={`${formErrors.agencyProfileInput && 'is-invalid'}`} />
                                  {formErrors.agencyProfileInput && (
                                    <span className="text-danger">{formErrors.agencyProfileInput}</span>
                                  )}
                                </Col>
                              </>
                            }
                            {userData.role?.code === databaseRoleCode.agencyCode || userData.role?.code === databaseRoleCode.clientCode ?
                              <Col sm={12} md={6} xxl={4}>
                                <Form.Label className="mb-2">Project Manager</Form.Label>
                                <Select styles={customStyles} className='custom-select' options={projectManagerOption} onChange={handleProjectManagerSelect} closeMenuOnSelect={false} isMulti value={projectManager} />
                              </Col> : ''
                            }
                            {userDataNew.role?.code === databaseRoleCode.adminCode && userData.role?.code === databaseRoleCode.agencyCode &&
                              <Col sm={12} md={6} xxl={4} className='validation-required'>
                                <Form.Label className="mb-2">Agency Name</Form.Label>
                                <Form.Control type="text" value={agencyNameInput} onChange={(e) => { setAgencyNameInput(e.target.value) }} className={`${formErrors.agencyNameInput && 'is-invalid'}`} />
                                {formErrors.agencyNameInput && (
                                  <span className="text-danger">{formErrors.agencyNameInput}</span>
                                )}
                              </Col>
                            }
                            {userData.role?.code === databaseRoleCode.agencyCode || userData.role?.code === databaseRoleCode.agencyMemberCode ?
                              <Col sm={12} md={6} xxl={4} className="validation-required">
                                <Form.Label className="mb-2">Timezone</Form.Label>
                                <Select styles={customStyles} classNamePrefix="react-select" menuPortalTarget={document.body} className={`custom-select ${formErrors.timezoneInput && 'is-react-select-invalid'}`} options={timezoneOption} onChange={handleTimezoneSelect} placeholder={<div>Select Timezone</div>}
                                  value={timezoneOption.filter(function (option) {
                                    return option.label.includes(timezone) && timezone;
                                  })} />
                                {formErrors.timezoneInput && (
                                  <span className="text-danger">{formErrors.timezoneInput}</span>
                                )}
                              </Col>
                              : ''}
                            {!currentURL.includes("/edit-agency-user/") && userData.role_code === databaseRoleCode.adminCode &&
                              <Col sm={12} md={6} xxl={4}>
                                <Form.Label className="mb-2">Team Member</Form.Label>
                                <Select styles={customStyles} className='custom-select' options={teamLeaderOption} onChange={handleTeamLeaderSelect} closeMenuOnSelect={false} isMulti value={teamLeader} />
                                {formErrors.teamLeaderInput && (
                                  <span className="text-danger">{formErrors.teamLeaderInput}</span>
                                )}
                              </Col>
                            }

                            {!currentURL.includes("/edit-agency-user/") && userData.role_code === databaseRoleCode.adminCode &&
                              <Col sm={12} md={6} xxl={4} className="validation-required">
                                <Form.Label className="mb-2">Work From Home</Form.Label>
                                <Select styles={customStyles} className="control-md custom-select" options={workLocationList}  onChange={handleWorkLocationSelect}
                                value={workLocationList.filter(function (option) {
                                  return option.value === workLocation;
                                })} /> 
                                {formErrors.workFormHomeInput && (
                                  <span className="text-danger">{formErrors.workFormHomeInput}</span>
                                )}                                
                              </Col>
                            }

                            <Col sm={12} md={12} xxl={4}>
                              <Form.Label className="mb-2">Email Signature</Form.Label>
                              <Form.Control as="textarea" type="text" placeholder="Enter Email Signature" ref={emailSignatureInput} />
                            </Col>
                            <Col className="text-end" sm={12} md={12} lg={12}>
                              <Button disabled={process} className="me-2" variant="soft-secondary" size="md" type="button" onClick={() => { if (currentURL.includes("/edit-agency-user/")) history.push("/agency-users"); else history.push("/users"); }}>Cancel</Button>
                              <Button disabled={process} variant="primary" size="md" type="submit">
                                {
                                  !process && 'Save'
                                }
                                {
                                  process && <><Spinner size="sm" animation="border" className="me-1" />Save</>
                                }
                              </Button>
                            </Col>
                          </Row>
                        </Form>
                      </Accordion.Body>
                    </Accordion.Item>
                    {userDataNew.role_code === databaseRoleCode.adminCode &&
                      <Accordion.Item eventKey="1" className="bg-white rounded-10">
                        <Accordion.Header as="h4" className="pt-6 px-6">Permission</Accordion.Header >
                        <Accordion.Body className="pb-9 px-6">
                          <Form>
                            {permissionList.map((permission, index) => (
                              <div className={`${index !== 0 ? 'mt-5' : ''}`} key={index}>
                                <h4>{capitalizeFirstWithRemoveUnderScore(permission.feature)}</h4>
                                <hr />
                                <Row className="g-4">
                                  {(permission.capability).split(",").map((sub_per, new_index) => (
                                    <Col sm={12} md={6} lg={4} xl={3} key={new_index}>
                                      <Form.Check type="checkbox" id={`permission-${index}-${new_index}`} label={capitalizeFirstWithRemoveUnderScore(sub_per)} value={`${permission.feature}.${sub_per}`} onChange={handleChangePermission} disabled={userData?.default_permission && userData?.default_permission?.some((data) => data === `${permission.feature}.${sub_per}`)} checked={permissionData && permissionData.some((data) => data === `${permission.feature}.${sub_per}`)} />
                                    </Col>
                                  ))}
                                </Row>
                              </div>
                            ))}
                          </Form>
                        </Accordion.Body>
                      </Accordion.Item>
                    }
                    {/* <Accordion.Item eventKey="2">
                  <Accordion.Header as="h4">Worked on</Accordion.Header>
                  <Accordion.Body>
                    <Table hover className="bg-white list-table three-list-data">
                      <tbody>
                        <tr>
                          <td><img src={checkIcon} className="check-icon" /> Design Stage</td>
                          <td><span className="avatar avatar-sm-status bottom-0 end-0 avatar-primary avatar-border me-1">&nbsp;</span>Web Design</td>
                          <td>Thursday</td>
                        </tr>
                        <tr>
                          <td><img src={checkIcon} className="check-icon" />Confirm additional service</td>
                          <td><span className="avatar avatar-sm-status bottom-0 end-0 avatar-danger avatar-border me-1">&nbsp;</span>App Development</td>
                          <td className="text-danger">Tomorrow</td>
                        </tr>
                        <tr>
                          <td><img src={checkIcon} className="check-icon" />Customer Experiance inshight</td>
                          <td><span className="avatar avatar-sm-status bottom-0 end-0 avatar-primary avatar-border me-1">&nbsp;</span>Web Design</td>
                          <td>Thursday</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="3">
                  <Accordion.Header as="h4">Project</Accordion.Header>
                  <Accordion.Body>
                    <a href="#" className="project-list d-flex px-3 py-4">
                      <span className="color-icon color-icon-md pink-color-icon"><span className="font-weight-semibold font-12 charchter-icon">A</span></span>
                      <p className="dark-1 font-weight-medium mb-0 ms-3">App Devlopment</p>
                    </a>
                    <a href="#" className="project-list d-flex px-3 py-4">
                      <span className="color-icon color-icon-md orange-color-icon"><span className="font-weight-semibold font-12 charchter-icon">R</span></span>
                      <p className="dark-1 font-weight-medium mb-0 ms-3">Ridgewalk & Run</p>
                    </a>
                    <a href="#" className="project-list d-flex px-3 py-4">
                      <span className="color-icon color-icon-md blue-color-icon"><span className="font-weight-semibold font-12 charchter-icon">S</span></span>
                      <p className="dark-1 font-weight-medium mb-0 ms-3">Sergenormant</p>
                    </a>
                  </Accordion.Body>
                </Accordion.Item> */}
                  </Accordion>
                </div>
              </div>
            </div>
            <Modal size="sm" show={showchangepasswordModal} onHide={cpSetCloseChangePasswordModal} centered>
              <Modal.Header closeButton className="py-5 px-10">
                <Modal.Title className="font-20 dark-1 mb-0">Change password</Modal.Title>
              </Modal.Header>
              <Modal.Body className="py-9 mx-10">
                <Form onSubmit={async e => { e.preventDefault(); await changePassword() }}>
                  <Form.Group className="mb-5 validation-required">
                    <Form.Label className="dark-5">New password</Form.Label>
                    <Form.Control type="password" ref={passwordInput} className={`${formErrors.passwordInput && 'is-invalid'}`} />
                    {formErrors.passwordInput && (
                      <span className="text-danger">{formErrors.passwordInput}</span>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-5 validation-required">
                    <Form.Label className="dark-5">Confirm new password</Form.Label>
                    <Form.Control type="password" ref={confirmPasswordInput} className={`${formErrors.confirmPasswordInput && 'is-invalid'}`} />
                    {formErrors.confirmPasswordInput && (
                      <span className="text-danger">{formErrors.confirmPasswordInput}</span>
                    )}
                  </Form.Group>
                  <div className="d-grid pt-md-2">
                    <Button disabled={change_password_process} variant="primary" type="submit">
                      {
                        !change_password_process && 'Update password'
                      }
                      {
                        change_password_process && <Spinner size="sm" animation="grow" />
                      }
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal>
          </>
          :
          <NoPermission />
        }
        <Footer />
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
  userDataNew: state.Auth.user
})

export default connect(mapStateToProps)(EditUser)