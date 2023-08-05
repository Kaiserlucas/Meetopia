import GameManager from './GameManager'
import { v4 as uuidv4 } from 'uuid';

export default class NetworkManager {
    constructor(roomId) {
        this.playerManager = GameManager.getInstance().getPlayerManager();
        this.videoManager = GameManager.getInstance().getVideoManager();
        this.myVideoStream = null;
        this.id = uuidv4();

        if(roomId) {
            this.roomId = roomId
        } else {
            this.roomId = uuidv4();
        } 

        //Setup

        //Dev
        // const socket = io("192.168.185.31:4000/", {withCredentials: false});
        //Live
        const socket = io("https://meetopia.jursch-it.de:4000/", {withCredentials: false});
        this.socket = socket;
        
        this.peer = new Peer(this.id, {
            path: "/peerjs",
            host: "/",
            port: "9000",
        });
        this.peers = {};

        this.peer.on("open", (id) => {
            this.playerManager.setMainPlayerId(this.id);

            if(navigator.mediaDevices) {
                navigator.mediaDevices.getUserMedia({video: true,audio: true})
                .then((stream) => {
                    this.myVideoStream = stream;
                    this.videoManager.addMyVideo(stream, this.id, this.playerManager.getMainPlayerName(), true);
                    this.videoManager.unhideVideo(this.id);

                    this.peer.on("call", (call) => {
                        call.answer(this.myVideoStream);
                        call.on("stream", (userVideoStream) => {
                            if(!this.videoManager.doesVideoExist(call.peer)) {
                                this.videoManager.addVideo(userVideoStream, call.peer, "" );
                                this.videoManager.unhideVideo(call.peer);
                                this.videoManager.enableVideo(call.peer);
                            }
                            if(!this.playerManager.doesPlayerExist(call.peer)) {
                                this.playerManager.addPlayer(0,0,"",call.peer);
                            }
                        });
                    });

                    socket.on("user-connected", (otherUserId, newUsername) => {
                        connectToNewUser(otherUserId, this.myVideoStream, newUsername);
                    });

                    socket.on("streams-requested", (userId) => {
                        this.peer.call(userId, stream);
                    });
                })
                .catch((error) => {
                    console.log("Failed to get camera access: ", error);
                    this.handleAbsenceOfCamera();
                })
                .finally(() => {
                    this.finalSetup();
                });
            } else {
                console.log("Webcam not available");
                this.handleAbsenceOfCamera();
                this.finalSetup();
            }
        });

        const connectToNewUser = (userId, stream, newUsername) => {
            const call = this.peer.call(userId, stream);
            call.on("stream", (userVideoStream) => {
                if(!this.videoManager.doesVideoExist(userId)) {
                    this.videoManager.addVideo(userVideoStream, userId, newUsername );
                    this.videoManager.unhideVideo(userId);
                    this.videoManager.unmuteVideo(userId);
                    this.videoManager.enableVideo(userId);
                    this.videoManager.tellState();
                }
                if(!this.playerManager.doesPlayerExist(call.peer)) {
                    this.playerManager.addPlayer(0,0,newUsername, userId);
                }
                socket.emit("tellName", this.playerManager.getMainPlayerName(), this.id);
            });
            this.peers[userId] = call;
        };

        socket.on("AddName", (username, id) => {
            if(this.playerManager.doesPlayerExist(id)) {
                this.playerManager.changeUserName(username, id);
                this.videoManager.changeUsername(username, id);
            } else {
                this.playerManager.addPlayer(0,0,username,id);
            }

        });

        socket.on("changedPosition", (id, xPos, yPos, rotation, isMoving) => {
            this.playerManager.changeUserPosition(id, xPos, yPos, rotation , isMoving);
        });

        socket.on("createMessage", (sender, message, id) => {
        
            const newMessage = document.createElement('p');
            newMessage.className = "message";
        
            const senderSpan = document.createElement('span');
            senderSpan.textContent = sender;
            senderSpan.style.color = "gray";
        
            const messageText = document.createTextNode(": " + message);
        
            newMessage.appendChild(senderSpan);
            newMessage.appendChild(messageText);
        
            const messagesContainer = document.getElementById('messagesContainer');
            if(messagesContainer) {
                messagesContainer.appendChild(newMessage);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }

            this.playerManager.setMessageForPlayer(id, message);
        });

        socket.on("changedHideStatus", (id, isHidden) => {
            if(isHidden) {
                this.videoManager.hideVideo(id);
            } else {
                this.videoManager.unhideVideo(id);
            }
        });

        socket.on("changedMuteStatus", (id, isMuted) => {
            if(isMuted) {
                this.videoManager.muteVideo(id);
            } else {
                this.videoManager.unmuteVideo(id);
            }
        });

        this.videoManager.setSocket(socket);

    }

    handleAbsenceOfCamera() {
        this.socket.on("user-connected", (otherUserId, newUsername) => {
            this.playerManager.addPlayer(0,0,newUsername, otherUserId);
            this.socket.emit("request-streams", this.id)
            this.socket.emit("tellName", this.playerManager.getMainPlayerName(), this.id);
        });
        this.peer.on("call", (call) => {
            call.answer();
            call.on("stream", (userVideoStream) => {
                if(!this.videoManager.doesVideoExist(call.peer)) {
                    this.videoManager.addVideo(userVideoStream, call.peer, "" );
                    this.videoManager.unhideVideo(call.peer);
                    this.videoManager.enableVideo(call.peer);
                }
                if(!this.playerManager.doesPlayerExist(call.peer)) {
                    this.playerManager.addPlayer(0,0,"",call.peer);
                }
                this.socket.emit("ask-names");
            });
        });
    }

    finalSetup() {
        this.socket.emit("join-room", this.roomId, this.id, this.playerManager.getMainPlayerName());
        this.socket.emit("tellName", this.playerManager.getMainPlayerName(), this.id);

        this.socket.on("user-disconnected", (id) => {
            if (this.peers[id]) this.peers[id].close();
            this.videoManager.removeVideo(id);
            this.playerManager.removePlayer(id);
        });

        this.socket.on("names-requested", () => {
            this.socket.emit("tellName", this.playerManager.getMainPlayerName(), this.id);
        });
    }

    update(dts) {
        this.socket.emit("tellPosition", this.id, this.playerManager.getMainPlayerXCoord(), this.playerManager.getMainPlayerYCoord(), this.playerManager.getMainPlayerRotation(), this.playerManager.isMainPlayerMoving());
    }

    getSocket() {
        return this.socket;
    }

    dispose() {
        super.dispose();
    }
}