const { Log, User } = require('../models');
const { Op } = require('sequelize');


const getLogs = async (req, res, next) => {
    try {
        const {
            action,
            user_id,
            start_date,
            end_date,
            limit = 100,
            offset = 0
        } = req.query;


        const where = {
            organisation_id: req.user.orgId
        };


        if (action) {
            where.action = action;
        }


        if (user_id) {
            where.user_id = parseInt(user_id);
        }


        if (start_date || end_date) {
            where.timestamp = {};
            if (start_date) {
                where.timestamp[Op.gte] = new Date(start_date);
            }
            if (end_date) {
                where.timestamp[Op.lte] = new Date(end_date);
            }
        }


        const logs = await Log.findAll({
            where,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'email']
            }],
            order: [['timestamp', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });


        const total = await Log.count({ where });

        res.json({
            total,
            count: logs.length,
            limit: parseInt(limit),
            offset: parseInt(offset),
            logs
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLogs
};
