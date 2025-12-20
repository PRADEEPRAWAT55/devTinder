const validator = require('validator');

const validateSignIn = (req) => {   
    const { emailId, password } = req.body;
    if (!emailId || !password) {
        throw new Error("Email and Password are required");
    }
    if (!validator.isEmail(emailId)) {
        throw new Error("Email is Not Valid");
    }  
}

module.exports = {
    validateSignIn
};