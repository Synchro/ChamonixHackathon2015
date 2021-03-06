Meteor.methods({
  'geoJsonForIp': function (ip) {
    // avoid blocking other method calls from the same client
    this.unblock();
    var apiUrl = 'http://www.telize.com/geoip/' + ip;
    // asynchronous call to the dedicated API calling function
    return Meteor.wrapAsync(apiCall)(apiUrl);
  }
});

var apiCall = function (apiUrl, callback) {
  // try…catch allows you to handle errors
  try {
    var response = HTTP.get(apiUrl).data;
    // A successful API call returns no error
    // but the contents from the JSON response
    callback(null, response);
  } catch (error) {
    // If the API responded with an error message and a payload
    var errorCode, errorMessage;
    if (error.response) {
      errorCode = error.response.data.code;
      errorMessage = error.response.data.message;
      // Otherwise use a generic error message
    } else {
      errorCode = 500;
      errorMessage = 'Cannot access the API';
    }
    // Create an Error object and return it via callback
    var myError = new Meteor.Error(errorCode, errorMessage);
    callback(myError, null);
  }
};

if (Meteor.isClient) {
  Template.telize.helpers({
    location: function () {
      return Session.get('location');
    }
  });

  Template.telize.events({
    'click button': function (evt, tpl) {
      var ip = tpl.find('input#ipv4').value;
      Meteor.call('geoJsonForIp', ip, function (err, res) {
        // The method call sets the Session variable to the callback value
        if (err) {
          Session.set('location', {error: err});
        } else {
          Session.set('location', res);
          return res;
        }
      });
    }
  });
}
