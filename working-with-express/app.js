const express = require('express');

const app = express();

app.use((req, res, next) => {
    console.log('This middleware always runs');
    next();
})

app.use('/add-product', (req, res, next) => {
    console.log('In the another middleware');
    res.send('<h1>Add product</h1>');
})

app.use('/', (req, res, next) => {
    console.log('In the middleware');
    res.send('<h1>Hello from Express!</h1>')
})

app.listen(3000);