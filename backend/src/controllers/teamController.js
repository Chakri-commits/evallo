const { Team, Employee, EmployeeTeam, Log } = require('../models');


const listTeams = async (req, res, next) => {
    try {
        const teams = await Team.findAll({
            where: { organisation_id: req.user.orgId },
            include: [{
                model: Employee,
                as: 'employees',
                attributes: ['id', 'first_name', 'last_name', 'email'],
                through: { attributes: ['assigned_at'] }
            }],
            order: [['created_at', 'DESC']]
        });


        const teamsWithCount = teams.map(team => ({
            ...team.toJSON(),
            employee_count: team.employees.length
        }));

        res.json({
            count: teams.length,
            teams: teamsWithCount
        });
    } catch (error) {
        next(error);
    }
};


const getTeam = async (req, res, next) => {
    try {
        const { id } = req.params;

        const team = await Team.findOne({
            where: {
                id,
                organisation_id: req.user.orgId
            },
            include: [{
                model: Employee,
                as: 'employees',
                attributes: ['id', 'first_name', 'last_name', 'email'],
                through: { attributes: ['assigned_at'] }
            }]
        });

        if (!team) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Team not found'
            });
        }

        res.json(team);
    } catch (error) {
        next(error);
    }
};

const createTeam = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Team name is required'
            });
        }


        const team = await Team.create({
            name,
            description: description || null,
            organisation_id: req.user.orgId
        });


        await Log.create({
            organisation_id: req.user.orgId,
            user_id: req.user.userId,
            action: 'team_created',
            meta: {
                team_id: team.id,
                name: team.name
            }
        });

        res.status(201).json({
            message: 'Team created successfully',
            team
        });
    } catch (error) {
        next(error);
    }
};


const updateTeam = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;


        const team = await Team.findOne({
            where: {
                id,
                organisation_id: req.user.orgId
            }
        });

        if (!team) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Team not found'
            });
        }


        const changes = {};
        if (name && name !== team.name) {
            changes.name = { from: team.name, to: name };
            team.name = name;
        }
        if (description !== undefined && description !== team.description) {
            changes.description = { from: team.description, to: description };
            team.description = description;
        }

        await team.save();


        await Log.create({
            organisation_id: req.user.orgId,
            user_id: req.user.userId,
            action: 'team_updated',
            meta: {
                team_id: team.id,
                changes
            }
        });

        res.json({
            message: 'Team updated successfully',
            team
        });
    } catch (error) {
        next(error);
    }
};


const deleteTeam = async (req, res, next) => {
    try {
        const { id } = req.params;


        const team = await Team.findOne({
            where: {
                id,
                organisation_id: req.user.orgId
            }
        });

        if (!team) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Team not found'
            });
        }


        const teamInfo = {
            id: team.id,
            name: team.name,
            description: team.description
        };


        await team.destroy();


        await Log.create({
            organisation_id: req.user.orgId,
            user_id: req.user.userId,
            action: 'team_deleted',
            meta: teamInfo
        });

        res.json({
            message: 'Team deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};


const assignEmployees = async (req, res, next) => {
    try {
        const { teamId } = req.params;
        const { employeeId, employeeIds } = req.body;


        const idsToAssign = employeeIds || (employeeId ? [employeeId] : []);

        if (!idsToAssign.length) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Either employeeId or employeeIds array is required'
            });
        }


        const team = await Team.findOne({
            where: {
                id: teamId,
                organisation_id: req.user.orgId
            }
        });

        if (!team) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Team not found'
            });
        }


        const employees = await Employee.findAll({
            where: {
                id: idsToAssign,
                organisation_id: req.user.orgId
            }
        });

        if (employees.length !== idsToAssign.length) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'One or more employees not found or do not belong to your organisation'
            });
        }


        const assignments = [];
        for (const employee of employees) {
            try {

                const assignment = await EmployeeTeam.create({
                    employee_id: employee.id,
                    team_id: team.id
                });
                assignments.push(assignment);


                await Log.create({
                    organisation_id: req.user.orgId,
                    user_id: req.user.userId,
                    action: 'employee_assigned_to_team',
                    meta: {
                        employee_id: employee.id,
                        employee_name: `${employee.first_name} ${employee.last_name}`,
                        team_id: team.id,
                        team_name: team.name
                    }
                });
            } catch (error) {

                if (error.name === 'SequelizeUniqueConstraintError') {
                    continue;
                }
                throw error;
            }
        }

        res.json({
            message: `${assignments.length} employee(s) assigned to team successfully`,
            assigned_count: assignments.length
        });
    } catch (error) {
        next(error);
    }
};


const unassignEmployee = async (req, res, next) => {
    try {
        const { teamId } = req.params;
        const { employeeId } = req.body;

        if (!employeeId) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'employeeId is required'
            });
        }


        const team = await Team.findOne({
            where: {
                id: teamId,
                organisation_id: req.user.orgId
            }
        });

        if (!team) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Team not found'
            });
        }


        const employee = await Employee.findOne({
            where: {
                id: employeeId,
                organisation_id: req.user.orgId
            }
        });

        if (!employee) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Employee not found'
            });
        }


        const deleted = await EmployeeTeam.destroy({
            where: {
                employee_id: employeeId,
                team_id: teamId
            }
        });

        if (deleted === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Employee is not assigned to this team'
            });
        }


        await Log.create({
            organisation_id: req.user.orgId,
            user_id: req.user.userId,
            action: 'employee_unassigned_from_team',
            meta: {
                employee_id: employee.id,
                employee_name: `${employee.first_name} ${employee.last_name}`,
                team_id: team.id,
                team_name: team.name
            }
        });

        res.json({
            message: 'Employee unassigned from team successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listTeams,
    getTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    assignEmployees,
    unassignEmployee
};
