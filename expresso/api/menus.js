const express = require('express');
const sqlite3 = require('sqlite3');
const menuItemsRouter = require('./menu-items');

const menusRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Params
menusRouter.param('menuId', (req, res, next, menuId) => {
    const sql = `SELECT * FROM Menu WHERE id = $menuId`;
    const values = {$menuId: menuId};

    db.get(sql, values, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.menu = row;
            next();
        } else {
            res.sendStatus(404);
        }
    })
})

// Router mounting
menusRouter.use('/:menuId/menu-items', menuItemsRouter);

// api/menus
menusRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Menu`, (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({menus: rows});
        }
    })
})

menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    const sql = `INSERT INTO Menu (title)
    VALUES ($title)`;
    const values = {$title: title};

    if (!title) {
        return res.sendStatus(400);
    }

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({menu: row});
                }
            })
        }
    })
})

// /api/menus/:menuId
menusRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});
})

menusRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;
    const sql = `UPDATE Menu SET title = $title WHERE id = $menuId`;
    const values = {
        $title: title,
        $menuId: req.params.menuId
    }

    if (!title) {
        return res.sendStatus(400);
    }

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({menu: row});
                }
            })
        }
    })
})

menusRouter.delete('/:menuId', (req, res, next) => {
    const sql = `DELETE FROM Menu WHERE id = $menuId`;
    const values = {$menuId: req.params.menuId};

    db.get(`SELECT * FROM MenuItem WHERE menu_id = $menuId`, values, (err, row) => {
        if (row) {
            return res.sendStatus(400);
        } else {
            db.run(sql, values, (err) => {
                if (err) {
                    next(err);
                } else {
                    res.sendStatus(204);
                }
            })
        }
    })
})

module.exports = menusRouter;