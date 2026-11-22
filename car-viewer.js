(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * @typedef {[number, number, number]} Vec3
   * @typedef {{ pts: Vec3[]; fill: string; stroke?: string; lineWidth?: number; glow?: string }} Poly3D
   * @typedef {{ yaw: number; pitch: number; zoom: number }} CameraState
   */

  /** @type {Record<string, CameraState>} */
  const PRESETS = {
    hero: { yaw: -0.62, pitch: 0.24, zoom: 1.0 },
    front: { yaw: 0.0, pitch: 0.14, zoom: 1.08 },
    side: { yaw: -Math.PI / 2, pitch: 0.12, zoom: 1.05 },
    rear: { yaw: Math.PI, pitch: 0.18, zoom: 1.08 },
    top: { yaw: -0.5, pitch: 1.05, zoom: 0.96 },
  };

  /**
   * Generates a sleek stylized hatchback/sedan 3D mesh centered at origin.
   * Coordinates: X = left/right, Y = up, Z = front(+)/back(-).
   * @returns {Poly3D[]}
   */
  function buildDemoCarMesh() {
    /** @type {Poly3D[]} */
    const polys = [];

    /**
     * @param {number} x1
     * @param {number} y1
     * @param {number} z1
     * @param {number} x2
     * @param {number} y2
     * @param {number} z2
     * @param {string} fill
     * @param {string} [stroke]
     */
    const addBox = (x1, y1, z1, x2, y2, z2, fill, stroke) => {
      /** @type {Vec3[]} */
      const v = [
        [x1, y1, z1], [x2, y1, z1], [x2, y2, z1], [x1, y2, z1],
        [x1, y1, z2], [x2, y1, z2], [x2, y2, z2], [x1, y2, z2],
      ];
      /** @type {number[][]} */
      const faces = [
        [4, 5, 6, 7], // front
        [1, 0, 3, 2], // back
        [3, 7, 6, 2], // top
        [0, 1, 5, 4], // bottom
        [0, 4, 7, 3], // left
        [5, 1, 2, 6], // right
      ];
      for (const f of faces) {
        polys.push({ pts: f.map((i) => v[i]), fill, stroke });
      }
    };

    // Sculpted lower body (trapezoidal profiles along Z)
    /**
     * @param {Array<{ z: number; yBot: number; yTop: number; wBot: number; wTop: number }>} sections
     * @param {{ top: string; side: string; front: string; back: string; stroke: string }} colors
     */
    const addLoft = (sections, colors) => {
      for (let i = 0; i < sections.length - 1; i++) {
        const a = sections[i];
        const b = sections[i + 1];
        // Left side
        polys.push({
          pts: [
            [-a.wBot, a.yBot, a.z],
            [-b.wBot, b.yBot, b.z],
            [-b.wTop, b.yTop, b.z],
            [-a.wTop, a.yTop, a.z],
          ],
          fill: colors.side,
          stroke: colors.stroke,
        });
        // Right side
        polys.push({
          pts: [
            [b.wBot, b.yBot, b.z],
            [a.wBot, a.yBot, a.z],
            [a.wTop, a.yTop, a.z],
            [b.wTop, b.yTop, b.z],
          ],
          fill: colors.side,
          stroke: colors.stroke,
        });
        // Top
        polys.push({
          pts: [
            [-a.wTop, a.yTop, a.z],
            [-b.wTop, b.yTop, b.z],
            [b.wTop, b.yTop, b.z],
            [a.wTop, a.yTop, a.z],
          ],
          fill: colors.top,
          stroke: colors.stroke,
        });
        // Bottom
        polys.push({
          pts: [
            [-b.wBot, b.yBot, b.z],
            [-a.wBot, a.yBot, a.z],
            [a.wBot, a.yBot, a.z],
            [b.wBot, b.yBot, b.z],
          ],
          fill: "#18181b",
        });
      }
      const first = sections[0];
      const last = sections[sections.length - 1];
      // Rear cap
      polys.push({
        pts: [
          [first.wBot, first.yBot, first.z],
          [-first.wBot, first.yBot, first.z],
          [-first.wTop, first.yTop, first.z],
          [first.wTop, first.yTop, first.z],
        ],
        fill: colors.back,
        stroke: colors.stroke,
      });
      // Front cap
      polys.push({
        pts: [
          [-last.wBot, last.yBot, last.z],
          [last.wBot, last.yBot, last.z],
          [last.wTop, last.yTop, last.z],
          [-last.wTop, last.yTop, last.z],
        ],
        fill: colors.front,
        stroke: colors.stroke,
      });
    };

    // Sculpted modern hatchback/sedan body (matching drive.svg silver-graphite palette)
    addLoft(
      [
        { z: -2.06, yBot: 0.36, yTop: 0.78, wBot: 0.76, wTop: 0.72 },
        { z: -1.86, yBot: 0.28, yTop: 0.90, wBot: 0.84, wTop: 0.81 },
        { z: -1.15, yBot: 0.24, yTop: 0.94, wBot: 0.87, wTop: 0.84 },
        { z: 0.75, yBot: 0.24, yTop: 0.91, wBot: 0.87, wTop: 0.84 },
        { z: 1.56, yBot: 0.26, yTop: 0.78, wBot: 0.84, wTop: 0.79 },
        { z: 1.94, yBot: 0.29, yTop: 0.65, wBot: 0.78, wTop: 0.72 },
        { z: 2.10, yBot: 0.34, yTop: 0.54, wBot: 0.68, wTop: 0.62 },
      ],
      {
        top: "#c4c7cc",
        side: "#9fa3aa",
        front: "#888c94",
        back: "#82868e",
        stroke: "rgba(255,255,255,0.16)",
      }
    );

    // Lower dark rocker skirt / bumper trim
    addBox(-0.84, 0.20, -1.78, 0.84, 0.27, 1.82, "#24262b", "rgba(255,255,255,0.06)");

    // Sculpted greenhouse cabin (curved hatchback roofline + tinted glass)
    addLoft(
      [
        { z: -1.68, yBot: 0.90, yTop: 0.96, wBot: 0.78, wTop: 0.70 },
        { z: -1.22, yBot: 0.93, yTop: 1.38, wBot: 0.80, wTop: 0.62 },
        { z: -0.45, yBot: 0.93, yTop: 1.44, wBot: 0.81, wTop: 0.63 },
        { z: 0.28, yBot: 0.92, yTop: 1.40, wBot: 0.80, wTop: 0.62 },
        { z: 0.98, yBot: 0.90, yTop: 0.93, wBot: 0.78, wTop: 0.72 },
      ],
      {
        top: "#cfd2d7",
        side: "#272d36",
        front: "#222832",
        back: "#252b34",
        stroke: "rgba(155, 200, 255, 0.24)",
      }
    );

    // Subtle blue panoramic contour accents along roof
    addBox(-0.60, 1.43, -1.16, -0.57, 1.455, 0.24, "#2997ff");
    addBox(0.57, 1.43, -1.16, 0.60, 1.455, 0.24, "#2997ff");

    // Front grille
    polys.push({
      pts: [
        [-0.46, 0.34, 2.11],
        [0.46, 0.34, 2.11],
        [0.42, 0.50, 2.11],
        [-0.42, 0.50, 2.11],
      ],
      fill: "#1a1b1f",
      stroke: "rgba(255,255,255,0.18)",
    });

    // Sleek LED Headlights
    polys.push({
      pts: [
        [-0.72, 0.50, 2.02],
        [-0.44, 0.50, 2.11],
        [-0.46, 0.58, 2.08],
        [-0.74, 0.58, 1.96],
      ],
      fill: "#bfe4ff",
      stroke: "#2997ff",
      glow: "rgba(41, 151, 255, 0.75)",
    });
    polys.push({
      pts: [
        [0.44, 0.50, 2.11],
        [0.72, 0.50, 2.02],
        [0.74, 0.58, 1.96],
        [0.46, 0.58, 2.08],
      ],
      fill: "#bfe4ff",
      stroke: "#2997ff",
      glow: "rgba(41, 151, 255, 0.75)",
    });

    // Full-width LED Taillight bar
    polys.push({
      pts: [
        [0.70, 0.64, -2.07],
        [-0.70, 0.64, -2.07],
        [-0.68, 0.72, -2.06],
        [0.68, 0.72, -2.06],
      ],
      fill: "#ff453a",
      stroke: "#ff6961",
      glow: "rgba(255, 69, 58, 0.6)",
    });

    // Side mirrors
    addBox(-1.01, 0.88, 0.52, -0.84, 0.97, 0.65, "#c4c7cc", "rgba(255,255,255,0.18)");
    addBox(0.84, 0.88, 0.52, 1.01, 0.97, 0.65, "#c4c7cc", "rgba(255,255,255,0.18)");

    // Wheels (positioned cleanly proud of the body with crisp alloy rims)
    /** @type {Array<[number, number, number]>} */
    const wheelPositions = [
      [-0.90, 0.34, 1.24],
      [0.90, 0.34, 1.24],
      [-0.90, 0.34, -1.24],
      [0.90, 0.34, -1.24],
    ];
    const segs = 14;
    const rOuter = 0.34;
    const rRim = 0.21;
    const halfW = 0.12;

    for (const [wx, wy, wz] of wheelPositions) {
      const sign = wx < 0 ? -1 : 1;
      const xOut = wx + sign * halfW;
      const xIn = wx - sign * halfW;
      /** @type {Vec3[]} */
      const outerFace = [];
      /** @type {Vec3[]} */
      const rimFace = [];

      for (let i = 0; i < segs; i++) {
        const a0 = (i / segs) * Math.PI * 2;
        const a1 = ((i + 1) / segs) * Math.PI * 2;
        const c0 = Math.cos(a0);
        const s0 = Math.sin(a0);
        const c1 = Math.cos(a1);
        const s1 = Math.sin(a1);
        outerFace.push([xOut, wy + s0 * rOuter, wz + c0 * rOuter]);
        rimFace.push([xOut + sign * 0.012, wy + s0 * rRim, wz + c0 * rRim]);
        // Tire tread segment
        polys.push({
          pts: [
            [xIn, wy + s0 * rOuter, wz + c0 * rOuter],
            [xOut, wy + s0 * rOuter, wz + c0 * rOuter],
            [xOut, wy + s1 * rOuter, wz + c1 * rOuter],
            [xIn, wy + s1 * rOuter, wz + c1 * rOuter],
          ],
          fill: "#1b1c20",
        });
      }
      if (sign < 0) {
        outerFace.reverse();
        rimFace.reverse();
      }
      polys.push({ pts: outerFace, fill: "#26282d", stroke: "rgba(255,255,255,0.14)", glow: "rgba(0,0,0,0.01)" });
      polys.push({ pts: rimFace, fill: "#b8bcc2", stroke: "rgba(41,151,255,0.45)", glow: "rgba(0,0,0,0.01)" });
    }

    return polys;
  }

  /**
   * Projects and renders the built-in 3D car onto a 2D canvas.
   * @param {HTMLCanvasElement} canvas
   * @param {{ interactive: boolean; initialPreset?: string }} options
   */
  function createCanvasDemoViewer(canvas, options) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const mesh = buildDemoCarMesh();
    const initial = PRESETS[options.initialPreset || "hero"] || PRESETS.hero;

    /** @type {CameraState} */
    const current = { ...initial };
    /** @type {CameraState} */
    const target = { ...initial };

    let autoRotate = !prefersReducedMotion;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let disposed = false;
    let rafId = 0;

    /** @param {Vec3} p */
    const transformPoint = (p) => {
      const cy = Math.cos(current.yaw);
      const sy = Math.sin(current.yaw);
      const cp = Math.cos(current.pitch);
      const sp = Math.sin(current.pitch);

      // Center vertically around car middle (y = 0.72)
      const x0 = p[0];
      const y0 = p[1] - 0.68;
      const z0 = p[2];

      const x1 = x0 * cy - z0 * sy;
      const z1 = x0 * sy + z0 * cy;

      const y2 = y0 * cp - z1 * sp;
      const z2 = y0 * sp + z1 * cp;

      return { x: x1, y: y2, z: z2 };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const renderFrame = () => {
      if (disposed) return;
      resize();

      const w = canvas.width;
      const h = canvas.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (autoRotate && !dragging) {
        target.yaw += options.interactive ? 0.0045 : 0.0065;
      }

      current.yaw += (target.yaw - current.yaw) * 0.1;
      current.pitch += (target.pitch - current.pitch) * 0.1;
      current.zoom += (target.zoom - current.zoom) * 0.1;

      ctx.clearRect(0, 0, w, h);

      // Studio radial backdrop glow
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.45, w * 0.04, w * 0.5, h * 0.52, w * 0.56);
      bgGrad.addColorStop(0, "rgba(41, 151, 255, 0.13)");
      bgGrad.addColorStop(0.45, "rgba(46, 48, 56, 0.18)");
      bgGrad.addColorStop(1, "rgba(24, 24, 27, 0)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const fov = Math.min(w, h) * 1.18 * current.zoom;
      const camDist = 6.2;
      const cx = w * 0.5;
      const cy = h * 0.54;

      /** @param {{ x: number; y: number; z: number }} pt */
      const project = (pt) => {
        const scale = fov / Math.max(1.2, camDist - pt.z);
        return {
          x: cx + pt.x * scale,
          y: cy - pt.y * scale,
          z: pt.z,
        };
      };

      // Draw studio turntable ring on floor (y = 0)
      /**
       * @param {number} radius
       * @param {string} strokeStyle
       * @param {number} lineWidth
       * @param {boolean} [dashed]
       */
      const drawFloorRing = (radius, strokeStyle, lineWidth, dashed = false) => {
        ctx.save();
        ctx.beginPath();
        const steps = 64;
        for (let i = 0; i <= steps; i++) {
          const a = (i / steps) * Math.PI * 2;
          const p = project(transformPoint([Math.cos(a) * radius, 0.01, Math.sin(a) * radius]));
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth * dpr;
        if (dashed) ctx.setLineDash([6 * dpr, 8 * dpr]);
        ctx.stroke();
        ctx.restore();
      };

      drawFloorRing(2.85, "rgba(255, 255, 255, 0.08)", 1);
      drawFloorRing(2.42, "rgba(41, 151, 255, 0.24)", 1.2, true);

      // Soft ground shadow oval
      ctx.save();
      ctx.beginPath();
      const shadowSteps = 28;
      for (let i = 0; i <= shadowSteps; i++) {
        const a = (i / shadowSteps) * Math.PI * 2;
        const p = project(transformPoint([Math.cos(a) * 1.18, 0.02, Math.sin(a) * 2.28]));
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.fillStyle = "rgba(0, 0, 0, 0.48)";
      ctx.fill();
      ctx.restore();

      // Light direction in view space (overhead studio key light)
      const lx = 0.32;
      const ly = 0.78;
      const lz = 0.54;

      /** @type {Array<{ pts2: Array<{ x: number; y: number }>; depth: number; shade: number; poly: Poly3D }>} */
      const renderList = [];

      for (const poly of mesh) {
        const tPts = poly.pts.map(transformPoint);
        const a = tPts[0];
        const b = tPts[1];
        const c = tPts[2];

        // Face normal in view space
        const ux = b.x - a.x;
        const uy = b.y - a.y;
        const uz = b.z - a.z;
        const vx = c.x - a.x;
        const vy = c.y - a.y;
        const vz = c.z - a.z;
        let nx = uy * vz - uz * vy;
        let ny = uz * vx - ux * vz;
        let nz = ux * vy - uy * vx;
        const len = Math.hypot(nx, ny, nz) || 1;
        nx /= len;
        ny /= len;
        nz /= len;

        // Average depth for painter's sort
        let depth = 0;
        for (const p of tPts) depth += p.z;
        depth /= tPts.length;

        const pts2 = tPts.map(project);
        // Screen-space area for backface culling (keep glowing lights/rims always crisp)
        const area =
          (pts2[1].x - pts2[0].x) * (pts2[2].y - pts2[0].y) -
          (pts2[2].x - pts2[0].x) * (pts2[1].y - pts2[0].y);
        if (!poly.glow && area > 0) continue;

        const dot = Math.max(0, nx * lx + ny * ly + nz * lz);
        const shade = 0.62 + dot * 0.45;
        renderList.push({ pts2, depth, shade, poly });
      }

      renderList.sort((p1, p2) => p1.depth - p2.depth);

      for (const item of renderList) {
        ctx.save();
        ctx.beginPath();
        item.pts2.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();

        if (item.poly.glow) {
          ctx.shadowColor = item.poly.glow;
          ctx.shadowBlur = 14 * dpr;
          ctx.fillStyle = item.poly.fill;
          ctx.fill();
        } else {
          ctx.fillStyle = shadeHex(item.poly.fill, item.shade);
          ctx.fill();
        }

        if (item.poly.stroke) {
          ctx.strokeStyle = item.poly.stroke;
          ctx.lineWidth = (item.poly.lineWidth || 1) * dpr;
          ctx.stroke();
        }
        ctx.restore();
      }

      if (!prefersReducedMotion || dragging || Math.abs(target.yaw - current.yaw) > 0.001 || Math.abs(target.pitch - current.pitch) > 0.001 || Math.abs(target.zoom - current.zoom) > 0.001) {
        rafId = window.requestAnimationFrame(renderFrame);
      } else {
        rafId = 0;
      }
    };

    const wake = () => {
      if (!rafId && !disposed) rafId = window.requestAnimationFrame(renderFrame);
    };

    if (options.interactive) {
      /** @param {PointerEvent} e */
      const onPointerDown = (e) => {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
        wake();
      };
      /** @param {PointerEvent} e */
      const onPointerMove = (e) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        target.yaw -= dx * 0.0085;
        target.pitch = Math.max(0.05, Math.min(1.22, target.pitch + dy * 0.0065));
        wake();
      };
      const onPointerUp = () => {
        dragging = false;
      };
      /** @param {WheelEvent} e */
      const onWheel = (e) => {
        e.preventDefault();
        target.zoom = Math.max(0.7, Math.min(1.55, target.zoom - e.deltaY * 0.0008));
        wake();
      };

      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerUp);
      canvas.addEventListener("wheel", onWheel, { passive: false });
    }

    window.addEventListener("resize", wake);
    wake();

    return {
      /** @param {string} name */
      setPreset(name) {
        const p = PRESETS[name] || PRESETS.hero;
        target.yaw = p.yaw;
        target.pitch = p.pitch;
        target.zoom = p.zoom;
        wake();
      },
      /** @param {boolean} enabled */
      setAutoRotate(enabled) {
        autoRotate = enabled;
        wake();
      },
      reset() {
        target.yaw = initial.yaw;
        target.pitch = initial.pitch;
        target.zoom = initial.zoom;
        wake();
      },
      dispose() {
        disposed = true;
        if (rafId) window.cancelAnimationFrame(rafId);
        window.removeEventListener("resize", wake);
      },
    };
  }

  /**
   * Adjusts hex color brightness by factor.
   * @param {string} hex
   * @param {number} factor
   */
  function shadeHex(hex, factor) {
    if (!hex.startsWith("#") || hex.length !== 7) return hex;
    const r = Math.min(255, Math.round(parseInt(hex.slice(1, 3), 16) * factor));
    const g = Math.min(255, Math.round(parseInt(hex.slice(3, 5), 16) * factor));
    const b = Math.min(255, Math.round(parseInt(hex.slice(5, 7), 16) * factor));
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Dynamically loads Three.js to render real .glb / .gltf car models.
   * Only invoked when a model URL or local file is provided.
   * @param {HTMLElement} mountEl
   * @param {string} modelUrl
   * @param {(msg: string) => void} setStatus
   */
  async function createThreeGlbViewer(mountEl, modelUrl, setStatus) {
    setStatus("Завантажуємо 3D-модель…");

    const base = "https://cdn.jsdelivr.net/npm/three@0.170.0";
    /** @type {(specifier: string) => Promise<any>} */
    const dynImport = /** @type {any} */ (new Function("u", "return import(u)"));

    const THREE = await dynImport(`${base}/build/three.module.js`);
    const { OrbitControls } = await dynImport(`${base}/examples/jsm/controls/OrbitControls.js`);
    const { GLTFLoader } = await dynImport(`${base}/examples/jsm/loaders/GLTFLoader.js`);
    const { RoomEnvironment } = await dynImport(`${base}/examples/jsm/environments/RoomEnvironment.js`);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = "car-webgl-canvas";

    mountEl.innerHTML = "";
    mountEl.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.05, 100);
    camera.position.set(3.8, 1.8, 4.4);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 2.2;
    controls.maxDistance = 10.5;
    controls.autoRotate = !prefersReducedMotion;
    controls.autoRotateSpeed = 0.95;

    // Studio lights
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x2997ff, 1.1);
    rimLight.position.set(-5, 4, -5);
    scene.add(rimLight);

    // Subtle studio turntable floor
    const floorGeo = new THREE.CircleGeometry(3.2, 64);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const ringGeo = new THREE.RingGeometry(2.6, 2.63, 72);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x2997ff, opacity: 0.35, transparent: true, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.004;
    scene.add(ring);

    const loader = new GLTFLoader();
    await new Promise((resolve, reject) => {
      loader.load(
        modelUrl,
        /** @param {any} gltf */
        (gltf) => {
          const model = gltf.scene;
          model.traverse(
            /** @param {any} node */
            (node) => {
              if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
              }
            }
          );

          // Normalize scale & place neatly on floor y = 0
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          const scale = 3.8 / maxDim;
          model.scale.setScalar(scale);

          const scaledBox = new THREE.Box3().setFromObject(model);
          const center = scaledBox.getCenter(new THREE.Vector3());
          model.position.x -= center.x;
          model.position.z -= center.z;
          model.position.y -= scaledBox.min.y;

          scene.add(model);
          controls.target.set(0, (scaledBox.max.y - scaledBox.min.y) * 0.42, 0);
          controls.update();
          resolve(undefined);
        },
        undefined,
        reject
      );
    });

    setStatus("");

    const resize = () => {
      const rect = mountEl.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    window.addEventListener("resize", resize);
    resize();

    let disposed = false;
    let rafId = 0;
    const animate = () => {
      if (disposed) return;
      controls.update();
      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(animate);
    };
    animate();

    /** @type {Record<string, [number, number, number]>} */
    const threePresets = {
      hero: [3.8, 1.7, 4.4],
      front: [0.0, 1.35, 5.4],
      side: [5.4, 1.35, 0.0],
      rear: [0.0, 1.45, -5.4],
      top: [0.1, 6.2, 1.2],
    };

    return {
      /** @param {string} name */
      setPreset(name) {
        const pos = threePresets[name] || threePresets.hero;
        camera.position.set(pos[0], pos[1], pos[2]);
        controls.update();
      },
      /** @param {boolean} enabled */
      setAutoRotate(enabled) {
        controls.autoRotate = enabled;
      },
      reset() {
        camera.position.set(3.8, 1.7, 4.4);
        controls.update();
      },
      dispose() {
        disposed = true;
        if (rafId) window.cancelAnimationFrame(rafId);
        window.removeEventListener("resize", resize);
        controls.dispose();
        pmrem.dispose();
        renderer.dispose();
      },
    };
  }

  // 1. Initialize compact 3D preview teaser on index.html (if present)
  const previewCanvas = document.querySelector("[data-car-preview]");
  if (previewCanvas instanceof HTMLCanvasElement) {
    createCanvasDemoViewer(previewCanvas, { interactive: false, initialPreset: "hero" });
  }

  // 2. Initialize full 3D showroom stage on car.html (if present)
  const stage = document.querySelector("[data-car-stage]");
  if (!(stage instanceof HTMLElement)) return;

  const viewport = stage.querySelector("[data-car-viewport]");
  const statusEl = stage.querySelector("[data-car-status]");
  const badgeEl = stage.querySelector("[data-car-mode-badge]");
  const uploadWrap = stage.querySelector("[data-car-upload-wrap]");
  const fileInput = stage.querySelector("[data-car-file-input]");
  const restoreBtn = stage.querySelector("[data-car-restore-demo]");
  const autoRotateBtn = stage.querySelector("[data-car-autorotate]");
  const resetBtn = stage.querySelector("[data-car-reset]");
  const presetButtons = Array.from(stage.querySelectorAll("[data-car-preset]"));

  if (!(viewport instanceof HTMLElement)) return;

  /** @type {{ setPreset: (n: string) => void; setAutoRotate: (e: boolean) => void; reset: () => void; dispose: () => void } | null} */
  let activeController = null;
  let activeObjectUrl = "";
  let autoRotateState = !prefersReducedMotion;

  /** @param {string} msg */
  const setStatus = (msg) => {
    if (!(statusEl instanceof HTMLElement)) return;
    statusEl.textContent = msg;
    statusEl.hidden = !msg;
  };

  /** @param {string} activeName */
  const markPreset = (activeName) => {
    for (const btn of presetButtons) {
      btn.classList.toggle("is-active", btn.getAttribute("data-car-preset") === activeName);
    }
  };

  const mountDemo = () => {
    activeController?.dispose();
    if (activeObjectUrl) {
      URL.revokeObjectURL(activeObjectUrl);
      activeObjectUrl = "";
    }
    viewport.innerHTML = "";
    const canvas = document.createElement("canvas");
    canvas.className = "car-demo-canvas";
    canvas.setAttribute("aria-label", "Інтерактивна 3D-демонстрація автомобіля");
    viewport.appendChild(canvas);

    activeController = createCanvasDemoViewer(canvas, { interactive: true, initialPreset: "hero" });
    activeController?.setAutoRotate(autoRotateState);
    if (badgeEl) badgeEl.textContent = "Інтерактивний 3D-макет · Готово для .glb";
    if (restoreBtn instanceof HTMLElement) restoreBtn.hidden = true;
    setStatus("");
    markPreset("hero");
  };

  /**
   * @param {string} url
   * @param {string} label
   * @param {boolean} isLocalPreview
   */
  const mountGlb = async (url, label, isLocalPreview) => {
    try {
      activeController?.dispose();
      activeController = null;
      const controller = await createThreeGlbViewer(viewport, url, setStatus);
      activeController = controller;
      activeController.setAutoRotate(autoRotateState);
      if (badgeEl) badgeEl.textContent = label;
      if (restoreBtn instanceof HTMLElement) restoreBtn.hidden = !isLocalPreview;
      markPreset("hero");
    } catch {
      mountDemo();
      setStatus("Не вдалося завантажити .glb модель. Перевірте інтернет або формат файлу (.glb / .gltf).");
    }
  };

  // Wire controls
  for (const btn of presetButtons) {
    btn.addEventListener("click", () => {
      const preset = btn.getAttribute("data-car-preset") || "hero";
      activeController?.setPreset(preset);
      markPreset(preset);
    });
  }

  if (autoRotateBtn instanceof HTMLButtonElement) {
    const syncAutoBtn = () => {
      autoRotateBtn.setAttribute("aria-pressed", String(autoRotateState));
      autoRotateBtn.classList.toggle("is-active", autoRotateState);
    };
    syncAutoBtn();
    autoRotateBtn.addEventListener("click", () => {
      autoRotateState = !autoRotateState;
      activeController?.setAutoRotate(autoRotateState);
      syncAutoBtn();
    });
  }

  if (resetBtn instanceof HTMLButtonElement) {
    resetBtn.addEventListener("click", () => {
      activeController?.reset();
      markPreset("hero");
    });
  }

  if (restoreBtn instanceof HTMLButtonElement) {
    restoreBtn.addEventListener("click", () => {
      mountDemo();
    });
  }

  /** @param {File | null | undefined} file */
  const handleLocalFile = (file) => {
    if (!file) return;
    if (!/\.(glb|gltf)$/i.test(file.name)) {
      setStatus("Підтримуються файли формату .glb або .gltf.");
      return;
    }
    if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = URL.createObjectURL(file);
    void mountGlb(activeObjectUrl, `3D-модель · ${file.name}`, true);
  };

  if (fileInput instanceof HTMLInputElement) {
    fileInput.addEventListener("change", () => {
      handleLocalFile(fileInput.files?.[0]);
      fileInput.value = "";
    });
  }

  // Drag & drop support for .glb files right on the 3D stage
  stage.addEventListener("dragover", (e) => {
    e.preventDefault();
    stage.classList.add("is-dragover");
  });
  stage.addEventListener("dragleave", () => {
    stage.classList.remove("is-dragover");
  });
  stage.addEventListener("drop", (e) => {
    e.preventDefault();
    stage.classList.remove("is-dragover");
    handleLocalFile(e.dataTransfer?.files?.[0]);
  });

  // Boot: use configured carModel if present, otherwise built-in interactive 3D studio car
  const configuredModel =
    typeof contactSettings === "object" && contactSettings && typeof contactSettings.carModel === "string"
      ? contactSettings.carModel.trim()
      : "";

  if (configuredModel) {
    if (uploadWrap instanceof HTMLElement) uploadWrap.hidden = true;
    void mountGlb(configuredModel, "Інтерактивний 3D-огляд", false);
  } else {
    mountDemo();
  }
})();
