const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');
const db = require('./db.js');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 3000;
const middleware = require('./middleware')(db);

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API root');
});

app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var query = req.query;
	var where = {
		userId: req.user.get('id')
	};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.trim().length > 0) {
		where.description = {
			$like: '%' + query.q.trim().toLowerCase() + '%'
		};
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}, function() {
		res.status(500).send('something went wrong');
	});

	// res.json(filteredTodos);
});

app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id);
	db.todo.findOne({
		where: {
			id: todoId,
			userId: req.user.get('id') 
		}
	}).then(function(todo) {
		if (!todo) {
			res.status(404).json({
				error: 'no todo found'
			});
		} else {
			res.json(todo.toJSON());
		}
	}, function() {
		res.status(500).send('something went wrong');
	});
});

app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	var user = req.user;

	db.todo.create(body).then(function(todo) {
		req.user.addTodo(todo).then(function () {
			return todo.reload();
		}).then(function (todo) {
			res.json(todo.toJSON());
		});
	}).catch(function(e) {
		res.status(400).json({
			'error': e.message
		});
	});
});

app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id);

	db.todo.destroy({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	}).then(function(rows) {
		if (rows === 0) {
			res.status(404).send('no todo found');
		} else {
			res.status(204).send();
		}
	}, function() {
		res.status(500).send('something went wrong');
	});
});

app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findOne({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});
});

app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		res.json(user.toPublicJson());
	}).catch(function(e) {
		res.status(400).json({
			'error': e
		});
	});
});

app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function (user) {
		var token = user.generateToken('authentication');
		if (token) {
			res.header('Auth', token).json(user.toPublicJson());
		} else {
			res.status(401).send();
		}
	}, function (e) {
		res.status(401).send();
	});
});

db.sequelize.sync({force:true}).then(function() {
	app.listen(PORT, function() {
		console.log('Server started on port ' + PORT + '!');
	});
});