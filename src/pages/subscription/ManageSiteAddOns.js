import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Table, Button, Modal, Spinner, Form } from 'react-bootstrap';
import SubscriptionLeftPanel from './SubscriptionLeftPanel';
import { CheckLg } from 'react-bootstrap-icons';
import { Dash } from 'react-bootstrap-icons';
import APIService from "../../api/APIService";
import { Link } from "react-router-dom";
import { confirmAlert } from 'react-confirm-alert';
import { toast } from 'react-toastify';
import { REMOVE_ADDONS } from '../../modules/lang/Subscription';
import { validateForm } from "../../utils/validator.js"
import { AddSiteURLValidator } from "../../modules/validation/SubscriptionValidator";
import { decryptToken } from "../../utils/functions.js";
import Store from "../../store";
import { saveUserObject } from "../../store/reducers/Auth";
import { connect } from "react-redux";

function ManageSiteAddOns({ name, userData }) {
    const getPermission = localStorage.getItem('syndrome-swain-next');
    const [process, setProcess] = useState(true);
    const [reloadPage, setReloadPage] = useState(false);
    const [siteAddOnsList, setSiteAddOnsList] = useState([]);
    const [siteAddOnsListForUpdate, setSiteAddOnsListForUpdate] = useState([]);
    const [updateSiteAddOnsError, setUpdateSiteAddOnsError] = useState('');
    const [addSiteAddOnsError, setAddSiteAddOnsError] = useState('');
    const [siteAddOnsPlanList, setSiteAddOnsPlanList] = useState([]);
    const [siteAddOnsshow, setSiteAddOnsShow] = useState(false);
    const [updateSiteAddOnsshow, setUpdateSiteAddOnsshow] = useState(false);
    const [siteId, setSiteId] = useState(0);
    const [addSiteURLShow, setAddSiteURLShow] = useState(false);
    const [processSaveSiteURL, setProcessSaveSiteURL] = useState(false);
    const [siteURLInput, setSiteURLInput] = useState('https://');
    const SiteAddOnsModalClose = () => {
        clearAndClosePurchaseModal();
    }
    const updateSiteAddOnsModalClose = () => {
        clearAndCloseUpdatePurchaseModal();
    }
    const SiteAddOnsModalShow = () => setSiteAddOnsShow(true);
    const [purchaseSiteAddOns, setPurchaseSiteAddOns] = useState([{ "site": "https://", "care": false, "growth": false, "optimize": false, "billingperiod": "monthly" }]);
    const [refreshForPurchaseSiteAddon, setRefreshForPurchaseSiteAddon] = useState(false);
    const [processApply, setProcessApply] = useState(false);
    let couponCodeInput = useRef();
    const [siteAddOnsCalculation, setSiteAddOnsCalculation] = useState('');
    const [processConfirmOrder, setProcessConfirmOrder] = useState(false);
    const [termsCondition, setTermsCondition] = useState(false);
    const [formErrors, setFormErrors] = useState([]);

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
        APIService.getSiteAddOns()
            .then((response) => {
                setProcess(false);
                if (response.data?.status) {
                    setSiteAddOnsList(response.data?.data);
                }
            });
    }, [reloadPage]);

    useEffect(() => {
        let params = {};
        APIService.getSiteAddOnsList(params)
            .then((response) => {
                if (response.data?.status) {
                    setSiteAddOnsPlanList(response.data?.data);
                }
            });
    }, []);

    useEffect(() => {

    }, [refreshForPurchaseSiteAddon]);

    const handleDeleteSiteAddOns = (id) => {
        confirmAlert({
            title: 'Confirm',
            message: REMOVE_ADDONS,
            buttons: [
                {
                    label: 'Yes',
                    className: 'btn btn-primary btn-lg',
                    onClick: () => {
                        let params = {};
                        params["site_id"] = id;
                        APIService.removeSiteAddons(params)
                            .then((response) => {
                                if (response.data?.status) {
                                    toast.success(response.data?.message, {
                                        position: toast.POSITION.TOP_RIGHT
                                    });
                                    setReloadPage(!reloadPage);
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

    const updatePurchaseSiteAddOnsValue = (index, e, key) => {
        let newpurchaseSiteAddOns = purchaseSiteAddOns;
        newpurchaseSiteAddOns[index][key] = key === 'site' ? e.target.value : e.target.checked;
        setPurchaseSiteAddOns(newpurchaseSiteAddOns);
        setRefreshForPurchaseSiteAddon(!refreshForPurchaseSiteAddon);
        setSiteAddOnsCalculation('');
        setAddSiteAddOnsError('');
    };

    const updateSiteAddOnsValueForUpdate = (index, e, key) => {
        let newSiteAddOnsListForUpdate = siteAddOnsListForUpdate;
        newSiteAddOnsListForUpdate[index][key] = e.target.checked;
        setSiteAddOnsListForUpdate(newSiteAddOnsListForUpdate);
        setUpdateSiteAddOnsError('');
        setSiteAddOnsCalculation('');
        setRefreshForPurchaseSiteAddon(!refreshForPurchaseSiteAddon);
    };

    const handleAddMorePurchaseRow = () => {
        setPurchaseSiteAddOns([...purchaseSiteAddOns, { "site": "https://", "care": false, "growth": false, "optimize": false, "billingperiod": "monthly" }]);
        setSiteAddOnsCalculation('');
    };

    const handleDeletePurchaseRow = (index) => {
        var array_purchaseSiteAddOns = [...purchaseSiteAddOns];
        array_purchaseSiteAddOns.splice(index, 1);
        setPurchaseSiteAddOns(array_purchaseSiteAddOns);
        setSiteAddOnsCalculation('');
    };

    const handleAddSiteURL = (site_id) => {
        setSiteId(site_id);
        setAddSiteURLShow(true);
    };

    const addSiteURLModalClose = () => {
        setSiteId(0);
        setSiteURLInput('https://');
        setAddSiteURLShow(false);
    };

    const clearCouponCode = () => {
        setSiteAddOnsCalculation('');
        if (siteAddOnsCalculation !== '') {
            couponCodeInput.current.value = '';
        }
    };

    const updateSiteAddOnsTotal = async () => {
        setSiteAddOnsCalculation('');
        setProcessApply(true);
        let params = {};
        params['site_data'] = purchaseSiteAddOns;
        params['coupon_code'] = couponCodeInput.current?.value;
        let validation = true;
        purchaseSiteAddOns?.map((update_site) => {
            if (!update_site.care && !update_site.growth && !update_site.optimize) {
                validation = false;
            }
            return '';
        });
        if (validation) {
            APIService.updateSiteAddOnsTotal(params)
                .then((response) => {
                    if (response.data?.status) {
                        setSiteAddOnsCalculation(response.data?.data);
                        setProcessApply(false);
                    }
                    else {
                        setProcessApply(false);
                        setSiteAddOnsCalculation('');
                    }
                });
        }
        else {
            setProcessApply(false);
            setAddSiteAddOnsError('Please select at least 1 plan for each website.');
        }
    }

    const updateSiteAddOnsTotalForUpdate = async () => {
        setSiteAddOnsCalculation('');
        setProcessApply(true);
        let validation = true;
        if (JSON.stringify(siteAddOnsList?.all_sites_monthly_data) !== JSON.stringify(siteAddOnsListForUpdate)) {
            siteAddOnsListForUpdate?.map((update_site) => {
                if (!update_site.care && !update_site.growth && !update_site.optimize) {
                    validation = false;
                }
                return '';
            });
            if (validation) {
                let params = {};
                params['site_data'] = siteAddOnsListForUpdate;
                APIService.updateSiteAddOnsTotalForUpdate(params)
                    .then((response) => {
                        if (response.data?.status) {
                            setSiteAddOnsCalculation(response.data?.data);
                            setProcessApply(false);
                        }
                        else {
                            setProcessApply(false);
                            setSiteAddOnsCalculation('');
                            setUpdateSiteAddOnsError(response.data?.message);
                        }
                    });
            }
            else {
                setProcessApply(false);
                setUpdateSiteAddOnsError('Please select at least 1 plan for each website.');
            }
        }
        else {
            setProcessApply(false);
            setUpdateSiteAddOnsError('No changes made to subscription!');
        }
    }

    const addSiteAddOns = async () => {
        setProcessConfirmOrder(true);
        let params = {};
        params['site_data'] = purchaseSiteAddOns;
        params['coupon_code'] = siteAddOnsCalculation?.coupon_status === 1 ? couponCodeInput.current?.value : '';

        APIService.addSiteAddons(params)
            .then((response) => {
                if (response.data?.status) {
                    setProcessConfirmOrder(false);
                    clearAndClosePurchaseModal();
                    toast.success(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                    setReloadPage(!reloadPage);
                    updateProfileRedux();
                }
                else {
                    setProcessConfirmOrder(false);
                    toast.error(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            });
    }

    const updateSiteAddOns = async () => {
        setProcessConfirmOrder(true);
        let params = {};
        params['site_data'] = siteAddOnsListForUpdate;

        APIService.updateSiteAddons(params)
            .then((response) => {
                if (response.data?.status) {
                    setProcessConfirmOrder(false);
                    clearAndCloseUpdatePurchaseModal();
                    toast.success(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                    setReloadPage(!reloadPage);
                    updateProfileRedux();
                }
                else {
                    setProcessConfirmOrder(false);
                    toast.error(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            });
    }

    const updateSiteURL = async () => {
        setProcessSaveSiteURL(true);
        let validate = validateForm((AddSiteURLValidator(siteURLInput)));
        if (Object.keys(validate).length) {
            setFormErrors(validate);
            setProcessSaveSiteURL(false);
        }
        else {
            let params = {};
            params['site_id'] = siteId;
            params['site'] = siteURLInput;
            APIService.addSiteURL(params)
                .then((response) => {
                    if (response.data?.status) {
                        setProcessSaveSiteURL(false);
                        clearAndCloseUpdatePurchaseModal();
                        toast.success(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        addSiteURLModalClose();
                        setReloadPage(!reloadPage);
                    }
                    else {
                        setProcessSaveSiteURL(false);
                        toast.error(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                });
        }
    }

    const clearAndClosePurchaseModal = () => {
        setTermsCondition(false);
        setSiteAddOnsShow(false);
        setPurchaseSiteAddOns([{ "site": "https://", "care": false, "growth": false, "optimize": false, "billingperiod": "monthly" }]);
        setSiteAddOnsCalculation('');
        setAddSiteAddOnsError('');
    }

    const clearAndCloseUpdatePurchaseModal = () => {
        setTermsCondition(false);
        setUpdateSiteAddOnsshow(false);
        setSiteAddOnsCalculation('');
        setUpdateSiteAddOnsError('');
    }

    const UpdateSiteAddOnsModalShow = () => {
        // Yes this is api call is extra but we need to this api call because we use two state in one api call is it conflict am update first state second state automatically update
        APIService.getSiteAddOns()
            .then((response) => {
                setProcess(false);
                if (response.data?.status) {
                    let allSiteAddon = response.data?.data?.all_sites_monthly_data;
                    const newArrayallSiteAddon = allSiteAddon.map(item => ({
                        ...item,
                        display: true
                    }));
                    setSiteAddOnsListForUpdate(newArrayallSiteAddon);
                    //setSiteAddOnsListForUpdate(response.data?.data?.all_sites_monthly_data);
                    setUpdateSiteAddOnsshow(true);
                }
            });
    }

    const UpdateSiteAddOnsSingleModalShow = (id) => {
        APIService.getSiteAddOns()
            .then((response) => {
                setProcess(false);
                if (response.data?.status) {
                    let allSiteAddon = response.data?.data?.all_sites_monthly_data;
                    const newArrayallSiteAddon = allSiteAddon.map(item => ({
                        ...item,
                        display: item.id === id ? true : false
                    }));
                    setSiteAddOnsListForUpdate(newArrayallSiteAddon);
                    setUpdateSiteAddOnsshow(true);
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
                                <SubscriptionLeftPanel userData={userData} activeMenu="manage-site-add-ons" />
                            </div>
                            <div className="col-12 col-xl-9">
                                <Card className="rounded-10 border border-gray-100 mb-4">
                                    <Card.Body className="p-0">
                                        <div className="d-md-flex flex-wrap align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100 justify-content-between">
                                            <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Manage Site Add-ons Monthly </h3>
                                            <div className="d-flex mt-md-0 mt-3 flex-md-row flex-column align-items-start">
                                                {!process &&
                                                    <>
                                                        {siteAddOnsList?.schedule === null && siteAddOnsList?.cancel_at_period_end !== 1 ?
                                                            <>
                                                                {((getPermission && getPermission === "true") || (userData && userData?.role_code === "agency_owner")) &&
                                                                    <>
                                                                        <Button variant="primary" size="md" className="me-2 mb-md-0 mb-2" onClick={SiteAddOnsModalShow}>Purchase Site Add-ons</Button>
                                                                        {siteAddOnsList?.all_sites_monthly_data.length > 0 &&
                                                                            <Button variant="primary" size="md" onClick={UpdateSiteAddOnsModalShow}>Update Site Add-ons</Button>
                                                                        }
                                                                    </>
                                                                }
                                                            </>
                                                            :
                                                            <p className="font-weight-semibold">Please remove cancellation request from <Link to="/plans/manage-dev-plans">here</Link> in order to Purchase or Update site add-ons.</p>
                                                        }
                                                    </>
                                                }
                                            </div>
                                        </div>
                                    </Card.Body>
                                    <Card.Body className="px-md-4 py-4">
                                        <div className="px-md-3 py-md-3">
                                            {process ?
                                                <Spinner className='me-1' animation="border" variant="primary" />
                                                :
                                                <Table className="table-borderless card-table table-nowrap " responsive>
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Site URL</th>
                                                            <th className="text-center">Care</th>
                                                            <th className="text-center">Growth</th>
                                                            <th className="text-center">Optimize</th>
                                                            <th className="text-center">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {siteAddOnsList?.all_sites_monthly_data.length > 0 ?
                                                            siteAddOnsList?.all_sites_monthly_data?.map((site, index) => (
                                                                <tr key={index}>
                                                                    <td>{index + 1}</td>
                                                                    <td>
                                                                        {site?.site !== '' ?
                                                                            <a href={site.site} target="_blank" rel="noreferrer">{site.site}</a>
                                                                            :
                                                                            <Button variant="primary" size="sm" onClick={() => handleAddSiteURL(site?.id)}>Add Site URL</Button>
                                                                        }
                                                                    </td>
                                                                    <td className="text-center">{site.care ? <CheckLg /> : <Dash />}</td>
                                                                    <td className="text-center">{site.growth ? <CheckLg /> : <Dash />}</td>
                                                                    <td className="text-center">{site.optimize ? <CheckLg /> : <Dash />}</td>
                                                                    {/* {site.plan === 'Care Addon' &&
                                                                        <>
                                                                            <td className="text-center"><CheckLg /></td>
                                                                            <td className="text-center">&#8212;</td>
                                                                            <td className="text-center">&#8212;</td>
                                                                        </>
                                                                    }
                                                                    {site.plan === 'Growth Addon' &&
                                                                        <>
                                                                            <td className="text-center">&#8212;</td>
                                                                            <td className="text-center"><CheckLg /></td>
                                                                            <td className="text-center">&#8212;</td>
                                                                        </>
                                                                    }
                                                                    {site.plan === 'Optimize Addon' &&
                                                                        <>
                                                                            <td className="text-center">&#8212;</td>
                                                                            <td className="text-center">&#8212;</td>
                                                                            <td className="text-center"><CheckLg /></td>
                                                                        </>
                                                                    }
                                                                    {site.plan === 'Care + Growth Addon' &&
                                                                        <>
                                                                            <td className="text-center"><CheckLg /></td>
                                                                            <td className="text-center"><CheckLg /></td>
                                                                            <td className="text-center">&#8212;</td>
                                                                        </>
                                                                    }
                                                                    {site.plan === 'Care + Optimize Addon' &&
                                                                        <>
                                                                            <td className="text-center"><CheckLg /></td>
                                                                            <td className="text-center">&#8212;</td>
                                                                            <td className="text-center"><CheckLg /></td>
                                                                        </>
                                                                    }
                                                                    {site.plan === 'Growth + Optimize Addon' &&
                                                                        <>
                                                                            <td className="text-center">&#8212;</td>
                                                                            <td className="text-center"><CheckLg /></td>
                                                                            <td className="text-center"><CheckLg /></td>
                                                                        </>
                                                                    }
                                                                    {site.plan === 'Care + Growth + Optimize Addon' &&
                                                                        <>
                                                                            <td className="text-center"><CheckLg /></td>
                                                                            <td className="text-center"><CheckLg /></td>
                                                                            <td className="text-center"><CheckLg /></td>
                                                                        </>
                                                                    }
                                                                    {site.plan === "null" &&
                                                                        <>
                                                                            <td className="text-center">&#8212;</td>
                                                                            <td className="text-center">&#8212;</td>
                                                                            <td className="text-center">&#8212;</td>
                                                                        </>
                                                                    } */}
                                                                    <td className="text-center">
                                                                        <div className='d-flex gap-2'>
                                                                            {siteAddOnsList?.schedule === null && siteAddOnsList?.cancel_at_period_end !== 1 && siteAddOnsList?.all_sites_monthly_data.length > 0 &&
                                                                                <button type="button" className="btn-icon circle-btn btn btn-soft-primary btn-sm" onClick={() => UpdateSiteAddOnsSingleModalShow(site.id)}>
                                                                                    <i className="icon-edit-icon"></i>
                                                                                </button>
                                                                            }
                                                                            <button type="button" className="btn-icon circle-btn btn btn-soft-danger btn-sm" onClick={() => handleDeleteSiteAddOns(site.id)}>
                                                                                <i className="icon-delete"></i>
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                            :
                                                            <tr>
                                                                <td colSpan={6} className="data-not-found"><p>Data not found</p></td>
                                                            </tr>
                                                        }
                                                    </tbody>
                                                </Table>
                                            }
                                        </div>
                                    </Card.Body>
                                </Card>
                                <Card className="rounded-10 border border-gray-100 mb-4">
                                    <Card.Body className="p-0">
                                        <div className="d-md-flex flex-wrap align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100 justify-content-between">
                                            <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Active Legacy Site Add-on</h3>
                                        </div>
                                    </Card.Body>
                                    <Card.Body className="px-md-4 py-4">
                                        <div className="px-md-3 py-md-3">
                                            {process ?
                                                <Spinner className='me-1' animation="border" variant="primary" />
                                                :
                                                <Table className="table-borderless card-table table-nowrap " responsive>
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Site URL</th>
                                                            <th className="text-center">Care (Maintenance)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {siteAddOnsList?.all_existing_sites.length > 0 ?
                                                            siteAddOnsList?.all_existing_sites?.map((site, index) => (
                                                                <tr key={index}>
                                                                    <td>{index + 1}</td>
                                                                    <td>
                                                                        {site.site !== '' ?
                                                                            <a href={site.site} target="_blank" rel="noreferrer">{site.site}</a>
                                                                            :
                                                                            <button type="button" className="btn-icon circle-btn btn btn-soft-danger btn-sm">
                                                                                Add Site URL
                                                                            </button>
                                                                        }
                                                                    </td>
                                                                    <td className="text-center"><CheckLg /></td>
                                                                </tr>
                                                            ))
                                                            :
                                                            <tr>
                                                                <td colSpan={6} className="data-not-found"><p>Data not found</p></td>
                                                            </tr>
                                                        }
                                                    </tbody>
                                                </Table>
                                            }
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                        </div>
                    </div>
                    <Modal className="purchase-site-add-ons-modal" size="xl" show={siteAddOnsshow} onHide={SiteAddOnsModalClose} centered>
                        <Modal.Header closeButton className="py-5 px-10">
                            <Modal.Title className="font-20 dark-1 mb-0">Purchase Site Add-ons</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="py-8 px-10">
                            <div className="row">
                                <div className="col-12 col-xl-8 mb-4">
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
                                                                    <input className="form-check-input m-0" type="checkbox" value="growth" disabled={(getPermission && getPermission === "true" ? false : true )} checked={purchase_site.growth} onChange={(e) => updatePurchaseSiteAddOnsValue(index, e, 'growth')} />
                                                                </div>
                                                            </td>
                                                            <td className="text-center">
                                                                <div className="form-check d-inline-block p-0 m-0">
                                                                    <input className="form-check-input m-0" type="checkbox" value="optimize" disabled={(getPermission && getPermission === "true" ? false : true )} checked={purchase_site.optimize} onChange={(e) => updatePurchaseSiteAddOnsValue(index, e, 'optimize')} />
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
                                    </div>
                                </div>
                                <div className="col-12 col-xl-4 mb-4">
                                    <div className="card rounded-10 border border-gray-100">
                                        <div className="card-body px-0">
                                            <div className="d-flex align-items-center border-bottom border-gray-200 pb-3 px-3 px-md-4">
                                                <h5 className="card-header-title mb-0 font-weight-semibold">Review Total</h5>
                                            </div>
                                            <div className="card-body-inner p-3 p-md-4">
                                                <div className="input-group input-group-lg mb-4">
                                                    <input type="text" className={`form-control ${siteAddOnsCalculation?.coupon_status === 0 && couponCodeInput?.current?.value !== '' && 'is-invalid'}`} placeholder="COUPON CODE" aria-label="COUPON CODE" aria-describedby="button-addon2" ref={couponCodeInput} />
                                                    {siteAddOnsCalculation?.coupon_status === 1 &&
                                                        <Button disabled={processApply} variant="" size="md" type="button" className='btn-clear-coupon' onClick={async e => { e.preventDefault(); await clearCouponCode() }}><i className="icon-cancel"></i></Button>
                                                    }
                                                    <Button disabled={processApply} variant="primary" size="lg" type="button" onClick={async e => { e.preventDefault(); await updateSiteAddOnsTotal() }} id="button-addon2">APPLY</Button>
                                                </div>
                                                {siteAddOnsCalculation?.coupon_status === 0 && couponCodeInput?.current?.value !== '' &&
                                                    <span className="text-danger">{siteAddOnsCalculation?.coupon_msg}</span>
                                                }
                                                {siteAddOnsCalculation?.coupon_status === 1 && couponCodeInput?.current?.value !== '' &&
                                                    <span className="text-success">{siteAddOnsCalculation?.coupon_msg}</span>
                                                }
                                                {siteAddOnsCalculation !== '' ?
                                                    <>
                                                        <div className="list-group list-group-flush">
                                                            <div className="list-group-item">
                                                                <div className="row px-3">
                                                                    <div className="col ps-0">
                                                                        <span className="mb-2 d-block text-gray-800">
                                                                            Order Total
                                                                        </span>
                                                                    </div>
                                                                    <div className="col-auto">
                                                                        <span className="mb-2 d-block text-gray-800">
                                                                            {siteAddOnsCalculation?.order_total > siteAddOnsCalculation?.sub_total &&
                                                                                <span className="original_price_strike">${(siteAddOnsCalculation?.order_total).toFixed(2)}</span>}
                                                                            <strong className="text-black-600">${(siteAddOnsCalculation?.sub_total).toFixed(2)}</strong>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="list-group-item">
                                                                <div className="row px-3">
                                                                    <div className="col ps-0">
                                                                        <span className="mb-2 d-block text-gray-800">
                                                                            Available Credit
                                                                        </span>
                                                                    </div>
                                                                    <div className="col-auto">
                                                                        <span className="mb-2 d-block text-gray-800">
                                                                            <strong className="text-black-600">${(siteAddOnsCalculation?.credit_amount).toFixed(2)}</strong>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="list-group-item">
                                                                <div className="row px-3">
                                                                    <div className="col ps-0">
                                                                        <span className="mb-2 d-block text-gray-800">
                                                                            Pay Now
                                                                        </span>
                                                                    </div>
                                                                    <div className="col-auto">
                                                                        <span className="mb-2 d-block text-gray-800">
                                                                            <strong className="text-black-600">${(siteAddOnsCalculation?.pay_now).toFixed(2)}</strong>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="form-check form-check-sm mt-md-3 d-flex">
                                                            <input className="form-check-input mt-1" type="checkbox" id="flexCheckChecked2" value={1} checked={termsCondition} onChange={(e) => { setTermsCondition(e.target.checked) }} />
                                                            <label className="form-check-label text-small" htmlFor="flexCheckChecked2">I have read and agree to UnlimitedWP's <a href="https://unlimitedwp.com/unlimitedwp-service-agreement/" target="_blank" rel="noreferrer">Service Agreement.</a></label>
                                                        </div>
                                                        <div className="d-flex align-items-center  mt-4 pt-1">
                                                            <Button disabled={processConfirmOrder || !termsCondition} variant='primary' size="lg" onClick={async e => { e.preventDefault(); await addSiteAddOns() }}>
                                                                {
                                                                    !processConfirmOrder && 'Confirm Order'
                                                                }
                                                                {
                                                                    processConfirmOrder && <><Spinner size="sm" animation="border" className="me-1" />Confirm Order</>
                                                                }
                                                            </Button>
                                                        </div>
                                                    </>
                                                    :
                                                    <>
                                                        {addSiteAddOnsError !== '' ?
                                                            <p className='text-danger'>{addSiteAddOnsError}</p>
                                                            :
                                                            processApply ?
                                                                <Spinner size="md" animation="border" className="mt-2" />
                                                                :
                                                                <Button disabled={processApply} variant="primary" size="md" type="button" onClick={async e => { e.preventDefault(); await updateSiteAddOnsTotal() }} className='mt-3'>Update Order Total</Button>
                                                        }
                                                    </>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-dark-11 p-4 p-md-5 mt-4 position-relative overflow-hidden rounded-12 mb-0 alert alert-dismissible zIndex-0" role="alert">
                                <div className="row mb-0 mb-sm-5 mb-md-0">
                                    <div className="col-12">
                                        <Link to="" className="btn btn-white btn-icon rounded-pill position-absolute top-16 end-16" data-bs-dismiss="alert" aria-label="Close">
                                            <svg data-name="icons/tabler/close" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 16 16">
                                                <rect data-name="Icons/Tabler/Close background" width="16" height="16" fill="none"></rect>
                                                <path d="M.82.1l.058.05L6,5.272,11.122.151A.514.514,0,0,1,11.9.82l-.05.058L6.728,6l5.122,5.122a.514.514,0,0,1-.67.777l-.058-.05L6,6.728.878,11.849A.514.514,0,0,1,.1,11.18l.05-.058L5.272,6,.151.878A.514.514,0,0,1,.75.057Z" transform="translate(2 2)" fill="#1E1E1E"></path>
                                            </svg>
                                        </Link>

                                        <p className="font-weight-normal mb-3"><strong>Note: </strong> You will not be able to cancel newly added sites for the first 26 days.</p>
                                        <p className="font-weight-normal mb-3">Bundle other add-ons for same site to <strong className="text-primary">GET 20% OFF</strong>.</p>
                                        <p className="font-weight-normal mb-0">After purchasing site add-on, create a task under "Site Add-on Tasks" and share us site credentials.</p>

                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                    </Modal>
                    <Modal className="purchase-site-add-ons-modal" size="xl" show={updateSiteAddOnsshow} onHide={updateSiteAddOnsModalClose} centered>
                        <Modal.Header closeButton className="py-5 px-10">
                            <Modal.Title className="font-20 dark-1 mb-0">Update Site Add-ons</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="py-8 px-10">
                            <div className="row">
                                <div className="col-12 col-xl-8 mb-4">
                                    <div className="">
                                        <div className="table-responsive mb-0">
                                            <table className="table card-table small-padding table-nowrap overflow-hidden">
                                                <thead className="text-center align-middle">
                                                    <tr>
                                                        <th>Site URL</th>
                                                        <th>Care <a className="href" href='https://unlimitedwp.com/care-plans/' target='_blank' rel="noreferrer"><i className="fa-solid fa-circle-info"></i></a> <br /><strong>${(siteAddOnsPlanList?.care?.amount / 100).toFixed(2)} / Month / Site</strong></th>
                                                        <th>Growth <a className="href" href='https://unlimitedwp.com/wordpress-seo-plan/' target='_blank' rel="noreferrer"><i className="fa-solid fa-circle-info"></i></a> <br /> <strong>${(siteAddOnsPlanList?.growth?.amount / 100).toFixed(2)} / Month / Site</strong></th>
                                                        <th>Optimize <a className="href" href='https://unlimitedwp.com/wordpress-optimize-plan/' target='_blank' rel="noreferrer"><i className="fa-solid fa-circle-info"></i></a> <br /> <strong>${(siteAddOnsPlanList?.optimize?.amount / 100).toFixed(2)} / Month / Site</strong></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="list border-top-0">
                                                    {siteAddOnsListForUpdate?.map((update_site, index) => (
                                                        <tr key={index}>
                                                            {update_site.display && update_site.display ?
                                                                <>
                                                                    <td>{update_site.site}</td>
                                                                    <td className="text-center">
                                                                        <div className="form-check d-inline-block p-0 m-0">
                                                                            <input className="form-check-input m-0" type="checkbox" value="care" checked={update_site.care} disabled={!update_site.care && true} onChange={(e) => updateSiteAddOnsValueForUpdate(index, e, 'care')} />
                                                                        </div>
                                                                    </td>
                                                                    <td className="text-center">
                                                                        <div className="form-check d-inline-block p-0 m-0">
                                                                            <input className="form-check-input m-0" type="checkbox" value="growth" checked={update_site.growth} disabled={!update_site.growth && true} onChange={(e) => updateSiteAddOnsValueForUpdate(index, e, 'growth')} />
                                                                        </div>
                                                                    </td>
                                                                    <td className="text-center">
                                                                        <div className="form-check d-inline-block p-0 m-0">
                                                                            <input className="form-check-input m-0" type="checkbox" value="optimize" checked={update_site.optimize} disabled={!update_site.optimize && true} onChange={(e) => updateSiteAddOnsValueForUpdate(index, e, 'optimize')} />
                                                                        </div>
                                                                    </td>
                                                                </>
                                                                :
                                                                <>
                                                                    <td>{update_site.site}</td>
                                                                    <td className="text-center">{update_site.care ? <CheckLg /> : <Dash />}</td>
                                                                    <td className="text-center">{update_site.growth ? <CheckLg /> : <Dash />}</td>
                                                                    <td className="text-center">{update_site.optimize ? <CheckLg /> : <Dash />}</td>
                                                                </>
                                                            }
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-xl-4 mb-4">
                                    <div className="card rounded-10 border border-gray-100">
                                        <div className="card-body px-0">
                                            <div className="d-flex align-items-center border-bottom border-gray-200 pb-3 px-3 px-md-4">
                                                <h5 className="card-header-title mb-0 font-weight-semibold">Review Total</h5>
                                            </div>
                                            <div className="card-body-inner p-3 p-md-4">
                                                {siteAddOnsCalculation !== '' ?
                                                    <>
                                                        <div className="list-group list-group-flush">
                                                            <div className="list-group-item">
                                                                <div className="row px-3">
                                                                    <div className="col ps-0">
                                                                        <span className="mb-2 d-block text-gray-800">
                                                                            Order Total
                                                                        </span>
                                                                    </div>
                                                                    <div className="col-auto">
                                                                        <span className="mb-2 d-block text-gray-800">
                                                                            {siteAddOnsCalculation?.order_total > siteAddOnsCalculation?.sub_total &&
                                                                                <span className="original_price_strike">${(siteAddOnsCalculation?.order_total).toFixed(2)}</span>
                                                                            }
                                                                            <strong className="text-black-600">${(siteAddOnsCalculation?.sub_total).toFixed(2)}</strong>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="list-group-item">
                                                                <div className="row px-3">
                                                                    <div className="col ps-0">
                                                                        <span className="mb-2 d-block text-gray-800">
                                                                            Available Credit
                                                                        </span>
                                                                    </div>
                                                                    <div className="col-auto">
                                                                        <span className="mb-2 d-block text-gray-800">
                                                                            <strong className="text-black-600">${(siteAddOnsCalculation?.credit_amount).toFixed(2)}</strong>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="list-group-item">
                                                                <div className="row px-3">
                                                                    <div className="col ps-0">
                                                                        <span className="mb-2 d-block text-gray-800">
                                                                            Pay Now
                                                                        </span>
                                                                    </div>
                                                                    <div className="col-auto">
                                                                        <span className="mb-2 d-block text-gray-800">
                                                                            <strong className="text-black-600">${(siteAddOnsCalculation?.pay_now).toFixed(2)}</strong>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="form-check form-check-sm mt-md-3 d-flex">
                                                            <input className="form-check-input mt-1" type="checkbox" id="flexCheckChecked2" value={1} checked={termsCondition} onChange={(e) => { setTermsCondition(e.target.checked) }} />
                                                            <label className="form-check-label text-small" htmlFor="flexCheckChecked2">I have read and agree to UnlimitedWP's <a href="https://unlimitedwp.com/unlimitedwp-service-agreement/" target="_blank" rel="noreferrer">Service Agreement.</a></label>
                                                        </div>
                                                        <div className="d-flex align-items-center  mt-4 pt-1">
                                                            <Button disabled={processConfirmOrder || !termsCondition} variant='primary' size="lg" onClick={async e => { e.preventDefault(); await updateSiteAddOns() }}>
                                                                {
                                                                    !processConfirmOrder && 'Confirm Order'
                                                                }
                                                                {
                                                                    processConfirmOrder && <><Spinner size="sm" animation="border" className="me-1" />Confirm Order</>
                                                                }
                                                            </Button>
                                                        </div>
                                                    </>
                                                    :
                                                    <>
                                                        {updateSiteAddOnsError !== '' ?
                                                            <p className='text-danger'>{updateSiteAddOnsError}</p>
                                                            :
                                                            processApply ?
                                                                <Spinner size="md" animation="border" className="mt-2" />
                                                                :
                                                                <Button disabled={processApply} variant="primary" size="md" type="button" onClick={async e => { e.preventDefault(); await updateSiteAddOnsTotalForUpdate() }} className='mt-3'>Update Order Total</Button>
                                                        }
                                                    </>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-dark-11 p-4 p-md-5 mt-4 position-relative overflow-hidden rounded-12 mb-0 alert alert-dismissible zIndex-0" role="alert">
                                <div className="row mb-0 mb-sm-5 mb-md-0">
                                    <div className="col-12">
                                        <Link to="" className="btn btn-white btn-icon rounded-pill position-absolute top-16 end-16" data-bs-dismiss="alert" aria-label="Close">
                                            <svg data-name="icons/tabler/close" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 16 16">
                                                <rect data-name="Icons/Tabler/Close background" width="16" height="16" fill="none"></rect>
                                                <path d="M.82.1l.058.05L6,5.272,11.122.151A.514.514,0,0,1,11.9.82l-.05.058L6.728,6l5.122,5.122a.514.514,0,0,1-.67.777l-.058-.05L6,6.728.878,11.849A.514.514,0,0,1,.1,11.18l.05-.058L5.272,6,.151.878A.514.514,0,0,1,.75.057Z" transform="translate(2 2)" fill="#1E1E1E"></path>
                                            </svg>
                                        </Link>
                                        <p className="font-weight-normal mb-3">Bundle other add-ons for same site to <strong className="text-primary">GET 20% OFF</strong>.</p>

                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                    </Modal>
                    <Modal className="purchase-site-add-ons-modal" size="sm" show={addSiteURLShow} onHide={addSiteURLModalClose} centered>
                        <Modal.Header closeButton className="py-5 px-10">
                            <Modal.Title className="font-20 dark-1 mb-0">Add Site URL</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="py-8 px-10">
                            <Form.Control type="text" placeholder="Site URl" value={siteURLInput} onChange={(e) => { setSiteURLInput(e.target.value) }} className={`${formErrors.siteURLInput && 'is-invalid'}`} />
                            {formErrors.siteURLInput && (
                                <span className="text-danger">{formErrors.siteURLInput}</span>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button disabled={processSaveSiteURL} variant='primary' size="md" onClick={async e => { e.preventDefault(); await updateSiteURL() }}>
                                {
                                    !processSaveSiteURL && 'Save'
                                }
                                {
                                    processSaveSiteURL && <><Spinner size="sm" animation="border" className="me-1" />Save</>
                                }
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    <Footer />
                </div>
            </div>
        </>
    );
}

const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(ManageSiteAddOns)