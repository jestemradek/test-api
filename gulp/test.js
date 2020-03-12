const { src, series, watch } = require('gulp');
const mocha = require('gulp-mocha');
const { eslintTask } = require('./eslint');

function testTask() {
  const testName = process.argv[4];
  let source = 'test/**/*.spec.ts';
  if (typeof testName !== 'undefined') {
    source = `test/**/*_${testName}.spec.ts`;
  }
  return src([source])
    .pipe(mocha({ reporter: 'spec', exit: true, require: ['ts-node/register'] }))
    .on('error', console.error);
}

function testWatch() {
  const testName = process.argv[4];
  let source = 'test/**/*.spec.ts';
  if (typeof testName !== 'undefined') {
    source = `test/**/*_${testName}.spec.ts`;
  }
  return watch([source, 'src/**/*.ts'], series(eslintTask, testTask));
}

exports.testTask = testTask;
exports.testWatch = testWatch;
