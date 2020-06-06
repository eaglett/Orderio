const router = require('express').Router();

/* Set up models */
const User = require('../models/User.js');
const Address = require('../models/Address.js');

/* Add pages */
const fs = require('fs');
const path = require('path');

const navbarPage = fs.readFileSync(path.join(__dirname, '../views/', 'navbar.html'));
const managepersonalPage = fs.readFileSync(path.join(__dirname, '../views/customer/', 'manageCustomer.html'));

/* Set up routes */
router.get("/managepersonal", (req, res) => {
    res.send(navbarPage + managepersonalPage);
});

router.post("/managepersonal", async (req, res) => {
    let change = {}
    for (let key in req.body) {
        if (req.body[key] !== ''){
            change[key] = req.body[key];
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
            delete change['name'];
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