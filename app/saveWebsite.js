function ensureAnimusSaveWebsite () {
  clearTimeout(window.ensureAnimusSaveWebsiteTimeout)
  if (window.AnimusSaveWebsite) {
    window.AnimusSaveWebsite()
  } else {
    window.ensureAnimusSaveWebsiteTimeout = setTimeout(ensureAnimusSaveWebsite, 50)
  }
}
ensureAnimusSaveWebsite()
