const express = require('express');
const bodyParser = require('body-parser');
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
	var matchingTodo;
	todos.forEach(function (todo) {
		if (todo.id === parseInt(req.params.id)) {
			matchingTodo = todo;
		}
	});
	if (!matchingTodo) {
		res.status(404).send();
	} else {
		res.json(matchingTodo);
	}
});

app.post('/todos', function (req, res) {
	var body = req.body;

	body.id = todoNextId;

	todos.push(body);

	todoNextId++;
	
	res.json(body);
});

app.listen(PORT, function () {
	console.log('Server started on port ' + PORT + '!');
});