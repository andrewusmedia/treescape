const fs = require('fs');

function compileFile(contents,options,callback){
    callback(null,"HAHAHA!");
}

exports._express = function(filepath,options,callback){
    if(options.compileDebug == undefined && process.env.NODE_ENV === 'production') {
        options.compileDebug = false;
    }
    fs.readFile(filepath,'utf8',(err,contents)=>{
        if(err){
            if(options.compileDebug){
                console.log(err);
            }
            callback(err);
        }
        else{
            compileFile(contents,options,callback);
        }
    });
}