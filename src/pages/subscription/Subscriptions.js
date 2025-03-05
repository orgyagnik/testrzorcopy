import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Col, Row, Table, Spinner } from 'react-bootstrap';
import SubscriptionLeftPanel from './SubscriptionLeftPanel';
import APIService from "../../api/APIService";
import moment from 'moment';
import { capitalizeFirst } from "../../utils/functions.js";
import { subscription_display_date_format } from '../../settings';
import { DONOT_HAVE_SUBSCRIPTION } from '../../modules/lang/Subscription';
import { connect } from "react-redux";

function Subscriptions({ name, userData }) {
  const [subscriptionDetails, setSubscriptionDetails] = useState([]);
  const [process, setProcess] = useState(true);

  useEffect(() => {
    APIService.getSubscriptionDetails()
      .then((response) => {
        setProcess(false);
        if (response.data?.status) {
          setSubscriptionDetails(response.data?.data);
        }
      });
  }, []);

  return (
    <>
      <div>
        <Sidebar />
        <div className="main-content">
          <Header pagename={name ? name : ''} />
          <div className="inner-content py-lg-8 px-lg-11 py-md-6 px-md-8 py-4 px-6">
            <div className="paln-page row">
              <div className="col-12 col-xl-3 mb-3">
                <SubscriptionLeftPanel userData={userData} activeMenu="subscription" />
              </div>
              <div className="col-12 col-xl-9">
                <Card className="rounded-10 border border-gray-100 mb-4">
                  <Card.Body className="p-0">
                    <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                      <h3 className="card-header-title mb-0 my-md-2 ps-md-3 d-flex align-items-center">Subscription
                        <span className={`badge badge-sm ${subscriptionDetails?.status === 'active' ? 'badge-success' : 'badge-danger'} font-weight-semibold font-12 ms-2`}>{capitalizeFirst(subscriptionDetails?.status)}</span>
                        {subscriptionDetails?.cancel_at_period_end === 1 &&
                          <span className={`badge badge-sm badge-danger font-weight-semibold font-12 ms-2`}>Cancel on {moment(new Date(subscriptionDetails?.cancel_at * 1000)).format(subscription_display_date_format)}</span>
                        }
                      </h3>
                    </div>
                  </Card.Body>
                  <Card.Body className="px-md-4 py-4">
                    <div className="px-md-3 py-md-3">
                      {process ?
                        <Spinner className='me-1' animation="border" variant="primary" />
                        :
                        subscriptionDetails?.subscription ?
                          <>
                            <Row className="row-cols-xxl-3 row-cols-xl-2 row-cols-lg-2 row-cols-1 mb-7 g-4">
                              {subscriptionDetails?.started &&
                                <Col>
                                  <Card className="rounded-12 border border-gray-100 leave-card">
                                    <Card.Body className="p-3 px-xxl-4">
                                      <Row className="align-items-center">
                                        <Col className="col-auto d-xxl-block">
                                          <span className="badge badge-size-xl rounded-24 py-2 bg-red-50 text-danger"><i className="icon-tropy"></i></span>
                                        </Col>
                                        <Col>
                                          <span className="h3 mb-0">Started</span>
                                          <span className="caption text-gray-600 d-block mb-1">{moment(new Date(subscriptionDetails?.started * 1000)).format(subscription_display_date_format)}</span>
                                        </Col>
                                      </Row>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              }
                              {subscriptionDetails &&
                                <Col>
                                  <Card className="rounded-12 border border-gray-100 leave-card">
                                    <Card.Body className="p-3 px-xxl-4">
                                      <Row className="align-items-center">
                                        <Col className="col-auto d-xxl-block">
                                          <span className="badge badge-size-xl rounded-24 py-2 bg-yellow-50 text-orange"><i className="icon-receipt"></i></span>
                                        </Col>
                                        <Col>
                                          <span className="h3 mb-0">Next Invoice</span>
                                          {subscriptionDetails?.cancel_at_period_end === 1 ?
                                            <p>No further invoice</p> :
                                            <span className="caption text-gray-600 d-block mb-1">US ${(subscriptionDetails?.next_invoice_amount / 100).toFixed(2)} on {moment(new Date(subscriptionDetails?.next_invoice_date * 1000)).format(subscription_display_date_format)}</span>
                                          }
                                        </Col>
                                      </Row>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              }
                            </Row>
                            {subscriptionDetails?.subscription?.length > 0 &&
                              <Table className="table-borderless card-table table-nowrap mt-lg-7 mt-4" responsive>
                                <thead>
                                  <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Amount</th>
                                    <th>Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {subscriptionDetails?.subscription.map((subscription, index) => (
                                    <tr key={index}>
                                      <td>{subscription.product}</td>
                                      <td>{subscription.quantity}</td>
                                      <td>${(subscription.amount / 100).toFixed(2)}</td>
                                      <td>${(subscription.amount * subscription.quantity / 100).toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr>
                                    <td><strong>Grand Total:</strong></td>
                                    <td colSpan={2}><strong>{(subscriptionDetails?.subscription?.reduce((a, v) => a = a + parseInt(v.quantity), 0))}</strong></td>
                                    <td><strong>${((subscriptionDetails?.subscription?.reduce((a, v) => a = a + parseInt(v.amount * v.quantity), 0)) / 100).toFixed(2)}</strong></td>
                                  </tr>
                                </tfoot>
                              </Table>
                            }
                          </> : <p className='text-danger'>{DONOT_HAVE_SUBSCRIPTION}</p>
                      }
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
  userData: state.Auth.user
})

export default connect(mapStateToProps)(Subscriptions)