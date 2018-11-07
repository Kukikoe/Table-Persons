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
	const btnsElem = document.querySelectorAll(".main-block__buttons");
	const btnsInChagesBlockElem = document.querySelectorAll(".changes-block__btn");
	
	const tableElem = document.querySelector(".main-block__tbody");
	const tableTrElem = document.querySelector(".table-tr");
	const chagesBlockElem = document.querySelector(".changes-block");

	let idToUpdate;
	let count = 0;
	
	for (let i = 0; i < btnsElem.length; i++) {
		btnsElem[i].addEventListener("click", function(event) {
			let target = event.target;
			//read
			if (target.closest(".btn-read")) {
				tableElem.innerHTML = "";
					db.persons.each(person => addInTable(tableElem, tableTrElem, person));
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

				db.persons.add({name: name, surname: surname, age: age}).then(function() {
					db.persons.orderBy("id").last().then(function(person) {
						let personObj = getPersonObj(person.id, name, surname, age);
						addInTable(tableElem, tableTrElem, personObj);
						return person.id;
					})
				});	
				parent.querySelector(".name").value = parent.querySelector(".surname").value = parent.querySelector(".age").value = "";
			}
			//delete
			if (target.closest(".btn-deletefromtable")) {
				let parent = target.closest(".btn-deletefromtable").parentElement;
				let id = parent.querySelector(".id-delete").value;
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

function addInTable(tableElem, tableTrElem, personObj) {
	let tr = document.createElement("tr");
	tr.id = "tr" + personObj.id;
	tr.class = "table-tr";

	//need to delete id from obj because in db id puts in the end of array
	let td = document.createElement("td");
	td.innerHTML = personObj.id;
	tr.appendChild(td);
	delete personObj.id;

	for (let props in personObj) {
		let td = document.createElement("td");
		td.innerHTML = personObj[props];
		tr.appendChild(td);
	}
	tableElem.appendChild(tr);
}

