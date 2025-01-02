function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var regex = /version\/?$/i;

  uri = uri.replace(regex, 'version.json');
  request.uri = uri;

  return request;
}
