const keys = require('./keys.js')

const stripe = require('stripe')(keys.stripeSecret);

const createPaymentIntent = async (price, customerEmail, businessEmail) => {
    const paymentIntent =  await stripe.paymentIntents.create({
        amount: price,
        currency: 'dkk',
        payment_method_types: ['card'],
        billing_details: {email: customerEmail},
        receipt_email: businessEmail,
        metadata: {integration_check: 'accept_a_payment'},
      });
    return paymentIntent;
}

exports.createPaymentIntent = createPaymentIntent;