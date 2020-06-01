const router = require('express').Router();

/* Set up parsing */
const bodyParser = require('body-parser'); // parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())// parse application/json

/* Set up Bcrypt */
const bcrypt = require('bcrypt');
const saltRounds = 12;

/* Set up node mailer */
const nodeMailer = require('../config/nodeMailer.js');
const emailVerification = require('../config/verification.js');

/* Set up Models */
const User = require('../models/User.js');
const Role = require('../models/Role.js');
const Address = require('../models/Address.js');

/* Add pages */
const path = require('path');
const fs = require('fs');

const navbarPage = fs.readFileSync(path.join(__dirname, '../views', 'navbar.html'));
const signupPage = fs.readFileSync(path.join(__dirname, '../views/auth', 'signup.html'));
const loginPage = fs.readFileSync(path.join(__dirname, '../views/auth', 'login.html'));


/* Set up routes */

router.get("/signup", (req, res) => {
    return res.send(navbarPage + signupPage);
});

router.post("/signup", async (req, res) => {
    //1. retrive and validate data
    //2. does the user already exist?
    //3. if yes -> login
    //3. if no -> hash password, insert address and user into the DB

    const {type, name, email, password, passwordRepeat, street, number, additional, postNb, city, country} = req.body;
    const isPasswordTheSame = password === passwordRepeat;
    //const isFieldMissing =  name && email && password && passwordRepeat && street && number && postNb && city && country;

    if( isPasswordTheSame ){
        //console.log("field", isFieldMissing)
        // password requirements
        if (password.length < 8) {
            return res.status(400).send({ response: "Password does not fulfill the requirements. Enter a password longer than 8 chars." });
        } else{
            try {
                const userFound = await User.query().select().where({ 'email': email }).limit(1);
                if (userFound.length > 0) {
                    return res.status(400).send({ response: "User already exists. Log in instead" });
                } else {
                    const userRoles = await Role.query().select().where({ role: type.toUpperCase() });
                    
                    const hashedPassword = await bcrypt.hash(password, saltRounds);

                    const createdAddress = await Address.query().insert({
                        street,
                        number,
                        additional, 
                        postNb,
                        city,
                        country
                    });
                    const createdUser = await User.query().insert({
                        email, email,
                        password: hashedPassword,
                        name: name,
                        addressId: createdAddress.id,
                        roleId: userRoles[0].id
                    });
                    
                    const hash = emailVerification.generateHash(email);
                    const message = nodeMailer.generateValidationMessage(email, hash);
                    nodeMailer.sendMail(email, message);
                    
                    return res.send({ response: `User has been created. Check your email to verify the account.` });
                }
            } catch (error) {
                return res.status(500).send({ response: "Something went wrong with the database" });
            }
        }
    } else if (password && passwordRepeat && !isPasswordTheSame) {
        return res.status(400).send({ response: "Passwords do not match. Fields: password and passwordRepeat" });
    } else {
        return res.status(404).send({ response: "Fields missing. Please fill in all of the fields." });
    }
});

router.get("/login", (req, res) => {
    return res.send(navbarPage + loginPage);
});

router.post("/login", async (req, res) => {
    // 1. retrieve the login details and validate
    // 2. check for a user match in the database
    // 3. bcrypt compare
    // 4. sessions

    //req.session.authorization.push()

    const { email, password } = req.body;

    if (email && password){
        try{
            const userArray = await User.query().select().where({ 'email': email }); //if the user doesn't exist, we get []

            if (userArray.length !== 0 && userArray[0].active ){
                await bcrypt.compare(password, userArray[0].password).then((result) => {
                    //login
                    if(result === true){
                        req.session.authorization = { user: email, loggedInTime: Date.now()}
                        return res.redirect('/');
                    }else{
                        return res.status(401).send({ response: "Authentication error. Wrong password" });
                    }
                });
            } else if ( userArray[0].active === 0 ){
                return res.status(401).send({ response: "Authentication error. Account is not verified." });
            } else {
                //there is no such user
                return res.status(401).send({ response: "Authentication error. User with that username doesn't exist." });
            }
        } catch (error) {
            console.log(error)
            return res.status(500).send({ response: "Something went wrong with the database" });
        }
    } else {
        return res.status(404).send({ response: "Missing fields: email, password" });
    }
});

//change to post
router.get("/logout", (req, res) => {
    //destroy the session
    req.session.destroy(function(error) {
        if(error === undefined){ //if there is no error
            return res.redirect('/');
        } else{
            return res.status(500).send({ response: "Something went wrong, couldn't log out" });
        }
      })
});

module.exports = router;