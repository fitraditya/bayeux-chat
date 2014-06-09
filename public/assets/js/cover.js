$(function() {
  // Register account
  $('#btn-signup').on('click', function() {
    sessionStorage.clear();
    if ($('#formSignup').parsley().validate()) {
      var serializedData = $('#formSignup').serialize();
      $.post('./signup', serializedData, function(result) {
        $('#inputSignupEmail, #inputSignupUsername').parent().removeClass('has-error');
        if (result === 'success') {
          sessionStorage.username = $('#inputSignupUsername').val();
          sessionStorage.password = $('#inputSignupPassword').val();
          window.location = './chat';
        } else if (result === 'error') {
          $('#signupresult').html('<div class="alert alert-danger"><strong>Gagal!</strong> Username telah terdaftar.</div>');
          $('#inputSignupUsername').parent().addClass('has-error');
        }
      });
    }
  });

  // Sign in
  $('#btn-signin').on('click', function() {
    sessionStorage.clear();
    if ($('#formSignin').parsley().validate()) {
      var serializedData = $('#formSignin').serialize();
      $.post('./signin', serializedData, function(result) {
        if (result === 'success') {
          sessionStorage.username = $('#inputSigninUsername').val();
          sessionStorage.password = $('#inputSigninPassword').val();
          window.location = './chat';
        } else if (result === 'error') {
          $('#signinresult').html('<div class="alert alert-danger"><strong>Gagal!</strong> Username / password salah.</div>');
        }
      });
    }
  });
});