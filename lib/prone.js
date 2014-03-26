var Prone = Object.create({});


Prone.message = function (err) {
  console.log(err.message);
}


Prone.notCode = function (code, err) {
  if (err.code !== code)
    Prone.message(err);
}


var commonCerrorCodes = ['EACCES', 'ENOENT', 'EADDRINUSE', 'ECONNREFUSED', 'EPIPE'];
commonCerrorCodes.forEach(function(commonCerrorCode){
  Prone['not' + commonCerrorCode] = function(err){
    Prone.notCode(commonCerrorCode, err);
  }
});


module.exports = Prone;