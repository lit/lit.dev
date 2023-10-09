import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {Task, initialState} from '@lit/task';
import {fetchPackageInfo} from './npm.js';

@customElement('npm-info')
export class NpmInfo extends LitElement {
  @state()
  private _packageName = 'lit';

  /*
   * This is the async Task that fetches data from npm.
   *
   * The current state of the task is rendered below with
   * `this._npmInfoTask.render()`.
   */
  private _npmInfoTask = new Task(this, {
    task: async ([pkgName], {signal}) => {
      if (pkgName === undefined || pkgName === '') {
        // This puts the task back into the INITIAL state
        return initialState;
      }
      return await fetchPackageInfo(pkgName, signal);
    },
    args: () => [this._packageName],
  });

  render() {
    return html`
      <label>
        Enter a package name:
        <input .value=${this._packageName} @change=${this._onChange} />
      </label>
      <header>
        <h1>${this._packageName}</h1>
        <img
          id="logo"
          src="https://raw.githubusercontent.com/npm/logos/master/npm%20logo/npm-logo-red.svg"
          alt="npm logo"
        />
      </header>
      <div>
        ${this._npmInfoTask.render({
          initial: () =>
            html`<span class="initial">
              Enter a package name to display its npm info
            </span>`,
          pending: () =>
            html`Loading npm info for <code>${this._packageName}</code>`,
          complete: (pkg) => html`
            <h3>${pkg.description}</h3>
            <h4>dist-tags:</h4>
            <ul>
              ${map(
                Object.entries(pkg['dist-tags']),
                ([tag, version]) => html`<li><pre>${tag}: ${version}</pre></li>`
              )}
            </ul>
          `,
          error: (e) => html`<span class="error">
            Error: ${(e as Error).message}
              </span>`,
        })}
      </div>
    `;
  }

  private _onChange(e: Event) {
    this._packageName = (e.target as HTMLInputElement).value;
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
    .initial {
      font-style: italic;
    }
    .error {
      color: red;
    }
  `;
}
