const router = require('express').Router();


/* Set up Stripe & verification */
const Stripe = require('../config/stripe.js');
//const stripe = require('stripe')('sk_test_45xGVr0LueUpfkjmW9KsN6QM008rLPZjLq');
//const Verification = require('../config/verification.js');
const request = require('request');

/* Set up node mailer */
const nodeMailer = require('../config/nodeMailer.js');

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
const trackingPage = fs.readFileSync(path.join(__dirname, '../views/order', 'tracking.html'));

/* Set up routes */
router.get("/getCurrentOrder", async (req, res) => {
    try {
        const orders = await Order.query()
                              .select('id', 'status')
                              .where('id', req.session.order);
        console.log(req.session.order)
        console.log(orders[0])
        return res.send({response: orders[0]});
    } catch (error) {
        return res.status(500).send({response: "Something went wrong with the database"});
    }
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
    //get order items
    const basket = req.body;
    let price = 0;
    for (let item in basket){
        //insert items and add price
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
    let businesses
    try {
        orders = await Order.query()
                                 .select('price')
                                 .where({id: req.session.order});
        businesses = await User.query()
                               .join('orders', 'users.id', 'orders.businessId')
                               .select('email')
                               .where({'orders.id': req.session.order});
    } catch (error) {
        return res.status(500).send({response: "Something went wrong with the database"});
    }
    const price = String(orders[0].price) + "00";
    
    const intent = await Stripe.createPaymentIntent(price, req.session.order, req.session.authorization.user, businesses[0].email);
    return res.json({client_secret: intent.client_secret});
});

// Match the raw body to content type application/json
router.post("/webhook", (req, res) => {
    let event = req.body;

    // Handle the event
    if( event.type === 'payment_intent.succeeded'){   
        const description = event.data.object.description.split(";");

        const customerMessage = nodeMailer.generateOrderConfirmationMessage(description[0]); //orderId
        nodeMailer.sendMail(description[1], customerMessage);

        const businessMessage = nodeMailer.generateBusinessOrderMessage(description[0]);
        nodeMailer.sendMail(description[2], businessMessage);
    } else{
        // Unexpected event type
        return res.status(400).end();
    }
    // Return a 200 response to acknowledge receipt of the event
    res.json({received: true});
  });

  router.get("/tracking/:orderId", (req, res) => {
      req.session.order = req.params.orderId;
      return res.redirect("/tracking");
  });

  router.get("/tracking", (req, res) => {

    return res.send(navbarPage + trackingPage);
});


module.exports = router;
