const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {

        const authHeader = req.headers.authorization || '';

        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Invalid token format'
            });
        }


        const payload = jwt.verify(token, process.env.JWT_SECRET);


        req.user = {
            userId: payload.userId,
            orgId: payload.orgId
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                message: 'Please login again'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'Authentication failed'
            });
        }

        return res.status(500).json({
            error: 'Authentication error',
            message: 'An error occurred during authentication'
        });
    }
};

module.exports = authMiddleware;
