import React, { useState, useEffect, useRef } from 'react';
import APIService from "../../api/APIService";
import { Button, Form, Row, Col, Card, Spinner } from 'react-bootstrap';
import StripeCardInput from './StripeCardInput';
import Select from 'react-select';
import { hearAboutUsList } from '../../settings';
import { validateForm } from "../../utils/validator.js";
import { SiteAddonRegisterValidator } from "../../modules/validation/RegisterValidator";
//import InputMask from "react-input-mask";
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation } from "react-router-dom";

export default function SiteAddonRegister() {
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
    //const [selectedPlan, setSelectedPlan] = useState('');
    const [countryOption, setCountryOption] = useState([]);
    const [stateOption, setStateOption] = useState([]);
    const [process, setProcess] = useState(false);
    const [processApply, setProcessApply] = useState(false);
    const [formErrors, setFormErrors] = useState([]);
    const [couponCalculation, setCouponCalculation] = useState('');
    const [termsCondition, setTermsCondition] = useState(false);
    const [siteAddOnsPlanList, setSiteAddOnsPlanList] = useState([]);
    const [purchaseSiteAddOns, setPurchaseSiteAddOns] = useState([{ "site": "https://", "care": false, "growth": false, "optimize": false, "billingperiod": "monthly" }]);
    const [refreshForPurchaseSiteAddon, setRefreshForPurchaseSiteAddon] = useState(false);
    const [affiliateData, setAffiliateData] = useState('');

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
        APIService.getCountry()
            .then((response) => {
                if (response.data?.status) {
                    setCountryOption(response.data?.data);
                }
            });

        APIService.getSiteAddOnsList()
            .then((response) => {
                if (response.data?.status) {
                    setSiteAddOnsPlanList(response.data?.data);
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

    const handleAddMorePurchaseRow = () => {
        setPurchaseSiteAddOns([...purchaseSiteAddOns, { "site": "https://", "care": false, "growth": false, "optimize": false, "billingperiod": "monthly" }]);
    };

    const handleDeletePurchaseRow = (index) => {
        var array_purchaseSiteAddOns = [...purchaseSiteAddOns];
        array_purchaseSiteAddOns.splice(index, 1);
        setPurchaseSiteAddOns(array_purchaseSiteAddOns);
        updateSiteAddOnsTotal(array_purchaseSiteAddOns);
    };

    const updatePurchaseSiteAddOnsValue = (index, e, key) => {
        let newpurchaseSiteAddOns = purchaseSiteAddOns;
        newpurchaseSiteAddOns[index][key] = key === 'site' ? e.target.value : e.target.checked;
        setPurchaseSiteAddOns(newpurchaseSiteAddOns);
        setRefreshForPurchaseSiteAddon(!refreshForPurchaseSiteAddon);
        setCouponCalculation('');
        if (key !== 'site') {
            updateSiteAddOnsTotal(newpurchaseSiteAddOns);
        }
    };

    const confirmOrder = async () => {
        setProcess(true);
        setFormErrors([]);
        let plan_validation = 'not required';
        purchaseSiteAddOns?.map((update_site) => {
            if (!update_site.care && !update_site.growth && !update_site.optimize) {
                plan_validation = '';
            }
            return '';
        });
        let validate = validateForm((SiteAddonRegisterValidator(plan_validation, emailInput.current?.value, passwordInput.current?.value, confirmPasswordInput.current?.value, firstNameInput.current?.value, lastNameInput.current?.value, companyNameInput.current?.value, streetAddressInput.current?.value, country, state, cityInput.current?.value, zipCodeInput.current?.value, phoneInput.current?.value, termsCondition ? 'not required' : '')));

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
                params['coupon_code'] = couponCalculation?.coupon_status === 1 ? couponCodeInput.current?.value : '';
                params['payment_method'] = result.paymentMethod.id;
                params['plan_name'] = 'monthly';
                params['plan'] = 'Site Addon';
                params['site_data'] = purchaseSiteAddOns;

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

                APIService.registerSiteAddons(params)
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
                                        /*toast.success(response.data?.message, {
                                            position: toast.POSITION.TOP_RIGHT
                                        });
                                        setTimeout(() => {
                                            window.location.reload(false);
                                        }, 2000);*/
                                        window.top.location.href = "https://unlimitedwp.com/thank-you-care-plan-purchase/";
                                    }
                                });
                            }
                            else {
                                /*toast.success(response.data?.message, {
                                    position: toast.POSITION.TOP_RIGHT
                                });
                                setTimeout(() => {
                                    window.location.reload(false);
                                }, 2000);*/
                                window.top.location.href = "https://unlimitedwp.com/thank-you-care-plan-purchase/";
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

    const updateSiteAddOnsTotal = async (site_data) => {
        setCouponCalculation('');
        setProcessApply(true);
        let params = {};
        params['site_data'] = site_data;
        params['coupon_code'] = couponCodeInput.current?.value;

        APIService.updateRegisterSiteAddOnsTotal(params)
            .then((response) => {
                if (response.data?.status) {
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
                }
            });
    }

    const clearCouponCode = () => {
        setFormErrors([]);
        setCouponCalculation('');
        if (couponCalculation !== '') {
            couponCodeInput.current.value = '';
        }
        if (affiliateData?.affiliate_type === "via Coupon") {
            setAffiliateData('');
        }
        updateSiteAddOnsTotal(purchaseSiteAddOns);
    };

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
                                        <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Site Add-ons</h3>
                                    </div>
                                </Card.Body>
                                <Card.Body className="px-md-4 py-4">
                                    <div className="px-md-3 py-md-3 pricing-template">
                                        <div className="row">
                                            <div className="col-12 col-xl-12 mb-4">
                                                <div className="">
                                                    <div className="table-responsive mb-0">
                                                        <table className="table card-table small-padding table-nowrap overflow-hidden">
                                                            <thead className="text-center align-middle">
                                                                <tr>
                                                                    <th>Site URL</th>
                                                                    <th>Care <a className="href" href='https://unlimitedwp.com/care-plans/' target='_blank' rel="noreferrer"><i className="fa-solid fa-circle-info"></i></a> <br /><strong>${(siteAddOnsPlanList?.care?.amount / 100).toFixed(2)} / Month / Site</strong></th>
                                                                    <th>Growth <a className="href" href='https://unlimitedwp.com/wordpress-seo-plan/' target='_blank' rel="noreferrer"><i className="fa-solid fa-circle-info"></i></a> <br /> <strong>${(siteAddOnsPlanList?.growth?.amount / 100).toFixed(2)} / Month / Site</strong></th>
                                                                    <th>Optimize <a className="href" href='https://unlimitedwp.com/wordpress-optimize-plan/' target='_blank' rel="noreferrer"><i className="fa-solid fa-circle-info"></i></a> <br /> <strong>${(siteAddOnsPlanList?.optimize?.amount / 100).toFixed(2)} / Month / Site</strong></th>
                                                                    <th>Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="list border-top-0">
                                                                {purchaseSiteAddOns?.map((purchase_site, index) => (
                                                                    <tr key={index}>
                                                                        <td><input type="text" className="form-control" value={purchase_site.site} onChange={(e) => updatePurchaseSiteAddOnsValue(index, e, 'site')} /></td>
                                                                        <td className="text-center">
                                                                            <div className="form-check d-inline-block p-0 m-0">
                                                                                <input className="form-check-input m-0" type="checkbox" value="care" checked={purchase_site.care} onChange={(e) => updatePurchaseSiteAddOnsValue(index, e, 'care')} />
                                                                            </div>
                                                                        </td>
                                                                        <td className="text-center">
                                                                            <div className="form-check d-inline-block p-0 m-0">
                                                                                <input className="form-check-input m-0" type="checkbox" value="growth" checked={purchase_site.growth} onChange={(e) => updatePurchaseSiteAddOnsValue(index, e, 'growth')} />
                                                                            </div>
                                                                        </td>
                                                                        <td className="text-center">
                                                                            <div className="form-check d-inline-block p-0 m-0">
                                                                                <input className="form-check-input m-0" type="checkbox" value="optimize" checked={purchase_site.optimize} onChange={(e) => updatePurchaseSiteAddOnsValue(index, e, 'optimize')} />
                                                                            </div>
                                                                        </td>
                                                                        <td className="text-center">
                                                                            {index > 0 &&
                                                                                <Button variant="default" size="md"><i className="icon-cancel font-24 text-danger" onClick={() => handleDeletePurchaseRow(index)}></i></Button>
                                                                            }
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                        <div className="d-flex align-items-center justify-content-end pt-3 border-top border-gray-200">
                                                            <Button variant="primary" size="md" onClick={handleAddMorePurchaseRow}>Add More</Button>
                                                        </div>
                                                    </div>
                                                    {formErrors.planInput && (
                                                        <span className="text-danger text-center">{formErrors.planInput}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
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
                                            <input type="text" className={`form-control ${couponCalculation?.coupon_status === 0 && couponCodeInput?.current?.value !== '' && 'is-invalid'}`} placeholder="COUPON CODE" aria-label="COUPON CODE" aria-describedby="button-addon2" ref={couponCodeInput} />
                                            {couponCalculation?.coupon_status === 1 &&
                                                <Button disabled={processApply} variant="" size="md" type="button" className='btn-clear-coupon' onClick={async e => { e.preventDefault(); await clearCouponCode() }}><i className="icon-cancel"></i></Button>
                                            }
                                            <Button disabled={processApply} variant="primary" size="lg" type="button" onClick={async e => { e.preventDefault(); await updateSiteAddOnsTotal(purchaseSiteAddOns) }} id="button-addon2">APPLY</Button>
                                        </div>
                                        {couponCalculation?.coupon_status === 0 && couponCodeInput?.current?.value !== '' &&
                                            <span className="text-danger">{couponCalculation?.coupon_msg}</span>
                                        }
                                        {couponCalculation?.coupon_status === 1 && couponCodeInput?.current?.value !== '' &&
                                            <span className="text-success">{couponCalculation?.coupon_msg}</span>
                                        }
                                        <div className="list-group list-group-flush">
                                            <div className="list-group-item">
                                                <div className="row px-3">
                                                    <div className="col ps-0">
                                                        <span className="mb-2 d-block text-gray-800">
                                                            Pay Now
                                                        </span>
                                                    </div>
                                                    <div className="col-auto">
                                                        <span className="mb-2 d-block text-gray-800">
                                                            {couponCalculation?.order_total > couponCalculation?.pay_now &&
                                                                <span className="original_price_strike">${couponCalculation?.order_total ? (couponCalculation?.order_total).toFixed(2) : '0.00'}</span>
                                                            }
                                                            <strong className="text-black-600">${couponCalculation?.pay_now ? (couponCalculation?.pay_now).toFixed(2) : '0.00'}</strong>
                                                        </span>
                                                    </div>
                                                </div>
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
                                                            <strong className="text-black-600">${couponCalculation?.pay_now ? couponCalculation.pay_now.toFixed(2) : '0.00'}</strong>
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
