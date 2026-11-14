import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const loadImage = (src) => new Promise((resolve) => {
  const img = new Image();

  img.onload = () => resolve(img);
  img.onerror = () => {
    console.warn("Aset story belum tersedia:", src);
    resolve(null);
  };

  img.src = src;
});

export async function initStory() {
  const section = document.querySelector("#story.pixel-story");
  if (!section) return;

  const stage = section.querySelector(".journey-stage");
  const scene = section.querySelector(".journey-scene");
  const canvas = section.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  const chapters = [...section.querySelectorAll(".journey-chapter")];
  const skyCaption = section.querySelector(".journey-sky");
  const skyLabel = section.querySelector(".journey-sky__label");
  const skyTitle = section.querySelector(".journey-sky__title");
  
  let skyChapterIndex = -1;
  let skyTransition;
  const markers = [...section.querySelectorAll(".journey-steps li")];

  if (!chapters.length) return;

  const [clouds, mountains, foreground, hero] = await Promise.all([
    loadImage("assets/images/project-scenes/path-clouds-back.png"),
    loadImage("assets/images/project-scenes/path-bg.png"),
    loadImage("assets/images/project-scenes/path-front.png"),
    loadImage("assets/images/story/hero-run.png")
  ]);

  const size = hero?.naturalHeight || 32;
  const frames = hero ? Math.floor(hero.naturalWidth / size) : 0;
  const feet = Array(frames).fill(0);

  // Ukur ruang transparan di bawah kaki setiap frame.
  // Dengan begitu, kaki tetap menapak pada tanah.
  if (frames) {
    const measure = document.createElement("canvas");
    measure.width = hero.naturalWidth;
    measure.height = size;

    const m = measure.getContext("2d");
    m.drawImage(hero, 0, 0);

    const pixels = m.getImageData(
      0, 0, measure.width, size
    ).data;

    for (let f = 0; f < frames; f++) {
      scan: for (let y = size - 1; y >= 0; y--) {
        for (let x = 0; x < size; x++) {
          const alpha = pixels[
            (y * measure.width + f * size + x) * 4 + 3
          ];

          if (alpha > 16) {
            feet[f] = size - 1 - y;
            break scan;
          }
        }
      }
    }
  }

  const state = { p: 0 };
  let previous = 0;
  let walked = 0;
  let direction = 1;
  let pinned = false;

  // Gambar diulang dan dicerminkan bergantian:
  // tepi kanan satu tile bertemu dengan tepi kanan tile berikutnya.
  function layer(img, distance, opacity) {
    if (!img) return;

    const h = canvas.height;
    const tileWidth = Math.ceil(
      img.naturalWidth * h / img.naturalHeight
    );
    const offset = Math.round(distance) % (tileWidth * 2);

    ctx.globalAlpha = opacity;

    for (
      let x = -offset, i = 0;
      x < canvas.width;
      x += tileWidth, i++
    ) {
      ctx.save();
      ctx.translate(x + (i % 2 ? tileWidth : 0), 0);
      ctx.scale(i % 2 ? -1 : 1, 1);
      ctx.drawImage(img, 0, 0, tileWidth, h);
      ctx.restore();
    }

    ctx.globalAlpha = 1;
  }

  function paint() {
    const p = state.p;
    const delta = p - previous;

    if (Math.abs(delta) > 0.000001) {
      direction = delta > 0 ? 1 : -1;
    }

    walked += Math.abs(delta) * 720;
    previous = p;

    const w = canvas.width;
    const h = canvas.height;
    const distance = p * 720;
    const floorY = h - 20;

    ctx.imageSmoothingEnabled = false;

    // Lapisan dasar selalu memenuhi canvas.
    ctx.fillStyle = "#102535";
    ctx.fillRect(0, 0, w, h);

    layer(clouds, distance * 0.12, 0.7);
    layer(mountains, distance * 0.3, 0.8);
    layer(foreground, distance * 0.6, 1);

    // Sesuaikan suasana dengan warna gelap website.
    ctx.fillStyle = "#07121b55";
    ctx.fillRect(0, 0, w, h);

    // Tanah selalu menutup seluruh lebar scene.
    ctx.fillStyle = "#152a30";
    ctx.fillRect(0, floorY, w, 20);

    ctx.fillStyle = "#648b76";
    ctx.fillRect(0, floorY, w, 3);

    ctx.fillStyle = "#30454c";
    for (
      let x = -(Math.round(distance) % 16);
      x < w;
      x += 16
    ) {
      ctx.fillRect(x + 5, floorY + 10, 5, 2);
    }

    if (frames) {
      const frame = Math.floor(walked / 5) % frames;
      const x = Math.round(
        8 + p * Math.max(0, w - size - 16)
      );
      const y = floorY - size + feet[frame];

      ctx.save();
      ctx.translate(x + (direction < 0 ? size : 0), y);
      ctx.scale(direction, 1);

      ctx.drawImage(
        hero,
        frame * size, 0, size, size,
        0, 0, size, size
      );

      ctx.restore();
    }

    const active = Math.min(
      chapters.length - 1,
      Math.floor(p * chapters.length)
    );

    const currentChapter = chapters[active];

if (
  currentChapter &&
  skyCaption &&
  skyLabel &&
  skyTitle &&
  active !== skyChapterIndex
) {
  const isFirstPaint = skyChapterIndex === -1;
  skyChapterIndex = active;

  skyLabel.textContent =
    currentChapter.querySelector("small")?.textContent?.trim() || "";

  skyTitle.textContent =
    currentChapter.dataset.sceneTitle ||
    currentChapter.querySelector("h2")?.textContent ||
    "";

  skyTransition?.cancel();

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!isFirstPaint && !prefersReducedMotion) {
    skyTransition = skyCaption.animate(
      [
        { opacity: 0, transform: "translateY(8px)" },
        { opacity: 1, transform: "translateY(0)" }
      ],
      {
        duration: 220,
        easing: "ease-out"
      }
    );
  }
}

    chapters.forEach((chapter, i) => {
      chapter.classList.toggle("is-active", i === active);
      chapter.setAttribute(
        "aria-hidden",
        String(pinned && i !== active)
      );
    });

    markers.forEach((marker, i) => {
      marker.classList.toggle("is-active", i === active);

      if (i === active) {
        marker.setAttribute("aria-current", "step");
      } else {
        marker.removeAttribute("aria-current");
      }
    });
  }

  function resize() {
    // Pembesaran pixel: 3× pada scene besar, 2× pada scene kecil.
    const scale = scene.clientWidth >= 760 ? 3 : 2;

    canvas.width = Math.max(
      1, Math.ceil(scene.clientWidth / scale)
    );
    canvas.height = Math.max(
      1, Math.ceil(scene.clientHeight / scale)
    );

    paint();
  }

  const observer = new ResizeObserver(resize);
  observer.observe(scene);
  resize();

  const mm = gsap.matchMedia();

  mm.add({
    all: "(min-width: 0px)",
    desktop: "(min-width: 900px) and (min-height: 700px)",
    reduce: "(prefers-reduced-motion: reduce)"
  }, ({ conditions }) => {
    pinned = conditions.desktop && !conditions.reduce;

    section.classList.toggle("is-pinned", pinned);

    state.p = previous = walked = 0;
    direction = 1;
    resize();

    if (!conditions.reduce) {
      gsap.to(state, {
        p: 1,
        duration: 1,
        ease: "none",
        onUpdate: paint,

        scrollTrigger: {
          trigger: section,
          start: pinned ? "top 100px" : "top 85%",
          end: pinned
            ? () => "+=" + Math.max(1600, innerHeight * 2.4)
            : "bottom 20%",
          pin: pinned ? stage : false,
          pinSpacing: true,
          scrub: 0.25,
          invalidateOnRefresh: true,
          onRefresh: paint
        }
      });
    }

    return () => {
      pinned = false;
      section.classList.remove("is-pinned");

      chapters.forEach(chapter => {
        chapter.removeAttribute("aria-hidden");
      });
    };
  });

  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  // Smooth scroll (Lenis) dan ScrollTrigger harus membaca posisi scroll yang sama.
  const syncLenis = () => window.PORTFOLIO_UI.lenis?.on("scroll", ScrollTrigger.update);
  syncLenis();
  document.addEventListener("portfolio:lenis", syncLenis, { once: true });

  window.addEventListener("pagehide", event => {
    if (!event.persisted) {
      mm.revert();
      observer.disconnect();
    }
  });
}