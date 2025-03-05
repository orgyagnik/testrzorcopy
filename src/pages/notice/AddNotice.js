import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, Button, Form, Spinner } from 'react-bootstrap';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { tinymceInit } from '../../settings';
import { format } from 'date-fns';
import { useHistory, useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import SingleDatePickerControl from '../../modules/custom/SingleDatePicker';
import { check } from "../../utils/functions.js";
import { validateForm } from "../../utils/validator.js"
import { NoticeValidator } from "../../modules/validation/NoticeValidator";
import Select from 'react-select';
import { toast } from 'react-toastify';
import InputMask from "react-input-mask";
import { MESSAGE_LIMIT_ERROR } from '../../modules/lang/Notice';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const REACT_APP_TINYMCE_APIKEY = process.env.REACT_APP_TINYMCE_APIKEY;

function AddNotice({ userData, name }) {
    let history = useHistory();
    const [formErrors, setFormErrors] = useState([]);
    const [saveProcess, setSaveProcess] = useState(false);

    //for html editor
    const [htmlContent, setHtmlContent] = useState();

    const [endDate, setEndDate] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [role, setRole] = useState([]);
    const [process, setProcess] = useState(false);
    
    const [roleOption, setRoleOption] = useState([]);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [color, setColor] = useState('#EC4141'); 

    const onEditorChange = (e) => {
        setHtmlContent(e);
    }

    useEffect(() => {
        if (check(['roles.view'], userData?.role.getPermissions)) {
          APIService.getRoleList()
            .then((response) => {
              if (response.data?.status) {
                
                let roleList = response.data?.data.map(item => {
                    return { label: item.name, value: item.roleid }
                });
                setRoleOption(roleList);
              }
            });
        }
    }, []);

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

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
    };

    const addNotice = async () => {
        setSaveProcess(true);
        
        let validate = validateForm((NoticeValidator(startDate, endDate, startTime, endTime, htmlContent ? htmlContent : '', color, role.length > 0 ? 'Not Required' : '')));
        if (Object.keys(validate).length) {
            setSaveProcess(false);
            setFormErrors(validate);
        }else {
            const maxCharacters = 500;
            if (htmlContent.length > maxCharacters) {
                toast.error(MESSAGE_LIMIT_ERROR, {
                    position: toast.POSITION.TOP_RIGHT
                });
                setSaveProcess(false);
                return;
            }
            let params = {};
            params["start_date"] = startDate ? format(startDate, "yyyy-MM-dd") : '';
            params["end_date"] = endDate ? format(endDate, "yyyy-MM-dd") : '';
            let role_result = role.map(a => a.value);
            params["role"] = role_result.length > 0 ? role_result.join(',') : '';
            params["message"] = htmlContent ? htmlContent : '';
            params["start_time"] = startTime ? startTime.includes('_') ? '00:00' : startTime : '00:00';
            params["end_time"] = endTime ? endTime.includes('_') ? '00:00' : endTime : '00:00';
            params['bg_color'] = color;
              
            APIService.addNotice(params)
                .then((response) => {
                    if (response.data?.status) {
                        toast.success(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setTimeout(() => {
                            history.push('/notices');
                        }, 1500)
                        // setSaveProcess(false);
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

    const handleColorChange = (e) => {
        setColor(e.target.value);
    };

    return (
        <>
            <Sidebar />

            <div className="main-content">
                <Header pagename={name} />
                <div className="inner-content pt-0 px-0">
                <Card className="rounded-10 p-6">
                        <Card.Body className="p-0" id="projectBody">
                            <Form onSubmit={async e => { e.preventDefault(); await addNotice() }}>
                                <Row className="g-7">
                                    <Col sm={12} md={3} lg={3} xl={3}>
                                        <Form.Group className="w-100" controlId="roleName">
                                            <Form.Label>Start Date<span className='validation-required-direct'></span></Form.Label>
                                            <SingleDatePickerControl
                                                selected={startDate}
                                                onDateChange={(startDate) => setStartDate(startDate)}
                                                onChange={(startDate) => setStartDate(startDate)}
                                                minDate={new Date()}
                                                // maxDate={endDate}
                                                isClearable
                                                className={`form-control ${formErrors.startDate && 'is-invalid'}`}
                                            />
                                        </Form.Group>
                                        {formErrors.startDateInput && (
                                            <span className="text-danger">{formErrors.startDateInput}</span>
                                        )}
                                    </Col>
                                    <Col sm={12} md={2} lg={2} xl={2}>
                                        <Form.Group className="w-100" controlId="roleName">
                                            <Form.Label>Start Time<span className='validation-required-direct'></span></Form.Label>
                                            <div className='position-relative custom-time-picker'>
                                                <InputMask
                                                    mask="99:99"
                                                    placeholder="HH:MM"
                                                    value={startTime}
                                                    onChange={(e) => { setStartTime(e.target.value) }}
                                                    className={`form-control ${formErrors.startTime && 'is-invalid'}
                                                    `}
                                                />
                                                <i className='icon-cancel cursor-pointer p-2 date-picker-clear dark-7 font-12' onClick={(e) => { setStartTime('') }}></i>
                                            </div>
                                        </Form.Group>
                                        {formErrors.startTimeInput && (
                                            <span className="text-danger">{formErrors.startTimeInput}</span>
                                        )}
                                    </Col>
                                    <Col sm={12} md={3} lg={3} xl={3}>
                                        <Form.Group className="w-100" controlId="roleCode">
                                            <Form.Label>End Date<span className='validation-required-direct'></span></Form.Label>
                                            <SingleDatePickerControl
                                                selected={endDate}
                                                onDateChange={(startDate) => setEndDate(startDate)}
                                                onChange={(startDate) => setEndDate(startDate)}
                                                // minDate={startDate}
                                                minDate={new Date()}
                                                isClearable
                                                className={`form-control ${formErrors.endDate && 'is-invalid'}`}
                                            />
                                        </Form.Group>
                                        {formErrors.endDateInput && (
                                            <span className="text-danger">{formErrors.endDateInput}</span>
                                        )}
                                    </Col>    
                                    <Col sm={12} md={2} lg={2} xl={2}>
                                        <Form.Group className="w-100" controlId="roleName">
                                            <Form.Label>End Time<span className='validation-required-direct'></span></Form.Label>
                                            <div className='position-relative custom-time-picker'>
                                                <InputMask
                                                    mask="99:99"
                                                    placeholder="HH:MM"
                                                    value={endTime}
                                                    onChange={(e) => { setEndTime(e.target.value) }}
                                                    className={`form-control ${formErrors.endTime && 'is-invalid'}
                                                    `}
                                                />
                                                <i className='icon-cancel cursor-pointer p-2 date-picker-clear dark-7 font-12' onClick={(e) => { setEndTime('') }}></i>
                                            </div>
                                        </Form.Group>
                                        {formErrors.endTimeInput && (
                                            <span className="text-danger">{formErrors.endTimeInput}</span>
                                        )}
                                    </Col>
                                    <Col sm={12} md={3} lg={3} xl={3}>
                                        <Form.Label className="mb-2">Role<span className='validation-required-direct'></span></Form.Label>
                                        
                                        <Select styles={customStyles} options={roleOption} onChange={handleRoleSelect} closeMenuOnSelect={false} isMulti value={role} className={`custom-select ${formErrors.roleInput && 'is-invalid'}`}/>
                                        
                                        {formErrors.roleInput && (
                                            <span className="text-danger">{formErrors.roleInput}</span>
                                        )}
                                    </Col>    
                                    <Col sm={12} md={2} lg={2} xl={2}>
                                        <Form.Group className="mb-7 w-100" controlId="roleName">
                                            <Form.Label className="mb-2">Background Color</Form.Label>

                                            <Form.Control type="color" value={color} onChange={handleColorChange} />

                                        </Form.Group>
                                        {formErrors.colorInput && (
                                            <span className="text-danger">{formErrors.colorInput}</span>
                                        )}
                                    </Col>                              
                                    <Col xs={12}>
                                        <Form.Label className="d-block">Message<span className='validation-required-direct'></span></Form.Label>
                                        {/* <Editor
                                            apiKey={REACT_APP_TINYMCE_APIKEY}
                                            value={htmlContent}
                                            init={tinymceInit}
                                            onEditorChange={onEditorChange}
                                        /> */}
                                        <ReactQuill theme="snow" value={htmlContent} onChange={setHtmlContent} />
                                        {formErrors.messageInput && (
                                            <span className="text-danger">{formErrors.messageInput}</span>
                                        )}
                                    </Col>
                                </Row>
                                <div className="mt-5">
                                    <Button disabled={saveProcess} className="me-2" variant="soft-secondary" size="md" type="button" onClick={() => { history.push('/notices'); }}>Cancel</Button>
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
  
export default connect(mapStateToProps)(AddNotice)