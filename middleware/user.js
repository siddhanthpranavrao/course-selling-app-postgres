const jwt = require('jsonwebtoken');
const pool = require('../db/postgres');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

async function userMiddleware(req, res, next) {
    // Verify if the the JWT is valid
    try {
        const { authorization } = req.headers;

        if (!authorization) {
            return res.status(401).json({ message: "Auth Token Missing!"});
        }
        
        const { user_id, username } = jwt.verify(authorization, JWT_SECRET);

        const { rows: fetchedRow, rowCount: fetchedRowCount } = await pool.query(`SELECT * FROM USERS WHERE USER_ID = ${user_id} AND USERNAME = '${username}'`);

        if (fetchedRowCount === 0) {
            res.status(404).json({ message: 'INVALID Auth Token!'});
        }

        req.user_id = user_id;
        req.username = username;

        next();

    } catch (error) {
        res.status(500).send({ message: error.message });
    }

}
module.exports = userMiddleware;