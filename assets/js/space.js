/* ============================================================
   IIMADOUU — DEEP FIELD 2
   Scroll-driven WebGL scene:
     · procedural living planet (oceans, continents, ice, clouds)
     · ring system, three moons, asteroid belt
     · second ringed ice world arriving mid-flight
     · black hole with photon ring, accretion disk, jets
     · passing comet, scroll-velocity warp streaks
   three.js is loaded dynamically. If it cannot load, or no frame
   ever renders, the CSS planet in the hero stays in place.
   ============================================================ */
(function () {
  "use strict";

  var canvas = document.getElementById("space3d");
  if (!canvas) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var small = window.matchMedia("(max-width: 860px)").matches;
  /* the scene is soft and glow-heavy, so a lower render resolution is
     indistinguishable but keeps the whole page smooth on modest GPUs */
  var DPR_CAP = small ? 1 : 1.35;

  var CDNS = [
    "https://unpkg.com/three@0.160.0/build/three.module.min.js",
    "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js"
  ];

  function loadThree(i) {
    return import(CDNS[i]).catch(function (err) {
      if (i + 1 < CDNS.length) return loadThree(i + 1);
      throw err;
    });
  }

  /* ---------------- shared GLSL ---------------- */
  var NOISE = [
    "float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }",
    "float noise(vec3 p){",
    "  vec3 i = floor(p); vec3 f = fract(p);",
    "  f = f * f * (3.0 - 2.0 * f);",
    "  float n000 = hash(i);",
    "  float n100 = hash(i + vec3(1.0, 0.0, 0.0));",
    "  float n010 = hash(i + vec3(0.0, 1.0, 0.0));",
    "  float n110 = hash(i + vec3(1.0, 1.0, 0.0));",
    "  float n001 = hash(i + vec3(0.0, 0.0, 1.0));",
    "  float n101 = hash(i + vec3(1.0, 0.0, 1.0));",
    "  float n011 = hash(i + vec3(0.0, 1.0, 1.0));",
    "  float n111 = hash(i + vec3(1.0, 1.0, 1.0));",
    "  float nx00 = mix(n000, n100, f.x);",
    "  float nx10 = mix(n010, n110, f.x);",
    "  float nx01 = mix(n001, n101, f.x);",
    "  float nx11 = mix(n011, n111, f.x);",
    "  return mix(mix(nx00, nx10, f.y), mix(nx01, nx11, f.y), f.z);",
    "}",
    "float fbm5(vec3 p){",
    "  float v = 0.0; float a = 0.5;",
    "  for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; }",
    "  return v;",
    "}"
  ].join("\n");

  var SURFACE_VERT = [
    "varying vec3 vNormal;",
    "varying vec3 vPos;",
    "varying vec3 vObj;",
    "void main(){",
    "  vNormal = normalize(normalMatrix * normal);",
    "  vObj = normalize(position);",
    "  vPos = position;",
    "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
    "}"
  ].join("\n");

  var SURFACE_FRAG = [
    "uniform float uTime;",
    "uniform vec3 uLightDir;",
    "uniform vec3 uDeep;",
    "uniform vec3 uShallow;",
    "uniform vec3 uLand;",
    "uniform vec3 uRock;",
    "uniform vec3 uIce;",
    "uniform float uSea;",
    NOISE,
    "varying vec3 vNormal;",
    "varying vec3 vPos;",
    "varying vec3 vObj;",
    "void main(){",
    "  vec3 n = normalize(vNormal);",
    "  vec3 obj = normalize(vObj);",
    "  vec3 p = obj * 2.15;",
    "  float h = fbm5(p * 1.55);",
    "  h += 0.4 * fbm5(p * 3.7 + 9.0);",
    "  h /= 1.4;",
    "  h += 0.02 * sin(uTime * 0.08 + obj.x * 4.0);",
    "",
    "  float lat = abs(obj.y);",
    "  float ice = smoothstep(0.80, 0.96, lat);",
    "",
    "  vec3 col;",
    "  float sea = uSea;",
    "  float oceanMask = 1.0 - smoothstep(sea, sea + 0.012, h);",
    "  if (h < sea) {",
    "    float d = smoothstep(sea - 0.22, sea, h);",
    "    col = mix(uDeep, uShallow, d);",
    "  } else {",
    "    float d = smoothstep(sea, sea + 0.20, h);",
    "    col = mix(uLand, uRock, d * d);",
    "    col *= 0.9 + 0.1 * sin(h * 90.0);",
    "  }",
    "  col = mix(col, uIce, ice * 0.92);",
    "",
    "  vec3 L = normalize(uLightDir);",
    "  float ndl = dot(n, L);",
    "  float diff = max(ndl, 0.0);",
    "  col *= 0.10 + diff * 1.18;",
    "",
    "  float sunset = smoothstep(0.0, 0.32, ndl) * (1.0 - smoothstep(0.32, 0.75, ndl));",
    "  col += vec3(1.0, 0.48, 0.22) * sunset * 0.18;",
    "",
    "  vec3 view = normalize(cameraPosition - vPos);",
    "  float spec = pow(max(dot(reflect(-L, n), view), 0.0), 28.0);",
    "  col += vec3(0.55, 0.82, 1.0) * spec * oceanMask * 0.65 * smoothstep(-0.1, 0.3, ndl);",
    "",
    "  float fres = pow(1.0 - max(dot(n, view), 0.0), 3.0);",
    "  col += vec3(0.32, 0.72, 1.0) * fres * 0.9;",
    "",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  var CLOUD_FRAG = [
    "uniform float uTime;",
    "uniform vec3 uLightDir;",
    "uniform float uOpacity;",
    NOISE,
    "varying vec3 vNormal;",
    "varying vec3 vObj;",
    "void main(){",
    "  vec3 obj = normalize(vObj);",
    "  float c = fbm5(obj * 3.1 + vec3(uTime * 0.018, 0.0, uTime * 0.01));",
    "  c += 0.35 * fbm5(obj * 7.0 - vec3(uTime * 0.024, 0.0, 0.0));",
    "  float swirl = 0.72 + 0.28 * sin(obj.y * 9.0 + c * 4.0);",
    "  c = smoothstep(0.52, 0.80, c * swirl);",
    "  vec3 n = normalize(vNormal);",
    "  float lit = max(dot(n, normalize(uLightDir)), 0.0);",
    "  vec3 col = mix(vec3(0.55, 0.62, 0.85), vec3(1.0), lit);",
    "  float alpha = c * uOpacity * (0.18 + lit * 0.95);",
    "  gl_FragColor = vec4(col, alpha);",
    "}"
  ].join("\n");

  var RING_VERT = ["varying vec3 vLocal;", "void main(){", "  vLocal = position;", "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);", "}"].join("\n");

  var RING_FRAG = [
    "uniform float uTime;",
    "uniform vec3 uColor;",
    "uniform vec3 uColor2;",
    "uniform float uInner;",
    "uniform float uOuter;",
    "varying vec3 vLocal;",
    "void main(){",
    "  float r = length(vLocal.xy);",
    "  float edge = smoothstep(uInner, uInner + 0.10, r) * (1.0 - smoothstep(uOuter - 0.35, uOuter, r));",
    "  float bands = 0.42 + 0.58 * sin(r * 30.0 + uTime * 0.25);",
    "  float fine = 0.72 + 0.28 * sin(r * 96.0 - uTime * 0.4);",
    "  float gap = smoothstep(0.0, 0.06, abs(mod(r * 3.2, 1.0) - 0.5) - 0.06);",
    "  float alpha = edge * bands * fine * gap * 0.62;",
    "  vec3 col = mix(uColor, uColor2, smoothstep(uInner, uOuter, r));",
    "  col = mix(col, vec3(1.0), edge * 0.18);",
    "  gl_FragColor = vec4(col, alpha);",
    "}"
  ].join("\n");

  var DISK_FRAG = [
    "uniform float uTime;",
    "uniform vec3 uHot;",
    "uniform vec3 uCool;",
    "uniform float uInner;",
    "uniform float uOuter;",
    "varying vec3 vLocal;",
    "void main(){",
    "  float r = length(vLocal.xy);",
    "  float a = atan(vLocal.y, vLocal.x);",
    "  float t = clamp((r - uInner) / (uOuter - uInner), 0.0, 1.0);",
    "  float edge = smoothstep(uInner, uInner + 0.22, r) * (1.0 - smoothstep(uOuter - 0.85, uOuter, r));",
    "  float shear = 0.55 + 0.45 * sin(a * 4.0 - uTime * 2.6 + r * 5.0);",
    "  float filament = 0.7 + 0.3 * sin(a * 11.0 + uTime * 1.4 - r * 13.0);",
    "  float doppler = 0.55 + 0.75 * pow(max(cos(a - 0.55), 0.0), 1.6);",
    "  vec3 col = mix(uHot, uCool, pow(t, 0.85));",
    "  col += vec3(1.0, 0.92, 0.78) * pow(1.0 - t, 5.0) * 1.5;",
    "  float alpha = edge * shear * filament * doppler * 1.05;",
    "  gl_FragColor = vec4(col * alpha, alpha);",
    "}"
  ].join("\n");

  function texStar(THREE) {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var g = c.getContext("2d");
    var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.35, "rgba(255,255,255,0.75)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  function texGlow(THREE, inner, mid) {
    var c = document.createElement("canvas");
    c.width = c.height = 256;
    var g = c.getContext("2d");
    var grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, inner);
    grd.addColorStop(0.42, mid);
    grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }

  function smoothKeys(keys, p) {
    if (p <= keys[0].p) return keys[0];
    if (p >= keys[keys.length - 1].p) return keys[keys.length - 1];
    for (var i = 0; i < keys.length - 1; i++) {
      var a = keys[i], b = keys[i + 1];
      if (p >= a.p && p <= b.p) {
        var k = (p - a.p) / (b.p - a.p);
        k = k * k * (3 - 2 * k);
        return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k };
      }
    }
    return keys[0];
  }

  function boot(THREE) {
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch (e) {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 300);
    camera.position.set(0, 0.15, 6.6);
    var clock = new THREE.Clock();

    scene.add(new THREE.AmbientLight(0x2a2350, 1.6));
    var key = new THREE.PointLight(0xffd7a8, 190, 70, 2);
    key.position.set(8, 5, 6);
    scene.add(key);
    var rim = new THREE.PointLight(0x5ec8ff, 90, 70, 2);
    rim.position.set(-9, -5, 2);
    scene.add(rim);

    /* ---------------- stars + warp streaks ---------------- */
    var STAR_N = small ? 1500 : 2800;
    var WARP_N = small ? 420 : 820;
    var starPos = new Float32Array(STAR_N * 3);
    var starCol = new Float32Array(STAR_N * 3);
    var accent = new THREE.Color();
    for (var i = 0; i < STAR_N; i++) {
      var r = 16 + Math.random() * 80;
      var th = Math.random() * Math.PI * 2;
      var ph = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = Math.sin(ph) * Math.cos(th) * r;
      starPos[i * 3 + 1] = Math.sin(ph) * Math.sin(th) * r * 0.72;
      starPos[i * 3 + 2] = Math.cos(ph) * r - 14;
      var pick = Math.random();
      if (pick > 0.9) accent.setHex(0x8fe6ff);
      else if (pick > 0.76) accent.setHex(0xc9b6ff);
      else if (pick > 0.72) accent.setHex(0xffd9a8);
      else accent.setHex(0xffffff);
      starCol[i * 3] = accent.r;
      starCol[i * 3 + 1] = accent.g;
      starCol[i * 3 + 2] = accent.b;
    }
    var starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starCol, 3));
    var stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        size: 0.44,
        map: texStar(THREE),
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.95
      })
    );
    scene.add(stars);

    var warpGeo = new THREE.BufferGeometry();
    var warpPos = new Float32Array(WARP_N * 6);
    warpGeo.setAttribute("position", new THREE.BufferAttribute(warpPos, 3));
    var warpLines = new THREE.LineSegments(
      warpGeo,
      new THREE.LineBasicMaterial({
        color: 0xa9d8ff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    scene.add(warpLines);

    var warpPick = [];
    for (var w = 0; w < WARP_N; w++) warpPick.push(Math.floor(Math.random() * STAR_N));

    /* ---------------- nebulae ---------------- */
    var nebulaDefs = [
      { x: -17, y: 7, z: -27, s: 36, inner: "rgba(124,58,237,0.62)", mid: "rgba(124,58,237,0.08)" },
      { x: 17, y: -9, z: -32, s: 42, inner: "rgba(56,225,240,0.36)", mid: "rgba(56,225,240,0.05)" },
      { x: 3, y: 15, z: -40, s: 46, inner: "rgba(251,113,133,0.26)", mid: "rgba(251,113,133,0.04)" },
      { x: -9, y: -14, z: -34, s: 38, inner: "rgba(255,196,120,0.24)", mid: "rgba(255,150,80,0.04)" }
    ];
    var nebulae = nebulaDefs.map(function (n) {
      var sp = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texGlow(THREE, n.inner, n.mid),
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          opacity: 0.7
        })
      );
      sp.position.set(n.x, n.y, n.z);
      sp.scale.set(n.s, n.s, 1);
      scene.add(sp);
      return sp;
    });

    /* ---------------- living planet ---------------- */
    var planetGroup = new THREE.Group();
    planetGroup.position.set(1.55, 0, 0);
    scene.add(planetGroup);

    var R = 1.55;
    var surface = new THREE.Mesh(
      new THREE.SphereGeometry(R, small ? 64 : 128, small ? 64 : 128),
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uLightDir: { value: new THREE.Vector3(8, 5, 6).normalize() },
          uDeep: { value: new THREE.Color(0x061a3f) },
          uShallow: { value: new THREE.Color(0x1a5f8f) },
          uLand: { value: new THREE.Color(0x2f7a52) },
          uRock: { value: new THREE.Color(0xb59a6d) },
          uIce: { value: new THREE.Color(0xe8f4ff) },
          uSea: { value: 0.47 }
        },
        vertexShader: SURFACE_VERT,
        fragmentShader: SURFACE_FRAG
      })
    );
    planetGroup.add(surface);

    var clouds = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.014, small ? 48 : 96, small ? 48 : 96),
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uLightDir: { value: new THREE.Vector3(8, 5, 6).normalize() },
          uOpacity: { value: 0.9 }
        },
        vertexShader: SURFACE_VERT,
        fragmentShader: CLOUD_FRAG,
        transparent: true,
        depthWrite: false
      })
    );
    planetGroup.add(clouds);

    var atmo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texGlow(THREE, "rgba(150,220,255,0.42)", "rgba(90,120,255,0.12)"),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.85
      })
    );
    atmo.scale.set(R * 3.5, R * 3.5, 1);
    planetGroup.add(atmo);

    var rings = new THREE.Group();
    rings.rotation.x = -Math.PI / 2 + 0.44;
    rings.rotation.z = -0.17;
    planetGroup.add(rings);

    var ringDefs = [
      { inner: 1.98, outer: 2.62, a: 0xd9c4ff, b: 0x8f7bd0, op: 1 },
      { inner: 2.66, outer: 3.16, a: 0xf0e0ff, b: 0xa9c8ff, op: 0.85 },
      { inner: 3.22, outer: 3.52, a: 0xcdb6ff, b: 0x7a6bb8, op: 0.6 }
    ];
    var ringMats = [];
    ringDefs.forEach(function (d, idx) {
      var mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(d.a) },
          uColor2: { value: new THREE.Color(d.b) },
          uInner: { value: d.inner },
          uOuter: { value: d.outer }
        },
        vertexShader: RING_VERT,
        fragmentShader: RING_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      var m = new THREE.Mesh(new THREE.RingGeometry(d.inner, d.outer, 190, 1), mat);
      m.scale.setScalar(d.inner < 2.1 ? 1 : 1);
      rings.add(m);
      ringMats.push(mat);
    });

    /* ---------------- moons ---------------- */
    var moonDefs = [
      { r: 0.135, dist: 4.15, speed: 0.44, tilt: 0.24, color: 0xcac4ea },
      { r: 0.085, dist: 4.75, speed: -0.31, tilt: -0.42, color: 0x9fe8d8 },
      { r: 0.055, dist: 5.3, speed: 0.2, tilt: 0.1, color: 0xdcd6ff }
    ];
    var moons = moonDefs.map(function (d) {
      var pivot = new THREE.Group();
      pivot.rotation.x = d.tilt;
      var mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(d.r, 1),
        new THREE.MeshStandardMaterial({ color: d.color, roughness: 0.88, metalness: 0.06, flatShading: true })
      );
      mesh.position.x = d.dist;
      pivot.add(mesh);
      planetGroup.add(pivot);
      return { pivot: pivot, speed: d.speed, mesh: mesh };
    });

    /* ---------------- asteroid belt ---------------- */
    var belt = new THREE.Group();
    belt.rotation.x = 0.14;
    scene.add(belt);
    var rockGeo = new THREE.IcosahedronGeometry(1, 0);
    var rockMat = new THREE.MeshStandardMaterial({ color: 0x6f6a8c, roughness: 0.95, metalness: 0.05, flatShading: true });
    var rocks = new THREE.InstancedMesh(rockGeo, rockMat, small ? 42 : 78);
    var dummy = new THREE.Object3D();
    var rockSpin = [];
    for (var ri = 0; ri < rocks.count; ri++) {
      var ang = Math.random() * Math.PI * 2;
      var rad = 6.5 + Math.random() * 8.5;
      var sc = 0.035 + Math.random() * 0.115;
      dummy.position.set(Math.cos(ang) * rad, (Math.random() - 0.5) * 1.6, Math.sin(ang) * rad * 0.55 - 6);
      dummy.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      dummy.scale.setScalar(sc);
      dummy.updateMatrix();
      rocks.setMatrixAt(ri, dummy.matrix);
      rockSpin.push({ x: (Math.random() - 0.5) * 0.01, y: (Math.random() - 0.5) * 0.01 });
    }
    belt.add(rocks);

    /* ---------------- second world ---------------- */
    var worldB = new THREE.Group();
    worldB.position.set(-3.7, -1.4, -9.5);
    worldB.scale.setScalar(0.001);
    scene.add(worldB);

    worldB.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(1.02, 80, 80),
        new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uLightDir: { value: new THREE.Vector3(3, 4, 5).normalize() },
            uDeep: { value: new THREE.Color(0x0a2a55) },
            uShallow: { value: new THREE.Color(0x2d8fbf) },
            uLand: { value: new THREE.Color(0xbfe9ff) },
            uRock: { value: new THREE.Color(0x8fc9e6) },
            uIce: { value: new THREE.Color(0xffffff) },
            uSea: { value: 0.44 }
          },
          vertexShader: SURFACE_VERT,
          fragmentShader: SURFACE_FRAG
        })
      )
    );

    var bClouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.036, 64, 64),
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0.4 },
          uLightDir: { value: new THREE.Vector3(3, 4, 5).normalize() },
          uOpacity: { value: 0.75 }
        },
        vertexShader: SURFACE_VERT,
        fragmentShader: CLOUD_FRAG,
        transparent: true,
        depthWrite: false
      })
    );
    worldB.add(bClouds);

    var bRingMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xbdf0ff) },
        uColor2: { value: new THREE.Color(0x5f8fd9) },
        uInner: { value: 1.38 },
        uOuter: { value: 2.55 }
      },
      vertexShader: RING_VERT,
      fragmentShader: RING_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    var bRing = new THREE.Mesh(new THREE.RingGeometry(1.38, 2.55, 170, 1), bRingMat);
    bRing.rotation.x = -Math.PI / 2 - 0.4;
    bRing.rotation.z = 0.2;
    worldB.add(bRing);

    var bGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texGlow(THREE, "rgba(150,230,255,0.4)", "rgba(60,110,255,0.1)"),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    bGlow.scale.set(4.6, 4.6, 1);
    worldB.add(bGlow);

    /* ---------------- black hole ---------------- */
    var hole = new THREE.Group();
    hole.position.set(-1.2, -9.5, -3);
    scene.add(hole);

    hole.add(new THREE.Mesh(new THREE.SphereGeometry(1.02, 64, 64), new THREE.MeshBasicMaterial({ color: 0x000000 })));

    var horizonRim = new THREE.Mesh(
      new THREE.SphereGeometry(1.075, 64, 64),
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(0xffd9a0) } },
        vertexShader: SURFACE_VERT,
        fragmentShader: [
          "uniform vec3 uColor;",
          "varying vec3 vNormal;",
          "varying vec3 vPos;",
          "varying vec3 vObj;",
          "void main(){",
          "  vec3 n = normalize(vNormal);",
          "  vec3 view = normalize(cameraPosition - vPos);",
          "  float fres = pow(1.0 - max(dot(n, view), 0.0), 4.0);",
          "  gl_FragColor = vec4(uColor * fres * 2.4, fres);",
          "}"
        ].join("\n"),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
      })
    );
    hole.add(horizonRim);

    var accretionMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uHot: { value: new THREE.Color(0xfff0c8) },
        uCool: { value: new THREE.Color(0x8a3fd0) },
        uInner: { value: 1.12 },
        uOuter: { value: 3.6 }
      },
      vertexShader: RING_VERT,
      fragmentShader: DISK_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    var accretion = new THREE.Mesh(new THREE.RingGeometry(1.12, 3.6, 256, 1), accretionMat);
    accretion.rotation.x = -Math.PI / 2 + 0.72;
    accretion.rotation.z = 0.1;
    hole.add(accretion);

    /* photon ring: always faces the camera */
    var photonMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(0xffe6b0) } },
      vertexShader: RING_VERT,
      fragmentShader: [
        "uniform vec3 uColor;",
        "varying vec3 vLocal;",
        "void main(){",
        "  float r = length(vLocal.xy);",
        "  float band = smoothstep(1.00, 1.045, r) * (1.0 - smoothstep(1.045, 1.10, r));",
        "  gl_FragColor = vec4(uColor * 1.8, band);",
        "}"
      ].join("\n"),
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    var photon = new THREE.Mesh(new THREE.RingGeometry(0.98, 1.12, 160, 1), photonMat);
    hole.add(photon);

    /* lensing halo */
    var lensMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(0x9fb8ff) } },
      vertexShader: RING_VERT,
      fragmentShader: [
        "uniform vec3 uColor;",
        "varying vec3 vLocal;",
        "void main(){",
        "  float r = length(vLocal.xy);",
        "  float g = exp(-pow((r - 1.35) * 1.5, 2.0));",
        "  gl_FragColor = vec4(uColor * g * 0.55, g * 0.5);",
        "}"
      ].join("\n"),
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    var lensHalo = new THREE.Mesh(new THREE.RingGeometry(0.4, 3.2, 160, 1), lensMat);
    hole.add(lensHalo);

    /* relativistic jets */
    var jetMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(0xc8b4ff) } },
      vertexShader: ["varying float vY;", "void main(){", "  vY = position.y;", "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);", "}"].join("\n"),
      fragmentShader: [
        "uniform vec3 uColor;",
        "varying float vY;",
        "void main(){",
        "  float a = smoothstep(2.6, 0.2, abs(vY)) * 0.16;",
        "  gl_FragColor = vec4(uColor * 1.4, a);",
        "}"
      ].join("\n"),
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    [-1, 1].forEach(function (dir) {
      var jet = new THREE.Mesh(new THREE.ConeGeometry(0.42, 5.2, 24, 1, true), jetMat);
      jet.position.y = dir * 2.9;
      if (dir < 0) jet.rotation.z = Math.PI;
      hole.add(jet);
    });

    var holeGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texGlow(THREE, "rgba(255,178,96,0.42)", "rgba(110,40,180,0.1)"),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    holeGlow.scale.set(9, 9, 1);
    hole.add(holeGlow);

    /* ---------------- comet ---------------- */
    var comet = new THREE.Group();
    var cometHead = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texGlow(THREE, "rgba(255,255,255,0.95)", "rgba(140,220,255,0.35)"),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    cometHead.scale.set(0.7, 0.7, 1);
    comet.add(cometHead);
    var cometTail = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texGlow(THREE, "rgba(190,235,255,0.7)", "rgba(120,180,255,0.06)"),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    cometTail.scale.set(3.4, 0.8, 1);
    cometTail.position.x = -1.7;
    comet.add(cometTail);
    comet.visible = false;
    scene.add(comet);

    /* ---------------- paths ---------------- */
    var camPath = [
      { p: 0.0, x: 0.0, y: 0.16, z: 6.6 },
      { p: 0.2, x: 0.06, y: 0.28, z: 5.2 },
      { p: 0.4, x: -0.55, y: 0.5, z: 5.7 },
      { p: 0.62, x: -0.95, y: 0.18, z: 6.2 },
      { p: 0.82, x: -0.45, y: 0.1, z: 5.3 },
      { p: 1.0, x: 0.0, y: 0.02, z: 4.7 }
    ];

    var planetPath = [
      { p: 0.0, x: 1.55, y: 0.0, z: 0.0 },
      { p: 0.25, x: 2.1, y: 0.28, z: -0.5 },
      { p: 0.5, x: 3.4, y: 0.9, z: -1.8 },
      { p: 0.72, x: 2.3, y: 0.25, z: -4.4 },
      { p: 1.0, x: 0.3, y: -0.9, z: -6.8 }
    ];

    /* ---------------- state ---------------- */
    var progress = 0;
    var targetProgress = 0;
    var velocity = 0;
    var smoothVel = 0;
    var lastScroll = window.scrollY || 0;
    var pointerX = 0, pointerY = 0, camX = 0, camY = 0;
    var cometTimer = 0;
    var cometPhase = -1;

    function clamp01(v) { return Math.max(0, Math.min(1, v)); }
    function seg(p, a, b) { return clamp01((p - a) / (b - a)); }
    function ease(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
    function lerp(a, b, k) { return a + (b - a) * k; }

    function readScroll() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress = max > 0 ? clamp01(window.scrollY / max) : 0;
      velocity = Math.min(1, Math.abs(window.scrollY - lastScroll) / 90);
      lastScroll = window.scrollY;
    }

    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", readScroll, { passive: true });
    readScroll();

    window.addEventListener(
      "pointermove",
      function (e) {
        pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
        pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );

    function onResize() {
      var w = window.innerWidth, h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
      renderer.setSize(w, h, false);
      readScroll();
    }
    window.addEventListener("resize", onResize, { passive: true });

    function apply(p, t) {
      var spread = Math.min(1, camera.aspect / 1.25);

      /* camera */
      var cam = smoothKeys(camPath, p);
      camera.position.x = cam.x * spread + camX;
      camera.position.y = cam.y + camY;
      camera.position.z = cam.z;
      camera.lookAt(0, 0.05, 0);

      /* planet journey + gentle roll */
      var pl = smoothKeys(planetPath, p);
      planetGroup.position.set(pl.x * spread, pl.y, pl.z);
      planetGroup.rotation.z = Math.sin(t * 0.12) * 0.02;
      planetGroup.scale.setScalar(1 - 0.1 * ease(seg(p, 0.6, 1)));

      surface.rotation.y = t * 0.045;
      surface.material.uniforms.uTime.value = t;
      clouds.rotation.y = t * 0.062;
      clouds.material.uniforms.uTime.value = t;
      rings.rotation.z = -0.17 + t * 0.006;
      ringMats.forEach(function (m, idx) { m.uniforms.uTime.value = t + idx * 3; });

      moons.forEach(function (m, idx) {
        m.pivot.rotation.y = t * m.speed + idx * 1.9;
        m.mesh.rotation.y = t * 0.3;
      });

      /* asteroid belt drifts past */
      belt.rotation.y = p * 0.9 + t * 0.008;
      belt.position.z = p * 3.2;

      /* second world */
      var bIn = ease(seg(p, 0.38, 0.76));
      worldB.scale.setScalar(0.001 + bIn * 0.95);
      worldB.rotation.y = 0.6 - t * 0.035;
      worldB.position.y = lerp(-2.1, -1.25, bIn) + (spread < 0.78 ? 1.1 : 0);
      worldB.position.x = -3.7 * spread;
      bClouds.rotation.y = -t * 0.05;
      bRingMat.uniforms.uTime.value = t;
      bClouds.material.uniforms.uTime.value = t + 0.6;
      worldB.children[0].material.uniforms.uTime.value = t;

      /* black hole final approach */
      var hIn = ease(seg(p, 0.64, 1));
      hole.position.y = lerp(-10, -0.55, hIn);
      hole.position.x = lerp(-2.6, -0.7, hIn) * (spread < 0.78 ? 0.55 : 1);
      hole.scale.setScalar(lerp(0.55, 1.5, hIn));
      hole.rotation.z = t * 0.05;
      accretion.rotation.z = 0.1 + t * 0.28;
      accretionMat.uniforms.uTime.value = t;

      photon.lookAt(camera.position);
      lensHalo.lookAt(camera.position);
      photonMat.uniforms.uColor.value.setHSL(0.09, 0.85, 0.62 + Math.sin(t * 1.4) * 0.06);
      holeGlow.material.opacity = 0.5 + hIn * 0.5;

      /* stars travel + warp streaks from scroll velocity */
      smoothVel += (velocity - smoothVel) * 0.08;
      velocity *= 0.9;

      stars.rotation.y = p * 0.55 + t * 0.003;
      stars.position.z = p * 10;
      warpLines.rotation.y = stars.rotation.y;
      warpLines.position.z = stars.position.z;

      var boost = 6 + smoothVel * 70;
      var arr = warpGeo.attributes.position.array;
      for (var wi = 0; wi < WARP_N; wi++) {
        var si = warpPick[wi] * 3;
        var sx = starPos[si], sy = starPos[si + 1], sz = starPos[si + 2];
        arr[wi * 6] = sx;
        arr[wi * 6 + 1] = sy;
        arr[wi * 6 + 2] = sz;
        arr[wi * 6 + 3] = sx * (1 + boost * 0.004);
        arr[wi * 6 + 4] = sy * (1 + boost * 0.004);
        arr[wi * 6 + 5] = sz + boost * 0.1;
      }
      warpGeo.attributes.position.needsUpdate = true;
      warpLines.material.opacity = Math.min(0.55, smoothVel * 0.85);

      nebulae.forEach(function (sp, idx) {
        sp.material.opacity = 0.5 + Math.sin(t * 0.18 + idx * 1.3) * 0.14;
      });

      /* comet crossing */
      if (!reduce) {
        cometTimer += 0.016;
        if (cometPhase < 0 && cometTimer > 11) {
          cometPhase = 0;
          cometTimer = 0;
        }
        if (cometPhase >= 0) {
          cometPhase += 0.0032;
          comet.visible = true;
          comet.position.set(lerp(11, -12, cometPhase), lerp(4.2, 1.2, cometPhase), -7);
          comet.rotation.z = -0.22;
          cometHead.material.opacity = Math.sin(Math.PI * clamp01(cometPhase)) * 0.95;
          cometTail.material.opacity = Math.sin(Math.PI * clamp01(cometPhase)) * 0.7;
          if (cometPhase >= 1) {
            cometPhase = -1;
            comet.visible = false;
          }
        }
      }
    }

    /* ---------------- loop ---------------- */
    var revealed = false;
    function reveal() {
      if (revealed) return;
      revealed = true;
      document.body.classList.add("has-3d");
    }

    if (reduce) {
      progress = targetProgress = 0.02;
      apply(progress, 0);
      renderer.render(scene, camera);
      reveal();
      window.addEventListener(
        "scroll",
        function () {
          readScroll();
          apply(targetProgress, 0);
          renderer.render(scene, camera);
        },
        { passive: true }
      );
    } else {
      var running = true;
      var rafId = null;
      var loop = function () {
        if (!running) return;
        rafId = requestAnimationFrame(loop);
        if (document.hidden) return;
        var t = clock.getElapsedTime();
        progress += (targetProgress - progress) * 0.055;
        camX += (pointerX * 0.2 - camX) * 0.045;
        camY += (-pointerY * 0.15 - camY) * 0.045;
        apply(progress, t);
        renderer.render(scene, camera);
        reveal();
      };
      loop();

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          running = false;
          if (rafId) cancelAnimationFrame(rafId);
        } else {
          running = true;
          clock.getDelta();
          loop();
        }
      });
    }
  }

  if (!canvas.getContext) return;
  loadThree(0).then(boot).catch(function () {
    /* no WebGL, or no network: the CSS planet stays as the hero visual */
  });
})();
