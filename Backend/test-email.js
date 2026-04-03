import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

console.log("Using email:", process.env.EMAIL_USER);
console.log("Using pass length:", (process.env.EMAIL_PASS || "").length);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify(function(error, success) {
  if (error) {
    console.log("Verify error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});
