const express = require('express');
const router = express.Router();
const pool = require('../db/postgres');
const jwt = require('jsonwebtoken');
const adminMiddleware = require('../middleware/admin');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
router.use(express.json());

router.post('/signup', async (req, res) => {

    try {
        const { username, password } = req.body;

        const { rowCount } = await pool.query(`SELECT * FROM ADMINS WHERE USERNAME = '${username}'`);

        if (rowCount >= 1) {
            return res.status(404).json({ message: 'Admin with this username already exists!' });
        }

        const { rowCount: InsertedRowCount } = await pool.query(`INSERT INTO ADMINS (username, password) VALUES ('${username}', '${password}')`);

        if (InsertedRowCount == 0) {
            throw new Error('Error while inserting');
        }

        return res.status(201).json({ message: 'Admin created successfully!' });


    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

router.post('/signin', async (req, res) => {
    try {
        const { username, password } = req.body;

        const { rows: fetchedRow, rowCount: fetchedRowCount } = await pool.query(`SELECT * FROM ADMINS WHERE username = '${username}'`);

        if (fetchedRowCount === 0) {
            res.status(401).json({ message: 'Admin with that username NOT FOUND!' });
        }
        console.log(fetchedRow);
        const [{ admin_id }] = fetchedRow;

        const token = jwt.sign({ admin_id, username }, JWT_SECRET);

        res.status(201).json({ token });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

router.post('/courses', adminMiddleware, async (req, res) => {
    try {
        const { title, description, price } = req.body;

        const { rowCount: insertedRowCount } = await pool.query(`INSERT INTO COURSES (title, description, price) VALUES ('${title}', '${description}', ${price})`);
        
        if (insertedRowCount === 0) {
            throw new Error('ERROR while INSERTING ROW INTO DB!');
        }

        const { rows: fetchedRows, rowCount: fetchedRowCount } = await pool.query(`SELECT * FROM COURSES WHERE title = '${title}'`);

        if (fetchedRowCount === 0) {
            throw new Error('ERROR while FETCHING DATA FROM DB!');
        }
        
        const [{ course_id }] = fetchedRows;

        res.status(200).json({ message: `Course created successfully`, course_id });
        
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


router.get('/courses', adminMiddleware, async (req, res) => {
    try {

        const { rows: fetchedRows, rowCount: fetchedRowCount } = await pool.query(`SELECT * FROM COURSES`);

        if (fetchedRowCount === 0) {
            throw new Error('ERROR while FETCHING DATA FROM DB!');
        }
        
        res.status(200).json({ courses: fetchedRows });
        
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;