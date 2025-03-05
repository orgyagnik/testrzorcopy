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

function TaskboardStaffHoursReport({ userData, name }) {
    const [reportList, setReportList] = useState([]);
    const [startDate, setStartDate] = useState(moment().startOf('month')._d);
    const [endDate, setEndDate] = useState(moment(moment().endOf('month').format('YYYY-MM-DD'))._d);
    const [reloadPage, setReloadPage] = useState(false);
    const [searchFilter, setSearchFilter] = useState('');
    const tableRef = useRef(null);
    const [refreshDesign, setRefreshDesign] = useState(false);
    const [statusList, setStatusList] = useState([]);
    const [status, setStatus] = useState('');
    const [staffForManage, SetStaffForManage] = useState([]);

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
        setStatusList([{ label: 'All', value: '' }, { label: 'In-Progress', value: 0 }, { label: 'Completed', value: 1 }]);
    }, []);

    useEffect(() => {
        if (userData.role_code === databaseRoleCode.adminCode || userData.role_code === databaseRoleCode.accountantCode || userData?.designation === pcHeadId) {
            const timer = setTimeout(() => {
                fetchTaskboardStaffHourlyReport();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchFilter, reloadPage, status]);

    const fetchTaskboardStaffHourlyReport = () => {
        let params = "?";
        if (searchFilter !== '') {
            params = params + "&search=" + searchFilter;
        }

        if (startDate && endDate) {
            params = params + "&startdate=" + format(startDate, "yyyy-MM-dd");
            params = params + "&enddate=" + format(endDate, "yyyy-MM-dd");
        }

        if (status !== '') {
            params = params + "&search_by_status=" + status;
        }

        APIService.getTaskboardStaffHourlyReport(params)
            .then((response) => {
                if (response.data?.status) {
                    let newData = response.data?.data;
                    setReportList(newData);
                                        
                    setTimeout(() => {
                        setRefreshDesign(!refreshDesign);
                    }, 500);
                }
            });
    }

    const handleClearFilter = async (e) => {
        setStartDate(moment().startOf('month')._d);
        setEndDate(moment().endOf('month')._d);
        setSearchFilter('');
        setStatus('');
        setReloadPage(!reloadPage);
    };

    const handleFilter = async (e) => {
        setReloadPage(!reloadPage);
    };

    useEffect(() => {
    }, [refreshDesign]);

    const onChangeDateRange = dates => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    }

    const handleStatusSelect = (selected) => {
        setStatus(selected?.value)
    };

    useEffect(() => {
        APIService.getManageEmploye()
          .then((response) => {
            if (response.data?.status) {
              let newStaffList = response.data?.data?.active_developer?.map(item => {
                return { label: item.name, value: item.staffid }
              });
              SetStaffForManage(response.data?.data);
            }
          });
    
      }, []);

    return (
        <>
            {userData.role_code === databaseRoleCode.adminCode || userData.role_code === databaseRoleCode.accountantCode || userData?.designation === pcHeadId ?
                <>
                    <Sidebar />
                    <div className="main-content">
                        <Header pagename={name} />
                        <div className="inner-content pt-0 px-0">
                            <div className="taskboard-hours-report-page">
                                <div className="bg-white py-3 px-4 px-lg-7 page-inner-header">
                                    <Row className="g-2 lg:g-4 justify-content-end">
                                        
                                        <Col xs={12} sm={12} md={3} lg={4} xl={3} xxl={3}>
                                            <Select styles={customStyles} className="control-md custom-select" options={statusList} onChange={handleStatusSelect}
                                                value={statusList.filter(function (option) {
                                                return option.value === status;
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
                                                        <DownloadTableExcel filename="taskboard-staff-hour-report" sheet="Taskboard Staff Hour Report" currentTableRef={tableRef.current}>
                                                            <Button className="export-btns mb-2 px-3" variant="soft-secondary" size="md"><i className="icon-file-excel"></i><span className="d-xl-inline-block d-none text-nowrap ms-2">Export to Excel</span></Button>
                                                        </DownloadTableExcel>
                                                    }
                                                    <div className="table-responsive">
                                                        <table className="table dt-table scroll-responsive dt-inline dataTable no-footer" ref={tableRef}>
                                                            <thead>
                                                                <tr role="row">
                                                                    <th><b>Name</b></th>
                                                                    <th><b>Designation</b></th>
                                                                    <th><b>Type</b></th>
                                                                    <th><b>Total Hours of Month</b></th>
                                                                    {reportList?.date_group.map((dateVal, index) => (
                                                                        <th key={index}><b>{dateVal}</b></th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                
                                                                {staffForManage?.active_developer?.map((developer) => {
                                                                    let name = developer.name;
                                                                    let name_index = developer.staffid;
                                                                
                                                                    let designation_name = '';
                                                                    let tot_hours = 0, tot_addon_hours = 0; 
                                                                   
                                                                   reportList?.date_group.map((date) => {
                                                                       let selectedNameData = reportList?.data.filter(function (arr) { return arr.name === name && arr.RepDate === date; });
                                                                      
                                                                       if (selectedNameData.length > 0) {
                                                                           tot_hours = tot_hours + selectedNameData[0].dev_hours;
                                                                           tot_addon_hours = tot_addon_hours + selectedNameData[0].addon_hours;
                                                                           designation_name = selectedNameData[0].designation_name;
                                                                       }
                                                                       
                                                                       return '';
                                                                   });

                                                                   return <Fragment key={name_index}>
                                                                        <tr role="row" className="odd" key={`dev-${name_index}`}>
                                                                            <td className='text-nowrap'><b>{name}</b></td>
                                                                            <td className='text-nowrap'><b>{designation_name}</b></td>
                                                                            <td className='text-nowrap'><b>Development</b></td>
                                                                            <td style={{ background: '#ebebeb' }}>{tot_hours.toFixed(2)}</td>
                                                                            {reportList?.date_group.map((dateVal, index) => {
                                                                                let selectedNameData = reportList?.data.filter(function (arr) { return arr.name === name && arr.RepDate === dateVal; });

                                                                               
                                                                                let dev_hours = 0;
                                                                                let style = {};
                                                                                if (selectedNameData.length > 0) {
                                                                                    dev_hours = selectedNameData[0].dev_hours;                          
                                                                                }
                                                                                return <td key={`dev-${name_index}${index}`} style={style}>
                                                                                    {dev_hours}
                                                                                </td>
                                                                            })}
                                                                        </tr>
                                                                        
                                                                        {(tot_addon_hours > 0) &&
                                                                            
                                                                            <tr role="row" key={`addon-${name_index}`}>
                                                                                <td></td>
                                                                                <td></td>
                                                                                <td><b style={{ color: 'red' }}>Addon</b></td>
                                                                                <td style={{ background: '#ebebeb' }}>{tot_addon_hours.toFixed(2)}</td>
                                                                            
                                                                                {reportList?.date_group.map((dateVal, index) => {
                                                                                    let selectedNameData = reportList?.data.filter(function (arr) { return arr.name === name && arr.RepDate === dateVal; });
                                                                                    let addon_hours = 0;
                                                                                    if (selectedNameData.length > 0) {
                                                                                        addon_hours = selectedNameData[0].addon_hours;
                                                                                    }
                                                                                    return <td key={`addon-${name_index}${index}`}>{addon_hours}</td>
                                                                                })}
                                                                            </tr>
                                                                        }
                                                                        
                                                                    </Fragment>

                                                                })}
                                                                
                                                                <tr>
                                                                    <td></td>
                                                                    <td><b>Total</b></td>
                                                                    <td><b>Development</b></td>
                                                                    {(() => {
                                                                       
                                                                        const dateDevSums = {};
                                                                        const totalCells = [];
                                                                        const devMonthTotal = reportList?.data.reduce((total, arr) => total + arr.dev_hours, 0);
                                                                        
                                                                        return (
                                                                            <React.Fragment>
                                                                              <td style={{ background: '#ebebeb' }}><b>{devMonthTotal.toFixed(2)}</b></td>
                                                                      
                                                                              {reportList?.date_group.map((dateVal) => {
                                                                                dateDevSums[dateVal] = 0;
                                                                      
                                                                                reportList?.data.forEach((arr) => {
                                                                                  if (arr.RepDate === dateVal) {
                                                                                    dateDevSums[dateVal] += arr.dev_hours;
                                                                                  }
                                                                                });
                                                                      
                                                                                totalCells.push(
                                                                                  <td key={`total-dev-${dateVal}`}>
                                                                                    <b>{dateDevSums[dateVal]}</b>
                                                                                  </td>
                                                                                );
                                                                              })}
                                                                            {totalCells}
                                                                            </React.Fragment>
                                                                        );  
                                                                    })()}
                                                                </tr>

                                                                <tr>
                                                                    <td></td>
                                                                    <td></td>
                                                                    <td><b style={{ color: 'red' }}>Addon</b></td>
                                                                    {(() => {
                                                                        const dateAddonSums = {};
                                                                        const totalCells = [];
                                                                        const addonMonthTotal = reportList?.data.reduce((total, arr) => total + arr.addon_hours, 0);
                                                                        
                                                                        return (
                                                                            <React.Fragment>
                                                                              <td style={{ background: '#ebebeb' }}><b>{addonMonthTotal.toFixed(2)}</b></td>
                                                                      
                                                                              {reportList?.date_group.map((dateVal) => {
                                                                                dateAddonSums[dateVal] = 0;
                                                                      
                                                                                reportList?.data.forEach((arr) => {
                                                                                  if (arr.RepDate === dateVal) {
                                                                                    dateAddonSums[dateVal] += arr.addon_hours;
                                                                                  }
                                                                                });
                                                                      
                                                                                totalCells.push(
                                                                                  <td key={`total-addon-${dateVal}`}>
                                                                                    <b>{dateAddonSums[dateVal]}</b>
                                                                                  </td>
                                                                                );
                                                                              })}
                                                                            {totalCells}
                                                                            </React.Fragment>
                                                                        );  
                                                                       
                                                                    })()}
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

export default connect(mapStateToProps)(TaskboardStaffHoursReport)