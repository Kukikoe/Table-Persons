window.onload = function() {
	init();
}

let db = new Dexie("dbPersons");
db.version(1).stores({
	persons: "++id, name, surname, age"
});

function init() {
	addEventListeners();
}

function addEventListeners() {
	const allBtnsElem = document.querySelector(".main-block");
	const btnsCrudElem = document.querySelectorAll(".main-block__buttons-crud");	
	const btnsStorageElem = document.querySelectorAll(".main-block__buttons-storage");
	const btnsInChagesBlockElem = document.querySelectorAll(".changes-block__btn");
	
	const chagesBlockElem = document.querySelector(".changes-block");

	const table = new IndexedDB();
	let idToUpdate;
	let count = 0;

	for (let i = 0; i < btnsStorageElem.length; i++) {
		btnsStorageElem[i].addEventListener("click", function(event) {
			let target = event.target;

			if (target.closest(".btn-window-st")) {
				setWindowStorage();
				allBtnsElem.querySelector(".main-block__buttons-crud").classList.add("window-storage");
				allBtnsElem.querySelector(".main-block__buttons-crud").classList.remove("indexedDB");
				allBtnsElem.querySelector(".main-block__buttons-crud").classList.remove("local-storage");
			}
			if (target.closest(".btn-local-st")) {
				setLocalStorage();
				allBtnsElem.querySelector(".main-block__buttons-crud").classList.add("local-storage");
				allBtnsElem.querySelector(".main-block__buttons-crud").classList.remove("indexedDB");
				allBtnsElem.querySelector(".main-block__buttons-crud").classList.remove("window-storage");
			}
			if (target.closest(".btn-indexed-st")) {
				setIndexedDBStorage();
				allBtnsElem.querySelector(".main-block__buttons-crud").classList.add("indexedDB");
				allBtnsElem.querySelector(".main-block__buttons-crud").classList.remove("local-storage");
				allBtnsElem.querySelector(".main-block__buttons-crud").classList.remove("window-storage");
			}
		});
	}
	
	for (let i = 0; i < btnsCrudElem.length; i++) {
		btnsCrudElem[i].addEventListener("click", function(event) {
			let target = event.target;
			//read
			if (target.closest(".btn-read")) {
				document.querySelector(".main-block__tbody").innerHTML = "";
				let array = table.read();
				array.then(person => addInTable(person));
			}
			if (target.closest(".btn-add")) {
				chagesBlockElem.querySelector(".add").classList.toggle("active");
				chagesBlockElem.querySelector(".delete").classList.remove("active");
				chagesBlockElem.querySelector(".update-enter-id").classList.remove("active");
			}			
			if (target.closest(".btn-delete")) {
				chagesBlockElem.querySelector(".delete").classList.toggle("active");
				chagesBlockElem.querySelector(".add").classList.remove("active");
				chagesBlockElem.querySelector(".update-enter-id").classList.remove("active");
			}			
			if (target.closest(".btn-update")) {
				chagesBlockElem.querySelector(".update-enter-id").classList.toggle("active");
				chagesBlockElem.querySelector(".delete").classList.remove("active");
				chagesBlockElem.querySelector(".add").classList.remove("active");
			}
		});
	}

	for (let i = 0; i < btnsInChagesBlockElem.length; i++) {
		btnsInChagesBlockElem[i].addEventListener("click", function(event) {
			let target = event.target;
			//add
			if (target.closest(".btn-addintable")) {
				let parent = target.closest(".btn-addintable").parentElement;
				let name = parent.querySelector(".name").value;
				let surname = parent.querySelector(".surname").value;
				let age = parent.querySelector(".age").value;


				let personObj = getPersonObj("", name, surname, age);
				console.log(personObj)
				let array = table.add(personObj);
				console.log(array)
				array.then(person => table.getPerson(person))
				.then(person => {
					addInTable(person);
				});

				parent.querySelector(".name").value = parent.querySelector(".surname").value = parent.querySelector(".age").value = "";
			}
			//delete
			if (target.closest(".btn-deletefromtable")) {
				let parent = target.closest(".btn-deletefromtable").parentElement;
				let id = parent.querySelector(".id-delete").value;

				table.delete(parseInt(id));

				db.persons.where("id").equals(parseInt(id)).delete();
				deleteFromTable(id);
				parent.querySelector(".id-delete").value = "";
			}
			//enter id of person to update
			if (target.closest(".btn-next")) {
				let parent = target.closest(".btn-next").parentElement;
				idToUpdate = parent.querySelector(".id-to-update").value;
				const tecTr = document.getElementById("tr" + idToUpdate).querySelectorAll("td");

				chagesBlockElem.querySelector(".update").classList.add("active");
				chagesBlockElem.querySelector(".update-enter-id").classList.remove("active");
				let arrayInputs = chagesBlockElem.querySelector(".update").querySelectorAll(".form-control-input");
				
				for (let i = 0; i < arrayInputs.length; i++) {
					arrayInputs[i].value = tecTr[i + 1].innerHTML;
				}
				parent.querySelector(".id-to-update").value = "";
			}
			//update
			if (target.closest(".btn-updatetable")) {
				let parent = target.closest(".btn-updatetable").parentElement;
				chagesBlockElem.querySelector(".update").classList.remove("active");
				let arrayInputs = chagesBlockElem.querySelector(".update").querySelectorAll(".form-control-input");

				let personObj = getPersonObj(parseInt(idToUpdate), arrayInputs[0].value, arrayInputs[1].value, arrayInputs[2].value);
                table.update(personObj);

				let arr = [];
				arr.push(parseInt(idToUpdate));
				arr.push(arrayInputs[0].value);
				arr.push(arrayInputs[1].value);
				arr.push(arrayInputs[2].value);

				db.persons.put({name: arrayInputs[0].value, surname:arrayInputs[1].value, age: arrayInputs[2].value, id: parseInt(idToUpdate)})
				let currentTr = document.getElementById("tr" + idToUpdate).querySelectorAll("td");
				for (let i = 1; i < currentTr.length; i++) {
					currentTr[i].innerHTML = arr[i];
				}
			}
		});
	}
}

function IndexedDB() {
	this.add = function(person) {
		return db.persons.add({name: person.name, surname: person.surname, age: person.age});
	};
	this.getPerson = function(id) {
		return db.persons.where("id").equals(id).toArray();
	}
	this.read = function() {
		return db.persons.toArray();
	};
	this.update = function(person) {
		db.persons.put({name: person.name, surname: person.surname, age: person.age, id: person.id});
	};
	this.delete = function(id) {
		db.persons.where("id").equals(id).delete();
	};
}

function getPersonObj(id, name, surname, age) {
	let person = {
		id,
		name,
		surname,
		age
	};
	return person;
}

function deleteFromTable(id) {
	let str = "tr" + id;
	const currentTr = document.getElementById(str);
	currentTr.remove();
}

function addInTable(personObj) {
	console.log(personObj[0])
	for (let i = 0; i < personObj.length; i++) {
	let tr = document.createElement("tr");
	tr.id = "tr" + personObj[i].id;
	tr.class = "table-tr";

	//need to delete id from obj because in db id puts in the end of array
	let td = document.createElement("td");
	td.innerHTML = personObj[i].id;
	tr.appendChild(td);
	delete personObj[i].id;

	for (let props in personObj[i]) {
		let td = document.createElement("td");
		td.innerHTML = personObj[i][props];
		tr.appendChild(td);
	}
	document.querySelector(".main-block__tbody").appendChild(tr);
}
}

