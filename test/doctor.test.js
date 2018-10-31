const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();
const faker = require('faker');
const doctorService = require('doctors/doctor.service');
const db = require('_helpers/db');
const Doctor = db.Doctor;

const expect = chai.expect;

chai.use(chaiHttp);

describe('Doctors', () => {
    Doctor.collection.drop();
    beforeEach(done => {
        let doctor = {
            name: faker.name.findName(), 
            username: faker.internet.userName(), 
            password: 'password',
            major: faker.name.jobTitle(),
            appointment_time: faker.random.number(),
            work: [
                {day: faker.random.number(), from: faker.random.number(), to: faker.random.number()}
            ]
        };
        
        doctorService.create(doctor)
        .then(() => {
            done();  
        })
        .catch(err => {
            throw err;
        });
    });
    
    afterEach(done => {
        try {
            Doctor.collection.deleteMany();
            done();
        } catch (err) {
            throw err;
         }
    });

    it('should list ALL doctors on /api/doctors GET', done => {
        chai.request(server)
            .get('/api/doctors')
            .then(res => {
                res.should.have.status(200);
                done();
            }).catch(err => {
                throw err;
            });
    });
    
    it('should add a SINGLE doctor on /api/doctors/register POST', done => {
        let doctor = {
            name: faker.name.findName(), 
            username: faker.internet.userName(), 
            password: faker.internet.password(),
            major: faker.name.jobTitle(),
            appointment_time: faker.random.number(),
            work: [
                {day: faker.random.number(), from: faker.random.number(), to: faker.random.number()}
            ]
        };
        chai.request(server)
            .post('/api/doctors/register')
            .send(doctor)
            .then(res => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('jwt_token');
                res.body.should.have.property('id');
                done();
            }).catch(err => {
                throw err;
            });
    });

    it('should list a SINGLE doctor on /api/doctors/<id> GET', done => {
        chai.request(server)
            .get(`/api/doctors`)
            .then(res => {
                chai.request(server)
                    .get(`/api/doctors/${res.body[0].id}`)
                    .then(res => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('object');
                        res.body.should.have.property('id');
                        res.body.should.have.property('name');
                        done();
                    }).catch(err => {
                        throw err;
                    });
            }).catch(err => {
                throw err;
            });
    });

    it('should update a SINGLE doctor on /api/doctors PUT', done => {
        chai.request(server)
            .get(`/api/doctors`)
            .then(res => {
                let username = res.body[0].username;
                doctorService.authenticate({username, password: 'password'})
                .then(doctor => {
                    let name = faker.name.findName();
                    chai.request(server)
                        .put(`/api/doctors`)
                        .set('Authorization', `Bearer ${doctor.jwt_token}`)
                        .set('Content-Type', 'application/json')
                        .set('Accept', 'application/json')
                        .send({'name': name})
                        .then(res => {
                            res.should.have.status(200);
                            res.should.be.json;
                            res.body.should.be.a('object');
                            res.body.should.have.property('id');
                            res.body.should.have.property('name');
                            done();
                        }).catch(err => {
                            throw err;
                        });
                })
                .catch(err => {
                    console.log(err);
                    done();
                });
            }).catch(err => {
                throw err;
            });
    });

    it('should delete a SINGLE doctor on /api/doctors DELETE', done => {
        chai.request(server)
            .get(`/api/doctors`)
            .then(res => {
                let username = res.body[0].username;
                doctorService.authenticate({username, password: 'password'})
                .then(doctor => {
                    chai.request(server)
                        .delete(`/api/doctors`)
                        .set('Authorization', `Bearer ${doctor.jwt_token}`)
                        .then(res => {
                            res.should.have.status(200);
                            res.should.be.json;
                            res.body.should.be.a('object');
                            done();
                        }).catch(err => {
                            throw err;
                        });
                })
                .catch(err => {
                    console.log(err);
                    done();
                });
            }).catch(err => {
                throw err;
            });
    });
});