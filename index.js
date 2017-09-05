const fs = require('fs');
const mixins  = require('./lib/builtins');

const viewCache = {};

function PRead(filepath){
  return new Promise((res,rej)=>{
    fs.readFile(filepath,'utf8',(err,contents)=>{
      if(err){
        rej(err);
      }
      else{
        res(contents);
      }
    });
  });
}

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
        while(/[a-zA-Z0-9_\.()]/.test(line[t])){
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
      let open = 1;
      let t = i+2;
      while(open > 0){
        if(tokens[t] === "}" && tokens[t+1] === "}") open--;
        t++;
      }
      out+= '"+'+tokens.slice(i+2,t-1).join(" ")+'+"';
      i = t;
    }
    else if(token === "="){

    }
    else{
      if(typeof mixins[token] !== "undefined"){
        let open = 1;
        let t = i+2;
        while(open > 0){
          if(tokens[t] === "{") open++;
          else if(tokens[t] === "}") open--;
          t++;
        }
        out+= mixins[token].before + compile_block(tokens.slice(i+2,t-1),mixins) + mixins[token].after;
        i = t - 1;
      }
      else{
        out+= mixins[token].before + mixins[token].after;
      }
    }
  }
  return out;
}

function compileFile(contents,callback){
    let funcstr = 'out = ';
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
    funcstr+= compiled + ';callback(null,out);';
    let func = new Function('options','callback',funcstr);
    callback(null,func);
}

function inheritTree(filepath){
  return new Promise((res,rej)=>{
    PRead(filepath).then((contents)=>{
      contents = contents.trim();
      if(contents.indexOf("inherits(") === 0){
        let filename = contents.substring(0,contents.indexOf(")"));
        filename = filename.substring(filename.indexOf("(")+1,filename.length);
        let newpath = filepath.replace(/\/[^\/]+$/,"")+filename;
        contents = contents.substring(contents.indexOf("\n"),contents.length);
        inheritTree(newpath).then((pcon)=>{
          let blocks = pcon.match(/block\([^)]+\)/);
          if(blocks){

          }
          let stacks = pcon.match(/stack\([^)]\)/);
          if(stacks){
            
          }
        });
      }
      else{
        res(contents);
      }
    }).catch((err)=>{
      rej(err);
    });
  });
}

function compileFileTree(filepath,callback){
  let source = "";
  inheritTree(filepath).then((contents)=>{
    source = contents;
  });
}

function handleCache(filepath,options,callback){
  if(viewCache[filepath] == undefined){
    compileFileTree(filepath,(err,fn)=>{
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
    // handleCache(filepath,options,callback);
    callback(null,filepath);
}