const router = require('express').Router();

/* Set up models */
const User = require('../models/User.js');

/* Add pages */
const fs = require('fs');
const path = require('path');

const navbarPage = fs.readFileSync(path.join(__dirname, '../views', 'navbar.html'));
const browsePage = fs.readFileSync(path.join(__dirname, '../views/business', 'browse.html'));
const manageBusinessPage = fs.readFileSync(path.join(__dirname, '../views/business', 'manageBusiness.html'));

/* Set up routes */

router.get("/getBusiness", async (req, res) => { //returns all registrated business
    try{
        const businessUsers = await User.query().join('roles', 'users.roleId', 'roles.id')
                                                .select('users.id', 'name')
                                                .where({role: "BUSINESS"});
        //console.log(businessUsers);
        //router.locals = businessUsers
        return res.send({response: businessUsers});
    } catch (error){
        console.log(error);
        
        return res.status(500).send({ response: "Something went wrong with the database" });
    }
});

router.get("/getCurrentBusiness", async (req, res) => {
    try {
        const businessId = req.session.business;
        const business = await User.query().select('id', 'name').where({id: businessId});
        return res.send({response: business[0]});
    } catch (error) {
        console.log(error);
        
        return res.status(500).send({ response: "Something went wrong with the database" });
    }
});

router.get("/browse", (req, res) => {  
    return res.send(navbarPage + browsePage);
    
});

router.get("/managebusiness", (req, res) => {
    return res.send(navbarPage + manageBusinessPage);
});

router.post("/managebusiness", (req, res) => {
    //TODO: finish
    const {name, oldPassword, newPassword, newPasswordRepeat, street, number, additional, postNb, city, country} = req.body;
});

module.exports = router;