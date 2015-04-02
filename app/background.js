var sockets = []

function forEachSocket (cb) {
	for (var i = 0; i < sockets.length; ++i) {
		var socket = sockets[i]
		cb(socket)
	}
}

function broadcastMessage (msg) {
	console.log('broadcast msg:', msg)
	forEachSocket(function (socket) {
		socket.postMessage(msg)
	})
}

chrome.commands.onCommand.addListener(function (command) {
	console.log('command:', command)
	broadcastMessage(command)
})

chrome.runtime.onConnect.addListener(function (socket) {
	console.log('new socket')
	sockets.push(socket)
	socket.onDisconnect.addListener(function () {
		var i = sockets.indexOf(socket)
		if (i > -1) sockets.splice(i, 1)
	})
})

console.log('voila!')
