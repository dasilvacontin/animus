var socket = chrome.runtime.connect()
socket.onMessage.addListener(function (msg) {
	console.log(msg)
})