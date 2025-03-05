import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Button, Spinner, Form, Row, Col } from 'react-bootstrap';
import SubscriptionLeftPanel from './SubscriptionLeftPanel';
import APIService from "../../api/APIService";
import moment from 'moment';
import { subscription_display_date_format } from '../../settings';
import { confirmAlert } from 'react-confirm-alert';
import { toast } from 'react-toastify';
import { decryptToken } from "../../utils/functions.js";
import Store from "../../store";
import { saveUserObject } from "../../store/reducers/Auth";
import { DONOT_CANCEL_SUBSCRIPTION, PLAN_VALIDATION, CANCEL_MONTHLY_SUBSCRIPTION, CANCEL_YEARLY_SUBSCRIPTION, CHANGE_REQUEST_SCHEDULED, DONOT_HAVE_DEV_PLAN, CANCEl_PERSONALIZE_DEV_ADDON } from '../../modules/lang/Subscription';
import { connect } from "react-redux";
import { validateForm } from "../../utils/validator.js";
import { CouponVerifyValidator } from "../../modules/validation/RegisterValidator";

function ManageDevPlans({ name, userData }) {
  const currentURL = window.location.pathname;
  const [process, setProcess] = useState(true);
  const [reloadPage, setReloadPage] = useState(false);
  const [showUpgradeDowngradePlan, setShowUpgradeDowngradePlan] = useState(currentURL === "/plans/upgrade-downgrade-plan" ? false : false);
  const [showPersonalizeDevAddon, setShowPersonalizeDevAddon] = useState(false);
  const [planList, setPlanList] = useState([]);
  const [devAddonPlanList, setDevAddonPlanList] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedPlanPersonalize, setSelectedPlanPersonalize] = useState('');
  const [termsCondition, setTermsCondition] = useState(false);
  const [termsConditionPersonalize, setTermsConditionPersonalize] = useState(false);
  const [currentPlanDetails, setCurrentPlanDetails] = useState([]);
  const [devPlanPricePreview, setDevPlanPricePreview] = useState('');
  const [confirmOrderProcess, setConfirmOrderProcess] = useState(false);
  const [processApply, setProcessApply] = useState(false);
  const [formErrors, setFormErrors] = useState([]);
  const [couponCalculation, setCouponCalculation] = useState('');
  let cancelReason = useRef();
  let couponCodeInput = useRef();

  useEffect(() => {
    APIService.getDevPlan()
      .then((response) => {
        setProcess(false);
        if (response.data?.status) {
          setCurrentPlanDetails(response.data?.data);

          // for upgrade-downgrade-plan scroll
          if (currentURL === "/plans/upgrade-downgrade-plan") {
            setTimeout(() => {
              const element = document.getElementById("upgrade-downgrade-plan");
              element.scrollIntoView();
            }, 500);
          }

        }
      });
  }, [reloadPage]);

  const updateProfileRedux = () => {
    let user_role_enc = localStorage.getItem("rz_user_role");
    if (user_role_enc !== null) {
      let user_role = decryptToken(user_role_enc);
      let params = {};
      APIService.getLogedInUser(params, user_role)
        .then((response) => {
          if (response.data?.status) {
            Store.dispatch(saveUserObject(response.data?.data));
          }
        })
    }
  }

  useEffect(() => {
    let params = {};
    params['is_fully_model'] = userData?.is_fully_model;
    APIService.getStripePlans(params)
      .then((response) => {
        if (response.data?.status) {
          let res = {};
          res['monthly'] = response.data?.data?.monthly;
          res['yearly'] = response.data?.data?.yearly;
          setPlanList(res);
        }
      });

    APIService.getPersonalizeDevAddonPlan()
      .then((response) => {
        if (response.data?.status) {
          setDevAddonPlanList(response.data?.data);
        }
      });
  }, []);

  const handlePlanChange = (id, dev_plan_id, name, amount, plan_type, product) => {
    setCouponCalculation('');
    setFormErrors([]);
    let params = {};
    params['price_id'] = id;
    params['dev_plan_id'] = dev_plan_id;
    params['price'] = amount;
    setTermsCondition(false);
    APIService.getDevPlanPrice(params)
      .then((response) => {
        if (response.data?.status) {
          setDevPlanPricePreview(response.data?.data);
          setSelectedPlan({ id: id, name: name, amount: amount, plan_type: plan_type, product: product });
        }
        else {
          setSelectedPlan('');
          setDevPlanPricePreview(response.data?.message);
        }
      });
  };

  const handleAddonPlanChange = (id, dev_plan_id, name, amount) => {
    let params = {};
    params['price_id'] = id;
    params['dev_plan_id'] = dev_plan_id;
    params['price'] = amount;
    setTermsConditionPersonalize(false);
    setSelectedPlanPersonalize({ id: id, name: name, amount: amount });
  };

  const handleUpgradeDowngradePlanClick = () => {
    setShowUpgradeDowngradePlan(true);
    setShowPersonalizeDevAddon(false);
  };

  const handlePersonalizeDevAddon = () => {
    setShowPersonalizeDevAddon(true);
    setShowUpgradeDowngradePlan(false);
  };

  const clearCouponCode = () => {
    setFormErrors([]);
    setCouponCalculation('');
    if (couponCalculation !== '') {
      couponCodeInput.current.value = '';
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
      params['amount'] = parseFloat(selectedPlan?.amount / 100);
      params['plan_product_id'] = selectedPlan?.product;
      APIService.verifyCoupon(params)
        .then((response) => {
          if (response.data?.data?.is_coupon) {
            setCouponCalculation(response.data?.data);
            setProcessApply(false);
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

  const handleDontCancel = () => {
    confirmAlert({
      title: 'Confirm',
      message: DONOT_CANCEL_SUBSCRIPTION,
      buttons: [
        {
          label: 'Confirm',
          className: 'btn btn-primary btn-lg',
          onClick: () => {
            let params = {};
            params["subscription_id"] = currentPlanDetails?.subscription_id;
            APIService.dontCancelSubscriptionPlan(params)
              .then((response) => {
                if (response.data?.status) {
                  toast.success(response.data?.message, {
                    position: toast.POSITION.TOP_RIGHT
                  });
                  setReloadPage(!reloadPage);
                  setShowUpgradeDowngradePlan(false);
                  setSelectedPlan('');
                  setDevPlanPricePreview('');
                  setTermsCondition(false);
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

  const handleCancelPersonalizeDevAddon = () => {
    confirmAlert({
      title: 'Confirm',
      message: CANCEl_PERSONALIZE_DEV_ADDON,
      buttons: [
        {
          label: 'Confirm',
          className: 'btn btn-primary btn-lg',
          onClick: () => {
            let params = {};
            params["price_plan"] = currentPlanDetails?.dev_addon_plan?.price_id;
            APIService.cancelPersonalizeDevAddon(params)
              .then((response) => {
                if (response.data?.status) {
                  toast.success(response.data?.message, {
                    position: toast.POSITION.TOP_RIGHT
                  });
                  setReloadPage(!reloadPage);
                  setShowPersonalizeDevAddon(false);
                  setSelectedPlanPersonalize('');
                  setTermsConditionPersonalize(false);
                  updateProfileRedux();
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

  const handleUpgradeDowngradePlanCancelClick = () => {
    setShowUpgradeDowngradePlan(false);
    setSelectedPlan('');
    setTermsCondition(false);
    setDevPlanPricePreview('');
  };

  const handlePersonalizeDevAddonCancelClick = () => {
    setShowPersonalizeDevAddon(false);
    setSelectedPlanPersonalize('');
    setTermsConditionPersonalize(false);
  };

  const confirmOrder = async () => {
    if (selectedPlan !== '') {
      setConfirmOrderProcess(true);
      let params = {};
      params['price_plan'] = selectedPlan?.id;
      //params['plan_name'] = selectedPlan?.name;
      params['plan'] = 'Development';
      params['plan_nick_name'] = currentPlanDetails?.dev_plan?.plan_name !== undefined ? currentPlanDetails?.dev_plan?.plan_name : '';
      params['dev_plan_id'] = currentPlanDetails?.dev_plan?.dev_plan_id !== undefined ? currentPlanDetails?.dev_plan?.dev_plan_id : '';
      params['new_plan_nick_name'] = selectedPlan?.name;
      if (couponCalculation !== '') {
        params['coupon_code'] = couponCodeInput.current?.value;
      }
      APIService.upgradeDowngradePlan(params)
        .then((response) => {
          setConfirmOrderProcess(false);
          if (response.data?.status) {
            toast.success(response.data?.message, {
              position: toast.POSITION.TOP_RIGHT
            });
            setReloadPage(!reloadPage);
            setShowUpgradeDowngradePlan(false);
            setSelectedPlan('');
            setDevPlanPricePreview('');
            setTermsCondition(false);
            updateProfileRedux();
          }
          else {
            toast.error(response.data?.message, {
              position: toast.POSITION.TOP_RIGHT
            });
          }
        });
    }
    else {
      toast.error(PLAN_VALIDATION, {
        position: toast.POSITION.TOP_RIGHT
      });
    }
  };

  const confirmOrderForAddon = async () => {
    if (selectedPlanPersonalize !== '') {
      setConfirmOrderProcess(true);
      let params = {};
      params['price_plan'] = selectedPlanPersonalize?.id;
      //params['plan_name'] = selectedPlan?.name;
      params['plan'] = 'Dev-personalized-addon';
      params['plan_name'] = selectedPlanPersonalize?.name;
      APIService.addDevAddonPlan(params)
        .then((response) => {
          setConfirmOrderProcess(false);
          if (response.data?.status) {
            toast.success(response.data?.message, {
              position: toast.POSITION.TOP_RIGHT
            });
            setReloadPage(!reloadPage);
            setShowPersonalizeDevAddon(false);
            setSelectedPlanPersonalize('');
            setTermsConditionPersonalize(false);
            updateProfileRedux();
          }
          else {
            toast.error(response.data?.message, {
              position: toast.POSITION.TOP_RIGHT
            });
          }
        });
    }
    else {
      toast.error(PLAN_VALIDATION, {
        position: toast.POSITION.TOP_RIGHT
      });
    }
  };

  const CustomUI = ({ onClose, plan_type }) => {
    const [formErrorsForCancel, setFormErrorsForCancel] = useState([]);
    const handleCancelSubscriptionSubmit = () => {
      if (cancelReason?.current?.value !== '') {
        let params = {};
        params["plan_type"] = plan_type;
        params["cancel_reason"] = cancelReason?.current?.value;
        params["plan"] = 'dev';
        APIService.cancelSubscriptionPlan(params)
          .then((response) => {
            if (response.data?.status) {
              toast.success(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
              setReloadPage(!reloadPage);
              setShowUpgradeDowngradePlan(false);
              setSelectedPlan('');
              setDevPlanPricePreview('');
              setTermsCondition(false);
              onClose();
            }
            else {
              toast.error(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
            }
          });
      }
      else {
        setFormErrorsForCancel({ cancelReasonInput: 'The cancel reason field is required.' })
      }
    };

    return (
      <div className="react-confirm-alert">
        <div className="react-confirm-alert-body">
          <h1>Confirm</h1>
          {plan_type === 'Monthly' ? CANCEL_MONTHLY_SUBSCRIPTION : CANCEL_YEARLY_SUBSCRIPTION}
          <Form.Group className="mb-5 mt-3 w-100 validation-required">
            <Form.Label className='float-start'>Cancel Reason</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Enter Cancel Reason" ref={cancelReason} className={`form-control ${formErrorsForCancel.cancelReasonInput && 'is-invalid'}`} />
            {formErrorsForCancel.cancelReasonInput && (
              <>
                <span className="text-danger mt-1 display-inline-block float-start">{formErrorsForCancel.cancelReasonInput}</span>
                <br />
              </>
            )}
          </Form.Group>
          <div className="react-confirm-alert-button-group">
            <button className="btn btn-primary btn-lg" label="Confirm" onClick={(e) => { handleCancelSubscriptionSubmit(); }}>Confirm</button>
            <button className="btn btn-outline-secondary btn-lg" label="No" onClick={onClose}>No</button>
          </div>
        </div>
      </div>
    );
  };

  const handleCancelSubscription = (plan_type) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return <CustomUI onClose={onClose} plan_type={plan_type} />
      }
    });
  }

  return (
    <>
      <div>
        <Sidebar />
        <div className="main-content">
          <Header pagename={name ? name : ''} />
          <div className="inner-content py-lg-8 px-lg-11 py-md-6 px-md-8 py-4 px-6">
            <div className="paln-page row">
              <div className="col-12 col-xl-3 mb-3">
                <SubscriptionLeftPanel userData={userData} activeMenu="manage-dev-plans" />
              </div>
              <div className="col-12 col-xl-9">
                <Card className="rounded-10 border border-gray-100 mb-4">
                  <Card.Body className="p-0">
                    <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                      <h3 className="card-header-title mb-0 my-md-2 ps-md-3 d-flex align-items-center">Manage Dev Plan </h3>

                      {currentPlanDetails?.cancel_at_period_end === 1 &&
                          <>
                            <span className={`badge badge-sm badge-danger font-weight-semibold ms-2 font-12`}>Cancel on {moment(new Date(currentPlanDetails?.cancel_at * 1000)).format(subscription_display_date_format)}</span>
                          </>
                      }
                    </div>
                  </Card.Body>
                  <Card.Body className="p-0 p-md-4">
                    <div className="pt-2 pt-md-4">
                      {process ?
                        <Spinner className='me-1' animation="border" variant="primary" />
                        :
                        currentPlanDetails?.dev_plan?.dev_plan_id !== undefined ?
                          <>
                            <div className="row mt-1 align-items-center">
                              <div className="col-md-4 col-xxl-4">
                                <span className="font-weight-semibold">Current Active Dev Plan</span>
                                <p className="font-weight-semibold m-0" id="upgrade-downgrade-plan"><b>{currentPlanDetails?.dev_plan?.plan_type} : </b> {currentPlanDetails?.dev_plan?.plan_name} - ${(currentPlanDetails?.dev_plan?.amount / 100).toFixed(2)}</p>
                                {currentPlanDetails?.dev_addon_plan?.price_id &&
                                  <p className="font-weight-semibold" id="upgrade-downgrade-plan"><b>Addon : </b> {currentPlanDetails?.dev_addon_plan?.plan_name} - ${(currentPlanDetails?.dev_addon_plan?.amount / 100).toFixed(2)}</p>
                                }
                              </div>
                              <div className="col-md-8 col-xxl-8 text-md-end mt-md-0 mt-3">
                                {currentPlanDetails?.cancel_at_period_end === 1 ?
                                  <>
                                    {!showUpgradeDowngradePlan &&
                                      <Button className="btn btn-lg btn-primary mt-2" size="md" onClick={handleDontCancel}>Don't Cancel</Button>
                                    }
                                  </>
                                  :
                                  currentPlanDetails?.schedule !== null ?
                                    <p className="font-weight-semibold">{CHANGE_REQUEST_SCHEDULED}</p>
                                    :
                                    <>
                                      {currentPlanDetails?.dev_plan?.plan_type === 'Monthly' ?
                                        currentPlanDetails?.care_value !== 1 ?
                                          <button className="btn btn-lg btn-outline-dark me-3 mt-2" onClick={() => { handleCancelSubscription(currentPlanDetails?.dev_plan?.plan_type) }}>Cancel Subscription</button>
                                          : <p className="font-weight-semibold">Contact Administrator <i className='icon-message' aria-hidden="true" title="Since you have both site addon plan and dev plan, you will need to contact us to cancel dev plan."></i></p>
                                        :
                                        currentPlanDetails?.status !== 'canceled' &&
                                        <button className="btn btn-lg btn-outline-dark me-3 mt-2" onClick={() => { handleCancelSubscription(currentPlanDetails?.dev_plan?.plan_type) }}>Request Cancellation</button>
                                      }
                                      {!showUpgradeDowngradePlan && currentPlanDetails?.status === 'active' &&
                                        <button className="btn btn-lg btn-primary mt-2 me-3" onClick={handleUpgradeDowngradePlanClick}>Upgrade/Downgrade Plan</button>
                                      }
                                      {!showPersonalizeDevAddon && userData?.environment !== 'production' &&
                                        <button className="btn btn-lg btn-primary mt-2" onClick={handlePersonalizeDevAddon}>Personalize Dev Addon</button>
                                      }
                                    </>
                                }
                              </div>
                            </div>
                          </> :
                          <>
                            <div className="row mt-1 align-items-center">
                              <div className="col-md-4 col-xxl-6">
                                <span className="font-weight-semibold">Current Active Dev Plan</span>
                                <p className="font-weight-semibold">{DONOT_HAVE_DEV_PLAN}</p>
                              </div>
                              {/* <div className="col-md-8 col-xxl-6 text-md-end mt-md-0 mt-3">
                                <button className="btn btn-lg btn-primary mt-2" onClick={handleUpgradeDowngradePlanClick}>Add Dev Plan</button>
                              </div> */}
                            </div>
                          </>
                      }
                    </div>
                  </Card.Body>
                </Card>
                {showUpgradeDowngradePlan &&
                  <Card className="rounded-10 border border-gray-100 mb-4">
                    <Card.Body className="p-0">
                      <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                        <h3 className="card-header-title mb-0 my-md-2 ps-md-3 d-flex align-items-center">Upgrade/Downgrade Plan</h3>
                        <button className="btn btn-white btn-icon rounded-pill ms-auto" onClick={handleUpgradeDowngradePlanCancelClick}>
                          <i className="icon-cancel"></i>
                        </button>
                      </div>
                    </Card.Body>
                    <Card.Body className="px-md-4 py-4">
                      <div className="px-md-3 py-md-3 pricing-template">
                        {userData?.is_fully_model === 0 &&
                        <div className="w-100 d-flex justify-content-center mt-4 mb-4 pb-1">
                          <ul className="nav nav-segment nav-pills mb-4 bg-lighter-light rounded-pill" role="tablist">
                            {currentPlanDetails?.dev_plan?.plan_type === 'Annual' ? 
                              <>
                                <li className="nav-item">
                                  <a className="nav-link" data-bs-toggle="pill" href="#pills-monthly" role="tab" aria-controls="pills-monthly" aria-selected="false">Monthly Dev Plan</a>
                                </li>

                                <li className="nav-item">
                                  <a className="nav-link active" data-bs-toggle="pill" href="#pills-yearly" role="tab" aria-controls="pills-yearly" aria-selected="false">Annual Dev Plan</a>
                                </li>                               
                              </>
                              :
                              <>
                                <li className="nav-item">
                                  <a className="nav-link active" data-bs-toggle="pill" href="#pills-monthly" role="tab" aria-controls="pills-monthly" aria-selected="true">Monthly Dev Plan</a>
                                </li>                                
                              </>
                            }
                          </ul>
                        </div>
                        }
                        <Form onSubmit={async e => { e.preventDefault(); await confirmOrder() }}>
                          <div className="tab-content">
                            {/* {currentPlanDetails?.dev_plan?.plan_type !== 'Annual' && */}
                              <div className={`tab-pane fade ${currentPlanDetails?.dev_plan?.plan_type !== 'Annual' && 'show active'}`} id="pills-monthly" role="tabpanel">
                                {/* <p className="text-center mb-7">Save big by selecting our Annual Plan (paid monthly)</p> */}
                                <div className="row justify-content-center">
                                  {planList.monthly?.map((monthly_plan, index) => (
                                    <div className="col-md-4" key={index}>
                                      {currentPlanDetails?.dev_plan?.price_id === monthly_plan.id ?
                                        <div className="plan-card">
                                          <input className="form-check-input visually-hidden" type="radio" name="activeplan" value={monthly_plan.id} id={monthly_plan.id} checked={true} onChange={() => { }} />
                                          <label className="form-check-label bg-light border border-gray-100 shadow-dark-80 rounded-10 p-4 px-xl-4 mb-4 d-block" htmlFor={monthly_plan.id}>
                                            <div className="px-0 px-xxl-3 py-0 py-xxl-2">
                                              <h4 className="font-weight-medium mb-0 pt-md-3">{monthly_plan.nickname}</h4>
                                              <h3 className="d-flex align-items-center">$<span className="monthly">{(monthly_plan.amount / 100).toFixed(2)}</span></h3>
                                              <div className="mt-4 mb-2 pt-2 d-grid">
                                                <div className="btn btn-lg btn-primary disabled px-lg-2">Active 
                                                {/* <svg className="ms-1" data-name="icons/tabler/chevron right" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16">
                                                  <rect data-name="Icons/Tabler/Chevron Right background" width="16" height="16" fill="none"></rect>
                                                  <path d="M.26.26A.889.889,0,0,1,1.418.174l.1.086L8.629,7.371a.889.889,0,0,1,.086,1.157l-.086.1L1.517,15.74A.889.889,0,0,1,.174,14.582l.086-.1L6.743,8,.26,1.517A.889.889,0,0,1,.174.36Z" transform="translate(4)" fill="#0D6EFD"></path>
                                                </svg> */}
                                                </div>
                                              </div>
                                            </div>
                                          </label>
                                        </div>
                                        :
                                        <div className="plan-card">
                                          <input className="form-check-input visually-hidden" type="radio" name="selectplan" value={monthly_plan.id} id={monthly_plan.id} onChange={(e) => { handlePlanChange(monthly_plan.id, currentPlanDetails?.dev_plan?.dev_plan_id, monthly_plan.nickname, monthly_plan.amount, 'monthly', monthly_plan.product) }} />
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
                                      }
                                    </div>
                                  ))}
                                </div>
                              </div>
                            {/* } */}
                            <div className={`tab-pane fade ${currentPlanDetails?.dev_plan?.plan_type === 'Annual' && 'show active'}`} id="pills-yearly" role="tabpanel">
                              <p className="text-center mb-7">You are saving big by commiting to use our service for one year. You will be billed monthly.<br />If you cancel subscription before 12 months, you will be charged 30% on your used months in the annual contract.</p>
                              <div className="row justify-content-center">
                                {planList.yearly?.map((yearly_plan, index) => (
                                  <div className="col-md-4" key={index}>
                                    {currentPlanDetails?.dev_plan?.price_id === yearly_plan.id ?
                                      <div className="plan-card">
                                        <input className="form-check-input visually-hidden" type="radio" name="activeplan" value={yearly_plan.id} id={yearly_plan.id} checked={true} onChange={() => { }} />
                                        <label className="form-check-label bg-light border border-gray-100 shadow-dark-80 rounded-10 p-4 px-xl-4 mb-4 d-block" htmlFor={yearly_plan.id}>
                                          <div className="px-0 px-xxl-3 py-0 py-xxl-2">
                                            <h4 className="font-weight-medium mb-0 pt-md-3">{yearly_plan.nickname}</h4>
                                            <h3 className="d-flex align-items-center">$<span className="monthly">{(yearly_plan.amount / 100).toFixed(2)}</span></h3>
                                            <div className="mt-4 mb-2 pt-2 d-grid">
                                              <div className="btn btn-lg btn-soft-primary px-lg-2">Active <svg className="ms-1" data-name="icons/tabler/chevron right" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16">
                                                <rect data-name="Icons/Tabler/Chevron Right background" width="16" height="16" fill="none"></rect>
                                                <path d="M.26.26A.889.889,0,0,1,1.418.174l.1.086L8.629,7.371a.889.889,0,0,1,.086,1.157l-.086.1L1.517,15.74A.889.889,0,0,1,.174,14.582l.086-.1L6.743,8,.26,1.517A.889.889,0,0,1,.174.36Z" transform="translate(4)" fill="#0D6EFD"></path>
                                              </svg>
                                              </div>
                                            </div>
                                          </div>
                                        </label>
                                      </div>
                                      :
                                      <div className="plan-card">
                                        <input className="form-check-input visually-hidden" type="radio" name="selectplan" value={yearly_plan.id} id={yearly_plan.id} onChange={(e) => { handlePlanChange(yearly_plan.id, currentPlanDetails?.dev_plan?.dev_plan_id, yearly_plan.nickname, yearly_plan.amount, 'yearly', yearly_plan.product) }} />
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
                                    }
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          {selectedPlan !== '' ?
                            <div className="select-plan-confirmation text-center mt-4">
                              {currentPlanDetails?.subscription_id === undefined || currentPlanDetails?.subscription_id === null ?
                                <Row className="align-items-center justify-content-center">
                                  <Col xs={12} xl={4}>
                                    <div className="input-group input-group-lg mb-3">
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
                                      <span className="text-danger d-inline-block">{formErrors.couponInput}</span>
                                    )}
                                    {couponCalculation !== '' && (
                                      <span className="text-success d-inline-block">Coupon Code Applied Successfully</span>
                                    )}
                                  </Col>
                                </Row>
                                : ''
                              }
                              <div className="form-check form-check-sm d-inline-block mt-4">
                                <input className="form-check-input mt-1" type="checkbox" id="flexCheckChecked2" value={1} checked={termsCondition} onChange={(e) => { setTermsCondition(e.target.checked) }} />
                                <label className="form-check-label text-small" htmlFor="flexCheckChecked2">I have read and agree to UnlimitedWP's <a href="https://unlimitedwp.com/unlimitedwp-service-agreement/" target="_blank" rel="noreferrer">Service Agreement.</a></label>
                              </div>
                              {devPlanPricePreview !== '' &&
                                <p className="mb-6">You will be charged &nbsp;
                                  {couponCalculation?.paid_amount ?
                                    <>${couponCalculation.paid_amount.toFixed(2)}</>
                                    :
                                    <>${(devPlanPricePreview?.new_today_amount).toFixed(2)}</>
                                  } now and next upcoming invoice will be ${(devPlanPricePreview?.next_bill_amount).toFixed(2)}</p>
                              }
                              <Button variant="primary" size="lg" type="submit" disabled={!termsCondition}>
                                {
                                  !confirmOrderProcess && 'Confirm Order'
                                }
                                {
                                  confirmOrderProcess && <><Spinner size="sm" animation="border" className="me-1" />Confirm Order</>
                                }
                              </Button>
                            </div>
                            :
                            <p className="mt-5 mb-6 text-danger text-center">{devPlanPricePreview}</p>
                          }
                        </Form>
                      </div>
                    </Card.Body>
                  </Card>
                }
                {showPersonalizeDevAddon &&
                  <Card className="rounded-10 border border-gray-100 mb-4">
                    <Card.Body className="p-0">
                      <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                        <h3 className="card-header-title mb-0 my-md-2 ps-md-3 d-flex align-items-center">Personalize Dev Addon</h3>
                        {currentPlanDetails?.dev_addon_plan?.price_id &&
                          <Button variant="outline-danger" size="sm" className="ms-3 mt-1" onClick={handleCancelPersonalizeDevAddon}>Cancel Personalize Dev Addon</Button>
                        }
                        <button className="btn btn-white btn-icon rounded-pill ms-auto" onClick={handlePersonalizeDevAddonCancelClick}>
                          <i className="icon-cancel"></i>
                        </button>
                      </div>
                    </Card.Body>
                    <Card.Body className="px-md-4 py-4">
                      <div className="px-md-3 py-md-3 pricing-template">
                        <Form onSubmit={async e => { e.preventDefault(); await confirmOrderForAddon() }}>
                          <div className="tab-content">
                            <div className="row justify-content-center">
                              {devAddonPlanList.length > 0 && devAddonPlanList.map((plan, index) => (
                                <div className="col-md-4" key={index}>
                                  {currentPlanDetails?.dev_addon_plan?.price_id === plan.id ?
                                    <div className="plan-card">
                                      <input className="form-check-input visually-hidden" type="radio" name="activeplan" value={plan.id} id={plan.id} checked={true} onChange={() => { }} />
                                      <label className="form-check-label bg-light border border-gray-100 shadow-dark-80 rounded-10 p-4 px-xl-4 mb-4 d-block" htmlFor={plan.id}>
                                        <div className="px-0 px-xxl-3 py-0 py-xxl-2">
                                          <h4 className="font-weight-medium mb-0 pt-md-3">{plan.nickname}</h4>
                                          <h3 className="d-flex align-items-center">$<span className="monthly">{(plan.amount / 100).toFixed(2)} / {plan.interval}</span></h3>
                                          <div className="mt-4 mb-2 pt-2 d-grid">
                                            <div className="btn btn-lg btn-soft-primary px-lg-2">Active <svg className="ms-1" data-name="icons/tabler/chevron right" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16">
                                              <rect data-name="Icons/Tabler/Chevron Right background" width="16" height="16" fill="none"></rect>
                                              <path d="M.26.26A.889.889,0,0,1,1.418.174l.1.086L8.629,7.371a.889.889,0,0,1,.086,1.157l-.086.1L1.517,15.74A.889.889,0,0,1,.174,14.582l.086-.1L6.743,8,.26,1.517A.889.889,0,0,1,.174.36Z" transform="translate(4)" fill="#0D6EFD"></path>
                                            </svg>
                                            </div>
                                          </div>
                                        </div>
                                      </label>
                                    </div>
                                    :
                                    <div className="plan-card">
                                      <input className="form-check-input visually-hidden" type="radio" name="selectplan" value={plan.id} id={plan.id} onChange={(e) => { handleAddonPlanChange(plan.id, currentPlanDetails?.dev_plan?.dev_plan_id, plan.nickname, plan.amount) }} />
                                      <label className="form-check-label border border-gray-100 shadow-dark-80 rounded-10 p-4 px-xl-4 mb-4 d-block" htmlFor={plan.id}>
                                        <div className="px-0 px-xxl-3 py-0 py-xxl-2">
                                          <h4 className="font-weight-medium mb-0 pt-md-3">{plan.nickname}</h4>
                                          <h3 className="d-flex align-items-center">$<span className="monthly">{(plan.amount / 100).toFixed(2)} / {plan.interval}</span></h3>
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
                                  }
                                </div>
                              ))}
                            </div>
                          </div>
                          {selectedPlanPersonalize !== '' &&
                            <div className="select-plan-confirmation text-center mt-4">
                              <div className="form-check form-check-sm d-inline-block mt-4">
                                <input className="form-check-input mt-1" type="checkbox" id="flexCheckChecked2" value={1} checked={termsConditionPersonalize} onChange={(e) => { setTermsConditionPersonalize(e.target.checked) }} />
                                <label className="form-check-label text-small" htmlFor="flexCheckChecked2">I have read and agree to UnlimitedWP's <a href="https://unlimitedwp.com/unlimitedwp-service-agreement/" target="_blank" rel="noreferrer">Service Agreement.</a></label>
                              </div>
                              <br />
                              <Button variant="primary" size="lg" type="submit" disabled={!termsConditionPersonalize}>
                                {
                                  !confirmOrderProcess && 'Confirm Order'
                                }
                                {
                                  confirmOrderProcess && <><Spinner size="sm" animation="border" className="me-1" />Confirm Order</>
                                }
                              </Button>
                            </div>
                          }
                        </Form>
                      </div>
                    </Card.Body>
                  </Card>
                }
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
  userData: state.Auth.user
})

export default connect(mapStateToProps)(ManageDevPlans)