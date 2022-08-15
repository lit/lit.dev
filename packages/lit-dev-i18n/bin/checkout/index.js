const path     = require("path");
const fs       = require("fs");
const minimist = require("minimist")
const { merge, create }    = require("./lib");
const args = minimist(process.argv);
const lang = args.lang
const remote = path.resolve(__dirname, "../../src/index.md");
const workspace = path.resolve(__dirname, "../../workspace/", lang, "./index.xml");
console.log(workspace);

function checkout(remote, workspace) {
  if(fs.existsSync(workspace)) {
    merge(remote, workspace);
  } else {
    create(remote, workspace);
  }
}

checkout(remote, workspace);