const validator = require('validator');

const validateSignUp = (req) => {
    const { firstName, emailId, password, age } = req.body;
    if(firstName.length <4 || firstName.length >50){
        throw new Error("First Name must be between 4 and 50 characters");
    }
    if (!validator.isEmail(emailId)) {
        throw new Error("Email is Not Valid");
    }
   
    if (!validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })) {
        throw new Error("Password is not strong enough");
    }
    if (age && (typeof age !== 'number' || age < 0 || age > 120)) {
        throw new Error("Age must be a valid number between 0 and 120");
    }   

    
}

module.exports = {
    validateSignUp
};