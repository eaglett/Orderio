const keys = require('./keys.js')

const stripe = require('stripe')(keys.stripeSecret);

const createPaymentIntent = async () => {
    const paymentIntent =  await stripe.paymentIntents.create({
        amount: 1000,
        currency: 'dkk',
        payment_method_types: ['card'],
        receipt_email: 'jenny.rosen@example.com',
        metadata: {integration_check: 'accept_a_payment'},
      });
    return paymentIntent;
}

exports.createPaymentIntent = createPaymentIntent;