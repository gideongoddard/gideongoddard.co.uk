const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const timesheetsRouter = express.Router({mergeParams: true});

// Params
timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
    const sql = `SELECT * FROM Timesheet WHERE id = $timesheetId`;
    const values = {$timesheetId: timesheetId};

    db.get(sql, values, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.timesheet = row;
            next();
        } else {
            res.sendStatus(404);
        }
    })
})

// /api/employees/:employeeId/timesheets
timesheetsRouter.get('/', (req, res, next) => {
    const sql = `SELECT * FROM Timesheet WHERE employee_id = $employeeId`;
    const values = {$employeeId: req.params.employeeId};

    db.all(sql, values, (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({timesheets: rows});
        }
    })
})

timesheetsRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.params.employeeId;
    const sql = `INSERT INTO Timesheet (hours, rate, date, employee_id)
    VALUES ($hours, $rate, $date, $employeeId)`;
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: employeeId
    };

    if (!hours || !rate || !date) {
        return res.sendStatus(400);
    }

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({timesheet: row});
                }
            })
        }
    })
})

// /api/employees/:employeeId/timesheets/:timesheetId
timesheetsRouter.put('/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const timesheetId = req.params.timesheetId;
    const sql = `UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date WHERE id = $timesheetId`;
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $timesheetId: timesheetId
    };

    if (!hours || !rate || !date) {
        return res.sendStatus(400);
    }

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({timesheet: row});
                }
            })
        }
    })
})

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    const sql = `DELETE FROM Timesheet WHERE id = $timesheetId`;
    const values = {$timesheetId: req.params.timesheetId};

    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    })
})

module.exports = timesheetsRouter;