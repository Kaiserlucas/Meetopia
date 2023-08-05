import NetworkManager from './NetworkManager'
import PlayerManager from './PlayerManager'
import VideoManager from './VideoManager'
import ChatManager from './ChatManager'

export default class GameManager {

    static instance = null;

    /**
     * @returns {GameManager}
     */
    static getInstance(world, physics, roomId) {
        if (this.instance === null && world && physics) {
            this.instance = new GameManager(world, physics);
            this.instance.playerManager = new PlayerManager(this.instance.world, this.instance.physics);
            this.instance.videoManager = new VideoManager();
            this.instance.networkManager = new NetworkManager(roomId);
            this.instance.chatManager = new ChatManager();
        } 
        return this.instance;
    }
    
    constructor(world, physics) {
        this.world = world;
        this.physics = physics;
    }

    /**
     * @returns {PlayerManager}
     */
    getPlayerManager() {
        return this.playerManager;
    }

    /**
     * @returns {VideoManager}
     */
    getVideoManager() {
        return this.videoManager;
    }

    /**
     * @returns {NetworkManager}
     */
    getNetworkManager() {
        return this.networkManager;
    }

    /**
     * @returns {ChatManager}
     */
    getChatManager() {
        return this.chatManager;
    }

    update(dts) {

    }
}