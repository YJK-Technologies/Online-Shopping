//mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",            
  port: 587,                       
  secure: false,                   
  auth: {
    user: "alert@yjktechnologies.com",
    pass: "W3iug&sl",
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = transporter;
