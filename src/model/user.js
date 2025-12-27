const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is Not Valid")
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            validator.isStrongPassword(value, {
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
        }
    },
    age: {
        type: Number,
    },
    gender: {
        type: String,
        validate(value) {
            if (!["male", "female", "other"].includes(value)) {
                throw new Error("Gender is Not Valid")
            }
        }
    },
    photoUrl: {
        type: String,
        default: "https://www.pngall.com/wp-content/uploads/5/Profile-PNG-Image.png",
        validator(value) {
            if (!validator.isURL(value)) {
                throw new Error("Photo URL is Not Valid")
            }
        }
    },
    about: {
        type: String,
        default: "this is default About"
    },
    skills: {
        type: [String]
    }

}, { timestamps: true });

userSchema.methods.getJWT = function () {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: this._id, emailId: this.emailId }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return token;
}       

userSchema.methods.validatePassword = async function (password) {
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.createPasswordHash = async function (password) {
    const bcrypt = require('bcrypt');
    return await bcrypt.hash(password, 10);
}

module.exports = {
    User: mongoose.model('User', userSchema),
}