require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require("../src/config/database");
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');
const { authMiddleware } = require('./middleware/auth');
const paymentRouter = require('./routes/payment');
const chatRouter = require('./routes/chat');
const http = require('http');
const initializeSocket = require('./utils/socket/socket');

require('./utils/emailCron');


const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/request', authMiddleware, requestRouter);
app.use('/api/profile', authMiddleware, profileRouter);
app.use('/api/user', authMiddleware, userRouter);
app.use('/api/payment', authMiddleware, paymentRouter);
app.use('/api/chat', authMiddleware, chatRouter);


const httpServer = http.createServer(app);
initializeSocket(httpServer);

connectDB().then(() => {
  console.log('Database connected successfully');
  httpServer.listen(process.env.PORT, () => {
    console.log(`Server is running at http://localhost:${process.env.PORT}`);
  });
}
).catch(err => console.log(err));


module.exports = app;