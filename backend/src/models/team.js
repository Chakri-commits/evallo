const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Team = sequelize.define('Team', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    organisation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'organisations',
            key: 'id'
        }
    }
}, {
    tableName: 'teams',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Team;
