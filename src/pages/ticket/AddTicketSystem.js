import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Form, Button, Spinner, Col, Row, Card } from 'react-bootstrap';
import APIService from "../../api/APIService";
import { validateForm } from "../../utils/validator.js"
import { toast } from 'react-toastify';
import { useHistory } from "react-router-dom";
import { TicketSystemValidator } from "../../modules/validation/TicketSystemValidator";
import { connect } from "react-redux";
import { tinymceInit, ticketPriorityList } from '../../settings';
import { Editor } from "@tinymce/tinymce-react";
import Select from 'react-select';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const REACT_APP_TINYMCE_APIKEY = process.env.REACT_APP_TINYMCE_APIKEY;

function AddTicketSystem({ userData, name }) {
    let history = useHistory();
    const [saveProcess, setSaveProcess] = useState(false);
    const [formErrors, setFormErrors] = useState([]);
    const [ticketTitle, setTicketTitle] = useState('');
    const [ticketPriority, setTicketPriority] = useState('Low');
    const [category, setCategory] = useState('');
    const [categoryOption, setCategoryOption] = useState([]);

    //for html editor
    const [htmlContent, setHtmlContent] = useState();
    const onEditorChange = (e) => {
        setHtmlContent(e);
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

    useEffect(() => {
        APIService.getTicketCategory()
            .then((response) => {
                if (response.data?.status) {
                    let newCategoryList = response.data?.data.map(item => {
                        return { label: item.name, value: item.id }
                    });
                    setCategoryOption(newCategoryList);
                }
            });
    }, []);

    const addTicketSystem = async () => {
        setSaveProcess(true);
        setFormErrors([]);
        let validate = validateForm((TicketSystemValidator(ticketTitle, ticketPriority, category, htmlContent ? htmlContent : '')));
        if (Object.keys(validate).length) {
            setSaveProcess(false);
            setFormErrors(validate);
        }
        else {
            let params = {};
            params["name"] = ticketTitle;
            params["description"] = htmlContent ? htmlContent : '';
            params["added_by"] = userData?.id;
            params["status"] = 1;
            params["priority"] = ticketPriority;
            params["category"] = category;
            APIService.addTicketSystem(params)
                .then((response) => {
                    if (response.data?.status) {
                        toast.success(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setTimeout(() => {
                            history.push('/it-ticket');
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

    const handleTicketPrioritySelect = (e) => {
        setTicketPriority(e.value);
    };

    const handleCategorySelect = e => {
        setCategory(e.value);
    };

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <Header pagename={name ? name : ''} />
                <div className="inner-content">
                    <Card className="rounded-10 p-6">
                        <Card.Body className="p-0" id="projectBody">
                            <Form onSubmit={async e => { e.preventDefault(); await addTicketSystem() }}>
                                <Row className="g-7">
                                    <Col xs={12} xl={6}>
                                        <Form.Label className="d-block">Title<span className='validation-required-direct'></span></Form.Label>
                                        <Form.Control placeholder="Title" value={ticketTitle} onChange={(e) => { setTicketTitle(e.target.value) }} className={`description-area placeholder-dark  dark-2 ${formErrors.ticketTitleInput && 'is-invalid'}`} />
                                        {formErrors.ticketTitleInput && (
                                            <span className="text-danger">{formErrors.ticketTitleInput}</span>
                                        )}
                                    </Col>
                                    <Col xs={12} md={6} xl={3}>
                                        <Form.Label className="d-block">Category<span className='validation-required-direct'></span></Form.Label>
                                        <Select styles={customStyles} classNamePrefix="react-select" className={`custom-select ${formErrors.categoryInput && 'is-react-select-invalid'}`} options={categoryOption} onChange={handleCategorySelect} placeholder={<div>Select Category</div>}
                                            value={categoryOption.filter(function (option) {
                                                return option.value === category;
                                            })} />
                                        {formErrors.categoryInput && (
                                            <span className="text-danger">{formErrors.categoryInput}</span>
                                        )}
                                    </Col>
                                    <Col xs={12} md={6} xl={3}>
                                        <Form.Label className="d-block">Priority<span className='validation-required-direct'></span></Form.Label>
                                        <Select styles={customStyles} classNamePrefix="react-select" className={`custom-select ${formErrors.priorityInput && 'is-react-select-invalid'}`} options={ticketPriorityList} onChange={handleTicketPrioritySelect}
                                            value={ticketPriorityList.filter(function (option) {
                                                return option.value === ticketPriority;
                                            })} />
                                        {formErrors.priorityInput && (
                                            <span className="text-danger">{formErrors.priorityInput}</span>
                                        )}
                                    </Col>
                                    <Col xs={12}>
                                        <Form.Label className="d-block">Description<span className='validation-required-direct'></span></Form.Label>
                                        {/* <Editor
                                            apiKey={REACT_APP_TINYMCE_APIKEY}
                                            value={htmlContent}
                                            init={tinymceInit}
                                            onEditorChange={onEditorChange}
                                        /> */}
                                        <ReactQuill theme="snow" value={htmlContent} onChange={setHtmlContent} />
                                        {formErrors.descriptionInput && (
                                            <span className="text-danger">{formErrors.descriptionInput}</span>
                                        )}
                                    </Col>
                                </Row>
                                <div className="mt-5">
                                    <Button disabled={saveProcess} className="me-2" variant="soft-secondary" size="md" type="button" onClick={() => { history.push('/it-ticket'); }}>Cancel</Button>
                                    <Button disabled={saveProcess} variant="primary" size="md" type="submit">
                                        {
                                            !saveProcess && 'Save'
                                        }
                                        {
                                            saveProcess && <><Spinner size="sm" animation="border" className="me-1" />Save</>
                                        }
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
                <Footer />
            </div>
        </>
    );
}

const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(AddTicketSystem)