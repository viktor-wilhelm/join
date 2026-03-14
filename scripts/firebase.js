import { ref, get, push } from 'firebase/database';
import { db } from '../config/firebase.config.js';

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
 * Posts data to the Firebase Realtime Database.
 * @param {string} [path="users"] The path in the database to post data to.
 * @param {Object} [data={}] The data to be posted.
 * @return {Promise<any>} The response from the server as a JSON object.
 */
async function postData(path, data) {
    try {
        const newRef = await push(ref(db, path), data);
        return { name: newRef.key };
    } catch (error) {
        console.error("Error posting data:", error);
    }
}

export {
  getData,
  postData,
};
