const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const app = require('./app');

dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception, shutting down server...');
    console.log(err.name, err.message);

    process.exit(1);
});

const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => console.log('DB Connection successful!'))
    .catch(console.log);

mongoose.set('bufferCommands', false);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection, shutting down server');
    console.log(err.name, err.message);

    server.close(() => {
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');

    server.close(() => {
        console.log('Process terminated');
    });
});
