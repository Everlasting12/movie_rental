let html =
  "<div><h1>Login Successful!</h1> <p>We are happy to say that you have logged in successfully to our portal!</p> </div>";

const nodemailer = require("nodemailer");
require("dotenv").config();

async function main(to, toname, subject) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports 587
    auth: {
      user: process.env.GMAIL, // generated ethereal user
      pass: process.env.GPASS, // generated ethereal password
    },
  });

  await transporter.sendMail({
    from: process.env.GMAIL, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: `${toname}, ${subject}`, // plain text body
    html: { path: "./mail.html" }, // html body
  });
}

module.exports = { main };
