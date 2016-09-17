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
