const { test } = require('node:test');
const assert = require('node:assert/strict');
const { evaluate, format } = require('../src/calc.js');
const { analyse, equation, describeRoots, niceStep } = require('../src/quadratic.js');

test('operator precedence and parentheses', () => {
  assert.equal(evaluate('2+3×4'), 14);
  assert.equal(evaluate('(2+3)×4'), 20);
  assert.equal(evaluate('10−4−3'), 3);
  assert.equal(evaluate('100÷10÷2'), 5);
});

test('powers are right associative and bind tighter than unary minus', () => {
  assert.equal(evaluate('2^3^2'), 512);
  assert.equal(evaluate('-2^2'), -4);
  assert.equal(evaluate('(-2)^2'), 4);
  assert.equal(evaluate('2^-1'), 0.5);
});

test('decimals and float noise', () => {
  assert.equal(format(evaluate('0.1+0.2')), '0.3');
  assert.equal(evaluate('.5×4'), 2);
});

test('only arithmetic is accepted', () => {
  for (const bad of ['', '2+', '(1', '1)', 'alert(1)', '2**3', '1..2']) {
    assert.throws(() => evaluate(bad), SyntaxError, bad);
  }
  assert.equal(format(evaluate('1÷0')), 'Error');
});

test('two real roots, vertex and discriminant', () => {
  const r = analyse(1, -2, -3);
  assert.deepEqual(r.roots, [-1, 3]);
  assert.deepEqual(r.vertex, { x: 1, y: -4 });
  assert.equal(r.discriminant, 16);
});

test('repeated and complex roots', () => {
  assert.deepEqual(analyse(1, -4, 4).roots, [2]);
  const c = analyse(1, 2, 5);
  assert.deepEqual(c.complexRoots, { re: -1, im: 2 });
  assert.equal(describeRoots(c), '-1 ± 2i');
});

test('stable when b² is much larger than 4ac', () => {
  // the textbook formula loses the small root completely here
  const r = analyse(1, 1e8, 1);
  assert.ok(Math.abs(r.roots[1] - -1e-8) < 1e-20, String(r.roots[1]));
});

test('linear and constant cases', () => {
  assert.equal(analyse(0, 2, -4).kind, 'linear');
  assert.deepEqual(analyse(0, 2, -4).roots, [2]);
  assert.equal(analyse(0, 0, 5).kind, 'constant');
});

test('equation text', () => {
  assert.equal(equation(1, -2, -3), 'y = x² − 2x − 3');
  assert.equal(equation(-0.5, 0, 1), 'y = −0.5x² + 1');
  assert.equal(equation(0, 0, 0), 'y = 0');
});

test('grid steps are 1, 2 or 5 times a power of ten', () => {
  assert.equal(niceStep(10), 1);
  assert.equal(niceStep(30), 2);
  assert.equal(niceStep(80), 10);
  assert.equal(niceStep(0.4), 0.05);
});
