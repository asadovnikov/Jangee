/**
 * Created by asadovnikov on 10/5/16.
 */
var through = require('through2');
var util = require('gulp-util');
var path = require('path');
var File = require('vinyl');
var imageSize = require('image-size');
var imagesInfo = 'src/app/info.json';
var fs   = require('fs');
const md5File = require('md5-file');
var ColorThief = require('color-thief');
var fsPath = '/Users/asadovnikov/WebStormProjects/Jangee/src/';
//var paletteGenerator = require('./generators/palette');
//var scssThemeGenerator = require('./generators/scssTheme');
//var themeDocumentationSectionGenerator = require('./generators/themeDocumentationSection');

//JSON.minify = JSON.minify || require("node-json-minify");

module.exports = through.obj(function (file, enc, callback) {
  if (file.isNull()) {
    this.push(file); // Do nothing if no contents
    return callback();
  }

    function gcd(a, b) {
        if (b == 0){
            return a;
        }
        return gcd(b, a % b);
    }

 //util.log(file.path);
    var imagesObj = JSON.parse(fs.readFileSync(imagesInfo, 'utf8'));
    //var imagesObj = {};
    fs.stat(imagesInfo, function(err, stat){
        if(err == null) {
            var imagesObj = JSON.parse(fs.readFileSync(imagesInfo, 'utf8'));
        } else if(err.code == 'ENOENT') {
            // file does not exist
            util.log('File do not exists');
        } else {
            util.log('Some other error: ', err.code);
        }
    });

  var dimensions = imageSize(file.path);
    //util.log('Width: ' + dimensions.width + ' and Height: ' + dimensions.height);

    var widthRario = dimensions.width/dimensions.height;
    var heightRation = dimensions.height/dimensions.width;
    var r = gcd(dimensions.width, dimensions.height);

    var fileName = path.basename(file.path);
    var checksum = md5File.sync(file.path);

    if(!imagesObj[checksum]){
        imagesObj[checksum] = {};
    }
    var colorThief = new ColorThief();
    var color = colorThief.getColor(file.path);
    //var palette = colorThief.getPalette(file.path, 8);

    var rowSpan = 1;
    var columnSpan = 1;

  var executionCount = 0;

    function alignWithGrid(value){
      executionCount ++;
        if(value < 7){
            return value;
        }
        return alignWithGrid(Math.floor(value/2));
    }

    var cssClass = '';

    if(dimensions.width > dimensions.height){
        var approximation = dimensions.width / dimensions.height;
        var app = 0;
        if(approximation > 1.2)
        {
            app = 1;
        }
        else{
            app = 2
        }
        var diff =  dimensions.width - dimensions.height;
        rowSpan = alignWithGrid(Math.floor(dimensions.height / diff));
        columnSpan = rowSpan + 1;
        columnSpan += app;
        cssClass = 'imgWide';
    }
    else if(dimensions.width < dimensions.height){
        var approximation = dimensions.height / dimensions.width;
        var app = 0;
        if(approximation > 1.2)
        {
            app = 1;
        }
        else{
            app = 2
        }
        var diff =  dimensions.height - dimensions.width;
        columnSpan = alignWithGrid(Math.floor(dimensions.width / diff));
        rowSpan = columnSpan + 1;
        rowSpan +=app;
        cssClass = 'imgTall';
    }
  else{
      columnSpan = rowSpan = 2;
    }


      imagesObj[checksum] = {
        'css_class': cssClass,
        'width': dimensions.width,
        'height': dimensions.height,
        'column': columnSpan,
        'row': rowSpan,
        'ratio': widthRario + 'x' + heightRation,
        'url': encodeURIComponent(file.path.replace(fsPath, '/')),
        'aspect': r,
        'aspect_ratio': dimensions.width / r + ':' + dimensions.height / r,
        'path': file.path,
        'name': fileName,
        'primaryColor': 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')',
        //'palette' : {
        //    '1' : 'rgb(' + palette[0][0] + ',' + palette[0][1] + ',' + palette[0][2] + ')',
        //    '2' : 'rgb(' + palette[1][0] + ',' + palette[1][1] + ',' + palette[1][2] + ')',
        //    '3' : 'rgb(' + palette[2][0] + ',' + palette[2][1] + ',' + palette[2][2] + ')',
        //    '4' : 'rgb(' + palette[3][0] + ',' + palette[3][1] + ',' + palette[3][2] + ')',
        //    '5' : 'rgb(' + palette[4][0] + ',' + palette[4][1] + ',' + palette[4][2] + ')',
        //    '6' : 'rgb(' + palette[5][0] + ',' + palette[5][1] + ',' + palette[5][2] + ')',
        //    '7' : 'rgb(' + palette[6][0] + ',' + palette[6][1] + ',' + palette[6][2] + ')'
        //}
      };
      fs.writeFileSync(imagesInfo, JSON.stringify(imagesObj));

  callback();
});
