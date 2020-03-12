const { src, dest } = require('gulp');
const typescript = require('gulp-typescript');
const tsProject = typescript.createProject('tsconfig.json');
const nodemon = require('gulp-nodemon');

function tsTask() {
  return src('src/**/*.ts')
    .pipe(tsProject())
    .pipe(dest('dist'));
}

function tsWatch(done) {
  const stream = nodemon({
    watch: 'src/**/*.ts',
    tasks: ['lint'],
    exec: 'ts-node ./src/server.ts',
    ext: 'ts',
    env: { NODE_ENV: 'dev', PORT: '3000' },
    done: done,
  });
  return stream;
}

exports.tsTask = tsTask;
exports.tsWatch = tsWatch;
