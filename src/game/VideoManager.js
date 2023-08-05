import * as PIXI from 'pixi.js';

export default class VideoManager {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'video-container';
        document.body.appendChild(this.container);

        this.controlsContainer = document.createElement('div');
        this.controlsContainer.id = 'controls-container';
        document.body.appendChild(this.controlsContainer);

        this.muteButton = document.createElement('button');
        this.muteButton.id = 'mute-button';
        this.muteButton.innerHTML = '<i class="fas fa-microphone"></i>';
        this.muteButton.title = "Mikrofon ausschalten"
        this.controlsContainer.appendChild(this.muteButton);

        this.hideButton = document.createElement('button');
        this.hideButton.id = 'hide-button';
        this.hideButton.innerHTML = '<i class="fas fa-video"></i>';
        this.hideButton.title = "Video ausschalten"
        this.controlsContainer.appendChild(this.hideButton);

        this.muteButton.addEventListener('click', () => this.muteSelf());
        this.hideButton.addEventListener('click', () => this.hideSelf());

        this.isMuted = false;
        this.videoisHidden = false;
        this.allVideos = new Map();

    }

    addMyVideo(stream, id, name) {
        this.myStream = stream;
        this.myVideoId = id;
        let video = this.addVideo(stream, id, name, true);
        video.muted = true;
        this.enableVideo(id);
    }

    addVideo(stream, id, name, mirrored) {
        let videoWrapper = document.createElement('div');
        videoWrapper.className = 'video-wrapper';
    
        let video = document.createElement('video');
        video.style.display = 'none';
        if (mirrored) {
            video.style.transform = 'scaleX(-1)';
        }
        video.autoplay = true;
        video.playsInline = true;
        video.id = id;
        video.srcObject = stream;
    
        let label = document.createElement('span');
        label.className = 'video-label';
        label.textContent = name;
    
        let muteIcon = document.createElement('i');
        muteIcon.className = 'fas fa-microphone-slash video-muted-icon';
        muteIcon.style.display = 'none';
    
        videoWrapper.appendChild(video);
        videoWrapper.appendChild(label);
        videoWrapper.appendChild(muteIcon);
    
        this.allVideos.set(id, videoWrapper);
        return video;
    }
    
    removeVideo(id) {
        if (this.allVideos.has(id)) {
            let videoWrapper = this.allVideos.get(id);
            if (videoWrapper.parentNode === this.container) {
                this.container.removeChild(videoWrapper);
            }
            this.allVideos.delete(id);
        }
    }

    enableVideo(id) {
        let videoWrapper = this.allVideos.get(id);
        if (videoWrapper && videoWrapper.parentNode !== this.container) {
            this.container.appendChild(videoWrapper);
            let video = videoWrapper.querySelector('video');
            if (video) {
                video.play();
            }
        }
    }

    disableVideo(id) {
        let videoWrapper = this.allVideos.get(id);
        if (videoWrapper && videoWrapper.parentNode === this.container) {
            this.container.removeChild(videoWrapper);
        }
    }

    muteVideo(id) {
        let videoWrapper = this.allVideos.get(id);
        if (videoWrapper) {
            let video = videoWrapper.querySelector('video');
            let muteIcon = videoWrapper.querySelector('.video-muted-icon');
            muteIcon.style.display = 'block';
            video.muted = true;
        }
    }
    
    unmuteVideo(id) {
        let videoWrapper = this.allVideos.get(id);
        if (videoWrapper) {
            let video = videoWrapper.querySelector('video');
            let muteIcon = videoWrapper.querySelector('.video-muted-icon');
            muteIcon.style.display = 'none';
            if(id != this.myVideoId) {
                video.muted = false;
            }
        }
    }
    
    hideVideo(id) {
        let videoWrapper = this.allVideos.get(id);
        if (videoWrapper) {
            let video = videoWrapper.querySelector('video');
            video.style.display = 'none';
            videoWrapper.style.display = 'none';
        }
    }
    
    unhideVideo(id) {
        let videoWrapper = this.allVideos.get(id);
        if (videoWrapper) {
            let video = videoWrapper.querySelector('video');
            video.style.display = 'block';
            videoWrapper.style.display = 'block';
        }
    }

    muteSelf() {
        this.isMuted = !this.isMuted
        this.muteButton.innerHTML = this.isMuted ? '<i class="fas fa-microphone-slash red-icon"></i>' : '<i class="fas fa-microphone"></i>';
        this.socket.emit("changeMuteStatus", this.myVideoId, this.isMuted);
        
        if(isMuted) {
            this.hideButton.title = "Mikrofon ausschalten"
        } else {
            this.hideButton.title = "Mikrofon einschalten"
        }
    }
    
    hideSelf() {
        if (this.myStream) {
            let videoTracks = this.myStream.getVideoTracks();
            if (videoTracks.length > 0) {
                let isEnabled = videoTracks[0].enabled;
                videoTracks.forEach(track => track.enabled = !isEnabled);
                this.hideButton.innerHTML = videoTracks[0].enabled ? '<i class="fas fa-video"></i>' : '<i class="fas fa-video-slash red-icon"></i>';
                this.socket.emit("changeHideStatus", this.myVideoId, isEnabled);
                this.videoisHidden = isEnabled;

                if(isEnabled) {
                    this.hideButton.title = "Video einschalten"
                } else {
                    this.hideButton.title = "Video ausschalten"
                }
            }
        }
    }

    setSocket(socket) {
        this.socket = socket;
    }

    changeUsername(username, id) {
        let video = document.getElementById(id);
    
        if (video) {
            let videoWrapper = video.parentNode;
            let label = videoWrapper.querySelector('.video-label');
            if (label) {
                label.textContent = username;
            }
        }
    }

    doesVideoExist(id) {
        let videoWrapper = this.allVideos.get(id);
        return videoWrapper !== undefined;
    }

    tellState() {
        this.socket.emit("changeMuteStatus", this.myVideoId, this.isMuted);
        this.socket.emit("changeHideStatus", this.myVideoId, this.videoisHidden);
    }
}