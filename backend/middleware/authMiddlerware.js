const jwt = require('jsonwebtoken');
const response = require('../utils/responseHandler');
const { request } = require('express');



const authMiddleware = (req, res, next) => {
    const authToken = req.cookies?.auth_token;

    if(!authToken){
        return response(res, 401, 'authorization token missing. please provide token');
    }

    try{
        const decode = jwt.verify(authToken, process.env.JWT_SECRET)
        req.user = decode;
        next();
    }catch (error) {
        console.error(error);
        return response(res, 401, 'Invalid or expired token');
    }
}

module.exports = authMiddleware;