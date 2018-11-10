let personDAO;
let db = new Dexie("dbPersons");
db.version(1).stores({
	persons: "++id, name, surname, age"
});

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

class PersonDAOWindow {
	constructor() {
		if (PersonDAOWindow.instance) return PersonDAOWindow.instance;
		else {
			PersonDAOWindow.instance = this;
			this.personList = [];
		}
	}

	readAllPersons() { return this.personList; }
	addPerson(person) { 
		this.personList = this.personList.concat(person);
		return this.personList;
	}
	getPerson(id) { 
		return this.personList.filter(person => person.id === id); 
	}
	updatePerson(person) { 
		return this.personList = this.personList.map(function(personObj, i) {
			if(personObj.id === person.id) {
				return person;
			}
			return personObj;
		});
	}
	deletePerson(id) { 
		this.personList = this.personList.filter(person => person.id !== id);
	}
}

class PersonDAOLocalStorage {
	constructor() {
		if (PersonDAOLocalStorage.instance) return PersonDAOLocalStorage.instance;
		else {
			PersonDAOLocalStorage.instance = this;
			this.personList = [];
		}
	}

	readAllPersons() { 
		return JSON.parse(localStorage.getItem('PersonList')) || [];
	}
	addPerson(person) {
		this.personList = this.readAllPersons();
		this.personList.push(person);
		localStorage.setItem('PersonList', JSON.stringify(this.personList)); 
		return this.personList;
	}
	getPerson(id) { 
		this.personList = this.readAllPersons();
		return this.personList.filter(person => person.id === id); 
	}
	updatePerson(person) {		
		this.personList = this.readAllPersons();
		this.personList = this.personList.map(function(personObj, i) {
			if(personObj.id === person.id) {
				return person;
			}
			return personObj;
		});
		localStorage.setItem('PersonList', JSON.stringify(this.personList)); 
		return this.personList;
	}
	deletePerson(id) { 
		this.personList = this.readAllPersons();
		this.personList = this.personList.filter(person => person.id !== id);
		localStorage.setItem('PersonList', JSON.stringify(this.personList)); 
	}
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