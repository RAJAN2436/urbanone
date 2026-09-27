import crypto from 'crypto';
import { database } from '../config/db.js';
import { dispatchTwilioSms } from '../services/smsService.js';

export const AuthPresenter = {
  // POST /api/auth/send-otp
  sendOtp: async (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ success: false, message: 'Phone number is required' });
      }

      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Indian mobile number' });
      }

      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000;

      await database.saveOtp(cleanPhone, otpCode, expiresAt);
      const smsResult = await dispatchTwilioSms(cleanPhone, otpCode);

      return res.json({
        success: true,
        message: smsResult.liveDelivered
          ? `OTP sent via Twilio to +91 ${cleanPhone}`
          : `Verification code generated for +91 ${cleanPhone}`,
        phone: `+91 ${cleanPhone}`,
        provider: 'Twilio',
        expiresInSeconds: 300,
        devOtp: smsResult.liveDelivered ? undefined : otpCode,
        notice: smsResult.liveDelivered ? undefined : smsResult.error,
        smsPacket: smsResult
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/auth/verify-otp
  verifyOtp: async (req, res) => {
    try {
      const { phone, otp } = req.body;
      if (!phone || !otp) {
        return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
      }

      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const record = await database.getOtp(cleanPhone);

      if (!record) {
        return res.status(400).json({ success: false, message: 'No OTP requested for this phone. Please request OTP first.' });
      }

      const isMatch = record && record.otp === otp && Date.now() < record.expiresAt;

      if (!isMatch) {
        await database.incrementOtpAttempts(cleanPhone);
        if ((record.attempts + 1) >= 5) {
          await database.deleteOtp(cleanPhone);
          return res.status(400).json({ success: false, message: 'Maximum invalid attempts exceeded. Please request a new OTP.' });
        }
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP code. Please check your SMS and try again.' });
      }

      await database.deleteOtp(cleanPhone);

      const formattedPhone = `+91 ${cleanPhone}`;
      let user = await database.getUserByPhone(cleanPhone);

      if (!user) {
        user = await database.createUser({
          id: `cust-${Date.now()}`,
          name: 'Ushait Foodie',
          phone: formattedPhone,
          email: `user_${cleanPhone}@kalsen.one`,
          tier: 'Silver VIP',
          loyaltyPoints: 100,
          walletBalance: 150,
          streakCount: 1,
          referralCode: `KALSEN-${cleanPhone.slice(-4)}`,
          address: {
            tag: 'Home',
            street: 'Main Market Road, Ushait',
            landmark: 'Ushait Center',
            coords: { x: 45, y: 40 }
          }
        });
      }

      const token = `kalsen_jwt_${crypto.randomBytes(16).toString('hex')}`;

      return res.json({
        success: true,
        message: 'OTP verified successfully. Welcome to KalsenOne!',
        token,
        user
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/auth/login-password (Email & Password Login)
  loginWithPassword: async (req, res) => {
    try {
      const emailOrPhone = req.body.email || req.body.emailOrPhone;
      const { password } = req.body;
      if (!emailOrPhone || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      const user = await database.validateUserPassword(emailOrPhone.trim(), password);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please verify your credentials or sign up.'
        });
      }

      const token = `kalsen_jwt_${crypto.randomBytes(16).toString('hex')}`;
      return res.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        token,
        user
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/auth/forgot-password/request
  requestPasswordReset: async (req, res) => {
    try {
      const { emailOrPhone } = req.body;
      if (!emailOrPhone) {
        return res.status(400).json({ success: false, message: 'Email or Mobile number is required' });
      }

      const user = await database.getUserByEmailOrPhone(emailOrPhone);
      if (!user) {
        return res.status(404).json({ success: false, message: 'No registered user found with this email/phone.' });
      }

      if (!user.phone) {
        return res.status(400).json({ success: false, message: 'This account has no phone number registered. Password reset via SMS is not available.' });
      }

      const cleanPhone = (user.phone || '').replace(/\D/g, '').slice(-10);
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000;

      await database.saveOtp(cleanPhone, otpCode, expiresAt);
      const smsResult = await dispatchTwilioSms(cleanPhone, otpCode);

      return res.json({
        success: true,
        message: smsResult.liveDelivered
          ? `Password reset code sent via SMS to ${user.phone}`
          : `Password reset code generated for ${user.phone}`,
        phone: user.phone,
        devOtp: smsResult.liveDelivered ? undefined : otpCode,
        expiresInSeconds: 300,
        smsPacket: smsResult
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/auth/forgot-password/reset
  resetPassword: async (req, res) => {
    try {
      const { emailOrPhone, otp, newPassword } = req.body;
      if (!emailOrPhone || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email/Phone, Reset Code, and New Password are required' });
      }

      if (newPassword.length < 4) {
        return res.status(400).json({ success: false, message: 'New password must be at least 4 characters long' });
      }

      const user = await database.getUserByEmailOrPhone(emailOrPhone);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User account not found' });
      }

      if (!user.phone) {
        return res.status(400).json({ success: false, message: 'This account has no phone number. Cannot verify reset code.' });
      }

      const cleanPhone = (user.phone || '').replace(/\D/g, '').slice(-10);
      const record = await database.getOtp(cleanPhone);

      if (!record) {
        return res.status(400).json({ success: false, message: 'No reset code requested. Please request a new code.' });
      }

      const isMatch = record && record.otp === otp && Date.now() < record.expiresAt;
      if (!isMatch) {
        await database.incrementOtpAttempts(cleanPhone);
        return res.status(400).json({ success: false, message: 'Invalid or expired reset code. Please check your SMS and try again.' });
      }

      await database.deleteOtp(cleanPhone);
      const updatedUser = await database.updateUserPassword(emailOrPhone, newPassword);

      const token = `kalsen_jwt_${crypto.randomBytes(16).toString('hex')}`;
      return res.json({
        success: true,
        message: 'Password reset successfully! You can now sign in with your new password.',
        token,
        user: updatedUser
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/auth/google (Google One-Click Sign In & Register)
  googleAuth: async (req, res) => {
    try {
      const { email, name, googleId, avatar } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Google account email is required' });
      }

      const cleanEmail = email.trim().toLowerCase();
      let user = await database.getUserByEmail(cleanEmail);

      if (!user) {
        user = await database.createUser({
          id: `cust-${Date.now()}`,
          name: name ? name.trim() : cleanEmail.split('@')[0],
          email: cleanEmail,
          googleId: googleId || `g_${Date.now()}`,
          avatar: avatar || null,
          profileCompleted: false,
          walletBalance: 150,
          loyaltyPoints: 200,
          tier: 'Gold VIP',
          streakCount: 1,
          referralCode: `KALSEN-${Date.now().toString().slice(-4)}`
        });
      }

      const token = `kalsen_jwt_${crypto.randomBytes(16).toString('hex')}`;
      return res.json({
        success: true,
        message: `Welcome to KalsenOne, ${user.name}!`,
        token,
        user
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/auth/register (Email & Password Registration)
  register: async (req, res) => {
    try {
      const { email, password, name, phone, street, landmark, pinCode, referralCode } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required' });
      }
      if (!password || password.length < 4) {
        return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const existingUser = await database.getUserByEmail(cleanEmail);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists. Please sign in.'
        });
      }

      const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : null;
      const formattedPhone = cleanPhone ? `+91 ${cleanPhone}` : null;
      const bonusAmount = 150;

      const newUser = await database.createUser({
        id: `cust-${Date.now()}`,
        name: name ? name.trim() : cleanEmail.split('@')[0],
        email: cleanEmail,
        password,
        phone: formattedPhone,
        tier: 'Gold VIP',
        loyaltyPoints: 200,
        walletBalance: bonusAmount,
        streakCount: 1,
        referralCode: referralCode || `KALSEN-${Date.now().toString().slice(-4)}`,
        profileCompleted: Boolean(name && formattedPhone && street),
        address: street ? {
          tag: 'Home',
          street: street.trim(),
          landmark: landmark ? landmark.trim() : 'Main Market Road, Near Clock Tower',
          pinCode: pinCode ? pinCode.trim() : '',
          coords: { x: 42, y: 42 }
        } : null
      });

      const token = `kalsen_jwt_${crypto.randomBytes(16).toString('hex')}`;
      return res.status(201).json({
        success: true,
        message: `Account created successfully with ₹${bonusAmount} welcome bonus!`,
        token,
        user: newUser
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/auth/user/:id
  getUserProfile: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }
      const user = await database.getUserById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.json({ success: true, user });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/auth/complete-profile (One-time mobile number, full name, address entry)
  completeProfile: async (req, res) => {
    try {
      const { userId, name, phone, address, landmark, pinCode } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Full name is required' });
      }
      if (!phone || phone.replace(/\D/g, '').length < 10) {
        return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number is required' });
      }
      if (!address || !address.trim()) {
        return res.status(400).json({ success: false, message: 'Delivery address is required' });
      }

      const updatedUser = await database.completeUserProfile(userId, {
        name: name.trim(),
        phone: phone.trim(),
        street: address.trim(),
        landmark: landmark || 'Ushait Center',
        pinCode: pinCode ? pinCode.trim() : ''
      });

      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.json({
        success: true,
        message: 'Profile completed! You are ready to order.',
        user: updatedUser
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/auth/user/:userId/address
  addAddress: async (req, res) => {
    try {
      const { userId } = req.params;
      const { tag, street, landmark, pinCode, coords } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }
      if (!street || !street.trim()) {
        return res.status(400).json({ success: false, message: 'Street address is required' });
      }
      const updatedUser = await database.addUserAddress(userId, { tag, street, landmark, pinCode, coords });
      return res.json({
        success: true,
        message: 'Address added successfully',
        user: updatedUser
      });
    } catch (err) {
      console.error('[AuthPresenter addAddress error]:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE /api/auth/user/:userId/address/:addressId
  deleteAddress: async (req, res) => {
    try {
      const { userId, addressId } = req.params;
      if (!userId || !addressId) {
        return res.status(400).json({ success: false, message: 'User ID and Address ID are required' });
      }
      const updatedUser = await database.deleteUserAddress(userId, addressId);
      return res.json({
        success: true,
        message: 'Address removed successfully',
        user: updatedUser
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/auth/merchant/login
  merchantLogin: async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username/Email and password are required' });
      }

      const merchant = await database.validateMerchantPassword(username, password);
      if (!merchant) {
        return res.status(401).json({
          success: false,
          message: 'Invalid merchant username or password. Please verify your credentials or register your store.'
        });
      }

      const token = `kalsen_merchant_jwt_${crypto.randomBytes(16).toString('hex')}`;
      return res.json({
        success: true,
        message: `Welcome back to Merchant OS, ${merchant.name}!`,
        token,
        merchant
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/auth/merchant/register
  merchantRegister: async (req, res) => {
    try {
      const { username, password, name, phone, email, category, cuisine, address, costForTwo } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Store name is required' });
      }
      if (!password) {
        return res.status(400).json({ success: false, message: 'Password is required' });
      }

      const cleanUsername = (username || name.toLowerCase().replace(/[^a-z0-9]/g, '')).trim();

      const createdMerchant = await database.createMerchant({
        username: cleanUsername,
        password,
        name: name.trim(),
        phone: phone || '+91 98765 00000',
        email: email || `${cleanUsername}@kalsenpartner.com`,
        category: category || 'Food',
        cuisine: cuisine || 'North Indian, Street Food',
        address: address || 'Main Market Road, Ushait',
        costForTwo: costForTwo || '₹400',
        image: category === 'Food'
          ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'
          : (category === 'Grocery'
            ? 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80')
      });

      // Broadcast update to Admin Portal & Customer App so new store is visible immediately
      try {
        const { emitMerchantsUpdate } = await import('../services/socketService.js');
        const allMerchants = await database.getAllMerchants();
        await emitMerchantsUpdate(allMerchants);
      } catch (e) {}

      const token = `kalsen_merchant_jwt_${crypto.randomBytes(16).toString('hex')}`;
      return res.status(201).json({
        success: true,
        message: `Store "${createdMerchant.name}" registered and activated in MongoDB!`,
        token,
        merchant: createdMerchant
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/auth/rider/register
  riderRegister: async (req, res) => {
    try {
      const {
        fullName,
        name,
        phone,
        mobileNumber,
        email,
        password,
        drivingLicenseNumber,
        licenseNumber,
        photo,
        vehicleType,
        vehicleNumber
      } = req.body;

      const finalName = (fullName || name || '').trim();
      const finalPhone = (mobileNumber || phone || '').trim();
      const finalLicense = (drivingLicenseNumber || licenseNumber || '').trim();

      if (!finalName) {
        return res.status(400).json({ success: false, message: 'Full name is required' });
      }
      if (!finalPhone) {
        return res.status(400).json({ success: false, message: 'Mobile number is required' });
      }
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required' });
      }
      if (!password) {
        return res.status(400).json({ success: false, message: 'Password is required' });
      }
      if (!finalLicense) {
        return res.status(400).json({ success: false, message: 'Driving license number is required' });
      }

      const existingRiders = await database.getAllRiders();
      const cleanDigits = finalPhone.replace(/\D/g, '').slice(-10);
      const duplicateRider = existingRiders.find(r => 
        (r.phone && r.phone.replace(/\D/g, '').endsWith(cleanDigits)) ||
        (r.email && r.email.toLowerCase() === email.toLowerCase())
      );

      if (duplicateRider) {
        // Update the existing rider application with latest details & password
        const updatedList = await database.updateRider(duplicateRider.id, {
          name: finalName,
          email: email.trim().toLowerCase(),
          phone: finalPhone.startsWith('+91') ? finalPhone : `+91 ${cleanDigits}`,
          password,
          drivingLicenseNumber: finalLicense,
          photo: photo || duplicateRider.photo,
          vehicleType: vehicleType || duplicateRider.vehicleType,
          vehicleNumber: vehicleNumber || duplicateRider.vehicleNumber
        });

        try {
          const { emitRidersUpdate } = await import('../services/socketService.js');
          await emitRidersUpdate(updatedList);
        } catch (e) {}

        const updatedRider = updatedList.find(r => r.id === duplicateRider.id);

        return res.status(200).json({
          success: true,
          message: 'Account details updated successfully! Welcome to Kalsen fleet.',
          rider: updatedRider
        });
      }

      const riderId = `r-${Date.now().toString().slice(-6)}`;
      const updatedList = await database.createRider({
        id: riderId,
        name: finalName,
        phone: finalPhone.startsWith('+91') ? finalPhone : `+91 ${cleanDigits}`,
        email: email.trim().toLowerCase(),
        password,
        drivingLicenseNumber: finalLicense,
        photo: photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        vehicleType: vehicleType || 'Electric Scooter (Ather 450X)',
        vehicleNumber: vehicleNumber || 'UP 24 HY 0000',
        approvalStatus: 'pending',
        kycVerified: false
      });

      // Broadcast update to Admin Portal so admin immediately sees new registration
      try {
        const { emitRidersUpdate } = await import('../services/socketService.js');
        await emitRidersUpdate(updatedList);
      } catch (e) {}

      const createdRider = updatedList.find(r => r.id === riderId);

      return res.status(201).json({
        success: true,
        message: 'Registration submitted successfully! Your application has been sent to Admin for approval.',
        rider: createdRider
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/auth/rider/login
  riderLogin: async (req, res) => {
    try {
      const { identifier, phone, email, password } = req.body;
      const targetId = identifier || phone || email;

      if (!targetId) {
        return res.status(400).json({ success: false, message: 'Mobile number or email is required' });
      }
      if (!password) {
        return res.status(400).json({ success: false, message: 'Password is required' });
      }

      const rider = await database.validateRiderCredentials(targetId, password);
      if (!rider) {
        return res.status(401).json({
          success: false,
          message: 'Invalid mobile number/email or password. Please verify credentials or register.'
        });
      }

      const token = `kalsen_rider_jwt_${crypto.randomBytes(16).toString('hex')}`;
      return res.json({
        success: true,
        message: `Welcome, ${rider.name}!`,
        token,
        rider
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/auth/rider/:id/status
  getRiderStatus: async (req, res) => {
    try {
      const rider = await database.getRiderById(req.params.id);
      if (!rider) {
        return res.status(404).json({ success: false, message: 'Rider not found' });
      }
      return res.json({
        success: true,
        rider
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/auth/rider/:id/profile
  updateRiderProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        fullName,
        phone,
        mobileNumber,
        email,
        photo,
        drivingLicenseNumber,
        licenseNumber,
        vehicleType,
        vehicleNumber,
        password
      } = req.body;

      const finalName = fullName || name;
      const finalPhone = mobileNumber || phone;
      const finalLicense = drivingLicenseNumber || licenseNumber;

      const updatedList = await database.updateRider(id, {
        ...(finalName ? { name: finalName.trim() } : {}),
        ...(finalPhone ? { phone: finalPhone.trim() } : {}),
        ...(email ? { email: email.trim().toLowerCase() } : {}),
        ...(photo ? { photo } : {}),
        ...(finalLicense ? { drivingLicenseNumber: finalLicense.trim() } : {}),
        ...(vehicleType ? { vehicleType: vehicleType.trim() } : {}),
        ...(vehicleNumber ? { vehicleNumber: vehicleNumber.trim() } : {}),
        ...(password ? { password } : {})
      });

      // Broadcast update to Admin Portal and all portals in real-time
      try {
        const { emitRidersUpdate } = await import('../services/socketService.js');
        await emitRidersUpdate(updatedList);
      } catch (e) {}

      const rider = (await database.getAllRiders()).find(r => r.id === id);

      console.log(`[Rider Profile Updated] 🛵 #${id} (${rider?.name || 'Rider'}) photo & details saved to MongoDB`);

      return res.json({
        success: true,
        message: 'Rider profile updated successfully!',
        rider
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};
