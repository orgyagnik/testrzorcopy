import React, { useState, useEffect, Fragment, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import { connect } from "react-redux";
import APIService from "../../api/APIService";
import moment from 'moment';
import Select from 'react-select';
import RangeDatePickerControl from '../../modules/custom/RangeDatePickerControl';
import { format } from 'date-fns';
import { DownloadTableExcel } from "react-export-table-to-excel";
import NoPermission from '../auth/NoPermission';
import { databaseRoleCode, pcHeadId } from '../../settings';

function TaskboardHoursReport({ userData, name }) {
    const [reportList, setReportList] = useState([]);
    const [startDate, setStartDate] = useState(moment().startOf('month')._d);
    const [endDate, setEndDate] = useState(moment(moment().endOf('month').format('YYYY-MM-DD'))._d);
    const [reloadPage, setReloadPage] = useState(false);
    const [agency, setAgency] = useState(0);
    const [agencyList, setAgencyList] = useState([]);
    const [searchFilter, setSearchFilter] = useState('');
    const [countTableTotal, setCountTableTotal] = useState([]);
    const tableRef = useRef(null);
    const [refreshDesign, setRefreshDesign] = useState(false);

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

    const getMaxDateRecords = (records) => {
        var max = null;
        for (var i = 0; i < records.length; i++) {
            var current = records[i];
            if (max === null || moment(max.plan_date).isBefore(current.plan_date, 'date')) {
                max = current;
            }
        }
        return max;
    };

    useEffect(() => {
        if (userData.role_code === databaseRoleCode.adminCode || userData.role_code === databaseRoleCode.accountantCode || userData?.designation === pcHeadId ) {
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
    }, []);

    useEffect(() => {
        if (userData.role_code === databaseRoleCode.adminCode || userData.role_code === databaseRoleCode.accountantCode || userData?.designation === pcHeadId ) {
            const timer = setTimeout(() => {
                fetchTaskboardHourlyReport();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchFilter, reloadPage]);

    const fetchTaskboardHourlyReport = () => {
        let params = "?";
        if (searchFilter !== '') {
            params = params + "&search=" + searchFilter;
        }

        if (startDate && endDate) {
            params = params + "&startdate=" + format(startDate, "yyyy-MM-dd");
            params = params + "&enddate=" + format(endDate, "yyyy-MM-dd");
        }

        if (agency !== 0) {
            params = params + "&search_by_agency=" + agency;
        }

        APIService.getTaskboardHourlyReport(params)
            .then((response) => {
                if (response.data?.status) {
                    let newData = response.data?.data;
                    setReportList(newData);
                    let gd_total = 0, main_total_hours = 0, main_addon_total_hours = 0, main_bucket_total_hours = 0;
                    let dt_total_1 = 0, dt_addon_total = 0, dt_bucket_total = 0;
                    newData?.date_group.map((dateVal) => {
                        dt_total_1 = 0;
                        dt_addon_total = 0;
                        dt_bucket_total = 0;
                        newData?.agency_group.map((agency) => {
                            let selectedAgencyData = newData?.data.filter(function (arr) { return arr.agency_name === agency && arr.RepDate === dateVal; });
                            let plan_hours = 0;
                            if (selectedAgencyData.length > 0) {
                                plan_hours = selectedAgencyData[0].plan_hours;
                                dt_total_1 = dt_total_1 + selectedAgencyData[0].hours;
                                gd_total = gd_total + plan_hours;
                                dt_addon_total = dt_addon_total + selectedAgencyData[0].addon_hours;
                                dt_bucket_total = dt_bucket_total + selectedAgencyData[0].bucket_hours;
                            }
                            else {
                                let selectedAgencyDataNew = newData?.plan_group?.filter(function (arr) { return arr.agency_name === agency && (moment(arr.plan_date).isBefore(dateVal, 'date') || arr.plan_date === dateVal); });
                                if (selectedAgencyDataNew.length > 0) {
                                    let selectedDateRecord = getMaxDateRecords(selectedAgencyDataNew);
                                    if (selectedDateRecord?.plan_hours) {
                                        gd_total = gd_total + selectedDateRecord?.plan_hours;
                                    }
                                }
                            }
                            return '';
                        });
                        main_total_hours = main_total_hours + dt_total_1;
                        main_addon_total_hours = main_addon_total_hours + dt_addon_total;
                        main_bucket_total_hours = main_bucket_total_hours + dt_bucket_total;
                        return '';
                    });
                    setCountTableTotal({ "gd_total": gd_total, "main_total_hours": main_total_hours, "main_addon_total_hours": main_addon_total_hours, "main_bucket_total_hours" : main_bucket_total_hours });
                    setTimeout(() => {
                        setRefreshDesign(!refreshDesign);
                    }, 500);
                }
            });
    }

    const handleClearFilter = async (e) => {
        setStartDate(moment().startOf('month')._d);
        setEndDate(moment().endOf('month')._d);
        setAgency(0);
        setSearchFilter('');
        setReloadPage(!reloadPage);
    };

    const handleFilter = async (e) => {
        setReloadPage(!reloadPage);
    };

    const handleAgencySelect = (selectedAgency) => {
        setAgency(selectedAgency?.value);
    };

    useEffect(() => {
    }, [refreshDesign]);

    const onChangeDateRange = dates => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    }

    return (
        <>
            {userData.role_code === databaseRoleCode.adminCode || userData.role_code === databaseRoleCode.accountantCode || userData.designation === pcHeadId ?
                <>
                    <Sidebar />
                    <div className="main-content">
                        <Header pagename={name} />
                        <div className="inner-content pt-0 px-0">
                            <div className="taskboard-hours-report-page">
                                <div className="bg-white py-3 px-4 px-lg-7 page-inner-header">
                                    <Row className="g-2 g-xl-4 justify-content-end">
                                        <Col xs={12} sm={12} md={3} lg={4} xl={3} xxl={3}>
                                            <Select styles={customStyles} className="control-md custom-select" options={agencyList} onChange={handleAgencySelect}
                                                value={agencyList.filter(function (option) {
                                                    return option.value === agency;
                                                })} />
                                        </Col>
                                        <Col xs={12} sm={12} md={4} lg={5} xl={4} xxl={3}>
                                            <RangeDatePickerControl
                                                selected={startDate}
                                                startDate={startDate}
                                                endDate={endDate}
                                                onChange={onChangeDateRange}
                                            />
                                        </Col>
                                        <Col md="auto" xs='auto' className='order-md-3 order-4'>
                                            <Button variant="primary" size="md" type="button" onClick={() => { handleFilter() }}>Search</Button>
                                        </Col>
                                        <Col md="auto" xs='auto' className='order-md-4 order-3'>
                                            <OverlayTrigger placement='bottom' overlay={<Tooltip>Clear Filter</Tooltip>}>
                                                <Button variant="soft-secondary" size="md" type="button" onClick={() => { handleClearFilter() }}><span className="icon-cancel d-md-inline-block d-none"></span><span className="d-md-none"> Clear </span></Button>
                                            </OverlayTrigger>
                                        </Col>
                                    </Row>
                                </div>
                                <div className="pt-9 px-4 px-lg-7">
                                    <Card className="rounded-10 p-6">
                                        <Card.Body className="p-0">
                                            {reportList?.data &&
                                                <>
                                                    {tableRef.current &&
                                                        <DownloadTableExcel filename="agency-hourly-report" sheet="Agency Hourly Report" currentTableRef={tableRef.current}>
                                                            <Button className="export-btns mb-2 px-3" variant="soft-secondary" size="md"><i className="icon-file-excel"></i><span className="d-xl-inline-block d-none text-nowrap ms-2">Export to Excel</span></Button>
                                                        </DownloadTableExcel>
                                                    }
                                                    <div className="table-responsive">
                                                        <table className="table dt-table scroll-responsive dt-inline dataTable no-footer" ref={tableRef}>
                                                            <thead>
                                                                <tr role="row">
                                                                    <th><b>Agency Name</b></th>
                                                                    <th><b>Type</b></th>
                                                                    <th><b>Total Hours</b></th>
                                                                    <th><b>Total Assinged Hours</b></th>
                                                                    <th><b>Total Logged Hours</b></th>
                                                                    <th><b>Total Billable Hours</b></th>
                                                                    {reportList?.date_group.map((dateVal, index) => (
                                                                        <th key={index}><b>{dateVal}</b></th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {reportList?.agency_group.map((agency, agency_index) => {
                                                                    let tot_hours = 0, grand_tot_hours = 0, tot_addon_hours = 0; 
                                                                    let tot_bucket_hours = 0;
                                                                    reportList?.date_group.map((date) => {
                                                                        let selectedAgencyData = reportList?.data.filter(function (arr) { return arr.agency_name === agency && arr.RepDate === date; });
                                                                        if (selectedAgencyData.length > 0) {
                                                                            tot_hours = tot_hours + selectedAgencyData[0].hours;
                                                                            tot_addon_hours = tot_addon_hours + selectedAgencyData[0].addon_hours;
                                                                            // Bucket hours
                                                                            tot_bucket_hours = tot_bucket_hours + selectedAgencyData[0].bucket_hours;
                                                                            grand_tot_hours = grand_tot_hours + selectedAgencyData[0].plan_hours;
                                                                        }
                                                                        else {
                                                                            let selectedAgencyDataNew = reportList?.plan_group?.filter(function (arr) { return arr.agency_name === agency && (moment(arr.plan_date).isBefore(date, 'date') || arr.plan_date === date); });
                                                                            if (selectedAgencyDataNew.length > 0) {
                                                                                let selectedDateRecord = getMaxDateRecords(selectedAgencyDataNew);
                                                                                if (selectedDateRecord?.plan_hours) {
                                                                                    grand_tot_hours = grand_tot_hours + selectedDateRecord?.plan_hours;
                                                                                }
                                                                            }
                                                                        }
                                                                        return '';
                                                                    });
                                                                    
                                                                    let selectedAgencyHourData = reportList?.agency_hour_group.filter(function (arr) { return arr.agency_name === agency; });
                                                                    
                                                                    let rowSpan = 1;
                                                                    return <Fragment key={agency_index}>
                                                                        
                                                                        <tr role="row" className="odd" key={`dev-${agency_index}`}>
                                                                            <td rowSpan={(rowSpan + (tot_addon_hours > 0 ? 1 : 0) + (tot_bucket_hours > 0 ? 1 : 0))} style={{verticalAlign: 'middle'}}
                                                                            ><b>{agency ? agency : ''}</b></td>
                                                                            <td><b>Development</b></td>
                                                                            <td>{grand_tot_hours.toFixed(1)}</td>
                                                                            <td>{tot_hours.toFixed(1)}</td>
                                                                            <td>{selectedAgencyHourData[0]?.total_hours}</td>
                                                                            <td>{selectedAgencyHourData[0]?.total_billable_hours}</td>
                                                                            {reportList?.date_group.map((dateVal, index) => {
                                                                                let selectedAgencyData = reportList?.data.filter(function (arr) { return arr.agency_name === agency && arr.RepDate === dateVal; });
                                                                                let hours = 0;
                                                                                let plan_hours = 0;
                                                                                let style = {};
                                                                                let plan_name = '';
                                                                                if (selectedAgencyData.length > 0) {
                                                                                    hours = selectedAgencyData[0].hours;
                                                                                    plan_hours = selectedAgencyData[0].plan_hours;
                                                                                    plan_name = selectedAgencyData[0].plan_name;
                                                                                    if (plan_hours < hours) {
                                                                                        style = { background: "red", color: "#fff" };
                                                                                    }
                                                                                }
                                                                                return <td key={`dev-${agency_index}${index}`} style={style}>
                                                                                    {hours.toFixed(1)} <br /> {plan_name && hours > 0 ? `(${plan_name})` : ''}
                                                                                </td>
                                                                            })}
                                                                        </tr>
                                                                        
                                                                        {tot_addon_hours > 0 &&
                                                                            <tr role="row" key={`addon-${agency_index}`}>
                                                                                
                                                                                <td><b>Addon</b></td>
                                                                                <td>-</td>
                                                                                <td>{tot_addon_hours.toFixed(1)}</td>
                                                                                <td>-</td>
                                                                                <td>-</td>
                                                                                {reportList?.date_group.map((dateVal, index) => {
                                                                                    let selectedAgencyData = reportList?.data.filter(function (arr) { return arr.agency_name === agency && arr.RepDate === dateVal; });
                                                                                    let addon_hours = 0; let plan_name = '';
                                                                                    if (selectedAgencyData.length > 0) {
                                                                                        addon_hours = selectedAgencyData[0].addon_hours;
                                                                                        plan_name = selectedAgencyData[0].plan_name;
                                                                                    }
                                                                                    return <td key={`addon-${agency_index}${index}`}>{addon_hours ? addon_hours.toFixed(1) : 0.00}
                                                                                    <br/> {plan_name && addon_hours > 0 ? `(${plan_name})` : ''}
                                                                                    </td>
                                                                                })}
                                                                            </tr>
                                                                        }
                                                                        {tot_bucket_hours > 0 &&
                                                                            <tr role="row" key={`bucket-${agency_index}`}>
                                                                               
                                                                                <td><b>Bucket</b></td>
                                                                                <td>-</td>
                                                                                <td>{tot_bucket_hours.toFixed(1)}</td>
                                                                                <td>{selectedAgencyHourData[0]?.total_bucket_logged_hours}</td>
                                                                                <td>-</td>
                                                                                {reportList?.date_group.map((dateVal, index) => {
                                                                                    let selectedAgencyData = reportList?.data.filter(function (arr) { return arr.agency_name === agency && arr.RepDate === dateVal; });
                                                                                    let bucket_hours = 0; let plan_name = '';
                                                                                    if (selectedAgencyData.length > 0) {
                                                                                        bucket_hours = selectedAgencyData[0].bucket_hours;
                                                                                        plan_name = selectedAgencyData[0].plan_name;
                                                                                    }
                                                                                    return <td key={`bucket-${agency_index}${index}`}>{bucket_hours ? bucket_hours.toFixed(1) : 0.00} 
                                                                                    <br /> {plan_name && bucket_hours > 0 ? `(${plan_name})` : ''}
                                                                                    </td>
                                                                                })}
                                                                            </tr>
                                                                        }
                                                                    </Fragment>
                                                                })}
                                                                <tr>
                                                                    <td><b>Total</b></td>
                                                                    <td><b>Development</b></td>
                                                                    <td>{countTableTotal?.gd_total.toFixed(1)}</td>
                                                                    <td>{countTableTotal?.main_total_hours.toFixed(1)}</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    {reportList?.date_group.map((dateVal, index) => {
                                                                        let agencyTotal = 0;
                                                                        reportList?.agency_group.map((agency) => {
                                                                            let selectedAgencyData = reportList?.data.filter(function (arr) { return arr.agency_name === agency && arr.RepDate === dateVal; });
                                                                            if (selectedAgencyData.length > 0) {
                                                                                agencyTotal = agencyTotal + selectedAgencyData[0].hours;
                                                                            }
                                                                            return '';
                                                                        });
                                                                        return <td key={`total-${index}`}>{agencyTotal.toFixed(1)}</td>
                                                                    })}
                                                                </tr>
                                                                <tr>
                                                                    <td></td>
                                                                    <td><b>Addon</b></td>
                                                                    <td>-</td>
                                                                    <td>{countTableTotal?.main_addon_total_hours.toFixed(1)}</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    {reportList?.date_group.map((dateVal, index) => {
                                                                        let agencyTotal = 0;
                                                                        reportList?.agency_group.map((agency) => {
                                                                            let selectedAgencyData = reportList?.data.filter(function (arr) { return arr.agency_name === agency && arr.RepDate === dateVal; });
                                                                            if (selectedAgencyData.length > 0) {
                                                                                agencyTotal = agencyTotal + selectedAgencyData[0].addon_hours;
                                                                            }
                                                                            return '';
                                                                        });
                                                                        return <td key={`total-${index}`}>{agencyTotal.toFixed(1)}</td>
                                                                    })}
                                                                </tr>
                                                                <tr>
                                                                    <td></td>
                                                                    <td><b>Bucket</b></td>
                                                                    <td>-</td>
                                                                    <td>{countTableTotal?.main_bucket_total_hours.toFixed(1)}</td>
                                                                    <td>-</td>
                                                                    <td>-</td>
                                                                    {reportList?.date_group.map((dateVal, index) => {
                                                                        let agencyTotal = 0;
                                                                        reportList?.agency_group.map((agency) => {
                                                                            let selectedAgencyData = reportList?.data.filter(function (arr) { return arr.agency_name === agency && arr.RepDate === dateVal; });
                                                                            if (selectedAgencyData.length > 0) {
                                                                                agencyTotal = agencyTotal + selectedAgencyData[0].bucket_hours;
                                                                            }
                                                                            return '';
                                                                        });
                                                                        return <td key={`total-bucket-${index}`}>{agencyTotal.toFixed(1)}</td>
                                                                    })}
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </>
                                            }
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

export default connect(mapStateToProps)(TaskboardHoursReport)