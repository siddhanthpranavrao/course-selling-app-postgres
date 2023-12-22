require('dotenv').config();
const express = require('express');
const app = express();
const adminRouter = require('./routes/admin');
const userRouter = require('./routes/user');
const PORT = process.env.PORT || 3000;
app.use(express.json());


app.use('/admins', adminRouter);
app.use('/users', userRouter);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});