const expressJwt = require('express-jwt');
const config = require('config');
const doctorService = require('../doctors/doctor.service');
const pathToRegexp = require('path-to-regexp');

module.exports = jwt;

function jwt() {
    const secret = config.secret;
    return expressJwt({ secret, isRevoked ,requestProperty: 'auth' }).unless({
        path: [
            // public routes that don't require authentication
            '/api/doctors/login',
            '/api/doctors/register',
            { url: '/api/doctors', methods: ['GET']  },
            {url: pathToRegexp('/api/doctors/:id'), methods: ['GET']},         
            {url: pathToRegexp('/api/doctors/:id/avail/:day'), methods: ['GET']}, 
        ]
    });
}

async function isRevoked(req, payload, done) {
    const doctor = await doctorService.getById(payload.sub);

    // revoke token if doctor no longer exists
    if (!doctor) {
        return done(null, true);
    }

    done();
};
