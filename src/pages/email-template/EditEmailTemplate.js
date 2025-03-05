import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { Editor } from "@tinymce/tinymce-react";
import { useHistory, useParams } from "react-router-dom";
import { tinymceInit } from '../../settings';
import { capitalizeFirstWithRemoveUnderScore } from '../../utils/functions';
import { EmailTemplateValidator } from "../../modules/validation/EmailTemplateValidator";
import { validateForm } from "../../utils/validator.js";
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const REACT_APP_TINYMCE_APIKEY = process.env.REACT_APP_TINYMCE_APIKEY;

function EditEmailTemplate({ name, userData }) {
    let { id } = useParams();
    let history = useHistory();
    const [emailTemplateData, setEmailTemplateData] = useState([]);
    const [formErrors, setFormErrors] = useState([]);
    const [subject, setSubject] = useState('');
    const [fromName, setFromName] = useState('');
    const [disabledTemplate, setDisabledTemplate] = useState(false);
    const [saveProcess, setSaveProcess] = useState(false);

    const [htmlContent, setHtmlContent] = useState();
    const onEditorChange = (e) => {
        setHtmlContent(e);
    }

    useEffect(() => {
        APIService.getEmailTemplateForEdit(id)
            .then((response) => {
                if (response.data?.status) {
                    let data = response.data?.data;
                    setEmailTemplateData(data);
                    setSubject(data?.subject);
                    setFromName(data?.from_name);
                    setDisabledTemplate(data?.active === 1 ? false : true);
                    setHtmlContent(data?.message);
                }
            });
    }, [id]);

    const updateEmailTemplate = async () => {
        setSaveProcess(true);
        setFormErrors([]);
        let validate = validateForm((EmailTemplateValidator(subject, htmlContent)));
        if (Object.keys(validate).length) {
            setSaveProcess(false);
            setFormErrors(validate);
        }
        else {
            const params = {};
            params['id'] = emailTemplateData?.id;
            params['subject'] = subject;
            params['message'] = htmlContent.replaceAll('&lt;','<').replaceAll('&gt;','>');
            params['disabled'] = disabledTemplate;
            params['from_name'] = fromName;
            APIService.updateEmailTemplate(params)
                .then((response) => {
                    if (response.data?.status) {
                        toast.success(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setTimeout(() => {
                            history.push('/email-templates');
                        }, 1500)
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
    };

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <Header pagename={name} />
                <div className="inner-content">
                    {emailTemplateData?.name &&
                        <Row className="g-4">
                            <Col sm={12} md={6} lg={6} xl={6}>
                                <Card className="rounded-10 border border-gray-100 mb-4 h-100">
                                    <Card.Body className="p-0">
                                        <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                                            <h3 className="card-header-title mb-0 my-md-2 ps-md-3">{emailTemplateData?.name}</h3>
                                        </div>
                                    </Card.Body>
                                    <Card.Body className="px-md-4 py-4">
                                        <Form onSubmit={async e => { e.preventDefault(); await updateEmailTemplate() }}>
                                            <Form.Group className="mb-5 w-100 validation-required">
                                                <Form.Label>Subject</Form.Label>
                                                <Form.Control type="text" value={subject} onChange={(e) => { setSubject(e.target.value) }} className={`${formErrors.subjectInput && 'is-invalid'}`} />
                                                {formErrors.subjectInput && (
                                                    <span className="text-danger">{formErrors.subjectInput}</span>
                                                )}
                                            </Form.Group>
                                            <Form.Group className="mb-3 w-100">
                                                <Form.Label>From Name</Form.Label>
                                                <Form.Control type="text" value={fromName} onChange={(e) => { setFromName(e.target.value) }} className={`${formErrors.fromNameInput && 'is-invalid'}`} />
                                                {formErrors.fromNameInput && (
                                                    <span className="text-danger">{formErrors.fromNameInput}</span>
                                                )}
                                            </Form.Group>
                                            <Form.Check type="checkbox" id="disable-template" label="Disabled" checked={disabledTemplate} onChange={(e) => { setDisabledTemplate(e.target.checked) }} className='mb-5' />
                                            <Form.Group className="mb-5 w-100 validation-required">
                                                <Form.Label className="d-block">Description</Form.Label>
                                                <div className={`${formErrors.messageInput ? 'is-tinymce-editor-invalid' : ''}`}>
                                                    {/* <Editor
                                                        apiKey={REACT_APP_TINYMCE_APIKEY}
                                                        value={htmlContent}
                                                        init={tinymceInit}
                                                        onEditorChange={onEditorChange}
                                                    /> */}
                                                    <ReactQuill theme="snow" value={htmlContent} onChange={setHtmlContent} />
                                                </div>
                                                {formErrors.messageInput && (
                                                    <span className="text-danger">{formErrors.messageInput}</span>
                                                )}
                                            </Form.Group>
                                            <Button disabled={saveProcess} variant="primary" size="md" type="submit" className='float-end'>
                                                {
                                                    !saveProcess && 'Save'
                                                }
                                                {
                                                    saveProcess && <><Spinner size="sm" animation="border" className="me-1" />Save</>
                                                }
                                            </Button>
                                            <Button disabled={saveProcess} className="me-2 float-end" variant="soft-secondary" size="md" type="button" onClick={() => { history.push('/email-templates'); }}>Cancel</Button>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col sm={12} md={6} lg={6} xl={6}>
                                <Card className="rounded-10 border border-gray-100 mb-4 h-100">
                                    <Card.Header className="p-0">
                                        <div className="d-flex align-items-center px-3 px-md-4 py-3">
                                            <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Available merge fields</h3>
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="px-md-4 py-4">
                                        <Row className="g-6">
                                            {emailTemplateData?.merge_fields_types.map((fieldGroup, index) => (
                                                <Col sm={12} md={6} lg={6} xl={6} key={index}>
                                                    <h4 className="accordion-header">{capitalizeFirstWithRemoveUnderScore(fieldGroup)}</h4>
                                                    {emailTemplateData?.merge_fields[fieldGroup].map((fields, index_fields) => (
                                                        <p className='mt-2 mb-0' key={`${index - index_fields}`}>{fields?.name}
                                                            <span className="float-end"><a href="#" className="add_merge_field">{fields?.key}</a></span>
                                                        </p>
                                                    ))}
                                                </Col>
                                            ))}
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    }
                </div>
                <Footer />
            </div>
        </>
    );
}

const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(EditEmailTemplate)