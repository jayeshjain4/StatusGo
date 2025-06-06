const twilio = require('twilio');
require('dotenv').config();

class SmsOtpService {
  constructor() {
    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.verifyServiceSid = process.env.TWILIO_SERVICE_SID;
  }

  /**
   * Send verification code via Twilio Verify
   * @param {string} phoneNumber - Phone number to send verification to
   * @returns {Promise<Object>} - Result of send operation
   */
  async sendVerificationCode(phoneNumber) {
    try {
      const verification = await this.twilioClient.verify.v2
        .services(this.verifyServiceSid)
        .verifications
        .create({ to: phoneNumber, channel: 'sms' });
      
      return { 
        success: true, 
        status: verification.status,
        message: 'Verification code sent successfully' 
      };
    } catch (error) {
      console.error('Error sending verification code:', error);
      return { 
        success: false, 
        message: 'Failed to send verification code',
        error: error.message
      };
    }
  }

  /**
   * Check verification code entered by user
   * @param {string} phoneNumber - Phone number to verify
   * @param {string} code - Verification code entered by user
   * @returns {Promise<Object>} - Result of verification
   */
  async checkVerificationCode(phoneNumber, code) {
    try {
      const verificationCheck = await this.twilioClient.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks
        .create({ to: phoneNumber, code });
      
      return { 
        valid: verificationCheck.status === 'approved',
        status: verificationCheck.status,
        message: verificationCheck.status === 'approved' 
          ? 'Verification successful' 
          : 'Invalid verification code'
      };
    } catch (error) {
      console.error('Error checking verification code:', error);
      return { 
        valid: false, 
        message: 'Failed to verify code',
        error: error.message
      };
    }
  }
}

module.exports = new SmsOtpService();