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

// konversi snapshot data hasil query firebase ke bentuk object array
function snapshotToArray(snapshot) {
  var hasilArr = [];
  snapshot.forEach(function(childSnapshot) {
      var item = childSnapshot.val();
      item.key = childSnapshot.key;
      hasilArr.push(item);
  });
  return hasilArr;
};

// sistem autorisasi Rendora: login, register, logout, verifikasi email
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

function logout() {
  firebase
      .auth()
      .signOut()
      .then(function () {
          alert("Logout Berhasil!");
          window.location.href = "login";
      })
      .catch(function (error) {
          alert("Logout Error! " + error);
      });
}

function register() {
  email = document.getElementById("email_reg").value;
  password = document.getElementById("password_reg").value;
  full_name = document.getElementById("namalengkap").value;
  username = document.getElementById("username").value;
  if (
      validate_email(email) == false ||
      validate_password(password) == false
  ) {
      alert("Periksa lagi password maupun emailmu!");
      return;
  }
  if (validate_field(full_name) == false || validate_field(username) == false) {
      alert("Periksa lagi nama lengkap dan juga usernamemu!");
      return;
  }
  auth.createUserWithEmailAndPassword(email, password)
  .then(function () {
      auth.createUserWithEmailAndPassword(email, password);
      var user = auth.currentUser;
      var database_ref = database.ref();
      var user_data = {
          Username: username,
          BestScore: 0,
          Email: email,
          NamaLengkap: full_name,
          LastLogin: Date.now(),
      };
      database_ref.child("Players/" + user.uid).set(user_data);
      user.sendEmailVerification()
      .then(function () {
          alert(
              "Link verifikasi sudah terkirim di emailmu. Klik link tersebut untuk dapat mengakses Rendora!"
          );
      })
      .catch(function (error) {
          alert("Error: " + error + "!");
      });
  })
  .catch(function (error) {
      var error_message = error.message;
      alert(error_message);
  });
}

function login() {
  email = document.getElementById("email").value;
  password = document.getElementById("password").value;
  if (
      validate_email(email) == false ||
      validate_password(password) == false
  ) {
      alert("Email or Password is Outta Line!!");
      return;
  }

  auth.signInWithEmailAndPassword(email, password)
      .then(function () {
          var user = auth.currentUser;
          var database_ref = database.ref();
          var user_data = {
              LastLogin: Date.now(),
          };
          database_ref.child("Players/" + user.uid).update(user_data);
          window.location.href = "onboarding.html";
      })
      .catch(function (error) {
          var error_message = error.message;
          alert(error_message);
      });
}

// validasi input user di webnya
function validate_email(email) {
  expression = /^[^@]+@\w+(\.\w+)+\w$/;
  if (expression.test(email) == true) {
      return true;
  } else {
      return false;
  }
}

function validate_password(password) {
  if (password < 6) {
      return false;
  } else {
      return true;
  }
}

function validate_field(field) {
  if (field == null) {
      return false;
  }

  if (field.length <= 0) {
      return false;
  } else {
      return true;
  }
}
