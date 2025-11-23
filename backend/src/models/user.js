const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
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
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

User.prototype.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
};
User.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
};

module.exports = User;
