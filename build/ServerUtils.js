import { constants } from "./index.js";
/**
 * Holds a server and provides information about the latest update, if there has been an update
 * since the last time a client checked.
 */
var ServerUpdateManager = /** @class */ (function () {
    /**
     * Constructs a new ServerUpdateManager that has no initial updates.
     * @param serverUpdateProvider whatever the source of information is, whether an actual server or
     * a local server with mock data (i.e. ServerMock).
     */
    function ServerUpdateManager(serverUpdateProvider) {
        var _this = this;
        /**
         * Returns if there's been a new update since the last time the client got an update
         */
        this.hasUpdate = function () { return _this.hasUpdateFlag; };
        /**
         * Gets the most recent update. Calling this will make hasUpdate() return false.
         */
        this.getUpdate = function () {
            _this.hasUpdateFlag = false;
            return _this.mostRecentUpdate;
        };
        /**
         * Register a new update with this update manager
         */
        this.acceptUpdate = function (update) {
            _this.hasUpdateFlag = true;
            _this.mostRecentUpdate = update;
        };
        /**
         * Tells the server that we're ready to get updates at which point, it will provide us with a
         * stream of updates.
         */
        this.beginRequestingUpdates = function () {
            _this.serverUpdateProvider.addUpdateListener(_this.acceptUpdate);
            _this.serverUpdateProvider.startProvidingUpdates();
        };
        this.serverUpdateProvider = serverUpdateProvider;
        this.hasUpdateFlag = false;
        this.mostRecentUpdate = {
            players: [],
            bullets: []
        };
    }
    return ServerUpdateManager;
}());
export { ServerUpdateManager };
/**
 * A class that will help us visually test our code by mocking input from the server.
 */
var ServerMock = /** @class */ (function () {
    function ServerMock() {
        var _this = this;
        /**
         * Starts providing mock data
         */
        this.startProvidingUpdates = function () {
            _this.oneSecondSineMotion();
        };
        /**
         * Add the given update callback to call when we receive a new update from the server
         */
        this.addUpdateListener = function (onUpdate) {
            _this.updateObservers.push(onUpdate);
        };
        /**
         * Provide the given update to all observers to this server
         */
        this.broadcastUpdate = function (update) {
            _this.updateObservers.forEach(function (updateObserver) { return updateObserver(update); });
        };
        /**
         * Provides some manually defined updates to the server manager at a rate of one second.
         */
        this.oneSecIntervalUpdates = function () {
            var mockData = [
                {
                    players: [{
                            id: 'example player id',
                            position: { x: 0, y: 0 },
                            velocity: { x: 200, y: 200 },
                            acceleration: { x: 0, y: -50 },
                            orientation: 0,
                            cooldown: 0,
                        }],
                    bullets: []
                },
                {
                    players: [{
                            id: 'example player id',
                            position: { x: 100, y: 100 },
                            velocity: { x: 5, y: 5 },
                            acceleration: { x: 0, y: 0 },
                            orientation: Math.PI,
                            cooldown: 0,
                        }],
                    bullets: []
                },
                {
                    players: [{
                            id: 'example player id',
                            position: { x: 100, y: 50 },
                            velocity: { x: 0, y: 0 },
                            acceleration: { x: 0, y: 0 },
                            orientation: 2 * Math.PI,
                            cooldown: 0,
                        }],
                    bullets: [{
                            id: 'example bullet id',
                            position: { x: 50, y: 50 },
                            velocity: { x: 30, y: 5 }
                        }]
                },
            ];
            var i = 0;
            setInterval(function () {
                if (i < mockData.length) {
                    _this.broadcastUpdate(mockData[i]);
                    i++;
                }
            }, 1000);
        };
        this.oneSecondSineMotion = function () {
            var flag = true;
            var sineMotion = function (toggleFlag) {
                if (toggleFlag) {
                    return {
                        players: [{
                                id: 'example player id',
                                position: { x: 0, y: 0 },
                                velocity: { x: 300, y: 300 },
                                acceleration: { x: 0, y: 0 },
                                orientation: 0,
                                cooldown: 0,
                            }],
                        bullets: []
                    };
                }
                else {
                    return {
                        players: [{
                                id: 'example player id',
                                position: { x: 300, y: 300 },
                                velocity: { x: -300, y: -300 },
                                acceleration: { x: 0, y: 0 },
                                orientation: 0,
                                cooldown: 0,
                            }],
                        bullets: []
                    };
                }
            };
            setInterval(function () {
                _this.broadcastUpdate(sineMotion(flag));
                flag = !flag;
            }, 1000);
        };
        this.updateObservers = [];
    }
    return ServerMock;
}());
export { ServerMock };
/**
 * A message receiver for the live server.
 */
var LiveServer = /** @class */ (function () {
    function LiveServer() {
        var _this = this;
        this.addUpdateListener = function (listener) {
            _this.updateObservers.push(listener);
        };
        this.startProvidingUpdates = function () {
            var webSocket = new WebSocket(constants.SERVER_SOCKET_URL);
            webSocket.onclose = function () { return console.log('socket closed'); };
            webSocket.onerror = function (e) { return console.log('Error:', e); };
            webSocket.onopen = function () {
                console.log('Server connected successfully');
                // Keep track of which keys are down at any point in time and emit a message to server when
                // keys are pressed
                document.addEventListener('keydown', function (e) {
                    _this.keysDown.push(e.key.toLowerCase());
                    webSocket.send(_this.keysDown.join(','));
                });
                document.addEventListener('keyup', function (e) {
                    _this.keysDown = _this.keysDown.filter(function (key) { return key != e.key.toLowerCase(); });
                    webSocket.send(_this.keysDown.join(','));
                });
                webSocket.onmessage = function (e) {
                    var message = e.data;
                    if (message == 'some message title') {
                        console.log(message);
                    }
                };
            };
            // // Connect to remote socket for AI and multiplayer functionality
            // const socket = (window as any).io(constants.SERVER_SOCKET_URL) as Socket;
            // socket.on('connection', (socket: Socket) => {
            //   console.log('Server connected successfully');
            //   // Keep track of which keys are down at any point in time and emit a message to server when
            //   // keys are pressed
            //   document.addEventListener('keydown', (e) => {
            //     this.keysDown.push(e.key.toLowerCase());
            //     socket.emit(this.keysDown.join(','));
            //   });
            //   document.addEventListener('keyup', (e) => {
            //     this.keysDown = this.keysDown.filter((key) => key != e.key.toLowerCase());
            //     socket.emit(this.keysDown.join(','));
            //   });
            //   // TODO
            //   socket.on('some message title sent from the server', (data) => {
            //     // this is where I take `data` and broadcast an update
            //   });
            //   socket.on('disconnect', () => {
            //     console.log('Server disconnected');
            //   });
            // });
        };
        /**
         * Provide the given update to all observers to this server
         */
        this.broadcastUpdate = function (update) {
            _this.updateObservers.forEach(function (updateObserver) { return updateObserver(update); });
        };
        this.updateObservers = [];
        this.keysDown = [];
    }
    return LiveServer;
}());
export { LiveServer };
//# sourceMappingURL=ServerUtils.js.map