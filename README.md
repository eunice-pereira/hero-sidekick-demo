# Demo One to One Relationships

## Basic Set up

```sh
git init
npm init -y
echo "node_modules" >> .gitignore
```

## Install node modules

```sh
npm i --save-dev nodemon sequelize-cli
npm i express morgan express-es6-template-engine sequelize pg pg-hstore
```

### Write a hello world to make sure it works

```sh
touch index.js
```

Note: for this demo, routers/controllers will all be in index.js.

### Add `dev` script to package.json, then test `hello world` home router

```sh
npm run dev
```

**It works! 🤗. Moving onto databases...**

---

## Sequelize DB Set Up

### make it dotenv-aware

- `touch .sequelizerc` (or copy from another project)
- fill out our `config/config.js` with ElephantSQL credentials

  - add a `module.exports= `
  - put in `process.env` variables

  - change dialect to `'postgres'`

- `touch.env`

  - put real ElephanSQL credentials in `.env` file

- add `require('dotenv').config()` at top of `models/index.js`

- modify `config.js` file to require `.env` credentials

```sh
require('dotenv').config();

module.exports = {
	development: {
		username: process.env.DB_NAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		dialect: 'postgres',
	},
```

### Now, initalize Sequelize to set up models

```sh
npx sequelize init
```

### Generate models

- Hero is standalone model
- Sidekick depends on hero, so has a FK that points to Hero model

```sh
npx sequelize model:generate --name Hero --attributes name:string
```

- migrate standalone tables to confirm connection works

```sh
npx sequelize db:migrate
```

- Now, creating Sidekick model, set up FK keys and associations, then migrate the second model

```sh
npx sequelize model:generate --name Sidekick --attributes 'name:string,heroId:integer'
```

### Set up Forgein Keys

Sidekick points to Hero using Sidekick's `heroId`

- modify this in `models/sidekick.js`

```sh
Sidekick.init(
		{
			name: DataTypes.STRING,
			heroId: {
				type: DataTypes.INTEGER,
				model: 'Hero',
				key: 'id',
			},
		},
```

### Define associations

Always define both sides of the association.
That way, Sequelize can:

- create "magic methods"
- handle clean up and error checking

The associations can be described like this in 'DB speak' 🤓:

- A Hero has one (and only one) Sidekick
- A Sidekick belongs to one (and only one) Hero

### `models/sidekick.js`

```js
static associate(models) {
			// define association here
			Sidekick.belongsTo(models.Hero, {
				foreignKey: 'heroId',
			});
		}
```

**Note**: we use `models.Hero` since Hero model is in another folder inside models.
This prevents from having to `require` Hero model in file

### `models/hero.js`

```js
static associate(models) {
			// define association here
			Hero.hasOne(models.Sidekick, {
				foreignKey: 'heroId',
			});
		}
```

### Migrate the database

```sh
npx sequelize db:migrate
```

### Set up Beekeeper to view Models

- Choose Postgres from drop down
- Enter ElephantSQL credentials (do not change default port)
- Ensure to name DB on the bottom. Save and connect!

### Create and seed data for Heroes & Sidekicks

```sh
npx sequelize seed:generate --name add-hero-data
npx sequelize seed:generate --name add-sidekick-data
```

### In new seeder file, fill `up` and `down` functions

In `up` function, when calling `queryInterface.bulkInsert()`, pass it three args:

1. the name of the table
2. an array of objects
3. an empty options object

In `down` function, when calling `queryInterface.bulkDelete()`, pass it one arg:

1. the name of the table

### Migrate the seed data

```sh
npx sequelize db:seed:all
```

Check Beekeeper Studio to check table generated correctly.

**Note**: if there are duplicates in data, then undo your seed data, and redo it.

- be very careful with this!
- never run these commands on your live/production site
- It will delete any data your real users have provided

```sh
npx sequelize db:seed:undo:all
npx sequelize db:seed:all
```

---

## Call Sequelize Models from Controller functions

### List all Heroes

- require Hero Model in index.js
- call Hero.findAll()
- res.send() that array back to the browser

```sh
app.get('/list', async (req, res) => {
	const heroes = await Hero.findAll();

	// to have data return in JSON object
	console.log(JSON.stringify(heroes, null, 4));
	res.json(heroes);

	// testing we are connecting properly!
	// res.send('this should be a list of heroes');
});
```

_Note_: To see a nice version of data in `console.log()`

```js
console.log(JSON.stringify(heroes, null, 4));
```

`JSON.stringify()` will take objects and arrays and simple variables (not functions) and will make it a human-readable string.

The `null, 4` arguments are for indentation.

#### Show list in template

1. mkdir `templates`
   -mkdir `templates/partials` (with header.html and footer.html)
2. touch `utils.js` with partials "layout" object

- easily include header and footer when I `res.render()`

3. create a template for listing heroes `list.html`

- `.map().join('')` into a String

Once template html files are set up, modify `'/list'` router to render Heroes model 🎉

`list.html`

```sh
${header}
<h1>All Heroes!</h1>
<ul>
	${ heroes.map(h => `
	<li>${h.name}</li>
	`).join('') }
</ul>
${footer}
```

`index.js`

```sh
app.get('/list', async (req, res) => {
	const heroes = await Hero.findAll();
	res.render('list', {
		locals: {
			heroes,
		},
		...layout,
	});
});
```

### How do I list heros alphabetically?

```js
const heroes = await Hero.findAll({
	order: [
		// column to order by, then "direction"
		// 'desc' is SQL syntax for descending
		['name', 'desc'],
	],
});
```

### Show a form that lists all Sidekicks

Goal: associate a specific Sidekick with a specific Hero

- new router: `app.get('/hero/:id/sidekick')`
- require Sidekick from models

```sh
const { Hero, Sidekick } = require('./models');
```

- get a list of all the sidekicks
- res.render() a new template: `form.html`
- convert that list to dropdown
  - use the Sidekick id for the value, but show their name

### Process the form data and associate that Sidekick with that Hero

Router now looks like this:

```sh
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
```

`app.get()` router always needs `app.post()` immediately afterwards when rendering a form

```sh
app.post('/hero/:id/sidekick', async (req, res) => {
	const { id } = req.params;
	const { sidekickId } = req.body;

	const hero = await Hero.findByPk(id);
	await hero.setSidekick(sidekickId);
	await hero.save();

	res.redirect('/list');
});
```

**Note!** Remember the following code towards top of `index.js` in order for form to render.

```js
app.use(express.urlencoded({ extended: true }));
```

### How do I filter out Sidekicks that are already taken?

`Op` contains comparison operators.

```js
const { Op } = require('sequelize');
```
