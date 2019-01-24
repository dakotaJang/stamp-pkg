#!/usr/bin/env node

const [,,...args] = process.argv;

const fs = require('fs');
const configs = require(`${process.cwd()}/${(args[0] ? args[0]: 'stamp-pkg.config')}`);


readFile = (path) => {
  return new Promise((resolve,reject)=>
    {
      fs.readFile(path, 'utf8', function(err, contents) {
        if (err) reject(err);
        resolve(contents);
      });
    }
  )
}

openFile = (path) => {
  return new Promise((resolve,reject)=>{
    fs.open(path, 'w', (err, fd) => {
      if (err) throw err;
      resolve(fd);
    });
  })
}

writeFileDescriptor = (fd,data) => {
  return new Promise((resolve,reject)=>{
    fs.appendFile(fd, data, 'utf8', (err) => {
      if (err) throw err;
      resolve(fd);
    });
  })
}

closeFileDescriptor = (fd) => {
  fs.close(fd, (err) => {
    if (err) throw err;
  });
}

writeFile = (path, data)=>{
  openFile(path)
  .then(fd => writeFileDescriptor(fd,data))
  .then(fd => closeFileDescriptor(fd))
  .catch(err=>console.log(err));
  return data;
}

filter_package_json = (data,filters) => {
  if(!filters || !filters.length){
    return Promise.resolve(data);
  } else {
    return new Promise((resolve,reject) => {
      let packageJson = JSON.parse(data);
      filters.forEach(key => {
        delete packageJson[key]
      });
      resolve(JSON.stringify(packageJson));
    });
  }
}

modify_package_json = (data,modifiers) => {
  if(!modifiers || !modifiers.length){
    return Promise.resolve(data);
  } else {
    return new Promise((resolve,reject) => {
      let packageJson = JSON.parse(data);
      modifiers.forEach(modifier => {
        packageJson[modifier.key] = modifier.value;
      });
      resolve(JSON.stringify(packageJson));
    })
  }
}

copy_package_json = async (src,dest,filters,modifiers) => {
  let package_json = await readFile(src)
  .then(data => filter_package_json(data,filters))
  .then(data => modify_package_json(data,modifiers))
  .then(data => writeFile(dest,data));
  return JSON.parse(package_json);
}

// filters by header labels (headers in the document will have to be unique or this will only remove the first occurrence)
filter_README_md = (data,filters) => {
  if(!filters || !filters.length){
    return Promise.resolve(data);
  } else {
    return new Promise((resolve,reject) => {
      filters.forEach(filter => {
        let startIndex = data.indexOf(`# ${filter}`);
        let headerType = 1;
        for (let i = 1; i < 6; i++) {
          if(data[startIndex-i] != '#'){
            headerType = i;
            break;
          }
        }
        startIndex -= headerType - 1;

        let endIndex = -1;
        for (let i = headerType; i > 1; i--) {
          endIndex = data.indexOf("#".repeat(i),startIndex+headerType);
          if(endIndex > -1) break;
        }
        if(endIndex === -1){
          data = data.slice(0,startIndex)
        }else{
          data = data.slice(0,startIndex) + data.slice(endIndex);
        }
      });
      resolve(data);
    });
  }
}

modify_README_md = (data,modifiers) => {
  if(!modifiers || !modifiers.length){
    return Promise.resolve(data);
  } else {
    return new Promise((resolve,reject) => {
      modifiers.forEach(modifier => {
        let regex = new RegExp(modifier.key,"g");
        data = data.replace(regex,modifier.value);
      });
      resolve(data);
    })
  }
}

copy_README_md = (src,dest,filters,modifiers) => {
  readFile(src)
  .then(data => filter_README_md(data,filters))
  .then(data => modify_README_md(data,modifiers))
  .then(data => writeFile(dest,data))
}

stamp = async (config) => {
  let package_json = await copy_package_json(config.package_src,config.package_dest,config.package_ignore,config.package_redefine);
  for( const x of config.readme_placeholder_values) {
    if (!!x.package){
      x.value = package_json[x.package];
    }
  };
  copy_README_md(config.readme_src,config.readme_dest,config.readme_ignore,config.readme_placeholder_values);
}

main = async () => {
  if (configs.length === undefined) {
    stamp(configs);
  } else {
    for (const config of configs) {
      stamp(config);
    };
  }
}

main();
