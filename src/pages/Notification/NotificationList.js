import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import APIService from "../../api/APIService";
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import { pagination, display_date_format, databaseRoleCode, taskStatusList } from '../../settings';
import ReactImageFallback from "react-image-fallback";
import AvatarImg from "../../assets/img/placeholder-image.png";
import moment from 'moment';
import { Link } from "react-router-dom";
import { Button, Card, Row, Col, OverlayTrigger, Tooltip, Offcanvas } from 'react-bootstrap';
import Store from "../../store";
import { setNotificationData } from "../../store/reducers/App";
import Select from 'react-select';
import { connect } from "react-redux";
import SimpleBar from 'simplebar-react';

function NotificationList({ name, userData }) {

    const [firstLoad, setFirstLoad] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchFilter, setSearchFilter] = useState('');
    const [sort, setSort] = useState(pagination.sorting);
    const [sortby, setSortBy] = useState('id');
    const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
    const [notificationList, setNotificationList] = useState([]);
    const [exportData, setExportData] = useState([]);
    const [refreshPage, setRefreshPage] = useState(false);
    const [tableLoader, setTableLoader] = useState(false);

    const [isPageOffcanvasisActive, setIsPageOffcanvasisActive] = useState(false);
    const [reloadPage, setReloadPage] = useState(false);
    const [agencyList, setAgencyList] = useState([]);
    const [agency, setAgency] = useState(0);
    const [taskStatusForFilter, setTaskStatusForFilter] = useState('');
    const taskStatusListForFilter = [{ label: 'Select Status', value: '' }, ...taskStatusList];
    const [taskTypeList, setTaskTypeList] = useState([]);
    const [taskType, setTaskType] = useState('');

    const [filtershow, filtersetShow] = useState(false);
    const filterhandleClose = () => filtersetShow(false);
    const filterhandleShow = () => filtersetShow(true);

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

    const fetchNotificationList = () => {
        setTableLoader(true);
        let params = "?sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby;
        if (searchFilter !== '') {
            params = params + "&search=" + searchFilter;
        }

        if (agency !== 0) {
            params = params + "&search_by_agency=" + agency;
        }

        if (taskStatusForFilter !== '') {
            params = params + "&search_by_status=" + taskStatusForFilter;
        }

        if (taskType !== '') {
            params = params + "&search_by_type=" + taskType;
        }

        APIService.getNotificationWithLoader(params)
            .then((response) => {
                if (response.data?.status) {
                    setTotalPages(response.data?.pagination?.total_pages);
                    setTotalRecords(response.data?.pagination?.total_records);
                    setNotificationList(response.data?.data);
                    setTableLoader(false);
                    let exportHeader = ["#", "From", "Title", "Description", "Date"];
                    let exportData = [];
                    response.data?.data?.map(item => {
                        exportData.push(
                            {
                                id: item.id,
                                name: item.name,
                                title: item.title ? item.title : '',
                                description: item.description ? item.description : '',
                                date: item.date ? moment(item.date).format(display_date_format) : '',
                            });
                        return '';
                    });
                    setExportData({ fileName: "notification-data", sheetTitle: "Notification", exportHeader: exportHeader, exportData: exportData });
                }
                else {
                    setNotificationList([]);
                }
            });
    }

    useEffect(() => {
        // fetchNotificationList();
        setFirstLoad(false);
    }, [sort, sortby, page, perPageSize, refreshPage]);

    useEffect(() => {
        if (firstLoad === false) {
            setPage(1);
            if (page === 1) {
                const timer = setTimeout(() => {
                    // fetchNotificationList();
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [searchFilter, reloadPage, agency, taskStatusForFilter, taskType]);

    const handleNotificationClick = (id, link = '') => {
        const params = {};
        params['mark_as'] = 'single';
        params['id'] = id;
        APIService.markAllAsReadProcess(params)
            .then((response) => {
                if (response.data?.status) {
                    let tempList = notificationList;
                    tempList.forEach(list => {
                        if (id === list.id)
                            list.isread = 1;
                    });
                    Store.dispatch(setNotificationData(tempList));
                    setRefreshPage(!refreshPage);
                }
            });
    }

    const columns = [
        {
            Header: 'From',
            id: 'from_fullname',
            accessor: (notificationList) => notificationList.name,
            Cell: ({ row }) => (
                <>
                    <Link to={row?.original?.link} target="_blank" className="media cursor-pointer align-items-center text-black">
                        <span className="d-flex align-items-center">
                            <span className="avatar avatar-md avatar-circle me-2 d-flex align-items-center justify-content-center">
                                {row?.original?.profile_image !== '' && row?.original?.profile_image !== null ?
                                    <ReactImageFallback
                                        src={`${row?.original?.profile_image}`}
                                        fallbackImage={AvatarImg}
                                        initialImage={AvatarImg}
                                        alt={row?.original?.name}
                                        className="avatar-img"
                                    />
                                    :
                                    <img src={AvatarImg} alt={row?.original?.name} className="avatar-img" />
                                }
                            </span>
                        </span>
                        <div className="media-body ps-1">
                            <span className="d-flex align-items-center">
                                <span className="">{row?.original?.name}</span>
                            </span>
                        </div>
                    </Link>
                </>
            ),
        },
        {
            Header: 'Title',
            id: 'additional_data',
            accessor: (notificationList) => notificationList.additional_data,
            Cell: ({ row }) => (
                <>
                    <Link to={row?.original?.link} target="_blank" className='cursor-pointer text-black'>
                        {row?.original?.additional_data}
                    </Link>
                </>
            ),
        },
        {
            Header: 'Description',
            id: 'description',
            disableSortBy: true,
            //accessor: (notificationList) => notificationList.description,
            Cell: ({ row }) => (
                <>
                    <Link to={row?.original?.link} target="_blank" className='cursor-pointer text-black'>
                        {row?.original?.description}
                    </Link>
                </>
            ),
        },
        {
            Header: 'Date',
            id: 'date',
            accessor: (notificationList) => notificationList.date && moment(notificationList.date).format(display_date_format),
        },
        {
            Header: 'Action',
            disableSortBy: true,
            accessor: (row) => (
                <>
                    {row?.isread === 0 &&
                        <Button variant="primary" className='text-nowrap' size="sm" onClick={() => { handleNotificationClick(row?.id, row?.isread, row?.link); }}>Mark as read</Button>
                    }
                </>
            ),
        },
    ];

    const cstPageOffcanvasisShow = () => {
        setIsPageOffcanvasisActive(true);
        document.body.style.overflow = 'hidden';
    };
    const cstPageOffcanvasisHide = () => {
        setIsPageOffcanvasisActive(false);
        document.body.style.overflow = '';
    };

    const handleClearFilter = async (e) => {
        setAgency(0);
        setSearchFilter('');
        setTaskStatusForFilter('');
        setTaskType('');
        setReloadPage(!reloadPage);
    };
    const handleAgencySelect = (selectedAgency) => {
        setAgency(selectedAgency?.value);
    };

    useEffect(() => {
        if (userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.accountantCode || userData?.role_code === databaseRoleCode.pcCode) {
            APIService.getAllAgency()
                .then((response) => {
                    if (response.data?.status) {
                        let newAgencyList = response.data?.data.map(item => {
                            return { label: item.agency_name, value: item.staffid }
                        });
                        setAgencyList([{ label: 'All Agency', value: 0 }, ...newAgencyList]);
                    }
                });
        }

        setTaskTypeList([{ label: 'All', value: '' }, { label: 'Dev', value: 'dev' }, { label: 'Site Addons', value: 'addon' }]);

    }, []);

    const handleTaskStatusSelectForFilter = (e) => {
        setTaskStatusForFilter(e.value);
    };

    const handleTaskTypeSelect = (selected) => {
        setTaskType(selected?.value);
    };

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <Header pagename={name ? name : ''} headerFilterButton={<Button onClick={filterhandleShow} variant="outline-secondary" size="md" type="button" className='ms-auto d-xl-none d-block'>Filter <i className="icon-filter ms-2"></i></Button>}  />
                <div className="inner-content pt-0 px-0">
                    <div className="bg-white py-0 px-0 py-xl-3 px-xl-7 page-inner-header">
                        <div className={"custom-page-offcanvas " + (isPageOffcanvasisActive ? 'active' : '')}>
                            <div className='custom-page-offcanvas-header border-bottom border-gray-100 py-2 px-4 d-xl-none'>
                                <h5 className='m-0'>Filter</h5>
                                <Button type="button" variant="white" size='sm' className="btn-icon circle-btn btn" onClick={cstPageOffcanvasisHide}><i className="icon-cancel"></i></Button>
                            </div>
                            <div className='custom-page-offcanvas-body p-xl-0 p-4'>
                                <Row className="g-2 justify-content-md-end">
                                    {userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.accountantCode || userData?.role_code === databaseRoleCode.pcCode ?
                                        <>
                                            <Col xxl={3} xl={3} sm={6}>
                                                <Select styles={customStyles} className="control-md custom-select" options={agencyList} onChange={handleAgencySelect}
                                                    value={agencyList.filter(function (option) {
                                                        return option.value === agency;
                                                    })} />
                                            </Col>

                                            <Col xxl={2} xl={2} sm={6}>
                                                <Select styles={customStyles} className="control-md custom-select" options={taskStatusListForFilter} onChange={handleTaskStatusSelectForFilter}
                                                    value={taskStatusListForFilter.filter(function (option) {
                                                        return option.value === taskStatusForFilter;
                                                    })} />
                                            </Col>

                                            <Col xxl={2} xl={2} sm={6}>
                                                <Select styles={customStyles} className="control-md custom-select" classNamePrefix="react-select" options={taskTypeList} onChange={handleTaskTypeSelect}
                                                    value={taskTypeList.filter(function (option) {
                                                        return option.value === taskType;
                                                    })} />
                                            </Col>

                                            <Col xs={12} className='mt-4 d-xl-none'>
                                                <hr className='m-0' />
                                            </Col>
                                            <Col xl="auto" className='d-flex gap-2 flex-xl-row flex-row-reverse justify-content-lg-start justify-content-between '>

                                                <OverlayTrigger placement='bottom' overlay={<Tooltip>Clear Filter</Tooltip>}>
                                                    <Button variant="soft-secondary" size="md" type="button" onClick={() => { handleClearFilter() }}><span>Clear Filter</span></Button>
                                                </OverlayTrigger>
                                            </Col>

                                        </>
                                        : ''
                                    }
                                </Row>
                            </div>

                        </div>
                    </div>

                    {/* Filter For Mobile Start*/}
                    <Offcanvas show={filtershow} onHide={filterhandleClose} placement="bottom" className="task-filter-overlay d-xl-none border-top-0">
                        <Offcanvas.Header closeButton className="border-gray-100 border-bottom">
                            <Offcanvas.Title>Filter</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body className="py-5">
                            <SimpleBar className="offcanvas-inner">
                                <Row className="g-5 align-items-center">
                                    <Col xs="12">
                                        <Select styles={customStyles} className="control-md custom-select" options={agencyList} onChange={handleAgencySelect}
                                            value={agencyList.filter(function (option) {
                                                return option.value === agency;
                                            })} />
                                    </Col>
                                    <Col xs="12">
                                        <Select styles={customStyles} className="control-md custom-select" options={taskStatusListForFilter} onChange={handleTaskStatusSelectForFilter}
                                            value={taskStatusListForFilter.filter(function (option) {
                                                return option.value === taskStatusForFilter;
                                            })} />
                                    </Col>
                                    <Col xs="12">
                                        <Select styles={customStyles} className="control-md custom-select" classNamePrefix="react-select" options={taskTypeList} onChange={handleTaskTypeSelect}
                                            value={taskTypeList.filter(function (option) {
                                                return option.value === taskType;
                                            })} />
                                    </Col>                                    
                                </Row>
                            </SimpleBar>
                        </Offcanvas.Body>
                        <div className="py-3 px-5 border-top border-gray-100 text-end filter-action-button add-comment-area">
                            <Button variant="soft-secondary" size="md" type="button" onClick={() => { handleClearFilter() }}>Clear Filter</Button>
                            <Button className="ms-4" variant="primary" size="md" type="button" onClick={() => { filterhandleClose(); }}>Apply Filter</Button>
                        </div>
                    </Offcanvas>
                    {/* Filter For Mobile End*/}

                    <div className="pt-4 pt-lg-5 pt-xl-9 px-0 px-lg-4 px-xl-7">
                        <Card className="rounded-10 p-6">
                            <Card.Body className="p-0 static-datatable-card-body">
                                <DataTableWithPagination columns={columns} data={notificationList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isExportable={true} exportData={exportData} hideSearchBox={true} />
                            </Card.Body>
                        </Card>
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

export default connect(mapStateToProps)(NotificationList)
