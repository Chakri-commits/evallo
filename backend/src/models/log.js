const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Log = sequelize.define('Log', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    organisation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'organisations',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Type of action performed (e.g., employee_created, team_updated, etc.)'
    },
    meta: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional metadata about the action (employee_id, team_id, changed fields, etc.)'
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'logs',
    timestamps: false,
    indexes: [
        {
            fields: ['organisation_id', 'timestamp']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['action']
        }
    ]
});

module.exports = Log;
