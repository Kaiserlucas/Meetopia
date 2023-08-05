
  //////////
 // LIVE //
//////////

const https = require("https");
const fs = require("fs");

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/meetopia.jursch-it.de/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/meetopia.jursch-it.de/fullchain.pem')
};

const server = https.createServer(options);

const io = require("socket.io")(server, {
  cors: {
      origin: "*",
      methods: ["GET", "POST"],
  }
});

const { PeerServer } = require('peer');
const peerServer = PeerServer({port: 9000, path: '/peerjs', debug: true, ssl: options});

server.listen(process.env.PORT || 4000, () => {
  console.log(`Server is running on port ${process.env.PORT || 4000}`);
});

  /////////
 // DEV //
/////////

// const http = require("http");
// const server = http.createServer();

// const io = require("socket.io")(server, {
//   cors: {
//       origin: "*",
//       methods: ["GET", "POST"],
//   }
// });


// const { PeerServer } = require('peer');
// const peerServer = PeerServer({port: 9000, path: '/peerjs', debug: true});

// server.listen(process.env.PORT || 4000, () => {
//   console.log(`Server is running on port ${process.env.PORT || 4000}`);
// });


  //////////
 // BOTH //
//////////

io.on("connection", (socket) => {
  console.log("New socket connection");

  socket.on("join-room", (roomId, id, name) => {
    console.log("User",name,"joined room",roomId);
      socket.join(roomId);
      socket.to(roomId).emit("user-connected", id, name);
      io.to(roomId).emit("createMessage", "[SERVER] ",name+" ist beigetreten.");

      socket.on("messagesend", (message, name, id) => {
          console.log(message);
          io.to(roomId).emit("createMessage", "["+name+"] ", message, id);
      });

      socket.on("tellName", (myname, id) => {
          console.log(myname, id);
          socket.to(roomId).emit("AddName", myname, id);
      });

      socket.on("ask-names", () => {
        console.log("names have been requested");
        socket.to(roomId).emit("names-requested");
      });

      socket.on("request-streams", (id) => {
        console.log("streams have been requested");
        socket.to(roomId).emit("streams-requested", id);
      });


      socket.on("tellPosition", (id, xPos, yPos, rotation, isMoving) => {
          socket.to(roomId).emit("changedPosition", id, xPos, yPos, rotation,isMoving);
      });

      socket.on("changeHideStatus", (id, isHidden) => {
          console.log("User has a new hide status:",id, isHidden)
          io.to(roomId).emit("changedHideStatus", id, isHidden);
      });

      socket.on("changeMuteStatus", (id, isMuted) => {
        console.log("User has a new mute status:",id, isMuted)
        io.to(roomId).emit("changedMuteStatus", id, isMuted);
      });

      socket.on("disconnect", () => {
          socket.to(roomId).emit("user-disconnected", id);
          io.to(roomId).emit("createMessage", "[SERVER] ",name+" hat den Raum verlassen.");
      });

  });

});

peerServer.on('connection', (client) => { 
  console.log('New peer connection', client.id);
});