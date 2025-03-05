import React from 'react';
import { Skeleton } from '@material-ui/lab';
import { Card, Col, Row } from 'react-bootstrap';

export default function UserListLoader({ perPageRecord }) {
    const list = [];
    for (let i = 0; i <= perPageRecord; i++) {
        list.push(<Col xxl={3} xl={4} lg={4} md={4} sm={6} key={i}>
            <Card className="border rounded-5 p-6 border-gray-100 h-100 people-card">
                <Card.Body className="p-0 text-center d-flex flex-column justify-content-center">
                    <Skeleton animation="wave" variant="circle" width={75} height={75} className="avatar-img mb-5 mx-auto" />
                    <p className="font-14 font-weight-medium dark-1 mb-1 lh-base">
                        <Skeleton animation="wave" height={24} width="50%" className='mx-auto' />
                    </p>
                    <p className="font-14 font-weight-medium dark-1 mb-1 lh-base">
                        <Skeleton animation="wave" height={24} width="90%" className='mx-auto' />
                    </p>
                    <p className="font-12 font-weight-medium dark-1 mt-2 mb-0 lh-base">
                        <Skeleton animation="wave" height={24} width="70%" className='mx-auto' />
                    </p>
                    <p className="font-12 font-weight-medium dark-1 mt-2 mb-0 lh-base">
                        <Skeleton animation="wave" height={24} width="90%" className='mx-auto' />
                    </p>
                    <p className="font-12 font-weight-medium dark-1 mt-2 mb-0 lh-base">
                        <Skeleton animation="wave" height={24} width="60%" className='mx-auto' />
                    </p>
                </Card.Body>
            </Card>
        </Col>);
    }
    return (
        <Row className="g-xxl-5 g-4 row-cols-xxxl-5">
            {list}
        </Row>
    );
}
