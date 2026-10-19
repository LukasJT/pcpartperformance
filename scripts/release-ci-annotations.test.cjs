'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { failureAnnotation } = require('./release-ci-annotations.cjs');
test('failed-command annotations preserve useful assertion context', () => {
  const line = failureAnnotation('node example.test.cjs', 'AssertionError: expected 209, received 142');
  assert(line.startsWith('::error title=Regression check failed::node example.test.cjs%0A'));
  assert(line.includes('AssertionError: expected 209, received 142'));
});
test('untrusted log lines cannot inject additional workflow commands', () => {
  const line = failureAnnotation('node test.cjs', '%0A\r\n::add-mask::value\n::set-output name=x::y');
  assert(!/[\r\n]/.test(line));
  assert(line.includes('%250A%0D%0A::add-mask::value%0A'));
});
test('annotation context is bounded and strips terminal control sequences', () => {
  const line = failureAnnotation('node test.cjs', 'x'.repeat(10000) + '\x1b[31mAssertionError\x1b[0m\u0000');
  assert(line.length < 3700);
  assert(line.endsWith('AssertionError'));
  assert(!line.includes('\x1b') && !line.includes('\u0000'));
});
