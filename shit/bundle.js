var sockets = []

function forEachSocket (cb) {
	for (var i = 0; i < sockets.length; ++i) {
		var socket = sockets[i]
		cb(socket)
	}
}

function broadcastMessage (msg) {
	console.log(msg)
	forEachSocket(function (socket) {
		socket.postMessage(msg)
	})
}

chrome.commands.onCommand.addListener(function (command) {
	broadcastMessage('Command: ' + command)
})

chrome.runtime.onConnect.addListener(function (socket) {
	sockets.push(socket)
	socket.postMessage('Yo!')
	socket.postMessage(JSON.stringify(socket))
})

setInterval(function () {
	broadcastMessage('kek')
}, 2000)