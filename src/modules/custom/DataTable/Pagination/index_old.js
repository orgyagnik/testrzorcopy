import React, { useEffect, useState, useMemo } from "react";
import Pagination from "react-bootstrap/Pagination";

const PaginationComponent = ({
    total = 0,
    itemsPerPage = 10,
    currentPage = 1,
    onPageChange
}) => {
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (total > 0 && itemsPerPage > 0)
            setTotalPages(Math.ceil(total / itemsPerPage));
    }, [total, itemsPerPage]);

    const paginationItemsFirst = useMemo(() => {
        const pages = [];
        if (totalPages > 5) {
            if (currentPage < 5) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(
                        <Pagination.Item
                            key={i}
                            active={i === currentPage}
                            onClick={() => onPageChange(i)}
                        >
                            {i}
                        </Pagination.Item>
                    );
                }
            }
            else {
                for (let i = 1; i <= 2; i++) {
                    pages.push(
                        <Pagination.Item
                            key={i}
                            active={i === currentPage}
                            onClick={() => onPageChange(i)}
                        >
                            {i}
                        </Pagination.Item>
                    );
                }
            }
        }
        else {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <Pagination.Item
                        key={i}
                        active={i === currentPage}
                        onClick={() => onPageChange(i)}
                    >
                        {i}
                    </Pagination.Item>
                );
            }
        }

        return pages;
    }, [totalPages, currentPage]);

    const paginationItemsCenter = useMemo(() => {
        const pages = [];
        if (totalPages > 5) {
            if (currentPage < 5) {
                if (totalPages > currentPage + 3) {
                    pages.push(<Pagination.Ellipsis />);
                    for (let i = currentPage + 6; i <= currentPage + 8; i++) {
                        pages.push(
                            <Pagination.Item
                                key={i}
                                active={i === currentPage}
                                onClick={() => onPageChange(i)}
                            >
                                {i}
                            </Pagination.Item>
                        );
                    }
                }
            }
            else if (totalPages < currentPage + 3) {
                pages.push(<Pagination.Ellipsis />);
                if (currentPage + 2 === totalPages) {
                    for (let i = currentPage - 5; i <= currentPage; i++) {
                        pages.push(
                            <Pagination.Item
                                key={i}
                                active={i === currentPage}
                                onClick={() => onPageChange(i)}
                            >
                                {i}
                            </Pagination.Item>
                        );
                    }
                }
                else {
                    for (let i = currentPage - 5; i <= currentPage - 1; i++) {
                        pages.push(
                            <Pagination.Item
                                key={i}
                                active={i === currentPage}
                                onClick={() => onPageChange(i)}
                            >
                                {i}
                            </Pagination.Item>
                        );
                    }
                }
            }
            else {
                if (currentPage + 3 === totalPages) {
                    pages.push(<Pagination.Ellipsis />);
                    for (let i = currentPage - 2; i <= currentPage + 1; i++) {
                        pages.push(
                            <Pagination.Item
                                key={i}
                                active={i === currentPage}
                                onClick={() => onPageChange(i)}
                            >
                                {i}
                            </Pagination.Item>
                        );
                    }
                }
                else {
                    pages.push(<Pagination.Ellipsis />);
                    for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                        pages.push(
                            <Pagination.Item
                                key={i}
                                active={i === currentPage}
                                onClick={() => onPageChange(i)}
                            >
                                {i}
                            </Pagination.Item>
                        );
                    }
                }
            }
        }
        return pages;
    }, [totalPages, currentPage]);

    const paginationItemsLast = useMemo(() => {
        const pages = [];
        if (totalPages > 10) {
            if (totalPages > currentPage + 4) {
                pages.push(<Pagination.Ellipsis />);
            }
            if (currentPage + 1 > totalPages) {
                for (let i = totalPages; i <= totalPages; i++) {
                    pages.push(
                        <Pagination.Item
                            key={i}
                            active={i === currentPage}
                            onClick={() => onPageChange(totalPages)}
                        >
                            {i}
                        </Pagination.Item>
                    );
                }
            }
            else {
                for (let i = totalPages - 1; i <= totalPages; i++) {
                    pages.push(
                        <Pagination.Item
                            key={i}
                            active={i === currentPage}
                            onClick={() => onPageChange(totalPages)}
                        >
                            {i}
                        </Pagination.Item>
                    );
                }
            }
        }
        return pages;
    }, [totalPages, currentPage]);

    if (totalPages === 0) return null;

    return (
        <Pagination>
            <Pagination.First
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
            />
            <Pagination.Prev
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            />
            {paginationItemsFirst}
            {paginationItemsCenter}
            {paginationItemsLast}
            <Pagination.Next
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            />
            <Pagination.Last
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
            />
        </Pagination>
    );
};

export default PaginationComponent;
