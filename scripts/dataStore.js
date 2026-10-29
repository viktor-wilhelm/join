import { getData, saveChanges } from './firebase.js';
import { auth } from '../config/firebase.config.js';
import { assignContactColors } from './utilities.js';

const STORE_KEY = "joinData";
const TEMP_CONTACT_ID = "currentUser";
const SYNC_ENABLED = true;
const COLLECTIONS = ["tasks", "contacts"];

let dataStore = {
    tasks: null,
    contacts: null,
    users: null,
};

let lastSynced = { tasks: {}, contacts: {} };

/**
 * Initializes the data store with the shared tasks and contacts from Firebase.
 * Without a signed-in Firebase user (e.g. guest login while Anonymous Auth is unavailable)
 * no request is sent and the data store works locally from session storage only.
 * The temporary "You" contact of a guest is added in memory and never saved to Firebase.
 *
 * @async
 * @returns {Promise<void>} Resolves when the data store is initialized.
 */
async function initDataStore() {
    await auth.authStateReady();
    if (auth.currentUser) await loadSharedData();
    else restoreLocalData();
    if (JSON.parse(sessionStorage.getItem("loggedInUser"))?.guest) injectCurrentUserAsContact();
    saveStore();
}

/**
 * Loads the shared tasks and contacts from Firebase and remembers them as the synced state.
 *
 * @async
 */
async function loadSharedData() {
    dataStore.tasks = await getData("tasks");
    dataStore.contacts = await getData("contacts");
    lastSynced = { tasks: cloneRecords(dataStore.tasks), contacts: cloneRecords(dataStore.contacts) };
}

/**
 * Restores the data from session storage when Firebase is not available.
 */
function restoreLocalData() {
    const cached = sessionStorage.getItem(STORE_KEY);
    if (cached) dataStore = JSON.parse(cached);
}

/**
 * Saves the current data store to session storage under `STORE_KEY`
 * and writes the changed tasks and contacts to Firebase, record by record.
 *
 * @returns {Promise<boolean>} True if everything is saved (or nothing had to be saved).
 */
function saveStore() {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(dataStore));
    return syncChanges();
}

/**
 * Creates a deep copy of a collection and removes `undefined` values.
 *
 * @param {Object|null} records - Records keyed by ID.
 * @returns {Object} The copy, an empty object for `null`.
 */
function cloneRecords(records) {
    return JSON.parse(JSON.stringify(records || {}));
}

/**
 * Serializes a value with sorted keys so equal records compare equal.
 *
 * @param {*} value - The value to serialize.
 * @returns {string} The stable JSON string.
 */
