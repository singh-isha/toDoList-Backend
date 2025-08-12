const User = require('../models/userModel');

// // @desc    Register user
// // @route   POST /api/auth/register
// // @access  Public
// exports.register = async (req, res, next) => {
//     try {
//         const { name, email, password } = req.body;

//         // Create user
//         const user = await User.create({
//             name,
//             email,
//             password
//         });

//         sendTokenResponse(user, 200, res);
//     } catch (err) {
//         res.status(400).json({ success: false, error: err.message });
//     }
// };

// // @desc    Login user
// // @route   POST /api/auth/login
// // @access  Public
// exports.login = async (req, res, next) => {
//     const { email, password } = req.body;

//     // Validate email & password
//     if (!email || !password) {
//         return res.status(400).json({ success: false, error: 'Please provide an email and password' });
//     }

//     // Check for user
//     const user = await User.findOne({ email }).select('+password');

//     if (!user) {
//         return res.status(401).json({ success: false, error: 'Invalid credentials' });
//     }

//     // Check if password matches
//     const isMatch = await user.matchPassword(password);

//     if (!isMatch) {
//         return res.status(401).json({ success: false, error: 'Invalid credentials' });
//     }

//     sendTokenResponse(user, 200, res);
// };

// // Get token from model, create cookie and send response
// const sendTokenResponse = (user, statusCode, res) => {
//     // Create token
//     const token = user.getSignedJwtToken();

//     const options = {
//         expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//         httpOnly: true
//     };

//     if (process.env.NODE_ENV === 'production') {
//         options.secure = true;
//     }

//     res
//         .status(statusCode)
//         .cookie('token', token, options)
//         .json({ success: true, token });
// };





 // re add

exports.signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Create user
        const user = await User.create({
            name,
            email,
            password     
        });

        sendTokenResponse(user, 201, res); // Changed to 201 for resource creation
    } catch (err) {
        // Check for the specific MongoDB duplicate key error
        if (err.code === 11000) {
            const message = 'That email is already registered';
            return res.status(400).json({ success: false, error: message });
        }
        
        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: message });
        }

        // For other errors
        console.error(err); // Log the full error for debugging
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// ... also update the login function's error handling for consistency
exports.signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// You can also slightly improve the sendTokenResponse function
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ success: true, token });
};
 