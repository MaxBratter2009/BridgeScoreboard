const firebaseConfig = {
  apiKey: "AIzaSyBNECqv7OBTKaOMgr0nLEHl8q3S5TMdIhk",
  authDomain: "drdavies-eb468.firebaseapp.com",
  databaseURL: "https://drdavies-eb468-default-rtdb.firebaseio.com",
  projectId: "drdavies-eb468",
  storageBucket: "drdavies-eb468.firebasestorage.app",
  messagingSenderId: "702996008005",
  appId: "1:702996008005:web:c83322e88583f8f786e72c",
  measurementId: "G-WH0W83ZCCE"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const teamsRef = db.ref('teams');
