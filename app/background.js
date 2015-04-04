/* global chrome */
console.log('voila!')

chrome.commands.onCommand.addListener(function (command) {
  console.log('command:', command)
  chrome.tabs.query({
    active: true, // the active tab
    lastFocusedWindow: true // in the active window
  }, function (tabArray) {
    var activeTab = tabArray[0]
    if (!activeTab) throw new Error('no active tab (?)')
    chrome.tabs.executeScript(activeTab.id, {
      code: 'toggleAnimus()'
    })
  })
})
