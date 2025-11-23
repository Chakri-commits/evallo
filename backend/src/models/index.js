const Organisation = require('./organisation');
const User = require('./user');
const Employee = require('./employee');
const Team = require('./team');
const EmployeeTeam = require('./employeeTeam');
const Log = require('./log');

Organisation.hasMany(User, {
    foreignKey: 'organisation_id',
    as: 'users'
});
User.belongsTo(Organisation, {
    foreignKey: 'organisation_id',
    as: 'organisation'
});

Organisation.hasMany(Employee, {
    foreignKey: 'organisation_id',
    as: 'employees'
});
Employee.belongsTo(Organisation, {
    foreignKey: 'organisation_id',
    as: 'organisation'
});

Organisation.hasMany(Team, {
    foreignKey: 'organisation_id',
    as: 'teams'
});
Team.belongsTo(Organisation, {
    foreignKey: 'organisation_id',
    as: 'organisation'
});

Employee.belongsToMany(Team, {
    through: EmployeeTeam,
    foreignKey: 'employee_id',
    otherKey: 'team_id',
    as: 'teams'
});
Team.belongsToMany(Employee, {
    through: EmployeeTeam,
    foreignKey: 'team_id',
    otherKey: 'employee_id',
    as: 'employees'
});

Organisation.hasMany(Log, {
    foreignKey: 'organisation_id',
    as: 'logs'
});
Log.belongsTo(Organisation, {
    foreignKey: 'organisation_id',
    as: 'organisation'
});

User.hasMany(Log, {
    foreignKey: 'user_id',
    as: 'logs'
});
Log.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

module.exports = {
    Organisation,
    User,
    Employee,
    Team,
    EmployeeTeam,
    Log
};
