const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'YOUR-SERVER-GMAIL',
    pass: 'YOUR-APP-PASSWORD' //you need to enable less secure apps, enable 2 step verification and generate app password
  },
  tls: {
    rejectUnauthorized: false
  },
  secure: false,
  port: 25
});

let sendMail = (email) => {
  let message = "Welcome to our portal.";
  
  let mailOptions = {
    from: 'YOUR-SERVER-GMAIL',
    to: email,
    subject: 'Orderio welcome',
    text: message
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.info(error);
    } else {
      console.info('Email sent: ' + info.response);
    }
  });
};

exports.sendMail = sendMail;