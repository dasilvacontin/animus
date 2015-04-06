function ensureToggleAnimus () {
  clearTimeout(window.ensureToggleAnimusTimeout)
  if (window.toggleAnimus) {
    window.toggleAnimus()
  } else {
    window.ensureToggleAnimusTimeout = setTimeout(ensureToggleAnimus, 50)
  }
}
ensureToggleAnimus()
