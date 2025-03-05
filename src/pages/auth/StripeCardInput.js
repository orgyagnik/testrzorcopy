import React from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import { CARD_NOTE } from '../../modules/lang/Auth';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      'color': '#32325d',
      'fontFamily': '"Helvetica Neue", Helvetica, sans-serif',
      'fontSmoothing': 'antialiased',
      'fontSize': '16px',
      'border': '1px solid #ddd',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

export default function StripeCardInput() {

  return (
    <div className='mt-5'>
      <CardElement options={CARD_ELEMENT_OPTIONS} />
      <p className='mt-5'>{CARD_NOTE}</p>
    </div>
  );
}
