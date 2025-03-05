import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card } from 'react-bootstrap';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { capitalizeFirstWithRemoveUnderScore } from '../../utils/functions';
import { Link } from "react-router-dom";
import { EnvelopeFill } from 'react-bootstrap-icons';
import { STATUS_UPDATE_EMAIL_TEMPLATE, STATUS_UPDATE_EMAIL_TEMPLATE_ALL } from '../../modules/lang/EmailTemplate';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';

function EmailTemplate({ name, userData }) {
    const [emailTemplateList, setEmailTemplateList] = useState([]);
    const [reloadList, setReloadList] = useState(false);

    useEffect(() => {
        APIService.getEmailTemplateList()
            .then((response) => {
                if (response.data?.status) {
                    setEmailTemplateList(response.data?.data);
                }
            });
    }, [reloadList]);

    const handleEnableDisableTemplate = async (id, active) => {
        confirmAlert({
            title: 'Confirm',
            message: STATUS_UPDATE_EMAIL_TEMPLATE.replace("{status}", active === 1 ? 'enable' : 'disable'),
            buttons: [
                {
                    label: 'Yes',
                    className: 'btn btn-primary btn-lg',
                    onClick: () => {
                        const params = {};
                        params['disabled'] = active === 1 ? 0 : 1;
                        params['id'] = id;
                        APIService.enableDisableEmailTemplate(params)
                            .then((response) => {
                                if (response.data?.status) {
                                    toast.success(response.data?.message, {
                                        position: toast.POSITION.TOP_RIGHT
                                    });
                                    setReloadList(!reloadList);
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

    const handleEnableAllDisableAllTemplate = async (type, active) => {
        confirmAlert({
            title: 'Confirm',
            message: STATUS_UPDATE_EMAIL_TEMPLATE_ALL.replace("{status}", active === 1 ? `enable all ${type}` : `disable all ${type}`),
            buttons: [
                {
                    label: 'Yes',
                    className: 'btn btn-primary btn-lg',
                    onClick: () => {
                        const params = {};
                        params['disabled'] = active === 1 ? 0 : 1;
                        params['type'] = type;
                        APIService.enableDisableEmailTemplate(params)
                            .then((response) => {
                                if (response.data?.status) {
                                    toast.success(response.data?.message, {
                                        position: toast.POSITION.TOP_RIGHT
                                    });
                                    setReloadList(!reloadList);
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

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <Header pagename={name} />
                <div className="inner-content pt-0 pt-xl-7">
                    {emailTemplateList?.types?.map((emailTemplateName, index) => (
                        <Card className="rounded-10 border border-gray-100 mb-4 h-100" key={index}>
                            <Card.Body className="p-0">
                                <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                                    <h3 className="card-header-title mb-0 my-md-2 ps-md-3">{capitalizeFirstWithRemoveUnderScore(emailTemplateName)}</h3>
                                    <div className='ms-auto'>
                                        <span className={`btn btn-outline-secondary btn-sm cursor-pointer me-2`} onClick={() => { handleEnableAllDisableAllTemplate(emailTemplateName, 1) }}>Enable All</span>
                                        <span className={`btn btn-outline-secondary btn-sm cursor-pointer`} onClick={() => { handleEnableAllDisableAllTemplate(emailTemplateName, 0) }}>Disable All</span>
                                    </div>
                                </div>
                            </Card.Body>
                            <Card.Body className="px-md-4 py-4">
                                <div className="px-md-3 py-md-3">
                                    <div className="list-group list-group-flush">
                                        {emailTemplateList?.data[emailTemplateName].map((emailTemplate, index_temp) => (
                                            <div className="list-group-item py-lg-3 py-xl-4" key={`${index}-${index_temp}`}>
                                                <div className="row align-items-center">
                                                    <div className="col-auto">
                                                        <span className="avatar avatar-xs avatar-circle">
                                                            <span className="avatar-initials avatar-dark-light border-transprant"><EnvelopeFill /></span>
                                                        </span>
                                                    </div>
                                                    <div className="col ps-0">
                                                        <Link to={`/email-template/${emailTemplate?.id}`} className={`dark-1 ${emailTemplate?.active === 0 ? 'line-through' : ''}`}>{emailTemplate?.name}</Link>
                                                    </div>
                                                    <div className="col">
                                                        {emailTemplate?.active === 0 ?
                                                            <span className={`text-primary cursor-pointer float-end font-12`} onClick={() => { handleEnableDisableTemplate(emailTemplate?.id, 1) }}>Enable</span>
                                                            :
                                                            <span className={`text-primary cursor-pointer float-end font-12`} onClick={() => { handleEnableDisableTemplate(emailTemplate?.id, 0) }}>Disable</span>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
                <Footer />
            </div>
        </>
    );
}

const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(EmailTemplate)