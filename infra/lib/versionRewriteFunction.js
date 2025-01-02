function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var regex = /metadata\/?$/i;

  uri = uri.replace(regex, 'metadata.json');
  request.uri = uri;

  return request;
}
