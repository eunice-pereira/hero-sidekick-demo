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

const { Hero, Sidekick } = require('./models');
const { layout } = require('./utils');
app.get('/', (req, res) => {
	res.send(`hello world!`);
});
app.get('/list', async (req, res) => {
	const heroes = await Hero.findAll({
		order: [['name', 'desc']],
	});

	res.render('list', {
		locals: {
			heroes,
		},
		...layout,
	});

	// testing we are connecting properly!
	// res.send('this should be a list of heroes');
});
app.get('/hero/:id/sidekick', async (req, res) => {
	const { id } = req.params;
	const hero = await Hero.findByPk(id);
	// get list of sidekicks from DB
	const sidekicks = await Sidekick.findAll({
		order: [['name', 'asc']],
	});
	res.render('form', {
		locals: {
			hero, // chosen from id above
			sidekicks, // all sidekicks from db
		},
		...layout,
	});
});

server.listen(port, host, () => {
	console.log(`Running on http://${host}:${port}`);
});
