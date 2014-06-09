var server = 'http://localhost:8000/bayeux';
var bayeux = new Faye.Client(server);
var subscription;
var publication;

// Subscribe into channel
var subscribe = function(ch) {
  bayeux.addExtension({
    outgoing: function(msg, clb) {
      if (msg.channel !== '/meta/subscribe') {
        return clb(msg);
      }
      if (!msg.ext) {
        msg.ext = {};
      }
      msg.ext.username = sessionStorage.username;
      msg.ext.password = sessionStorage.password;
      clb(msg);
    }
  });
  subscription = bayeux.subscribe(ch, function(msg) {
    if (channels.indexOf(ch) >= 0) {
      if (msg.user == 'broker' && msg.message == '[enter]') {
        var response = '<li><em class="text-info">' + msg.channel + ' bergabung</em></li>';
        insertuser(msg.id, msg.channel);
      } else {
        var response = '<li><span class="text-primary">' + msg.user + ' :</span> ' + msg.message + '</li>';
      }
      insertchat(msg.id, response);
    } else {
      if (msg.user != 'broker' && msg.user != sessionStorage.username) {
        var tt = msg.user;
        var id = 'p-' + tt;
        var channel = '/private/' + tt;
        var chat_area = '<div class="col-md-12 chat-box"><div class="chat-list"><ul class="list-unstyled" id="chat-list-' + id + '"></ul></div><div class="input-group"><input type="text" class="form-control" id="chat-input-' + id + '" autofocus><span class="input-group-btn"><button class="btn btn-default chat-button-send" id="chat-button-' + id + '" data-id="' + id + '" data-to="' + channel + '" type="button">Kirim</button></span></div>';
        channels.push(ch);
        $("ul.nav-tabs").addBSTab(id, '[P] ' + tt, chat_area);
        var listHeight = $('#panel-body-chat').height() - 110;
        $('.chat-list').css('height', listHeight);
        var response = '<li><span class="text-primary">' + msg.user + ' :</span> ' + msg.message + '</li>';
        insertchat(msg.id, response);
      }
    }
  });
  subscription.then(function() {
    publish(null, ch, '[enter]');
  }, function(error) {
    alert(error.message);
    window.location = './';
  });
}

// Publish message
var publish = function(id, ch, msg) {
  var channel = ch.split('/');
  if (ch[1] == 'group') {
    publication = bayeux.publish(ch, {
      id: id,
      channel: ch,
      message: msg,
      user: sessionStorage.username
    });
    publication.then(function() {
      //
    }, function(error) {
      alert('There was a problem: ' + error.message);
    });
  } else {
    publication = bayeux.publish(ch, {
      id: 'p-' + sessionStorage.username,
      channel: ch,
      message: msg,
      user: sessionStorage.username
    });
    publication.then(function() {
      var response = '<li><span class="text-primary">' + saya + ' :</span> ' + msg + '</li>';
      insertchat(id, response);
    }, function(error) {
      alert('There was a problem: ' + error.message);
    });
  }
}

var unsubscribe = function() {
  subscription.cancel();
}