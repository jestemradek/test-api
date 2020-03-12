const { series, parallel } = require('gulp');
const { del } = require('del');
const { buildEmailTemplatesTask, emailTemplatesWatch } = require('./gulp/emailTemplates');
const { tsTask, tsWatch } = require('./gulp/ts');
const { eslintTask } = require('./gulp/eslint');
const { testTask, testWatch } = require('./gulp/test');

function cleanTask() {
  return del(['dist', 'tmp', 'reports', 'combined.log', 'npm-debug.log', 'stryker.log']);
}

exports.clean = cleanTask;
exports.build = series(cleanTask, parallel(tsTask, buildEmailTemplatesTask));
exports.watch = series(buildEmailTemplatesTask, parallel(emailTemplatesWatch, tsWatch));
exports.lint = eslintTask;
exports.test = series(eslintTask, testTask);
exports.testWatch = testWatch;
