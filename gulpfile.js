//ЗАПУСТИТЬ команда
//gulp server

const gulp = require('gulp');
const sass = require('gulp-sass');
//если есть ошибка, то автоматизация не прекращатся
//ошибка показывается в консоли но программа продолжает работать
const plumber = require('gulp-plumber');
//плагин для autoprefixer
const postcss = require('gulp-postcss');
//добавление префиксеров для старых браузеров
const autoprefixer = require('autoprefixer');
//локальный сервер
const browserSync = require('browser-sync').create();
//объединяет все файлы в один
//в нашем случае все css файлы в один
const concat = require('gulp-concat');
//минификация css
const cleanCSS = require('gulp-clean-css');
//минификация css
const csso = require('gulp-csso');
//минификация (убираем лишнюю мета информацию) картинок
const imageMin = require('gulp-imagemin');
//переименование файлов (для min.css)
const rename = require('gulp-rename');
//преобразование картинок в формат webp (они становятся меньше)
//только для хрома
const webp = require('gulp-webp');

//задача для сбора из препроцессорного кода css код
gulp.task('style', function () {
    //где располагается файл, получил контент
    return gulp.src('src/sass/*.scss')
    //контент передается с помощью pipe
    //преобразовывается
    //передается
        .pipe(plumber())
        .pipe(concat('app.scss'))
        /*.pipe(sass.sync({outputStyle: 'compressed'}))*/
        .pipe(sass.sync())
        .pipe(postcss([
            autoprefixer()
        ]))
        //куда положить готовый css файл НЕ минифицированный
        .pipe(gulp.dest('build/css'))
        //минификация файла
        .pipe(csso())
        //копирование и переименование файла
        .pipe(rename('style.min.css'))
        //кладем в папку css
        //теперь там 2 файла : минифицированный и обычный
        .pipe(gulp.dest('build/css'))
        //отслеживание изменений
        //удаление папки css, добавление обновленной папки css
        .pipe(browserSync.stream())
});

//удаление излишей метаинформации о картинках
gulp.task('imageMin', function () {
    return gulp.src('src/img/**/*.{png,jpg,svg}')
        .pipe(imageMin([
            //преобразование от 10 до 1
            //3 - безопасное
            imageMin.optipng({optimizationLevel: 3}),
            //чтоб jpg загружались с блюра до четкости
            imageMin.jpegtran({progressive: true}),
            //svg тоже чистить
            imageMin.svgo()
        ]))
        .pipe(gulp.dest('src/img'))
});

gulp.task('webp', function () {
    return gulp.src('src/img/**/*.{png,jpg}')
        .pipe(webp({quality: 90}))
        .pipe(gulp.dest('src/img'));
});

gulp.task('copy', function () {
    return gulp.src([
        'src/fonts/**',
        'src/img/**',
        'src/js/**'
    ], {
        base: 'src'
    }).pipe(gulp.dest('build'));
});

//запустить: gulp server
gulp.task('server', gulp.series('style', 'imageMin', 'webp', 'copy', function () {
    browserSync.init({
        server: '.',
        notify: false,
        open: true,
        cors: true,
        ui: false
    });
    //отслеживание изменения файлов
    //любые scss sass файлы
    //** в любой подпапке, папки sass
    //gulp.series('style') - эти изменения прогнать чз задачу style
    gulp.watch('src/sass/**/*.{scss, sass}', gulp.series('style'));
    gulp.watch([
        'src/fonts/**/*.{woff, woff2}',
        'src/img/**',
        'src/js/**'
    ], gulp.series('copy'));
    gulp.watch('*.html').on('change', browserSync.reload);
}));