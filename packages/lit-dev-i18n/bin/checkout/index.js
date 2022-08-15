const path   = require("path");
const fs     = require("fs");
const { merge, create }    = require("./lib");
const remote = path.resolve(__dirname, "../../src/index.md");
const workspace = path.resolve(__dirname, "../../workspace/index.xml");

function checkout(remote, workspace) {
  if(fs.existsSync(workspace)) {
    merge(remote, workspace);
  } else {
    create(remote, workspace);
  }
}

checkout(remote, workspace);