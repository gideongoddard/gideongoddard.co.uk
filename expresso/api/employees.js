const express = require('express');
const sqlite3 = require('sqlite3');
const timesheetsRouter = require('./timesheets');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const employeesRouter = express.Router();

// Params
employeesRouter.param('employeeId', (req, res, next, employeeId) => {
    const sql = `SELECT * FROM Employee WHERE id = $employeeId`;
    const values = {$employeeId: employeeId};

    db.get(sql, values, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.employee = row;
            next();
        } else {
            res.sendStatus(404);
        }
    })
})

// Router mounting
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

// /api/employees
employeesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Employee WHERE is_current_employee = 1`, (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({employees: rows})
        }
    })
})

employeesRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const sql = `INSERT INTO Employee (name, position, wage)
    VALUES ($name, $position, $wage)`;
    const values = {
        $name: name,
        $position: position,
        $wage: wage
    };

    if (!name || !position || !wage) {
        return res.sendStatus(400);
    }

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee where id = ${this.lastID}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({employee: row});
                }
            });
        }
    })
})

// /api/employees/:employeeId
employeesRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({employee: req.employee});
})

employeesRouter.put('/:employeeId', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentEmployee = req.body.employee.is_current_employee === 0 ? 0 : 1;
    const sql = `UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE id = $employeeId`;
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee,
        $employeeId: req.params.employeeId
    };

    if (!name || !position || !wage) {
        return res.sendStatus(400);
    }

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({employee: row});
                }
            })
        }
    })
})

employeesRouter.delete('/:employeeId', (req, res, next) => {
    const sql = `UPDATE Employee SET is_current_employee = 0 WHERE id = $employeeId`;
    const values = {$employeeId: req.params.employeeId};

    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({employee: row});
                }
            });
        }
    })
})

module.exports = employeesRouter;