const { Employee, Team, Log } = require('../models');

const listEmployees = async (req, res, next) => {
    try {
        const employees = await Employee.findAll({
            where: { organisation_id: req.user.orgId },
            include: [{
                model: Team,
                as: 'teams',
                attributes: ['id', 'name'],
                through: { attributes: [] }
            }],
            order: [['created_at', 'DESC']]
        });

        res.json({
            count: employees.length,
            employees
        });
    } catch (error) {
        next(error);
    }
};

const getEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findOne({
            where: {
                id,
                organisation_id: req.user.orgId
            },
            include: [{
                model: Team,
                as: 'teams',
                attributes: ['id', 'name', 'description'],
                through: { attributes: ['assigned_at'] }
            }]
        });

        if (!employee) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Employee not found'
            });
        }

        res.json(employee);
    } catch (error) {
        next(error);
    }
};

const createEmployee = async (req, res, next) => {
    try {
        const { first_name, last_name, email } = req.body;
        if (!first_name || !last_name || !email) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'First name, last name, and email are required'
            });
        }

        const employee = await Employee.create({
            first_name,
            last_name,
            email,
            organisation_id: req.user.orgId
        });

        await Log.create({
            organisation_id: req.user.orgId,
            user_id: req.user.userId,
            action: 'employee_created',
            meta: {
                employee_id: employee.id,
                first_name: employee.first_name,
                last_name: employee.last_name,
                email: employee.email
            }
        });

        res.status(201).json({
            message: 'Employee created successfully',
            employee
        });
    } catch (error) {
        next(error);
    }
};

const updateEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email } = req.body;

        const employee = await Employee.findOne({
            where: {
                id,
                organisation_id: req.user.orgId
            }
        });

        if (!employee) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Employee not found'
            });
        }


        const changes = {};
        if (first_name && first_name !== employee.first_name) {
            changes.first_name = { from: employee.first_name, to: first_name };
            employee.first_name = first_name;
        }
        if (last_name && last_name !== employee.last_name) {
            changes.last_name = { from: employee.last_name, to: last_name };
            employee.last_name = last_name;
        }
        if (email && email !== employee.email) {
            changes.email = { from: employee.email, to: email };
            employee.email = email;
        }

        await employee.save();


        await Log.create({
            organisation_id: req.user.orgId,
            user_id: req.user.userId,
            action: 'employee_updated',
            meta: {
                employee_id: employee.id,
                changes
            }
        });

        res.json({
            message: 'Employee updated successfully',
            employee
        });
    } catch (error) {
        next(error);
    }
};


const deleteEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;


        const employee = await Employee.findOne({
            where: {
                id,
                organisation_id: req.user.orgId
            }
        });

        if (!employee) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Employee not found'
            });
        }


        const employeeInfo = {
            id: employee.id,
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email
        };


        await employee.destroy();


        await Log.create({
            organisation_id: req.user.orgId,
            user_id: req.user.userId,
            action: 'employee_deleted',
            meta: employeeInfo
        });

        res.json({
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee
};
