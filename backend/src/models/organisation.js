const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Organisation = sequelize.define('Organisation', {
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
    }
}, {
    tableName: 'organisations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Organisation;
