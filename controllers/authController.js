const User = require("../models/userModel");

const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    sendTokenResponse(user, 201, res); // Changed to 201 for resource creation
  } catch (err) {
    // Check for the specific MongoDB duplicate key error
    if (err.code === 11000) {
      const message = "That email is already registered";
      return res.status(400).json({ success: false, error: message });
    }

    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ success: false, error: message });
    }

    // For other errors
    console.error(err); // Log the full error for debugging
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ... also update the login function's error handling for consistency
exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Please provide an email and password",
        });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

//-------------------------------------
// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res
      .status(404)
      .json({ success: false, error: "There is no user with that email" });
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL (Update the URL to match your frontend)
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/auth/resetpassword/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Token",
      message,
    });
    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    console.error(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return res
      .status(500)
      .json({ success: false, error: "Email could not be sent" });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
exports.resetPassword = async (req, res, next) => {
  // Get hashed token from the URL
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, error: "Invalid token" });
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
};

// You can also slightly improve the sendTokenResponse function
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({ success: true, token });
};
