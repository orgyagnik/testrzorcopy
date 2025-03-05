import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Row, Col } from 'react-bootstrap';
import APIService from "../../api/APIService";
import { pagination, display_date_format, databaseRoleCode } from '../../settings';
import moment from 'moment';
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import Select from 'react-select';
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import ReadMoreReadLess from "../../modules/custom/ReadMoreReadLess";

function RatingReviews({ userData, name }) {
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
  const [agencyList, setAgencyList] = useState([]);
  const [agency, setAgency] = useState(0);
  const [tableLoader, setTableLoader] = useState(false);

  useEffect(() => {
    fetchRatingReviewsList();
    setFirstLoad(false);
  }, [sort, sortby, page, perPageSize]);

  useEffect(() => {
    if (firstLoad === false) {
      setPage(1);
      if (page === 1) {
        const timer = setTimeout(() => {
          fetchRatingReviewsList();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [searchFilter, agency]);

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
  }, []);

  const fetchRatingReviewsList = () => {
    setTableLoader(true);
    let params = "?";
    params = params + "sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby;
    if (searchFilter !== '') {
      params = params + "&search=" + searchFilter;
    }
    if (agency !== 0) {
      params = params + "&search_by_agency=" + agency;
    }
    APIService.getRatingReviewsList(params)
      .then((response) => {
        if (response.data?.status) {
          setTotalPages(response.data?.pagination?.total_pages);
          setTotalRecords(response.data?.pagination?.total_records);
          let newData = response.data?.data;
          setAgencySitesList(newData);
          setTableLoader(false);
          let exportHeader = ["#", "Added By", "Task", "Rating", "Review", "Date Added"];
          let exportData = [];
          newData?.map(item => {
            exportData.push(
              {
                id: item.id,
                fullname: item.fullname,
                name: item.name,
                rating: item.rating,
                review: item.review,
                dateadded: item.dateadded ? moment(item.dateadded).format(display_date_format) : '',
              });
            return '';
          });
          setExportData({ fileName: "rating-reviews", sheetTitle: "Rating Reviews", exportHeader: exportHeader, exportData: exportData });
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
      Header: 'Added By',
      id: 'fullname',
      accessor: (row) => row?.fullname,
    },
    {
      Header: 'Task',
      id: 'name',
      accessor: (row) => row?.name,
      Cell: ({ row }) => (
        <>
          <Link to={row?.original?.task_type === 1 ? `/view-site-addons-task/${row?.original?.task_id}` : `/view-task/${row?.original?.task_id}`}>{row?.original?.name}</Link>
        </>
      ),
    },
    {
      Header: 'Rating',
      id: 'rating',
      accessor: (row) => row?.rating,
    },
    {
      Header: 'Review',
      id: 'Review',
      accessor: (row) => (
        <ReadMoreReadLess longText={row?.review} />
      ),
    },
    {
      Header: 'Date Added',
      id: 'dateadded',
      accessor: (row) => row?.dateadded && moment(new Date(row?.dateadded)).format(display_date_format),
    },
  ];

  const handleAgencySelect = (selectedAgency) => {
    setAgency(selectedAgency?.value);
  };

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

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Header pagename={name} />
        <div className="inner-content pt-0 px-0">
          <div className="rating-review-page">
            {userData?.role_code !== databaseRoleCode.agencyCode && userData?.role_code !== databaseRoleCode.agencyMemberCode && userData?.role_code !== databaseRoleCode.clientCode &&
              <div className="bg-white py-3 px-4 px-xl-7 page-inner-header">
                <Row className="g-2 g-xl-4">
                  <Col xs="12" md="3" className="ms-auto">
                    <Select styles={customStyles} className="control-md custom-select" options={agencyList} onChange={handleAgencySelect}
                      value={agencyList.filter(function (option) {
                        return option.value === agency;
                      })} />
                  </Col>
                </Row>
              </div>
            }
            <div className="pt-4 pt-lg-5 pt-xl-9 px-0 px-lg-4 px-xl-7">
              <Card className="rounded-10 p-4 p-xl-6">
                <Card.Body className="p-0">
                  <DataTableWithPagination columns={columns} data={agencySitesList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isBulkAction={false} exportData={exportData} />
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

const mapStateToProps = (state) => ({
  userData: state.Auth.user
})

export default connect(mapStateToProps)(RatingReviews)