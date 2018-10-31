const rabbitmq = require('_helpers/rabbitmq');
const patientService = require('./patient.service');
const config = require('config');
const jwt = require('jsonwebtoken');

rabbitmq.getFromMQ('front', 'patient.create', msg => {
    let patient = JSON.parse(msg.content.toString());
    console.log("[patient] %s",'patient.create');
    patientService.create(patient)
    .then(() => {
        rabbitmq.sendToMQ('patient.created', patient);
    })
    .catch(err => {
        rabbitmq.sendToMQ('patient.create.error', {err: err});
        throw err;
    });
});

rabbitmq.getFromMQ('front', 'patient.authenticate', msg => {
    let patient = JSON.parse(msg.content.toString());
    console.log("[patient] %s",'patient.authenticate');
    patientService.authenticate(patient)
    .then(patient => {
        if (patient) {
            rabbitmq.sendToMQ('patient.authenticated', patient);            
        } else {
            rabbitmq.sendToMQ('patient.authenticate.error', {err: 'Check your credentials!'});            
        }
    })
    .catch(err => {
        rabbitmq.sendToMQ('patient.authenticate.error', {err: err});
        throw err;
    });
});

rabbitmq.getFromMQ('front', 'patient.get.all', msg => {
    console.log("[patient] %s",'patient.get.all');
    patientService.getAll()
    .then(patients => {
        if (patients) {
            rabbitmq.sendToMQ('patient.got.all', patients);            
        } else {
            rabbitmq.sendToMQ('patient.get.all.error', {err: 'something went wrong!'});            
        }
    })
    .catch(err => {
        rabbitmq.sendToMQ('patient.get.all.error', {err: err});
        throw err;
    });
});

rabbitmq.getFromMQ('front', 'patient.get.by.id', msg => {
    let params = JSON.parse(msg.content.toString());
    console.log("[patient] %s",'patient.get.by.id');
    patientService.getById(params.id)
    .then(patient => {
        if (patient) {
            rabbitmq.sendToMQ('patient.got.by.id', patient);            
        } else {
            rabbitmq.sendToMQ('patient.get.by.id.error', {err: 'something went wrong!'});            
        }
    })
    .catch(err => {
        rabbitmq.sendToMQ('patient.get.by.id.error', {err: err});
        throw err;
    });
});

rabbitmq.getFromMQ('front', 'patient.update', msg => {
    let params = JSON.parse(msg.content.toString());
    console.log("[patient] %s",'patient.update');
    let decoded = jwt.verify(params.token, config.secret);

    patientService.update(decoded.sub, params.patient)
    .then(() => {
        patientService.getById(decoded.sub)
            .then(patient => {
                if (!patient) {
                    return rabbitmq.sendToMQ('patient.update.error', {err: 'Not Found!'});               
                }
                rabbitmq.sendToMQ('patient.updated', patient);
            })
            .catch(err => {
                rabbitmq.sendToMQ('patient.update.error', {err: err});
                throw err;
            });
    })
    .catch(err => {
        rabbitmq.sendToMQ('patient.update.error', {err: err});
        throw err;
    });
});

rabbitmq.getFromMQ('front', 'patient.delete', msg => {
    let params = JSON.parse(msg.content.toString());
    console.log("[patient] %s",'patient.delete');
    let decoded = jwt.verify(params.token, config.secret);
    patientService.delete(decoded.sub)
        .then(() => {
            rabbitmq.sendToMQ('patient.deleted', {});
        })
        .catch(err => {
            rabbitmq.sendToMQ('patient.delete.error', {err: err});
            throw err;
        });
});

rabbitmq.getFromMQ('front', 'patient.get.avail.day', async msg => {
    let params = JSON.parse(msg.content.toString());
    console.log("[patient] %s",'patient.get.avail.day');
    patientService.getByIdAndAvail(params.id, params.day)
    .then(patient => {
        if (patient) {
            rabbitmq.sendToMQ('patient.got.avail.day', patient);            
        } else {
            rabbitmq.sendToMQ('patient.get.avail.day.error', {err: 'something went wrong!'});            
        }
    })
    .catch(err => {
        rabbitmq.sendToMQ('patient.get.avail.day.error', {err: err});
        throw err;
    });
});