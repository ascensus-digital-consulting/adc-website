const vrh = require('../../lib/handlers/viewerRequestHandler.js');

test('renders expected output', () => {
  expect(hw.render()).toBe('Hello World!');
});
