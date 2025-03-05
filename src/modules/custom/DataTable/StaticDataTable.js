import React, { useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import FilterComponent from "./FilterComponent";
import { Button } from 'react-bootstrap';
import { display_date_format } from '../../../settings';
import moment from 'moment';

export default function StaticDataTable({ columns, data, isExport = true, exportName = 'export.csv' }) {
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

    const filteredItems = data.filter(
        item =>
            JSON.stringify(item)
                .toLowerCase()
                .indexOf(filterText.toLowerCase()) !== -1
    );

    const sortIcon = <i className="icon-chevron-down ms-2 d-block" style={{ fontSize: '10px',  width: '10px', height: '10px'}}></i>;

    const Export = ({ onExport }) => <Button className="export-btns ms-2" variant="soft-secondary" size="md" onClick={e => onExport(e.target.value)}><i className="icon-file-excel"></i><span className="d-xl-inline-block d-none text-nowrap ms-2">Export to Excel</span></Button>;

    const subHeaderComponent = useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToggle(!resetPaginationToggle);
                setFilterText("");
            }
        };

        function convertArrayOfObjectsToCSV(array) {
            let result;
            const columnDelimiter = ',';
            const lineDelimiter = '\n';
            const keys = Object.keys(data[0]);
            const index = keys.indexOf("retry_payment");
            if (index > -1) {
                keys.splice(index, 1);
            }

            result = '';
            result += keys.join(columnDelimiter);
            result += lineDelimiter;

            array.forEach(item => {
                let ctr = 0;
                keys.forEach(key => {
                    if (key !== "retry_payment") {
                        if (ctr > 0) result += columnDelimiter;
                        if (key.includes("next_renewal_date")) {
                            result += item[key] !== '' ? moment(item[key]).format(display_date_format) : ''
                        }
                        else if (key.includes("date")) {
                            result += item[key] ? moment(new Date(item[key] * 1000)).format(display_date_format) : '';
                        }
                        else if (key === "amount") {
                            result += `$${(item[key] / 100).toFixed(2)}`;
                        }
                        else if (key.includes("amount")) {
                            result += `$${(item[key]).toFixed(2)}`;
                        }
                        else if (key.includes("agency_name") || key.includes("plan_nick_name") || key.includes("plan_type")) {
                            result += item[key] ? item[key].replaceAll(",", " ").replaceAll("\n", " ") : '';
                        }
                        else {
                            result += item[key] ? item[key] : '';
                        }
                        ctr++;
                    }
                });
                result += lineDelimiter;
            });

            return result;
        }

        function downloadCSV(array) {
            const link = document.createElement('a');
            let csv = convertArrayOfObjectsToCSV(array);
            if (csv == null) return;

            const filename = exportName;

            if (!csv.match(/^data:text\/csv/i)) {
                csv = `data:text/csv;charset=utf-8,${csv}`;
            }

            link.setAttribute('href', encodeURI(csv));
            link.setAttribute('download', filename);
            link.click();
        }

        return (
            <div className='filter-area d-flex align-items-center w-100 justify-content-between mb-5'>
                {isExport && data?.length > 0 &&
                    <Export onExport={() => downloadCSV(data)} />}
                {data?.length > 0 &&
                    <FilterComponent
                        onFilter={e => setFilterText(e.target.value)}
                        onClear={handleClear}
                        filterText={filterText}
                    />
                }
            </div>
        );
    }, [filterText, resetPaginationToggle, data]);

    /*const actionsMemo = useMemo(() => {
        function convertArrayOfObjectsToCSV(array) {
            let result;
            const columnDelimiter = ',';
            const lineDelimiter = '\n';
            const keys = Object.keys(data[0]);
            const index = keys.indexOf("retry_payment");
            if (index > -1) {
                keys.splice(index, 1);
            }

            result = '';
            result += keys.join(columnDelimiter);
            result += lineDelimiter;

            array.forEach(item => {
                let ctr = 0;
                keys.forEach(key => {
                    if (key !== "retry_payment") {
                        if (ctr > 0) result += columnDelimiter;
                        if (key.includes("next_renewal_date")) {
                            result += item[key] !== '' ? moment(item[key]).format(display_date_format) : ''
                        }
                        else if (key.includes("date")) {
                            result += item[key] ? moment(new Date(item[key] * 1000)).format(display_date_format) : '';
                        }
                        else if (key.includes("amount")) {
                            result += `$${(item[key] / 100).toFixed(2)}`;
                        }
                        else if (key.includes("agency_name") || key.includes("plan_nick_name") || key.includes("plan_type")) {
                            result += item[key] ? item[key].replaceAll(",", " ") : '';
                        }
                        else {
                            result += item[key] ? item[key] : '';
                        }
                        ctr++;
                    }
                });
                result += lineDelimiter;
            });

            return result;
        }

        function downloadCSV(array) {
            const link = document.createElement('a');
            let csv = convertArrayOfObjectsToCSV(array);
            if (csv == null) return;

            const filename = 'export.csv';

            if (!csv.match(/^data:text\/csv/i)) {
                csv = `data:text/csv;charset=utf-8,${csv}`;
            }

            link.setAttribute('href', encodeURI(csv));
            link.setAttribute('download', filename);
            link.click();
        }

        return <Export onExport={() => downloadCSV(data)} />;
    }, [data]);*/

    return <>
        <DataTable
            columns={columns}
            data={filteredItems}
            //sortIcon={<SortIcon />}
            pagination
            subHeader={data?.length > 0}
            subHeaderComponent={subHeaderComponent}
            //actions={actionsMemo}
            paginationRowsPerPageOptions={[5, 10, 15, 20, 30, 40, 50, 100, 500]}
            paginationPerPage={10}
            className="static-data-custom-table"
            sortIcon= {sortIcon}
        />
    </>
}