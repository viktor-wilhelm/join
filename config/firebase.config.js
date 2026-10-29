/**
 * @fileoverview Firebase initialization and configuration for Realtime Database
 * @description This module initializes the Firebase app with the provided configuration
 * and exports the Realtime Database instance for use in other parts of the application.
 * @module config/firebase.config
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB464O5d1meelyrtO-0MZK0ajdmal7E-BU",
  authDomain: "join-92b31.firebaseapp.com",
  databaseURL: "https://join-92b31-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "join-92b31",
  storageBucket: "join-92b31.firebasestorage.app",
  messagingSenderId: "302488060390",
  appId: "1:302488060360:web:1384f5dd18136dec411627",
  measurementId: "G-DNJSJ0P7XD"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Local testing only: run `npm run emulators`, then set localStorage.joinUseEmulator = "1" on localhost.
if (location.hostname === 'localhost' && localStorage.getItem('joinUseEmulator') === '1') {
  connectDatabaseEmulator(db, '127.0.0.1', 9000);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}

export { db, auth };
