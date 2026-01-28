const jwt = require('jsonwebtoken');
const User = require('../model/user').User;

const authMiddleware = (req, res, next) => {
    // Try to get token from cookies first, then from Authorization header
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async(err, decoded) => {
        if (err) {
            console.error('Token verification error:', err.message);
            return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
        }
        
        req.decodedObject = decoded;
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        
        req.user = user;
        next();
    });
};

module.exports = {
    authMiddleware
}; 