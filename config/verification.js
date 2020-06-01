const { generateVerificationHash, verifyHash } = require('dbless-email-verification');

const keys = require('./keys.js')

const generateHash = (plainString) => {
    const hash = generateVerificationHash(plainString, keys.verificationSecret, 10);
    return hash;
};

const validateHash = (plainString, verificationHash) => {
    const isStringVerified = verifyHash(verificationHash, plainString, keys.verificationSecret);
    return isStringVerified;
};

exports.generateHash = generateHash;
exports.validateHash = validateHash;