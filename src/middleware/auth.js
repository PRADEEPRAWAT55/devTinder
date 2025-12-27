const jwt = require('jsonwebtoken');
const User = require('../model/user').User;

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async(err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        req.decodedObject = decoded;
        const user = await User.findById(decoded.userId).select('-password');
        console.log(user);
        req.user = user;
        next();
    });
};

module.exports = {
    authMiddleware
}; 