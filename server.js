const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: 'Watering the garden',
	completed: false
}, {
	id: 2,
	description: 'Go to market',
	completed: false
}, {
	id: 3,
	description: 'Walk with the dog',
	completed: true
}];

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

app.listen(PORT, function () {
	console.log('Server started on port ' + PORT + '!');
});