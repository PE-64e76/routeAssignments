importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDo9cc3rgZAwclpQ7BUjJ73vZBGf66tOxI",
  authDomain: "my-projects-94bb7.firebaseapp.com",
  projectId: "my-projects-94bb7",
  storageBucket: "my-projects-94bb7.firebasestorage.app",
  messagingSenderId: "251276392283",
  appId: "1:251276392283:web:83e62fe9994cff89af4c7e",
  measurementId: "G-X3XEMEYV2D"
});

const messaging = firebase.messaging();

// ✅ Background Notifications
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message:", payload);

  self.registration.showNotification(
    payload.data?.title || "New Notification",
    {
      body: payload.data?.body || "You have a message",
      icon: "/firebase-logo.png"
    }
  );
});