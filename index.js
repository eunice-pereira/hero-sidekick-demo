const http = require('http');
const express = require('express');
const morgan = require('morgan');

const app = express();
const server = http.createServer(app);

const port = 3001;
const host = 'localhost';

const es6Renderer = require('express-es6-template-engine');
app.engine('html', es6Renderer);
app.set('views', 'templates');
app.set('view engine', 'html');

const logger = morgan('dev');
app.use(logger);

const { Hero } = require('./models');
const { layout } = require('./utils');
app.get('/', (req, res) => {
	res.send(`hello world!`);
});
app.get('/list', async (req, res) => {
	const heroes = await Hero.findAll();

	// to have data return in JSON object
	// console.log(JSON.stringify(heroes, null, 4));
	// res.json(heroes);
	res.render('list', {
		locals: {
			heroes,
		},
		...layout,
	});

	// testing we are connecting properly!
	// res.send('this should be a list of heroes');
});

server.listen(port, host, () => {
	console.log(`Running on http://${host}:${port}`);
});
