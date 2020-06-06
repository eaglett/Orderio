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
    try{
        const dishes = await Dish.query()
                                 .select()
                                 .where({businessId: req.params.id});
        return res.send({response: dishes});
    } catch(error){
        console.log(error);
        return res.status(500).send({ response: "Something went wrong with the database" });
    }
});

router.get("/menu", (req, res) => {
    return res.send(navbarPage + menuPage);
});

router.get("/addDish", (req, res) => {
    return res.send(navbarPage + addDishPage);
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
            console.log(error)
            return res.status(500).send({response: "Something went wrong with the database"});
        }
    } else {
        return res.status(404).send({response: "Missing field: name, price"});
    }
});

router.get("/getDish/:id", async (req, res) => {
    try {  
        const dish = await Dish.query()
                               .select()
                               .where({id: req.params.id});
        return dish[0];
    } catch (error) {
        console.log(error)
        return res.status(500).send({response: "Something went wrong with the database"});
    }
})

router.get("/editDish/:id", (req, res) => {
    res.locals.id = JSON.stringify(req.params.id); //TODO: delete this?
    return res.send(navbarPage + editDishPage);
})

router.put("/editDish/:id", async (req, res) => {
    //TODO!!!
});

router.post("/deleteDish/:id", async (req, res) => {
    try {
        const dish = await Dish.query()
                               .where({id: req.params.id})
                               .del();
        return res.status(200).redirect("/menu")
    } catch (error) {
        console.log(error)
        return res.status(500).send({response: "Something went wrong with the database"});
    }
});

module.exports = router;