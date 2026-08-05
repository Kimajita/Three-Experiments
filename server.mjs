import express from 'express';

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
