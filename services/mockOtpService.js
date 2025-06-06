const fs = require('fs');
const path = require('path');

class MockOtpService {
  constructor() {
    this.otpStore = new Map();
    this.logFile = path.join(__dirname, '../logs/otp-logs.txt');
    
    // Ensure logs directory exists
    const dir = path.dirname(this.logFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Send verification code via mock service (no actual SMS)
   * @param {string} phoneNumber - Phone number to send verification to
   * @returns {Promise<Object>} - Result of send operation
   */
  async sendVerificationCode(phoneNumber) {
    try {
      // Generate a 6-digit OTP code
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP for verification (5 minute expiry)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);
      
      this.otpStore.set(phoneNumber, {
        code: otp,
        expiresAt
      });
      
      // Log the OTP to file instead of sending SMS
      const logMessage = `[${new Date().toISOString()}] Phone: ${phoneNumber}, OTP: ${otp}\n`;
      fs.appendFileSync(this.logFile, logMessage);
      
      console.log(`MOCK SMS SENT - Phone: ${phoneNumber}, OTP: ${otp}`);
      
      return { 
        success: true, 
        status: 'pending',
        message: 'Verification code sent successfully (MOCK)' 
      };
    } catch (error) {
      console.error('Error in mock OTP service:', error);
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
      const otpData = this.otpStore.get(phoneNumber);
      
      if (!otpData) {
        return { 
          valid: false, 
          status: 'not_found',
          message: 'No verification request found for this number' 
        };
      }
      
      if (new Date() > otpData.expiresAt) {
        this.otpStore.delete(phoneNumber);
        return { 
          valid: false, 
          status: 'expired',
          message: 'Verification code has expired' 
        };
      }
      
      const isValid = otpData.code === code;
      
      if (isValid) {
        this.otpStore.delete(phoneNumber);
      }
      
      return { 
        valid: isValid,
        status: isValid ? 'approved' : 'pending',
        message: isValid ? 'Verification successful' : 'Invalid verification code'
      };
    } catch (error) {
      console.error('Error in mock OTP verification:', error);
      return { 
        valid: false, 
        message: 'Failed to verify code',
        error: error.message
      };
    }
  }
}

module.exports = new MockOtpService();
