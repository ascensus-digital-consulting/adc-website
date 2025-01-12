////////////////////////////////////////////////////////////////////////
//
// Runs HTTP pipeline tasks on the Cloudfront viewer request event
//
////////////////////////////////////////////////////////////////////////
function handler(event) {
  metadataRewriteHandler(event);
  let requestOrResponse = authzHandler(event);
  return requestOrResponse;
}

////////////////////////////////////////////////////////////////////////
//
// Configures HTTP Basic authz
//
////////////////////////////////////////////////////////////////////////
function authzHandler(event) {
  let authzHeaders = event.request.headers.authorization;
  let requestOrResponse = event.request;
  let expectedCreds = 'Basic Y2hyaXN0b3BoZXI6YmluZ28h';

  let prod = production(event.request.headers);
  let authorized = authzHeaders && authzHeaders.value === expectedCreds;
  let requiresAuthz = !prod;

  if (requiresAuthz && !authorized) {
    requestOrResponse = http401();
  }

  return requestOrResponse;
}

////////////////////////////////////////////////////////////////////////
//
// Rewrites requests for /metadata to /metadata.json
//
////////////////////////////////////////////////////////////////////////
function metadataRewriteHandler(event) {
  let request = event.request;
  let uri = request.uri;
  let regex = /metadata\/?$/i;

  uri = uri.replace(regex, 'metadata.json');
  request.uri = uri;
  return request;
}

////////////////////////////////////////////////////////////////////////
//
// Validates the Host header against a list of production domains
//
////////////////////////////////////////////////////////////////////////
function production(headers) {
  let productionDomains = ['ascensus.digital', 'www.ascensus.digital'];
  let production = productionDomains.includes(headers.host.value);
  return production;
}

////////////////////////////////////////////////////////////////////////
//
// Configure response when authz is required but no credentials have
// been provided
//
////////////////////////////////////////////////////////////////////////
function http401() {
  return {
    statusCode: 401,
    statusDescription: 'Unauthorized',
    headers: {
      'www-authenticate': {
        value: 'Basic realm="Enter credentials"',
      },
    },
  };
}

/* istanbul ignore next */
if (console.error) {
  module.exports = handler;
}
