const express = require('express');
const router = express.Router();

// For development/testing, use mock service instead of Twilio
// const smsOtpService = require('../services/smsOtpService');
const smsOtpService = require('../services/mockOtpService');

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
    
    const result = await smsOtpService.sendVerificationCode(phoneNumber);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
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
    
    const result = await smsOtpService.checkVerificationCode(phoneNumber, code);
    
    if (result.valid) {
      res.status(200).json({ 
        success: true, 
        message: result.message 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: result.message 
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