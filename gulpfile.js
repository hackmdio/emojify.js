const gulp = require('gulp')
const glob = require('glob')
const $ = require('gulp-load-plugins')()
const path = require('path')
const del = require('del')
const inquirer = require('inquirer')
const merge = require('merge2')
const ts = require('gulp-typescript')
const webpack = require('webpack-stream')
const fs = require('fs')
const tsProject = ts.createProject('tsconfig.json')

const distRoot = path.resolve('./dist')
const scriptRoot = path.join(distRoot, 'js')
const styleRoot = path.join(distRoot, 'css')
const imageRoot = path.join(distRoot, 'images')
const paths = {
  dist: {
    root: distRoot,
    scripts: scriptRoot,
    styles: {
      root: styleRoot,
      dataURI: path.join(styleRoot, 'data-uri'),
      sprites: path.join(styleRoot, 'sprites'),
      basic: path.join(styleRoot, 'basic')
    },
    images: {
      root: imageRoot,
      separate: path.join(imageRoot, 'basic'),
      sprites: path.join(imageRoot, 'sprites')
    }
  }
}

const globPromise = pattern => new Promise((resolve, reject) => {
  glob(pattern, {}, function (err, files) {
    if (err) {
      reject(err)
    } else {
      resolve(files)
    }
  })
})

async function scripts () {
  const pkg = require('./package.json')

  const emojiString = (await globPromise(`${paths.dist.images.separate}/*.png`)).map(file => {
    return path.basename(file, path.extname(file))
  }).join(',')

  const tsResult = tsProject.src().pipe(tsProject())

  return merge([
    gulp.src('./src/index.ts')
      .pipe(webpack({
        config: require('./webpack.config.js')
      }))
    // TODO: Do tslint
    // .pipe($.jshint())
    // .pipe($.jshint.reporter('jshint-stylish'))
      .pipe($.insert.prepend(`/*! ${pkg.name} - v${pkg.version} -
* Copyright (c) HackMD ${new Date().getFullYear()}
*/`))
      .pipe($.rename({
        suffix: '.min'
      }))
      .pipe($.replace(/\/\*##EMOJILIST\*\/\n'';/, `/*##EMOJILIST*/'${emojiString}';`))
      .pipe($.uglify({
        output: {
          comments: /##EMOJILIST/
        }
      }))
      .pipe(gulp.dest(paths.dist.scripts)),
    tsResult
      .dts
      .pipe(gulp.dest(paths.dist.root))
  ])
}
exports.scripts = scripts

var getEmoticonFilter = function () {
  var emoticons = [
    'smile', 'scream', 'smirk', 'grinning', 'stuck_out_tongue_closed_eyes', 'stuck_out_tongue_winking_eye',
    'rage', 'frowning', 'sob', 'kissing_heart', 'wink', 'pensive', 'confounded', 'flushed', 'relaxed', 'mask',
    'heart', 'broken_heart'
  ]

  return $.filter(function (file) {
    var index = emoticons.indexOf(path.basename(file.path, path.extname(file.path)))
    if (index > -1) {
      emoticons.splice(index, 1)
      return true
    }
  })
}

function copyImages () {
  del(paths.dist.images.separate)

  const emojiMap = require('emoji-datasource-google').reduce((acc, emoji) => Object.assign(acc, {
    [emoji.image]: emoji
  }), {})
  const availableFiles = Object.keys(emojiMap)

  const emojiDataSourcePath = 'node_modules/emoji-datasource-google/img/google/64'
  const pipeline = gulp.src(`${emojiDataSourcePath}/*.png`)
    .pipe($.filter(file => availableFiles.includes(file.basename)))
    .pipe($.rename(file => {
      const emojiData = emojiMap[`${file.basename}${file.extname}`]

      file.basename = emojiData.short_name
      file.dirname = './'
    }))
    .pipe(gulp.dest(paths.dist.images.separate))

  const extractPipelines = availableFiles.reduce((ps, basename) => {
    const emoji = emojiMap[basename]
    const filteredShortNames = emoji.short_names.filter(n => n !== emoji.short_name)
    const sourceFile = `${emojiDataSourcePath}/${basename}`

    if (filteredShortNames.length > 0 && fs.existsSync(sourceFile)) {
      const pipelines = filteredShortNames.map(shortname => {
        return gulp.src(sourceFile)
          .pipe($.clone())
          .pipe($.rename(`${shortname}.png`))
          .pipe(gulp.dest(paths.dist.images.separate))
      })
      return ps.concat(pipelines)
    } else {
      return ps
    }
  }, [])

  return merge(pipeline, ...extractPipelines)
}
exports.copyImages = copyImages

const imageAndStyles = gulp.series(copyImages, copyStyles, dataURI)
exports.imageAndStyles = imageAndStyles

function dataURI () {
  const emoticonFilter = getEmoticonFilter()

  return gulp.src(`${paths.dist.images.separate}/*.png`)
    .pipe($.imageDataUri({
      customClass: function (className) {
        return 'emoji-' + className
      }
    }))
    .pipe(emoticonFilter)
    .pipe($.concat('emojify-emoticons.css'))
    .pipe($.replace('.emoji-+1', '.emoji-plus1'))
    .pipe(gulp.dest(paths.dist.styles.dataURI))
    .pipe($.minifyCss())
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.dist.styles.dataURI))
    .pipe(emoticonFilter.restore())

  // generate all data-URIs

    .pipe($.concat('emojify.css'))
    .pipe($.replace('.emoji-+1', '.emoji-plus1'))
    .pipe(gulp.dest(paths.dist.styles.dataURI))
    .pipe($.minifyCss())
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.dist.styles.dataURI))
}
exports.dataURI = dataURI

function copyStyles () {
  return gulp.src('./src/css/basic/*.css')
    .pipe(gulp.dest(paths.dist.styles.basic))
    .pipe($.minifyCss())
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.dist.styles.basic))
}
exports.copyStyles = copyStyles

function clean (done) {
  del(paths.dist.root, done)
}
exports.clean = clean

function bump (done) {
  inquirer.prompt({
    type: 'list',
    name: 'bump',
    message: 'What type of bump would you like to do?',
    choices: ['patch', 'minor', 'major', "don't bump"]
  }, function (result) {
    if (result.bump === "don't bump") {
      done()
      return
    }

    gulp.src(['./bower.json', './package.json'])
      .pipe($.bump({ type: result.bump }))
      .pipe(gulp.dest('./'))
      .on('end', done)
  })
}
exports.bump = bump

function watch () {
  return gulp.watch('src/**/*.{ts,js}', scripts)
}
exports.watch = watch

const compile = gulp.series(imageAndStyles, scripts)
exports.default = compile
exports.compile = compile
exports.release = gulp.series(compile, bump)
