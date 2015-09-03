module.exports = function (url) {
  if (url[url.length - 1] !== '/') {
    url += '/'
  }
  // https://github.com/mochajs/mocha/pull/1652/
  var match = url.match(/github\.com\/([^\s\/]+)\/(([^\s\/]+)\/)?(([^\s\/]+)\/)?(([^\s\/]+)\/)?$/)
  if (!match) {
    return undefined
  }

  var owner = match[1]
  var repo = match[3]
  var type = match[5]
  var number = match[7]

  // type: 'issues' -> 'issue'
  if (type === 'issues') {
    type = 'issue'
  }

  if (number !== undefined) {
    number = number.split('#')[0]
  }

  return {
    owner: owner,
    repo: repo,
    type: type,
    number: number
  }
}
