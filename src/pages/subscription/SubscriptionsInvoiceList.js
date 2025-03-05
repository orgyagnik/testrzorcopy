import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Spinner } from 'react-bootstrap';
import APIService from "../../api/APIService";
import { display_date_format } from '../../settings';
import moment from 'moment';
import { capitalizeFirst } from "../../utils/functions.js";
import StaticDataTable from "../../modules/custom/DataTable/StaticDataTable";
import { useParams } from "react-router-dom";

export default function SubscriptionsList(props) {
  const [subscriptionInvoiceList, setSubscriptionInvoiceList] = useState([]);
  const [process, setProcess] = useState(true);
  let { id } = useParams();

  useEffect(() => {
    let params = {};
    params['staffid'] = id;
    APIService.getSubscriptionInvoiceList(params)
      .then((response) => {
        setProcess(false);
        if (response.data?.status) {
          setSubscriptionInvoiceList(response.data?.data);
        }
      });
  }, []);

  const columns = [
    {
      name: 'Agency Name',
      id: 'agency_name',
      selector: (row) => row?.agency_name,
      sortable: true,
      filterable: true,
    },
    {
      name: 'Agency Email',
      id: 'email',
      selector: (row) => row?.email,
      sortable: true,
      filterable: true,
    },
    {
      name: 'Date',
      id: 'date',
      selector: (row) => row?.date && moment(new Date(row?.date * 1000)).format(display_date_format),
      sortable: true,
      filterable: true,
    },
    {
      name: 'Amount',
      id: 'amount',
      selector: (row) => `$${(row?.amount / 100).toFixed(2)}`,
      sortable: true,
      filterable: true,
    },
    {
      name: 'Status',
      selector: (row) => <>
        <span className={`badge badge-sm ${row?.status === 'paid' ? 'badge-success' : 'badge-danger'} font-weight-semibold ms-2 font-12`}>{capitalizeFirst(row?.status)}</span>
      </>,
      sortable: true,
      filterable: true,
    },
    {
      name: 'Invoice Number',
      id: 'number',
      selector: (row) => row?.number,
      sortable: true,
      filterable: true,
    },
    {
      name: 'Customer',
      id: 'customer',
      selector: (row) => row?.customer,
      sortable: true,
      filterable: true,
    },
    {
      name: 'Due',
      id: 'due',
      selector: (row) => row?.due ? moment(new Date(row?.date * 1000)).format(display_date_format) : "--",
      sortable: true,
      filterable: true,
    },
    {
      name: 'Action',
      disableSortBy: true,
      selector: (row) => (
        <>
          <a href={row?.invoice_pdf} download>Download PDF</a>
        </>
      ),
    },
  ];

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Header pagename={props.name ? props.name : ''} />
        <div className="inner-content pt-0 px-0">
          <div className="subscription-invoice-page ">
            <div className="pt-9 px-4 px-lg-7">
              {process ?
                <Spinner className='me-1' animation="border" variant="primary" />
                :
                <>
                  <StaticDataTable columns={columns} data={subscriptionInvoiceList} exportName={"subscription-invoice-list.csv"} />
                </>
              }
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}