const keys = require('./keys.js')

const stripe = require('stripe')(keys.stripeSecret);

const createPaymentIntent = async (price) => {
    const paymentIntent =  await stripe.paymentIntents.create({
        amount: price,
        currency: 'dkk',
        payment_method_types: ['card'],
        //receipt_email: 'jenny.rosen@example.com',
        metadata: {integration_check: 'accept_a_payment'},
      });
    return paymentIntent;
}

exports.createPaymentIntent = createPaymentIntent;