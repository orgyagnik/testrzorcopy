import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Col, Row, Button, Form, Accordion, Spinner } from 'react-bootstrap';
import SingleDatePickerControl from '../../modules/custom/SingleDatePicker';
//import moment from 'moment';
import { toast } from 'react-toastify';
import APIService from "../../api/APIService";
import { validateForm } from "../../utils/validator.js"
//import InputMask from "react-input-mask";
import { UserValidator } from "../../modules/validation/UserValidator";
import { databaseRoleCode } from '../../settings';
import { useHistory } from "react-router-dom";
import { PASSWORD_CONFIRM_PASSWORD_SAME_VALIDATION } from '../../modules/lang/User';
import Select from 'react-select';
import { connect } from "react-redux";
import { format } from 'date-fns';
import { check } from "../../utils/functions.js";
import { Country, State, City }  from 'country-state-city';

function AddUser({ userData, name }) {  
  const history = useHistory();
  const currentURL = window.location.pathname;
  const [gender, setGender] = useState();
  const [role, setRole] = useState(
    (userData.role_code === databaseRoleCode.agencyCode || currentURL === "/add-agency-user") ? "5f3a981c-daa0-4257-90a7-75721a54ba11" :
    (userData.role_code === databaseRoleCode.adminCode || currentURL === "/add-agency") ? "bdb82baa-6ac2-469b-b20c-e6a47454a9dd" : "0"
  );
  const [agency, setAgency] = useState(userData.role_code === databaseRoleCode.agencyCode ? userData?.id : "");
  const [agencyList, setAgencyList] = useState([]);
  let firstNameInput = useRef();
  let lastNameInput = useRef();
  let emailInput = useRef();
  let phoneInput = useRef();
  let emailSignatureInput = useRef();
  let passwordInput = useRef();
  let confirmPasswordInput = useRef();
  let googleDriveInput = useRef();
  let calendlyUrlInput = useRef();
  let agencyProfileInput = useRef();
  const [dobDate, setDobDate] = useState(null);
  const [process, setProcess] = useState(false);
  const [roleList, setRoleList] = useState([]);
  const [formErrors, setFormErrors] = useState([]);
  const [designation, setDesignation] = useState('');
  const [designationOption, setDesignationOption] = useState([]);
  const [agencyNameInput, setAgencyNameInput] = useState("");
  const [country, setCountry] = useState(userData?.country_id);
  const [state, setState] = useState(userData?.state_id);
  const [countryOption, setCountryOption] = useState([]);
  const [stateOption, setStateOption] = useState([]);
  let cityInput = useRef();
  let zipCodeInput = useRef();
  const [workLocationList, setWorkLocationList] = useState([]);
  const [workLocation, setWorkLocation] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState(null);
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [city, setCity] = useState('');
  
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
    if (check(['roles.view'], userData?.role.getPermissions)) {
      APIService.getRoleList()
        .then((response) => {
          if (response.data?.status) {
            console.log("the data :", response.data?.data);
            // Log the ID of each role
            response.data?.data.forEach(role => console.log(role.id));
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
    if (userData.role_code !== databaseRoleCode.agencyCode) {
      APIService.getAllAgency()
        .then((response) => {
          if (response.data?.status) {
            let data = response.data?.data;
            let temData = data?.map(item => {
              return { label: item.agency_name, value: item.staffid }
            });
            setAgencyList(temData);
          }
        });
    }
  }, []);


  const addUser = async () => {
    setProcess(true);
    setFormErrors([]);
    
    let validate = validateForm(UserValidator(
      firstNameInput.current?.value, 
      lastNameInput.current?.value, 
      emailInput.current?.value, 
      '1234567890', 
      role === "0" ? '' : role, 
      (currentURL === "/add-agency-user" || currentURL === "/add-agency") ? 'not required' : designation, 
      '10/01/2023', 
      'not required', 
      passwordInput.current?.value, 
      confirmPasswordInput.current?.value, 
      role === "5f3a981c-daa0-4257-90a7-75721a54ba11" ? agency : 'not required', 
      (userData.role_code === databaseRoleCode.adminCode && currentURL === "/add-agency") ? agencyNameInput : 'not required', 
      (userData.role_code === databaseRoleCode.adminCode && currentURL === "/add-agency") ? country: 'not required', 
      (userData.role_code === databaseRoleCode.adminCode && currentURL === "/add-agency") ? state: 'not required', 
      (userData.role_code === databaseRoleCode.adminCode && currentURL === "/add-agency") ? cityInput.current?.value: 'not required', 
      (userData.role_code === databaseRoleCode.adminCode && currentURL === "/add-agency") ? zipCodeInput.current?.value: 'not required', 
      ((userData.role_code === databaseRoleCode.adminCode || userData.role_code === databaseRoleCode.hrCode) && currentURL !== "/add-agency" && currentURL !== "/add-agency-user") ? workLocation : 'not required',  
      (currentURL === "/add-agency-user" || currentURL === "/add-agency") ? 'not required' : dateOfJoining
    ));
  
    if (Object.keys(validate).length) {
      setFormErrors(validate);
      setProcess(false);
    } else {
      if (passwordInput.current?.value === confirmPasswordInput.current?.value) {
        let params = {
          firstname: firstNameInput.current?.value,
          lastname: lastNameInput.current?.value,
          email: emailInput.current?.value,
          password: passwordInput.current?.value,
          roleId: role,
          zipcode: zipCodeInput.current?.value,
          admin: role === "e94c1b8f-a051-4bd0-acad-6da57216a169" ? true : false,
          gender: gender,
          is_wfh: workLocation === "WFH",
          email_signature: emailSignatureInput.current?.value,
        };

        // Conditionally add agency_name if applicable
        if (currentURL === "/add-agency") {
          params["agency_name"] = agencyNameInput; // Use the state variable directly
        }

        const phoneValue = phoneInput.current?.value?.replaceAll("-", "");
        if (phoneValue) {
          params["phonenumber"] = phoneValue;
        }

        
        if (designation) { 
          params["designationId"] = designation;
        }

        if (dateOfJoining) {
          params["date_of_joining"] = dateOfJoining;
        }

        if (dobDate) {
          params["dob"] = dobDate;
        }

        if (country) {
          const selectedCountry = countryOptions.find(option => option.value === country)?.label || "";
          if (selectedCountry) params["country"] = selectedCountry;
        }

        if (state) {
          const selectedState = stateOptions.find(option => option.value === state)?.label || "";
          if (selectedState) params["state"] = selectedState;
        }

        if (city) {
          const selectedCity = cityOptions.find(option => option.value === city)?.label || "";
          if (selectedCity) params["city"] = selectedCity;
        }

        params["google_drive"] = googleDriveInput.current?.value;
        params["calendly_url"] = calendlyUrlInput.current?.value;
        params["agency_profile_preferences"] = agencyProfileInput.current?.value;

        // if(role === '2' && currentURL === "/add-agency"){
        //   params['agency_name'] = agencyNameInput;
        // }
  
        // Add agency_name if role is '5f3a981c-daa0-4257-90a7-75721a54ba11'
        if (role === "5f3a981c-daa0-4257-90a7-75721a54ba11") {
          const selectedAgency = agencyList.find(option => option.value === agency);
          if (selectedAgency) {
            params['agencyId'] = selectedAgency.value;
          } else {
            // If agency is required but not selected, show an error and stop the process
            toast.error("Agency name is required.", {
              position: toast.POSITION.TOP_RIGHT
            });
            setProcess(false);
            return; // Stop execution if agency name is required but missing
          }
        }
  
        APIService.addUser(params)
          .then((response) => {
            if (response.data?.status) {
              clearControl();
              toast.success(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
              setTimeout(() => {
                if (currentURL === "/add-agency-user" || currentURL === "/add-agency")
                  history.push("/agency-users");
                else
                  history.push("/users");
              }, 2000);
              setProcess(false);
            } else {
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
      } else {
        toast.error(PASSWORD_CONFIRM_PASSWORD_SAME_VALIDATION, {
          position: toast.POSITION.TOP_RIGHT
        });
        setProcess(false);
      }
    }  
  }

  const clearControl = async () => {
    setGender(undefined);
    firstNameInput.current.value = "";
    lastNameInput.current.value = "";
    emailInput.current.value = "";
    if (phoneInput.current) {
      phoneInput.current.value = "";
    }
    if (googleDriveInput.current) {
      googleDriveInput.current.value = "";
    }
    if (calendlyUrlInput.current) {
      calendlyUrlInput.current.value = "";
    }
    if (agencyProfileInput.current) {
      agencyProfileInput.current.value = "";
    }
    setDesignation('');
    if (emailSignatureInput.current) {
      emailSignatureInput.current.value = "";
    }
    setRole("0");
    setAgency("");
    passwordInput.current.value = "";
    confirmPasswordInput.current.value = "";
    setDobDate(undefined);
  }

  const handleDesignationSelect = (selectedDesignation) => {
    setDesignation(selectedDesignation?.value);
  };

  const handleAgencySelect = selectedOption => {
    setAgency(selectedOption.value); // Assuming selectedOption is the selected agency object
  };

  // useEffect(() => {
  //   APIService.getCountry()
  //     .then((response) => {
  //       if (response.data?.status) {
  //         setCountryOption(response.data?.data);
  //       }
  //     });
  // }, []);

  // useEffect(() => {
  //   if (country !== null && country !== '') {
  //     APIService.getState(country)
  //       .then((response) => {
  //         if (response.data?.status) {
  //           setStateOption(response.data?.data);
  //         }
  //       });
  //   }
  // }, [country]);

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
    setState('');
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

  const handleWorkLocationSelect = (e) => {
    setWorkLocation(e.value);
  };

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Header pagename={name ? name : ''} />
        <div className="inner-content d-flex">
          <div className="people-detail d-flex w-100">
            <div className="people-right-side">
              <Accordion defaultActiveKey={['0', '1', '2', '3']} alwaysOpen className="dashboard-accordion">
                <Accordion.Item eventKey="0" className="bg-white rounded-10">
                  <Accordion.Header as="h4" className="pt-6 px-6">Basic Information</Accordion.Header >
                  <Accordion.Body className="pb-9 px-6">
                    <Form onSubmit={async e => { e.preventDefault(); await addUser() }}>
                      <Row className="g-9">
                        <Col sm={12} md={6} xl={4} className="validation-required">
                          <Form.Label className="mb-2">First Name</Form.Label>
                          <Form.Control type="text" placeholder="Enter First Name" ref={firstNameInput} className={`${formErrors.firstNameInput && 'is-invalid'}`} />
                          {formErrors.firstNameInput && (
                            <span className="text-danger">{formErrors.firstNameInput}</span>
                          )}
                        </Col>
                        <Col sm={12} md={6} xl={4} className="validation-required">
                          <Form.Label className="mb-2">Last Name</Form.Label>
                          <Form.Control type="text" placeholder="Enter Last Name" ref={lastNameInput} className={`${formErrors.lastNameInput && 'is-invalid'}`} />
                          {formErrors.lastNameInput && (
                            <span className="text-danger">{formErrors.lastNameInput}</span>
                          )}
                        </Col>
                        <Col sm={12} md={6} xl={4} className="validation-required">
                          <Form.Label className="mb-2">Email</Form.Label>
                          <Form.Control type="text" placeholder="Enter Email" ref={emailInput} className={`${formErrors.emailInput && 'is-invalid'}`} />
                          {formErrors.emailInput && (
                            <span className="text-danger">{formErrors.emailInput}</span>
                          )}
                        </Col>
                        {userData.role_code !== databaseRoleCode.agencyCode &&
                          <>
                            {currentURL === "/add-agency" && 
                              <>
                              <Col sm={12} md={6} xxl={4} className='validation-required'>
                                <Form.Label className="mb-2">Agency Name</Form.Label>
                                <Form.Control type="text" value={agencyNameInput} onChange={(e) => { setAgencyNameInput(e.target.value) }} className={`${formErrors.agencyNameInput && 'is-invalid'}`} />
                                {formErrors.agencyNameInput && (
                                  <span className="text-danger">{formErrors.agencyNameInput}</span>
                                )}
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

                              <Col sm={12} md={6} lg={4} className="validation-required">
                                <Form.Label className="mb-2">City</Form.Label>
                                <Select styles={customStyles} className={`custom-select ${formErrors.city && 'is-invalid'}`} options={cityOptions} onChange={(e) => setCity(e.value)}
                                  value={cityOptions.filter(function (option) {
                                    return option.value === city;
                                  })} />
                                {formErrors.city && (
                                  <span className="text-danger">{formErrors.city}</span>
                                )}

                              </Col>

                              <Col sm={12} md={6} lg={4} className="validation-required">
                                <Form.Label className="mb-2">Zipcode</Form.Label>

                                <Form.Control type="text" ref={zipCodeInput} className={`${formErrors.zipCodeInput && 'is-invalid'}`} />

                                {formErrors.zipCodeInput && (
                                  <span className="text-danger">{formErrors.zipCodeInput}</span>
                                )}

                              </Col>


                              </>
                            }
                          </>
                        }

                        {userData.role_code !== databaseRoleCode.agencyCode &&
                          <>
                            {currentURL !== "/add-agency-user" && 
                              <>
                                <Col sm={12} md={6} xl={4}>
                                  <Form.Label className="mb-2">Phone</Form.Label>
                                  <Form.Control type="number" placeholder="Enter Phone Number" ref={phoneInput} className={`form-control ${formErrors.phoneInput && 'is-invalid'}`} />
                                  {/* <InputMask mask="999-999-9999" type="text" placeholder="Enter Phone Number" ref={phoneInput} className={`form-control ${formErrors.phoneInput && 'is-invalid'}`} /> */}
                                  {formErrors.phoneInput && (
                                    <span className="text-danger">{formErrors.phoneInput}</span>
                                  )}
                                </Col>
                                { currentURL !== "/add-agency" &&
                                <Col sm={12} md={6} xl={4} className="validation-required">
                                  <Form.Label className="mb-2">Designation</Form.Label>
                                  <Select styles={customStyles} classNamePrefix="react-select" className={`custom-select ${formErrors.designationInput && 'is-react-select-invalid'}`} options={designationOption} onChange={handleDesignationSelect}
                                    value={designationOption.filter(function (option) {
                                      return option.value === designation;
                                    })} />
                                  {formErrors.designationInput && (
                                    <span className="text-danger">{formErrors.designationInput}</span>
                                  )}
                                </Col>
                                }
                              </>
                            }
                            {userData.role_code !== databaseRoleCode.agencyCode &&
                              <>
                                {currentURL !== "/add-agency-user" && currentURL !== "/add-agency" &&
                                  <Col sm={12} md={6} xl={4} className="validation-required">
                                    <Form.Label className="mb-2">Role</Form.Label>
                                    <Form.Select 
                                      value={role} 
                                      onChange={(e) => setRole(e.target.value)} 
                                      className={`form-control ${formErrors.roleInput && 'is-invalid'}`}
                                    >
                                      <option value="">--Select--</option>
                                      {roleList.map((roleOption, index) => (
                                        <option key={index} value={roleOption.id}>{roleOption.name}</option> // Ensure this is roleOption.id
                                      ))}
                                    </Form.Select>
                                    {formErrors.roleInput && (
                                      <span className="text-danger">{formErrors.roleInput}</span>
                                    )}
                                  </Col>
                                }
                                {role === "5f3a981c-daa0-4257-90a7-75721a54ba11" &&
                                  <Col sm={12} md={6} xl={4} className="validation-required">
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
                            {currentURL !== "/add-agency-user" && currentURL !== "/add-agency" &&
                              <>
                                <Col sm={12} md={6} xl={4}>
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

                                <Col sm={12} md={6} xl={4} className="validation-required">
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

                                <Col sm={12} md={6} xl={4}>
                                  <Form.Label className="mb-2">Gender</Form.Label>
                                  <div className="form-check profile-gender d-flex align-items-center ps-0 ms-0 mt-3">
                                    <Form.Check inline label="Male" value="male" name="gender" type="radio" id="gender-male" className="mb-0" defaultChecked={gender === "male" ? true : false} onChange={(e) => { setGender('male') }} />
                                    <Form.Check inline label="Female" value="female" name="gender" type="radio" id="gender-female" className="ms-8 mb-0" defaultChecked={gender === "female" ? true : false} onChange={(e) => { setGender('female') }} />
                                  </div>
                                  {formErrors.gender && (
                                    <span className="text-danger">{formErrors.gender}</span>
                                  )}
                                </Col>
                                <Col sm={12} md={6} xl={4}>
                                  <Form.Label className="mb-2">Google Drive</Form.Label>
                                  <Form.Control type="text" ref={googleDriveInput} className={`${formErrors.googleDriveInput && 'is-invalid'}`} />
                                  {formErrors.googleDriveInput && (
                                    <span className="text-danger">{formErrors.googleDriveInput}</span>
                                  )}
                                </Col>
                                <Col sm={12} md={6} xl={4}>
                                  <Form.Label className="mb-2">Calendly URL</Form.Label>
                                  <Form.Control type="text" ref={calendlyUrlInput} className={`${formErrors.calendlyUrlInput && 'is-invalid'}`} />
                                  {formErrors.calendlyUrlInput && (
                                    <span className="text-danger">{formErrors.calendlyUrlInput}</span>
                                  )}
                                </Col>
                                <Col sm={12} md={6} xl={4}>
                                  <Form.Label className="mb-2">Agency Profile And Preference</Form.Label>
                                  <Form.Control type="text" ref={agencyProfileInput} className={`${formErrors.agencyProfileInput && 'is-invalid'}`} />
                                  {formErrors.agencyProfileInput && (
                                    <span className="text-danger">{formErrors.agencyProfileInput}</span>
                                  )}
                                </Col>
                              </>
                            }
                          </>
                        }
                        <Col sm={12} md={6} xl={4} className="validation-required">
                          <Form.Label className="mb-2">Password</Form.Label>
                          <Form.Control type="password" ref={passwordInput} className={`${formErrors.passwordInput && 'is-invalid'}`} />
                          {formErrors.passwordInput && (
                            <span className="text-danger">{formErrors.passwordInput}</span>
                          )}
                        </Col>
                        <Col sm={12} md={6} xl={4} className="validation-required">
                          <Form.Label className="mb-2">Confirm Password</Form.Label>
                          <Form.Control type="password" ref={confirmPasswordInput} className={`${formErrors.confirmPasswordInput && 'is-invalid'}`} />
                          {formErrors.confirmPasswordInput && (
                            <span className="text-danger">{formErrors.confirmPasswordInput}</span>
                          )}
                        </Col>

                        {userData.role_code !== databaseRoleCode.agencyCode &&
                          <>
                            {currentURL !== "/add-agency-user" && currentURL !== "/add-agency" &&
                              <>
                                <Col sm={12} md={6} xl={4} className="validation-required">
                                  <Form.Label className="mb-2">Work From Home</Form.Label>

                                  <Select styles={customStyles} classNamePrefix="react-select" className={`custom-select ${formErrors.workFormHomeInput && 'is-react-select-invalid'}`} options={workLocationList} onChange={handleWorkLocationSelect}
                                    value={workLocationList.filter(function (option) {
                                      return option.value === workLocation;
                                    })} />
                                  {formErrors.workFormHomeInput && (
                                    <span className="text-danger">{formErrors.workFormHomeInput}</span>
                                  )}
                                 
                                </Col>
                              </>
                            }
                          </>
                        }

                        {userData.role_code !== databaseRoleCode.agencyCode &&
                          <>
                            {currentURL !== "/add-agency-user" && currentURL !== "/add-agency" &&
                              <>
                                <Col sm={12} md={6} xl={4}>
                                  <Form.Label className="mb-2">Email Signature</Form.Label>
                                  <Form.Control as="textarea" rows={1} type="text" placeholder="Enter Email Signature" ref={emailSignatureInput} />
                                </Col>
                              </>
                            }
                          </>
                        }
                        <Col className="text-end" xs={12}>
                          <Button disabled={process} className="me-2" variant="soft-secondary" size="md" type="button" onClick={() => { if (currentURL === "/add-agency-user") history.push("/agency-users"); else if(currentURL === "/add-agency") history.push("/agency-users"); else history.push("/users"); }}>Cancel</Button>
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
        <Footer />
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
  userData: state.Auth.user
})

export default connect(mapStateToProps)(AddUser)