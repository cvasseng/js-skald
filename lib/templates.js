/******************************************************************************

js-skald - the simple JavaScript documentation generator

Copryright 2016 (c), Chris Vasseng <chris@tinkerer.xyz>

Licensed under the MIT license. See attached LICENSE file.

******************************************************************************/

function Create() {

  var fs = require('fs'),
      templates = {},
      hb = require('handlebars'),
      async = require('async'),
      exports = {}
  ;

  function loadTemplates(tdir, fn) {    
    var funs = []
    ;

    if (!tdir || tdir.length === 0) {
      return fn('Invalid path supplied to loadTemplates');
    }

    if (tdir[tdir.length - 1] !== '/') {
      tdir += '/';
    }

    fs.readdir(tdir, function (err, files) {
      if (err) {
        return console.log('Error fetching templates:', err);
      }

      files.forEach(function (file) {
        if (file.indexOf('.handlebars') > 0) {
          funs.push(
            function (next) {
              fs.readFile(tdir + file, function (err, data) {
                if (err) return next(err);
                hb.registerPartial(file.replace('.handlebars', ''), data.toString());
                templates[file.replace('.handlebars', '')] = hb.compile(data.toString());
                next(false);
              });
            }
          );
        }
      });
      async.waterfall(funs, fn);
    });    
  }
  
  function compile(tmpl, data) {
    if (!templates[tmpl]) {
      console.log('Could not find template ' + tmpl + ', unable to compile it.');
      return;
    }
    return templates[tmpl](data);
  }

  function dmp(tmpl, fname, data, fn) {      
    if (!templates[tmpl]) {
      console.log('Could not find template ' + tmpl + ', unable to dump it.');
      return;
    }
            
    fs.writeFile(fname, templates[tmpl](data), function (err) {
      fn(err);
    });
  }
  
  exports = {
    load: loadTemplates,
    dmp: dmp,
    compile: compile
  };

  return exports;
};

module.exports = Create;