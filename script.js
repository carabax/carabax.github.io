const PROFILE_EMAIL = "carabaxik@proton.me";

const bootScreen = document.querySelector("#boot-screen");
const bootLines = document.querySelector("#boot-lines");
const bootProgress = document.querySelector("#boot-progress");
const copyButton = document.querySelector("#copy-email");
const languageButtons = document.querySelectorAll("[data-lang]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const translations = {
  en: {
    title: "carabax.dev :: profile",
    lead:
      "Programmer and technical admin.",
    about:
      "Main stack: Node.js, JavaScript, Python, Discord/Telegram bots, Minecraft servers, hosting, VPNs, automation, and backend utilities.",
    aboutAria: "About me",
    linksAria: "Social profiles",
    copyEmail: "copy email",
    copied: "copied",
    bootMessages: [
      "BIOS (version profile-1.0.0)",
      "Booting from local profile...",
      "[    0.000000] Linux profile 6.5.2-carabax",
      "[    0.141422] ACPI: terminal shell initialized",
      "[    0.287103] drm: simple framebuffer ready",
      "[    0.438801] net: social-links interface up",
      "[    0.572044] systemd[1]: Started Dot Field Renderer.",
      "[    0.821672] systemd[1]: Reached target Profile.",
      "carabax login: guest",
      "Last login: today from github.pages",
      "guest@carabax:~$ startx profile"
    ]
  },
  ru: {
    title: "carabax.dev :: profile",
    lead:
      "Программист и технический админ.",
    about:
      "Основной стек: Node.js, JavaScript, Python, Discord/Telegram боты, сервера Minecraft, хостинг, VPN, автоматизация и серверные утилиты.",
    aboutAria: "О себе",
    linksAria: "Профили в социальных сетях",
    copyEmail: "скопировать email",
    copied: "скопировано",
    bootMessages: [
      "BIOS (версия profile-1.0.0)",
      "Загрузка локального профиля...",
      "[    0.000000] Linux profile 6.5.2-carabax",
      "[    0.141422] ACPI: терминальная оболочка инициализирована",
      "[    0.287103] drm: простой framebuffer готов",
      "[    0.438801] net: интерфейс social-links поднят",
      "[    0.572044] systemd[1]: Запущен Dot Field Renderer.",
      "[    0.821672] systemd[1]: Достигнута цель Profile.",
      "carabax login: guest",
      "Последний вход: сегодня с github.pages",
      "guest@carabax:~$ startx profile"
    ]
  }
};

function readSavedLanguage() {
  try {
    const queryLanguage = new URLSearchParams(window.location.search).get("lang");

    if (translations[queryLanguage]) {
      return queryLanguage;
    }

    return localStorage.getItem("profile-language") || "en";
  } catch {
    return "en";
  }
}

function saveLanguage(language) {
  try {
    localStorage.setItem("profile-language", language);
  } catch {
    // Language switching should keep working even when storage is unavailable.
  }
}

let currentLanguage = readSavedLanguage();

function translatePage(language) {
  const dictionary = translations[language] || translations.en;
  currentLanguage = translations[language] ? language : "en";

  document.documentElement.lang = currentLanguage;
  document.title = dictionary.title;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", dictionary.description);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    element.textContent = dictionary[key];
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const key = element.dataset.i18nAriaLabel;
    element.setAttribute("aria-label", dictionary[key]);
  });

  languageButtons.forEach((button) => {
    const isActive = button.dataset.lang === currentLanguage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  copyButton.textContent = dictionary.copyEmail;
  saveLanguage(currentLanguage);
}

function runBootSequence() {
  if (reducedMotion) {
    bootScreen.classList.add("is-hidden");
    return;
  }

  let delay = 180;

  const bootMessages = translations[currentLanguage].bootMessages;

  bootMessages.forEach((message, index) => {
    delay += index < 2 ? 260 : Math.floor(95 + Math.random() * 135);

    window.setTimeout(() => {
      const line = document.createElement("p");
      line.textContent = message;
      bootLines.appendChild(line);
      bootProgress.style.width = `${((index + 1) / bootMessages.length) * 100}%`;
    }, delay);
  });

  window.setTimeout(() => {
    bootScreen.classList.add("is-hidden");
  }, delay + 620);
}

function setupCopyButton() {
  copyButton.addEventListener("click", async () => {
    const dictionary = translations[currentLanguage];

    try {
      await navigator.clipboard.writeText(PROFILE_EMAIL);
      copyButton.textContent = dictionary.copied;
      window.setTimeout(() => {
        copyButton.textContent = translations[currentLanguage].copyEmail;
      }, 1400);
    } catch {
      window.location.href = `mailto:${PROFILE_EMAIL}`;
    }
  });
}

function setupLanguageSwitch() {
  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      translatePage(button.dataset.lang);
    });
  });
}

function setupDotField() {
  const canvas = document.querySelector("#dot-field");
  const context = canvas.getContext("2d");
  const pointer = { x: 0, y: 0, active: false };
  let dots = [];
  let width = 0;
  let height = 0;
  let animationFrame = 0;

  function resize() {
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(scale, 0, 0, scale, 0, 0);

    const count = Math.min(90, Math.max(34, Math.floor((width * height) / 15000)));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
      radius: Math.random() * 1.8 + 0.7
    }));
  }

  function drawLine(a, b, distance, maxDistance) {
    context.strokeStyle = `rgba(88, 101, 242, ${0.18 * (1 - distance / maxDistance)})`;
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.stroke();
  }

  function render() {
    context.clearRect(0, 0, width, height);
    const maxDistance = width < 700 ? 92 : 130;

    dots.forEach((dot, index) => {
      dot.x += dot.vx;
      dot.y += dot.vy;

      if (dot.x < -10) dot.x = width + 10;
      if (dot.x > width + 10) dot.x = -10;
      if (dot.y < -10) dot.y = height + 10;
      if (dot.y > height + 10) dot.y = -10;

      if (pointer.active) {
        const dx = pointer.x - dot.x;
        const dy = pointer.y - dot.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 150) {
          dot.x -= dx * 0.0009;
          dot.y -= dy * 0.0009;
        }
      }

      context.fillStyle = "rgba(142, 152, 255, 0.72)";
      context.beginPath();
      context.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      context.fill();

      for (let nextIndex = index + 1; nextIndex < dots.length; nextIndex += 1) {
        const other = dots[nextIndex];
        const distance = Math.hypot(dot.x - other.x, dot.y - other.y);

        if (distance < maxDistance) {
          drawLine(dot, other, distance, maxDistance);
        }
      }
    });

    animationFrame = window.requestAnimationFrame(render);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  });
  window.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  resize();

  if (!reducedMotion) {
    render();
  } else {
    context.clearRect(0, 0, width, height);
    dots.forEach((dot) => {
      context.fillStyle = "rgba(142, 152, 255, 0.52)";
      context.beginPath();
      context.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      context.fill();
    });
  }

  return () => window.cancelAnimationFrame(animationFrame);
}

translatePage(currentLanguage);
runBootSequence();
setupLanguageSwitch();
setupCopyButton();
setupDotField();
