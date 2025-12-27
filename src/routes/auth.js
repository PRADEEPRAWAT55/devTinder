const express = require('express');
const bcrypt = require('bcrypt');
const { validateSignUp } = require('../utils/signupValidation');
const { validateSignIn } = require('../utils/signInValidation');
const { loginLimiter } = require('../middleware/ratelimiter');
const User = require('../model/user').User;

const authRouter = express.Router();

authRouter.post('/signup', loginLimiter, async (req, res) => {
  try {
    validateSignUp(req);
    const passwordHash = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      emailId: req.body.emailId,
      password: passwordHash,
      age: req.body.age,
      gender: req.body.gender,
    });

    const result = await user.save()
    res.status(201).json({ message: 'User created successfully', userId: result._id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

authRouter.post('/signin', async (req, res) => {
  try {
    validateSignIn(req);
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({ message: 'check your email or password again' });
    }
    const isPasswordMatch = await user.validatePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'check your email or password again' });
    }
    const token = await user.getJWT();
    res.cookie('token', token, { expires: new Date(Date.now() + 8 * 3600000), httpOnly: true });
    res.status(200).json({ message: 'Sign in successful', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

authRouter.post('/signout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Sign out successful' });
});


module.exports = authRouter;
