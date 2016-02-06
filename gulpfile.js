var gulp        = require('gulp'),
    uglify      = require('gulp-uglify'),
    sass        = require('gulp-sass'),
    jsx         = require('gulp-jsx'),
    debug       = require('gulp-debug'),
    handlebars  = require('handlebars'),
    fs          = require('node-fs-extra'),
    concat      = require('gulp-concat'),
    markdown    = require('gulp-markdown'),
    wrapper     = require('gulp-wrapper'),
    through     = require('through-gulp'),
    addsrc      = require('gulp-add-src'),
    argv        = require('yargs').argv,
    exec        = require('child_process').execSync;

var BRAND = argv.brand || '5e';

var CONFIG = {
    outDest: 'dist',
    outTemp: 'temp',
    outBootJs: 'boot.min.js',
    outClientJs: 'client.min.js',
    outVendorJs: 'vendor.min.js',
    outBootCss: 'boot.min.css',
    outIndex: 'index.html',
    outDocs: 'docs.js',
    
    inBootThtml: 'boot.t.html',
    
    manifest: 'main.appcache',
    
    boot: 'boot',
    client: 'client',
    external: 'external',
    static: 'static',
    
    globAll: '**/*',
    globJsx: '**/*.jsx',
    globScss: '**/*.scss',
    globThtml: '**/*.t.html',
    globMd: '**/*.md',
    globTxt: '**/*.txt',
    
    seperator: '/'
};

// clean operation
gulp.task('clean', function () {
    fs.removeSync(CONFIG.outDest);
    fs.removeSync(CONFIG.outTemp);
});

// update manifest operation
gulp.task('partial:manifest', function () {
    try {
        fs.mkdirSync(CONFIG.outDest);
    } catch (error) {}
    // write manifest
    fs.writeFileSync(
        [CONFIG.outDest, CONFIG.manifest].join(CONFIG.seperator), 
        fs.readFileSync(CONFIG.manifest, 'utf8').replace('{version}', Date.now()), 
        'utf8');
});

// builds the boot segment
gulp.task('partial:boot:jsx', ['partial:manifest'], function () {
    return gulp.src([CONFIG.boot, CONFIG.globJsx].join(CONFIG.seperator))
        .pipe(debug())
        .pipe(jsx({
            factory: 'React.createElement'
        }))
        .pipe(concat(CONFIG.outBootJs))
        .pipe(uglify())
        .pipe(gulp.dest([CONFIG.outTemp, CONFIG.boot].join(CONFIG.seperator)));
});
gulp.task('watch:boot:jsx', ['partial:boot:jsx'], function () {
    gulp.watch([CONFIG.boot, CONFIG.globJsx].join(CONFIG.seperator), ['partial:boot:jsx']);
});

gulp.task('partial:boot:scss', ['partial:manifest'], function () {
    return gulp.src([CONFIG.boot, CONFIG.globScss].join(CONFIG.seperator))
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: [
                ['branding', BRAND].join(CONFIG.seperator)
            ]
        }).on('error', sass.logError))
        .pipe(concat(CONFIG.outBootCss))
        .pipe(gulp.dest([CONFIG.outTemp, CONFIG.boot].join(CONFIG.seperator)));
});
gulp.task('watch:boot:scss', ['partial:boot:scss'], function () {
    gulp.watch([CONFIG.boot, CONFIG.globScss].join(CONFIG.seperator), ['partial:boot:scss']);
});

gulp.task('partial:boot:index', ['partial:boot:jsx', 'partial:boot:scss', 'partial:manifest'], function () {
    var source = fs.readFileSync([CONFIG.boot, CONFIG.inBootThtml].join(CONFIG.seperator), 'utf8'),
        template = handlebars.compile(source),
        data = {
            js: fs.readFileSync([CONFIG.outTemp, CONFIG.boot, CONFIG.outBootJs].join(CONFIG.seperator)),
            css: fs.readFileSync([CONFIG.outTemp, CONFIG.boot, CONFIG.outBootCss].join(CONFIG.seperator)),
            logo: fs.readFileSync(['branding', BRAND, 'logo.html'].join(CONFIG.seperator)),
            title: (BRAND + ' SRD').toUpperCase()
        },
        result = template(data);
        
    // write index
    fs.writeFileSync([CONFIG.outDest, CONFIG.outIndex].join(CONFIG.seperator), result, 'utf8');
});
gulp.task('watch:boot:index', ['partial:boot:index'], function () {
    gulp.watch([
        [CONFIG.boot, CONFIG.globJsx].join(CONFIG.seperator),
        [CONFIG.boot, CONFIG.globScss].join(CONFIG.seperator),
        [CONFIG.boot, CONFIG.inBootThtml].join(CONFIG.seperator)
    ], ['partial:boot:index']);
});

