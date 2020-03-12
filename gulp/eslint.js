const { src } = require('gulp');
const eslint = require('gulp-eslint');

function eslintTask(done) {
  if (typeof process.argv[4] === 'undefined') {
    return src(['./src/**/*.ts', './test/**/*.spec.ts'])
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  } else {
    console.log('eslint is disabled due to testing only one test group');
    done();
  }
}

exports.eslintTask = eslintTask;
