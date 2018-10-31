const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const Patient = db.Patient;
const axios = require('axios');
const _ = require('underscore');

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    getByIdAndAvail
};

async function authenticate({ username, password }) {
    const patient = await Patient.findOne({ username });
    if (patient && bcrypt.compareSync(password, patient.hash)) {
        const token = jwt.sign({ sub: patient.id }, config.secret);
        return {
            id: patient.id,
            jwt_token: token
        };
    }
}

async function getAll() {
    return await Patient.find().select('-hash');
}

async function getById(id) {
    return await Patient.findById(id).select('-hash');
}

async function create(patientParam) {
    // validate
    if (await Patient.findOne({ username: patientParam.username })) {
        throw 'Username "' + patientParam.username + '" is already taken';
    }

    const patient = new Patient(patientParam);

    // hash password
    if (patientParam.password) {
        patient.hash = bcrypt.hashSync(patientParam.password, 10);
    }

    // save patient
    await patient.save();
}

async function update(id, patientParam) {
    const patient = await Patient.findById(id);

    // validate
    if (!patient) throw 'patient not found';
    if (patient.username !== patientParam.username && await Patient.findOne({ username: patientParam.username })) {
        throw 'Username "' + patientParam.username + '" is already taken';
    }

    // hash password if it was entered
    if (patientParam.password) {
        patientParam.hash = bcrypt.hashSync(patientParam.password, 10);
    }

    // copy patientParam properties to patient
    Object.assign(patient, patientParam);

    await patient.save();
}

async function _delete(id) {
    await Patient.findOneAndDelete(id);
}
