function emailNullCheck(email) {
    if (email === null || email === "" ) {
      return false;
    } else {
        return true;
    }
  }

  function passwordNullCheck(password) {
    if (password === null || password === "" ) {
      return false;
    } else {
        return true;
    }
  }  

  function passwordLengthCheck(password) {
    if (password.length<8) {
      return false;
    } else {
        return true;
    }
  }  

  function passwordCharacterCheck(password) {
    var regularExpression = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    if(!regularExpression.test(password)) {
        return false;
    }else {
        return true;
    }}


  exports.emailNullCheck = emailNullCheck;
  exports.passwordNullCheck = passwordNullCheck;
  exports.passwordLengthCheck = passwordLengthCheck;
  exports.passwordCharacterCheck = passwordCharacterCheck;