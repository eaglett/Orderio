const nodemailer = require('nodemailer');

const keys = require('./keys.js');
const strings = require('./strings.json');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: keys.email,
    pass: keys.emailAppPass
  },
  tls: {
    rejectUnauthorized: false
  },
  secure: false,
  port: 25
});

const generateValidationMessage = (email, hash) => {
  let message = strings.welcomeIntro + strings.verificationLink + email + "&" + hash + strings.welcomeOutro;
  return message;
};

const generatePasswordMessage = (email, hash) => {
  let message = strings.passResetIntro + strings.passwordLink + email + "&" + hash;
  return message;
};

const sendMail = (email, message) => {

  let mailOptions = {
    from: 'node.aneja@gmail.com',
    to: email,
    subject: 'Orderio welcome',
    text: message
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.info('Email error', error);
    } else {
      console.info('Email sent: ', info.response);
    }
  });
};


exports.sendMail = sendMail;
exports.generateValidationMessage = generateValidationMessage;
exports.generatePasswordMessage = generatePasswordMessage;