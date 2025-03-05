import React from 'react';
import { Skeleton } from '@material-ui/lab';
import { Row, InputGroup, Form } from 'react-bootstrap';

export default function DatatableLoadMore({ perPageRecord, columns }) {
    const list = [];
    for (let i = 0; i <= perPageRecord; i++) {
        list.push(<Skeleton animation="wave" height={40} width="100%" key={i} />);
    }
    return (
        <Row className="g-xxl-5 g-4">
            <div className="data-table-filter d-flex justify-content-between">
                <div className="left-data-filter d-flex align-items-center">
                    <Skeleton animation="wave" height={60} width={140} />
                </div>
                <div className="right-data-filter d-flex align-items-center">
                    <Form.Group className="has-search mb-0 mr-4 d-none d-md-block">
                        <InputGroup>
                            <Skeleton animation="wave" height={60} width="200px" />
                        </InputGroup>
                    </Form.Group>
                </div>
            </div>
            {list}
            <Skeleton animation="wave" height={70} width="100%" />
        </Row>
    );
}
