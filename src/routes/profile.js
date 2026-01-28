const express = require('express');
const User = require('../model/user').User;


profileRouter = express.Router();

profileRouter.get('/', async (req, res) => {
    try {
        const userId = req.decodedObject.userId;
        const userProfile = await User.findById(userId).select('-password');
        if (!userProfile) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ profile: userProfile });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});


profileRouter.patch('/update', async (req, res) => {
    try {
        const userId = req.decodedObject.userId;
        const updateData = req.body;    
        const ENABLED_FIELDS = ['firstName', 'lastName', 'age', 'gender', 'about', 'skills', 'photoUrl'];
        const set = new Set();
        const fields = Object.keys(updateData);
        for (let field of fields) {
            if (!ENABLED_FIELDS.includes(field)) {
                set.add(field);
            }
        }
        if (set.size > 0) {
            return res.status(400).json({ message: `Invalid fields in update: ${Array.from(set).join(', ')}` });
        }
        const updatedProfile = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password -emailId');
        if (!updatedProfile) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'Profile updated successfully', profile: updatedProfile });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});


profileRouter.patch('/change-password', async (req, res) => {
    try {
        const userId = req.decodedObject.userId;
        const { oldPassword, newPassword } = req.body;

        const userRecord = await User.findById(userId);
        if (!userRecord) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await userRecord.validatePassword(oldPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }
        const hashedNewPassword = await userRecord.createPasswordHash(newPassword);
        userRecord.password = hashedNewPassword;

        await userRecord.save();
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = profileRouter;    