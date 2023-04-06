import nodemailer from 'nodemailer';
import pool from './pool.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // replace with your email provider's SMTP server address
  port: 465, // replace with the SMTP port number used by your email provider
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'vxhung.dev@gmail.com', // replace with your email address
    pass: 'vmaxvciocewtarvi', // replace with your email password
  },
});
const sendEmailOtp = async (mailOptions, user_id) => {
  const conn = await pool.getConnection();
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, async (error) => {
      if (error) {
        reject(error);
      } else {
        const [otp] = await conn.query('SELECT * FROM Otp WHERE user_id = ?', [user_id]);
        if (otp.length === 0) {
          await conn.query('INSERT INTO Otp (user_id, otp) VALUES (?, ?)', [
            user_id,
            mailOptions.otp,
          ]);
          resolve({ message: 'send otp success', success: true });
        } else {
          await conn.query('UPDATE Otp SET otp = ? WHERE id = ?', [mailOptions.otp, otp[0].id]);
          resolve({ message: 'send otp success', success: true });
        }
      }
      conn.release();
    });
  });
};
export default sendEmailOtp;
