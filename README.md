<div style="text-align:center"><img src="https://github.com/dasilvacontin/animus/raw/master/screenshots/demo.png" width="1191"></div>

# animus

[![travis][travis-image]][travis-url]
[![js-standard-style][standard-image]][standard-url]

[travis-image]: https://travis-ci.org/dasilvacontin/animus.svg?style=flat
[travis-url]: https://travis-ci.org/dasilvacontin/animus
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat
[standard-url]: https://github.com/feross/standard

Chrome Extension for instantly storing and filtering your ideas, todos, links, check-laters.

[Install](https://chrome.google.com/webstore/detail/animus/hhlengghgfcjkfkfaocfnimlhnkjddch) the Chrome Extension, and help us make it better!

## Features

- **Hashtags and URLs** are parsed from the entries' text
- Fully usable via **keyboard shortcuts**
- **Filter** entries by text and hashtags
- **Storage sync** with your Google Account
- **Quickly opens** using a single command

## Keyboard Shortcuts

- `Ctrl+Shift+A` - Default command for toggling animus (open/close)
- `j` - Select next entry
- `k` - Select previous entry
- `tab` - Switch focus between the input field and the list
- `a`, add - Switch focus to input field
- `enter` - Insert input field's text as a new entry
- `e`, edit - Edits the selected entry
- `d`, delete/done - Deletes the selected entry
- `f`, follow link - Opens the selected entry's link in a new tab
- `esc` - Close animus

You can change/set a custom command for toggling animus in the **Keyboard shortcuts** configuration modal at the bottom of the [Chrome Extensions](chrome://extensions/) page.

## Roadmap

- Make it fully usable without the need of key shortcuts
- Command for saving current website title and url as an entry
- GitHub integrations, eg repo/issue/PR status in entries with a GH link
- Translucent background
- Progress bars for entries
- Reminders via natural language processing
- Tests, specially those related to editing the database

## License

MIT. Copyright (c) [David da Silva Contin](http://dasilvacont.in).

<img src="https://github.com/dasilvacontin/animus/raw/master/app/img/logo384.png" width="192">
