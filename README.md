# stamp-pkg
stamp packaging files such as ```package.json``` and ```README.md``` files into multiple build directories

## Usage
```
stamp-pkg    // default config file name = stamp-pkg.config.js
```
```
stamp-pkg config.file.js    // optional config file name
```

## Configuration
- package_src: ```string``` = source ```package.json``` location
- package_dest: ```string``` = destination ```package.json``` location
- package_ignore: ```string[]``` = list of attributes to ignore in ```package.json```
- package_redefine: ```object[]``` = list of attributes to redefine in ```package.json```
  - key: ```string``` = attribute name in ```package.json```
  - value: ```string``` = value for previous attribute in ```package.json```
- readme_src: ```string``` = source ```README.md``` location
- readme_dest: ```string``` = destination ```README.md``` location
- readme_ignore: ```string[]``` = list of sections to ignore in ```README.md``` by header value
- readme_placeholder_values: ```object[]``` = list of placeholders to be filled in ```README.md```
  - key: ```string``` = placeholder patterns in ```README.md```
  - value: ```string``` = value to fill in the placeholder
  - package: ```string``` = ```package.json``` value to fill in the placeholder


Example ```stamp-pkg.config.js```:
```js
module.exports = [
  {
    package_src:"package.json",
    package_dest:"packages/stamp-pkg/package.json",
    package_ignore:[
      "scripts","devDependencies"
    ],
    package_redefine:[
      {
        key:"name",
        value: "stamp-pkg-cli"
      }
    ],
    readme_src: "templates/README.md",
    readme_dest: "packages/stamp-pkg/README.md",
    readme_ignore: [
      "Description", "Notes"
    ],
    readme_placeholder_values:[
      {
        key:"{{title}}",
        value: "stamp-pkg-cli"
      },
      {
        key:"{{version}}",
        package: "version"
      },
    ],
  }
]
```

## In package.json
Define ```stamp-pkg``` in the ```postbuild``` in ```scripts``` attribute in ```package.json```. This way once the ```build``` creates multiple distribution directories, stamping the ```package.json``` and ```README.md``` would be done as a ```postbuild``` process.
```json
{
  "scripts": {
    "build": "rollup -c",
    "postbuild": "stamp-pkg"
  }
}
```

