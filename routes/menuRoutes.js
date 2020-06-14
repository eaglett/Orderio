const router = require('express').Router();

/* Set up models */
const User = require('../models/User.js');
const Dish = require('../models/Dish.js');


/* Add pages */
const fs = require('fs');
const path = require('path');

const navbarPage = fs.readFileSync(path.join(__dirname, '../views/', 'navbar.html'));
const menuPage = fs.readFileSync(path.join(__dirname, '../views/business', 'menu.html'));
const addDishPage = fs.readFileSync(path.join(__dirname, '../views/business', 'addDish.html'));
const editDishPage = fs.readFileSync(path.join(__dirname, '../views/business', 'editDish.html'));

/* Set up routes */

router.get("/getMenu/:id", async (req, res) => { //business id
    if(req.session.authorization !== undefined){
        try{
            const dishes = await Dish.query()
                                     .select()
                                     .where({businessId: req.params.id});
            return res.send({response: dishes});
        } catch(error){
            return res.status(500).send({ response: "Something went wrong with the database" });
        }
    } else {
        return res.redirect("/login");
    };  
});

router.get("/getDish/:id", async (req, res) => {
    try {  
        const dish = await Dish.query()
                               .select('name', 'description', 'price')
                               .where({'id': req.params.id});
        return res.send(dish[0]);
    } catch (error) {
        return res.status(500).send({response: "Something went wrong with the database"});
    }
});

router.get("/menu", (req, res) => {
    if(req.session.authorization !== undefined){
        return res.send(navbarPage + menuPage);
    } else {
        return res.redirect("/login");
    };  
});

router.get("/addDish", (req, res) => {
    if(req.session.authorization !== undefined){
        return res.send(navbarPage + addDishPage);
    } else {
        return res.redirect("/login");
    }; 
});

router.post("/addDish", async(req, res) => {
    const {name, description, price} = req.body;

    if(name && price){
        try{
            const business = await User.query()
                                       .select('id')
                                       .where({email: req.session.authorization.user});
            const dish = await Dish.query().insert({name, description, price, businessId: business[0].id});
            
            return res.status(200).redirect("/menu");
        } catch(error){
            return res.status(500).send({response: "Something went wrong with the database"});
        }
    } else {
        return res.status(404).send({response: "Missing field: name, price"});
    }
});

router.get("/editDish/:id", async (req, res) => {
    let user;
    try {
        user = await User.query()
                            .join('dishes', 'users.id', 'dishes.businessId')
                            .select('email')
                            .where({'dishes.id': req.params.id});
        
    } catch (error) {
        return res.status(500).send({response: "Something went wrong with the database"});
    }
    //check if logged in user is the same user who is dish owner
    if(req.session.authorization !== undefined && user[0].email === req.session.authorization.user){
        return res.send(navbarPage + editDishPage);
    } else {
        return res.redirect("/login");
    }; 
})

router.post("/editDish/:id", async (req, res) => {
    let change = {}
    for (let key in req.body) {
        if (req.body[key] !== ''){
            change[key] = req.body[key];
        }
    }
    if (Object.keys(change).length > 0){ //if anything changed
        try {
            const dish = await Dish.query()
                                   .where({'id': req.params.id})
                                   .update(change);
            return res.redirect("/menu");
        } catch (error) {
            return res.status(500).send({response: "Something went wrong with the database"});
        }
    }
});

router.post("/deleteDish/:id", async (req, res) => {
    let user;
    try {
        user = await User.query()
                            .join('dishes', 'users.id', 'dishes.businessId')
                            .select('email')
                            .where({'dish.id': req.params.id});
        
    } catch (error) {
        return res.status(500).send({response: "Something went wrong with the database"});
    }
    //check if logged in user is the same user who is dish owner
    if(req.session.authorization !== undefined && user[0].email === req.session.authorization.user){
        try {
            const dish = await Dish.query()
                                   .where({id: req.params.id})
                                   .del();
            return res.status(200).redirect("/menu")
        } catch (error) {
            return res.status(500).send({response: "Something went wrong with the database"});
        };
    } else {
        return res.redirect("/login");
    }; 
});

module.exports = router;