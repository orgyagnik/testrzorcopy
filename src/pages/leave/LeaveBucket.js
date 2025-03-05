import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, Button, Form, Offcanvas, Spinner, OverlayTrigger, Tooltip, Dropdown } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import { pagination, popperConfig, office_display_date_format_with_time } from '../../settings';
import moment from 'moment';
import { check } from "../../utils/functions.js";
import { databaseRoleCode } from '../../settings';
import { validateForm } from "../../utils/validator.js";
import { LeaveBucketValidator } from "../../modules/validation/LeaveValidator";
import Select from 'react-select';
import { toast } from 'react-toastify';
import PermissionCheck from "../../modules/Auth/PermissionCheck";
import { useLocation } from "react-router-dom";
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import { format } from 'date-fns';

function LeaveBucket({ userData, name }) {
    const search = useLocation().search;
    const searchStaffId = new URLSearchParams(search).get('q');
    const [showAddLeaveModal, setShowAddLeaveModal] = useState(false);
    const cstSetCloseAddLeaveModal = () => setShowAddLeaveModal(false);
    const cstShowAddLeaveModal = () => setShowAddLeaveModal(true);
    const [firstLoad, setFirstLoad] = useState(true);
    const [reloadPage, setReloadPage] = useState(false);
    const [leaveList, setLeaveList] = useState([]);
    const [page, setPage] = useState(1);
    const [searchFilter, setSearchFilter] = useState('');
    const [saveProcess, setSaveProcess] = useState(false);
    const [sort, setSort] = useState(pagination.sorting);
    const [sortby, setSortBy] = useState('updated_at');
    const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [leaveTypeList, setLeaveTypeList] = useState([]);

    const [formErrors, setFormErrors] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [searchStaffList, setSearchStaffList] = useState([]);
    const [staffId, setStaffId] = useState(searchStaffId ? parseInt(searchStaffId) : 0);
    const [yearList, setYearList] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [leaveId, setLeaveId] = useState(0);
    const [staffIdForAdd, setStaffIdForAdd] = useState('');
    const [yearForAdd, setYearForAdd] = useState(new Date().getFullYear());    
    const [leaveType, setLeaveType] = useState('');
    const [leavesAllowed, setLeavesAllowed] = useState('');
    const [leaveDescription, setLeaveDescription] = useState('');

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
        APIService.getAllMembers('?role_code=office_staff')
            .then((response) => {
                if (response.data?.status) {
                    let newStaffList = response.data?.data.map(item => {
                        return { label: item.name, value: item.id }
                    });
                    setStaffList([{ label: 'Select Staff', value: '' },{ label: 'All', value: 0 }, ...newStaffList]);
                    setSearchStaffList([{ label: 'All', value: 0 }, ...newStaffList]);
                }
            });

        APIService.getLeaveTypes()
            .then((response) => {
                if (response.data?.status) {
                    setLeaveTypeList(response.data?.data);
                }
            });

        const currentYear = new Date().getFullYear();
        const yearTempList = [{ label: "Select Year", value: 0 }];
        for (let i = currentYear - 3; i <= currentYear + 1; i++) {
            yearTempList.push({ label: i, value: i });
        }
        setYearList(yearTempList);
    }, []);

    useEffect(() => {
        fetchLeaveList();
        setFirstLoad(false);
    }, [sort, sortby, page, perPageSize]);

    useEffect(() => {
        if (firstLoad === false) {
            setPage(1);
            if (page === 1) {
                const timer = setTimeout(() => {
                    fetchLeaveList();
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [searchFilter, staffId, reloadPage, year]);

    const fetchLeaveList = () => {
        setTableLoader(true);
        let params = "?";
        params = params + "sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby;
        if (searchFilter !== '') {
            params = params + "&search=" + searchFilter;
        }

        if (staffId !== 0) {
            params = params + "&staff_id=" + staffId;
        }
        if (year !== 0) {
            params = params + "&year=" + year;
        }

        APIService.getLeaveBucketLists(params)
            .then((response) => {
                if (response.data?.status) {
                    let newData = response.data?.data;
                    setTotalPages(response.data?.pagination?.total_pages);
                    setTotalRecords(response.data?.pagination?.total_records);
                    setLeaveList(newData);
                    setTableLoader(false);
                    let exportHeader = ["#", "Employee", "Year", "Leave Type", "Leave Allowed", "Date Added"];
                    let exportData = [];
                    newData?.map(item => {
                        exportData.push(
                            {
                                id: item.id,
                                empname: item.empname,
                                year: item.year,
                                leave_type: item.leave_type,
                                leaves_allowed: item.leaves_allowed,
                                created: item.updated_at ? moment(item.updated_at).format(office_display_date_format_with_time) : '',
                            });
                        return '';
                    });
                    setExportData({ fileName: "leave-bucket-data", sheetTitle: "Leave Bucket", exportHeader: exportHeader, exportData: exportData });
                }
            });
    }

    let columns = [
        {
            Header: 'Employee',
            id: 'empname',
            accessor: (row) => (
                <>
                    {userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.hrCode ?
                        <span className='cursor-pointer text-primary' onClick={() => setStaffId(row?.staff_id)}>{row?.empname}</span>
                        :
                        <span>{row?.empname}</span>
                    }
                </>
            )
        },
        {
            Header: 'Year',
            id: 'year',
            accessor: (row) => row?.year,
        },        
        {
            Header: 'Leave Type',
            id: 'leave_type',
            accessor: (row) => row?.leave_type,
        },
        {
            Header: 'Leave Allowed',
            id: 'leaves_allowed',
            accessor: (row) => row?.leaves_allowed,
        },
        {
            Header: 'Date Updated',
            id: 'updated_at',
            accessor: (row) => row?.updated_at && format(new Date(row?.updated_at), office_display_date_format_with_time),
        },
    ];

    if (check(['leavebucket.update'], userData?.role.getPermissions)) {
        columns = [
            ...columns,
            {
                Header: 'Action',
                disableSortBy: true,
                accessor: (row) => (
                    <>
                        <Dropdown className="category-dropdown edit-task-dropdown">
                            <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="cursor-pointer" id="edit-task"><button size="sm" className='btn btn-white circle-btn btn-icon btn-sm'><i className="fa-solid fa-ellipsis-vertical"></i></button></Dropdown.Toggle>
                            <Dropdown.Menu as="ul" align="down" className="dropdown-menu-end p-2" popperConfig={popperConfig}>
                                <PermissionCheck permissions={['leavebucket.update']}>
                                    <Dropdown.Item onClick={() => { handleLeaveEdit(row?.id) }}>
                                        Edit
                                    </Dropdown.Item>
                                </PermissionCheck>
                            </Dropdown.Menu>
                        </Dropdown>
                    </>
                ),
            },
        ]
    }

    const handleLeaveEdit = async (id) => {
        let editLeaveData = leaveList.filter(function (arr) {
            return arr.id === id;
        });
        if (editLeaveData.length > 0) {
            clearControl();
            let data = editLeaveData[0];
            setStaffIdForAdd(data?.staff_id);
            setYearForAdd(data?.year);
            setLeavesAllowed(data?.leaves_allowed);
            //setLeaveDescription(data?.description);
            setLeaveType(data?.leave_type);
            setLeaveId(data?.id);
            cstShowAddLeaveModal();
        }
    };

    const applyForLeave = async () => {
        clearControl();
        cstShowAddLeaveModal();
    };

    const handleStaffSelect = e => {
        setStaffId(e.value);
    };

    const handleYearSelect = e => {
        setYear(e.value);
    };

    const addUpdateLeave = async () => {
        setSaveProcess(true);
        setFormErrors([]);
        let validate = validateForm((LeaveBucketValidator(staffIdForAdd, yearForAdd !== '0' ? yearForAdd : '', leaveType, leavesAllowed, leaveDescription)));
        if (Object.keys(validate).length) {
            setSaveProcess(false);
            setFormErrors(validate);
        }
        else {
            let params = {};
            params["staff_id"] = staffIdForAdd;
            params["leave_type"] = leaveType;
            params["leaves_allowed"] = leavesAllowed;
            params["description"] = leaveDescription;
            params["year"] = yearForAdd;

            if (leaveId === 0) {
                APIService.addAllowedLeave(params)
                    .then((response) => {
                        if (response.data?.status) {
                            toast.success(response.data?.message, {
                                position: toast.POSITION.TOP_RIGHT
                            });
                            setReloadPage(!reloadPage);
                            clearControl();
                            cstSetCloseAddLeaveModal();
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
            else {
                params['id'] = leaveId;
                APIService.updateLeaveAllowed(params)
                    .then((response) => {
                        if (response.data?.status) {
                            toast.success(response.data?.message, {
                                position: toast.POSITION.TOP_RIGHT
                            });
                            setReloadPage(!reloadPage);
                            clearControl();
                            cstSetCloseAddLeaveModal();
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
        }
    };

    const clearControl = async () => {
        setStaffIdForAdd('');
        setYearForAdd(new Date().getFullYear());        
        setLeaveType('');
        setLeavesAllowed('');
        setLeaveDescription('');
        setLeaveId(0);
        setFormErrors([]);
    };

    const handleClearFilter = async (e) => {
        setStaffId(0);
        setYear(new Date().getFullYear());
    };

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
            <Sidebar />
            <div className="main-content">
                <Header pagename={name} headerFilterButton={<Button onClick={cstPageOffcanvasisShow} variant="outline-secondary" size="md" type="button" className='ms-auto d-xl-none d-block'>Filter <i className="icon-filter ms-2"></i></Button>}/>
                <div className="inner-content pt-0 px-0">
                    <div className="leave-bucket-page">
                        <div className="bg-white py-3 px-4 px-xl-7 page-inner-header">
                            {/*  */}
                            <Row className="g-2">
                                <Col xl="auto"className="me-md-auto">
                                    <PermissionCheck permissions={['leavebucket.create']}>
                                        <Button variant="primary" size="md" onClick={applyForLeave}>Add Leave Bucket</Button>
                                    </PermissionCheck>
                                </Col>
                                <Col> 
                                <div className={"custom-page-offcanvas " + (isPageOffcanvasisActive ? 'active' : '')}>
                                    <div className='custom-page-offcanvas-header border-bottom border-gray-100 py-2 px-4 d-xl-none'>
                                        <h5 className='m-0'>Filter</h5>
                                        <Button type="button" variant="white" size='sm' className="btn-icon circle-btn btn" onClick={cstPageOffcanvasisHide}><i className="icon-cancel"></i></Button>
                                    </div>
                                    <div className='custom-page-offcanvas-body p-xl-0 p-4'>
                                        <Row className="g-2 justify-content-xl-end">  
                                            <Col xs={12} lg={4} xl={4} xxl={3}>
                                                {userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.hrCode ?
                                                    <Select styles={customStyles} className="control-md custom-select" options={searchStaffList} onChange={handleStaffSelect}
                                                        value={searchStaffList.filter(function (option) {
                                                            return option.value === staffId;
                                                        })} />
                                                    : ''
                                                }
                                            </Col>
                                            <Col xs={12} lg={4} xl={4} xxl={3}>
                                                <Select styles={customStyles} className="control-md custom-select" options={yearList} onChange={handleYearSelect} placeholder={<div>Select Year</div>}
                                                value={yearList.filter(function (option) {
                                                    return option.value === year;
                                                })} />
                                            </Col>
                                            <Col xs={12} className='mt-4 d-xl-none d-block'>
                                                <hr className='m-0' />
                                            </Col>
                                            <Col xl="auto" className='d-flex gap-2 flex-xl-row flex-row-reverse justify-content-sm-start justify-content-between'>
                                                <Button variant="primary" size="md" type="button" onClick={() => { cstPageOffcanvasisHide() }} className='d-xl-none'>Search</Button>
                                                <Button variant="soft-secondary" size="md" type="button" onClick={() => { handleClearFilter() }}> Clear </Button>
                                            </Col>
                                        </Row>
                                    </div>
                                    </div>
                                </Col>
                            </Row>
                            {/*  */}
                        </div>
                        <div className="pt-4 pt-lg-5 pt-xl-9 px-0 px-lg-4 px-xl-7">
                            <Card className="rounded-10 p-4 p-xl-6">
                                <Card.Body className="p-0">
                                    <DataTableWithPagination columns={columns} data={leaveList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isExportable={true} exportData={exportData} />
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                    <Offcanvas show={showAddLeaveModal} onHide={cstSetCloseAddLeaveModal} className="add-leave-sidebar" placement="end">
                        <Offcanvas.Header className="p-4 px-6 border-bottom border-gray-100">
                            <div className="d-flex align-items-center">
                                <h3 className="m-0">Leave Bucket</h3>
                            </div>
                            <ul className="ovrlay-header-icons">
                                <li>
                                    <button type="button" className="btn-icon circle-btn btn btn-white btn-sm" onClick={cstSetCloseAddLeaveModal}>
                                        <i className="icon-cancel"></i>
                                    </button>
                                </li>
                            </ul>
                        </Offcanvas.Header>
                        <Offcanvas.Body className="p-0">
                            <Form onSubmit={async e => { e.preventDefault(); await addUpdateLeave() }}>
                                <SimpleBar className="offcanvas-inner">
                                    <div className="p-6">
                                        <Row className="g-7">
                                            <Col xs={12} sm={12} md={12}>
                                                <Form.Label className="d-block">Employee<span className='validation-required-direct'></span></Form.Label>
                                                <Select styles={customStyles} className="control-md custom-select" options={staffList} onChange={(e) => setStaffIdForAdd(e.value)}
                                                    value={staffList.filter(function (option) {
                                                        return option.value === staffIdForAdd;
                                                    })} />
                                                {formErrors.staffInput && (
                                                    <span className="text-danger">{formErrors.staffInput}</span>
                                                )}
                                            </Col>
                                            <Col xs={12} sm={12} md={6}>
                                                <Form.Label className="d-block">Year<span className='validation-required-direct'></span></Form.Label>
                                                <Form.Select aria-label="Select Year" value={yearForAdd} onChange={(e) => { setYearForAdd(e.target.value) }} className={`${formErrors.yearInput && 'is-invalid'}`}>
                                                    {yearList?.map((year, index) => (
                                                        <option value={year.value} key={index}>{year.label}</option>
                                                    ))}
                                                </Form.Select>
                                                {formErrors.yearInput && (
                                                    <span className="text-danger">{formErrors.yearInput}</span>
                                                )}
                                            </Col>                                            
                                            <Col xs={12} sm={12} md={6}>
                                                <Form.Label className="d-block">Leave Type<span className='validation-required-direct'></span></Form.Label>
                                                <Form.Select aria-label="Select Leave" value={leaveType} onChange={(e) => { setLeaveType(e.target.value) }} className={`${formErrors.leaveTypeInput && 'is-invalid'}`}>
                                                    <option value="">Select Leave Type</option>
                                                    {leaveTypeList?.map((type, index) => (
                                                        <option value={type} key={index}>{type}</option>
                                                    ))}
                                                </Form.Select>
                                                {formErrors.leaveTypeInput && (
                                                    <span className="text-danger">{formErrors.leaveTypeInput}</span>
                                                )}
                                            </Col>
                                            <Col xs={12} sm={12} md={6}>
                                                <Form.Label className="d-block">Leave Allowed<span className='validation-required-direct'></span></Form.Label>
                                                <Form.Control type='number' rows={3} placeholder="Leave Allowed" value={leavesAllowed} onChange={(e) => { setLeavesAllowed(e.target.value) }} className={`description-area placeholder-dark  dark-2 ${formErrors.leavesAllowedInput && 'is-invalid'}`} />
                                                {formErrors.leavesAllowedInput && (
                                                    <span className="text-danger">{formErrors.leavesAllowedInput}</span>
                                                )}
                                            </Col>
                                            <Col xs={12}>
                                                <Form.Label className="d-block">Description<span className='validation-required-direct'></span></Form.Label>
                                                <Form.Control as="textarea" rows={3} placeholder="Add Leave Reason" value={leaveDescription} onChange={(e) => { setLeaveDescription(e.target.value) }} className={`description-area placeholder-dark  dark-2 ${formErrors.leaveDescriptionInput && 'is-invalid'}`} maxLength={300} />
                                                {formErrors.leaveDescriptionInput && (
                                                    <span className="text-danger">{formErrors.leaveDescriptionInput}</span>
                                                )}
                                            </Col>
                                        </Row>
                                    </div>
                                </SimpleBar>
                                <div className="add-comment-area  px-6 py-3 border-top border-gray-100 text-end">
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
                        </Offcanvas.Body>
                    </Offcanvas>
                </div>
                <Footer />
            </div>
        </>
    );
}
const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(LeaveBucket)