////////////////////////////////////////////////////////////////////////
//
// Rewrite requests for "metadata" to "metadata.json" to retrieve the
// correct resource from S3
//
////////////////////////////////////////////////////////////////////////
function handler(event) {
  let request = event.request;
  let uri = request.uri;
  let regex = /metadata\/?$/i;

  uri = uri.replace(regex, 'metadata.json');
  request.uri = uri;

  return request;
}
