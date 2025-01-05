function handler(event) {
  let request = metadataRewriteHandler(event);
  event.request = request;
  let requestOrResponse = authzHandler(event);
  return requestOrResponse;
}

function isProduction(headers) {
  let productionDomains = ['ascensus.digital', 'www.ascensus.digital'];
  let host = headers.host ? headers.host.value : '';
  let production = productionDomains.includes(host);

  return production;
}

function authzHandler(event) {
  let authzHeaders = event.request.headers.authorization;
  let expected = 'Basic Y2hyaXN0b3BoZXI6YmluZ28h';

  let production = isProduction(event.request.headers);
  let authzSuccess = authzHeaders && authzHeaders.value === expected;
  let requiresAuthz = !(production || authzSuccess);
  let http = event.request;

  if (requiresAuthz) {
    let response = {
      statusCode: 401,
      statusDescription: 'Unauthorized',
      headers: {
        'www-authenticate': {
          value: 'Basic realm="Enter credentials"',
        },
      },
    };
    http = response;
  }

  return http;
}

function metadataRewriteHandler(event) {
  let request = event.request;
  let uri = request.uri;
  let regex = /metadata\/?$/i;

  uri = uri.replace(regex, 'metadata.json');
  request.uri = uri;
  return request;
}
