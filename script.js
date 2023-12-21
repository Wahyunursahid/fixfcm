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
const messaging = firebase.messaging();

function IntitalizeFireBaseMessaging() {
  messaging
      .requestPermission()
      .then(function () {
          console.log("Notification Permission");
          return messaging.getToken();
      })
      .then(function (token) {
          console.log("Token : " + token);
          document.getElementById("token").innerHTML = token;
      })
      .catch(function (reason) {
          console.log(reason);
      });
}

messaging.onMessage(function (payload) {
  console.log(payload);
  const notificationOption = {
      body: payload.notification.body,
      icon: payload.notification.icon
  };

  if (Notification.permission === "granted") {
      var notification = new Notification(payload.notification.title, notificationOption);

      notification.onclick = function (ev) {
          ev.preventDefault();
          window.open(payload.notification.click_action, '_blank');
          notification.close();
      };
  }
});

messaging.onTokenRefresh(function () {
  messaging.getToken()
      .then(function (newtoken) {
          console.log("New Token : " + newtoken);
      })
      .catch(function (reason) {
          console.log(reason);
      }); 
});

IntitalizeFireBaseMessaging();


// fungsi send ke server fcm
function sendNotification() {
  var url = "https://fcm.googleapis.com/fcm/send";

  var fields = {
      to: document.getElementById('token').innerHTML,
      notification: {
          body: document.getElementById('message').value,
          title: document.getElementById('title').value,
          icon: document.getElementById('icon').value,
          click_action: "http://127.0.0.1:5500/"
      }
  };

  var headers = {
      'Authorization': 'key=AAAAvWvK42E:APA91bG6gzvGk_k3cWQTeVhGkxwKCR8fQRAWLQ6qQVXPo3dr_clu6fQqy19fSuYFKjdncFHeEbx2IeuVDjHwCMqOUQ3bHtN9d40nocTTYR_z-UO9ds7VF8H699k30PSgZQe5KMxowRAz',
      'Content-Type': 'application/json'
  };

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
          console.log(this.responseText);
      }
  };

  xhttp.open("POST", url, true);
  xhttp.setRequestHeader("Content-type", "application/json");
  for (var header in headers) {
      xhttp.setRequestHeader(header, headers[header]);
  }

  xhttp.send(JSON.stringify(fields));
}

var db;
        var request = indexedDB.open("KomentarDB", 1);

        request.onerror = function(event) {
            console.log("Gagal membuka database:", event.target.errorCode);
        };

        request.onsuccess = function(event) {
            db = event.target.result;
            console.log("Berhasil membuka database");
            showAllComments();
        };

        request.onupgradeneeded = function(event) {
            db = event.target.result;

            // Membuat object store dengan nama "comments"
            var objectStore = db.createObjectStore("comments", { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("name", "name", { unique: false });
            objectStore.createIndex("email", "email", { unique: false });
            objectStore.createIndex("comment", "comment", { unique: false });
        };

        document.getElementById("comment-form").addEventListener("submit", function(event) {
            event.preventDefault();

            var nameInput = document.getElementById("name-input").value;
            var emailInput = document.getElementById("email-input").value;
            var commentInput = document.getElementById("comment-input").value;

            if (nameInput && emailInput && commentInput) {
                var transaction = db.transaction(["comments"], "readwrite");
                var objectStore = transaction.objectStore("comments");
                var request = objectStore.add({ name: nameInput, email: emailInput, comment: commentInput });

                request.onsuccess = function(event) {
                    console.log("Komentar berhasil disimpan");
                    document.getElementById("name-input").value = "";
                    document.getElementById("email-input").value = "";
                    document.getElementById("comment-input").value = "";
                    showAllComments();
                    // Menampilkan notifikasi
                    showNotification("Anda mendapat pesan baru!");
                };
            }
        });

        function showNotification(message) {
            if ('Notification' in window) {
                Notification.requestPermission().then(function (permission) {
                    if (permission === 'granted') {
                        const notification = new Notification('Pemberitahuan Komentar', {
                            body: message,
                        });
                    }
                });
            }
        }

        // document.addEventListener("DOMContentLoaded", function() {
        //     // Setelah 10 detik, tampilkan notifikasi selamat datang
        //     setTimeout(function() {
        //         showWelcomeNotification("Selamat datang di web CV ! ingin berlangganan ?hubungi kami via whatsapp");
        //     }, 1000); // 10000 milidetik = (10 detik)
        // });
        
        // function showWelcomeNotification(message) {
        //     if ('Notification' in window) {
        //         Notification.requestPermission().then(function (permission) {
        //             if (permission === 'granted') {
        //                 const notification = new Notification('Selamat Datang', {
        //                     body: message,
        //                 });
        //             }
        //         });
        //     }
        // }

        function showAllComments() {
            var transaction = db.transaction(["comments"], "readonly");
            var objectStore = transaction.objectStore("comments");
            var allCommentsList = document.getElementById("all-comments-list");
            allCommentsList.innerHTML = "";

            objectStore.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    var li = document.createElement("li");
                    li.textContent = cursor.value.name + " (" + cursor.value.email + "): " + cursor.value.comment;
                    li.dataset.commentId = cursor.value.id;
                    li.innerHTML += ' <button onclick="editComment(' + cursor.value.id + ')">Edit</button> <button onclick="deleteComment(' + cursor.value.id + ')">Hapus</button>';
                    allCommentsList.appendChild(li);
                    cursor.continue();
                }
            };
        }

        function editComment(commentId) {
            var newComment = prompt("Edit komentar:");
            if (newComment !== null) {
                var transaction = db.transaction(["comments"], "readwrite");
                var objectStore = transaction.objectStore("comments");
                var request = objectStore.get(commentId);
                request.onsuccess = function(event) {
                    var data = event.target.result;
                    data.comment = newComment;
                    objectStore.put(data);
                    showAllComments();
                };
            }
        }

        function deleteComment(commentId) {
            var confirmDelete = confirm("Apakah Anda yakin ingin menghapus komentar ini?");
            if (confirmDelete) {
                var transaction = db.transaction(["comments"], "readwrite");
                var objectStore = transaction.objectStore("comments");
                objectStore.delete(commentId);
                showAllComments();
            }
        }

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('firebase-messaging-sw.js')
                .then(function(registration) {
                    console.log('Service Worker fcm berhasil didaftarkan:', registration);
                })};

                 if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register('sw.js')
                        .then(function(registration) {
                            console.log('Service Worker sw berhasil didaftarkan:', registration);
                        })};