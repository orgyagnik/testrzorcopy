import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { pagination, display_date_format_with_time, databaseRoleCode, pcHeadId } from '../../settings';
import moment from 'moment';
import Select from 'react-select';
import RangeDatePickerControl from '../../modules/custom/RangeDatePickerControl';
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import { format } from 'date-fns';
import NoPermission from '../auth/NoPermission';
import PerformanceScorecard from '../../assets/doc/Performance_Scorecard.pdf';

function StaffRating({ userData, name }) {
    const [firstLoad, setFirstLoad] = useState(true);
    const [leaveList, setLeaveList] = useState([]);
    const [page, setPage] = useState(1);
    const [searchFilter, setSearchFilter] = useState('');
    const [sort, setSort] = useState(pagination.sorting);
    const [sortby, setSortBy] = useState('id');
    const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [staffList, setStaffList] = useState([]);
    const [projectManagerOption, setProjectManagerOption] = useState([]);
    const [staffId, setStaffId] = useState(0);
    const [projectManager, setProjectManager] = useState(0);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [reloadPage, setReloadPage] = useState(false);

    const [exportData, setExportData] = useState([]);
    const [tableLoader, setTableLoader] = useState(false);

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
        if (userData.role_code === databaseRoleCode.adminCode || userData?.designation === pcHeadId) {
            APIService.getAllMembers('?role_code=office_staff')
                .then((response) => {
                    if (response.data?.status) {
                        let newStaffList = response.data?.data.map(item => {
                            return { label: item.name, value: item.id }
                        });
                        setStaffList([{ label: 'Filter Staff', value: 0 }, ...newStaffList]);
                    }
                });

            APIService.getAllMembers(`?role_code=office_staff`)
                .then((response) => {
                    if (response.data?.status) {
                        let newStaffList = response.data?.data?.map(item => {
                            return { label: item.name, value: item.id }
                        });
                        setProjectManagerOption([{ label: 'Filter Added By', value: 0 }, ...newStaffList]);
                    }
                });
        }
    }, []);

    useEffect(() => {
        if (userData.role_code === databaseRoleCode.adminCode || userData?.designation === pcHeadId) {
            fetchStaffRatingReport();
            setFirstLoad(false);
        }
    }, [sort, sortby, page, perPageSize]);

    useEffect(() => {
        if (firstLoad === false) {
            setPage(1);
            if (page === 1) {
                const timer = setTimeout(() => {
                    fetchStaffRatingReport();
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [searchFilter, reloadPage]);

    const fetchStaffRatingReport = () => {
        setTableLoader(true);
        let params = "?";
        params = params + "sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby;
        if (searchFilter !== '') {
            params = params + "&search=" + searchFilter;
        }

        if (staffId !== 0) {
            params = params + "&staff_id=" + staffId;
        }

        if (projectManager !== 0) {
            params = params + "&added_by=" + projectManager;
        }

        if (startDate && endDate) {
            params = params + "&startdate=" + format(startDate, "yyyy-MM-dd");
            params = params + "&enddate=" + format(endDate, "yyyy-MM-dd");
        }

        APIService.getStaffRatingReport(params)
            .then((response) => {
                if (response.data?.status) {
                    let newData = response.data?.data;
                    setTotalPages(response.data?.pagination?.total_pages);
                    setTotalRecords(response.data?.pagination?.total_records);
                    setLeaveList(newData);
                    setTableLoader(false);
                    let exportHeader = ["#", "Staff", "Added By", "Communication", "Time", "Understanding", "QA", "Job Knowledge", "Professionalism Leadership Punctuality", "Overall", "Description", "Date Added"];
                    let exportData = [];
                    newData?.map(item => {
                        exportData.push(
                            {
                                id: item.id,
                                staff_name: item.staff_name,
                                added_by_name: item.added_by_name,
                                communication_rating: item.communication_rating,
                                time_rating: item.time_rating,
                                understanding_rating: item.understanding_rating,
                                qa_rating: item.qa_rating,
                                job_knowledge_rating: item.job_knowledge_rating,
                                plp_rating: item.plp_rating,
                                overall_ratings: item.overall_ratings,
                                description: item.description,
                                created_at: item.created_at ? moment(item.created_at).format(display_date_format_with_time) : '',
                            });
                        return '';
                    });
                    setExportData({ fileName: "staff-ratting", sheetTitle: "Staff Rating", exportHeader: exportHeader, exportData: exportData });
                }
            });
    }

    let columns = [
        {
            Header: '#',
            id: 'id',
            accessor: (row) => row?.id,
        },
        {
            Header: 'Staff',
            id: 'staff_name',
            accessor: (row) => row?.staff_name,
        },
        {
            Header: 'Added By',
            id: 'added_by_name',
            accessor: (row) => row?.added_by_name,
            disableSortBy: true,
        },
        {
            Header: 'Communication',
            id: 'communication_rating',
            accessor: (row) => row?.communication_rating,
        },
        {
            Header: 'Time',
            id: 'time_rating',
            accessor: (row) => row?.time_rating,
        },
        {
            Header: 'Understanding',
            id: 'understanding_rating',
            accessor: (row) => row?.understanding_rating,
        },
        {
            Header: 'QA',
            id: 'qa_rating',
            accessor: (row) => row?.qa_rating,
        },
        {
            Header: 'Job Knowledge',
            id: 'job_knowledge_rating',
            accessor: (row) => row?.job_knowledge_rating,
        },
        {
            Header: 'Professionalism Leadership Punctuality',
            id: 'plp_rating',
            accessor: (row) => row?.plp_rating,
        },
        {
            Header: 'Overall',
            id: 'overall_ratings',
            accessor: (row) => row?.overall_ratings,
        },
        {
            Header: 'Description',
            id: 'description',
            accessor: (row) => row?.description,
        },
        {
            Header: 'Date Added',
            id: 'created_at',
            accessor: (row) => row?.created_at && moment(new Date(row?.created_at)).format(display_date_format_with_time),
        },
    ];

    const handleStaffSelect = e => {
        setStaffId(e.value);
    };

    const handleProjectManagerSelect = (selectedPc) => {
        setProjectManager(selectedPc?.value);
    };

    const handleClearFilter = async (e) => {
        setStaffId(0);
        setProjectManager(0);
        setStartDate(null);
        setEndDate(null);
        setSearchFilter('');
        setReloadPage(!reloadPage);
    };

    const handleFilter = async (e) => {
        setReloadPage(!reloadPage);
    };

    const onChangeDateRange = dates => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    }

    const [isPageOffcanvasisActive, setIsPageOffcanvasisActive] = useState(false);
    const cstPageOffcanvasisShow = () => {
        setIsPageOffcanvasisActive(true);
        document.body.style.overflow = 'hidden';
    };
    const cstPageOffcanvasisHide = () => {
        setIsPageOffcanvasisActive(false);
        document.body.style.overflow = '';
    };

    return (
        <>
            {userData?.role_code === databaseRoleCode.adminCode || userData?.designation === pcHeadId ?
                <>
                    <Sidebar />
                    <div className="main-content">
                        <Header pagename={name} headerFilterButton={<Button onClick={cstPageOffcanvasisShow} variant="outline-secondary" size="md" type="button" className='ms-auto d-xl-none d-block'>Filter <i className="icon-filter ms-2"></i></Button>}/>
                        <div className="inner-content pt-0 px-0">
                            <div className="staff-ratting-page">
                                <div className="bg-white py-0 px-0 py-xl-3 px-xl-7 page-inner-header"> 
                                    <div className={"custom-page-offcanvas " + (isPageOffcanvasisActive ? 'active' : '')}>
                                        <div className='custom-page-offcanvas-header border-bottom border-gray-100 py-2 px-4 d-xl-none'>
                                            <h5 className='m-0'>Filter</h5>
                                            <Button type="button" variant="white" size='sm' className="btn-icon circle-btn btn" onClick={cstPageOffcanvasisHide}><i className="icon-cancel"></i></Button>
                                        </div>
                                        <div className='custom-page-offcanvas-body p-xl-0 p-4'>
                                            <Row className="g-4">
                                                <Col xs={12} xl="auto" className='me-md-auto'>
                                                    <a href={PerformanceScorecard} className='btn btn-outline-secondary btn-md' target='_blank' rel="noreferrer">Rate Explanation</a>
                                                </Col>
                                                <Col xs={12} className='d-xl-none d-block'>
                                                    <hr className='m-0' />
                                                </Col>
                                                <Col xs={12} sm={12} md={6} xl={2} xxl={2}>
                                                    <Select styles={customStyles} className="control-md custom-select" options={staffList} onChange={handleStaffSelect}
                                                        value={staffList.filter(function (option) {
                                                            return option.value === staffId;
                                                        })} />
                                                </Col>
                                                <Col xs={12} sm={12} md={6} xl={3} xxl={2}>
                                                    <Select styles={customStyles} className="control-md custom-select" options={projectManagerOption} onChange={handleProjectManagerSelect}
                                                        value={projectManagerOption.filter(function (option) {
                                                            return option.value === projectManager;
                                                        })} />
                                                </Col>
                                                <Col xs={12} sm={12} md={6} xl={3} xxl={3}>
                                                    <RangeDatePickerControl
                                                        selected={startDate}
                                                        startDate={startDate}
                                                        endDate={endDate}
                                                        onChange={onChangeDateRange}
                                                    />
                                                </Col>
                                                <Col xs={12} className='mt-4 d-xl-none d-block'>
                                                    <hr className='m-0' />
                                                </Col>
                                                <Col xl="auto" className='d-flex gap-2 flex-xl-row flex-row-reverse justify-content-sm-start justify-content-between'>
                                                    <Button variant="primary" size="md" type="button" onClick={() => { handleFilter() }}>Search</Button>
                                                    <OverlayTrigger placement='bottom' overlay={<Tooltip>Clear Filter</Tooltip>}>
                                                        <Button variant="soft-secondary" size="md" type="button" onClick={() => { handleClearFilter() }}><span className="icon-cancel d-xl-inline-block d-none"></span> <span className='d-xl-none'>Clear Filter</span></Button>
                                                    </OverlayTrigger>
                                                </Col>
                                            </Row>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-3 pt-xl-9 px-4 px-xl-7">
                                    <Card className="rounded-10 p-6">
                                        <Card.Body className="p-0">
                                            <DataTableWithPagination columns={columns} data={leaveList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isExportable={true} exportData={exportData} />
                                        </Card.Body>
                                    </Card>
                                </div>
                            </div>
                        </div>
                        <Footer />
                    </div>
                </>
                :
                <NoPermission />
            }
        </>
    );
}
const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(StaffRating)