gulp.task('copy:static', ['partial:manifest'],  function () {
    fs.copySync(CONFIG.static, [CONFIG.outDest, CONFIG.static].join(CONFIG.seperator));
    fs.copySync(
        ['branding', BRAND, 'icon.png'].join(CONFIG.seperator), 
        [CONFIG.outDest, CONFIG.static, 'icon.png'].join(CONFIG.seperator));
    fs.copySync(
        ['branding', BRAND, 'big-icon.png'].join(CONFIG.seperator), 
        [CONFIG.outDest, CONFIG.static, 'big-icon.png'].join(CONFIG.seperator));
});
gulp.task('watch:static', ['copy:static'], function () {
    gulp.watch([
        [CONFIG.static, CONFIG.globAll].join(CONFIG.seperator),
        ['branding', CONFIG.globAll].join(CONFIG.seperator)
    ], ['copy:static']);
});

gulp.task('partial:client:markdown', ['partial:manifest'], function () {
    return gulp.src([CONFIG.client, CONFIG.globMd].join(CONFIG.seperator))
        .pipe(markdown())
        .pipe(addsrc([CONFIG.client, CONFIG.globTxt].join(CONFIG.seperator)))
        .pipe(through.map(function (file) {
            file.contents = new Buffer(JSON.stringify(file.contents.toString()));
            file.path = file.path.replace('.html', '').replace('.txt', '');
            return file;
        }))
        .pipe(wrapper({
            header: '"${filename}":',
            footer: ','
        }))
        .pipe(concat(CONFIG.outDocs))
        .pipe(wrapper({
            header: 'var DOCUMENTS = {',
            footer: '"EMPTY":""}'
        }))
        .pipe(gulp.dest(CONFIG.outTemp));
});
// builds the boot segment
gulp.task('partial:client:jsx', ['partial:client:markdown', 'partial:manifest'], function () {
    return gulp.src([
            [CONFIG.client, CONFIG.globJsx].join(CONFIG.seperator),
            [CONFIG.outTemp, CONFIG.outDocs].join(CONFIG.seperator)
        ])
        .pipe(debug())
        .pipe(jsx({
            factory: 'React.createElement'
        }))
        .pipe(concat(CONFIG.outClientJs))
        .pipe(uglify())
        .pipe(gulp.dest(CONFIG.outTemp));
});

gulp.task('partial:client', ['partial:client:jsx'], function () {
    
    var file = [
        [CONFIG.external, 'offline.min.js'],
        [CONFIG.external, 'react.min.js'],
        [CONFIG.external, 'react-dom.min.js'],
        [CONFIG.outTemp, CONFIG.outClientJs],
    ].reduce(function (body, filenameSegements) {
        return body + fs.readFileSync(filenameSegements.join(CONFIG.seperator), 'utf8')
    }, '');
    
    var logo =
        'var LOGO = ' + 
        JSON.stringify(fs.readFileSync(['branding', BRAND, 'logo.html'].join(CONFIG.seperator), 'utf8')) +
        ';';
    
    fs.writeFileSync(
        [CONFIG.outDest, CONFIG.outClientJs].join(CONFIG.seperator),
        logo + file,
        'utf8'
    )
});

gulp.task('watch:client', ['partial:client'], function () {
    gulp.watch([
        [CONFIG.client, CONFIG.globJsx].join(CONFIG.seperator),
        [CONFIG.client, CONFIG.globMd].join(CONFIG.seperator),
        [CONFIG.client, CONFIG.globTxt].join(CONFIG.seperator)
    ], ['partial:client']);
});



gulp.task('develop', ['watch:boot:index', 'watch:client', 'watch:static']);

gulp.task('build', ['partial:boot:index', 'partial:client', 'copy:static']);

gulp.task('deploy', ['clean', 'build'], function () {
    exec('gcloud compute copy-files --zone us-central1-a ./dist/* ' + argv.server + ':/var/www/' + argv.brand + '-srd');
})