import { ref, get, set, push, update } from 'firebase/database';
import { db } from '../config/firebase.config.js';

const pendingWrites = new Set();
const WRITE_TIMEOUT_MS = 8000;

/**
 * Fetches data from the Firebase Realtime Database.
 * @param {string} [path=""] The path in the database to fetch data from.
 * @return {Promise<null|any>} The fetched data as a JSON object, or null if an error occurred.
 */
async function getData(path = "") {
    try {
        const snapshot = await get(ref(db, path));
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.error("Error loading data:", error);
        return null;
    }
}

/**
 * Writes data to an exact path in the Realtime Database.
 * @param {string} path The path to write to, e.g. "users/<uid>".
 * @param {Object} data The data to store.
 * @return {Promise<void>}
 */
function setData(path, data) {
    return set(ref(db, path), data);
}

/**
 * Generates a unique Firebase push ID for a new record without writing anything.
 * @param {string} path The collection the record will belong to, e.g. "contacts".
 * @return {string} The unique ID.
 */
function createId(path) {
    return push(ref(db, path)).key;
}

/**
 * Rejects after the given time, e.g. when the connection is lost and the write is not confirmed.
 * @param {number} ms Time to wait in milliseconds.
 * @return {Promise<never>}
 */
function timeoutAfter(ms) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error('Write not confirmed')), ms));
}

/**
 * Applies several record-level changes in one request. A value of null deletes the record.
 * The write is tracked, so navigation can wait for it with `flushWrites()`.
 * @param {Object<string, Object|null>} changes Map of "tasks/<id>" or "contacts/<id>" to the new record.
 * @return {Promise<void>} Rejects if the server does not confirm the write in time.
 */
function saveChanges(changes) {
    const write = Promise.race([update(ref(db), changes), timeoutAfter(WRITE_TIMEOUT_MS)]);
    pendingWrites.add(write);
    const forget = () => pendingWrites.delete(write);
    write.then(forget, forget);
    return write;
}

/**
 * Waits until all running writes are finished, successfully or not.
 * @return {Promise<void>}
 */
async function flushWrites() {
    await Promise.allSettled([...pendingWrites]);
}

window.addEventListener('beforeunload', (event) => {
    if (pendingWrites.size === 0) return;
    event.preventDefault();
    event.returnValue = '';
});

export {
  getData,
  setData,
  createId,
  saveChanges,
  flushWrites,
};
