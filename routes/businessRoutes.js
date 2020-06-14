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
        return res.send({response: businessUsers});
    } catch (error){
        return res.status(500).send({ response: "Something went wrong with the database" });
    }
});

router.get("/getCurrentBusiness", async (req, res) => {
    try {
        const businessId = req.session.business;
        const business = await User.query().select('id', 'name').where({id: businessId});
        return res.send({response: business[0]});
    } catch (error) {
        return res.status(500).send({ response: "Something went wrong with the database" });
    }
});

router.get("/browse", (req, res) => {  
    return res.send(navbarPage + browsePage);
});

router.get("/managebusiness", (req, res) => {
    if(req.session.authorization !== undefined){
        return res.send(navbarPage + manageBusinessPage);
    } else {
        return res.redirect("/login");
    };
});

router.post("/managebusiness", async (req, res) => {
    let change = {}
    for (let key in req.body) {
        if (req.body[key] !== ''){
            change[key] = req.body[key]; //we got fields that were inputed
        }
    }
    try {
        const currentUser = await User.query()
                               .select('id', 'name', 'addressId')
                               .where({email: req.session.authorization.user});
        if(change['name'] !== undefined){
            const updated = await User.query()
                                      .where({id: currentUser[0].id})
                                      .update({'name': change['name']})
            delete change['name']; //remove name as it has already been updated
        };
        if ( Object.keys(change).length > 0 ){
            const updated = await Address.query()
                                         .where({id: currentUser[0].addressId})
                                         .update(change);
        }
        return res.send(200).send({response: "Your information is updated"});
    } catch (error) {
        console.log(error);
        return res.status(500).send({response: "Something went wrong with the database."});
    }
});

module.exports = router;