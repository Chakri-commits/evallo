const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const EmployeeTeam = sequelize.define('EmployeeTeam', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'employees',
            key: 'id'
        }
    },
    team_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'teams',
            key: 'id'
        }
    },
    assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'employee_teams',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['employee_id', 'team_id']
        }
    ]
});

module.exports = EmployeeTeam;
