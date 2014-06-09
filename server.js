var http = require('http');
var url = require('url');
var fs = require('fs');
var mime = require('mime');
var qs  = require('querystring');
var faye = require('faye');
var model = require('./model').model;

// Set bayeux URI
var bayeux = new faye.NodeAdapter({mount: '/bayeux', timeout: 45});

// Set database
var db = new model();

// Handle requests
var server = http.createServer(function(request, response) {

  //routes
  var url_parts = url.parse(request.url);
  switch(url_parts.pathname) {
    case '/':
      display_page('/index.html', request, response);
      break;
    case '/signup':
      handle_signup(url_parts.pathname, request, response);
      break;
    case '/signin':
      handle_signin(url_parts.pathname, request, response);
      break;
    case '/chat':
      display_page('/chat.html', request, response);
      break;
    default:
      display_page(url_parts.pathname, request, response);
  }
  return;

  //display page
  function display_page(uri, req, res) {
    var type = mime.lookup('./public'+uri);
    fs.readFile('./public'+uri, 'binary', function(err, file) {
      if (err) {
        res.writeHeader(500, {'Content-Type': 'text/plain'});
        res.write(err + "\n");
        res.end();
      } else {
        res.writeHeader(200, {'Content-Type': type});
        res.write(file, 'binary');
        res.end();
      }
    });
  }

  //sign up
  function handle_signup(uri, req, res) {
    if (req.method == 'POST') {
      var query = '';
      var params = '';
      req.on('data', function (data) {
        query += data;
      });
      req.on('end', function () {
        params = qs.parse(query);
        var username = params.signupusername;
        var password = params.signuppassword;
        db.check(username, function(error, result) {
          if (!result) {
            db.register(username, password, function(error, result) {
              res.write('success');
              res.end();
            });
          } else {
            res.write('error');
            res.end();
          }
        });
      });
    } else {
      res.writeHead(301, {Location: './'});
      res.end();
    }
  }

  //sign in
  function handle_signin(uri, req, res) {
    if (req.method == 'POST') {
      var query = '';
      var params = '';
      req.on('data', function (data) {
        query += data;
      });
      req.on('end', function () {
        params = qs.parse(query);
        var username = params.signinusername;
        var password = params.signinpassword;
        db.signin(username, password, function(error, result) {;
          if (result) {
            res.write('success');
            res.end();
          } else {
            res.write('error');
            res.end();
          }
        });
      });
    } else {
      res.writeHead(301, {Location: './'});
      res.end();
    }
  }
});

// Handle Bayeux authentication
bayeux.addExtension({
  incoming: function(message, callback) {
    var username = '';
    var password = '';
    //subscription
    if (message.channel === '/meta/subscribe') {
      var channel = message.subscription;
      channel = channel.split('/');
      username = message.ext.username;
      password = message.ext.password;
      if (username !== 'broker' && channel[1] === 'private' && username === channel[2]) {
        db.signin(username, password, function(error, result) {
          if (result) {
            //
          } else {
            message.error = 'System Error: Account not authorized';
          }
        });
      } else if (username !== 'broker' && channel[1] === 'group') {
        //
      } else if (username === 'broker' && channel[2] === '*') {
        db.signin(username, password, function(error, result) {
          if (result) {
            //
          } else {
            message.error = 'System Error: Account not authorized';
          }
        });
      } else {
        message.error = 'System Error: Account not authorized';
      }
    }
    setTimeout(function() {
      callback(message);
    }, 2000);
  }
});

// Broker - chat notification handler
var broker = new faye.Client('http://localhost:8000/bayeux');
broker.addExtension({
  outgoing: function(msg, clb) {
    if (msg.channel !== '/meta/subscribe') {
      return clb(msg);
    }
    if (!msg.ext) {
      msg.ext = {};
    }
    msg.ext.username = 'broker';
    msg.ext.password = 'e3c9c373c82d6d5bd4a4aa6a8269bbe6';
    clb(msg);
  }
});
var subscription_g = broker.subscribe('/group/*', function(msg) {
  if (msg.message !== '[enter]') {
    console.log('>> ' + msg.user + ' to ' + msg.channel + ' ' + msg.message);
  } else if (msg.message === '[enter]' && msg.user !== 'broker') {
    var id = msg.channel.split('/');
    var publication = broker.publish(msg.channel, {
      id: 'g-' + id[2],
      channel: msg.user,
      message: msg.message,
      user: 'broker',
    });
  }
});
var subscription_p = broker.subscribe('/private/*', function(msg) {
  if (msg.message !== '[enter]') {
    console.log('>> ' + msg.user + ' to ' + msg.channel + ' ' + msg.message);
  } else if (msg.message === '[enter]' && msg.user !== 'broker') {
    var id = msg.channel.split('/');
    var publication = broker.publish(msg.channel, {
      id: 'g-' + id[2],
      channel: msg.user,
      message: msg.message,
      user: 'broker',
    });
  }
});

bayeux.attach(server);
server.listen(8000);

console.log('Server is running.');

bayeux.bind('subscribe', function(clientId, channel) {
  session(clientId, channel);
});

bayeux.bind('unsubscribe', function(clientId, channel) {
});

bayeux.bind('disconnect', function(clientId) {
  unsession(clientId);
});

var session = function(id, channel) {
  var ch = channel.split('/');
  if (ch[1] === 'private') {
    db.session(id, ch[2], function(error, result) {});
  } else if (channel !== '/group/*') {
    db.uname_session(id, function(error, result) {
      presence(channel, result.username);
    });
  }
}

var unsession = function(id) {
  db.uname_session(id, function(error, result) {
    db.unsession(result.username, function(error, result) {});
    db.unpresence(result.username, function(error, result) {});
    broker.publish('/private/' + result.username, {
      id: 'g',
      channel: result.username,
      message: '[quit]',
      user: 'broker',
    });
  });
}

var presence = function(channel, username) {
  var ch = channel.split('/');
  if (ch[1] === 'group') {
    db.presence(channel, username, function(error, result) {});
  }
}