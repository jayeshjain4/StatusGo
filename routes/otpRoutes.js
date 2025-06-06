const express = require('express');
const router = express.Router();
const twilio = require('twilio');
require('dotenv').config();

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const verifyServiceSid = process.env.TWILIO_SERVICE_SID;

// Request a verification code
router.post('/send', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
      });
    }
    
    try {
      const verification = await twilioClient.verify.v2
        .services(verifyServiceSid)
        .verifications
        .create({ to: phoneNumber, channel: 'sms' });
      
      return res.status(200).json({ 
        success: true, 
        status: verification.status,
        message: 'Verification code sent successfully' 
      });
    } catch (error) {
      console.error('Error sending verification code:', error);
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to send verification code',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Verification request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send verification code' 
    });
  }
});

// Verify a code
router.post('/verify', async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    
    if (!phoneNumber || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and verification code are required' 
      });
    }
    
    try {
      const verificationCheck = await twilioClient.verify.v2
        .services(verifyServiceSid)
        .verificationChecks
        .create({ to: phoneNumber, code });
      
      return res.status(verificationCheck.status === 'approved' ? 200 : 400).json({
        success: verificationCheck.status === 'approved', 
        status: verificationCheck.status,
        message: verificationCheck.status === 'approved' 
          ? 'Verification successful' 
          : 'Invalid verification code'
      });
    } catch (error) {
      console.error('Error checking verification code:', error);
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to verify code',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Verification check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify code' 
    });
  }
});

module.exports = router;