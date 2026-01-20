const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

const transporter = nodemailer.createTransport({
    host: 'yjktechnologies.com',
    port: 465,
    secure: true,
    auth: {
      user: 'thiyagarajan.gm@yjktechnologies.com',
      pass: 'Welcome@123',
    },
});

function generateRandomOtp() {
  return otpGenerator.generate(4, { digits: true, upperCase: false, specialChars: false, alphabets: false });
}

function sendOtpEmail(recipientEmail, otp) {
  const mailOptions = {
    from: 'thiyagarajan.gm@yjktechnologies.com',
    to: recipientEmail,
    subject: 'OTP for Login',
    text: `Your OTP for login is: ${otp}`,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
}

function validateOtp(enteredOtp, generatedOtp) {
  // Compare entered OTP with the generated one
  return enteredOtp === generatedOtp;
}

module.exports = {
  generateRandomOtp,
  sendOtpEmail,
  validateOtp,
};
