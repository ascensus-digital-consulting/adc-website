const HelloWorld = require('../src/js/HelloWorld.js');
const hw = new HelloWorld();

test('renders expected output', () => {
  expect(hw.render()).toBe('Hello World!');
});
