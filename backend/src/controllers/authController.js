const jwt = require('jsonwebtoken');
const { Organisation, User, Log } = require('../models');

const register = async (req, res, next) => {
    try {
        const { orgName, email, password } = req.body;

        if (!orgName || !email || !password) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Organisation name, email, and password are required'
            });
        }


        if (password.length < 6) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Password must be at least 6 characters long'
            });
        }


        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                error: 'Registration failed',
                message: 'A user with this email already exists'
            });
        }


        const password_hash = await User.hashPassword(password);


        const result = await Organisation.sequelize.transaction(async (t) => {

            const organisation = await Organisation.create(
                { name: orgName },
                { transaction: t }
            );

            const user = await User.create(
                {
                    email,
                    password_hash,
                    organisation_id: organisation.id
                },
                { transaction: t }
            );

            return { organisation, user };
        });

        const token = jwt.sign(
            {
                userId: result.user.id,
                orgId: result.organisation.id
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(201).json({
            message: 'Organisation registered successfully',
            token,
            user: {
                id: result.user.id,
                email: result.user.email
            },
            organisation: {
                id: result.organisation.id,
                name: result.organisation.name
            }
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({
            where: { email },
            include: [{
                model: Organisation,
                as: 'organisation'
            }]
        });

        if (!user) {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await user.verifyPassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                orgId: user.organisation_id
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        await Log.create({
            organisation_id: user.organisation_id,
            user_id: user.id,
            action: 'user_login',
            meta: {
                email: user.email
            }
        });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email
            },
            organisation: {
                id: user.organisation.id,
                name: user.organisation.name
            }
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        await Log.create({
            organisation_id: req.user.orgId,
            user_id: req.user.userId,
            action: 'user_logout',
            meta: {}
        });

        res.json({
            message: 'Logout successful'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    logout
};
