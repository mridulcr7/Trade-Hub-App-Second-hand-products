// import nodemailer from 'nodemailer';

// export const sendResetPasswordEmail = async (email: string, token: string) => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: 'Password Reset',
//     text: `You requested a password reset. Please use the following token to reset your password: ${token}`,
//   };

//   await transporter.sendMail(mailOptions);
// };

// export const sendForgotPasswordEmail = async (email: string, token: string) => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: 'Forgot Password',
//     text: `You requested a password reset. Please use the following token to reset your password: ${token}`,
//   };

//   await transporter.sendMail(mailOptions);
// };
