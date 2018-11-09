let personDAO;

function setWindowStorage() {
	personDAO = new PersonDAOWindow;
	addInTable(personDAO.readAllPersons());
}

function setLocalStorage() {
	personDAO = new PersonDAOLocalStorage;
	addInTable(personDAO.readAllPersons());
}

function setIndexedDBStorage() {
	personDAO = new PersonDAOIndexedDB;
	let array = personDAO.readAllPersons();
	array.then(person => addInTable(person));
}

function setServerStorage() {}


let personList = null;
class PersonDAOWindow {
	constructor() {
		if (PersonDAOWindow.instance) return PersonDAOWindow.instance;
		else {
			PersonDAOWindow.instance = this;
			personList = [];
		}
	}

	readAllPersons() { return personList; }
	addPerson(person) { return personList.push(person); }
	getPerson(id) { return personList[id]; }
	updatePerson(person) { return personList[person.id] = person; }
	deletePerson(id) { delete personList[id]; }
}

class PersonDAOLocalStorage {
	constructor() {
		if (PersonDAOLocalStorage.instance) return PersonDAOLocalStorage.instance;
		else {
			PersonDAOLocalStorage.instance = this;
		}
	}

	readAllPersons() { return JSON.parse(localStorage.getItem('PersonList')); }
	addPerson(person) {
		const personList = JSON.parse(localStorage.getItem('PersonList'));
		personList.push(person);
		localStorage.setItem('PersonList', JSON.stringify(personList)); 
	}
	getPerson(id) { 
		const personList = JSON.parse(localStorage.getItem('PersonList'));
		return personList[id]; 
	}
	updatePerson(person) {		
		const personList = JSON.parse(localStorage.getItem('PersonList'));
		personList[person.id] = person;
		localStorage.setItem('PersonList', JSON.stringify(personList)); 
	}
	deletePerson(id) { delete personList[id]; }
}

class PersonDAOIndexedDB {
	constructor() {
		if (PersonDAOIndexedDB.instance) return PersonDAOIndexedDB.instance;
		else {
			PersonDAOIndexedDB.instance = this;
		}
	}

	readAllPersons() { return db.persons.toArray(); }
	addPerson(person) { 		
		return db.persons.add({name: person.name, surname: person.surname, age: person.age});
	}
	getPerson(id) { return db.persons.where("id").equals(id).toArray(); }
	updatePerson(person) { return db.persons.put({name: person.name, surname: person.surname, age: person.age, id: person.id}); }
	deletePerson(id) { return db.persons.where("id").equals(id).delete(); }
}