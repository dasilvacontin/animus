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
    toggleTab(activeTab)
  })
})

chrome.browserAction.onClicked.addListener(function (tab) {
  console.log(tab)
  toggleTab(tab)
})

function toggleTab (tab) {
  chrome.tabs.executeScript(tab.id, {
    file: 'toggler.js'
  })
}
