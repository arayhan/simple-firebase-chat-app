// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7CTGtctq9U5obCLw97asfhKFgaQq1XVQ",
  authDomain: "fir-playground-d241c.firebaseapp.com",
  databaseURL: "https://fir-playground-d241c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fir-playground-d241c",
  storageBucket: "fir-playground-d241c.appspot.com",
  messagingSenderId: "488327897026",
  appId: "1:488327897026:web:089e7b6254d82a3ad1005b",
  measurementId: "G-BQVCL590PZ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference to Firebase services
const auth = firebase.auth();
const database = firebase.database();
const messaging = firebase.messaging();

// ========================================================
// Firebase Auth
// ========================================================

// Sign up function
function signUp() {
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;

  auth.createUserWithEmailAndPassword(email, password)
  .then((userCredential) => {
      // Hide authDiv and show chatDiv
      document.getElementById('authDiv').style.display = "none";
      document.getElementById('chatDiv').style.display = "block";
  })
  .catch((error) => {
      console.error("Error signing up:", error);
  });
}

// Sign in function
function signIn() {
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;

  auth.signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
      // Hide authDiv and show chatDiv
      document.getElementById('authDiv').style.display = "none";
      document.getElementById('chatDiv').style.display = "block";
  })
  .catch((error) => {
      console.error("Error signing in:", error);
  });
}

function logout() {
  auth.signOut().then(function() {
      alert("Logged out successfully!");
      // Here, you might want to navigate to a login page or just update the UI to show the login form again.
  }).catch(function(error) {
      console.error("Logout failed:", error);
  });
}

// Check authentication state
auth.onAuthStateChanged((user) => {
  if (user) {
      // User is signed in, so show chatDiv and hide authDiv
      document.getElementById('authDiv').style.display = "none";
      document.getElementById('chatDiv').style.display = "block";
  } else {
      // User is not signed in, so show authDiv and hide chatDiv
      document.getElementById('authDiv').style.display = "block";
      document.getElementById('chatDiv').style.display = "none";
  }
});

auth.onAuthStateChanged((user) => {
  if (user) {
      // User is signed in
      console.log("User signed in:", user.email);
  } else {
      // User is signed out
  }
});

// ========================================================
// Sending and receiving messages
// ========================================================
function sendMessage() {
  var messageContent = document.getElementById('messageInput').value;
  var user = auth.currentUser;
  
  var message = {
      text: messageContent,
      uid: user.uid,
      displayName: user.displayName,
      timestamp: firebase.database.ServerValue.TIMESTAMP // store timestamp for sorting & displaying
  };
  
  database.ref('messages').push(message);
  document.getElementById('messageInput').value = '';
}

database.ref('messages').on('child_added', function(snapshot) {
  console.log("New message added!");
  var message = snapshot.val();
  var node = document.createElement("div");
  if (message.uid === auth.currentUser.uid) {
      node.className = "ownMessage";
  } else {
      // Notify other user via FCM
      messaging.getToken().then((currentToken) => {
          if (currentToken) {
              // Send the token to your server and update the UI if necessary
              sendNotificationToServer(currentToken, message);
          } else {
              console.log('No registration token available. Request permission to generate one.');
          }
      }).catch((err) => {
          console.log('An error occurred while retrieving token. ', err);
      });
  }
  node.innerHTML = message.text;
  document.getElementById('messages').appendChild(node);
});

// Listen for new messages and display them
database.ref('messages').on('child_added', function(snapshot) {
  var message = snapshot.val();
  var messageDiv = document.createElement("div");
  messageDiv.className = "message";
  
  var nameSpan = document.createElement("span");
  nameSpan.textContent = message.displayName + ": ";
  messageDiv.appendChild(nameSpan);

  var contentPara = document.createElement("p");
  contentPara.textContent = message.text;
  messageDiv.appendChild(contentPara);

  document.getElementById('messages').appendChild(messageDiv);
});

function displayMessage(message) {
    const chatMessages = document.getElementById("chatMessages");
    const messageElem = document.createElement("div");
    messageElem.textContent = message.text;
    chatMessages.appendChild(messageElem);
}

// Firebase Cloud Messaging
messaging.onMessage((payload) => {
  console.log("Received message:", payload);
});
