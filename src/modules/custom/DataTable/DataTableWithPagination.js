import React, { useState, useCallback, useEffect } from "react";
import { useTable, usePagination, useSortBy } from 'react-table';
import { Button, Table as BTable, Col, Row, OverlayTrigger, Tooltip, InputGroup } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
//import { downloadExcel } from "react-export-table-to-excel";
import { Pagination } from "@material-ui/lab";
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import MoveIcon from "../../../assets/img/icons/move.svg";
import * as XLSX from 'xlsx';

export default function DataTableWithPagination({ columns, showExportButton = true, data, searchFilter, setSearchFilter, pageNumber, setPageNumber, perPageSize, setPerPageSize, uniqueComponentName = "dataTable", loading = false, isExportable = true, isBulkAction = false, isPagination = true, isLengthChange = true, setSort, setSortingBy, totalPages, totalRecords, handleBulkAction, exportData, isDragDropContext = false, onDragEndDrop, hideSearchBox = false, CustomclassName = '', customPrioritySorting = false, customPrioritySortingSet = false, customPrioritySortingcolumns = "priority", TableFooter = undefined, isCheckboxChecked , lastOpenedTaskId = null}) {
    const [goToPage, setGoToPage] = useState('');
    
    const onPageChange = (e, pageNo) => {
        if (pageNo <= totalPages && pageNo > 0)
            setPageNumber(pageNo);
        else
            toast.error("Please enter valid page number", {
                position: toast.POSITION.TOP_RIGHT
            });
    }

    useEffect(() => {
        if (customPrioritySorting) {
            setSortBy([{ id: customPrioritySortingcolumns, desc: false }, []]);
        }
    }, [customPrioritySortingSet]);

    const onPageSizeChange = (pageSize) => {
        setPerPageSize(pageSize);
        setPageSize(pageSize);
        setPageNumber(1);
    }

    const onSortedChange = (column) => {
        if (!column.disableSortBy) {
            // Toggle sorting order based on current state
            setSort((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
            setSortingBy(column.id);
            setPageNumber(1);
        }
    };
    
    

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
        state: { sortBy },
    } = useTable(
        {
            columns,
            data: data,
            initialState: {
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
        const headers = exportData?.exportHeader;
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...exportData?.exportData.map(row => Object.values(row))]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, `${exportData?.fileName}.xlsx`);
    }

    const handleClear = () => {
        setSearchFilter("");
    };

    return <>
        {isLengthChange &&
            <div className="data-table-filter mb-3 d-flex flex-sm-row flex-column justify-content-between">
                <div className="left-data-filter d-flex align-items-center">
                    <span className="me-2">Show: </span>
                    <Form.Select as="select" className="show-entries form-control-sm" value={perPageSize}
                        onChange={e => {
                            onPageSizeChange(Number(e.target.value))
                        }}
                    >
                        {[5, 10, 15, 20, 30, 40, 50, 100, 500].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                &nbsp;{pageSize}
                            </option>
                        ))}
                    </Form.Select>
                    {
                        isBulkAction && data.length > 0 &&
                        <Button className="bulk-action-btn ms-2" variant={`${isCheckboxChecked == true ? 'primary' : 'soft-secondary'}`} size="md" onClick={handleBulkAction}>Bulk Actions</Button>
                    }
                        {
                            isExportable && showExportButton && data.length > 0 && // Use the new prop here
                            <OverlayTrigger overlay={<Tooltip>Export to Excel</Tooltip>}>
                                <Button className="export-btns ms-2 px-3" variant={`${isCheckboxChecked == true ? 'success' : 'soft-secondary'}`} size="md" onClick={handleDownloadExcel}><i className="icon-file-excel"></i><span className="d-xl-inline-block d-none text-nowrap ms-2">Export to Excel</span></Button>
                            </OverlayTrigger>
                        }
                </div>
                <div className="right-data-filter d-flex align-items-center ms-sm-3 mt-sm-0 mt-3">
                    {!hideSearchBox &&
                        <Form.Group className="has-search mb-0 mr-4 w-100">
                            <div className="input-group static-data-tbl-input-group ms-auto">
                                <FormControl type="text" className="static-data-tbl-search form-control-sm form-control" placeholder="Search" value={searchFilter || ""} onChange={e => onSearch(e.target.value)} />
                                <button onClick={handleClear} className="static-data-tbl-clear btn btn-sm btn-outline-secondary"><i className="icon-cancel"></i></button>
                            </div>
                        </Form.Group>
                    }
                </div>
            </div>
        }
        {isDragDropContext ?
            <DragDropContext onDragEnd={onDragEndDrop}>
                <BTable hover className={`bg-white list-table border-top-0 ${CustomclassName ? CustomclassName : ''}`} responsive size="md" {...getTableProps()} id={uniqueComponentName} style={{ '--bs-table-hover-bg': '#fff' }}>
                    <thead>
                        {headerGroups.map(headerGroup => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => (
                                    <th {...column.getHeaderProps(column.getSortByToggleProps())} onClick={() => onSortedChange(column, setSortBy, sortBy)}>
                                        {column.render('Header')}
                                        {/* Add a sort direction indicator */}
                                        <span className="sorting-icons">
    <i className={`icon-chevron-up ms-2 font-10 ${column.isSorted && !column.isSortedDesc ? 'text-primary' : 'text-muted'}`}></i>
    <i className={`icon-chevron-down ms-1 font-10 ${column.isSorted && column.isSortedDesc ? 'text-primary' : 'text-muted'}`}></i>
</span>

                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <Droppable droppableId="droppable">
                        {(provided, snapshot) => (
                            <tbody {...getTableBodyProps()} ref={provided.innerRef} {...provided.droppableProps}>
                                {
                                    loading ?
                                        <tr>
                                            <td colSpan={columns.length} align="center">
                                                <h4>
                                                    <i className="fa fa-spinner fa-spin"></i>&nbsp; Loading....
                                                </h4>
                                            </td>
                                        </tr>
                                        :
                                        data.length > 0 ?
                                            <>
                                                {page.map((row, i) => {
                                                    prepareRow(row)
                                                    return (
                                                        <Draggable draggableId={`${i}`} key={i} index={i}>
                                                            {(provided) => (
                                                                <tr {...row.getRowProps()} style={exportData?.sheetTitle === "Notification" && row?.original.isread === 0 ? { 'backgroundColor': '#ededed' } : {}} ref={provided.innerRef} {...provided.draggableProps} key={i} data-p={row.priority}>
                                                                    {row.cells.map((cell, cell_index) => {
                                                                        return cell_index === 0 ?
                                                                            <td className="move-cell" {...provided.dragHandleProps} {...cell.getCellProps()}><div className="move-icon"><img src={MoveIcon} alt="Drop" /></div>{cell.render('Cell')}</td>
                                                                            : <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                                                    })}
                                                                </tr>
                                                            )}
                                                        </Draggable>
                                                    )
                                                }).concat(snapshot.isDraggingOver && provided.placeholder)}
                                            </>
                                            :
                                            <tr>
                                                <td colSpan={columns.length} align="center">Data not found</td>
                                            </tr>
                                }
                            </tbody>
                        )}
                    </Droppable>
                </BTable>
            </DragDropContext>
            :
            <BTable hover className={`bg-white list-table border-top-0 ${CustomclassName ? CustomclassName : ''}`} responsive size="md" {...getTableProps()} id={uniqueComponentName} style={{ '--bs-table-hover-bg': '#eeebf75e' }}>
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
                        loading ?
                            <tr className="loading-row" >
                                <td colSpan={columns.length} align="center">
                                    <h4 className="m-0">
                                        <i className="fa fa-spinner fa-spin"></i>&nbsp; Loading....
                                    </h4>
                                </td>
                            </tr>
                            :
                            data.length > 0 ?
                                <>
                                    {page.map((row, i) => {
                                        prepareRow(row)
                                        return (
                                            <tr className={`${lastOpenedTaskId === row?.original?.id ? 'bg-gray-100' : ''}`} {...row.getRowProps()} style={exportData?.sheetTitle === "Notification" && row?.original.isread === 0 ? { 'backgroundColor': '#eeebf75e' } : {}}>
                                                {row.cells.map(cell => {
                                                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                                })}
                                            </tr>
                                        )
                                    })}
                                </>
                                :
                                <tr className="data-not-found-row">
                                    <td colSpan={columns.length} align="center">Data not found</td>
                                </tr>
                    }
                </tbody>
                {TableFooter &&
                    <TableFooter />
                }
            </BTable>
        }
        {data.length > 0 &&
            <Row className="g-xxl-5 g-4 align-items-center mt-md-0 mt-5">
                <Col xl={9} xs={12} className="d-flex flex-wrap flex-md-row flex-column align-items-center">
                    <Pagination
                        color="primary"
                        count={totalPages}
                        size="large"
                        page={pageNumber}
                        variant="outlined"
                        shape="rounded"
                        onChange={onPageChange}
                        showFirstButton
                        showLastButton
                    />
                    <InputGroup className="pagination-page-go ms-xl-8 me-md-0 mx-auto mt-md-0 mt-5">
                        <Form.Control type="number" placeholder="Enter Page" className="form-control" value={goToPage} onChange={(e) => { setGoToPage(Number(e.target.value)) }} max={totalPages} min={1} />
                        <Button variant="soft-secondary" size="sm" onClick={(e) => onPageChange(e, goToPage)}>Go</Button>
                    </InputGroup>


                </Col>
                <Col xl={3} xs={12}>
                    <p className="text-xl-end text-center mb-0 font-12">Showing {((perPageSize * pageNumber) - perPageSize) + 1} to {totalRecords > (perPageSize * pageNumber) ? perPageSize * pageNumber : totalRecords} of {totalRecords} entries</p>
                </Col>
            </Row>}
    </>
}