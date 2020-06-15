const router = require('express').Router();

/* Add pages */
const path = require('path');
const fs = require('fs');

const navbarPage = fs.readFileSync(path.join(__dirname, "../views", "navbar.html"));
const indexPage = fs.readFileSync(path.join(__dirname, "../views", "index.html"));

/* Set up routes */
router.get("/", (req, res) => {
    res.send(navbarPage + indexPage);
});

module.exports = router;