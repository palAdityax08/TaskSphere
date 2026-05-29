const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

let adminApp = null;

function getFirebaseAdmin() {
  if (adminApp) return adminApp;

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY ||
      FIREBASE_PROJECT_ID === 'YOUR_FIREBASE_PROJECT_ID') {
    throw new Error('Firebase Admin credentials not configured in .env');
  }

  const admin = require('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }
  adminApp = admin;
  return admin;
}

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }

      const user = await User.create({ name, email, password, authProvider: 'local' });
      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      if (user.authProvider === 'google') {
        return res.status(400).json({
          success: false,
          message: 'This account uses Google Sign-In. Please use the Google button to sign in.',
        });
      }

      const match = await user.comparePassword(password);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user._id);

      return res.json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  }
);

router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Firebase ID token required' });
    }

    let admin;
    try {
      admin = getFirebaseAdmin();
    } catch (e) {
      return res.status(503).json({
        success: false,
        message: 'Google Sign-In is not configured on this server yet.',
      });
    }

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired Google token' });
    }

    const { uid, email, name, picture } = decoded;

    let user = await User.findOne({ $or: [{ googleId: uid }, { email }] });

    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId: uid,
        avatar: picture || null,
        authProvider: 'google',
      });
    } else if (!user.googleId) {
      user.googleId = uid;
      user.avatar = picture || user.avatar;
      await user.save();
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
