self.addEventListener("push", function (event) {
    const data = event.data ? event.data.json() : {};
  
    event.waitUntil(
      self.registration.showNotification(data.title || "SJSU Free Food", {
        body: data.body || "New free food event found!",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: { url: data.url || "/" },
      })
    );
  });
  
  self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    const url = event.notification.data.url || "/";
    event.waitUntil(clients.openWindow(url));
  });