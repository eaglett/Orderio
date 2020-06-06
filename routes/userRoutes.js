const router = require('express').Router();

/* Set up Models */
const User = require('../models/User.js');
const Role = require('../models/Role.js');

/* Set up node mailer */
const nodeMailer = require('../config/nodeMailer.js');
const emailVerification = require('../config/verification.js');

/* Set up Bcrypt */
const bcrypt = require('bcrypt');
const saltRounds = 12;

/* Set up pages */
const fs = require('fs');
const path = require('path');

const navbarPage = fs.readFileSync(path.join(__dirname, '../views', 'navbar.html'));
const newPasswordRequestPage = fs.readFileSync(path.join(__dirname, '../views/auth', 'newPasswordRequest.html'));
const passwordResetPage = fs.readFileSync(path.join(__dirname, '../views/auth', 'passwordReset.html'));

/* Set up routes */
router.get("/manage",  async (req, res) => {
    try{   
        const user = await User.query()
                               .join('roles', 'users.roleId', 'roles.id')
                               .select('role')
                               .where({email: req.session.authorization.user});
        if (user[0].role === 'BUSINESS'){
            return res.redirect("/managebusiness");
        } else if (user[0].role === 'CUSTOMER'){
            return res.redirect("/managepersonal");
        } else {
            return res.status(403).send({response: "You do not have access."});
        }
    } catch(error){
        console.log(error)
        return res.status(500).send({ response: "Something went wrong with the database" });
    }
});

router.get("/requestNewPassword", (req, res) => {
    return res.send(navbarPage + newPasswordRequestPage);
});

router.post("/requestNewPassword", async (req, res) => {
    const email = req.body.email;
    try {
        const userFound = await User.query()
                                    .select()
                                    .where({ 'email': email })
                                    .limit(1);
        if (userFound.length === 0) {
            return res.status(400).send({ response: "User doesn't exist with that email." });
        } else {
            const hash = emailVerification.generateHash(email);
            const message = nodeMailer.generatePasswordMessage(email, hash);
            nodeMailer.sendMail(email, message);

            return res.send({response: "Email has been sent. Follow the link to reset the password."});
        }
    } catch(error){
        console.log(error);
        return res.status(500).send({ response: "Something went wrong with the database" });
    }
});

router.get("/passwordReset/:email&:verification", (req, res) => {
    const validated = emailVerification.validateHash(req.params.email, req.params.verification);
    if (validated) {
        return res.send(navbarPage + passwordResetPage);
    } else {
        return res.status(408).send({response: "Verification code is incorrect or it has expired"});
    }
});

router.post("/passwordReset/:email&:verification", async (req, res) => {
    const { newPassword, newPasswordRepeat} = req.body;
    const isPasswordTheSame = newPassword === newPasswordRepeat;

    try {
        const userFound = await User.query()
                                    .select()
                                    .where({ 'email': req.params.email }).limit(1);
        //check again if someone accesses it directly with link
        if (userFound.length === 0) {
            return res.status(400).send({ response: "User doesn't exist with that email." });
        } else {
            if(newPassword && newPasswordRepeat && isPasswordTheSame && (newPassword.length >= 8)){ 
                //hash and save new password
                await bcrypt.hash(newPassword, saltRounds, async function(err, hash) {
                
                    const user = await User.query()
                                           .patch({password: hash})
                                           .where({email: req.params.email});
                    return res.send({response: "Password changed."});
                });           
            } else if (newPassword && newPasswordRepeat && !isPasswordTheSame) {
                return res.status(400).send({ response: "Passwords do not match. Fields: password and passwordRepeat" });
            } else if (newPassword.length < 8){
                return res.status(400).send({ response: "Password does not fulfill the requirements. Enter a password longer than 8 chars." });
            } else {
                return res.status(404).send({ response: "Missing fields: oldPassword, newPassword, newPasswordRepeat" });
            }
        }
    } catch(error){
        return res.status(500).send({ response: "Something went wrong with the database" });
    }
});

router.get("/currentUserId", async (req, res) => {
    if(req.session.authorization !== undefined){
        try{
            const user = await User.query()
                                   .select('id')
                                   .where({email: req.session.authorization.user});
            return res.send({response: user[0].id});
        } catch(error){
            console.log(error)
            return res.status(500).send({ response: "Something went wrong with the database" });
        }
    } else {
        return res.redirect("/login");
    };
});

router.get("/getUserAddress", async (req, res) => {
    if(req.session.authorization !== undefined){
        try {
            const user = await User.query()
                                    .join('addresses', 'users.addressId', 'addresses.id')
                                    .select('street', 'number', 'additional', 'postNb', 'city', 'country')
                                    .where({email: req.session.authorization.user});
            return res.send({response: user[0]});
        } catch (error) {
            console.log(error)
            return res.status(500).send({ response: "Something went wrong with the database" });
        }
    } else {
        return res.redirect("/login");
    }; 
});

router.get("/getUserData", async (req, res) => {
    if(req.session.authorization !== undefined){
        try {
            const user = await User.query()
                                    .join('addresses', 'users.addressId', 'addresses.id')
                                    .select('name', 'street', 'number', 'additional', 'postNb', 'city', 'country')
                                    .where({email: req.session.authorization.user});
            return res.send(user[0]);
        } catch (error) {
            console.log(error)
            return res.status(500).send({ response: "Something went wrong with the database" });
        }
    } else {
        return res.redirect("/login");
    }; 
});

module.exports = router;