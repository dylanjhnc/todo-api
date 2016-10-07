var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

sequelize.sync().then(function() {
	console.log('Everything is synced!');

	Todo.findById(3).then(function (todo) {
		if (!todo) {
			console.log('No todo found.');
		} else {
			console.log(todo.toJSON());
		}
	});

	// Todo.create({
	// 	description: 'Wash car'
	// }).then(function(todo) {
	// 	return Todo.create({
	// 		description: 'Walk the dog'
	// 	})
	// }).then(function() {
	// 	// return Todo.findById(1);
	// 	return Todo.findAll({
	// 		where: {
	// 			description: {
	// 				$like: '%dOg%'
	// 			}
	// 		}
	// 	});
	// }).then(function(todos) {
	// 	if (todos) {
	// 		todos.forEach(function(todo) {
	// 			console.log(todo.toJSON());
	// 		});
	// 	} else {
	// 		console.log('No todo found!');
	// 	}
	// }).catch(function(e) {
	// 	console.log(e.message);
	// });
});