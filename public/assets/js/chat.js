// Channels
var channels = new Array();

$(function() {
  if (!sessionStorage.username || !sessionStorage.password) {
    sessionStorage.clear();
    window.location = './';
  } else {
    window.onbeforeunload = function(e) {
      return 'Reloading this page will end your chats session.';
    };
  }

  // Join own private channel
  subscribe('/private/' + sessionStorage.username);

  // Chat tab
  var tabs = $("ul.nav-tabs");
  $('#container-chat').hide();
  sizeContent();

  // User fullname
  $('#btn-username').html('<i class="fa fa-user"></i>&nbsp;&nbsp;' + sessionStorage.username + '&nbsp;<b class="caret"></b>');

  // Sign out
  $('#btn-signout').click(function() {
    unsubscribe();
    sessionStorage.clear();
    window.location = './';
  });

  // Join room
  $('#btn-joinroom').on('click', function() {
    var tt = $('#inputJoinroom').val();
    var id = 'g-' + tt;
    var channel = '/group/' + tt;
    var chat_area = '<div class="col-md-3"><div class="chat-user"><ul class="list-unstyled" id="chat-user-' + id + '"></ul></div></div><div class="col-md-9 chat-box"><div class="chat-list"><ul class="list-unstyled" id="chat-list-' + id + '"></ul></div><div class="input-group"><input type="text" class="form-control" id="chat-input-' + id + '" autofocus><span class="input-group-btn"><button class="btn btn-default chat-button-send" id="chat-button-' + id + '" data-id="' + id + '" data-to="' + channel + '" type="button">Kirim</button></span></div>';
    if ($.inArray(channel, channels) < 0 && tt != sessionStorage.username) {
      channels.push(channel);
      if (channels.length == 1) {
        $('#container-chat').show();
      }
      tabs.addBSTab(id, '[G] ' + tt, chat_area);
      var listHeight = $('#panel-body-chat').height() - 110;
      $('.chat-list').css('height', listHeight);
      subscribe(channel);
    }
    $('#inputJoinroom').val('');
    $('#joinroomModal').modal('hide');
  });

  // Send message
  $('#panel-body-chat').on('click', '.chat-button-send', function(event) {
    event.preventDefault();
    var id = $(this).data('id');
    var to = $(this).data('to');
    var message = $('#chat-input-' + id).val();
    publish(id, to, message);
    $('#chat-input-' + id).val('')
  });

  // Start private chat
  $('#panel-body-chat').on('click', '.private-channel', function(event) {
    event.preventDefault();
    var tt = $(this).data('id');
    var id = 'p-' + tt;
    var channel = '/private/' + tt;
    var chat_area = '<div class="col-md-12 chat-box"><div class="chat-list"><ul class="list-unstyled" id="chat-list-' + id + '"></ul></div><div class="input-group"><input type="text" class="form-control" id="chat-input-' + id + '" autofocus><span class="input-group-btn"><button class="btn btn-default chat-button-send" id="chat-button-' + id + '" data-id="' + id + '" data-to="' + channel + '" type="button">Kirim</button></span></div>';
    if ($.inArray(channel, channels) < 0 && tt != sessionStorage.username) {
      channels.push(channel);
      tabs.addBSTab(id, '[P] ' + tt, chat_area);
      var listHeight = $('#panel-body-chat').height() - 110;
      $('.chat-list').css('height', listHeight);
    }
  });
});

// Responsive chat area
$(window).resize(sizeContent);
var sizeContent = function() {
  var newHeight = $('html').height() - 110;
  $('#panel-body-chat').css('height', newHeight);
  var listHeight = $('#panel-body-chat').height() - 130;
  $('.chat-user, .chat-list').css('height', listHeight);
}

// Insert chat
var insertchat = function(id, message) {
  $('#chat-list-' + id).prepend(message);
}

// Insert user
var insertuser = function(id, channel) {
  $('#chat-user-' + id).append('<li><a href="#" class="private-channel user-' + channel + '" data-id="' + channel + '">' + channel + '</li>');
}