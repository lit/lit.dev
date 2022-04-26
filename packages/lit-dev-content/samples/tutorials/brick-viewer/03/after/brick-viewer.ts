import { LitElement,PropertyValues, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// @ts-ignore
import * as THREE from "three";
// @ts-ignore
import { LDrawLoader } from "three/examples/jsm/loaders/LDrawLoader.js";
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

@customElement("brick-viewer")
export class BrickViewer extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String })
  src: string | null = null;

  @property({ type: Number, reflect: true })
  step?: number;

  private _scene = new THREE.Scene();
  private _renderer = new THREE.WebGLRenderer({ antialias: true });
  private _camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
  private _controls = new OrbitControls(this._camera, this._renderer.domElement);
  private _loader = new LDrawLoader();
  private _model: any;
  private _numConstructionSteps?: number;

  async firstUpdated() {
    this._camera = new THREE.PerspectiveCamera(
      45,
      this.clientWidth / this.clientHeight,
      1,
      10000
    );
    this._camera.position.set(150, 200, 250);

    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0xdeebed);

    const ambientLight = new THREE.AmbientLight(0xdeebed, 0.4);
    this._scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-1000, 1200, 1500);
    this._scene.add(directionalLight);

    this._renderer = new THREE.WebGLRenderer({ antialias: true });
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(this.offsetWidth, this.offsetHeight);

    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.addEventListener("change", () =>
      requestAnimationFrame(this._animate)
    );

    (this._loader as any).separateObjects = true;

    this._animate();

    const resizeObserver = new ResizeObserver(this._onResize);
    resizeObserver.observe(this);
  }

  private _onResize = (entries: ResizeObserverEntry[]) => {
    const { width, height } = entries[0].contentRect;
    this._renderer.setSize(width, height);
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
    requestAnimationFrame(this._animate);
  };

  render() {
    return html`
      ${this._renderer.domElement}
    `;
  }

  update(changedProperties: PropertyValues) {
    if (changedProperties.has('src')) {
      this._loadModel();
    }
    if (changedProperties.has('step')) {
      this._updateBricksVisibility();
    }
    super.update(changedProperties);
  }

  private _updateBricksVisibility() {
    this._model && this._model.traverse((c: any) => {
      if (c.isGroup && this.step) {
        c.visible = c.userData.constructionStep <= this.step;
      }
    });
    requestAnimationFrame(this._animate.bind(this));
    this.requestUpdate();
  }

  private _loadModel() {
    if (this.src === null) {
      return;
    }
    this._loader
        .setPath('')
        // Using our src property!
        .load(this.src, (newModel: any) => {

          if (this._model !== undefined) {
            this._scene.remove(this._model);
            this._model = undefined;
          }

          this._model = newModel;

          // Convert from LDraw coordinates: rotate 180 degrees around OX
          this._model.rotation.x = Math.PI;
          this._scene.add(this._model);

          this._numConstructionSteps = this._model.userData.numConstructionSteps;

          const bbox = new THREE.Box3().setFromObject(this._model);
          this._controls.target.copy(bbox.getCenter(new THREE.Vector3()));
          this._controls.update();
          this._controls.saveState();

          this.step ??= this._numConstructionSteps!;
          this._updateBricksVisibility();
        });
  }

  private _animate = () => {
    this._renderer.render(this._scene, this._camera);
  };
}
