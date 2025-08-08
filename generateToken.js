const jwt = require('jsonwebtoken');

const payload = { userId: 123, role: "admin" };
const secret = "your_secret_key";
const options = { expiresIn: "1h" };

const token = jwt.sign(payload, secret, options);
console.log("Generated JWT Token:", token);