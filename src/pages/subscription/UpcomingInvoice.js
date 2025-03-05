import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Table, Spinner } from 'react-bootstrap';
import SubscriptionLeftPanel from './SubscriptionLeftPanel';
import APIService from "../../api/APIService";
import { subscription_display_date_format } from '../../settings';
import moment from 'moment';
import { PENDING_SUBSCRIPTION, DONOT_HAVE_SUBSCRIPTION } from '../../modules/lang/Subscription';
import { connect } from "react-redux";

function UpcomingInvoice({ name, userData }) {
  const [upcomingInvoiceDetails, setUpcomingInvoiceDetails] = useState([]);
  const [process, setProcess] = useState(true);

  useEffect(() => {
    APIService.getUpcomingInvoiceDetails()
      .then((response) => {
        setProcess(false);
        if (response.data?.status) {
          setUpcomingInvoiceDetails(response.data?.data);
        }
        else {
          setUpcomingInvoiceDetails({ status: 0 });
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
                <SubscriptionLeftPanel userData={userData} activeMenu="upcoming-invoice" />
              </div>
              <div className="col-12 col-xl-9">
                <Card className="rounded-10 border border-gray-100 mb-4">
                  <Card.Body className="p-0">
                    <div className="align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                      <h3 className="card-header-title mb-0 my-md-2 ps-md-3 d-flex align-items-center">Upcoming Invoice</h3>
                    </div>
                  </Card.Body>
                  <Card.Body className="px-md-4 py-4">
                    <div className="px-md-3 py-md-3">
                      {process ?
                        <Spinner className='me-1' animation="border" variant="primary" />
                        :
                        upcomingInvoiceDetails?.status !== 0 ?
                          upcomingInvoiceDetails?.cancel_at_period_end !== 1 ?
                            <>
                              <p>This is a preview of the invoice that will be billed on <b>{moment(new Date(upcomingInvoiceDetails?.next_invoice_date * 1000)).format(subscription_display_date_format)}</b>. It may change if the subscription is updated.</p>
                              {upcomingInvoiceDetails?.invoices?.length > 0 &&
                                <>
                                  <Table className="table-borderless card-table table-nowrap" responsive>
                                    <thead>
                                      <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Amount</th>
                                        <th>Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {upcomingInvoiceDetails?.invoices.map((invoice, index) => (
                                        <tr key={index}>
                                          <td>{invoice.product}</td>
                                          <td>{invoice.quantity}</td>
                                          <td>${(invoice.amount / 100).toFixed(2)}</td>
                                          <td>${(invoice.amount * invoice.quantity / 100).toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot>
                                      <tr>
                                        <td><strong>Grand Total:</strong></td>
                                        <td colSpan={2}>
                                          {/* <strong>{(upcomingInvoiceDetails?.invoices?.reduce((a, v) => a = a + parseInt(v.quantity), 0))}</strong> */}
                                          </td>
                                        <td><strong>${((upcomingInvoiceDetails?.invoices?.reduce((a, v) => a = a + parseInt(v.amount * v.quantity), 0)) / 100).toFixed(2)}</strong></td>
                                      </tr>
                                      <tr>
                                        <td colSpan={3}><strong>Applied Balance (Credit):</strong></td>
                                        <td><strong>${(upcomingInvoiceDetails?.applied_balance / 100).toFixed(2)}</strong></td>
                                      </tr>
                                      <tr>
                                        <td colSpan={3}><strong>Applied Coupon (Discount):</strong></td>
                                        <td><strong>${(upcomingInvoiceDetails?.total_discount_amounts / 100).toFixed(2)}</strong></td>
                                      </tr>
                                      <tr>
                                        <td colSpan={3}><strong>Amount due:</strong></td>
                                        <td><strong>${(upcomingInvoiceDetails?.amount_due / 100).toFixed(2)}</strong></td>
                                      </tr>
                                    </tfoot>
                                  </Table>
                                </>
                              }
                            </>
                            : <p className='text-danger'>{PENDING_SUBSCRIPTION} {moment(new Date(upcomingInvoiceDetails?.cancel_at * 1000)).format(subscription_display_date_format)}.</p>
                          : <p className='text-danger'>{DONOT_HAVE_SUBSCRIPTION}</p>

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

export default connect(mapStateToProps)(UpcomingInvoice)