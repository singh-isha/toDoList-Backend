const jwt = require('jsonwebtoken');

const payload = { userId: 123, role: "admin" };
const secret = "your_secret_key";
const options = { expiresIn: "1h" };

const token = jwt.sign(payload, secret, options);
console.log("Generated JWT Token:", token);





 
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OWFmYzU1ZDEyNTM3NDVlZTlhYTEwZiIsImlhdCI6MTc1NDk4NzYwNiwiZXhwIjoxNzU3NTc5NjA2fQ.7X1IdNC-x_-QX56WTQJTEuyFVFuEtRqUixn6IqfkOsU