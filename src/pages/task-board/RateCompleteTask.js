import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Tab, Tabs, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import APIService from '../../api/APIService';
import SimpleBar from 'simplebar-react';
//import { databaseRoleCode } from '../../settings';

export default function RateCompleteTask({ ratingCompleteShow, setShowRatingCompleteModal, taskBoardId, setTaskBoardId, taskBoardUserId, setTaskBoardUserId, userData, reloadTaskboard, setReloadTaskboard }) {
    const [communicationRating, SetCommunicationRating] = useState(0);
    const [timeRating, SetTimeRating] = useState(0);
    const [jobKnowledgeRating, SetJobKnowledgeRating] = useState(0);
    const [plpRating, SetPlpRating] = useState(0);
    let suggestionsInput = useRef();
    const [processForRating, setProcessForRating] = useState(false);
    const [validateRateForm, SetValidateRateForm] = useState(null);
    const [activeTab, SetActiveTab] = useState("communication");

    const ratingCompleteClose = () => {
        setTaskBoardId(0);
        setTaskBoardUserId(0);
        SetCommunicationRating(0);
        SetTimeRating(0);
        SetJobKnowledgeRating(0);
        SetPlpRating(0);
        if (suggestionsInput.current !== undefined)
            suggestionsInput.current.value = '';
        SetValidateRateForm(null);
        SetActiveTab("communication");
        setShowRatingCompleteModal(false);
    }

    const handleSaveRatingCard = (e) => {
        setProcessForRating(true);
        SetValidateRateForm(0);
        let overall_ratings = (communicationRating + timeRating + jobKnowledgeRating + plpRating) / 4;
        if (communicationRating === 0) {
            setProcessForRating(false);
            SetValidateRateForm(1);
            SetActiveTab("communication");
            return false;
        }
        else if (timeRating === 0) {
            setProcessForRating(false);
            SetValidateRateForm(2);
            SetActiveTab("time");
            return false;
        }
        else if (jobKnowledgeRating === 0) {
            setProcessForRating(false);
            SetValidateRateForm(3);
            SetActiveTab("job-knowledge");
            return false;
        }
        else if (plpRating === 0) {
            setProcessForRating(false);
            SetValidateRateForm(4);
            SetActiveTab("professionalism-leadership-punctuality");
            return false;
        }
        else if ((overall_ratings < 3) && (suggestionsInput.current === undefined || suggestionsInput?.current?.value === '')) {
            setProcessForRating(false);
            SetValidateRateForm(5);
            SetActiveTab("professionalism-leadership-punctuality");
            return false;
        }
        else {
            let params = {};
            params['id'] = taskBoardId;
            params['status'] = 1;
            //params['staff_id'] = userData?.role_code === databaseRoleCode.clientCode ? userData?.userid : userData?.id;
            //params['staff_id'] = userData?.id;
            params['staff_id'] = taskBoardUserId;
            params['communication_rating'] = communicationRating;
            params['time_rating'] = timeRating;
            params['job_knowledge_rating'] = jobKnowledgeRating;
            params['plp_rating'] = plpRating;
            params['description'] = suggestionsInput?.current?.value;
            APIService.doneTaskboard(params)
                .then((response) => {
                    if (response.data?.status) {
                        toast.success(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setProcessForRating(false);
                        ratingCompleteClose();
                        setReloadTaskboard(!reloadTaskboard);
                    }
                    else {
                        toast.error(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setProcessForRating(false);
                    }
                })
                .catch((error) => {
                    toast.error(error, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                    setProcessForRating(false);
                });
        }
    }

    return (
        <Modal size="xl" show={ratingCompleteShow} onHide={ratingCompleteClose} centered>
            <Modal.Header closeButton className="py-5 px-lg-10 px-5 ">
                <Modal.Title className="font-20 dark-1 mb-0">Rate and Complete Card</Modal.Title>
            </Modal.Header>
            <Modal.Body className="py-5 px-lg-10 px-5">
                <Tabs activeKey={activeTab} id="completeCard" className="custom-tab mb-3 border-gray-100 align-items-center flex-nowrap overflow-x-auto" onSelect={(e) => { SetActiveTab(e) }}>
                    <Tab eventKey="communication" title="Communication" className="px-0 pt-3">
                        <SimpleBar className="rate-completed-card-content">
                            <Row className="">
                                <Col lg="6">
                                    <div className="bg-dark-11 p-8 h-100">
                                        <h2 className="fw-semibold mb-4">Communication</h2>
                                        <ul className="m-0 ps-5">
                                            <li className="mb-3">Keep all stakeholders up to speed on projects’ status</li>
                                            <li className="mb-3">Take and share notes and updates regularly</li>
                                            <li className="mb-3">Ask questions and shares information with the rest of the team</li>
                                            <li className="mb-3">Ensure questions are clarified before taking actions that will impact outcomes.</li>
                                            <li className="mb-3">Ensure that everyone understands the goals of a specific project and shares regular updates.</li>
                                            <li className="mb-3">An effective listener and takes time to understand what others are saying</li>
                                            <li className="mb-3">Facilitate conversations with team members that bring out new ideas and solutions to problems.</li>
                                            <li className="mb-3">Be able to articulate complex, technical concepts in plain language.</li>
                                        </ul>
                                    </div>
                                </Col>
                                <Col lg="6">
                                    <div className="rating-block">
                                        <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
                                            <Form.Check.Label htmlFor="ratecompete1" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">Initiates the task without explanation</li>
                                                    <li className="mb-2 fw-normal">Communicates pc and begins the work</li>
                                                    <li className="mb-2 fw-normal">Provides proper update on the task</li>
                                                    <li className="mb-2 fw-normal">Provides next steps on the task</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdcommunicationRating" id="ratecompete1" defaultChecked={communicationRating === 5 ? true : false} onChange={(e) => { SetCommunicationRating(5) }} />
                                        </Form.Check>
                                        <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
                                            <Form.Check.Label htmlFor="ratecompete2" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">Communicates pc and begins the work</li>
                                                    <li className="mb-2 fw-normal">provides proper update on task</li>
                                                    <li className="mb-2 fw-normal">Provides next steps on the task (eta)</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdcommunicationRating" id="ratecompete2" defaultChecked={communicationRating === 4 ? true : false} onChange={(e) => { SetCommunicationRating(4) }} />
                                        </Form.Check>
                                        <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
                                            <Form.Check.Label htmlFor="ratecompete3" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">Communicates pc and begins the work</li>
                                                    <li className="mb-2 fw-normal">Timely update on task status</li>
                                                    <li className="mb-2 fw-normal">Did not provide next steps on the task</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdcommunicationRating" id="ratecompete3" defaultChecked={communicationRating === 3 ? true : false} onChange={(e) => { SetCommunicationRating(3) }} />
                                        </Form.Check>
                                        <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
                                            <Form.Check.Label htmlFor="ratecompete4" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">Incomplete updates shared on the task</li>
                                                    <li className="mb-2 fw-normal">Forgot to update the task status on timely manner</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdcommunicationRating" id="ratecompete4" defaultChecked={communicationRating === 2 ? true : false} onChange={(e) => { SetCommunicationRating(2) }} />
                                        </Form.Check>
                                        <Form.Check className="m-0 form-check-sm py-4 px-0">
                                            <Form.Check.Label htmlFor="ratecompete5" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">No communication / update on the task</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdcommunicationRating" id="ratecompete5" defaultChecked={communicationRating === 1 ? true : false} onChange={(e) => { SetCommunicationRating(1) }} />
                                        </Form.Check>
                                        {validateRateForm === 1 &&
                                            <span className="text-danger">Please choose atleast one</span>}
                                    </div>
                                </Col>
                            </Row>
                        </SimpleBar>
                    </Tab>
                    <Tab eventKey="time" title="Time" className="px-0 pt-3">
                        <SimpleBar className="rate-completed-card-content">
                            <Row className="">
                                <Col lg="6">
                                    <div className="bg-dark-11 p-8 h-100">
                                        <h2 className="fw-semibold mb-4">Time</h2>
                                        <ul className="m-0 ps-5">
                                            <li className="mb-3">Deliver high volumes of work that often exceed expectations</li>
                                            <li className="mb-3">Seek out ways or tools to automate manual tasks</li>
                                            <li className="mb-3">Inspire others with their levels of productivity.</li>
                                            <li className="mb-3">Contribute to significantly boosting overall departmental productivity</li>
                                            <li className="mb-3">Able to work smarter, not harder.</li>
                                        </ul>
                                    </div>
                                </Col>
                                <Col lg="6">
                                    <div className="rating-block">
                                        <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
                                            <Form.Check.Label htmlFor="ratecompete6" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">Completed the planned work of the day before time</li>
                                                    <li className="mb-2 fw-normal">Also delivered extra work for the same day</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdtimeRating" id="ratecompete6" defaultChecked={timeRating === 5 ? true : false} onChange={(e) => { SetTimeRating(5) }} />
                                        </Form.Check>
                                        <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
                                            <Form.Check.Label htmlFor="ratecompete7" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">Delievered the task on time</li>
                                                    <li className="mb-2 fw-normal">Completed the work that was planned for the day</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdtimeRating" id="ratecompete7" defaultChecked={timeRating === 4 ? true : false} onChange={(e) => { SetTimeRating(4) }} />
                                        </Form.Check>
                                        <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
                                            <Form.Check.Label htmlFor="ratecompete8" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">Delivered the work but required over time</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdtimeRating" id="ratecompete8" defaultChecked={timeRating === 3 ? true : false} onChange={(e) => { SetTimeRating(3) }} />
                                        </Form.Check>
                                        <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
                                            <Form.Check.Label htmlFor="ratecompete9" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">Fixing bugs</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdtimeRating" id="ratecompete9" defaultChecked={timeRating === 2 ? true : false} onChange={(e) => { SetTimeRating(2) }} />
                                        </Form.Check>
                                        <Form.Check className="m-0 form-check-sm py-4 px-0">
                                            <Form.Check.Label htmlFor="ratecompete10" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">Could not deliver planned work</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdtimeRating" id="ratecompete10" defaultChecked={timeRating === 1 ? true : false} onChange={(e) => { SetTimeRating(1) }} />
                                        </Form.Check>
                                        {validateRateForm === 2 &&
                                            <span className="text-danger">Please choose atleast one</span>}
                                    </div>
                                </Col>
                            </Row>
                        </SimpleBar>
                    </Tab>
                    <Tab eventKey="job-knowledge" title="Job Knowledge" className="px-0 pt-3">
                        <SimpleBar className="rate-completed-card-content">
                            <Row className="">
                                <Col lg="6">
                                    <div className="bg-dark-11 p-8 h-100">
                                        <h2 className="fw-semibold mb-4">Job Knowledge</h2>
                                        <ul className="m-0 ps-5">
                                            <li className="mb-3">Approach technical challenges with a skillful eye.</li>
                                            <li className="mb-3">Apply skills to boost the company’s quarterly revenue numbers.</li>
                                            <li className="mb-3">Use technical knowledge creatively to solve problems.</li>
                                            <li className="mb-3">Saved project X from failure by proposing a new technical approach.</li>
                                            <li className="mb-3">Explain technical subjects to peers in a relatable manner.</li>
                                            <li className="mb-3">Build the team’s knowledge base by sharing expertise on technical issues.</li>
                                            <li className="mb-3">Apply expertise creatively.</li>
                                            <li className="mb-3">Can take theoretical concepts and apply them to practical challenges.</li>
                                            <li className="mb-3">Find solutions to longstanding issues through their technological insights.</li>
                                            <li className="mb-3">Translate technical information into user-friendly language.</li>
                                        </ul>
                                    </div>
                                </Col>
                                <Col lg="6">
                                    <div className="rating-block">
                                        <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
                                            <Form.Check.Label htmlFor="ratecompete11" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">Implement processes around the work</li>
                                                    <li className="mb-2 fw-normal">Knowledge sharing and training the team</li>
                                                    <li className="mb-2 fw-normal">Solve critical issues themselves</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdjobKnowledgeRating" id="ratecompete11" defaultChecked={jobKnowledgeRating === 5 ? true : false} onChange={(e) => { SetJobKnowledgeRating(5) }} />
                                        </Form.Check>
                                        <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
                                            <Form.Check.Label htmlFor="ratecompete12" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">Delivered the task without help or guidance</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdjobKnowledgeRating" id="ratecompete12" defaultChecked={jobKnowledgeRating === 4 ? true : false} onChange={(e) => { SetJobKnowledgeRating(4) }} />
                                        </Form.Check>
                                        <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
                                            <Form.Check.Label htmlFor="ratecompete13" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">Delivered the task with some guidance</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdjobKnowledgeRating" id="ratecompete13" defaultChecked={jobKnowledgeRating === 3 ? true : false} onChange={(e) => { SetJobKnowledgeRating(3) }} />
                                        </Form.Check>
                                        <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
                                            <Form.Check.Label htmlFor="ratecompete14" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">Delivered the task with help</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdjobKnowledgeRating" id="ratecompete14" defaultChecked={jobKnowledgeRating === 2 ? true : false} onChange={(e) => { SetJobKnowledgeRating(2) }} />
                                        </Form.Check>
                                        <Form.Check className="m-0 form-check-sm py-4 px-0">
                                            <Form.Check.Label htmlFor="ratecompete15" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">Could not perform the task</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdjobKnowledgeRating" id="ratecompete15" defaultChecked={jobKnowledgeRating === 1 ? true : false} onChange={(e) => { SetJobKnowledgeRating(1) }} />
                                        </Form.Check>
                                        {validateRateForm === 3 &&
                                            <span className="text-danger">Please choose atleast one</span>}
                                    </div>
                                </Col>
                            </Row>
                        </SimpleBar>
                    </Tab>
                    <Tab eventKey="professionalism-leadership-punctuality" title="Professionalism Leadership Punctuality" className="px-0 pt-3">
                        <SimpleBar className="rate-completed-card-content">
                            <Row className="">
                                <Col lg="6">
                                    <div className="bg-dark-11 p-8 h-100">
                                        <h2 className="fw-semibold mb-4">Professionalism Leadership Punctuality</h2>
                                        <ul className="m-0 ps-5">
                                            <li className="mb-3">Proactively seek out new tasks to work on</li>
                                            <li className="mb-3">Work well without any supervision.</li>
                                            <li className="mb-3">Find new, creative ways to overcome challenges</li>
                                            <li className="mb-3">Always on the lookout for new ways to improve and deliver value.</li>
                                            <li className="mb-3">Listen to others without interrupting.</li>
                                            <li className="mb-3">Solve team conflicts in a calm and mature manner</li>
                                            <li className="mb-3">Respect confidentiality.</li>
                                            <li className="mb-3">Demonstrate trustworthiness.</li>
                                            <li className="mb-3">Avoid office gossip.</li>
                                            <li className="mb-3">Polite and professional in every way.</li>
                                            <li className="mb-3">Show empathy to people experiencing personal or professional challenges.</li>
                                            <li className="mb-3">Willing to embrace new opportunities and take on additional tasks.</li>
                                        </ul>
                                    </div>
                                </Col>
                                <Col lg="6">
                                    <div className="rating-block">
                                        <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
                                            <Form.Check.Label htmlFor="ratecompete16" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">Highly organized and good at prioritizing what is important</li>
                                                    <li className="mb-2 fw-normal">Always strive to keep commitments</li>
                                                    <li className="mb-2 fw-normal">Bring people together to create a high-functioning team.</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdplpRating" id="ratecompete16" defaultChecked={plpRating === 5 ? true : false} onChange={(e) => { SetPlpRating(5) }} />
                                        </Form.Check>
                                        <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
                                            <Form.Check.Label htmlFor="ratecompete17" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">Willing to put in long hours to get the job done</li>
                                                    <li className="mb-2 fw-normal">Keeping the knowledge sharing channels active.</li>
                                                    <li className="mb-2 fw-normal">Provides creative solutions</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdplpRating" id="ratecompete17" defaultChecked={plpRating === 4 ? true : false} onChange={(e) => { SetPlpRating(4) }} />
                                        </Form.Check>
                                        <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
                                            <Form.Check.Label htmlFor="ratecompete18" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">Proactively carries out the kt with team member and plans for their absence</li>
                                                    <li className="mb-2 fw-normal">Willingness to help team members first.</li>
                                                    <li className="mb-2 fw-normal">Keeps the team members well informed about the work and updates.</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdplpRating" id="ratecompete18" defaultChecked={plpRating === 3 ? true : false} onChange={(e) => { SetPlpRating(3) }} />
                                        </Form.Check>
                                        <Form.Check className="m-0 form-check-sm py-4 border-bottom border-gray-100 px-0">
                                            <Form.Check.Label htmlFor="ratecompete19" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">Self testing before the work delivery</li>
                                                    <li className="mb-2 fw-normal">Start and end meetings on time.</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdplpRating" id="ratecompete19" defaultChecked={plpRating === 2 ? true : false} onChange={(e) => { SetPlpRating(2) }} />
                                        </Form.Check>
                                        <Form.Check className="m-0 form-check-sm py-4 px-0">
                                            <Form.Check.Label htmlFor="ratecompete20" className="m-0 dark-1 w-95">
                                                <div className="star-rate mt-1">
                                                    <span className="icon-star-fill text-primary pe-1"></span>
                                                </div>
                                                <ul className="arrow-list p-0 m-0 mt-4">
                                                    <li className="mb-2 fw-normal">Always call ahead if they are going to be late.</li>
                                                    <li className="mb-2 fw-normal">Book vacation time well in advance.</li>
                                                </ul>
                                            </Form.Check.Label>
                                            <Form.Check.Input className="float-end" type="radio" name="rdplpRating" id="ratecompete20" defaultChecked={plpRating === 1 ? true : false} onChange={(e) => { SetPlpRating(1) }} />
                                        </Form.Check>
                                        {validateRateForm === 4 &&
                                            <span className="text-danger">Please choose atleast one</span>}
                                    </div>
                                </Col>
                            </Row>
                            <Form.Group className="mt-4">
                                <Form.Label className="dark-1">Please provide any comments or suggestions.</Form.Label>
                                <Form.Control as="textarea" rows={2} ref={suggestionsInput} />
                                {validateRateForm === 5 &&
                                    <span className="text-danger">This field is required.</span>}
                            </Form.Group>
                        </SimpleBar>
                    </Tab>
                </Tabs>

            </Modal.Body>
            <Modal.Footer className="border-gray-100">
                <Button variant="outline-dark" size="md" onClick={ratingCompleteClose}>Close</Button>
                <Button disabled={processForRating} variant="primary" size="md" type="submit" onClick={() => { handleSaveRatingCard() }}>
                    {
                        !processForRating && 'Save'
                    }
                    {
                        processForRating && <><Spinner size="sm" animation="border" className="me-1" />Save</>
                    }
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