function stableStringify(value) {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    if (value && typeof value === "object") {
        const keys = Object.keys(value).sort();
        return `{${keys.map(k => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
    }
    return JSON.stringify(value);
}

/**
 * Compares the current records of a collection with the last synced ones.
 * The temporary "You" contact is never part of the changes.
 *
 * @param {string} name - Collection name ("tasks" or "contacts").
 * @returns {Object<string, Object|null>} Changed records by path; `null` marks a deleted record.
 */
function diffCollection(name) {
    const current = cloneRecords(dataStore[name]);
    delete current[TEMP_CONTACT_ID];
    const synced = lastSynced[name];
    const changes = {};

    Object.keys(current)
        .filter(id => stableStringify(current[id]) !== stableStringify(synced[id]))
        .forEach(id => { changes[`${name}/${id}`] = current[id]; });
    Object.keys(synced)
        .filter(id => !(id in current))
        .forEach(id => { changes[`${name}/${id}`] = null; });
    return changes;
}

/**
 * Collects the pending changes of all shared collections.
 *
 * @returns {Object<string, Object|null>} Changes by path.
 */
function collectChanges() {
    return COLLECTIONS.reduce((all, name) => ({ ...all, ...diffCollection(name) }), {});
}

/**
 * Marks changes as synced. Used optimistically before sending and to undo a failed send.
 *
 * @param {Object<string, Object|null>} changes - Changes by path.
 * @param {Object<string, Object|null>} [previous] - Values to restore instead of the changes.
 */
function markSynced(changes, previous) {
    Object.keys(changes).forEach(path => {
        const [name, id] = path.split("/");
        const value = previous ? previous[path] : changes[path];
        if (value === null || value === undefined) delete lastSynced[name][id];
        else lastSynced[name][id] = value;
    });
}

/**
 * Sends all pending changes to Firebase. On failure the changes stay pending,
 * so the next save retries them, and the user is notified.
 * Deleting more than one record in a single save is refused as a safeguard against data loss.
 *
 * @returns {Promise<boolean>} True if the changes were saved.
 */
async function syncChanges() {
    if (!SYNC_ENABLED || !auth.currentUser) return true;
    const changes = collectChanges();
    if (Object.keys(changes).length === 0) return true;
    if (Object.values(changes).filter(value => value === null).length > 1) return reportFailure();
    return sendChanges(changes);
}

/**
 * Writes the changes to Firebase and rolls the synced state back if that fails.
 *
 * @param {Object<string, Object|null>} changes - Changes by path.
 * @returns {Promise<boolean>} True if the changes were saved.
 */
async function sendChanges(changes) {
    const previous = Object.fromEntries(Object.keys(changes).map(path => {
        const [name, id] = path.split("/");
        return [path, lastSynced[name][id] ?? null];
    }));
    markSynced(changes);
    try {
        await saveChanges(changes);
        return true;
    } catch {
        markSynced(changes, previous);
        return reportFailure();
    }
}

/**
 * Notifies the user that saving failed.
 *
 * @returns {boolean} Always false, the result of a failed save.
 */
function reportFailure() {
    showSaveError();
    return false;
}

/**
 * Shows a short notice that the changes could not be saved.
 */
function showSaveError() {
    if (document.getElementById("saveErrorToast")) return;
    const toast = document.createElement("div");
    toast.id = "saveErrorToast";
    toast.className = "save-error-toast";
    toast.textContent = "Changes could not be saved. Please check your connection.";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
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
 * Updates the tasks in the data store and saves them (session storage and Firebase).
 *
 * @param {Object} newTasks - The new task objects keyed by ID.
 * @returns {Promise<boolean>} True if the tasks are saved.
 */
function updateTasks(newTasks) {
    dataStore.tasks = newTasks;
    return saveStore();
}

/**
 * Updates the contacts in the data store and saves them (session storage and Firebase).
 *
 * @param {Object} newContacts - The new contact objects keyed by ID.
 * @returns {Promise<boolean>} True if the contacts are saved.
 */
function updateContacts(newContacts) {
    dataStore.contacts = newContacts;
    return saveStore();
}

/**
 * Adds a new task to the data store and saves it.
 *
 * @param {Object} task - The task without ID.
 * @returns {Promise<boolean>} True if the task is saved.
 */
function addTask(task) {
    if (!dataStore.tasks) dataStore.tasks = {};
    dataStore.tasks[`task${Date.now()}`] = task;
    return saveStore();
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
 * Makes sure the registered user has a shared contact linked to the Firebase UID.
 * An existing contact is left untouched, so there are no duplicates and edits are kept.
 *
 * @param {Object} user - The logged-in user with `name` and `email`.
 * @returns {Promise<boolean>} True if the contact exists and is saved.
 */
function ensureOwnContact(user) {
    if (!auth.currentUser) return Promise.resolve(false);
    if (!dataStore.contacts) dataStore.contacts = {};

    const id = `user_${auth.currentUser.uid}`;
    if (!dataStore.contacts[id]) {
        dataStore.contacts[id] = { name: user.name, email: user.email, phone: "" };
    }
    return saveStore();
}

/**
 * Removes the temporary "You" contact.
 */
function removeCurrentUserContact() {
    if (!dataStore.contacts) return;

    delete dataStore.contacts["currentUser"];
    saveStore();
}


/**
 * Clears the data store and the sync state, e.g. on logout.
 */
function resetDataStore() {
    dataStore = { tasks: null, contacts: null, users: null };
    lastSynced = { tasks: {}, contacts: {} };
}

export {
  initDataStore,
  saveStore,
  getTasks,
  getUsers,
  getContacts,
  updateTasks,
  updateContacts,
  addTask,
  ensureOwnContact,
  injectCurrentUserAsContact,
  removeCurrentUserContact,
  resetDataStore,
  dataStore,
};
