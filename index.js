// dependencies / libraries
const express = require('express');
const { configServer } = require('./src/configs/server.config');

// routers

// config
const config  = require('./src/configs/general.config');

const port = config.port || 3000;
const app = express();
configServer(app);


// endpoint
app.get('/', (req, res) => {
    res.send('Hello world')
});

// logger
app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
});