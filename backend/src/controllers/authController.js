import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// Regular expression for basic RFC 5322 email validation
const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

/**
 * @desc    Register a new customer account
 * @route   POST /api/auth/register
 * @access  Public
 *
 * IMPORTANT SECURITY RULE:
 * Public registration ALWAYS enforces role='customer'.
 * Role values supplied in req.body are strictly ignored to prevent privilege escalation.
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password.',
      });
    }

    // 2. Validate email format
    const trimmedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // 3. Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters in length.',
      });
    }

    // 4. Check for duplicate email registration
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // 5. Create user record (role is strictly hardcoded to 'customer')
    const user = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      password: password, // Mongoose pre-save hook will securely hash with bcrypt
      phone: phone ? phone.trim() : '',
      role: 'customer', // Enforce customer role explicitly
    });

    // 6. Generate signed JWT token
    const token = generateToken(user._id, user.role);

    // 7. Return success response with safe user profile
    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & return JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 2. Find user in MongoDB (explicitly request password field as it is marked select: false)
    const user = await User.findOne({ email: trimmedEmail }).select('+password');

    // 3. User existence check
    if (!user) {
      // Use uniform message to prevent account enumeration attacks
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 4. Verify password with bcrypt comparison
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 5. Issue JWT token
    const token = generateToken(user._id, user.role);

    // 6. Return response (excluding password hash)
    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/profile
 * @access  Private (Requires valid JWT)
 */
export const getUserProfile = async (req, res, next) => {
  try {
    // req.user is set by verifyToken middleware (excludes password)
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/auth/profile
 * @access  Private (Requires valid JWT)
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const { name, phone, password } = req.body;

    // Security Safeguard: User role cannot be altered via customer profile updates
    // Any role or email parameter provided in req.body is strictly ignored.
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    // If updating password, enforce minimum length
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters in length.',
        });
      }
      user.password = password; // Triggers pre-save bcrypt hook
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
