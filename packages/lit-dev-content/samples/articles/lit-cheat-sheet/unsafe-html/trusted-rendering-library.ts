export function renderLibrary() {
  return `<div>
  Often times, external libraries <em>that you trust</em> will return HTML strings that
  you may need to render.
</div>
<style>
  div {
    font-family: sans-serif;
  }
  em {
    font-style: italic;
    text-decoration: underline;
    color: red;
  }
</style>`;
}
