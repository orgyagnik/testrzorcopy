import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Card, Row, Col, Button, Spinner, Form } from 'react-bootstrap';
import SubscriptionLeftPanel from './SubscriptionLeftPanel';
import StripeCardInput from '../auth/StripeCardInput';
import { confirmAlert } from 'react-confirm-alert';
import { toast } from 'react-toastify';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import APIService from "../../api/APIService";
import { DELETE_CARD, DEFAULT_CARD } from '../../modules/lang/Subscription';
import { connect } from "react-redux";

function UpdateCard({ name, userData }) {
  const [process, setProcess] = useState(true);
  const [addCardProcess, setAddCardProcess] = useState(false);
  const [reloadPage, setReloadPage] = useState(false);
  const [saveCardList, setSaveCardList] = useState([]);

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    let params = {};
    APIService.getSaveCards(params)
      .then((response) => {
        setProcess(false);
        if (response.data?.status) {
          setSaveCardList(response.data?.data);
        }
      });
  }, [reloadPage]);

  const handleDeleteCard = (card_id) => {
    confirmAlert({
      title: 'Confirm',
      message: DELETE_CARD,
      buttons: [
        {
          label: 'Yes',
          className: 'btn btn-primary btn-lg',
          onClick: () => {
            let params = {};
            params["card_id"] = card_id;
            APIService.deleteCard(params)
              .then((response) => {
                if (response.data?.status) {
                  toast.success(response.data?.message, {
                    position: toast.POSITION.TOP_RIGHT
                  });
                  setReloadPage(!reloadPage);
                }
                else {
                  toast.error(response.data?.message, {
                    position: toast.POSITION.TOP_RIGHT
                  });
                }
              });
          }
        },
        {
          label: 'No',
          className: 'btn btn-outline-secondary btn-lg',
          onClick: () => {

          }
        }
      ]
    });
  };

  const addCard = async () => {
    setAddCardProcess(true);
    if (!stripe || !elements) {
      toast.error('Something went to wrong.', {
        position: toast.POSITION.TOP_RIGHT
      });
      return false;
    }

    const result = await stripe.createToken(elements.getElement(CardElement));
    if (result.error) {
      toast.error(result.error.message, {
        position: toast.POSITION.TOP_RIGHT
      });
      setAddCardProcess(false);
    } else {
      let params = {};
      params['card_token'] = result.token.id;
      APIService.addCard(params)
        .then((response) => {
          if (response.data?.status) {
            toast.success(response.data?.message, {
              position: toast.POSITION.TOP_RIGHT
            });
            elements.getElement(CardElement).clear();
            setAddCardProcess(false);
            setReloadPage(!reloadPage);
          }
          else {
            toast.error(response.data?.message, {
              position: toast.POSITION.TOP_RIGHT
            });
            setAddCardProcess(false);
          }
        });
    }
  };

  const handleSetAsDefault = (card_id) => {
    confirmAlert({
      title: 'Confirm',
      message: DEFAULT_CARD,
      buttons: [
        {
          label: 'Yes',
          className: 'btn btn-primary btn-lg',
          onClick: () => {
            let params = {};
            params["card_id"] = card_id;
            APIService.setCardAsDefault(params)
              .then((response) => {
                if (response.data?.status) {
                  setReloadPage(!reloadPage);
                  toast.success(response.data?.message, {
                    position: toast.POSITION.TOP_RIGHT
                  });
                }
                else {
                  toast.error(response.data?.message, {
                    position: toast.POSITION.TOP_RIGHT
                  });
                }
              });
          }
        },
        {
          label: 'No',
          className: 'btn btn-outline-secondary btn-lg',
          onClick: () => {

          }
        }
      ]
    });
  };

  return (
    <>
      <div>
        <Sidebar />
        <div className="main-content">
          <Header pagename={name ? name : ''} />
          <div className="inner-content py-lg-8 px-lg-11 py-md-6 px-md-8 py-4 px-6">
            <div className="paln-page row">
              <div className="col-12 col-xl-3 mb-3">
                <SubscriptionLeftPanel userData={userData} activeMenu="update-card" />
              </div>
              <div className="col-12 col-xl-9">
                <Card className="rounded-10 border border-gray-100 mb-4">
                  <Card.Body className="p-0">
                    <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                      <h3 className="card-header-title mb-0 my-md-2 ps-md-3 d-flex align-items-center">Saved Card</h3>
                    </div>
                  </Card.Body>
                  <Card.Body className="px-md-4 py-4">
                    <div className="px-md-3 py-md-3">
                      {process ?
                        <Spinner className='me-1' animation="border" variant="primary" />
                        :
                        <Row>
                          {saveCardList?.all_sources?.map((card, index) => (
                            <Col sm={12} xl={12} xxl={5} lg={5} md={5} key={index}>
                              <div className={`card-view ${card.id === saveCardList?.default_source && 'active'}`}>
                                <div className="card-logo">{card.brand}</div>
                                {card.id !== saveCardList?.default_source &&
                                  <Button variant="default" size="sm" type="button" className='mt-4 margin-auto delete-data-card' onClick={() => handleDeleteCard(card.id)}>
                                    <i className="icon-delete" aria-hidden="true"></i>
                                  </Button>
                                }
                                <div className="card-number">
                                  <label>CARD NUMBER</label>
                                  <div id="text" className="value-view">XXXX XXXX XXXX {card.last4}</div>
                                </div>
                                <div className="card-detail">
                                  <div className="date">
                                    <label>EXPIRE DATE</label>
                                    <div id="1111" className="view-card-details">{9 < 10 ? `0${card.exp_month}` : card.exp_month} / {card.exp_year}</div>
                                  </div>
                                  <div className="cvv">
                                    <label>CVV</label>
                                    <div id="1112" className="view-card-details">...</div>
                                  </div>
                                </div>
                              </div>
                              {card.id !== saveCardList?.default_source &&
                                <div className='text-center'>
                                  <Button variant="primary" size="md" type="button" className='mt-2 margin-auto' onClick={() => handleSetAsDefault(card.id)}>Set as Default</Button>
                                </div>
                              }
                            </Col>
                          ))}
                        </Row>
                      }
                    </div>
                  </Card.Body>
                </Card>
                <Card className="rounded-10 border border-gray-100 mb-4">
                  <Card.Body className="p-0">
                    <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                      <h3 className="card-header-title mb-0 my-md-2 ps-md-3 d-flex align-items-center">Add Card</h3>
                    </div>
                  </Card.Body>
                  <Card.Body className="px-md-4 py-4">
                    <div className="px-md-3 py-md-3">
                      <Form onSubmit={async e => { e.preventDefault(); await addCard() }}>
                        <Row>
                          <Col sm={12} xl={12} xxl={6} lg={6} md={6}>
                            <StripeCardInput />
                            <Button variant="primary" size="md" type="submit" className='mt-4 margin-auto'>
                              {
                                !addCardProcess && 'Add Card'
                              }
                              {
                                addCardProcess && <><Spinner size="sm" animation="border" className="me-1" />Add Card</>
                              }
                            </Button>
                          </Col>
                        </Row>
                      </Form>
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

export default connect(mapStateToProps)(UpdateCard)