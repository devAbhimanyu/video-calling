const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/", (req, res) => {
  console.log("new request");
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("connect-room", (roomId, user) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("connect-user", user);

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("disconnect-user", user);
    });
  });
});
server.listen(4000, () => {
  console.log("listening to port 4000");
});
