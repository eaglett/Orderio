const router = require('express').Router();

/* Set up Models */
const User = require('../models/User.js');

/* Set up node mailer */
const nodeMailer = require('../config/nodeMailer.js');
const emailVerification = require('../config/verification.js');

/* Add pages */
const fs = require('fs');
const path = require('path');

const navbarPage = fs.readFileSync(path.join(__dirname, '../views', 'navbar.html'))
const newVerificationPage = fs.readFileSync(path.join(__dirname, '../views/auth', 'newVerification.html'));

/* Set up routes */
router.get("/verification/:email&:verification", async (req, res) => {
    const validated = emailVerification.validateHash(req.params.email, req.params.verification);
    if (validated) {
        try{
            await User.query().patch({ active: 1 }).where({ email: req.params.email });
            //return res.send({ response: "Your account is verified. You can log in now."})
            return res.redirect("/login");
        } catch (error){
            return res.status(500).send({ response: "Something went wrong with the database" });
        }
    } else {
        return res.status(408).send({response: "Verification code is incorrect or it has expired"});
    }
});

router.get("/newVerification/", (req, res) => {
    res.send(navbarPage + newVerificationPage);
});

router.post("/newVerification", async (req, res) => {
    const email = req.body.email;
    try {
        const userFound = await User.query().select().where({ 'email': email }).limit(1);
        if (userFound.length = 0) {
            return res.status(400).send({ response: "User doesn't exist with that email." });
        } else {
            const hash = emailVerification.generateHash(email);
            const message = nodeMailer.generateValidationMessage(email, hash);
            nodeMailer.sendMail(email, message);

            return res.send({response: "A new verification link has been sent to your email"});
        }
    } catch(error){
        return res.status(500).send({ response: "Something went wrong with the database" });
    }
});

module.exports = router;