importScripts('https://www.gstatic.com/firebasejs/7.14.6/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.14.6/firebase-messaging.js');

var firebaseConfig = {
        apiKey: "AIzaSyAwbPYg-1smNYn1SNGg4lLwGIImAPZ-r_Y",
        authDomain: "tugas-fcm-b3866.firebaseapp.com",
        projectId: "tugas-fcm-b3866",
        storageBucket: "tugas-fcm-b3866.appspot.com",
        messagingSenderId: "813557277537",
        appId: "1:813557277537:web:75092a29683f65afb99b20",
        measurementId: "G-WQB5YL9NYF"
};

firebase.initializeApp(firebaseConfig);
const messaging=firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
    console.log(payload);
    const notification=JSON.parse(payload);
    const notificationOption={
        body:notification.body,
        icon:notification.icon
    };
    return self.registration.showNotification(payload.notification.title,notificationOption);
}); 