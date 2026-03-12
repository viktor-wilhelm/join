import { getData } from './firebase.js';
import { assignContactColors } from './utilities.js';

const STORE_KEY = "joinData";

let dataStore = {
    tasks: null,
    contacts: null,
    users: null,
};

/**
 * Initializes the data store by loading data from session storage if available,
 * or fetching it from Firebase otherwise. Caches the loaded data in session storage.
 *
 * @async
 * @returns {Promise<void>} Resolves when the data store is initialized.
 */
async function initDataStore() {
    const cached = sessionStorage.getItem(STORE_KEY);

    if (cached) {
        dataStore = JSON.parse(cached);
        return;
    }

    dataStore.tasks = await getData("tasks");
    dataStore.contacts = await getData("contacts");
    dataStore.users = await getData("users");
    saveStore();
}

/**
 * Saves the current data store to session storage under `STORE_KEY`.
 */
function saveStore() {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(dataStore));
}

/**
 * Returns all tasks from the data store as an array of objects with their IDs.
 *
 * @returns {Array<Object>} Array of task objects with `id` included.
 */
function getTasks() {
    return dataStore.tasks ? Object.keys(dataStore.tasks).map(id => ({
        id,
        ...dataStore.tasks[id]
    })) : [];
}

/**
 * Returns all users from the data store.
 *
 * @returns {Array<Object>} Array of user objects.
 */
function getUsers() {
    return dataStore.users || [];
}

/**
 * Returns all contacts from the data store as an array of objects.
 * Assigns colors and persists them in dataStore.contacts.
 *
 * @returns {Array<Object>} Array of contact objects with color property.
 */
function getContacts() {
    if (!dataStore.contacts) return [];
    const contactsArray = Object.keys(dataStore.contacts).map(id => ({
        id,
        ...dataStore.contacts[id]
    }));
    const coloredContacts = assignContactColors(contactsArray);
    coloredContacts.forEach(contact => {
        if (!dataStore.contacts[contact.id].color) {
            dataStore.contacts[contact.id].color = contact.color;
        }
    });
    saveStore();
    return coloredContacts;
}


/**
 * Updates the tasks in the data store and saves them to session storage.
 *
 * @param {Array<Object>} newTasks - The new array of task objects.
 */
function updateTasks(newTasks) {
    dataStore.tasks = newTasks;
    saveStore();
}

/**
 * Updates the contacts in the data store and saves them to session storage.
 *
 * @param {Array<Object>} newContacts - The new array of contact objects.
 */
function updateContacts(newContacts) {
    dataStore.contacts = newContacts;
    saveStore();
}



/**
 * Adds the logged-in user as a temporary "You" contact.
 */
function injectCurrentUserAsContact() {
    const currentUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
    if (!currentUser) return;

    if (!dataStore.contacts) dataStore.contacts = {};

    const alreadyExists = Object.values(dataStore.contacts)
        .some(c => c.isCurrentUser);

    if (alreadyExists) return;

    const id = "currentUser";

    dataStore.contacts[id] = {
        name: "You",
        email: currentUser.email,
        phone: " ",
        color: "#29ABE2",
        isCurrentUser: true
    };

    saveStore();
}

/**
 * Removes the temporary "You" contact.
 */
function removeCurrentUserContact() {
    if (!dataStore.contacts) return;

    delete dataStore.contacts["currentUser"];
    saveStore();
}


function resetDataStore() {
    dataStore = { tasks: null, contacts: null, users: null };
}

export {
  initDataStore,
  saveStore,
  getTasks,
  getUsers,
  getContacts,
  updateTasks,
  updateContacts,
  injectCurrentUserAsContact,
  removeCurrentUserContact,
  resetDataStore,
  dataStore,
};
