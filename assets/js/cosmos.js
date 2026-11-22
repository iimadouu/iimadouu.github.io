/* ============================================================
   IIMADOUU — COSMOS ENGINE
   Starfield, parallax, reveals, rotator, cursor, warp.
   No dependencies.
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var touch = window.matchMedia("(hover: none)").matches;
  var smallScreen = window.matchMedia("(max-width: 860px)").matches;

  /* ------------------------------------------------------------
     1. STARFIELD
     ------------------------------------------------------------ */
  (function starfield() {
    var canvas = document.getElementById("stars");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;
    var stars = [];
    var shooting = [];
    var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    var raf = null;
    var last = 0;

    function build() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = smallScreen ? 130 : 260;
      stars = [];
      for (var i = 0; i < count; i++) {
        var depth = Math.random();
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: 0.25 + depth * 0.95,
          r: 0.4 + depth * 1.5,
          base: 0.25 + Math.random() * 0.55,
          speed: 0.0004 + Math.random() * 0.0011,
          phase: Math.random() * Math.PI * 2,
          hue: Math.random()
        });
      }
    }

    function spawnShooting(now) {
      if (reduce) return;
      if (shooting.length > 2) return;
      if (Math.random() > 0.22) return;
      var startX = Math.random() * w * 0.8;
      shooting.push({
        x: startX,
        y: Math.random() * h * 0.5,
        vx: 4 + Math.random() * 3.5,
        vy: 1.6 + Math.random() * 1.4,
        life: 1,
        len: 90 + Math.random() * 110
      });
    }

    function draw(t, now) {
      ctx.clearRect(0, 0, w, h);
      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var twinkle = reduce ? s.base : s.base + Math.sin(t * s.speed + s.phase) * 0.32;
        var alpha = Math.max(0.06, Math.min(1, twinkle));
        var px = s.x + pointer.x * 16 * s.z;
        var py = s.y + pointer.y * 16 * s.z;

        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        if (s.hue > 0.86) {
          ctx.fillStyle = "rgba(120,226,246," + alpha + ")";
        } else if (s.hue > 0.72) {
          ctx.fillStyle = "rgba(196,178,255," + alpha + ")";
        } else {
          ctx.fillStyle = "rgba(246,243,255," + alpha + ")";
        }
        ctx.fill();

        if (s.r > 1.25) {
          ctx.beginPath();
          ctx.arc(px, py, s.r * 4.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(190,200,255," + alpha * 0.05 + ")";
          ctx.fill();
        }
      }

      // shooting stars
      for (var j = shooting.length - 1; j >= 0; j--) {
        var m = shooting[j];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.012;
        var tailX = m.x - m.vx * (m.len / 6);
        var tailY = m.y - m.vy * (m.len / 6);
        var grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, "rgba(255,255,255," + Math.max(0, m.life) + ")");
        grad.addColorStop(0.35, "rgba(120,226,246," + Math.max(0, m.life) * 0.5 + ")");
        grad.addColorStop(1, "rgba(120,226,246,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        if (m.life <= 0 || m.x > w + 200 || m.y > h + 200) shooting.splice(j, 1);
      }
    }

    function loop(t) {
      if (!document.hidden) {
        // roughly one shooting-star roll per 500ms
        if (t - last > 500) {
          spawnShooting(t);
          last = t;
        }
        draw(t, t);
      }
      raf = requestAnimationFrame(loop);
    }

    build();
    window.addEventListener("resize", build, { passive: true });
    window.addEventListener(
      "pointermove",
      function (e) {
        pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
        pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && !raf) raf = requestAnimationFrame(loop);
    });
    if (!reduce) raf = requestAnimationFrame(loop);
    else draw(0, 0);
  })();

  /* ------------------------------------------------------------
     2. REVEAL ON SCROLL
     ------------------------------------------------------------ */
  (function reveals() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window) || reduce) {
      for (var i = 0; i < items.length; i++) items[i].classList.add("in");
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    for (var k = 0; k < items.length; k++) io.observe(items[k]);
  })();

  /* ------------------------------------------------------------
     3. HEADER STATE + BURGER
     ------------------------------------------------------------ */
  (function nav() {
    var head = document.querySelector(".site-head");
    if (head) {
      var onScroll = function () {
        head.classList.toggle("is-stuck", window.scrollY > 24);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    var burger = document.querySelector(".burger");
    var menu = document.querySelector(".menu");
    if (burger && menu) {
      var setOpen = function (open) {
        burger.classList.toggle("is-open", open);
        menu.classList.toggle("is-open", open);
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.style.overflow = open ? "hidden" : "";
      };
      burger.addEventListener("click", function () {
        setOpen(!menu.classList.contains("is-open"));
      });
      menu.addEventListener("click", function (e) {
        if (e.target.tagName === "A") setOpen(false);
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") setOpen(false);
      });
      window.addEventListener("resize", function () {
        if (window.innerWidth > 860) setOpen(false);
      });
    }
  })();

  /* ------------------------------------------------------------
     4. WORD ROTATOR
     ------------------------------------------------------------ */
  (function rotator() {
    var el = document.querySelector("[data-rotate]");
    if (!el) return;
    var words = (el.getAttribute("data-rotate") || "").split(",").filter(Boolean);
    if (words.length < 2) return;
    var idx = 0;
    var render = function () {
      el.innerHTML = '<span>' + words[idx] + "</span>";
    };
    render();
    if (reduce) return;
    setInterval(function () {
      idx = (idx + 1) % words.length;
      render();
    }, 2600);
  })();

  /* ------------------------------------------------------------
     5. CARD GLOW + SUBTLE TILT
     ------------------------------------------------------------ */
  (function cards() {
    if (touch || reduce) return;
    var cards = document.querySelectorAll("[data-glow]");
    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        card.addEventListener("pointermove", function (e) {
          var r = card.getBoundingClientRect();
          var x = ((e.clientX - r.left) / r.width) * 100;
          var y = ((e.clientY - r.top) / r.height) * 100;
          card.style.setProperty("--mx", x + "%");
          card.style.setProperty("--my", y + "%");
          var rx = (y - 50) / 46;
          var ry = (50 - x) / 46;
          card.style.transform =
            "translateY(-6px) perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
        });
        card.addEventListener("pointerleave", function () {
          card.style.transform = "";
        });
      })(cards[i]);
    }
  })();

  /* ------------------------------------------------------------
     6. CUSTOM CURSOR
     ------------------------------------------------------------ */
  (function cursor() {
    if (touch || reduce) return;
    var dot = document.createElement("div");
    var ring = document.createElement("div");
    dot.className = "cursor-dot";
    ring.className = "cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;
    document.body.classList.add("has-cursor");

    window.addEventListener(
      "pointermove",
      function (e) {
        mx = e.clientX;
        my = e.clientY;
        dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
      },
      { passive: true }
    );

    (function follow() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      requestAnimationFrame(follow);
    })();

    var hot = "a,button,.app,[data-hot]";
    document.addEventListener("pointerover", function (e) {
      if (e.target.closest && e.target.closest(hot)) document.body.classList.add("cursor-hot");
    });
    document.addEventListener("pointerout", function (e) {
      if (e.target.closest && e.target.closest(hot)) document.body.classList.remove("cursor-hot");
    });
  })();

  /* ------------------------------------------------------------
     7. WARP TRANSITIONS BETWEEN PAGES
     ------------------------------------------------------------ */
  (function warp() {
    if (reduce) return;
    var layer = document.createElement("div");
    layer.className = "warp";
    document.body.appendChild(layer);

    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a") : null;
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (!href || href.charAt(0) === "#") {
        /* in-page jump: short warp pulse so the transition feels continuous */
        var pulse = document.querySelector(".flash");
        if (pulse) {
          pulse.classList.add("on");
          setTimeout(function () {
            pulse.classList.remove("on");
          }, 180);
        }
        return;
      }
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      if (/^(mailto:|tel:|https?:\/\/)/i.test(href) && a.host !== window.location.host) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      e.preventDefault();
      layer.classList.add("on");
      document.body.classList.add("is-leaving");
      setTimeout(function () {
        window.location.href = href;
      }, 430);
    });

    window.addEventListener("pageshow", function () {
      layer.classList.remove("on");
      document.body.classList.remove("is-leaving");
    });
  })();

  /* ------------------------------------------------------------
     8. SCROLL RAIL SPY
     ------------------------------------------------------------ */
  (function rail() {
    var links = document.querySelectorAll(".rail a");
    if (!links.length) return;
    var targets = [];
    for (var i = 0; i < links.length; i++) {
      var id = links[i].getAttribute("href");
      var sec = id && id.length > 1 ? document.querySelector(id) : null;
      if (sec) targets.push({ link: links[i], sec: sec });
    }
    if (!targets.length) return;
    var spy = function () {
      var pos = window.scrollY + window.innerHeight * 0.35;
      var current = targets[0];
      for (var j = 0; j < targets.length; j++) {
        if (targets[j].sec.offsetTop <= pos) current = targets[j];
      }
      for (var k = 0; k < targets.length; k++) {
        targets[k].link.classList.toggle("is-active", targets[k] === current);
      }
    };
    window.addEventListener("scroll", spy, { passive: true });
    spy();
  })();

  /* ------------------------------------------------------------
     9. COUNT-UP NUMBERS
     ------------------------------------------------------------ */
  (function counters() {
    var nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;
    var run = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduce) {
        el.textContent = target + suffix;
        return;
      }
      var start = null;
      var step = function (t) {
        if (start === null) start = t;
        var p = Math.min(1, (t - start) / 1400);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) {
      nums.forEach(run);
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            run(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    nums.forEach(function (n) {
      io.observe(n);
    });
  })();

  /* ------------------------------------------------------------
     10. YEAR
     ------------------------------------------------------------ */
  (function year() {
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  })();

  /* ------------------------------------------------------------
     11. SECTOR JUMP FLASH
     ------------------------------------------------------------ */
  (function sectorFlash() {
    var hud = document.querySelector(".hud");
    var sector = hud && hud.querySelector("[data-hud-sector]");
    if (!sector) return;

    var flash = document.createElement("div");
    flash.className = "flash";
    flash.setAttribute("aria-hidden", "true");
    document.body.appendChild(flash);

    var last = sector.textContent;
    var timer = null;

    var obs = new MutationObserver(function () {
      if (sector.textContent === last) return;
      last = sector.textContent;
      flash.classList.add("on");
      clearTimeout(timer);
      timer = setTimeout(function () {
        flash.classList.remove("on");
      }, 200);
    });

    if (window.MutationObserver) obs.observe(sector, { childList: true, characterData: true, subtree: true });
  })();

  /* ------------------------------------------------------------
     12. INSTRUMENTATION: HUD, hero tilt, boot sequence
     ------------------------------------------------------------ */
  (function instrumentation() {
    var hud = document.querySelector(".hud");
    var hero = document.querySelector(".hero");
    var heroCopy = document.querySelector(".hero-copy");
    var heroTitle = hero ? hero.querySelector("h1") : null;

    if (hud || heroCopy) {
      var max = 1;
      var ticking = false;

      var measure = function () {
        max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      };

      var paint = function () {
        ticking = false;
        var p = Math.min(1, window.scrollY / max);

        if (hud) {
          var sector = hud.querySelector("[data-hud-sector]");
          var alt = hud.querySelector("[data-hud-alt]");
          var bar = hud.querySelector("[data-hud-progress]");
          var label =
            p < 0.18 ? "01 \u00b7 origin" :
            p < 0.42 ? "02 \u00b7 profile" :
            p < 0.64 ? "03 \u00b7 capabilities" :
            p < 0.86 ? "04 \u00b7 hangar" :
            "05 \u00b7 event horizon";
          if (sector) sector.textContent = label;
          if (alt) alt.textContent = String(Math.round(p * 9840)).padStart(5, "0") + " km";
          if (bar) bar.style.width = (p * 100).toFixed(1) + "%";
        }

        if (heroCopy && !reduce) {
          heroCopy.style.transform =
            "translateY(" + (-p * 170).toFixed(1) + "px) scale(" + (1 - p * 0.16).toFixed(3) + ")";
          heroCopy.style.opacity = Math.max(0, 1 - p * 2.4).toFixed(2);
        }
      };

      var request = function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(paint);
        }
      };

      measure();
      paint();
      window.addEventListener("scroll", request, { passive: true });
      window.addEventListener("resize", function () { measure(); paint(); }, { passive: true });
    }

    if (hero && heroTitle && !touch && !reduce) {
      hero.addEventListener(
        "pointermove",
        function (e) {
          var r = hero.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5;
          var y = (e.clientY - r.top) / r.height - 0.5;
          heroTitle.style.setProperty("--ry", (x * 6).toFixed(2) + "deg");
          heroTitle.style.setProperty("--rx", (-y * 5).toFixed(2) + "deg");
        },
        { passive: true }
      );
      hero.addEventListener("pointerleave", function () {
        heroTitle.style.setProperty("--ry", "0deg");
        heroTitle.style.setProperty("--rx", "0deg");
      });
    }

    var boot = document.querySelector(".boot");
    if (boot) {
      var seen = false;
      try {
        seen = sessionStorage.getItem("iimadouu_boot") === "1";
      } catch (e) {}

      if (reduce || seen) {
        boot.remove();
      } else {
        var lines = boot.querySelectorAll(".boot-line");
        for (var i = 0; i < lines.length; i++) {
          (function (line, idx) {
            setTimeout(function () {
              line.classList.add("on");
            }, 130 + idx * 210);
          })(lines[i], i);
        }
        setTimeout(function () {
          boot.classList.add("done");
          try {
            sessionStorage.setItem("iimadouu_boot", "1");
          } catch (e) {}
        }, 1700);
        setTimeout(function () {
          if (boot.parentNode) boot.remove();
        }, 2600);
        boot.addEventListener("click", function () {
          boot.classList.add("done");
        });
      }
    }
  })();
})();
