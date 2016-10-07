const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');
const app = express();
const PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API root');
});

app.get('/todos', function (req, res) {
	res.json(todos);
});

app.get('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id);
	var matchingTodo = _.findWhere(todos, {id: todoId});
	
	if (!matchingTodo) {
		res.status(404).send();
	} else {
		res.json(matchingTodo);
	}
});

app.post('/todos', function (req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		res.status(400).send();
		return;
	}

	body.id = todoNextId;
	body.description = body.description.trim();

	todos.push(body);

	todoNextId++;
	
	res.json(body);
});

app.listen(PORT, function () {
	console.log('Server started on port ' + PORT + '!');
});