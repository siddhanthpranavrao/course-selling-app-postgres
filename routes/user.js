const express = require('express');
const router = express.Router();
const pool = require('../db/postgres');
const jwt = require('jsonwebtoken');
const userMiddleware = require('../middleware/user');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
router.use(express.json());

router.post('/signup', async (req, res) => {

    try {
        const { username, password } = req.body;

        const { rowCount } = await pool.query(`SELECT * FROM USERS WHERE USERNAME = '${username}'`);

        if (rowCount >= 1) {
            return res.status(404).json({ message: 'User with this username already exists!' });
        }

        const { rowCount: InsertedRowCount } = await pool.query(`INSERT INTO USERS (username, password) VALUES ('${username}', '${password}')`);

        if (InsertedRowCount == 0) {
            throw new Error('Error while inserting');
        }

        return res.status(201).json({ message: 'User created successfully!' });


    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

router.post('/signin', async (req, res) => {
    try {
        const { username, password } = req.body;

        const { rows: fetchedRow, rowCount: fetchedRowCount } = await pool.query(`SELECT * FROM USERS WHERE username = '${username}'`);

        if (fetchedRowCount === 0) {
            res.status(401).json({ message: 'User with that username NOT FOUND!' });
        }

        const [{ user_id }] = fetchedRow;

        const token = jwt.sign({ user_id, username }, JWT_SECRET);

        res.status(201).json({ token });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

router.post('/courses/:course_id', userMiddleware, async (req, res) => {
    try {
        const { course_id }= req.params;

        const { user_id } = req;

        // Check if course exists
        const { rowCount } = await pool.query(`SELECT * FROM COURSES WHERE COURSE_ID = ${course_id}`);

        if (rowCount === 0) {
            throw new Error(`COURSE WITH COURSE ID: ${course_id} NOT FOUND!`);
        }

        const { rowCount: insertedRowCount } = await pool.query(`INSERT INTO USER_COURSES (user_id, course_id) VALUES (${user_id}, ${course_id})`);
        
        if (insertedRowCount === 0) {
            throw new Error('ERROR while INSERTING ROW INTO DB!');
        }

        res.status(200).json({ message: 'Course purchased successfully' });
        
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


router.get('/courses', userMiddleware, async (req, res) => {
    try {

        const { user_id, username } = req;

        const { rows: fetchedRows, rowCount: fetchedRowCount } = await pool.query(`SELECT * FROM USER_COURSES WHERE USER_ID = ${user_id}`);

        if (fetchedRowCount === 0) {
            throw new Error('ERROR while FETCHING DATA FROM DB!');
        }

        const userCourseIds = fetchedRows.map(({ course_id }) => course_id);

        const { rows: fetchedCourses, rowCount: fetchedCoursesRowCount } = await pool.query(`SELECT * FROM COURSES WHERE COURSE_ID IN (${userCourseIds.join(',')})`);

        res.status(200).json({ courses: fetchedCourses });
        
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;