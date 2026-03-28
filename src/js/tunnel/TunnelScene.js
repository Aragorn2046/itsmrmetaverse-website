/* ============================================
   TunnelScene — Three.js particle tunnel
   ============================================ */
import { vertexShader, fragmentShader } from './shaders.js';

const PARTICLE_COUNT = 6000;
const CURVE_POINTS = [
  [0, 0, 0],
  [0, 2, -30],
  [-3, -1, -60],
  [2, 1, -90],
  [0, 0, -120],
];

export class TunnelScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.progress = 0;       // 0–0.7: fly through
    this.disperse = 0;       // 0.7–0.9: particles scatter
    this.fadeOut = 0;         // 0.9–1.0: canvas opacity fade
    this.clock = null;
    this.disposed = false;
    this.raf = null;
  }

  async init() {
    const THREE = await import('three');
    this.THREE = THREE;

    // Clock
    this.clock = new THREE.Clock();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );

    // Curve
    this.curve = new THREE.CatmullRomCurve3(
      CURVE_POINTS.map((p) => new THREE.Vector3(...p)),
      false,
      'catmullrom',
      0.5
    );

    // Sample curve for lookup
    this.curvePoints = this.curve.getSpacedPoints(200);

    // Create particles
    this._createParticles(THREE);

    // Resize handler
    this._onResize = () => this._resize();
    window.addEventListener('resize', this._onResize);

    // Start render loop
    this._animate();
  }

  _createParticles(THREE) {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);
    const angles = new Float32Array(PARTICLE_COUNT);
    const radii = new Float32Array(PARTICLE_COUNT);
    const offsets = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      offsets[i] = Math.random();
      angles[i] = Math.random() * Math.PI * 2;
      radii[i] = 1.5 + Math.random() * 4.5;
      sizes[i] = 0.8 + Math.random() * 2.5;
      speeds[i] = 0.6 + Math.random() * 0.8;

      // Initial positions (will be overwritten each frame)
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute('aAngle', new THREE.BufferAttribute(angles, 1));
    geometry.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1));
    geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1));

    // Teal and purple-ish
    const colorA = new THREE.Color(0x00e5d0);
    const colorB = new THREE.Color(0x8b5cf6);

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uDisperse: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uColorA: { value: colorA },
        uColorB: { value: colorB },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geometry, this.material);
    this.scene.add(this.particles);
  }

  _updateParticlePositions() {
    const positions = this.particles.geometry.attributes.position.array;
    const offsets = this.particles.geometry.attributes.aOffset.array;
    const speeds = this.particles.geometry.attributes.aSpeed.array;

    const curveLen = this.curvePoints.length - 1;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = ((offsets[i] + this.progress * speeds[i]) % 1.0);
      const idx = Math.floor(t * curveLen);
      const point = this.curvePoints[Math.min(idx, curveLen)];

      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  setScroll(scrollProgress) {
    // Map scroll to three phases
    if (scrollProgress <= 0.7) {
      this.progress = scrollProgress / 0.7;
      this.disperse = 0;
      this.fadeOut = 0;
    } else if (scrollProgress <= 0.9) {
      this.progress = 1;
      this.disperse = (scrollProgress - 0.7) / 0.2;
      this.fadeOut = 0;
    } else {
      this.progress = 1;
      this.disperse = 1;
      this.fadeOut = (scrollProgress - 0.9) / 0.1;
    }
  }

  _animate() {
    if (this.disposed) return;

    this.raf = requestAnimationFrame(() => this._animate());

    const elapsed = this.clock.getElapsedTime();

    // Update uniforms
    this.material.uniforms.uTime.value = elapsed;
    this.material.uniforms.uProgress.value = this.progress;
    this.material.uniforms.uDisperse.value = this.disperse;

    // Camera follows the curve
    const camT = Math.min(this.progress * 0.85, 0.99);
    const camPos = this.curve.getPointAt(camT);
    const lookT = Math.min(camT + 0.05, 1.0);
    const lookPos = this.curve.getPointAt(lookT);

    this.camera.position.copy(camPos);
    this.camera.lookAt(lookPos);

    // Update particle positions along curve
    this._updateParticlePositions();

    // Canvas fade
    this.canvas.style.opacity = String(1 - this.fadeOut);

    this.renderer.render(this.scene, this.camera);
  }

  _resize() {
    if (this.disposed) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.material.uniforms.uPixelRatio.value = Math.min(
      window.devicePixelRatio,
      2
    );
  }

  dispose() {
    this.disposed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this._onResize);
    this.particles.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
