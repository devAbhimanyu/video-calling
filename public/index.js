const socket = io("/");
const streamGrid = document.getElementById("call-grid");
const myPeer = new Peer(undefined, {
  host: "/",
  port: "4001",
});

const callSpace = document.createElement("video");
callSpace.muted = true;

const users = {};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(callSpace, stream);
    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    socket.on("connect-user", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

socket.on("disconnect-user", (userId) => {
  if (users[userId]) users[userId].close();
});

myPeer.on("open", (id) => {
  socket.emit("connect-room", ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  users[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  streamGrid.append(video);
}
