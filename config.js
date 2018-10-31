module.exports = {
    'secret': process.env.SECRET || 'SECRET TOKEN FOR JWT',
    'connectionString': process.env.DATABASE_URL || 'mongodb://localhost:27017/doctors'
};