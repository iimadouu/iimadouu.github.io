/* ============================================================
   IIMADOUU — DEEP FIELD
   Scroll-driven WebGL scene: procedural planet, ring system,
   orbiting moons, a second world, and a black hole on approach.
   Loads three.js dynamically; if it cannot load, the CSS planet
   in the hero stays in place and nothing breaks.
   ============================================================ */
(function () {
  "use strict";

  var canvas = document.getElementById("space3d");
  if (!canvas) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var small = window.matchMedia("(max-width: 860px)").matches;
  var pixels = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);

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

  function starTexture(THREE) {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var g = c.getContext("2d");
    var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.3, "rgba(255,255,255,0.85)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  function glowTexture(THREE, inner, outer) {
    var c = document.createElement("canvas");
    c.width = c.height = 256;
    var g = c.getContext("2d");
    var grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, inner);
    grd.addColorStop(0.45, outer);
    grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }

  var PLANET_VERT = [
    "varying vec3 vNormal;",
    "varying vec3 vPos;",
    "void main(){",
    "  vNormal = normalize(normalMatrix * normal);",
    "  vPos = position;",
    "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
    "}"
  ].join("\n");

  var PLANET_FRAG = [
    "uniform float uTime;",
    "uniform vec3 uLightDir;",
    "uniform vec3 uColorA;",
    "uniform vec3 uColorB;",
    "uniform vec3 uColorC;",
    "varying vec3 vNormal;",
    "varying vec3 vPos;",
    "",
    "float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }",
    "float noise(vec3 p){",
    "  vec3 i = floor(p); vec3 f = fract(p);",
    "  f = f * f * (3.0 - 2.0 * f);",
    "  float n000 = hash(i);",
    "  float n100 = hash(i + vec3(1.0,0.0,0.0));",
    "  float n010 = hash(i + vec3(0.0,1.0,0.0));",
    "  float n110 = hash(i + vec3(1.0,1.0,0.0));",
    "  float n001 = hash(i + vec3(0.0,0.0,1.0));",
    "  float n101 = hash(i + vec3(1.0,0.0,1.0));",
    "  float n011 = hash(i + vec3(0.0,1.0,1.0));",
    "  float n111 = hash(i + vec3(1.0,1.0,1.0));",
    "  float nx00 = mix(n000, n100, f.x);",
    "  float nx10 = mix(n010, n110, f.x);",
    "  float nx01 = mix(n001, n101, f.x);",
    "  float nx11 = mix(n011, n111, f.x);",
    "  return mix(mix(nx00, nx10, f.y), mix(nx01, nx11, f.y), f.z);",
    "}",
    "float fbm(vec3 p){",
    "  float v = 0.0; float a = 0.5;",
    "  for (int i = 0; i < 4; i++){",
    "    v += a * noise(p);",
    "    p *= 2.07; a *= 0.5;",
    "  }",
    "  return v;",
    "}",
    "",
    "void main(){",
    "  vec3 n = normalize(vNormal);",
    "  vec3 p = normalize(vPos) * 2.6;",
    "  float flow = fbm(p + vec3(uTime * 0.02, uTime * 0.01, 0.0));",
    "  float bands = sin((n.y * 9.0 + flow * 2.4) * 3.14159);",
    "  vec3 col = mix(uColorA, uColorB, smoothstep(-0.7, 0.85, bands));",
    "  col = mix(col, uColorC, smoothstep(0.45, 1.0, abs(n.y)) * 0.55);",
    "  col += uColorB * flow * 0.28;",
    "",
    "  vec3 L = normalize(uLightDir);",
    "  float diff = max(dot(n, L), 0.0);",
    "  float lit = pow(diff, 1.35);",
    "  float ambient = 0.14;",
    "  col *= ambient + lit * 1.05;",
    "",
    "  vec3 viewDir = normalize(cameraPosition - vPos);",
    "  float fres = pow(1.0 - max(dot(n, viewDir), 0.0), 2.6);",
    "  col += vec3(0.28, 0.72, 0.95) * fres * 0.55;",
    "",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  var RING_VERT = [
    "varying vec3 vLocal;",
    "void main(){",
    "  vLocal = position;",
    "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
    "}"
  ].join("\n");

  var RING_FRAG = [
    "uniform float uTime;",
    "uniform vec3 uColor;",
    "uniform float uInner;",
    "uniform float uOuter;",
    "varying vec3 vLocal;",
    "void main(){",
    "  float r = length(vLocal.xy);",
    "  float edge = smoothstep(uInner, uInner + 0.12, r) * (1.0 - smoothstep(uOuter - 0.2, uOuter, r));",
    "  float bands = 0.45 + 0.55 * sin(r * 26.0 + uTime * 0.35);",
    "  float fine = 0.75 + 0.25 * sin(r * 74.0 - uTime * 0.5);",
    "  float alpha = edge * bands * fine * 0.5;",
    "  vec3 col = mix(uColor, vec3(1.0), edge * 0.25);",
    "  gl_FragColor = vec4(col, alpha);",
    "}"
  ].join("\n");

  function boot(THREE) {
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (e) {
      return;
    }
    renderer.setPixelRatio(pixels);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 6.5);

    var clock = new THREE.Clock();

    /* ---------- lights ---------- */
    var key = new THREE.PointLight(0xffd7a8, 150, 60, 2);
    key.position.set(7, 4, 6);
    scene.add(key);

    var rim = new THREE.PointLight(0x5ec8ff, 70, 60, 2);
    rim.position.set(-8, -4, 2);
    scene.add(rim);

    scene.add(new THREE.AmbientLight(0x2a2350, 1.5));

    /* ---------- stars ---------- */
    var starGeo = new THREE.BufferGeometry();
    var starCount = small ? 1400 : 2600;
    var pos = new Float32Array(starCount * 3);
    var col = new Float32Array(starCount * 3);
    var c = new THREE.Color();
    for (var i = 0; i < starCount; i++) {
      var r = 18 + Math.random() * 70;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r * 0.7;
      pos[i * 3 + 2] = Math.cos(phi) * r - 12;
      var pick = Math.random();
      if (pick > 0.88) c.setHex(0x8fe6ff);
      else if (pick > 0.74) c.setHex(0xc9b6ff);
      else c.setHex(0xffffff);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    var stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        size: 0.42,
        map: starTexture(THREE),
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.95
      })
    );
    scene.add(stars);

    /* ---------- nebulae ---------- */
    var nebulaGroups = [];
    [
      { x: -16, y: 6, z: -26, s: 34, inner: "rgba(124,58,237,0.55)", outer: "rgba(124,58,237,0.06)" },
      { x: 16, y: -8, z: -30, s: 40, inner: "rgba(56,225,240,0.34)", outer: "rgba(56,225,240,0.04)" },
      { x: 2, y: 14, z: -38, s: 44, inner: "rgba(251,113,133,0.24)", outer: "rgba(251,113,133,0.03)" }
    ].forEach(function (n) {
      var sp = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTexture(THREE, n.inner, n.outer),
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          opacity: 0.75
        })
      );
      sp.position.set(n.x, n.y, n.z);
      sp.scale.set(n.s, n.s, 1);
      scene.add(sp);
      nebulaGroups.push(sp);
    });

    /* ---------- planet ---------- */
    var planetGroup = new THREE.Group();
    planetGroup.position.set(1.55, 0, 0);
    scene.add(planetGroup);

    var planetMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uLightDir: { value: new THREE.Vector3(7, 4, 6).normalize() },
        uColorA: { value: new THREE.Color(0xf6a15c) },
        uColorB: { value: new THREE.Color(0xc4426b) },
        uColorC: { value: new THREE.Color(0x3d1f6b) }
      },
      vertexShader: PLANET_VERT,
      fragmentShader: PLANET_FRAG
    });
    var planet = new THREE.Mesh(new THREE.SphereGeometry(1.55, small ? 48 : 96, small ? 48 : 96), planetMat);
    planetGroup.add(planet);

    var atmosphere = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture(THREE, "rgba(255,190,130,0.5)", "rgba(120,120,255,0.14)"),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.85
      })
    );
    atmosphere.scale.set(5.4, 5.4, 1);
    planetGroup.add(atmosphere);

    var rings = new THREE.Group();
    var ringMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xd9c4ff) },
        uInner: { value: 2.05 },
        uOuter: { value: 3.35 }
      },
      vertexShader: RING_VERT,
      fragmentShader: RING_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    var ringMesh = new THREE.Mesh(new THREE.RingGeometry(2.05, 3.35, 180, 1), ringMat);
    rings.add(ringMesh);
    rings.rotation.x = -Math.PI / 2 + 0.42;
    rings.rotation.z = -0.16;
    planetGroup.add(rings);

    /* ---------- moons ---------- */
    var moonDefs = [
      { r: 0.11, dist: 2.75, speed: 0.55, tilt: 0.3, color: 0xb9b2dd },
      { r: 0.07, dist: 3.25, speed: -0.38, tilt: -0.5, color: 0x8de6d0 },
      { r: 0.045, dist: 3.9, speed: 0.24, tilt: 0.12, color: 0xcfc9ff }
    ];
    var moons = moonDefs.map(function (d) {
      var pivot = new THREE.Group();
      pivot.rotation.x = d.tilt;
      var mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(d.r, 1),
        new THREE.MeshStandardMaterial({
          color: d.color,
          roughness: 0.85,
          metalness: 0.08,
          flatShading: true
        })
      );
      mesh.position.x = d.dist;
      pivot.add(mesh);
      planetGroup.add(pivot);
      return { pivot: pivot, speed: d.speed };
    });

    /* ---------- second, ringed world ---------- */
    var worldB = new THREE.Group();
    worldB.position.set(-3.6, -1.4, -9);
    worldB.scale.setScalar(0.001);
    scene.add(worldB);

    var bMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uLightDir: { value: new THREE.Vector3(2, 3, 5).normalize() },
        uColorA: { value: new THREE.Color(0x7fd9ff) },
        uColorB: { value: new THREE.Color(0x2f5fd0) },
        uColorC: { value: new THREE.Color(0x101a4d) }
      },
      vertexShader: PLANET_VERT,
      fragmentShader: PLANET_FRAG
    });
    worldB.add(new THREE.Mesh(new THREE.SphereGeometry(1.05, 64, 64), bMat));

    var bRing = new THREE.Mesh(
      new THREE.RingGeometry(1.4, 2.5, 160, 1),
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(0x9fe8ff) },
          uInner: { value: 1.4 },
          uOuter: { value: 2.5 }
        },
        vertexShader: RING_VERT,
        fragmentShader: RING_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    bRing.rotation.x = -Math.PI / 2 - 0.35;
    worldB.add(bRing);

    var bGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture(THREE, "rgba(140,225,255,0.4)", "rgba(60,110,255,0.12)"),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    bGlow.scale.set(4.2, 4.2, 1);
    worldB.add(bGlow);

    /* ---------- black hole ---------- */
    var hole = new THREE.Group();
    hole.position.set(-1.2, -8, -3);
    scene.add(hole);

    hole.add(new THREE.Mesh(new THREE.SphereGeometry(1.15, 48, 48), new THREE.MeshBasicMaterial({ color: 0x000000 })));

    var accretion = new THREE.Mesh(
      new THREE.RingGeometry(1.3, 3.1, 220, 1),
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(0xffb066) },
          uInner: { value: 1.3 },
          uOuter: { value: 3.1 }
        },
        vertexShader: RING_VERT,
        fragmentShader: [
          "uniform float uTime;",
          "uniform vec3 uColor;",
          "uniform float uInner;",
          "uniform float uOuter;",
          "varying vec3 vLocal;",
          "void main(){",
          "  float r = length(vLocal.xy);",
          "  float a = atan(vLocal.y, vLocal.x);",
          "  float edge = smoothstep(uInner, uInner + 0.35, r) * (1.0 - smoothstep(uOuter - 0.9, uOuter, r));",
          "  float swirl = 0.55 + 0.45 * sin(a * 5.0 - uTime * 2.2 + r * 4.0);",
          "  float heat = 1.0 - clamp((r - uInner) / (uOuter - uInner), 0.0, 1.0);",
          "  vec3 col = mix(vec3(0.25, 0.06, 0.5), uColor, heat);",
          "  col += vec3(1.0, 0.85, 0.6) * pow(heat, 3.0) * 0.9;",
          "  gl_FragColor = vec4(col, edge * swirl * 0.95);",
          "}"
        ].join("\n"),
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
    );
    accretion.rotation.x = -Math.PI / 2 + 0.62;
    hole.add(accretion);

    var holeGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture(THREE, "rgba(255,170,90,0.45)", "rgba(120,40,180,0.12)"),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    holeGlow.scale.set(8, 8, 1);
    hole.add(holeGlow);

    /* ---------- scroll state ---------- */
    var progress = 0;
    var targetProgress = 0;
    var pointerX = 0;
    var pointerY = 0;
    var camX = 0;
    var camY = 0;

    function clamp01(v) {
      return Math.max(0, Math.min(1, v));
    }
    function seg(p, a, b) {
      return clamp01((p - a) / (b - a));
    }
    function ease(k) {
      return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    }
    function lerp(a, b, k) {
      return a + (b - a) * k;
    }

    function readScroll() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress = max > 0 ? clamp01(window.scrollY / max) : 0;
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
      var w = window.innerWidth;
      var h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
      readScroll();
    }
    window.addEventListener("resize", onResize, { passive: true });

    function apply(p, t) {
      /* camera: dolly in, then drift */
      var dolly = ease(seg(p, 0, 0.28));
      camera.position.z = lerp(6.6, 4.9, dolly);
      camera.position.x = lerp(0, -0.5, ease(seg(p, 0.3, 0.62))) + camX;
      camera.position.y = lerp(0, 0.35, ease(seg(p, 0.3, 0.62))) + camY;
      camera.lookAt(0, 0, 0);

      /* planet journey */
      var out = ease(seg(p, 0.26, 0.6));
      var recede = ease(seg(p, 0.58, 0.9));
      planetGroup.position.x = lerp(1.55, 3.5, out) * (1 - recede) + lerp(3.5, 1.1, recede) * recede;
      planetGroup.position.y = lerp(0, 0.75, out) * (1 - recede) + lerp(0.75, -0.5, recede) * recede;
      planetGroup.position.z = lerp(0, -1.4, out) * (1 - recede) + lerp(-1.4, -5.4, recede) * recede;
      var pScale = lerp(1, 0.82, recede);
      planetGroup.scale.setScalar(pScale);

      /* keep the system inside the frame on tall, narrow phone screens */
      var spread = Math.min(1, camera.aspect / 1.25);
      planetGroup.position.x *= spread;
      worldB.position.x = -3.6 * spread;

      planet.rotation.y = t * 0.055;
      rings.rotation.z = -0.16 + t * 0.012;
      planetMat.uniforms.uTime.value = t;
      ringMat.uniforms.uTime.value = t;

      moons.forEach(function (m, idx) {
        m.pivot.rotation.y = t * m.speed + idx * 1.7;
      });

      /* second world arrives */
      var bIn = ease(seg(p, 0.42, 0.78));
      worldB.scale.setScalar(0.001 + bIn * 0.95);
      worldB.rotation.y = Math.PI * 0.4 - t * 0.03;
      worldB.position.y = lerp(-1.9, -1.2, bIn) + (spread < 0.75 ? 0.8 : 0);
      bMat.uniforms.uTime.value = t;
      bRing.material.uniforms.uTime.value = t;

      /* black hole rises for the final approach */
      var hIn = ease(seg(p, 0.66, 0.99));
      hole.position.y = lerp(-9, -0.6, hIn);
      hole.position.x = lerp(-2.4, -0.8, hIn) * (spread < 0.75 ? 0.5 : 1);
      hole.scale.setScalar(lerp(0.6, 1.45, hIn));
      accretion.rotation.z = t * 0.22;
      accretion.material.uniforms.uTime.value = t;
      holeGlow.material.opacity = 0.55 + hIn * 0.45;

      /* star travel */
      stars.rotation.y = p * 0.5 + t * 0.004;
      stars.position.z = p * 9;
      nebulaGroups.forEach(function (sp, idx) {
        sp.material.opacity = 0.55 + Math.sin(t * 0.2 + idx) * 0.12;
      });
    }

    var running = true;
    var rafId = null;

    function loop() {
      if (!running) return;
      rafId = requestAnimationFrame(loop);
      if (document.hidden) return;

      var t = clock.getElapsedTime();
      progress += (targetProgress - progress) * 0.06;
      camX += (pointerX * 0.16 - camX) * 0.05;
      camY += (-pointerY * 0.12 - camY) * 0.05;

      apply(progress, t);
      renderer.render(scene, camera);
      reveal();
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
      } else if (!reduce) {
        running = true;
        clock.getDelta();
        loop();
      }
    });

    /* only reveal the WebGL layer after a frame has really rendered, so a
       shader or GPU failure can never leave an empty hero */
    var revealed = false;
    function reveal() {
      if (revealed) return;
      revealed = true;
      document.body.classList.add("has-3d");
    }

    if (reduce) {
      apply(0.02, 0);
      renderer.render(scene, camera);
      reveal();
      window.addEventListener(
        "scroll",
        function () {
          apply(targetProgress, 0);
          renderer.render(scene, camera);
        },
        { passive: true }
      );
    } else {
      loop();
    }
  }

  if (!canvas.getContext) return;
  loadThree(0)
    .then(boot)
    .catch(function () {
      /* no WebGL or no network: the CSS planet stays as the hero visual */
    });
})();
