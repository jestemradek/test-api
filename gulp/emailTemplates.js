const { src, dest, series, watch } = require('gulp');
const rename = require('gulp-rename');
const ejs = require('gulp-ejs');
const mjml = require('gulp-mjml');
const mjmlEngine = require('mjml');
const tap = require('gulp-tap');
const filter = require('gulp-filter-each');
const path = require('path');
const vs = require('vinyl-string');

function emailTemplatesTask() {
  return src('./src/templates/email/*.ejs')
    .pipe(ejs())
    .pipe(mjml(mjmlEngine, { beautify: true }))
    .pipe(
      rename(function(path) {
        path.extname = '.ejs';
      }),
    )
    .pipe(dest('./tmp/email'));
}

function translateEmailTask() {
  return src('./tmp/email/*.ejs').pipe(
    tap(function(file) {
      const name = path.parse(file.path).name,
        regex = new RegExp(name, 'gi');
      src('./src/locales/**/emails.json')
        .pipe(filter(content => content.match(regex)))
        .pipe(
          tap(function(langFile) {
            const templates = require(langFile.path),
              template = templates[name],
              lang = templates.lang;
            src(file.path)
              .pipe(ejs(template))
              .pipe(dest('./dist/templates/email/' + lang));
            const vFile = vs(template.title, {
              path: name + '.subject.txt',
            });
            vFile.pipe(dest('./dist/templates/email/' + lang));
          }),
        );
    }),
  );
}

function emailTemplatesWatch() {
  return watch(['./src/templates/email/**/*.ejs', './src/locales/**/emails.json'], series(emailTemplatesTask, translateEmailTask));
}

exports.buildEmailTemplatesTask = series(emailTemplatesTask, translateEmailTask);
exports.emailTemplatesWatch = emailTemplatesWatch;
