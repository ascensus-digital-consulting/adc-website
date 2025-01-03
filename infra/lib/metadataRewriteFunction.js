////////////////////////////////////////////////////////////////////////
//
// Rewrite requests for "metadata" to "metadata.json" to retrieve the
// correct resource from S3
//
////////////////////////////////////////////////////////////////////////
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var regex = /metadata\/?$/i;

  uri = uri.replace(regex, 'metadata.json');
  request.uri = uri;

  return request;
}
