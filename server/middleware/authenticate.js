const jwt = require('jsonwebtoken');
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("--- AUTHENTICATE MIDDLEWARE ---");
    console.log("URL:", req.originalUrl);
    console.log("Authorization Header:", authHeader);
    
    if (!authHeader) {
        console.log("Result: 401 - Token not provided");
        return res.status(401).json({ message: 'Token not provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);
        console.log("Result: 200 - Token verified. User role:", decoded.role);
        req.user = decoded;
        next();
    } catch (err) {
        console.log("Result: 401 - Invalid token. Error:", err.message);
        return res.status(401).json({ message: 'Invalid token', error: err.message });
    }
};

module.exports = authenticate;

