const firebaseConfig = {
  apiKey: "AIzaSyB4AqPu5QEfHE_XKKw-HmPq1bY9H6wWXlk",
  authDomain: "rendora-the-game.firebaseapp.com",
  databaseURL: "https://rendora-the-game-default-rtdb.firebaseio.com",
  projectId: "rendora-the-game",
  storageBucket: "rendora-the-game.appspot.com",
  messagingSenderId: "25995174738",
  appId: "1:25995174738:web:e48775c57d6e201517d08b",
  measurementId: "G-W0YDNYYHLY"
};

// sistem autorisasi Rendora: login, register, logout, verifikasi email
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();