import React, { useState, useEffect, useRef } from 'react';
import APIService from "../../api/APIService";
import { Button, Form, Row, Col, Card, Spinner } from 'react-bootstrap';
import StripeCardInput from './StripeCardInput';
import Select from 'react-select';
import { hearAboutUsList } from '../../settings';
import { validateForm } from "../../utils/validator.js";
import { RegisterValidator, CouponVerifyValidator } from "../../modules/validation/RegisterValidator";
//import InputMask from "react-input-mask";
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation } from "react-router-dom";

export default function Register() {
  const search = useLocation().search;
  const searchAffiliateId = new URLSearchParams(search).get('ref');
  let emailInput = useRef();
  let passwordInput = useRef();
  let confirmPasswordInput = useRef();
  let firstNameInput = useRef();
  let lastNameInput = useRef();
  let companyNameInput = useRef();
  let streetAddressInput = useRef();
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  let cityInput = useRef();
  let zipCodeInput = useRef();
  let phoneInput = useRef();
  let couponCodeInput = useRef();
  const [hearAboutUs, setHearAboutUs] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [planList, setPlanList] = useState([]);
  const [countryOption, setCountryOption] = useState([]);
  const [stateOption, setStateOption] = useState([]);
  const [process, setProcess] = useState(false);
  const [processApply, setProcessApply] = useState(false);
  const [formErrors, setFormErrors] = useState([]);
  const [couponCalculation, setCouponCalculation] = useState('');
  const [termsCondition, setTermsCondition] = useState(false);
  const [affiliateData, setAffiliateData] = useState('');
  const [devPersonalizeAddon, setDevPersonalizeAddon] = useState(false);
  const [devAddonPlanList, setDevAddonPlanList] = useState([]);
  const [selectedDevAddonPlan, setSelectedDevAddonPlan] = useState('');

  const stripe = useStripe();
  const elements = useElements();

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
    let params = {};
    params['is_fully_model'] = 1;
    APIService.getStripePlans(params)
      .then((response) => {
        if (response.data?.status) {
          let res = {};
          res['monthly'] = response.data?.data?.monthly;
          res['yearly'] = response.data?.data?.yearly;
          setPlanList(res);
        }
      });

    APIService.getCountry()
      .then((response) => {
        if (response.data?.status) {
          setCountryOption(response.data?.data);
        }
      });

    if (searchAffiliateId) {
      let params = `?affiliate_id=${searchAffiliateId}`;
      APIService.getAffiliateData(params)
        .then((response) => {
          if (response.data?.status) {
            setAffiliateData({ affiliate_id: searchAffiliateId, affiliate_type: "via URL", affiliate_rate: response.data?.data?.rate })
          }
        });
    }

    APIService.getPersonalizeDevAddonPlan()
      .then((response) => {
        if (response.data?.status) {
          setDevAddonPlanList(response.data?.data);
        }
      });

  }, []);

  useEffect(() => {
    if (country !== null && country !== '') {
      APIService.getState(country)
        .then((response) => {
          if (response.data?.status) {
            setStateOption(response.data?.data);
          }
        });
    }
  }, [country]);

  const handleCountrySelect = e => {
    setCountry(e.value);
  };

  const handleStateSelect = e => {
    setState(e.value);
  };

  const handleHearAboutUsSelect = e => {
    setHearAboutUs(e.value);
  };

  const confirmOrder = async () => {
    setProcess(true);
    setFormErrors([]);
    let validate = validateForm((RegisterValidator(selectedPlan, emailInput.current?.value, passwordInput.current?.value, confirmPasswordInput.current?.value, firstNameInput.current?.value, lastNameInput.current?.value, companyNameInput.current?.value, streetAddressInput.current?.value, country, state, cityInput.current?.value, zipCodeInput.current?.value, phoneInput.current?.value, termsCondition ? 'not required' : '')));

    if (Object.keys(validate).length) {
      setProcess(false);
      setFormErrors(validate);
    }
    else {
      if (!stripe || !elements) {
        toast.error('Something went to wrong.', {
          position: toast.POSITION.TOP_RIGHT
        });
        return false;
      }

      const result = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          name: `${firstNameInput.current?.value} ${lastNameInput.current?.value}`,
          email: emailInput.current?.value,
          phone: phoneInput.current?.value,
        },
      });

      if (result.error) {
        toast.error(result.error.message, {
          position: toast.POSITION.TOP_RIGHT
        });
        setProcess(false);
      } else {
        const token_result = await stripe.createToken(elements.getElement(CardElement));
        let params = {};
        params['card_token'] = token_result?.token?.id;
        params['email'] = emailInput.current?.value;
        params['password'] = passwordInput.current?.value;
        params['confirm_password'] = confirmPasswordInput.current?.value;
        params['firstname'] = firstNameInput.current?.value;
        params['lastname'] = lastNameInput.current?.value;
        params['agency_name'] = companyNameInput.current?.value;
        params['address'] = streetAddressInput.current?.value;
        params['country_id'] = country;
        params['state_id'] = state;
        //for country name
        let findCountryName = countryOption.filter(function (option) {
          return option.value === country;
        });
        if (findCountryName !== undefined && findCountryName[0] && findCountryName[0]['label'] !== undefined) {
          params["country"] = findCountryName[0]['label'];
        }
        else {
          params["country"] = null;
        }

        //for state name
        let findStateName = stateOption.filter(function (option) {
          return option.value === state;
        });
        if (findStateName !== undefined && findStateName[0] !== undefined && findStateName[0]['label'] !== undefined) {
          params["state"] = findStateName[0]['label'];
        }
        else {
          params["state"] = null;
        }

        params['city'] = cityInput.current?.value;
        params['zipcode'] = zipCodeInput.current?.value;
        params['phonenumber'] = phoneInput.current?.value;
        params['how_hear_about'] = hearAboutUs;
        params['coupon_code'] = couponCalculation !== '' ? couponCodeInput.current?.value : '';
        params['payment_method'] = result.paymentMethod.id;
        params['price_plan'] = selectedPlan?.id;
        params['plan_name'] = selectedPlan?.name;
        params['plan'] = 'Development';

        if (affiliateData !== '' && affiliateData?.affiliate_rate !== '') {
          params['affiliate_id'] = affiliateData?.affiliate_id;
          params['affiliate_type'] = affiliateData?.affiliate_type;
          params['affiliate_rate'] = affiliateData?.affiliate_rate;
        }
        else {
          params['affiliate_id'] = '';
          params['affiliate_type'] = '';
          params['affiliate_rate'] = '';
        }

        if (devPersonalizeAddon) {
          params['is_purchase_dev_addon'] = 1;
          params['personalized_dev_addon'] = [selectedDevAddonPlan];
        }
        else {
          params['is_purchase_dev_addon'] = 0;
        }

        APIService.Register(params)
          .then((response) => {
            if (response.data?.status) {
              if (response.data?.data?.stripe_status === 'requires_action') {
                stripe.confirmCardPayment(response.data?.data?.client_secret).then(function (result) {
                  if (result.error) {
                    toast.error('Something went to wrong.', {
                      position: toast.POSITION.TOP_RIGHT
                    });
                    setProcess(false);
                  } else {
                    window.top.location.href = "https://unlimitedwp.com/thank-you-dev-plan-purchase/";
                  }
                });
              }
              else {
                window.top.location.href = "https://unlimitedwp.com/thank-you-dev-plan-purchase/";
              }
            }
            else {
              toast.error(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
              setProcess(false);
            }
          });
      }
    }
  }

  const handlePlanChange = (id, name, amount, plan_type, product) => {
    setFormErrors([]);
    setCouponCalculation('');
    if (couponCalculation !== '') {
      couponCodeInput.current.value = '';
    }
    setSelectedPlan({ id: id, name: name, amount: amount, plan_type: plan_type, product: product });
  };

  const handlePersonalizeAddonCheckChange = (e) => {
    setFormErrors([]);
    //setCouponCalculation('');
    setDevPersonalizeAddon(e.target.checked);
    if (e.target.checked) {
      if (devAddonPlanList.length > 0) {
        setSelectedDevAddonPlan({ price_plan: devAddonPlanList[0]?.id, plan_name: devAddonPlanList[0]?.nickname, amount: (devAddonPlanList[0]?.amount) / 100, product: devAddonPlanList[0]?.product, plan: 'Dev-personalized-addon' });
      }
    }
    else {
      setSelectedDevAddonPlan('');
    }
  };

  const clearCouponCode = () => {
    setFormErrors([]);
    setCouponCalculation('');
    if (couponCalculation !== '') {
      couponCodeInput.current.value = '';
    }
    if (affiliateData?.affiliate_type === "via Coupon") {
      setAffiliateData('');
    }
  };

  const checkCouponCode = async () => {
    setProcessApply(true);
    setFormErrors([]);
    let validate = validateForm((CouponVerifyValidator(selectedPlan, couponCodeInput.current?.value)));
    if (Object.keys(validate).length) {
      setProcessApply(false);
      setFormErrors(validate);
    }
    else {
      let params = {};
      params['code'] = couponCodeInput.current?.value;
      if (devPersonalizeAddon) {
        params['amount'] = parseFloat(selectedPlan?.amount / 100);
        params['addon_amount'] = parseFloat(selectedDevAddonPlan?.amount);
        //params['plan_product_id'] = `${selectedPlan?.product},${selectedDevAddonPlan.product}`;
      }
      else {
        params['amount'] = parseFloat(selectedPlan?.amount / 100);
        //params['plan_product_id'] = selectedPlan?.product;
      }
      params['plan_product_id'] = selectedPlan?.product;
      
      APIService.verifyCoupon(params)
        .then((response) => {
          if (response.data?.data?.is_coupon) {
            setCouponCalculation(response.data?.data);
            setProcessApply(false);
            let aff_id = response.data?.data?.affiliate_id;
            if (aff_id !== "") {
              let params = `?affiliate_id=${aff_id}`;
              APIService.getAffiliateData(params)
                .then((response) => {
                  if (response.data?.status) {
                    setAffiliateData({ affiliate_id: aff_id, affiliate_type: "via Coupon", affiliate_rate: response.data?.data?.rate })
                  }
                  else {
                    if (affiliateData?.affiliate_type === "via Coupon") {
                      setAffiliateData('');
                    }
                  }
                });
            }
            else {
              if (affiliateData?.affiliate_type === "via Coupon") {
                setAffiliateData('');
              }
            }
          }
          else {
            setProcessApply(false);
            setCouponCalculation('');
            if (response.data?.data?.coupon_msg) {
              setFormErrors({ couponInput: response.data?.data?.coupon_msg });
            }
            else {
              setFormErrors({ couponInput: response.data?.message });
            }
          }
        });
    }
  }

  return (
    <>
      <ToastContainer />
      <div className="inner-content">
        <Form onSubmit={async e => { e.preventDefault(); await confirmOrder() }}>
          <Row className="mt-8">
            <Col xs={12} xl={8}>
              <Card className="rounded-10 border border-gray-100 mb-4">
                <Card.Body className="p-0">
                  <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                    <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Select Plan</h3>
                  </div>
                </Card.Body>
                <Card.Body className="px-md-4 py-4">
                  <div className="px-md-3 py-md-3 pricing-template">
                    {/* <div className="w-100 d-flex justify-content-center mt-4 mb-4 pb-1">
                      <ul className="nav nav-segment nav-pills mb-4 bg-lighter-light rounded-pill" role="tablist">
                        <li className="nav-item">
                          <a className="nav-link" data-bs-toggle="pill" href="#pills-monthly" role="tab" aria-controls="pills-monthly" aria-selected="true">Monthly Dev Plan</a>
                        </li>
                        <li className="nav-item">
                          <a className="nav-link active" data-bs-toggle="pill" href="#pills-yearly" role="tab" aria-controls="pills-yearly" aria-selected="false">Annual Dev Plan</a>
                        </li>
                      </ul>
                    </div> */}
                    <div className="tab-content">
                      <div className="tab-pane fade" id="pills-monthly" role="tabpanel">
                        <p className="text-center mb-7">Save big by selecting our Annual Plan (paid monthly)</p>
                        <div className="row justify-content-center">
                          {planList.monthly?.slice(0, 3).map((monthly_plan, index) => (
                            <div className="col-md-4" key={index}>
                              <div className="plan-card">
                                <input className="form-check-input visually-hidden" type="radio" name="selectplan" value={monthly_plan.id} id={monthly_plan.id} onChange={(e) => { handlePlanChange(monthly_plan.id, monthly_plan.nickname, monthly_plan.amount, 'monthly', monthly_plan.product) }} />
                                <label className="form-check-label border border-gray-100 shadow-dark-80 rounded-10 p-4 px-xl-4 mb-4 d-block" htmlFor={monthly_plan.id}>
                                  <div className="px-0 px-xxl-3 py-0 py-xxl-2">
                                    <h4 className="font-weight-medium mb-0 pt-md-3">{monthly_plan.nickname}</h4>
                                    <h3 className="d-flex align-items-center">$<span className="monthly">{(monthly_plan.amount / 100).toFixed(2)}</span></h3>
                                    <div className="mt-4 mb-2 pt-2 d-grid">
                                      <div className="btn btn-lg btn-soft-primary px-lg-2">Select Plan <svg className="ms-1" data-name="icons/tabler/chevron right" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16">
                                        <rect data-name="Icons/Tabler/Chevron Right background" width="16" height="16" fill="none"></rect>
                                        <path d="M.26.26A.889.889,0,0,1,1.418.174l.1.086L8.629,7.371a.889.889,0,0,1,.086,1.157l-.086.1L1.517,15.74A.889.889,0,0,1,.174,14.582l.086-.1L6.743,8,.26,1.517A.889.889,0,0,1,.174.36Z" transform="translate(4)" fill="#0D6EFD"></path>
                                      </svg>
                                      </div>
                                    </div>
                                  </div>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="tab-pane fade show active" id="pills-yearly" role="tabpanel">
                        <p className="text-center mb-7">You are saving big by commiting to use our service for one year. You will be billed monthly.<br />If you cancel subscription before 12 months, you will be charged 30% on your used months in the annual contract.</p>
                        <div className="row justify-content-center">
                          {planList.yearly?.slice(0, 3).map((yearly_plan, index) => (
                            <div className="col-md-4" key={index}>
                              <div className="plan-card">
                                <input className="form-check-input visually-hidden" type="radio" name="selectplan" value={yearly_plan.id} id={yearly_plan.id} onChange={(e) => { handlePlanChange(yearly_plan.id, yearly_plan.nickname, yearly_plan.amount, 'yearly', yearly_plan.product) }} />
                                <label className="form-check-label border border-gray-100 shadow-dark-80 rounded-10 p-4 px-xl-4 mb-4 d-block" htmlFor={yearly_plan.id}>
                                  <div className="px-0 px-xxl-3 py-0 py-xxl-2">
                                    <h4 className="font-weight-medium mb-0 pt-md-3">{yearly_plan.nickname}</h4>
                                    <h3 className="d-flex align-items-center">$<span className="monthly">{(yearly_plan.amount / 100).toFixed(2)}</span></h3>
                                    <div className="mt-4 mb-2 pt-2 d-grid">
                                      <div className="btn btn-lg btn-soft-primary px-lg-2">Select Plan <svg className="ms-1" data-name="icons/tabler/chevron right" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16">
                                        <rect data-name="Icons/Tabler/Chevron Right background" width="16" height="16" fill="none"></rect>
                                        <path d="M.26.26A.889.889,0,0,1,1.418.174l.1.086L8.629,7.371a.889.889,0,0,1,.086,1.157l-.086.1L1.517,15.74A.889.889,0,0,1,.174,14.582l.086-.1L6.743,8,.26,1.517A.889.889,0,0,1,.174.36Z" transform="translate(4)" fill="#0D6EFD"></path>
                                      </svg>
                                      </div>
                                    </div>
                                  </div>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {formErrors.planInput && (
                        <span className="text-danger text-center">{formErrors.planInput}</span>
                      )}
                    </div>
                    {devAddonPlanList.length > 1 &&
                      <div className='mt-3'>
                        <Form.Check type="checkbox" id="dev-personalize-addon" label={`${devAddonPlanList[0]?.nickname} ($${(devAddonPlanList[0]?.amount / 100).toFixed(2)} / Month)`} checked={devPersonalizeAddon} onChange={(e) => { handlePersonalizeAddonCheckChange(e) }} />
                      </div>
                    }
                  </div>
                </Card.Body>
              </Card>
              <Card className="rounded-10 border border-gray-100 mb-4">
                <Card.Body className="p-0">
                  <div className="px-3 px-md-4 py-3 border-bottom border-gray-100">
                    <h3 className="card-header-title mb-0 mt-md-2 ps-md-3">Sign Up Details</h3>
                    <p className="dark-5 font-12 mt-md-1 mb-0 ps-md-3">This will be your login details to Project Management tool.</p>
                  </div>
                </Card.Body>
                <Card.Body className="px-md-4 py-4">
                  <div className="px-md-3 py-md-3">
                    <Row className="mb-6">
                      <Col xs={12} md={6} className="validation-required">
                        <Form.Label className="form-label-sm">Email address</Form.Label>
                        <Form.Control type="text" ref={emailInput} className={`${formErrors.emailInput && 'is-invalid'}`} />
                        {formErrors.emailInput && (
                          <span className="text-danger">{formErrors.emailInput}</span>
                        )}
                      </Col>
                    </Row>
                    <Row className="mb-6">
                      <Col xs={12} md={6} className="validation-required">
                        <Form.Label className="form-label-sm">Password</Form.Label>
                        <Form.Control type="password" ref={passwordInput} className={`${formErrors.passwordInput && 'is-invalid'}`} />
                        {formErrors.passwordInput && (
                          <span className="text-danger">{formErrors.passwordInput}</span>
                        )}
                      </Col>
                      <Col xs={12} md={6} className="validation-required">
                        <Form.Label className="form-label-sm">Confirm password</Form.Label>
                        <Form.Control type="password" ref={confirmPasswordInput} className={`${formErrors.confirmPasswordInput && 'is-invalid'}`} />
                        {formErrors.confirmPasswordInput && (
                          <span className="text-danger">{formErrors.confirmPasswordInput}</span>
                        )}
                      </Col>
                    </Row>

                    <h3 className="card-header-title my-md-8 my-4">Billing Details</h3>
                    <Row className="mb-6">
                      <Col xs={12} md={6} className="validation-required">
                        <Form.Label className="form-label-sm">First Name</Form.Label>
                        <Form.Control type="text" ref={firstNameInput} className={`${formErrors.firstNameInput && 'is-invalid'}`} />
                        {formErrors.firstNameInput && (
                          <span className="text-danger">{formErrors.firstNameInput}</span>
                        )}
                      </Col>
                      <Col xs={12} md={6} className="validation-required">
                        <Form.Label className="form-label-sm">Last Name</Form.Label>
                        <Form.Control type="text" ref={lastNameInput} className={`${formErrors.lastNameInput && 'is-invalid'}`} />
                        {formErrors.lastNameInput && (
                          <span className="text-danger">{formErrors.lastNameInput}</span>
                        )}
                      </Col>
                    </Row>
                    <Row className="mb-6">
                      <Col xs={12} md={6} className="validation-required">
                        <Form.Label className="form-label-sm">Company Name (Agency Name)</Form.Label>
                        <Form.Control type="text" ref={companyNameInput} className={`${formErrors.companyNameInput && 'is-invalid'}`} />
                        {formErrors.companyNameInput && (
                          <span className="text-danger">{formErrors.companyNameInput}</span>
                        )}
                      </Col>
                      <Col xs={12} md={6} className="validation-required">
                        <Form.Label className="form-label-sm">Street address</Form.Label>
                        <Form.Control type="text" ref={streetAddressInput} className={`${formErrors.streetAddressInput && 'is-invalid'}`} />
                        {formErrors.streetAddressInput && (
                          <span className="text-danger">{formErrors.streetAddressInput}</span>
                        )}
                      </Col>
                    </Row>
                    <Row className="mb-6">
                      <Col xs={12} md={6} className="validation-required">
                        <Form.Label className="form-label-sm">Country</Form.Label>
                        <Select styles={customStyles} classNamePrefix="react-select" options={countryOption} onChange={handleCountrySelect} className={`custom-select ${formErrors.countryInput && 'is-react-select-invalid'}`} menuPlacement="top"
                          value={countryOption.filter(function (option) {
                            return option.value === country;
                          })} />
                        {formErrors.countryInput && (
                          <span className="text-danger">{formErrors.countryInput}</span>
                        )}
                      </Col>
                      <Col xs={12} md={6} className="validation-required">
                        <Form.Label className="form-label-sm">State</Form.Label>
                        <Select styles={customStyles} classNamePrefix="react-select" options={stateOption} onChange={handleStateSelect} className={`custom-select ${formErrors.stateInput && 'is-react-select-invalid'}`} menuPlacement="top"
                          value={stateOption.filter(function (option) {
                            return option.value === state;
                          })} />
                        {formErrors.stateInput && (
                          <span className="text-danger">{formErrors.stateInput}</span>
                        )}
                      </Col>
                    </Row>
                    <Row className="mb-6">
                      <Col xs={12} md={6} className="validation-required">
                        <Form.Label className="form-label-sm">City</Form.Label>
                        <Form.Control type="text" ref={cityInput} className={`${formErrors.cityInput && 'is-invalid'}`} />
                        {formErrors.cityInput && (
                          <span className="text-danger">{formErrors.cityInput}</span>
                        )}
                      </Col>
                      <Col xs={12} md={6} className="validation-required">
                        <Form.Label className="form-label-sm">Zipcode</Form.Label>
                        <Form.Control type="text" ref={zipCodeInput} className={`${formErrors.zipCodeInput && 'is-invalid'}`} />
                        {formErrors.zipCodeInput && (
                          <span className="text-danger">{formErrors.zipCodeInput}</span>
                        )}
                      </Col>
                    </Row>
                    <Row className="mb-6">
                      <Col xs={12} md={6} className="validation-required">
                        <Form.Label className="form-label-sm">Phone</Form.Label>
                        <Form.Control type="number" placeholder="Enter Phone Number" ref={phoneInput} className={`form-control ${formErrors.phoneInput && 'is-invalid'}`} />
                        {/* <InputMask mask="999-999-9999" type="text" placeholder="Enter Phone Number" ref={phoneInput} className={`form-control ${formErrors.phoneInput && 'is-invalid'}`} /> */}
                        {formErrors.phoneInput && (
                          <span className="text-danger">{formErrors.phoneInput}</span>
                        )}
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Label className="form-label-sm">How did you hear about us?</Form.Label>
                        <Select styles={customStyles} options={hearAboutUsList} className='custom-select' onChange={handleHearAboutUsSelect} menuPlacement="top"
                          value={hearAboutUsList.filter(function (option) {
                            return option.value === hearAboutUs;
                          })} />
                      </Col>
                    </Row>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} xl={4}>
              <Card className="rounded-10 border border-gray-100 mb-4">
                <Card.Body className="p-0">
                  <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                    <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Review Total</h3>
                  </div>
                </Card.Body>
                <Card.Body className="px-md-4 py-4">
                  <div className="px-md-3 py-md-3">
                    <div className="input-group input-group-lg mb-4">
                      <input type="text" className={`form-control ${formErrors.couponInput && 'is-invalid'}`} placeholder="COUPON CODE" aria-label="COUPON CODE" aria-describedby="button-addon2" ref={couponCodeInput} />
                      {couponCalculation !== '' &&
                        <Button disabled={processApply} variant="" size="md" type="button" className='btn-clear-coupon' onClick={async e => { e.preventDefault(); await clearCouponCode() }}><i className="icon-cancel"></i></Button>
                      }
                      <Button disabled={processApply} variant="primary" size="lg" type="button" onClick={async e => { e.preventDefault(); await checkCouponCode() }} id="button-addon2">
                        {
                          !processApply && 'APPLY'
                        }
                        {
                          processApply && <><Spinner size="sm" animation="border" className="me-1" />APPLY</>
                        }
                      </Button>
                    </div>
                    {formErrors.couponInput && (
                      <span className="text-danger">{formErrors.couponInput}</span>
                    )}
                    {couponCalculation !== '' && (
                      <span className="text-success">Coupon Code Applied Successfully</span>
                    )}
                    <div className="list-group list-group-flush">
                      <div className="list-group-item">
                        <div className="row px-3">
                          <div className="col ps-0">
                            <span className="d-block text-gray-800">
                              Plan Amount
                            </span>
                          </div>
                          <div className="col-auto">
                            <span className="d-block text-gray-800">
                              <strong className="text-black-600">${couponCalculation?.amount ? couponCalculation.amount.toFixed(2) : selectedPlan !== '' ? (selectedPlan?.amount / 100).toFixed(2) : '0.00'}</strong>
                            </span>
                          </div>
                        </div>
                        {selectedDevAddonPlan && couponCalculation === '' &&
                          <div className="row px-3 mt-1">
                            <div className="col ps-0">
                              <span className="d-block text-gray-800">
                                {selectedDevAddonPlan?.plan_name}
                              </span>
                            </div>
                            <div className="col-auto">
                              <span className="d-block text-gray-800">
                                <strong className="text-black-600">${selectedDevAddonPlan?.amount.toFixed(2)}</strong>
                              </span>
                            </div>
                          </div>
                        }
                        {couponCalculation !== '' &&
                          <>
                            <div className="row px-3 mt-1">
                              <div className="col ps-0">
                                <span className="d-block text-gray-800 text-success">
                                  Coupon Discount
                                </span>
                              </div>
                              <div className="col-auto">
                                <span className="d-block text-gray-800">
                                  <strong className="text-black-600 text-success">-${couponCalculation?.discount_amount ? couponCalculation.discount_amount.toFixed(2) : '0.00'}</strong>
                                </span>
                              </div>
                            </div>
                            {selectedDevAddonPlan &&
                              <div className="row px-3 mt-1">
                                <div className="col ps-0">
                                  <span className="d-block text-gray-800">
                                    {selectedDevAddonPlan?.plan_name}
                                  </span>
                                </div>
                                <div className="col-auto">
                                  <span className="d-block text-gray-800">
                                    <strong className="text-black-600">${selectedDevAddonPlan?.amount.toFixed(2)}</strong>
                                  </span>
                                </div>
                              </div>
                            }
                            <hr style={{ color: "#D5D6D7", opacity: 1 }} />
                            <div className="row px-3 mt-2">
                              <div className="col ps-0">
                                <span className="d-block text-gray-800">
                                  Pay Now
                                </span>
                              </div>
                              <div className="col-auto">
                                <span className="d-block text-gray-800">
                                  <strong className="text-black-600">${couponCalculation?.paid_amount ? devPersonalizeAddon ? (couponCalculation.paid_amount + selectedDevAddonPlan?.amount).toFixed(2) : couponCalculation.paid_amount.toFixed(2) : '0.00'}</strong>
                                </span>
                              </div>
                            </div>
                          </>
                        }
                      </div>
                      <div className="list-group-item">
                        <div className="row px-3">
                          <div className="col ps-0">
                            <span className="d-block text-gray-800">
                              Monthly Total
                            </span>
                          </div>
                          <div className="col-auto">
                            <span className="d-block text-gray-800">
                              <strong className="text-black-600">${couponCalculation?.amount ? devPersonalizeAddon ? (couponCalculation.amount + selectedDevAddonPlan?.amount).toFixed(2) : couponCalculation.amount.toFixed(2) : selectedPlan !== '' ? devPersonalizeAddon ? ((selectedPlan?.amount / 100) + (selectedDevAddonPlan?.amount)).toFixed(2) : (selectedPlan?.amount / 100).toFixed(2) : '0.00'}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <StripeCardInput />
                    <div className="form-check form-check-sm mt-md-5 d-flex">
                      <input className="form-check-input mt-1" type="checkbox" id="flexCheckChecked2" value={1} checked={termsCondition} onChange={(e) => { setTermsCondition(e.target.checked) }} />
                      <label className="form-check-label text-small" htmlFor="flexCheckChecked2">I have read and agree to UnlimitedWP's <a href="https://unlimitedwp.com/unlimitedwp-service-agreement/" target="_blank" rel="noreferrer">Service Agreement.</a></label>
                    </div>
                    {formErrors.termsConditionInput && (
                      <span className="text-danger">{formErrors.termsConditionInput}</span>
                    )}
                    <div className="d-flex align-items-center  mt-4 pt-1">
                      <Button disabled={process} variant="primary" size="lg" type="submit">
                        {
                          !process && 'Sign up'
                        }
                        {
                          process && <><Spinner size="sm" animation="border" className="me-1" />Sign up</>
                        }
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </>
  );
}
