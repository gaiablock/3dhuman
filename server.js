#!/usr/bin/env node

var server = require('http').createServer(handler)
  , fs = require('fs')
  , re = new RegExp('\.js$', 'i')
  , port = 8000


// process incoming requests.
function handler(req, res) {
  if (req.url == '/') req.url = 'index.html'
  else if (re.test(req.url))
    res.setHeader('Content-Type', 'application/javascript')
  var rs = fs.createReadStream(__dirname + '/public/' + req.url)
  rs.pipe(res)
}

server.listen(port)
console.log('Server listening on port ' + port)
