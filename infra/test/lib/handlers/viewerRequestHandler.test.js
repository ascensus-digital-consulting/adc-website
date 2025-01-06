const handler = require('../../../lib/handlers/viewerRequestHandler.js');

describe('viewer request handler', () => {
  const event = {
    version: '1.0',
    context: {},
    viewer: {},
    request: {},
    response: {},
  };

  it('should be a function', () => {
    expect(typeof handler).toBe('function');
  });

  test('should not alter uri in public environment', async () => {
    const expected = 'index.html';
    event.request = {
      uri: expected,
      headers: {
        host: { value: 'ascensus.digital' },
      },
    };
    const request = handler(event);
    expect(request.uri).toBe(expected);
  });

  test('should prompt for credentials in an unauthenticated private environment', async () => {
    event.request = {
      uri: '/index.html',
      headers: {
        host: { value: 'dev.ascensus.digital' },
      },
    };
    const response = handler(event);
    expect(response.statusCode).toBe(401);
  });

  test('should not alter uri in an authenticated private environment', async () => {
    const expected = 'index.html';
    event.request = {
      uri: expected,
      headers: {
        host: { value: 'dev.ascensus.digital' },
        authorization: { value: 'Basic Y2hyaXN0b3BoZXI6YmluZ28h' },
      },
    };
    const request = handler(event);
    expect(request.uri).toBe(expected);
  });

  test('should rewrite /metadata to /metadata.json in a public environment', async () => {
    event.request = {
      uri: '/metadata',
      headers: {
        host: { value: 'ascensus.digital' },
      },
    };
    const request = handler(event);
    expect(request.uri).toBe('/metadata.json');
  });

  test('should rewrite /metadata to /metadata.json in an authenticated private environment', async () => {
    event.request = {
      uri: '/metadata',
      headers: {
        host: { value: 'dev.ascensus.digital' },
        authorization: { value: 'Basic Y2hyaXN0b3BoZXI6YmluZ28h' },
      },
    };
    const request = handler(event);
    expect(request.uri).toBe('/metadata.json');
  });
});
