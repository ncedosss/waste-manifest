const nodemailer = require('nodemailer');

// Configure nodemailer for Office365
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'grootboomunathi@gmail.com',
    pass: 'sddw osay mvde dxyc', 
  },
  tls: {
    rejectUnauthorized: false // ⚠️ Not safe for production
  }
});

// Verify connection
emailTransporter.verify((error, success) => {
  if (error) {
    console.error('Test error: ', error);
  } else {
    console.log('SMTP connection successful!');
  }
});
