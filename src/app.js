require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require("../src/config/database");
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');
const { authMiddleware } = require('./middleware/auth');
const paymentRouter = require('./routes/payment');

require('./utils/emailCron');


const app = express();
const port = 7777;

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/request', authMiddleware, requestRouter);
app.use('/api/profile', authMiddleware, profileRouter);
app.use('/api/user', authMiddleware, userRouter);
app.use('/api/payment', authMiddleware, paymentRouter);



connectDB().then(() => {
  console.log('Database connected successfully');
  app.listen(process.env.PORT, () => {
    console.log(`Server is running at http://localhost:${process.env.PORT}`);
  });
}
).catch(err => console.log(err));


module.exports = app;