const nodemailer = require("nodemailer");

const createNoopTransporter = () => ({
  verify: (callback) => callback?.(null),
  sendMail: async () => ({ messageId: "noop" }),
});

let transporter;
const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim();

if (!emailUser || !emailPass) {
  console.warn("Email disabled: EMAIL_USER or EMAIL_PASS is not set");
  transporter = createNoopTransporter();
} else {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  transporter.verify((error) => {
    if (error) {
      console.error("Email config error:", error);
    } else {
      console.log("Email server ready!");
    }
  });
}

module.exports = transporter;
