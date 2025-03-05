import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Col, Row, Modal, Button, Form, Accordion, Spinner } from 'react-bootstrap';
import SingleDatePickerControl from '../../modules/custom/SingleDatePicker';
import { saveUserObject } from "../../store/reducers/Auth";
import Store from "../../store";
import { connect } from "react-redux";
import { toast } from 'react-toastify';
import { decryptToken, capitalizeFirstWithRemoveUnderScore } from "../../utils/functions.js"
import { validateForm } from "../../utils/validator.js"
import APIService from "../../api/APIService";
import { useHistory } from "react-router-dom";
import moment from 'moment';
import Select from 'react-select';
//import InputMask from "react-input-mask";
import DefaultProfile from "../../assets/img/placeholder-image.png";
import { ProfileValidator, ChangePasswordValidator } from "../../modules/validation/ProfileValidator";
import { databaseRoleCode } from '../../settings';
import { PASSWORD_CONFIRM_PASSWORD_SAME_VALIDATION } from '../../modules/lang/User';
import { format } from 'date-fns';
import { Country, State, City }  from 'country-state-city';

function Profile({ userData, name }) {
  const history = useHistory();
  const [gender, setGender] = useState(userData?.gender);
  const [country, setCountry] = useState(userData?.country_id);
  const [state, setState] = useState(userData?.state_id);
  const [dobDate, setDobDate] = useState();
  const [formErrors, setFormErrors] = useState([]);
  const [twoFactorAuthentication, setTwoFactorAuthentication] = useState(false);

  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState(DefaultProfile);
  const ProfileInput = useRef(null);
  let firstNameInput = useRef();
  let lastNameInput = useRef();
  let emailInput = useRef();
  let phoneInput = useRef();
  let roleInput = useRef();
  let cityInput = useRef();
  let oldPasswordInput = useRef();
  let passwordInput = useRef();
  let confirmPasswordInput = useRef();
  const [process, setProcess] = useState(false);
  const [change_password_process, setChangePasswordProcess] = useState(false);
  const [countryOption, setCountryOption] = useState([]);
  const [stateOption, setStateOption] = useState([]);
  const [timezoneOption, setTimezoneOption] = useState([]);
  const [timezone, setTimezone] = useState('');
  
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [city, setCity] = useState('');

  let calendlyUrlInput = useRef();

  const [sendEmailNotification, setSendEmailNotification] = useState(false);
  const [sendNotification, setSendNotification] = useState(false);

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
    const countries = Country.getAllCountries().map(country => ({
        value: country.isoCode,
        label: country.name
    }));
    setCountryOptions(countries);

    // Set initial country, state, and city from API data
    if (userData?.country) {
        setCountry(userData.country);
        const states = State.getStatesOfCountry(userData.country).map(state => ({
            value: state.isoCode,
            label: state.name
        }));
        setStateOptions(states);
    }

    if (userData?.state) {
        setState(userData.state);
        const cities = City.getCitiesOfState(userData.country, userData.state).map(city => ({
            value: city.name,
            label: city.name
        }));
        setCityOptions(cities);
    }

    if (userData?.city) {
        setCity(userData.city);
    }
}, [userData]);

  useEffect(() => {
    const countries = Country.getAllCountries().map(country => ({
      value: country.isoCode,
      label: country.name
    }));
    setCountryOptions(countries);
  }, []);

  // Event handler for selecting a country
  const handleCountrySelect = e => {
    setCountry(e.value);
    const states = State.getStatesOfCountry(e.value).map(state => ({
      value: state.isoCode,
      label: state.name
    }));
    setStateOptions(states);
    // Reset state and city selections
    setState(e.value);
    setCityOptions([]);
  };

  // Event handler for selecting a state
  const handleStateSelect = e => {
    setState(e.value);
    const cities = City.getCitiesOfState(country, e.value).map(city => ({
      value: city.name,
      label: city.name
    }));
    setCityOptions(cities);
  };
  

  useEffect(() => {
    APIService.getTimezoneList()
      .then((response) => {
        if (response.data?.status) {
          setTimezoneOption(response.data?.data);
        }
      });

  }, []);

  useEffect(() => {
    firstNameInput.current.value = userData?.firstname ? userData?.firstname : '';
    lastNameInput.current.value = userData?.lastname ? userData?.lastname : '';
    emailInput.current.value = userData?.email ? userData?.email : '';
    phoneInput.current.value = userData?.phonenumber ? userData?.phonenumber : '';
    roleInput.current.value = userData?.role?.name ? userData?.role?.name : ''; 
    if (calendlyUrlInput.current)
            calendlyUrlInput.current.value = userData?.calendly_url ? userData?.calendly_url : '';
    setDobDate(userData?.dob ? moment(userData?.dob).toDate() : null);
    userData?.profile_image && setProfileImagePreviewUrl(`${userData?.profile_image}`)
    setTwoFactorAuthentication(userData?.twoFactorAuthentication);
    setTimezone(userData?.time_zone ? userData?.time_zone : '');
    setSendEmailNotification(userData?.is_email_send === 1 ? true : false );
    setSendNotification(userData?.is_notification_send === 1 ? true : false);
  }, []);

  // const handleCountrySelect = e => {
  //   setCountry(e.value);
  // };
  // const handleStateSelect = e => {
  //   setState(e.value);
  // };
  const handleTimezoneSelect = e => {
    setTimezone(e.label);
  };


  const [showchangepasswordModal, setShowChangePasswordModal] = useState(false);
  const cpSetCloseChangePasswordModal = () => setShowChangePasswordModal(false);
  const cpShowChangePasswordModal = () => setShowChangePasswordModal(true);

  const updateProfile = async () => {
    let user_role_enc = localStorage.getItem("rz_user_role");
    if (user_role_enc !== null) {
      setProcess(true);
      setFormErrors([]);

      let timezoneValidation = 'not required';
      if ((timezone === '') && (userData.role.code === databaseRoleCode.agencyCode || userData.role.code === databaseRoleCode.agencyMemberCode)) {
        timezoneValidation = ''
      }
      let validate = validateForm((ProfileValidator(firstNameInput.current?.value, lastNameInput.current?.value, phoneInput.current?.value, 'dob not required', 'gender not required', timezoneValidation)));
      if (Object.keys(validate).length) {
        setProcess(false);
        setFormErrors(validate);
      }
      else {
        let user_role = decryptToken(user_role_enc);
        let params = {};
        params["gender"] = gender;
        params["firstname"] = firstNameInput.current?.value;
        params["lastname"] = lastNameInput.current?.value;
        params["email"] = userData?.email;
        params["phonenumber"] = phoneInput.current?.value;
        if (dobDate) {
          params["dob"] = format(dobDate, "yyyy-MM-dd");
        }
        params["city"] = city;
        params["state"] = state;
        params["country"] = country;
        params["designationId"] = userData?.designation.id;
        params['calendly_url'] = calendlyUrlInput.current?.value;

        if (timezone && timezone.includes(' (')) {
          params["timezone"] = timezone.split(' (')[0];
        }
        else {
          params["timezone"] = timezone;
        }

        APIService.updateUserProfile(params, user_role)
          .then((response) => {
            if (response.data?.status) {
              toast.success(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
              Store.dispatch(saveUserObject(response.data?.data));
              setProcess(false);
            }
            else {
              toast.error(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
              setProcess(false);
            }
          })
          .catch((error) => {
            toast.error(error, {
              position: toast.POSITION.TOP_RIGHT
            });
            setProcess(false);
          });
      }
    }
    else {
      history.push('/');
    }
  }

  const changePassword = async () => {
    setChangePasswordProcess(true);
    setFormErrors([]);

    let validate = validateForm((ChangePasswordValidator(oldPasswordInput.current?.value, passwordInput.current?.value, confirmPasswordInput.current?.value)));
    if (Object.keys(validate).length) {
      setFormErrors(validate);
      setChangePasswordProcess(false);
    }
    else {
      let params = {};
      params["password"] = oldPasswordInput.current?.value;

      /*params["email"] = userData?.email;*/

      if (passwordInput.current?.value === confirmPasswordInput.current?.value) {
        APIService.changePassword(userData.id, params)
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

  const photoUpload = async (e) => {
    e.preventDefault();
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.onloadend = () => {
      let user_role_enc = localStorage.getItem("rz_user_role");
      if (user_role_enc !== null) {
        let user_role = decryptToken(user_role_enc);
        const formData = new FormData();
        formData.append(
          "profile_image",
          file,
          file.name
        );
        if (user_role === "client") {
          formData.append("userid", userData?.id);
        }
        else {
          formData.append("staffid", userData?.id);
        }
        APIService.profilePhotosUpdate(formData, user_role)
          .then((response) => {
            if (response.data?.status) {
              setProfileImagePreviewUrl(reader.result);
              toast.success(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
              setTimeout(() => {
                Store.dispatch(saveUserObject(response.data?.data));
              }, 1500);
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
    reader.readAsDataURL(file);
    e.target.value = null;
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
            /*let newUserData = userData;
            newUserData['profile_image'] = DefaultProfile;
            Store.dispatch(saveUserObject(newUserData));*/
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

  const handleTwoFactorAuthenticationChange = async (e) => {
    const checked = e.target.checked;
    const params = {
      two_factor_auth_enabled: checked, // Set based on the toggle state
    };

    try {
      const response = await APIService.twoFactorAuthentication(userData.id, params);
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

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Header pagename={name} />
        <div className="inner-content d-flex">
          <div className="people-detail d-xl-flex w-100">
            <div className="peaople-left-side d-xl-flex rounded-10">
              <div className="people-sidebar h-100 d-flex flex-column w-100">
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
                  <h3 className="mb-0">{`${userData?.firstname} ${userData?.lastname}`}</h3>
                  <a href={`mailto:${userData?.email}`} className="dark-2 font-12">{userData?.email}</a>
                  {(userData.role.code === databaseRoleCode.agencyCode || userData.role.code === databaseRoleCode.agencyMemberCode) && userData?.agency_name ?
                    <span className='font-12 d-block mt-2'><b>Agency</b>: {userData?.agency_name}</span>
                    : ''
                  }
                </div>
                {userData?.designation.id || userData?.country || userData?.state || userData?.city ?
                  <div className="people-about p-6 border-top border-gray-100">
                    <p className="text-uppercase font-weight-medium dark-1 mb-4">About</p>
                    {userData?.designation.name &&
                      <div className="people-about-list d-flex align-items-center">
                        <span className="icon-frame-59 list-icon font-20 dark-5"></span>
                        <span className="font-12">{capitalizeFirstWithRemoveUnderScore(userData?.designation.name)}</span>
                      </div>}
                    {/* <div className="people-about-list  d-flex align-items-center">
                    <span className="icon-organization list-icon font-20 dark-5"></span>
                    <span className="font-12">UnlimitedWp Pvt. Ltd</span>
                  </div>
                  <div className="people-about-list  d-flex align-items-center">
                    <span className="icon-department list-icon font-20 dark-5"></span>
                    <span className="font-12">Design Department</span>
                  </div> */}
                    <div className="people-about-list  d-flex align-items-center">
                      <span className="icon-location list-icon font-20 dark-5"></span>
                      <span className="font-12">{userData.city ? `${userData.city},` : ''} {userData.state ? `${userData.state},` : ''} {userData.country ? `${userData.country}.` : ''}</span>
                    </div>
                  </div>
                  : ''
                }
                <div className="people-about p-6 border-top border-gray-100">
                  <p className="text-uppercase font-weight-medium dark-1 mb-4">Security</p>
                  <div className="people-about-list d-flex align-items-center cursor-pointer" onClick={cpShowChangePasswordModal}>
                    <span className="icon-lock list-icon font-16 dark-5"></span>
                    <span className="font-12">Change Password</span>
                  </div>
                  {userData.role.code !== databaseRoleCode.clientCode && userData.role.code !== null &&
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
                  }
                </div>
              </div>
            </div>
            <div className="people-right-side ms-xl-7">
              <Accordion defaultActiveKey={['0', '1', '2', '3']} alwaysOpen className="dashboard-accordion">
                <Accordion.Item eventKey="0" className="bg-white rounded-10">
                  <Accordion.Header as="h4" className="pt-6 px-6">Basic Information</Accordion.Header >
                  <Accordion.Body className="pb-9 px-6">
                    <Form onSubmit={async e => { e.preventDefault(); await updateProfile() }}>
                      <Row className="g-9">
                        <Col sm={12} md={6} lg={4} className="validation-required">
                          <Form.Label className="mb-2">First Name</Form.Label>
                          <Form.Control type="text" placeholder="Enter First Name" ref={firstNameInput} className={`${formErrors.firstNameInput && 'is-invalid'}`} />
                          {formErrors.firstNameInput && (
                            <span className="text-danger">{formErrors.firstNameInput}</span>
                          )}
                        </Col>

                        <Col sm={12} md={6} lg={4} className="validation-required">
                          <Form.Label className="mb-2">Last Name</Form.Label>
                          <Form.Control type="text" placeholder="Enter Last Name" ref={lastNameInput} className={`${formErrors.lastNameInput && 'is-invalid'}`} />
                          {formErrors.lastNameInput && (
                            <span className="text-danger">{formErrors.lastNameInput}</span>
                          )}
                        </Col>
                        <Col sm={12} md={6} lg={4} className="validation-required">
                          <Form.Label className="mb-2">Email</Form.Label>
                          <Form.Control type="text" placeholder="Enter Email" ref={emailInput} disabled />
                        </Col>
                        <Col sm={12} md={6} lg={4} className="validation-required">
                          <Form.Label className="mb-2">Phone</Form.Label>
                          <Form.Control type="text" placeholder="Enter Phone Number" ref={phoneInput} className={`form-control ${formErrors.phoneInput && 'is-invalid'}`} />
                          {/* <InputMask mask="999-999-9999" type="text" placeholder="Enter Phone Number" ref={phoneInput} className={`form-control ${formErrors.phoneInput && 'is-invalid'}`} /> */}
                          {formErrors.phoneInput && (
                            <span className="text-danger">{formErrors.phoneInput}</span>
                          )}
                        </Col>
                        <Col sm={12} md={6} lg={4}>
                          <Form.Label className="mb-2">Role</Form.Label>
                          <Form.Control type="text" placeholder="Role" ref={roleInput} value={roleInput.value} disabled />
                        </Col>
                        <Col sm={12} md={6} lg={4}>
                          <Form.Label className="mb-2">Date of Birth</Form.Label>
                          <div className="datepicker-default">
                            <SingleDatePickerControl
                              selected={dobDate}
                              onChange={(date) => setDobDate(date)}
                              onDateChange={(date) => setDobDate(date)}
                              isClearable
                              className={`form-control ${formErrors.dobDate && 'is-invalid'}`}
                            />
                            {formErrors.dobDate && (
                              <span className="text-danger">{formErrors.dobDate}</span>
                            )}
                          </div>
                        </Col>
                        <Col sm={12} md={6} lg={4} className="validation-required">
                                <Form.Label className="mb-2">Country</Form.Label>
                                <Select styles={customStyles} className={`custom-select ${formErrors.country && 'is-invalid'}`} options={countryOptions} onChange={handleCountrySelect}
                                  value={countryOptions.filter(function (option) {
                                    return option.value === country;
                                  })} />

                                {formErrors.country && (
                                  <span className="text-danger">{formErrors.country}</span>
                                )}
                              </Col>
                              <Col sm={12} md={6} lg={4} className="validation-required">
                                <Form.Label className="mb-2">State</Form.Label>
                                <Select styles={customStyles} className={`custom-select ${formErrors.state && 'is-invalid'}`} options={stateOptions} onChange={handleStateSelect}
                                  value={stateOptions.filter(function (option) {
                                    return option.value === state;
                                  })} />

                                {formErrors.state && (
                                  <span className="text-danger">{formErrors.state}</span>
                                )}
                              </Col>
                        <Col sm={12} md={6} lg={4}>
                          <Form.Label className="mb-2">City</Form.Label>
                          <Select styles={customStyles} className={`custom-select ${formErrors.city && 'is-invalid'}`} options={cityOptions} onChange={(e) => setCity(e.value)}
                                  value={cityOptions.filter(function (option) {
                                    return option.value === city;
                                  })} />
                                {formErrors.city && (
                                  <span className="text-danger">{formErrors.city}</span>
                                )}
                        </Col>
                        <Col sm={12} md={6} lg={4}>
                          <Form.Label className="mb-2">Gender</Form.Label>
                          <div className="form-check profile-gender d-flex align-items-center ps-0 ms-0 mt-3">
                            <Form.Check inline label="Male" value="male" name="gender" type="radio" id="gender-male" className="mb-0" defaultChecked={gender === "male" ? true : false} onChange={(e) => { setGender('male') }} />
                            <Form.Check inline label="Female" value="female" name="gender" type="radio" id="gender-female" className="ms-8 mb-0" defaultChecked={gender === "female" ? true : false} onChange={(e) => { setGender('female') }} />
                          </div>
                          {formErrors.gender && (
                            <span className="text-danger">{formErrors.gender}</span>
                          )}
                        </Col>

                        {userData.role.code === databaseRoleCode.pcCode || userData.role.code === databaseRoleCode.accountantCode ?
                        <Col sm={12} md={6} xxl={4}>
                          <Form.Label className="mb-2">Calendly URL</Form.Label>
                          <Form.Control type="text" ref={calendlyUrlInput} className={`${formErrors.calendlyUrlInput && 'is-invalid'}`} />
                          {formErrors.calendlyUrlInput && (
                            <span className="text-danger">{formErrors.calendlyUrlInput}</span>
                          )}
                        </Col>
                        : ''}

                        {userData.role.code === databaseRoleCode.agencyCode || userData.role.code === databaseRoleCode.agencyMemberCode ?
                          <>
                          <Col sm={12} md={6} lg={4} className="validation-required">
                            <Form.Label className="mb-2">Timezone</Form.Label>
                            <Select styles={customStyles} classNamePrefix="react-select" menuPortalTarget={document.body} className={`custom-select ${formErrors.timezoneInput && 'is-react-select-invalid'}`} options={timezoneOption} onChange={handleTimezoneSelect} placeholder={<div>Select Timezone</div>}
                              value={timezoneOption.filter(function (option) {
                                return option.label.includes(timezone) && timezone;
                              })} />
                            {formErrors.timezoneInput && (
                              <span className="text-danger">{formErrors.timezoneInput}</span>
                            )}
                          </Col>

                            <Col sm={12} md={2} lg={2}>
                              <Form.Label className="mb-2">Receive Email</Form.Label>
                              <div className="form-check form-switch p-0 mb-0 ms-sm-10 ms-auto">
                                <input className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" checked={sendEmailNotification} onChange={(e) => setSendEmailNotification(e.target.checked)} />
                              </div>
                            </Col>

                            <Col sm={12} md={2} lg={2}>
                              <Form.Label className="mb-2">Receive Notification</Form.Label>
                              <div className="form-check form-switch p-0 mb-0 ms-sm-10 ms-auto">
                                <input className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" checked={sendNotification} onChange={(e) => setSendNotification(e.target.checked)} />
                              </div>
                            </Col>

                          </>
                          : ''}
                       
                        
                        <Col sm={12} md={12} lg={12} className="text-end">
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
                <Form.Label className="dark-5">Current password</Form.Label>
                <Form.Control type="password" ref={oldPasswordInput} className={`${formErrors.oldPasswordInput && 'is-invalid'}`} />
                {formErrors.oldPasswordInput && (
                  <span className="text-danger">{formErrors.oldPasswordInput}</span>
                )}
              </Form.Group>
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
        <Footer />
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
  userData: state.Auth.user
})

export default connect(mapStateToProps)(Profile)