const router = require('express').Router();

/* Set up Stripe & verification */
const Stripe = require('../config/stripe.js');
const stripe = require('stripe')('sk_test_45xGVr0LueUpfkjmW9KsN6QM008rLPZjLq');
const Verification = require('../config/verification.js');
const keys = require('../config/keys.js');
const request = require('request');

// Use body-parser to retrieve the raw body as a buffer
const bodyParser = require('body-parser');

/* Set up models */
const User = require('../models/User.js');
const Dish = require('../models/Dish.js');
const Order = require('../models/Order.js');
const Ordered_item = require('../models/Ordered_item.js');

/* Add pages */
const fs = require('fs');
const path = require('path');

const navbarPage = fs.readFileSync(path.join(__dirname, '../views', 'navbar.html'));
const orderPage = fs.readFileSync(path.join(__dirname, '../views/order', 'order.html'));
const checkoutPage = fs.readFileSync(path.join(__dirname, '../views/order', 'checkout.html'));

/* Set up routes */
router.get("/getCurrentOrder", (req, res) => {
    return res.send({response: req.session.order});
});

router.get("/getOrder/:id", async (req, res) => {
    try {
        const ordered_items = await Ordered_item.query()
                                                .join('dishes', 'ordered_items.dish_id', 'dishes.id')
                                                .select('dishes.id', 'name', 'price')
                                                .where({orderId: req.params.id});
        return res.send({response: ordered_items});
    } catch (error) {
        console.log(error)
        return res.status(500).send({response: "Something went wrong with the database"});
    }
});

router.get("/order/:id", (req, res) => { //id is business id
    if(req.session.authorization !== undefined){
        req.session.business = req.params.id;
        return res.send(navbarPage + orderPage);
    } else {
        return res.redirect("/login");
    };
    
});

router.post("/order/:id", async(req, res) => {
    //create order without price 
    //get order items
    //insert items and add price

    let order;
    try {
        const user = await User.query()
                               .select('id')
                               .where({email: req.session.authorization.user});
        order = await Order.query().insert({
            customerId: user[0].id,
            businessId: req.params.id
        });
    } catch (error) {
        console.log(error)
        return res.status(500).send({response: "Something went wrong with the database"});
    }

    const basket = req.body;
    let price = 0;
    for (let item in basket){
        try {
            const dish = await Dish.query()
                                   .select('id', 'price')
                                   .where({name: item, businessId: req.params.id}); //check business id as 2 businesses can offer the same meal
            const ordered_item = await Ordered_item.query().insert({
                orderId: order.id,
                dishId: dish[0].id
            });

            price += dish[0].price;
        } catch (error) {
            console.log(error)
            return res.status(500).send({response: "Something went wrong with the database"});
        }
    }
    const orderId = order.id;
    try {
        order = await Order.query()
                           .where({id: order.id})
                           .update({price});
        return res.redirect("/checkout/" + orderId);
    } catch (error) {
        console.log(error)
        return res.status(500).send({response: "Something went wrong with the database"});
    }
});

router.get("/order/:orderId/delete/:dishId", async (req, res) => {
    let user;
    try {
        user = await User.query()
                            .join('orders', 'users.id', 'orders.customerId')
                            .select('email')
                            .where({'orders.id': req.params.orderId});
        
    } catch (error) {
        return res.status(500).send({response: "Something went wrong with the database"});
    }
    //check if logged in user is the same user who is order owner
    if(req.session.authorization !== undefined && user[0].email === req.session.authorization.user){
        try {
            const ordered_items = await Ordered_item.query()
                                                    .where({orderId: req.params.orderId, dishId: req.params.dishId})
                                                    .del();
            return res.redirect("/checkout/" + req.params.orderId);
        } catch (error) {
            return res.status(500).send({response: "Something went wrong with the database"});
        }
    } else {
        return res.redirect("/login");
    }; 
});

router.get("/checkout/:orderId", (req, res) => {
    if(req.session.authorization !== undefined){
        req.session.order = req.params.orderId;
        return res.send(navbarPage + checkoutPage);
    } else {
        return res.redirect("/login");
    };   
})

router.get("/paymentSecret", async (req, res) => {
    let orders
    try {
        orders = await Order.query()
                                 .select('price')
                                 .where({id: req.session.order});
    } catch (error) {
        return res.status(500).send({response: "Something went wrong with the database"});
    }
    const price = String(orders[0].price) + "00"
    
    const intent = await Stripe.createPaymentIntent(price);
    req.session.paymentKey = Verification.generateHash(intent.client_secret);
    return res.json({client_secret: intent.client_secret});
});

// Match the raw body to content type application/json
router.post("/webhook",  bodyParser.raw({type: 'application/json'}), (req, res) => {
    let event = req.body;
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent was successful!');
        break;
      case 'payment_method.attached':
        const paymentMethod = event.data.object;
        console.log('PaymentMethod was attached to a Customer!');
        break;
      // ... handle other event types
      default:
        // Unexpected event type
        return res.status(400).end();
    }
  
    // Return a 200 response to acknowledge receipt of the event
    res.json({received: true});
  });

  router.get("/tracking/:orderId", (req, res) => {
    
    //if (paymentVerified){}
});


module.exports = router;
