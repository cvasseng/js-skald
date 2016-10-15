#!/usr/bin/env node

/******************************************************************************

js-skald - the simple JavaScript documentation generator

Copryright 2016 (c), Chris Vasseng <chris@tinkerer.xyz>

Licensed under the MIT license. See attached LICENSE file.

******************************************************************************/

var parser = require('../lib/parser.js'),
    fs = require('fs'),
    blockTree = {      
      name: 'global',
      namespaces: {},
      children: []
    },
    templates = require('../lib/templates')(),
    async = require('async'),
    args = process.argv,
    outdir = __dirname + '/../output/',
    funs = [],
    mkdirp = require('mkdirp'),
    transform = require('../lib/transformtree.js')
;

require('colors');

console.log('js-skald - the crappy doc generator'.green);

function isFolder(filename) {
  return fs.lstatSync(filename).isDirectory();
}

function processFiles(list, outdir, name) {
  var funs = [];

  if (outdir[outdir.length - 1] !== '/') {
    outdir += '/';
  }

  function pushFile(filename) {    
    console.log('Adding', filename.toString().bold, 'to queue');
    funs.push(
      function (next) {
        parser.parseFile(filename, function (blocks) {
          transform(blocks, blockTree);
          next();
        });      
      }
    );
  }

  mkdirp(outdir, function () {
    templates.load(__dirname + '/../templates/', function () {
      if (list && list.forEach) {
        list.forEach(function (filename) {
          var files;

          if (isFolder(filename)) {
            if (filename[filename.length - 1] !== '/') {
              filename += '/';
            }
            files = fs.readdirSync(filename) || [];
            files.forEach(function (fname) {
              if (fname.indexOf('.js')) {
                pushFile(filename + fname);
              }
            });          
          } else {
            pushFile(filename);
          }
        });
      }

      async.waterfall(funs, function () {
        fs.writeFile(outdir + name + '.json', JSON.stringify(blockTree, undefined, '  ', function (err) {
          return err && console.log('Error when writing json'.red, err);
        }));

        templates.dmp('docs', outdir + name + '.md', blockTree, function () {

        });
      });
    });
  });
}

function fromArgs() { 

  mkdirp(outdir, function () {
    templates.load(__dirname + '/../templates/', function () {

      function pushFile(filename) {    
        console.log('Adding', filename.toString().bold, 'to queue');
        funs.push(
          function (next) {
            parser.parseFile(filename, function (blocks) {
              transform(blocks, blockTree);
              next();
            });      
          }
        );
      }

      args.forEach(function (a, i) {
        if (i > 1) {
          if (a[a.length - 1] === '/') {
            var files = fs.readdirSync(a);
            if (files) {
              files.forEach(function (f) {
                if (f.indexOf('.js') > 0) {
                  pushFile(a + f);
                }
              });
            }
          } else if (a.indexOf('.js')) {
            pushFile(a);
          }   
        }
      });

      async.waterfall(funs, function () {
        fs.writeFile(outdir + 'tree.json', JSON.stringify(blockTree, undefined, '  ', function (err) {
          return err && console.log('Error when writing json'.red, err);
        }));

        templates.dmp('docs', outdir + 'output.md', blockTree, function () {

        });
      });
    });
  });
}

fs.readFile('.skald', function (err, data) {
  if (err) return fromArgs();

  try {
    data = JSON.parse(data.toString());

    data.output = data.output || outdir;
    data.name = data.name || 'Untitled Application';

    if (data.sources && data.sources.forEach) {
      processFiles(data.sources, data.output, data.name);
    } else if (data.groups) {
      Object.keys(data.groups).forEach(function (name) {
        processFiles(data.groups[name], data.output, name.replace(/\s/g, '-'));
      });
    }

  } catch (e) {
    console.log('error parsing skald file'.red, e);
  }
});
