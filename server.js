const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');
const db = require('./db.js');
const app = express();
const PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API root');
});

app.get('/todos', function(req, res) {
	var queryParams = req.query;
	var filteredTodos = todos;

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {
			completed: true
		});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {
			completed: false
		});
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0) {
		filteredTodos = _.filter(filteredTodos, function(todo) {
			return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase().trim()) !== -1;
		});
	}

	res.json(filteredTodos);
});

app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id);
	db.todo.findById(todoId).then(function(todo) {
		if (!!todo) {
			res.status(404).json({
				error: 'no todo found'
			});
		} else {
			res.json(todo.toJSON());
		}
	}, function () {
		res.status(500).send('something went wrong');
	});
});

app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}).catch(function(e) {
		res.status(400).json({
			'error': e.message
		});
	});
});

app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id);
	var matchingTodo = _.findWhere(todos, {
		id: todoId
	});

	if (!matchingTodo) {
		res.status(404).send();
	} else {
		todos = _.without(todos, matchingTodo);
		res.json(matchingTodo);
	}
});

app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id);
	var matchingTodo = _.findWhere(todos, {
		id: todoId
	});
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	if (!matchingTodo) {
		return res.status(404).json({
			'error': 'no todo found'
		});
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).json({
			'error': 'completed should be a boolean'
		});
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).json({
			'error': 'description is invalid'
		});
	}

	_.extend(matchingTodo, validAttributes);

	res.json(matchingTodo);
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Server started on port ' + PORT + '!');
	});
});