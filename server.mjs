import express from 'express';
import * as cors from 'cors';

import * as http from 'http';
import * as fs from 'fs';

const host = '127.0.0.1';
const port = 8080;
const app = express();

//app.use(express.static('./public'));



app.get('/', function (req, res) {
    res.send('hi :)');
});

app.get('/art', function (req, res) {
    res.json([
        { id: 1, name: 'Heart / Knot' },
        { id: 2, name: 'Random' }
    ])
});

app.get('/art/:id', function (req, res) {
    const id = Number(req.params.id);

    const projects = [
        { id: 1, name: 'Heart / Knot' },
        { id: 2, name: 'Random' }
    ]

    const chosenProject = projects.find((project) => project.id === id);
    res.json(chosenProject);
});

app.get('/message', function (req, res) {
    res.json({ message: "Hello from backend" });
});








app.listen(port, function (err) {
    if (err) {
        console.log('something happened :( ' + err);
    } else {
        console.log();
        console.log(`Listening at http://${host}:${port}`);
    }
});
