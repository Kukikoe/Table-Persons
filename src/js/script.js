window.onload = function() {
	init();
}

function init() {
	addEventListeners();
}
let id = 0;
let db = indexedDB.open("dbPersons", 2);
let database;
let arrayPersons = [];

db.addEventListener("error", function(event) {
	alert("Could not open IndexedDB due to error: " + this.error);
});

db.addEventListener("upgradeneeded", function(event) {
	let storage = this.result.createObjectStore("data", {autoIncrement: true});
	storage.add({id: 1, name: "Yana", surname: "Bond", age: 23}, "save-data");
	alert("Creating a new data-base");
});

	db.addEventListener("success", function(event) {
		console.log("hello")
	database = this.result;
	console.log(database)
	let storage = database.transaction("data", "readwrite").objectStore("data");
storage.get("data").addEventListener("success", function(event) {
	this.result.id = arrayPersons[arrayPersons.length - 1][0].toString();
	this.result.name = arrayPersons[arrayPersons.length - 1][1];
	this.result.surname = arrayPersons[arrayPersons.length - 1][2];
	this.result.age = arrayPersons[arrayPersons.length - 1][3].toString();
storage.put(this.result, "save-data");
});
	alert("Creating a new data-base");
});

/*db.addEventListener("success", function(event) {
	database = this.result;
	console.log(database)
	let storage = database.transaction("data", "readwrite").objectStore("data");
storage.get("save-data").addEventListener("success", function(event) {
storage.put(this.result, "save-data");
});
	alert("Creating a new data-base");
});*/

function addEventListeners() {
	const btnsElem = document.querySelectorAll(".main-block__buttons");
	const btnsInChagesBlockElem = document.querySelectorAll(".changes-block__btn");
	

	const chagesBlockElem = document.querySelector(".changes-block");
	const tableElem = document.querySelector(".main-block__table");
	const tableTrElem = document.querySelector(".table-tr");
	

	for (let i = 0; i < btnsElem.length; i++) {
		btnsElem[i].addEventListener("click", function(event) {
			let target = event.target;
			if (target.closest(".btn-read")) {

			}
			if (target.closest(".btn-add")) {
				chagesBlockElem.querySelector(".add").classList.toggle("active");
			}			
			if (target.closest(".btn-delete")) {
				chagesBlockElem.querySelector(".delete").classList.toggle("active");
			}			
			if (target.closest(".btn-update")) {
				chagesBlockElem.querySelector(".update").classList.toggle("active");
			}
		});
	}

	for (let i = 0; i < btnsInChagesBlockElem.length; i++) {
		btnsInChagesBlockElem[i].addEventListener("click", function(event) {
			let target = event.target;
			if (target.closest(".btn-addintable")) {
				window.indexedDB.deleteDatabase("dbPersons");
				let parent = target.closest(".btn-addintable").parentElement;
				let id = getId(2);
				let name = parent.querySelector(".name").value;
				let surname = parent.querySelector(".surname").value;
				let age = parent.querySelector(".age").value;
				arrayPersons = getArrayOfPersons(id, name, surname, age, arrayPersons);
				addInTable(tableElem, tableTrElem, arrayPersons);
			}
			if (target.closest(".btn-deletefromtable")) {

			}
			if (target.closest(".btn-updatetable")) {

			}
		});
	}
}


function getArrayOfPersons(id, name, surname, age, arrayPersons) {
	let person = [];
	person.push(id);
	person.push(name);
	person.push(surname);
	person.push(age);
	/*	let person = {
		id,
		name,
		surname,
		age
	};*/
	return arrayPersons.concat([person]);
}

function getId(id) {
	return id++;
}

function addInTable(tableElem, tableTrElem, arrayPersons) {
	let tr = document.createElement("tr");
	tr.id = 2;
	tr.class = "table-tr";

	for (let i = 0; i < tableTrElem.children.length; i++) {
		let td = document.createElement("td");
		td.innerHTML = arrayPersons[arrayPersons.length - 1][i];
		tr.appendChild(td);
	}

	tableElem.appendChild(tr);
	 addInIndexedDB(arrayPersons[arrayPersons.length - 1]);
}

function addInIndexedDB(arrayPersons) {
	

}