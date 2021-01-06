const http = require('http');
const express = require('express');
const morgan = require('morgan');
const es6Renderer = require('express-es6-template-engine');

const app = express();
const server = http.createServer(app);

const port = 3001;
const host = 'localhost';

const logger = morgan('dev');
app.use(logger);

app.engine('html', es6Renderer);
app.set('views', 'templates');
app.set('view engine', 'html');

app.get('/', (req, res) => {
	res.send(`hello world!`);
});

server.listen(port, host, () => {
	console.log(`Running on http://${host}:${port}`);
});
