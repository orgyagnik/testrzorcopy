import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { connect } from "react-redux";
import { pagination, databaseRoleCode } from '../../settings';
import APIService from "../../api/APIService";
import { Card} from 'react-bootstrap';
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import RemainingLeaveAccessDenied from './RemainingLeaveAccessDenied';

function RemainingLeaveList({ userData, name }) {
   
    const [page, setPage] = useState(1);
    const [searchFilter, setSearchFilter] = useState('');
    const [firstLoad, setFirstLoad] = useState(true);
    const [sort, setSort] = useState(pagination.sorting);
    const [sortby, setSortBy] = useState('staffid');
    const [perPageSize, setPerPageSize] = useState(pagination.perPageRecordDatatable);
    const [totalPages, setTotalPages] = useState(1);
    const [tableLoader, setTableLoader] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [reloadPage, setReloadPage] = useState(false);
    const [remainingLeaveList, setRemainingLeaveList] = useState([]);
    const [year, setYear] = useState('2023');

    useEffect(() => {
        if (firstLoad === false) {
          setPage(1);
          if (page === 1) {
            const timer = setTimeout(() => {
                fetchRemainingLeaveList();
            }, 500);
            return () => clearTimeout(timer);
          }
        }
    }, [searchFilter, reloadPage]);

    useEffect(() => {
        fetchRemainingLeaveList();
        setFirstLoad(false);
    }, [sort, sortby, page, perPageSize]);

    const fetchRemainingLeaveList = () => {
        setTableLoader(true);

        let params = "?";
        params = params + "sort=" + sort + "&limit=" + perPageSize + "&page=" + page + "&sort_by=" + sortby;

        if (searchFilter !== '') {
          params = params + "&search=" + searchFilter;
        }

        if (year !== '') {
            params = params + "&year=" + year;
        }
        
        APIService.getRemainingLeaveList(params)
          .then((response) => {

            if (response.data?.status) {
                let newData = response.data?.data;
                setTotalPages(response.data?.pagination?.total_pages);
                setTotalRecords(response.data?.pagination?.total_records);
                setRemainingLeaveList(newData);
                setTableLoader(false);                
            }
        });
    }

    let columns = [        
        {
            Header: 'Employee Name',
            id: 'empname',
            accessor: (row) => row?.empname,
        },
        {
          Header: 'PL Remaining Leaves',
          id: 'pl_difference',
          accessor: (row) => row?.pl_difference,
        },
        {
            Header: 'CL Remaining Leaves',
            id: 'cl_difference',
            accessor: (row) => row?.cl_difference,
            width: 150
        },    
        {
          Header: 'SL Remaining Leaves',
          id: 'sl_difference',
          accessor: (row) => row?.sl_difference,
          width: 150
        },  
        {
          Header: 'Comp-Off Remaining Leaves',
          id: 'comp_off_difference',
          accessor: (row) => row?.comp_off_difference,
          width: 150
        }

    ];

    return (
        <div>
        {userData?.role_code === databaseRoleCode.adminCode || userData?.role_code === databaseRoleCode.hrCode ?
            <>        
                <Sidebar />
                <div className="main-content">
                    <Header pagename={name} />
                    <div className="inner-content pt-0 px-0">
                            
                            <div className="pt-0 pt-lg-5 pt-xl-9 px-0 px-lg-4 px-xl-7">
                                
                                <Card className="rounded-10 p-4 p-xl-6">
                                    <h5><b>Note:</b> This Leave list as per the {year} year</h5>
                                    <Card.Body className="p-0 threshold-list-table">
                                        <DataTableWithPagination columns={columns} data={remainingLeaveList} searchFilter={searchFilter} setSearchFilter={setSearchFilter} pageNumber={page} setPageNumber={setPage} perPageSize={perPageSize} setPerPageSize={setPerPageSize} loading={tableLoader} setSort={setSort} setSortingBy={setSortBy} totalPages={totalPages} totalRecords={totalRecords} isExportable={false}/>
                                    </Card.Body>
                                </Card>
                            </div>                      

                    </div>
                    <Footer />
                </div> 
            </>
        : 
            <RemainingLeaveAccessDenied />
         }
        </div>
    );
}
const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(RemainingLeaveList)