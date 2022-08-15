const path   = require("path");
const fs     = require("fs");
const marked = require("marked");
const crypto = require("crypto-js");
const myers = require('myers-diff');
const { XMLParser } = require("fast-xml-parser")

const TODO = 'TODO'

const source = (raw) => [
                          `<Source>`,
                          `${raw}`,
                          `</Source>`
                        ].join("\r\n");

const target = (raw) => [
                          `<Target>`,
                          `${raw}`,
                          `</Target>`
                        ].join("\r\n");

const block = (sourceText, targetText, hash) =>  {
              hash = hash || crypto.SHA1(sourceText).toString();
              return [
                `<Block hash="${hash}">`,
                source(sourceText),
                target(targetText),
                `</Block>`
              ].join('\r\n');
            }

const xml = (content) =>  [
                            `<?xml version="1.0" encoding="utf-8" ?>`,
                            `<Content>`,
                            content,
                            `</Content>`,
                          ].join("\r\n")

function create(input, workspace) {
  const inputRaw = fs.readFileSync(input, { encoding: "utf-8" });
  const lexer = marked.lexer(inputRaw);
  const content = lexer.map(({raw}) => block(raw, TODO)).join("\r\n\r\n");
  const workspaceRaw = xml(content)

  fs.writeFileSync(workspace, workspaceRaw, {encoding: 'utf-8'})
}

function transformToCRLF(raw) {
  return raw && raw.replace(/(\r\n)|\r|\n/g, "\r\n");
}

function merge(remote, workspace) {
  // 读取原始文件
  const remoteRaw = transformToCRLF(fs.readFileSync(remote, { encoding: "utf-8" }));
  const workspaceRaw = transformToCRLF(fs.readFileSync(workspace, { encoding: "utf-8" }));

  // 解析主分支文件 markdown 解析为 Blocks
  const remoteSources = marked.lexer(remoteRaw).map(item => item.raw);
  const remoteBlocks = [];
  remoteSources.forEach((raw) => {
    remoteBlocks.push({
      hash: crypto.SHA1(raw).toString(),
      // trim "\r\n" at start & end
      Source: transformToCRLF(raw),
    })
  })
  
  // 解析本地文件 xml 解析为 Blocks
  const parser = new XMLParser({trimValues: false, ignoreAttributes: false});
  const workspaceJson = parser.parse(workspaceRaw);
  const workspaceBlocks = [];
  workspaceJson.Content.Block.forEach(Block => {
    workspaceBlocks.push({
      hash: Block["@_hash"],
      // trim "\r\n" at start & end
      Source: transformToCRLF(Block.Source)?.slice(2, -2),
      Target: transformToCRLF(Block.Target)?.slice(2, -2),
    })
  })
  const mergedRecords = mergeBlocks(workspaceBlocks, remoteBlocks);
  const mergedRaw = mergeContent(mergedRecords);
  fs.writeFileSync(workspace, mergedRaw, {encoding: 'utf-8'})
}

function mergeBlocks(workspaceBlocks, remoteBlocks) {
  let remoteIndex = -1;
  const records = [];
  while(remoteBlocks[++remoteIndex]) {
    const remoteBlock = remoteBlocks[remoteIndex];
    const blockInWorkspace = workspaceBlocks.find((block) => block.hash === remoteBlock.hash)
    if(blockInWorkspace) {
      records.push({
        workspace: blockInWorkspace
      });
      continue;
    }
    const rangeBlocks = workspaceBlocks.slice(remoteIndex - 4, remoteIndex + 4)
    const similarBlockInWorkspace = findSimilarBlock(rangeBlocks, remoteBlock.Source || "", 0.4);

    if(similarBlockInWorkspace) {
      records.push({
        modified: true,
        remote: remoteBlock,
        workspace: similarBlockInWorkspace,
      })
      continue;
    }

    records.push({
      add: true,
      remote: remoteBlock
    })
  }

  return records

}

function mergeContent(records) {
  const blocks = records.map(record => {
    if(record.add) {
      return {
        Source: record.remote.Source,
        Target: TODO,
        hash: record.remote.hash
      }
    } else if(record.modified) {
      return {
        Source: mergeModifiedText(record.workspace.Source, record.remote.Source),
        Target: record.workspace.Target,
        hash: record.remote.hash
      }
    } else {
      return record.workspace
    }
  })

  const content = blocks.map(({Source, Target, hash}) => block(Source, Target, hash)).join("\r\n");
  return xml(content)
}

function findSimilarBlock(blocks, raw, similarity) {
  const targetLines = raw.split("\r\n");
  const linesOfBlocks = blocks.map(block => block.Source.split("\r\n"));
  const similarities = linesOfBlocks.map(lines => {
    const appearLines = targetLines.filter(line => lines.includes(line));
    return appearLines.length / lines.length;
  })
  const max = Math.max(...similarities);
  if(max >= similarity) {
    const index = similarities.indexOf(max);
    return {
      ...blocks[index],
      Source: blocks[index].Source
    }
  } 
  return null;
}

function mergeModifiedText(lhsText, rhsText) {
  const diffs = myers.diff(lhsText, rhsText);
  const lhsRows = lhsText.split("\r\n");
  const rhsRows = rhsText.split("\r\n");
  const rows = []
  let lhsIndex = 0;
  console.log(diffs)
  diffs.forEach(({lhs, rhs}) => {
    rows.push(...lhsRows.slice(lhsIndex, lhs.at))
    lhsIndex = lhs.at;
    if(lhs.del) {
      const deletedRows = lhsRows.slice(lhsIndex, lhs.at + lhs.del)
      rows.push(...deletedRows.map(item => '--- ' + item))
      lhsIndex = lhs.at + lhs.del;
    }

    if(rhs.add) {
      const addRows = rhsRows.slice(rhs.at, rhs.at + rhs.add);
      rows.push(...addRows.map(item => '+++ ' + item))
    }

  })

  rows.push(...lhsRows.slice(lhsIndex));

  return rows.join("\r\n");
}

module.exports = {
  create,
  merge
}