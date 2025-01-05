function handler(event) {
  let authHeaders = event.request.headers.authorization;
  let expected = 'Basic Y2hyaXN0b3BoZXI6YmluZ28h';

  console.log(event.request);

  if (authHeaders && authHeaders.value === expected) {
    let request = event.request;
    let uri = request.uri;
    let regex = /metadata\/?$/i;

    uri = uri.replace(regex, 'metadata.json');
    request.uri = uri;
    return request;
  }

  let response = {
    statusCode: 401,
    statusDescription: 'Unauthorized',
    headers: {
      'www-authenticate': {
        value: 'Basic realm="Enter credentials"',
      },
    },
  };

  return response;
}
