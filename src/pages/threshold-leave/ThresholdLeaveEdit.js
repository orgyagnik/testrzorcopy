import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Form, Button, Spinner, Col, Row, Card } from 'react-bootstrap';
import APIService from "../../api/APIService";
import { validateForm } from "../../utils/validator.js"
import { toast } from 'react-toastify';
import { useHistory, useParams } from "react-router-dom";
import { ThresholdLeaveValidator } from "../../modules/validation/ThresholdLeaveValidator";
import { connect } from "react-redux";
import { databaseRoleCode } from '../../settings';
import NoPermission from '../auth/NoPermission';
import Select from 'react-select';
import { check } from "../../utils/functions.js";

function ThresholdLeaveEdit({ userData, name }) {
    
    let { id } = useParams();
    let history = useHistory();
   
    const [saveProcess, setSaveProcess] = useState(false);
    const [formErrors, setFormErrors] = useState([]);
    const [noPermissionPage, setNoPermissionPage] = useState(false);    
    const [designation, setDesignation] = useState('');
    const [designationOption, setDesignationOption] = useState([]);    
    const [thresholdAddedBy, setThresholdAddedBy] = useState(userData?.id);
    let employeeCountInput = useRef();
    let leaveSlotInput = useRef();
    
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
        APIService.getThresholdLeaveForEdit(id)
            .then((response) => {
                if (response.data?.status) {
                    let data = response.data?.data;  
                    if (data) {   
                        employeeCountInput.current.value = data?.employee_count ? data?.employee_count : '';    
                        leaveSlotInput.current.value = data?.leave_slot ? data?.leave_slot : ''; 

                        setDesignation(data.designation_id);
                        setThresholdAddedBy(data?.added_by);
                    }
                    else {
                        setNoPermissionPage(true);
                    }
                }
            });
    }, [id]);

    const updateThresholdLeaveSetting = async () => {
        setSaveProcess(true);
        
        let validate = validateForm((ThresholdLeaveValidator(designation > 0 ? 'Not Required' : '', employeeCountInput.current?.value, leaveSlotInput.current?.value)));
        
        if (Object.keys(validate).length) {
            setSaveProcess(false);
            setFormErrors(validate);
        }
        else {
            
            let params = {};            
            params["designation_id"] = designation ? designation : 0;
            params["employee_count"] = employeeCountInput.current?.value;
            params["leave_slot"] = leaveSlotInput.current?.value;
            params['id'] = id;

            APIService.updateThresholdLeave(params)
                .then((response) => {
                    if (response.data?.status) {
                        toast.success(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setTimeout(() => {
                            history.push('/threshold-leave-setting');
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

    useEffect(() => {
        if (check(['designations.view'], userData?.role.getPermissions)) {
          APIService.getDesignationList()
            .then((response) => {
              if (response.data?.status) {
                
                let designationList = response.data?.data.map(item => {
                    return { label: item.name, value: item.id }
                });                    
                setDesignationOption(designationList);
              }
            });
        }
    }, []);

    const handledesignationSelect = (e) => {
        setDesignation(e.value);
    };

    return (
        <>        
            <Sidebar />
            <div className="main-content">
                <Header pagename={name ? name : ''} />
                
                {!noPermissionPage ?
                    <>
                        {userData?.role_code === databaseRoleCode.adminCode || (thresholdAddedBy === userData?.id) ?
                            <div className="inner-content">
                                <Card className="rounded-10 p-6">
                                    <Card.Body className="p-0" id="projectBody">
                                        <Form onSubmit={async e => { e.preventDefault(); await updateThresholdLeaveSetting() }}>
                                            <Row className="g-7">
                                                             
                                                <Col sm={12} md={4} xxl={3}>
                                                    <Form.Label className="mb-2">Designation:<span className='validation-required-direct'></span></Form.Label>
                                                    
                                                    <Select styles={customStyles} className='custom-select' options={designationOption} onChange={handledesignationSelect} 
                                                    value={designationOption.filter(function (option) {
                                                        return option.value === designation;
                                                    })}
                                                    />
                                                    
                                                    {formErrors.designationInput && (
                                                        <span className="text-danger">{formErrors.designationInput}</span>
                                                    )}
                                                </Col> 
                                                <Col sm={12} md={4} xxl={3}>
                                                    <Form.Label className="mb-2">Min. Employees:<span className='validation-required-direct'></span></Form.Label>
                                                    
                                                    <Form.Control type="number" placeholder="Min. Employees" ref={employeeCountInput} className={`form-control ${formErrors.employeeCountInput && 'is-invalid'}`} />
                                                    
                                                    {formErrors.employeeCountInput && (
                                                        <span className="text-danger">{formErrors.employeeCountInput}</span>
                                                    )}
                                                </Col>

                                                <Col sm={12} md={4} xxl={3}>
                                                    <Form.Label className="mb-2">Min. Applicable Leaves:<span className='validation-required-direct'></span></Form.Label>
                                                    
                                                    <Form.Control type="number" max={100} placeholder="Min. Applicable Leaves" ref={leaveSlotInput} className={`form-control ${formErrors.leaveSlotInput && 'is-invalid'}`} />
                                                    
                                                    {formErrors.leaveSlotInput && (
                                                        <span className="text-danger">{formErrors.leaveSlotInput}</span>
                                                    )}
                                                </Col>                                                 
                                                
                                            </Row>
                                            <div className="mt-5">
                                                <Button disabled={saveProcess} className="me-2" variant="soft-secondary" size="md" type="button" onClick={() => { history.push('/threshold-leave-setting'); }}>Cancel</Button>
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
                            :
                            <NoPermission />
                        }
                    </>
                     : 
                    <NoPermission /> 
                }
                <Footer />
            </div>
        </>
    );
}

const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(ThresholdLeaveEdit)