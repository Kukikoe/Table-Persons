window.onload = function() {
	init();
}

function init() {
	addEventListeners();
}

let count = 0;

function addEventListeners() {
	const btnsCrudElem = document.querySelectorAll(".main-block__buttons-crud");	
	const btnsStorageElem = document.querySelectorAll(".main-block__buttons-storage .btn");
	const btnsInChagesBlockElem = document.querySelectorAll(".changes-block__btn");
	
	const chagesBlockElem = document.querySelector(".changes-block");
	const chagesBlockAllElems = document.querySelectorAll(".changes-block__elem-block");

	let idToUpdate;
	//addEventListener fo buttons with DB
	for (let i = 0; i < btnsStorageElem.length; i++) {
		btnsStorageElem[i].addEventListener("click", function(event) {
			const target = event.target;
			
			for (let j = 0; j < btnsStorageElem.length; j++) {
				btnsStorageElem[j].classList.remove("active");
			}

			target.classList.add("active");
			document.querySelector(".main-block__tbody").innerHTML = "";

			if (target.closest(".btn-window-st")) {
				setWindowStorage();
			}
			if (target.closest(".btn-local-st")) {
				setLocalStorage();
			}
			if (target.closest(".btn-indexed-st")) {
				setIndexedDBStorage();	
			}
		});
	}
	//addEventListener fo buttons CRUD
	for (let i = 0; i < btnsCrudElem.length; i++) {
		btnsCrudElem[i].addEventListener("click", function(event) {
			if (personDAO === undefined) {
				alert("Please, select database first");
				return;
			}
			const target = event.target;
			//read
			if (target.closest(".btn-read")) {
				document.querySelector(".main-block__tbody").innerHTML = "";
				let items = personDAO.readAllPersons();

				if (personDAO instanceof PersonDAOIndexedDB) {
					items.then(person => addInTable(person));
				}
				else {
					addInTable(items);
				}
			}

			for (let j = 0; j < chagesBlockAllElems.length; j++) {
				chagesBlockAllElems[j].classList.remove("active");
			}

			if (target.closest(".btn-add")) {
				chagesBlockElem.querySelector(".add").classList.toggle("active");
			}			
			if (target.closest(".btn-delete")) {
				chagesBlockElem.querySelector(".delete").classList.toggle("active");
			}			
			if (target.closest(".btn-update")) {
				chagesBlockElem.querySelector(".update-enter-id").classList.toggle("active");
			}
		});
	}
	//addEventListener fo blocks in which you change DB
	for (let i = 0; i < btnsInChagesBlockElem.length; i++) {
		btnsInChagesBlockElem[i].addEventListener("click", function(event) {
			const target = event.target;
			//add
			if (target.closest(".btn-addintable")) {
				let parent = target.closest(".btn-addintable").parentElement;
				let name = parent.querySelector(".name").value;
				let surname = parent.querySelector(".surname").value;
				let age = parent.querySelector(".age").value;
				//exeption if one of the inputs is empty
				if(name && surname && age === "") {
					alert("Please, fill in all fields");
					return;
				}

				const personObj = getPersonObj(generateId(), name, surname, age);
				let items = personDAO.addPerson(personObj);

				if (personDAO instanceof PersonDAOIndexedDB) {
					items.then(id => personDAO.getPerson(id))
					.then(person => {
						addInTable(person);
					});
				}
				else {
					document.querySelector(".main-block__tbody").innerHTML = "";
					addInTable(items);
				}

				parent.querySelector(".name").value = parent.querySelector(".surname").value = parent.querySelector(".age").value = "";
			}
			//delete
			if (target.closest(".btn-deletefromtable")) {
				const parent = target.closest(".btn-deletefromtable").parentElement;
				const id = parent.querySelector(".id-delete").value;
				if(getWarningForId(id) === false) {
					return; 
				}

				personDAO.deletePerson(parseInt(id));

				deleteFromTable(id);
				parent.querySelector(".id-delete").value = "";
			}
			//enter id of person to update
			if (target.closest(".btn-next")) {
				const parent = target.closest(".btn-next").parentElement;
				idToUpdate = parent.querySelector(".id-to-update").value;
				if(getWarningForId(idToUpdate) === false) {
					return; 
				}

				const currentTr = document.getElementById("tr" + idToUpdate).querySelectorAll("td");

				chagesBlockElem.querySelector(".update").classList.add("active");
				chagesBlockElem.querySelector(".update-enter-id").classList.remove("active");
				let arrayInputs = chagesBlockElem.querySelector(".update").querySelectorAll(".form-control-input");
				
				for (let i = 0; i < arrayInputs.length; i++) {
					arrayInputs[i].value = currentTr[i + 1].innerHTML;
				}
				parent.querySelector(".id-to-update").value = "";
			}
			//update
			if (target.closest(".btn-updatetable")) {
				const parent = target.closest(".btn-updatetable").parentElement;
				chagesBlockElem.querySelector(".update").classList.remove("active");
				const arrayInputs = chagesBlockElem.querySelector(".update").querySelectorAll(".form-control-input");
				//exeption if one of the inputs is empty
				if(arrayInputs[0].value && arrayInputs[1].value && arrayInputs[2].value === "") {
					alert("Please, fill in all fields");
					return;
				}

				const personObj = getPersonObj(parseInt(idToUpdate), arrayInputs[0].value, arrayInputs[1].value, arrayInputs[2].value);

				personDAO.updatePerson(personObj);
				let currentTr = document.getElementById("tr" + idToUpdate).querySelectorAll("td");
				let i = 0;
				for (prop in personObj) {
					currentTr[i].innerHTML = personObj[prop];
					i++;
				}
			}
		});
	}
}

function getWarningForId(id) {
	//exeption if input is empty
	if(!!id !== true) {
		alert("Please, enter id");
		return false;
	}
	//exeption if in IndexedDB missing such id
	if (personDAO instanceof PersonDAOIndexedDB) {
		let item = personDAO.getPerson(parseInt(id));
		item.then(person => {
			if (person.length === 0) {
				alert("There is no such id in DB. Please, enter correct id");
				return false;
			}
		});
	}
	//exeption if in others DB missing such id
	console.log(personDAO.getPerson(parseInt(id)))
	if (personDAO.getPerson(parseInt(id)).length === 0) {
		alert("There is no such id in DB. Please, enter correct id");
		return false;
	}
}

function generateId() {
	if (personDAO instanceof PersonDAOLocalStorage) { 
		if(JSON.parse(localStorage.getItem('PersonList'))) {
			let array = personDAO.readAllPersons();
			return ++array[array.length - 1].id;
		}
	}
	if (personDAO instanceof PersonDAOIndexedDB) { 
		return "";
	}
	return ++count;
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

function addInTable(array) {

	for (let i = 0; i < array.length; i++) {
		let tr = document.createElement("tr");
		tr.id = "tr" + array[i].id;
		tr.class = "table-tr";

		renderTD(tr, array[i].id);

		for (let props in array[i]) {
			if(props !== "id") {
				renderTD(tr, array[i][props]);
			}
		}
		document.querySelector(".main-block__tbody").appendChild(tr);
	}
}

function renderTD(tr, text) {
	let td = document.createElement("td");
	td.innerHTML = text;
	tr.appendChild(td);
}