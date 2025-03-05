import React, { useCallback } from "react";
import { useTable, usePagination, useSortBy } from 'react-table';
import { Button, Table as BTable, Spinner, InputGroup, FormControl, Form } from 'react-bootstrap';
import { downloadExcel } from "react-export-table-to-excel";

export default function DataTable({ columns, data, searchFilter, setSearchFilter, pageNumber, setPageNumber, perPageSize, setPerPageSize, uniqueComponentName = "dataTable", loading = false, isExportable = true, isPagination = true, isLengthChange = true, showButton, handleLoadMore, btnProcess, setSort, setSortingBy, exportData, CustomclassName = '' }) {

    const onPageChange = (pageNo) => {
        setPageNumber(pageNo);
    }

    const onPageSizeChange = (pageSize) => {
        setPerPageSize(pageSize);
        setPageSize(pageSize);
        setPageNumber(1);
    }

    const onSortedChange = (newSorted, column, shiftKey) => {
        if (!newSorted.disableSortBy) {
            const desc =
                newSorted.isSortedDesc === true
                    ? false
                    : newSorted.isSortedDesc === false;

            setSortBy([{ id: newSorted.id, desc }, shiftKey]);
            setPageNumber(1);
            setSort(desc ? 'desc' : 'asc');
            setSortingBy(newSorted?.id);
        }
    }

    const onSearch = useCallback(value => {
        setSearchFilter(value);
    }, [setSearchFilter])

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        //footerGroups,
        prepareRow,
        page,
        setPageSize,
        setSortBy,
        state: { sortBy, pageSize },
    } = useTable(
        {
            columns,
            data: data,
            initialState: {
                pageIndex: pageNumber - 1,
                pageSize: perPageSize,
            },
            manualSortBy: true,
            pagination: isPagination,
            onPageChange: { onPageChange },
            onPageSizeChange: { onPageSizeChange },
            onSortedChange: { onSortedChange },
        },
        useSortBy,
        usePagination,
    );

    function handleDownloadExcel() {
        if (exportData) {
            const header = exportData?.exportHeader;
            downloadExcel({
                fileName: exportData?.fileName,
                sheet: exportData?.sheetTitle,
                tablePayload: {
                    header,
                    body: exportData?.exportData,
                },
            });
        }
    }

    const handleClear = () => {
        setSearchFilter("");
    };

    return <>
        {isLengthChange &&
            <div className="data-table-filter py-2 py-md-4 d-flex justify-content-between">
                <div className="left-data-filter d-flex align-items-center">
                    {/* <span>Show <span className="d-none d-md-inline-block">entries</span>: </span>
                    <Form.Control as="select" className="show-entries" value={perPageSize}
                        onChange={e => {
                            onPageSizeChange(Number(e.target.value))
                        }}
                    >
                        {[5, 10, 20, 30, 40, 50].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                &nbsp;{pageSize}
                            </option>
                        ))}
                    </Form.Control> */}
                    {
                        isExportable && data.length > 0 &&
                        <Button className="export-btns ms-2" variant="soft-secondary" size="md" onClick={handleDownloadExcel}><i className="icon-file-excel me-2"></i> Export to Excel</Button>
                    }
                </div>
                <div className="right-data-filter d-flex align-items-center">
                    <Form.Group className="has-search mb-0 mr-4 d-none d-md-block">
                        <InputGroup>
                            <div className="input-group static-data-tbl-input-group ms-auto">
                                <FormControl type="text" placeholder="Search" value={searchFilter || ""} onChange={e => onSearch(e.target.value)} />
                                <button onClick={handleClear} className="static-data-tbl-clear btn btn-sm btn-outline-secondary"><i className="icon-cancel"></i></button>
                            </div>
                        </InputGroup>
                    </Form.Group>
                </div>
            </div>
        }
        <BTable hover className={`bg-transparent list-table border-top-0 mb-0 ${CustomclassName ? CustomclassName : ''}`} responsive size="md" {...getTableProps()} id={uniqueComponentName} style={{ '--bs-table-hover-bg': '#eeebf75e' }}>
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps(column.getSortByToggleProps())} onClick={() => onSortedChange(column, setSortBy, sortBy)}>
                                {column.render('Header')}
                                {/* Add a sort direction indicator */}
                                <span>
                                    {column.isSorted
                                        ? column.isSortedDesc
                                            ? <i className="icon-chevron-down ms-2 font-10"></i>
                                            : <i className="icon-chevron-up ms-2 font-10"></i>
                                        : ''}
                                </span>
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {
                    data.length > 0 ?
                        loading ?
                            <tr>
                                <td colSpan={columns.length} align="center">
                                    <h4>
                                        <i className="fa fa-spinner fa-spin"></i>&nbsp; Loading....
                                    </h4>
                                </td>
                            </tr>
                            :
                            <>
                                {page.map((row, i) => {
                                    prepareRow(row)
                                    return (
                                        <tr {...row.getRowProps()}>
                                            {row.cells.map(cell => {
                                                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                            })}
                                        </tr>
                                    )
                                })}
                            </>
                        :
                        <tr>
                            <td colSpan={columns.length} align="center">Data not found</td>
                        </tr>
                }
            </tbody>
            {/* {
                page.length > 0 && footerGroups.length > 0 &&
                <tfoot>
                    {footerGroups.map(group => (
                        <tr {...group.getFooterGroupProps()} className="total-row grey-bg">
                            {group.headers.map(column => (
                                <th {...column.getFooterProps()}>{column.render('Footer')}</th>
                            ))}
                        </tr>
                    ))}
                </tfoot>
            } */}
        </BTable>
        {showButton &&
            <div className="bg-dark-11 p-2 text-center">
                <Button disabled={btnProcess} variant="white" size="md" type="button" className='bulk-action-btn text-primary' onClick={() => { handleLoadMore(); setPageSize(pageSize * 2); }}>
                    {
                        !btnProcess && 'Load More'
                    }
                    {
                        btnProcess && <><Spinner size="sm" animation="grow" className="me-2" />Load More</>
                    }
                    <i className="icon-add font-12 ms-2"></i>
                </Button>
            </div>
        }
    </>
}