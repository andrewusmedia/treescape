const fs = require('fs');
const builtins  = require('./lib/builtins');

const viewCache = {};

function tokenize(contents){
  let tokens = [];
  let lines = contents.split('\n');
  let l = lines.length;
  for(let i = 0; i < lines.length; i++){
    let line = lines[i];
    let m = line.length;
    for(let x = 0; x < m; x++){
      if(/\s/.test(line[x])){
        continue;
      }
      else if(/[a-zA-Z0-9_]/.test(line[x])){
        let t = x+1;
        while(/[a-zA-Z0-9_]/.test(line[t])){
          t++;
        }
        tokens.push(line.substring(x,t));
        x = t - 1;
      }
      else if(/[-+*\/{}()?:!|&=,[\]]/.test(line[x])){
        tokens.push(line[x]);
      }
      else if(line[x] === '"'){
        let open = 1;
        let t = x + 1;
        while(open > 0){
          if(line[t] === "\\"){
            t++;
            continue;
          }
          if(line[t] === '"'){
            open--;
          }
          t++;
        }
        tokens.push(line.substring(x,t));
        x = t - 1;
      }
      else if(line[x] === "'"){
        let open = 1;
        let t = x + 1;
        while(open > 0){
          if(line[t] === "\\"){
            t++;
            continue;
          }
          if(line[t] === "'"){
            open--;
          }
          t++;
        }
        tokens.push(line.substring(x,t));
        x = t - 1;
      }
    }
  }
  return tokens;
}

function compile_mixin(call,mixin){

}

function compile_block(tokens,mixins){
  let out = '';
  let l = tokens.length;
  for(let i = 0; i < l; i++){
    let token = tokens[i];
    if(token[0] === '"'){
      out+=tokens[i].substring(1,tokens[i].length -1);
    }
    else if(token === "{" && tokens[i+1] === "{"){
      
    }
    else if(token === "="){

    }
    else{
      if(tokens.length > i && tokens[i+1] === "{"){
        let open = 1;
        let t = i+2;
        while(open > 0){
          if(tokens[t] === "{") open++;
          else if(tokens[t] === "}") open--;
          t++;
        }
        out+= builtins[token].before + compile_block(tokens.slice(i+2,t-1)) + builtins[token].after;
        i = t - 1;
      }
      else{
        beforeString+= builtins[token].before + builtins[token].after;
      }
    }
  }
  return out;
}

function compileFile(contents,callback){
    let funcstr = 'callback(null,';
    let tokens = tokenize(contents);
    let mixins = builtins();
    let compiled = compile_block(tokens,mixins);
    if(compiled.length > 0){
      if(compiled[0] === "+"){
        compiled = compiled.substring(1);
      }
      else{
        compiled = '"'+compiled;
      }
      if(compiled[compiled.length - 1] === "+"){
        compiled = compiled.substring(0,compiled.length - 1);
      }
      else{
        compiled += '"';
      }
    }
    funcstr+= compiled + ');'
    let func = new Function('options','callback',funcstr);
    callback(null,func);
}

function handleCache(filepath,options,callback){
  if(viewCache[filepath] == undefined){
    fs.readFile(filepath,'utf8',(err,contents)=>{
      if(err){
          if(options.compileDebug){
              console.log(err);
          }
          callback(err);
      }
      else{
          compileFile(contents,(err,fn)=>{
            if(err){
              if(options.compileDebug){
                console.log(err);
              }
              callback(err);
            }
            else{
              viewCache[filepath] = fn;
              fn(options,callback);
            }
          });
      }
  });
  }
  else{
    viewCache[filepath](options,callback);
  }
}

exports.name = 'Treescape';

exports._express = function(filepath,options,callback){
    if(callback == undefined && typeof options === 'function'){
      callback = options;
      options = {};
    }
    if(options.compileDebug == undefined && process.env.NODE_ENV === 'production') {
        options.compileDebug = false;
    }
    handleCache(filepath,options,callback);
}