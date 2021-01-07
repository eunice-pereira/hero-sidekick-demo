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

app.use(express.urlencoded({ extended: true }));

const { Hero, Sidekick } = require('./models');
const { layout } = require('./utils');
const { Op } = require('sequelize');

app.get('/', (req, res) => {
	res.send(`hello world!`);
});
app.get('/list', async (req, res) => {
	const heroes = await Hero.findAll({
		// once chosen, will include all sidekick info in Hero array that prints to console
		include: Sidekick,

		// will list heroes in descending order in drop down menu
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
		// this is so taken sidekicks are no longer shown
		where: {
			heroId: {
				[Op.eq]: null, //remember to require from Sequelize
			},
		},
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
app.post('/hero/:id/sidekick', async (req, res) => {
	const { id } = req.params;
	const { sidekickId } = req.body;

	const hero = await Hero.findByPk(id);
	await hero.setSidekick(sidekickId);
	await hero.save();

	res.redirect('/list');
});

server.listen(port, host, () => {
	console.log(`Running on http://${host}:${port}`);
});
