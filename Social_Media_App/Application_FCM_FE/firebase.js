const firebaseConfig = {
  apiKey: "AIzaSyDo9cc3rgZAwclpQ7BUjJ73vZBGf66tOxI",
  authDomain: "my-projects-94bb7.firebaseapp.com",
  projectId: "my-projects-94bb7",
  storageBucket: "my-projects-94bb7.firebasestorage.app",
  messagingSenderId: "251276392283",
  appId: "1:251276392283:web:83e62fe9994cff89af4c7e",
  measurementId: "G-X3XEMEYV2D"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

export { messaging };