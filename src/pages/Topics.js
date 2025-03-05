import React, { useState, useEffect } from 'react';
import Sidebar from '../modules/main/Sidebar';
import Header from '../modules/main/Header';
import Footer from '../modules/main/Footer';
import { Table, Button, Card, Row, Col, Form, InputGroup } from 'react-bootstrap'; // Added InputGroup for search
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import APIService from "../api/APIService";
import SimpleBar from 'simplebar-react';
import { toast } from 'react-toastify';
import moment from 'moment';
import { databaseRoleCode } from '../settings';
import SearchIcon from '../assets/img/icons/serach.svg'; // Assuming this is the correct path

function Topics({ userData, name }) {
    const { projectId } = useParams();
    const [topics, setTopics] = useState([]);
    const [projectData, setProjectData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(''); // State for search term

    useEffect(() => {
        const fetchProjectData = async () => {
            setLoading(true);
            try {
                const response = await APIService.getProjectForEdit(projectId);
                if (response.data?.status) {
                    const project = response.data?.data;
                    setProjectData(project);
                    toast.success("Project data fetched successfully", {
                        position: toast.POSITION.TOP_RIGHT
                    });
                } else {
                    toast.error(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            } catch (error) {
                toast.error("Failed to load project data", {
                    position: toast.POSITION.TOP_RIGHT
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [projectId]);

    // Filter topics based on search term
    const filteredTopics = topics.filter(topic =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <Header pagename={name} />
                <div className="inner-content">
                    {/* Search and other components below the header */}
                    <Row className="mb-4">
                        <Col>
                            {/* <InputGroup>
                                <Form.Control
                                    placeholder="Search Topics"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <InputGroup.Text>
                                    <img src={SearchIcon} alt="Search" />
                                </InputGroup.Text>
                            </InputGroup> */}
                        </Col>
                    </Row>
                    
                    <Card className="rounded-10 border border-gray-100 mb-4">
                        <Card.Body className="p-0">
                            <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                                <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Topics</h3>
                            </div>
                        </Card.Body>
                        <Card.Body className="px-md-4 py-4">
                            <SimpleBar>
                                <Table hover size="md" className="list-table border-top-0">
                                    <thead>
                                        <tr>
                                            <th>Topic Name</th>
                                            <th>Keyword</th>
                                            <th>Search Volume</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="4" className="text-center">
                                                    Loading...
                                                </td>
                                            </tr>
                                        ) : projectData ? (
                                            JSON.parse(projectData.targeted_keywords).map((keyword, index) => (
                                                <tr key={index}>
                                                    <td>N/A</td>
                                                    <td>{keyword}</td>
                                                    <td>N/A</td> {/* Assuming no search volume data */}
                                                    <td>
                                                        <Button variant="success" size="sm" className="me-1">Approve</Button>
                                                        <Button variant="warning" size="sm" className="me-1">Regenerate Title</Button>
                                                        <Button variant="info" size="sm" className="me-1">Save for Later</Button>
                                                        <Button variant="danger" size="sm">Reject</Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center">
                                                    Data not found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </SimpleBar>
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
});

export default connect(mapStateToProps)(Topics);