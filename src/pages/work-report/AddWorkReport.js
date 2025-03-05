import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Form, Button, Spinner, Col, Row, Card, InputGroup, Accordion, useAccordionButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import APIService from "../../api/APIService";
import { validateForm } from "../../utils/validator.js";
import { useHistory } from "react-router-dom";
import { WorkReportValidator } from "../../modules/validation/WorkReportValidator";
import { connect } from "react-redux";
import Select from 'react-select';
import SingleDatePickerControl from '../../modules/custom/SingleDatePicker';
import moment from 'moment';
import { Editor } from "@tinymce/tinymce-react";
import { tinymceInit, workingDayOption, workReportDeadlineMatchList, workReportReasonList } from '../../settings';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import InputMask from "react-input-mask";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const REACT_APP_TINYMCE_APIKEY = process.env.REACT_APP_TINYMCE_APIKEY;

function AddWorkReport({ userData, name }) {
    const arrayFromZeroToFifty = Array.from({ length: 51 }, (_, index) => index);
    let history = useHistory();
    const [saveProcess, setSaveProcess] = useState(false);
    const [saveProcessForDraft, setSaveProcessForDraft] = useState(false);
    const [formErrors, setFormErrors] = useState([]);
    const [reportRowValidate, setReportRowValidate] = useState(false);
    const [date, setDate] = useState(moment()._d);
    const defaultRowId = Date.now();    
    const [reportRow, setReportRow] = useState([{ id: defaultRowId, project_id: '', task_id: '', task_name: '', description: '', working_hours: '', status: '', deadline_match: '', reason: '' }]);
    const [statusOption, setStatusOption] = useState([]);
    const [projectList, setProjectList] = useState([]);
    const [taskList, setTaskList] = useState([{ id: defaultRowId, data: [] }]);
    const [workingDay, setWorkingDay] = useState('full_day');
    const [earlyPunchOut, setEarlyPunchOut] = useState(false); 

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
        APIService.getWorkReportStatus()
            .then((response) => {
                if (response.data?.status) {
                    setStatusOption(response.data?.data);
                }
            });

        APIService.getAllProjects("")
            .then((response) => {
                if (response.data?.status) {
                    let data = response.data?.data;
                    let temData = data?.map(item => {
                        return { label: item.name, value: item.id }
                    });
                    setProjectList([{ value: 0, label: "Other" }, ...temData]);
                }
            });
    }, []);

    const addWorkReport = async (save_as_draft) => {
        if (save_as_draft === 1) {
            setSaveProcessForDraft(true);
        }
        else {
            setSaveProcess(true);
        }
        setFormErrors([]);
        setReportRowValidate(false);
        let validate = validateForm((WorkReportValidator(date)));
        if (Object.keys(validate).length) {
            setSaveProcess(false);
            setSaveProcessForDraft(false);
            setFormErrors(validate);
        }
        else {
            const errors = [];
            reportRow.forEach((row, index) => {
                let hoursValidate = row.working_hours ? row.working_hours : '';
                if (row.project_id === '' || hoursValidate.includes(':') !== true || hoursValidate.includes('_') || row.status === '' || (row.description.replaceAll("&nbsp;", '').trim() === '' && row.task_id === 0) || (row.project_id === 0 && row.task_name === '') || (row.project_id > 0 && row.task_id === '') || (row.task_id === 0 && row.task_name.trim() === '') || row.deadline_match === '' || (row.deadline_match !== 'On Time' ? row.reason === '' : '') ) {
                    errors.push(`Row ${index + 1} has missing fields.`);
                }
            });

            if (errors.length > 0) {
                setSaveProcess(false);
                setSaveProcessForDraft(false);
                errors.forEach(error => {
                    toast.error(error, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                });
                setReportRowValidate(true);
            }
            else {
                let total_hours = 0;
                let total_hours_text = sumWorkingHours();
                if (total_hours_text.includes(':')) {
                    const [hoursPart, minutesPart] = total_hours_text.split(':');
                    total_hours = parseInt(hoursPart, 10) + parseInt(minutesPart, 10) / 60;
                }
                if (total_hours < (workingDay === 'full_day' ? 8 : 4) && save_as_draft === 0 && (!earlyPunchOut || workingDay === 'half_day')) {
                    setSaveProcess(false);
                    toast.error(`Working hours must be greater than or equal ${workingDay === 'full_day' ? '08:00' : '04:00'}`, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
                else {
                    let params = {};
                    params["report_date"] = format(date, "yyyy-MM-dd");
                    params["staff_id"] = userData?.id;
                    params["work_data"] = reportRow;
                    params["working_day"] = workingDay;
                    params["total_hours"] = total_hours_text;
                    params["save_as_draft"] = save_as_draft;
                    params["early_punchout"] = earlyPunchOut ? 1 : 0;

                    APIService.addWorkReport(params)
                        .then((response) => {
                            if (response.data?.status) {
                                toast.success(response.data?.message, {
                                    position: toast.POSITION.TOP_RIGHT
                                });
                                setTimeout(() => {
                                    history.push('/work-report');
                                }, 1500)
                                setSaveProcess(false);
                                setSaveProcessForDraft(false);
                            }
                            else {
                                toast.error(response.data?.message, {
                                    position: toast.POSITION.TOP_RIGHT
                                });
                                setSaveProcess(false);
                                setSaveProcessForDraft(false);
                            }
                        })
                        .catch((error) => {
                            toast.error(error, {
                                position: toast.POSITION.TOP_RIGHT
                            });
                            setSaveProcess(false);
                            setSaveProcessForDraft(false);
                        });
                }
            }
        }
    };

    const handleAddRow = () => {
        
        setFormErrors([]);
        setReportRowValidate(false);
        const newRowId = Date.now();
        const newRow = { id: newRowId, project_id: '', task_id: '', task_name: '', description: '', working_hours: '', status: '', deadline_match: '', reason: '' };
        setReportRow(prevRows => [...prevRows, newRow]);
        setTaskList(prevRows => [...prevRows, { id: newRowId, data: [] }]);        
    };

    const handleDeleteRow = (id) => {
        setFormErrors([]);
        setReportRowValidate(false);
        setReportRow(prevRows => prevRows.filter(row => row.id !== id));
        setTaskList(prevRows => prevRows.filter(row => row.id !== id));
    };

    const handleEditorChange = (content, editor, id) => {
        const updatedRows = reportRow.map(row => {
            if (row.id === id) {
                return { ...row, description: content };
            }
            return row;
        });
        setReportRow(updatedRows);
    };

    const handleStatusChange = (id, value) => {
        const updatedRows = reportRow.map(row => {
            if (row.id === id) {
                return { ...row, status: value };
            }
            return row;
        });
        setReportRow(updatedRows);
    };

    const handleWorkingHoursChange = (id, value) => {
        const updatedRows = reportRow.map(row => {
            if (row.id === id) {
                return { ...row, working_hours: value };
            }
            return row;
        });
        setReportRow(updatedRows);
    };

    const handleProjectChange = (id, value) => {
        fetchTaskList(value, id);
        const updatedRows = reportRow.map(row => {
            if (row.id === id) {
                if (value === 0) {
                    return { ...row, project_id: value, task_id: 0, task_name: '' };
                }
                else {
                    return { ...row, project_id: value, task_id: '', task_name: '' };
                }
            }
            return row;
        });
        setReportRow(updatedRows);
    };

    const handleTaskIdChange = (id, selectedTask) => {
        const updatedRows = reportRow.map(row => {
            if (row.id === id) {
                if (selectedTask.value === 0) {
                    return { ...row, task_id: selectedTask.value, task_name: '' };
                }
                else {
                    return { ...row, task_id: selectedTask.value, task_name: selectedTask.taskname };
                }
            }
            return row;
        });
        setReportRow(updatedRows);
    };

    const handleTaskNameChange = (id, value) => {
        const updatedRows = reportRow.map(row => {
            if (row.id === id) {
                return { ...row, task_name: value };
            }
            return row;
        });
        setReportRow(updatedRows);
    };

    const sumWorkingHours = () => {
        let totalMinutes = 0;
        reportRow.forEach((row) => {
            if (row.working_hours !== '' && row.working_hours !== '00:00' && row.working_hours !== null && row.working_hours.includes(':') && !row.working_hours.includes('_')) {
                const [hoursPart, minutesPart] = row.working_hours.split(':');
                const numericHours = parseInt(hoursPart, 10);
                const numericMinutes = parseInt(minutesPart, 10);
                totalMinutes += (numericHours * 60) + numericMinutes; // Convert everything to minutes
            }
        });

        const formattedHours = Math.floor(totalMinutes / 60);
        const formattedMinutes = totalMinutes % 60;

        return `${formattedHours.toString().padStart(2, '0')}:${formattedMinutes.toString().padStart(2, '0')}`;
    };

    const fetchTaskList = (project_id, row_id) => {
        if (project_id > 0) {
            let params = "?project_id=" + project_id;
            APIService.getAllTask(params)
                .then((response) => {
                    if (response.data?.status) {
                        let data = response.data?.data;
                        let temData = data?.map(item => {
                            return { label: `${item.task_name} (${item.task_id})`, taskname: item.task_name, value: item.task_id }
                        });
                        const updatedList = taskList.map(row => {
                            if (row.id === row_id) {
                                return { ...row, data: [{ label: 'Other', value: 0 }, ...temData] };
                            }
                            return row;
                        });
                        setTaskList(updatedList);
                    }
                });
        }
        else {
            setTaskList(prevRows => [...prevRows, { id: row_id, data: [] }]);
        }
    };

    const handleWorkingDaySelect = e => {
        setWorkingDay(e.value);
        if (e.value === "half_day")
            setEarlyPunchOut(false);
    };

    function CustomToggle({ children, eventKey }) {
        const decoratedOnClick = useAccordionButton(eventKey);
        return (
            <h4 onClick={decoratedOnClick} >{children}</h4>
        );
    }

    const handleDeadlineMatchChange = (id, value) => {          
        const updatedRows = reportRow.map(row => {
            if (row.id === id) {
                return { ...row, deadline_match: value };
            }
            return row;
        });
        setReportRow(updatedRows);
    };

    const handleReasonChange = (id, value) => {          
        const updatedRows = reportRow.map(row => {
            if (row.id === id) {
                return { ...row, reason: value };
            }
            return row;
        });
        setReportRow(updatedRows);
    };

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <Header pagename={name ? name : ''} />
                <div className="inner-content">
                    <Card className="rounded-10">
                        <Card.Body className="p-0" id="projectBody">
                            <Form onSubmit={async e => { e.preventDefault(); await addWorkReport(0) }}>
                                <div className='border-bottom border-gray-100 p-md-6 p-4'>
                                    <Row className="g-4 align-items-center">
                                        {/* <Col md='auto' className='pe-lg-5 col-3 order-1'>
                                            <OverlayTrigger placement='top' overlay={<Tooltip>Back to Work Report</Tooltip>}>
                                                <Button variant="soft-secondary"  type="button" onClick={() => { history.push('/work-report'); }}><span className='icon-arrow'></span></Button>
                                            </OverlayTrigger>
                                        </Col> */}
                                        <Col sm={6} md={4} lg={3} xl={3} className='order-lg-2 order-3'>
                                            <Form.Group className="w-100">
                                                <SingleDatePickerControl
                                                    selected={date}
                                                    onDateChange={(date) => setDate(date)}
                                                    onChange={(date) => setDate(date)}
                                                    indian={true}
                                                    maxDate={new Date()}
                                                    minDate={userData?.id === 41 ? new Date(moment().subtract(1, 'days')) : new Date()}
                                                    disabled={userData?.id === 41 ? false : true}
                                                    className={`form-control ${formErrors.dateInput && 'is-invalid'}`}
                                                />
                                                {formErrors.dateInput && (
                                                    <span className="text-danger">{formErrors.dateInput}</span>
                                                )}
                                            </Form.Group>
                                        </Col>
                                        <Col sm={6} md={4} lg={3} xl={3} className='order-lg-3 order-4'>
                                            <Form.Group className="w-100">
                                                <Select styles={customStyles} classNamePrefix="react-select" className={`custom-select ${formErrors.workingDayInput && 'is-react-select-invalid'}`} options={workingDayOption} onChange={handleWorkingDaySelect} placeholder={<div>Select Full/Half Day</div>}
                                                    value={workingDayOption.filter(function (option) {
                                                        return option.value === workingDay;
                                                    })} />
                                                {formErrors.workingDayInput && (
                                                    <span className="text-danger">{formErrors.workingDayInput}</span>
                                                )}
                                            </Form.Group>
                                        </Col>
                                        {workingDay === "full_day" &&
                                            <Col sm={6} md={4} lg='3' xl={3} className='order-lg-3 order-4'>
                                                <Form.Check type="checkbox" className='mt-2' id='earlyPunchOut' label="Early Punch-Out" value={1} checked={earlyPunchOut} onChange={(e) => { setEarlyPunchOut(e.target.checked) }} />
                                            </Col>
                                        }
                                        <Col xs="12" lg={12} xl='auto' className='ms-md-auto order-lg-4 order-2 text-center text-xl-end'>
                                            <p className='font-14 text-center text-lg-start text-xl-end mb-0'><b>Total Working Hours</b> : {sumWorkingHours()}</p>
                                        </Col>
                                    </Row>
                                </div>
                                <div className='p-md-6 p-4'>
                                    <Accordion defaultActiveKey={arrayFromZeroToFifty} alwaysOpen className="custom-accordion">
                                        {reportRow.map((row, index) => (
                                            <div key={row.id}>
                                                <Card>
                                                    <Accordion.Collapse eventKey={index}>
                                                        <Card.Body className='px-0 pb-0 pt-4'>
                                                            <Row className="g-4 mb-5">
                                                                <Col sm={12} md={6} xl={4}>
                                                                    <Form.Group className="w-100">
                                                                        <Form.Label>Project<span className='validation-required-direct'></span></Form.Label>
                                                                        <Select styles={customStyles} classNamePrefix="react-select" className={`custom-select ${reportRowValidate && row.project_id === '' && 'is-react-select-invalid'}`} options={projectList} onChange={(e) => { handleProjectChange(row.id, e.value) }} placeholder={<div>Select Project</div>}
                                                                            value={projectList.filter(function (option) {
                                                                                return option.value === row.project_id;
                                                                            })} />
                                                                    </Form.Group>
                                                                </Col>
                                                                <Col sm={12} md={6} xl={4}>
                                                                    <Form.Group className="w-100">
                                                                        <Form.Label>Task<span className='validation-required-direct'></span></Form.Label>
                                                                        {row.project_id === 0 ?
                                                                            <>
                                                                                <Form.Control placeholder="Enter Task Name" autoFocus value={row.task_name} onChange={(e) => { handleTaskNameChange(row.id, e.target.value) }} className={`form-control ${reportRowValidate && row.task_name.trim() === '' && 'is-invalid'}`} />
                                                                            </>
                                                                            :
                                                                            <>
                                                                                {row.task_id === 0 ?
                                                                                    <>
                                                                                        <InputGroup className="work-report-task-group">
                                                                                            <Form.Control placeholder="Enter Task Name" autoFocus value={row.task_name} onChange={(e) => { handleTaskNameChange(row.id, e.target.value) }} className={`${reportRowValidate && row.task_name === '' && 'is-invalid'}`} />
                                                                                            <Button variant='outline-secondary' onClick={(e) => { handleTaskIdChange(row.id, { value: '', label: '' }) }} className='btn-remove-task font-12'><i className="icon-cancel"></i></Button>
                                                                                        </InputGroup>
                                                                                    </>
                                                                                    :
                                                                                    <>
                                                                                        <Select styles={customStyles} classNamePrefix="react-select" className={`custom-select ${reportRowValidate && row.task_id === '' && 'is-react-select-invalid'}`} options={taskList.filter(task_row => task_row.id === row.id)[0]?.data} onChange={(e) => { handleTaskIdChange(row.id, e) }} placeholder={<div>Select Task</div>}
                                                                                            value={taskList.filter(task_row => task_row.id === row.id)[0]?.data?.filter(function (option) {
                                                                                                return option.value === row.task_id;
                                                                                            })} />
                                                                                    </>
                                                                                }
                                                                            </>
                                                                        }
                                                                    </Form.Group>
                                                                </Col>
                                                                <Col sm={12} md={6} lg={6} xl>
                                                                    <Form.Group className="w-100">
                                                                        <Form.Label className='w-100'>Status<span className='validation-required-direct'></span></Form.Label>
                                                                        <Select styles={customStyles} classNamePrefix="react-select" className={`custom-select ${reportRowValidate && row.status === '' && 'is-react-select-invalid'}`} options={statusOption} onChange={(e) => { handleStatusChange(row.id, e.value) }} placeholder={<div>Select Status</div>}
                                                                            value={statusOption.filter(function (option) {
                                                                                return option.value === row.status;
                                                                            })} />
                                                                    </Form.Group>
                                                                </Col>
                                                                <Col sm={12} md='auto'>

                                                                    <Form.Label>Working Hours<span className='validation-required-direct'></span></Form.Label>
                                                                    <div className='position-relative custom-time-picker'>
                                                                        <InputMask
                                                                            mask="99:99"
                                                                            placeholder="HH:MM"
                                                                            value={row.working_hours}
                                                                            onChange={(e) => { handleWorkingHoursChange(row.id, e.target.value) }}
                                                                            className={`form-control ${reportRowValidate && (row.working_hours === '' || row.working_hours === null || row.working_hours.includes('_')) && 'is-timepicker-invalid'}`}
                                                                        />
                                                                        <span className='icon-cancel cursor-pointer p-2 date-picker-clear dark-7 font-12' onClick={(e) => { handleWorkingHoursChange(row.id, '') }}></span>
                                                                    </div>

                                                                </Col>
                                                                
                                                                <Col sm={12} md={6} xl={4}>
                                                                    <Form.Group className="w-100">
                                                                        <Form.Label className='w-100'>Deadline Match<span className='validation-required-direct'></span></Form.Label>
                                                                        
                                                                        <Select styles={customStyles} classNamePrefix="react-select" className={`custom-select ${reportRowValidate && row.deadline_match === '' && 'is-react-select-invalid'}`} options={workReportDeadlineMatchList} onChange={(e) => { handleDeadlineMatchChange(row.id, e.value) }} placeholder={<div>Select Deadline Match</div>}
                                                                            value={workReportDeadlineMatchList.filter(function (option) {
                                                                                return option.value === row.deadline_match;
                                                                            })}          
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                                {row.deadline_match === 'Delayed' &&
                                                                    <Col sm={12} md={6} xl={4}>
                                                                        <Form.Group className="w-100">
                                                                            <Form.Label className='w-100'>Reason<span className='validation-required-direct'></span></Form.Label>
                                                                            <Select styles={customStyles} classNamePrefix="react-select" className={`custom-select ${reportRowValidate && row?.reason === '' && 'is-react-select-invalid'}`} options={workReportReasonList} onChange={(e) => { handleReasonChange(row.id, e.value) }} placeholder={<div>Select Reason</div>}
                                                                                value={workReportReasonList.filter(function (option) {
                                                                                    return option.value === row.reason;
                                                                                })} />
                                                                        </Form.Group>
                                                                    </Col>
                                                                }
                                                                                                                                
                                                                {row.task_id === 0 &&
                                                                    <Col sm={12} >
                                                                        <Form.Group className="w-100">
                                                                            <Form.Label>Description<span className='validation-required-direct'></span></Form.Label>
                                                                            <div className={`${reportRowValidate && row.description.replaceAll("&nbsp;", '').trim() === '' ? 'is-tinymce-editor-invalid' : ''}`}>
                                                                                {/* <Editor
                                                                                    apiKey={REACT_APP_TINYMCE_APIKEY}
                                                                                    value={row.description}
                                                                                    init={tinymceInit}
                                                                                    onEditorChange={(content, editor) => handleEditorChange(content, editor, row.id)}
                                                                                /> */}
                                                                                <ReactQuill theme="snow" value={row.description} 
                                                                                    onChange={ (content, editor) => handleEditorChange(content, editor, row.id) }
                                                                                />
                                                                            </div>
                                                                        </Form.Group>
                                                                    </Col>
                                                                }
                                                            </Row>
                                                        </Card.Body>
                                                    </Accordion.Collapse>
                                                    <Card.Header className='py-4 px-0'>
                                                        <CustomToggle eventKey={index}><span className='row-counter'>{index + 1}</span> {row.task_name ? row.task_name : 'Default Task'}</CustomToggle>
                                                        {reportRow.length > 1 &&
                                                            <OverlayTrigger placement='top' overlay={<Tooltip>Delete Row</Tooltip>}>
                                                                <Button type="button" variant="soft-danger" size="sm" className='circle-btn btn-icon ms-auto' onClick={() => handleDeleteRow(row.id)}>
                                                                    <i className="icon-delete"></i>
                                                                </Button>
                                                            </OverlayTrigger>
                                                        }
                                                    </Card.Header>
                                                </Card>
                                            </div>
                                        ))}
                                    </Accordion>
                                </div>

                                <div className="bg-gray-50 border-top border-gray-100 p-md-6 p-4 d-flex flex-md-nowrap flex-wrap align-items-center justify-content-sm-start justify-content-center">
                                    <Button variant="soft-secondary" className="me-2" size="md" type="button" onClick={handleAddRow}>Add New Row</Button>
                                    <Button disabled={saveProcessForDraft} variant="primary" size="md" type="button" onClick={(e) => { addWorkReport(1); }}>
                                        {
                                            !saveProcessForDraft && 'Save As Draft'
                                        }
                                        {
                                            saveProcessForDraft && <><Spinner size="sm" animation="border" className="me-1" />Save As Draft</>
                                        }
                                    </Button>
                                    <div className='col-12 col-sm-auto d-flex flex-md-nowrap flex-wrap align-items-center ms-sm-auto justify-content-md-end justify-content-center mt-2 mt-sm-0'>
                                        <p className='font-15 text-md-end text-center mb-0 me-8 d-md-block d-none'><b>Total Working Hours</b> : {sumWorkingHours()}</p>
                                        <Button disabled={saveProcess} className="me-2" variant="soft-secondary" size="md" type="button" onClick={() => { history.push('/work-report'); }}>Cancel</Button>
                                        <Button disabled={saveProcess} variant="primary" size="md" type="submit">
                                            {
                                                !saveProcess && 'Save'
                                            }
                                            {
                                                saveProcess && <><Spinner size="sm" animation="border" className="me-1" />Save</>
                                            }
                                        </Button>

                                    </div>
                                    <p className='font-14 text-md-end text-center mb-0 w-100 mt-md-0 mt-4 d-md-none d-block'><b>Total Working Hours</b> : {sumWorkingHours()}</p>

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

export default connect(mapStateToProps)(AddWorkReport)



