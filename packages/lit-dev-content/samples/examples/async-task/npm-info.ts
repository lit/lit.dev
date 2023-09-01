import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {Task} from '@lit-labs/task';
import {fetchPackageInfo} from './npm.js';

@customElement('npm-info')
export class NpmInfo extends LitElement {
  @state()
  private _package = 'lit';

  private _fetchNpmInfoTask = new Task(this, {
    task: async ([pkgName], {signal}) => {
      if (pkgName === undefined || pkgName === '') {
        throw new Error('Empty package name');
      }
      return await fetchPackageInfo(pkgName, signal);
    },
    args: () => [this._package],
  });

  render() {
    return html`
      <label>
        Enter a package name:
        <input .value=${this._package} @change=${this._onChange} />
      </label>
      <header>
        <h1>${this._package}</h1>
        <img
          id="logo"
          src="https://raw.githubusercontent.com/npm/logos/master/npm%20logo/npm-logo-red.svg"
          alt="npm logo"
        />
      </header>
      <div>
        ${this._fetchNpmInfoTask.render({
          pending: () => 'Loading...',
          complete: (pkg) => html`
            <h3>${pkg.description}</h3>
            <h4>dist-tags:</h4>
            <ul>
              ${Array.from(Object.entries(pkg['dist-tags'])).map(
                ([tag, version]) => html`<li><pre>${tag}: ${version}</pre></li>`
              )}
            </ul>
          `,
          error: (e) => `Error: ${(e as Error).message}`,
        })}
      </div>
    `;
  }

  private _onChange(e: Event) {
    this._package = (e.target as HTMLInputElement).value;
  }

  static styles = css`
    :host {
      display: block;
      min-width: 300px;
      border-radius: 5px;
      border: solid 1px #aaa;
      padding: 20px;
    }
    header {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
    #logo {
      height: 38px;
      width: auto;
    }
  `;
}

