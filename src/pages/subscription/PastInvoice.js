import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Spinner } from 'react-bootstrap';
import SubscriptionLeftPanel from './SubscriptionLeftPanel';
import APIService from "../../api/APIService";
import StaticDataTable from "../../modules/custom/DataTable/StaticDataTable";
import { display_date_format } from '../../settings';
import moment from 'moment';
import { capitalizeFirst } from "../../utils/functions.js";
import { connect } from "react-redux";

function PastInvoice({ name, userData }) {
  const [pastInvoiceList, setPastInvoiceList] = useState([]);
  const [process, setProcess] = useState(true);

  useEffect(() => {
    APIService.getPastInvoiceList()
      .then((response) => {
        setProcess(false);
        if (response.data?.status) {
          setPastInvoiceList(response.data?.data);
        }
      });
  }, []);

  const columns = [
    {
      name: 'DATE',
      id: 'date',
      selector: (row) => row?.date && moment(new Date(row?.date * 1000)).format(display_date_format),
      sortable: true,
      filterable: true,
    },
    {
      name: 'AMOUNT',
      id: 'amount',
      selector: (row) => `$${(row?.amount / 100).toFixed(2)}`,
      sortable: true,
      filterable: true,
    },
    {
      name: 'STATUS',
      selector: (row) => <>
        <span className={`badge badge-sm ${row?.status === 'paid' ? 'badge-success' : 'badge-danger'} font-weight-semibold ms-2 font-12`}>{capitalizeFirst(row?.status)}</span>
      </>,
      sortable: true,
      filterable: true,
    },
    {
      name: 'INVOICE NUMBER',
      id: 'invoice_number',
      selector: (row) => row?.invoice_number,
      sortable: true,
      filterable: true,
    },
    {
      name: 'CUSTOMER',
      id: 'customer',
      selector: (row) => row?.customer,
      sortable: true,
      filterable: true,
    },
    {
      name: 'DUE',
      id: 'due',
      selector: (row) => row?.due,
      sortable: true,
      filterable: true,
    },
    {
      name: 'Action',
      disableSortBy: true,
      selector: (row) => (
        <>
          <a href={row?.download_link} download>Download PDF</a>
          {row?.status === 'open' &&
            <a href={row?.retry_payment} target="_blank" rel="noreferrer">Retry Payment</a>
          }
        </>
      ),
    },
  ];

  return (
    <>
      <div>
        <Sidebar />
        <div className="main-content">
          <Header pagename={name ? name : ''} />
          <div className="inner-content py-lg-8 px-lg-11 py-md-6 px-md-8 py-4 px-6">
            <div className="paln-page row">
              <div className="col-12 col-xl-3 mb-3">
                <SubscriptionLeftPanel userData={userData} activeMenu="past-invoice" />
              </div>
              <div className="col-12 col-xl-9">
                <Card className="rounded-10 border border-gray-100 mb-4">
                  <Card.Body className="p-0">
                    <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                      <h3 className="card-header-title mb-0 my-md-2 ps-md-3 d-flex align-items-center">Past Invoice </h3>
                    </div>
                  </Card.Body>
                  <Card.Body className="px-md-4 py-4 static-datatable-card-body">
                    {process ?
                      <Spinner className='me-1' animation="border" variant="primary" />
                      :
                      <StaticDataTable columns={columns} data={pastInvoiceList} exportName={"past-invoice.csv"} />
                    }
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

export default connect(mapStateToProps)(PastInvoice)