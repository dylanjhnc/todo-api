// var person = {
// 	name: 'Dylan',
// 	age: 21
// };

// function updatePerson (obj) {
// 	obj.age = 23;
// }

// updatePerson(person);
// console.log(person);

var grades = ['14', '43'];

function updateGrades (arr) {
	arr.push('25');
}

updateGrades(grades);
debugger;
console.log(grades);

function updateGrades2 (arr) {
	arr = [14, 43, 25];
}

updateGrades2(grades);
console.log(grades);