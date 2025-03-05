import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import APIService from "../../api/APIService";
import { pagination, display_date_format, databaseRoleCode } from '../../settings';
import moment from 'moment';
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import { capitalizeFirst, getMonthWeek } from "../../utils/functions.js";
import Select from 'react-select';
import RangeDatePickerControl from '../../modules/custom/RangeDatePickerControl';
import { format } from 'date-fns';

export default function AgencySites({ userData, name }) {
  const [firstLoad, setFirstLoad] = useState(true);
  const [agencySitesList, setAgencySitesList] = useState([]);
  const [page, setPage] = useState(1);
  const [searchFilter, setSearchFilter] = useState('');
  const [sort, setSort] = useState(pagination.sorting);
  const [sortby, setSortBy] = useState('id');
  const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
  const [exportData, setExportData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [planList, setPlanList] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState([]);
  const [tableLoader, setTableLoader] = useState(false);
  const [agencyList, setAgencyList] = useState([]);
  const [agency, setAgency] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [siteStatusList, setSiteStatusList] = useState([]);
  const [siteStatus, setSiteStatus] = useState('');
  const [reloadPage, setReloadPage] = useState(false);

  useEffect(() => {
    APIService.getAllAgency()
    .then((response) => {
        if (response.data?.status) {
            let newAgencyList = response.data?.data.map(item => {
                return { label: item.agency_name, value: item.staffid }
            });
            setAgencyList([{ label: 'All Agency', value: 0 }, ...newAgencyList]);
        }
    });

    setSiteStatusList([{ label: 'All', value: '' }, { label: 'Active', value: 1 }, { label: 'In Active', value: 0 }]);
  }, []);

  useEffect(() => {
    APIService.getAllPlan()
      .then((response) => {
        if (response.data?.status) {
          let newPlanList = response.data?.data.map(item => {
            return { label: item.plan, value: item.plan }
          });
          setPlanList(newPlanList);
        }
      });
  }, []);

  useEffect(() => {
    fetchAgencySitesList();
    setFirstLoad(false);
  }, [sort, sortby, page, perPageSize]);

  useEffect(() => {
    if (firstLoad === false) {
      setPage(1);
      if (page === 1) {
        const timer = setTimeout(() => {
          fetchAgencySitesList();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [searchFilter, selectedPlan, agency, siteStatus, startDate, endDate, reloadPage]);

  const fetchAgencySitesList = () => {
    setTableLoader(true);
    let params = "?";
    params = params + "sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby;
    if (searchFilter !== '') {
      params = params + "&search=" + encodeURIComponent(searchFilter);
    }
    let planType = '';
    let planIndex = 0;
    selectedPlan.map(item => {
      if (planIndex === 0) {
        planType = planType + `'${encodeURIComponent(item.value)}'`;
      }
      else {
        planType = planType + `,'${encodeURIComponent(item.value)}'`;
      }
      planIndex = planIndex + 1;
      return '';
    });

    if (planType !== '') {
      params = params + "&type=" + planType;
    }

    if (agency !== 0) {
      params = params + "&search_by_agency=" + agency;
    }

    if (startDate && endDate) {
      params = params + "&startdate=" + format(startDate, "yyyy-MM-dd");
      params = params + "&enddate=" + format(endDate, "yyyy-MM-dd");
    }

    if (siteStatus !== '') {
      params = params + "&search_by_status=" + siteStatus;
    }

    APIService.getAgencySitesList(params)
      .then((response) => {
        if (response.data?.status) {
          setTotalPages(response.data?.pagination?.total_pages);
          setTotalRecords(response.data?.pagination?.total_records);
          let newData = response.data?.data;
          setAgencySitesList(newData);
          setTableLoader(false);
          let exportHeader = ["#", "Agency name", "Site", "Plan", "Type", "Status", "Date Added", "Week"];
          let exportData = [];
          newData?.map(item => {
            exportData.push(
              {
                id: item.id,
                agency_name: item.agency_name ? item.agency_name : '',
                site: item.site,
                plan: item.plan,
                billingperiod: item.billingperiod,
                text_status: item.text_status,
                date_created: item.date_created ? moment(item.date_created).format(display_date_format) : '',
                week: item?.date_created ? getMonthWeek(new Date(item?.date_created)) : '',
              });
            return '';
          });
          setExportData({ fileName: "agency-sites", sheetTitle: "Agency Sites", exportHeader: exportHeader, exportData: exportData });
        }
      });
  }

  const columns = [
    {
      Header: '#',
      id: 'id',
      accessor: (row) => row?.id,
    },
    {
      Header: 'Agency Name',
      id: 'agency_name',
      accessor: (row) => row?.agency_name,
    },
    {
      Header: 'Site',
      id: 'site',
      accessor: (row) => row?.site,
    },
    {
      Header: 'Plan',
      id: 'plan',
      accessor: (row) => row?.plan,
    },
    {
      Header: 'Type',
      id: 'billingperiod',
      accessor: (row) => capitalizeFirst(row?.billingperiod),
      width: 200,
    },
    {
      Header: 'Status',
      id: 'status',
      accessor: (row) => <>
        <span className={`badge badge-sm ${row?.text_status === 'Active' ? 'badge-success' : 'badge-danger'} font-weight-semibold ms-2 font-12`}>{row?.text_status}</span>
      </>,
    },
    {
      Header: 'Date Added',
      id: 'date_created',
      accessor: (row) => row?.date_created && moment(new Date(row?.date_created)).format(display_date_format),
    },
    {
      Header: 'Week',
      id: 'week',
      accessor: (row) => row?.date_created && getMonthWeek(new Date(row?.date_created)),
    },
  ];

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

  const handlePlanSelect = (selectedPlan) => {
    setSelectedPlan(selectedPlan);
  };

  const handleAgencySelect = (selectedAgency) => {
    setAgency(selectedAgency?.value);
  };
  
  const onChangeDateRange = dates => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  }
  
  const handleSiteStatuseSelect = (selected) => {
    setSiteStatus(selected?.value)
  };

  const handleClearFilter = async (e) => {
      setAgency(userData?.role_code === databaseRoleCode.agencyCode || userData?.role_code === databaseRoleCode.agencyMemberCode ? userData?.id : 0);
      setStartDate(null);
      setEndDate(null);
      setSelectedPlan([]);
      setSiteStatus('');
  };

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Header pagename={name} />
        <div className="inner-content pt-0 px-0">
          <div className="leave-page">
            <div className="bg-white py-3 px-4 px-lg-7 page-inner-header">
                <Row className="g-2 g-xl-4">
                {userData?.role_code !== databaseRoleCode.agencyCode && userData?.role_code !== databaseRoleCode.agencyMemberCode && userData?.role_code !== databaseRoleCode.clientCode &&
                  <Col xs="12" md={6} xl={3} className="ms-auto">
                      <Select styles={customStyles} className="control-md custom-select" options={agencyList} onChange={handleAgencySelect}
                          value={agencyList.filter(function (option) {
                              return option.value === agency;
                          })} />
                  </Col>
                }
                <Col xs="12" md={6} xl={2}>
                    <RangeDatePickerControl
                        selected={startDate}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={onChangeDateRange}
                    />
                </Col>

                <Col xs="12" md={6} xl={2}>
                  <Select styles={customStyles} className="control-md custom-select" options={siteStatusList} onChange={handleSiteStatuseSelect}
                    value={siteStatusList.filter(function (option) {
                      return option.value === siteStatus;
                    })} />
                </Col>

                <Col xs="12" md={6} xl={2}>
                  <Select styles={customStyles} className="control-md custom-select" options={planList} onChange={handlePlanSelect} closeMenuOnSelect={false} isMulti value={selectedPlan} />
                </Col>

                <Col xl="auto" className='d-flex gap-2 flex-xl-row flex-row-reverse justify-content-lg-start justify-content-between '>
                    <OverlayTrigger placement='bottom' overlay={<Tooltip>Clear Filter</Tooltip>}>
                        <Button variant="soft-secondary" size="md" type="button" onClick={() => { handleClearFilter() }}><span>Clear Filter</span></Button>
                    </OverlayTrigger>
                </Col>

              </Row>
            </div>
            <div className="pt-4 pt-lg-5 pt-xl-9 px-0 px-lg-4 px-xl-7">
            <Card className="rounded-10 p-4 p-xl-6">
                <Card.Body className="p-0 agency-site-table">
                  <DataTableWithPagination columns={columns} data={agencySitesList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isExportable={true} exportData={exportData} />
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}