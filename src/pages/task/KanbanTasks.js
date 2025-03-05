import React, { useState } from 'react';
import { connect } from "react-redux";
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Col, Row, ButtonGroup } from 'react-bootstrap';
import { Link } from "react-router-dom";
import Board, { moveCard } from "@asseinfo/react-kanban";
import "@asseinfo/react-kanban/dist/styles.css";

function KanbanTasks({ userData, name }) {
    const [searchFilter, setSearchFilter] = useState('');

    const board = {
        columns: [
            {
                id: 1,
                title: "Not Started",
                cards: [
                    {
                        id: 1,
                        title: "Card title 1",
                        description: "Card content"
                    },
                    {
                        id: 2,
                        title: "Card title 2",
                        description: "Card content"
                    },
                    {
                        id: 3,
                        title: "Card title 3",
                        description: "Card content"
                    }
                ]
            },
            {
                id: 2,
                title: "In Progress",
                cards: [
                    {
                        id: 9,
                        title: "Card title 9",
                        description: "Card content"
                    }
                ]
            },
            {
                id: 3,
                title: "Testing",
                cards: [
                    {
                        id: 10,
                        title: "Card title 10",
                        description: "Card content"
                    },
                    {
                        id: 11,
                        title: "Card title 11",
                        description: "Card content"
                    }
                ]
            },
            {
                id: 4,
                title: "Awaiting Feedback",
                cards: [
                    {
                        id: 12,
                        title: "Card title 12",
                        description: "Card content"
                    },
                    {
                        id: 13,
                        title: "Card title 13",
                        description: "Card content"
                    }
                ]
            },
            {
                id: 5,
                title: "On Hold",
                cards: [
                    {
                        id: 20,
                        title: "Card title 12",
                        description: "Card content"
                    },
                    {
                        id: 22,
                        title: "Card title 13",
                        description: "Card content"
                    }
                ]
            },
            {
                id: 6,
                title: "Complete",
                cards: [
                    {
                        id: 23,
                        title: "Card title 12",
                        description: "Card content"
                    },
                    {
                        id: 25,
                        title: "Card title 13",
                        description: "Card content"
                    }
                ]
            },
            {
                id: 7, // New ID for Pending Approval
                title: "Pending Approval", // New title
                cards: [] // Initialize with empty cards
            }
        ]
    };

    const [controlledBoard, setBoard] = useState(board);

    function handleCardMove(_card, source, destination) {
        const updatedBoard = moveCard(controlledBoard, source, destination);
        setBoard(updatedBoard);
    }

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <Header pagename={name} />
                <div className="inner-content py-0 px-0">
                    <div className='taskboard-page'>
                        <div className="bg-white py-3 px-4 px-lg-7 taskboard-header page-inner-header">
                            <Row className="g-5 align-items-center">
                                <Col xs="12" md="2">
                                    <ButtonGroup size="md">
                                        <Link to={"/tasks"} variant="primary" type="button" className='btn btn-white'><span className="d-sm-inline d-none">Switch to list</span></Link>
                                    </ButtonGroup>
                                </Col>
                                <Col xs="12" md="2" className="ms-auto">
                                    <div className="search-box w-100">
                                        <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                            <span className="icon-serach"></span>
                                            <input type="search" className="form-control border-0" placeholder="Search Task" value={searchFilter} onChange={(e) => { setSearchFilter(e.target.value) }} />
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                    <div className="pt-9 px-4 px-lg-7">
                        <Board onCardDragEnd={handleCardMove} disableColumnDrag>
                            {controlledBoard}
                        </Board>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}

const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(KanbanTasks)