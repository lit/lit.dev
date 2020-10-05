import {NodeProp} from "lezer-tree"
import {EditorState} from "@codemirror/next/state"
// import {RangeSetBuilder} from "@codemirror/next/rangeset"
import {javascript} from '@codemirror/next/lang-javascript';
import {defaultTags, TagSystem} from '@codemirror/next/highlight';
import {/* StyleSpec,*/ StyleModule} from "style-mod";

// TODO: StyleSpec isn't exported? It appears to be in
// @codemirror/next/highlight source
type StyleSpec = any;

// TODO: can we get these from @codemirror/next/highlight ?
type Rule = any;
const enum Mode { Opaque, Inherit, Normal }

class StyleRule {
  constructor(public type: number, public flags: number, public specificity: number, public cls: string) {}
}

// Not all of the needed TagSystem API is exported
interface TagSystemInternal extends TagSystem {
  flagMask: number
  typeShift: number
  typeNames: string[];
  typeIDs: {[name: string]: number};
  parents: number[]

  prop: NodeProp<Rule>;

  get(name: string): number;
  specificity(tag: number): number;
}

// TODO: this class is copied from @codemirror/next/highlight,
// maybe it can be exported?
class Styling {
  module: StyleModule;
  rules: readonly StyleRule[]
  cache: {[tag: number]: string} = Object.create(null)

  constructor(private tags: TagSystemInternal, spec: {[name: string]: StyleSpec}) {
    let modSpec = Object.create(null)
    let rules: StyleRule[] = []
    for (let prop in spec) {
      let cls = StyleModule.newName();
      modSpec["." + cls] = spec[prop]
      for (let part of prop.split(/\s*,\s*/)) {
        let tag = tags.get(part)
        rules.push(new StyleRule(tag >> tags.typeShift, tag & tags.flagMask, tags.specificity(tag), cls))
      }
    }
    this.rules = rules.sort((a, b) => b.specificity - a.specificity)
    this.module = new StyleModule(modSpec)
  }

  match(tag: number) {
    let known = this.cache[tag]
    if (known != null) return known
    let result = ""
    let type = tag >> this.tags.typeShift, flags = tag & this.tags.flagMask
    for (;;) {
      for (let rule of this.rules) {
        if (rule.type == type && (rule.flags & flags) == rule.flags) {
          if (result) result += " "
          result += rule.cls
          flags &= ~rule.flags
          if (type) break
        }
      }
      if (type) type = this.tags.parents[type]
      else break
    }
    return this.cache[tag] = result
  }
}

// Note: mostly copied from Highlighter#buildDeco
export const highlight = (contents: string, _lang: string) => {
  const state = EditorState.create({
    doc: contents,
    extensions: [javascript({typescript: true})],
  });
  const tree = state.tree;
  const nodeStack: string[] = [""];
  const classStack: string[] = [""];
  const inheritStack: string[] = [""];
  const prop: NodeProp<Rule> = (defaultTags as TagSystemInternal).prop;
  const styling = new Styling((defaultTags as TagSystemInternal), defaultSpec);

  let result = '';
  let start: number, curClass: string, depth: number
  function flush(pos: number, style: string) {
    if (pos > start) {
      if (style) {
        result += `<span class="${style}">`;
      }
      result += contents.substring(start, pos).replace('<', '&gt;');
      if (style) {
        result += `</span>`;
      }
    }
    start = pos;
  }

  const from = 0, to = contents.length - 1;
  curClass = ""; depth = 0; start = from;
  tree.iterate({
    from, to,
    enter: (type, start) => {
      depth++;
      let inheritedClass = inheritStack[depth - 1];
      let cls = inheritedClass;
      let rule = type.prop(prop);
      let opaque = false;
      while (rule) {
        if (!rule.context.length || matchContext(rule.context, nodeStack, depth)) {
          let style = styling.match(rule.tag);
          if (style) {
            if (cls) cls += " ";
            cls += style;
            if (rule.mode == Mode.Inherit) inheritedClass = cls;
            else if (rule.mode == Mode.Opaque) opaque = true;
          }
          break;
        }
        rule = rule.next;
      }
      if (cls != curClass) {
        flush(start, curClass);
        curClass = cls;
      }
      if (opaque) {
        depth--;
        return false;
      }
      classStack[depth] = cls;
      inheritStack[depth] = inheritedClass;
      nodeStack[depth] = type.name;
      return undefined;
    },
    leave: (_t, _s, end) => {
      depth--;
      let backTo = classStack[depth];
      if (backTo != curClass) {
        flush(Math.min(to, end), curClass);
        curClass = backTo;
      }
    }
  });
  flush(contents.length - 1, '');
  return {
    html: result,
    // TODO: we need to render this module to CSS text
    css: styling.module,
  };
}

function matchContext(context: readonly (null | string)[], stack: readonly string[], depth: number) {
  if (context.length > depth - 1) return false
  for (let d = depth - 1, i = context.length - 1; i >= 0; i--, d--) {
    let check = context[i]
    if (check && check != stack[d]) return false
  }
  return true
}

/// A default highlighter (works well with light themes).
export const defaultSpec: {[name: string]: StyleSpec} = {
  deleted: {textDecoration: "line-through"},
  inserted: {textDecoration: "underline"},
  link: {textDecoration: "underline"},
  strong: {fontWeight: "bold"},
  emphasis: {fontStyle: "italic"},
  keyword: {color: "#708"},
  "atom, bool": {color: "#219"},
  number: {color: "#164"},
  string: {color: "#a11"},
  "regexp, escape, string#2": {color: "#e40"},
  "variableName definition": {color: "#00f"},
  typeName: {color: "#085"},
  className: {color: "#167"},
  "name#2": {color: "#256"},
  "propertyName definition": {color: "#00c"},
  comment: {color: "#940"},
  meta: {color: "#555"},
  invalid: {color: "#f00"},
};
