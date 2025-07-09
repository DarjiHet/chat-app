const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth : {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


transporter.verify((error, success) => {
    if(error){
        console.error('Gmail Services failed')
    }else{
        console.log('Gmail configured properly and ready to send gmail');
    }
});

const sendOtpToEmail = async (email,otp) => {
    const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
    <h2 style="color: #25D366; text-align: center;">WhatsApp Web Verification</h2>
    <p style="font-size: 16px; color: #333;">Dear user,</p>
    <p style="font-size: 16px; color: #333;">Use the following OTP to verify your WhatsApp Web session:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #000; background: #e0ffe0; padding: 10px 20px; border-radius: 6px;">
        ${otp}
      </span>
    </div>
    <p style="font-size: 14px; color: #666;">This OTP is valid for the next 5 minutes. Do not share this code with anyone.</p>
    <p style="font-size: 14px; color: #666;">If you are not trying to verify your WhatsApp Web session, please ignore this email.</p>
    <p style="font-size: 14px; color: #999; margin-top: 40px;">Thank you,<br/>The WhatsApp Team</p>
  </div>
`;


    await transporter.sendMail({
        from: `WhatsApp web ${process.env.EMAIL_USER}`,
        to: email,
        subject: `your whatsapp Verification code`,
        html,
    })
}

module.exports = sendOtpToEmail;