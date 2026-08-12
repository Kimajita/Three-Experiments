import express from 'express';
import * as http from 'http';
import * as fs from 'fs';

/*
const hostname = '127.0.0.1';
const port = 8080;
const app = express();

app.use(express.static('./public'));
app.listen(port, function (err) {
    if (err) {
        console.log('something happened :( ' + err);
    } else {
        console.log();
        console.log(`Listening at http://${hostname}:${port}`);
    }
});
*/

const port = 3000;

const server = http.createServer(function (request, response) {

    response.writeHead(200, {
        'Content-Type': 'text/html'
    });

    fs.readFile('./public/index.html', function (error, data) {
        if (error) {
            response.writeHead(404);
            response.write('Error: File Not Found')
        } else {
            response.write(data);
        }
        response.end();
    })
})

server.listen(port, function (error) {
    if (error) {
        console.log('something happened :(', error);
    } else {
        console.log(`Listening on http://localhost:${port}`);
    }
})
