/******************************************************************************

js-skald - the simple JavaScript documentation generator

Copryright 2016 (c), Chris Vasseng <chris@tinkerer.xyz>

Licensed under the MIT license. See attached LICENSE file.

******************************************************************************/



module.exports = function (blocks, tree) {
  var indexedBlocks = {},
      blockTree = tree || {
        name: 'global',
        namespaces: {},
        children: []
      }
  ;

  //For quickly resolving all blocks
  blocks.forEach(function (b) {
    var block = b.data;
    block.info.fullName = block.info.namespace.concat(block.info.name).join('.');
    indexedBlocks[block.info.fullName] = block;
  });

  //Now build the tree
  blocks.forEach(function (b) {
    var block = b.data,
        secondary, 
        ns = block.info.namespace,
        target = blockTree
    ;

    if (!b.isEnabled()) {
      return;
    }

    if (block.info.isMember) {
      //We need to resolve it
      secondary = indexedBlocks[block.info.namespace.join('.')];
      
      if (secondary) {
        if (block.info.type === 'function') {
          secondary.methods = secondary.methods || [];
          secondary.methods.push(block);
        } else {
          secondary.members = secondary.members || [];
          secondary.members.push(block);
        }
      } else {
        console.log('[error]'.red, block.info.fullName, 'references a 404 parent. Looking for', block.info.namespace.join('.'));
      }

    } else {
      ns.forEach(function (ns) {
        target.namespaces = target.namespaces || {};
        
        target.namespaces[ns] = target.namespaces[ns] || {
          namespaces: {},
          children: []
        };

        target = target.namespaces[ns];
      });

      target.children.push(block);
    }
  });

  return blockTree;
};