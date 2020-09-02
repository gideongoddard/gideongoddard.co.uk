const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuItemsRouter = express.Router({mergeParams: true});

// Params
menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    const sql = `SELECT * FROM MenuItem WHERE id = $menuItemId`;
    const values = {$menuItemId: menuItemId};

    db.get(sql, values, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.menuItem = row;
            next();
        } else {
            res.sendStatus(404);
        }
    })
})

// /api/menus/:menuId/menu-items
menuItemsRouter.get('/', (req, res, next) => {
    const sql = `SELECT * FROM MenuItem WHERE menu_id = $menuId`;
    const values = {$menuId: req.params.menuId};
    
    db.all(sql, values, (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({menuItems: rows});
        }
    })
})

menuItemsRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const sql = `INSERT INTO MenuItem (name, description, inventory, price, menu_id)
    VALUES ($name, $description, $inventory, $price, $menuId)`;
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: req.params.menuId
    }

    if (!name || !inventory || !price) {
        return res.sendStatus(400);
    }

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({menuItem: row});
                }
            })
        }
    })
})

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const sql = `UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE id = $menuItemId`;
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuItemId: req.params.menuItemId
    };

    if (!name || !inventory || !price) {
        return res.sendStatus(400);
    }

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({menuItem: row});
                }
            })
        }
    })
})

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    const sql = `DELETE FROM MenuItem WHERE id = $menuItemId`;
    const values = {$menuItemId: req.params.menuItemId};

    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    })
})

module.exports = menuItemsRouter;