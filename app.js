let express = require("express")();
const http = require("http").Server(express);
const port = process.env.PORT || 5000;
const path = require("path");
const io = require("socket.io")(http);

express.get("/", (req, res) => {
  let options = {
    root: path.join(__dirname, "client"),
  };
  let clientHTML = "index.html";
  res.sendFile(clientHTML, options);
});

let userCount = 0;
let user = {};
io.on("connection", (socket) => {
  console.log(`A user joined the chat`);
  userCount++;
  socket.emit("userCount", `${userCount} Members`);
  socket.on("new-user-joined", (name) => {
    user[socket.id] = name;
    user.name = name;
    socket.broadcast.emit("user-joined", `${name} Joined the chat`);
  });
  socket.on("sendMessage", (value) => {
    socket.broadcast.emit("received-message", value);
  });
  socket.on("disconnect", () => {
    console.log(`User disconnected`);
    userCount--;
    socket.emit("userCount", `${userCount} Members`);
    socket.broadcast.emit("user-left", `${user[socket.id]} left the chat`);
  });
});

http.listen(port, () => {
  console.log(`Connected to port ${port}`);
});
