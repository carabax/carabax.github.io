const PROFILE_EMAIL = "carabaxik@proton.me";

const bootScreen = document.querySelector("#boot-screen");
const bootLines = document.querySelector("#boot-lines");
const bootProgress = document.querySelector("#boot-progress");
const copyButton = document.querySelector("#copy-email");
const easterTrigger = document.querySelector("#easter-trigger");
const languageButtons = document.querySelectorAll("[data-lang]");
const secretConsole = document.querySelector("#secret-console");
const secretConsoleLog = document.querySelector("#secret-console-log");
const secretCommand = document.querySelector("#secret-command");
const koverStage = document.querySelector("#kover-stage");
const matrixRain = document.querySelector("#matrix-rain");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let matrixAnimationFrame = 0;
let matrixResizeHandler = null;
let boomAnimationFrame = 0;
let glitchInterval = 0;
let commandRunning = false;

const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const translations = {
  en: {
    title: "carabax.dev :: profile",
    lead:
      "Programmer and technical admin.",
    about:
      "Main stack: Node.js, JavaScript, Python, Discord/Telegram bots, Minecraft servers, hosting, VPNs, automation, and backend utilities.",
    aboutAria: "About me",
    projectsAria: "Active projects",
    easterTriggerAria: "Open hidden console",
    secretConsoleAria: "Hidden console",
    secretConsoleIntro: "console ready",
    secretConsolePlaceholder: "",
    secretConsoleOpened: "console attached.",
    secretConsoleUnknown: "command not found",
    koverStarted: "kover daemon started",
    hackStarted: "visual override enabled",
    hackStopped: "visual override disabled",
    boomStarted: "gravity failure detected",
    glitchStarted: "text codec unstable",
    glitchStopped: "text codec restored",
    projectOneTitle: "T-Island Minecraft Discord client",
    projectOneStatus: "in progress",
    projectOneDescription:
      "A custom Discord bot that connects a Minecraft server with its community.",
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
      "Программист и технический администратор.",
    about:
      "Основной стек: Node.js, JavaScript, Python, Discord/Telegram боты, сервера Minecraft, хостинг, VPN, автоматизация и серверные утилиты.",
    aboutAria: "О себе",
    projectsAria: "Активные проекты",
    easterTriggerAria: "Открыть скрытую консоль",
    secretConsoleAria: "Скрытая консоль",
    secretConsoleIntro: "консоль готова",
    secretConsolePlaceholder: "",
    secretConsoleOpened: "консоль подключена.",
    secretConsoleUnknown: "команда не найдена",
    koverStarted: "kover daemon запущен",
    hackStarted: "визуальный режим включен",
    hackStopped: "визуальный режим выключен",
    boomStarted: "обнаружен сбой гравитации",
    glitchStarted: "текстовый кодек нестабилен",
    glitchStopped: "текстовый кодек восстановлен",
    projectOneTitle: "Discord клиент для сервера Minecraft T-Island",
    projectOneStatus: "в работе",
    projectOneDescription:
      "Кастомный Discord бот, который соединяет сервер Minecraft с его сообществом.",
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

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    element.setAttribute("placeholder", dictionary[key]);
  });

  languageButtons.forEach((button) => {
    const isActive = button.dataset.lang === currentLanguage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  copyButton.textContent = dictionary.copyEmail;
  saveLanguage(currentLanguage);

  if (document.body.classList.contains("is-glitched")) {
    scramblePageText();
  }
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

function appendConsoleLine(text, tone = "muted") {
  const line = document.createElement("p");
  line.className = `secret-console-line secret-console-line-${tone}`;
  line.textContent = text;
  secretConsoleLog.appendChild(line);
  secretConsoleLog.scrollTop = secretConsoleLog.scrollHeight;
  return line;
}

async function typeConsoleLine(text, tone = "muted", speed = 8) {
  const line = appendConsoleLine("", tone);

  for (const char of text) {
    line.textContent += char;
    secretConsoleLog.scrollTop = secretConsoleLog.scrollHeight;
    if (speed > 0) {
      await delay(speed);
    }
  }

  return line;
}

async function typeConsoleBlock(text, tone = "muted", speed = 7) {
  const lines = String(text).split("\n");

  for (const line of lines) {
    await typeConsoleLine(line, tone, speed);
  }
}

function clearConsole() {
  secretConsoleLog.innerHTML = "";
}

function makeBar(percent) {
  const filled = Math.round(percent / 10);
  return `[${"█".repeat(filled)}${"░".repeat(10 - filled)}] ${percent}%`;
}

function openSecretConsole() {
  const dictionary = translations[currentLanguage];
  secretConsole.hidden = false;
  secretConsole.classList.add("is-open");

  if (!secretConsole.dataset.opened) {
    appendConsoleLine(dictionary.secretConsoleOpened, "accent");
    secretConsole.dataset.opened = "true";
  }

  window.setTimeout(() => secretCommand.focus(), 40);
}

function closeSecretConsole() {
  secretConsole.classList.remove("is-open");
  window.setTimeout(() => {
    if (!secretConsole.classList.contains("is-open")) {
      secretConsole.hidden = true;
    }
  }, 180);
}

function launchKover() {
  koverStage.classList.remove("is-dancing");
  void koverStage.offsetWidth;
  koverStage.classList.add("is-dancing");

  window.setTimeout(() => {
    koverStage.classList.remove("is-dancing");
  }, 4600);
}

function startMatrixRain() {
  const context = matrixRain.getContext("2d");
  const fontSize = 16;
  let width = 0;
  let height = 0;
  let columns = 0;
  let drops = [];

  function resizeMatrix() {
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    matrixRain.width = Math.floor(width * scale);
    matrixRain.height = Math.floor(height * scale);
    matrixRain.style.width = `${width}px`;
    matrixRain.style.height = `${height}px`;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    columns = Math.ceil(width / fontSize);
    drops = Array.from({ length: columns }, () => Math.random() * -height);
  }

  function drawMatrix() {
    context.fillStyle = "rgba(4, 12, 7, 0.16)";
    context.fillRect(0, 0, width, height);
    context.font = `${fontSize}px ui-monospace, Consolas, monospace`;

    drops.forEach((drop, index) => {
      const value = Math.random() > 0.5 ? "1" : "0";
      const x = index * fontSize;
      const y = drop * fontSize;

      context.fillStyle = Math.random() > 0.96 ? "#d8ffe3" : "#39ff88";
      context.fillText(value, x, y);

      if (y > height && Math.random() > 0.972) {
        drops[index] = 0;
      } else {
        drops[index] = drop + 1;
      }
    });

    matrixAnimationFrame = window.requestAnimationFrame(drawMatrix);
  }

  window.cancelAnimationFrame(matrixAnimationFrame);
  if (matrixResizeHandler) {
    window.removeEventListener("resize", matrixResizeHandler);
  }

  resizeMatrix();
  drawMatrix();
  matrixResizeHandler = resizeMatrix;
  window.addEventListener("resize", matrixResizeHandler, { passive: true });
}

function stopMatrixRain() {
  const context = matrixRain.getContext("2d");
  window.cancelAnimationFrame(matrixAnimationFrame);
  if (matrixResizeHandler) {
    window.removeEventListener("resize", matrixResizeHandler);
    matrixResizeHandler = null;
  }
  context.clearRect(0, 0, matrixRain.width, matrixRain.height);
}

function enableHackMode() {
  document.body.classList.add("is-hacked");

  if (!reducedMotion) {
    startMatrixRain();
  }
}

function disableHackMode() {
  document.body.classList.remove("is-hacked");
  stopMatrixRain();
}

function restoreBoomTargets(targets, layer) {
  targets.forEach((target) => {
    target.style.visibility = "";
    target.removeAttribute("data-boom-hidden");
  });
  layer.remove();
  document.body.classList.remove("is-booming");
}

function launchBoom() {
  const targets = [
    ".terminal-topbar",
    ".prompt-line",
    "#profile-title",
    ".lead",
    ".command-block",
    ".terminal-footer",
    ".links-panel",
    ".projects-section"
  ]
    .map((selector) => document.querySelector(selector))
    .filter(Boolean);

  if (!targets.length) {
    return;
  }

  window.cancelAnimationFrame(boomAnimationFrame);
  document.querySelector(".boom-layer")?.remove();
  document.querySelectorAll("[data-boom-hidden='true']").forEach((target) => {
    target.style.visibility = "";
    target.removeAttribute("data-boom-hidden");
  });

  const layer = document.createElement("div");
  layer.className = "boom-layer";
  document.body.appendChild(layer);
  document.body.classList.add("is-booming");

  if (reducedMotion) {
    window.setTimeout(() => restoreBoomTargets(targets, layer), 700);
    return;
  }

  const pieces = targets.map((target, index) => {
    const rect = target.getBoundingClientRect();
    const clone = target.cloneNode(true);
    const angle = (Math.PI * 2 * index) / targets.length + (Math.random() - 0.5) * 0.8;
    const speed = 10 + Math.random() * 8;

    clone.classList.add("boom-piece");
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.margin = "0";
    layer.appendChild(clone);

    target.dataset.boomHidden = "true";
    target.style.visibility = "hidden";

    return {
      element: clone,
      x: rect.left,
      y: rect.top,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 9 - Math.random() * 7,
      rotation: (Math.random() - 0.5) * 18,
      vr: (Math.random() - 0.5) * 12,
      width: rect.width,
      height: rect.height
    };
  });

  const gravity = 0.58;
  const friction = 0.985;
  const floor = window.innerHeight + 180;
  let frame = 0;

  function animateBoom() {
    frame += 1;

    pieces.forEach((piece) => {
      piece.vy += gravity;
      piece.vx *= friction;
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.rotation += piece.vr;

      if (piece.y + piece.height > floor) {
        piece.y = floor - piece.height;
        piece.vy *= -0.36;
        piece.vx *= 0.78;
        piece.vr *= 0.7;
      }

      piece.element.style.transform = `translate3d(${piece.x - Number.parseFloat(piece.element.style.left)}px, ${piece.y - Number.parseFloat(piece.element.style.top)}px, 0) rotate(${piece.rotation}deg)`;
      piece.element.style.opacity = String(Math.max(0, 1 - frame / 185));
    });

    if (frame < 190) {
      boomAnimationFrame = window.requestAnimationFrame(animateBoom);
      return;
    }

    restoreBoomTargets(targets, layer);
  }

  animateBoom();
}

const commandRegistry = {
  help: {
    run: () =>
      typeConsoleBlock(`Available commands:
help, about, skills, projects, contact, status, clear,
matrix, mine, creeper, boot, deploy, portal, coffee, scan, achievement, summon bot, firework, snake, error, nuke bugs,
sudo rm -rf /, whoami, id, pwd, ls -la, cat .secrets, git status, ping carabax`)
  },
  about: {
    run: () =>
      typeConsoleLine(
        "I build bots, tools, servers and automation that make communities easier to manage."
      )
  },
  skills: {
    run: () =>
      typeConsoleBlock(`Node.js      █████████░ 90%
Python       ████████░░ 80%
Linux        █████████░ 90%
Discord.js   █████████░ 90%
Minecraft    ████████░░ 80%
Automation   █████████░ 90%`)
  },
  projects: {
    run: () =>
      typeConsoleBlock(`Opening project list...
- Discord bot for Minecraft server
- Backend utilities
- Server automation
- Minecraft tools`)
  },
  contact: {
    run: () => typeConsoleLine("Telegram, Discord, GitHub and email links loaded.")
  },
  status: {
    run: () => typeConsoleLine("online — building, configuring, debugging.")
  },
  clear: {
    run: async () => clearConsole()
  },
  whoami: {
    run: () => typeConsoleLine("carabax — programmer, technical admin, bot developer.")
  },
  id: {
    run: () => typeConsoleLine("uid=1337(carabax) gid=404(not_found) groups=dev,linux,minecraft,bots")
  },
  pwd: {
    run: () => typeConsoleLine("/home/carabax/portfolio")
  },
  "ls -la": {
    run: () =>
      typeConsoleBlock(`.about
.projects
.skills
.contacts
.secrets`)
  },
  "cat .secrets": {
    run: () => typeConsoleLine("Nice try. Secrets are encrypted with caffeine.")
  },
  "sudo rm -rf /": {
    run: () => typeConsoleLine("Permission denied: this portfolio is protected by common sense.")
  },
  "git status": {
    run: () => typeConsoleLine("On branch main. Nothing to commit, but always something to improve.")
  },
  "ping carabax": {
    run: () => typeConsoleLine("64 bytes from carabax: skill=high time=1ms")
  },
  matrix: {
    run: async () => {
      await typeConsoleLine("Wake up, visitor...");
      await typeConsoleLine("The portfolio has you...");

      const chars = "01/\\{}#$@<>_=";
      const line = appendConsoleLine("", "accent");
      const started = Date.now();

      while (Date.now() - started < 3000) {
        const rows = Array.from({ length: 5 }, () =>
          Array.from({ length: 42 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
        );
        line.textContent = rows.join("\n");
        secretConsoleLog.scrollTop = secretConsoleLog.scrollHeight;
        await delay(95);
      }

      await typeConsoleLine("Access granted.", "accent");
      await typeConsoleLine("Welcome to carabax.dev", "accent");
    }
  },
  mine: {
    run: async () => {
      for (const percent of [0, 20, 40, 60, 80, 100]) {
        await typeConsoleLine(`Mining block ${makeBar(percent)}`, "muted", 4);
        await delay(160);
      }
      await typeConsoleLine("Block broken!", "accent");
      await typeConsoleLine("You found: Diamond of Clean Code 💎", "accent");
    }
  },
  creeper: {
    run: async () => {
      await typeConsoleBlock("Creeper detected...\n      🟩", "muted", 5);
      await delay(420);
      await typeConsoleBlock("Creeper is getting closer...\n   🟩", "muted", 5);
      await delay(420);
      await typeConsoleBlock("CREEPER: tssssssss...\n 🟩", "muted", 5);
      await delay(520);
      document.querySelector(".profile-terminal")?.classList.add("is-shaking");
      await typeConsoleLine("💥 BOOM!", "accent");
      await delay(520);
      document.querySelector(".profile-terminal")?.classList.remove("is-shaking");
      await typeConsoleLine("Portfolio damage: 0%");
      await typeConsoleLine("Backup restored successfully.", "accent");
    }
  },
  boot: {
    run: async () => {
      for (const line of [
        "Booting carabaxOS...",
        "Loading kernel modules...",
        "Starting Discord bot engine...",
        "Connecting to Minecraft API...",
        "Mounting /projects...",
        "Starting portfolio service...",
        "carabaxOS ready.",
        'Type "help" to continue.'
      ]) {
        await typeConsoleLine(line);
        await delay(190);
      }
    }
  },
  deploy: {
    run: async () => {
      for (const step of ["Building project...", "Uploading files...", "Restarting services..."]) {
        await typeConsoleLine(step);
        await delay(160);
        await typeConsoleLine("[██████████] 100%", "accent", 5);
        await delay(180);
      }
      await typeConsoleLine("Deploy successful.", "accent");
      await typeConsoleLine("No bugs were harmed. Probably.");
    }
  },
  portal: {
    run: async () => {
      for (const frame of [
        "Creating portal...\n[ ] [ ] [ ]",
        "Creating portal...\n[🟪] [ ] [🟪]",
        "Creating portal...\n[🟪] [🟪] [🟪]"
      ]) {
        await typeConsoleBlock(frame, "muted", 5);
        await delay(380);
      }
      await typeConsoleLine("Portal activated.", "accent");
      await typeConsoleLine("Entering backend dimension...");
      await typeConsoleLine("Welcome to /projects", "accent");
    }
  },
  coffee: {
    run: async () => {
      for (const frame of ["   ))\n  ((\n[____]", "  (((\n   )))\n[____]", "   ))\n  (((\n[____]"]) {
        await typeConsoleBlock(frame, "muted", 3);
        await delay(320);
      }
      await typeConsoleLine("Coffee brewed.", "accent");
      await typeConsoleLine("Productivity increased by 42%.");
    }
  },
  scan: {
    run: async () => {
      await typeConsoleLine("Scanning visitor...");
      for (const percent of [20, 40, 60, 80, 100]) {
        await typeConsoleLine(makeBar(percent), "accent", 4);
        await delay(160);
      }
      await typeConsoleBlock(`Result:
Curiosity level: high
Tech interest: detected
Hiring potential: possible`);
    }
  },
  achievement: {
    run: async () => {
      await typeConsoleBlock(`+--------------------------------+
| Achievement unlocked!          |
| You found the hidden terminal. |
+--------------------------------+`);
      showAchievementToast();
    }
  },
  "summon bot": {
    run: async () => {
      for (const line of [
        "Summoning Discord bot.",
        "Summoning Discord bot..",
        "Summoning Discord bot..."
      ]) {
        await typeConsoleLine(line);
        await delay(260);
      }
      await typeConsoleBlock(`Bot online.

[carabax-bot]
Status: watching Minecraft server
Latency: 12ms
Commands loaded: 24`, "accent");
    }
  },
  firework: {
    run: async () => {
      for (const frame of [
        "      .\n     /|\\\n      |",
        "      *\n    * | *\n      |",
        "   *  *  *\n *    |    *\n   *  *  *"
      ]) {
        await typeConsoleBlock(frame, "accent", 3);
        await delay(300);
      }
      await typeConsoleLine("Nice. You found a hidden celebration.");
    }
  },
  snake: {
    run: async () => {
      for (const frame of [">----", "->---", "-->--", "--->-", "---->"]) {
        await typeConsoleLine(frame, "accent", 2);
        await delay(180);
      }
      await typeConsoleLine("Snake escaped into production.");
    }
  },
  error: {
    run: async () => {
      const startedAt = Date.now();
      const skull = document.createElement("pre");
      skull.className = "critical-skull";
      skull.textContent = "⚠";
      document.body.appendChild(skull);
      document.body.classList.add("is-critical-error");
      try {
        await typeConsoleBlock(`CRITICAL ERROR:
Too much skill detected.`, "accent");
        await delay(300);
        await typeConsoleLine("Attempting fix...");
        await typeConsoleLine("[██████████] 100%", "accent", 4);
        await typeConsoleLine("Fixed.");
        await typeConsoleLine("System is now slightly cooler.");
        await delay(Math.max(0, 3000 - (Date.now() - startedAt)));
      } finally {
        document.body.classList.remove("is-critical-error");
        skull.remove();
      }
    }
  },
  "nuke bugs": {
    run: async () => {
      await typeConsoleBlock(`Searching bugs...
Found: 7
Launching patch...`);
      for (const frame of [
        "bug bug bug bug bug bug bug",
        "bug bug bug bug bug",
        "bug bug",
        "no bugs found"
      ]) {
        await typeConsoleLine(frame, "accent", 5);
        await delay(300);
      }
      await typeConsoleLine("All bugs removed.", "accent");
      await typeConsoleLine("New bugs scheduled for tomorrow.");
    }
  },
  kover: {
    hidden: true,
    run: async () => {
      appendConsoleLine(translations[currentLanguage].koverStarted, "accent");
      launchKover();
    }
  },
  hack: {
    hidden: true,
    run: async () => {
      appendConsoleLine(translations[currentLanguage].hackStarted, "accent");
      enableHackMode();
    }
  },
  unhack: {
    hidden: true,
    run: async () => {
      appendConsoleLine(translations[currentLanguage].hackStopped, "accent");
      disableHackMode();
    }
  },
  boom: {
    hidden: true,
    run: async () => {
      appendConsoleLine(translations[currentLanguage].boomStarted, "accent");
      launchBoom();
    }
  },
  glitch: {
    hidden: true,
    run: async () => {
      appendConsoleLine(translations[currentLanguage].glitchStarted, "accent");
      enableGlitch();
    }
  },
  unglitch: {
    hidden: true,
    run: async () => {
      appendConsoleLine(translations[currentLanguage].glitchStopped, "accent");
      disableGlitch();
    }
  }
};

function showAchievementToast() {
  document.querySelector(".achievement-toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "achievement-toast";
  toast.textContent = "Achievement unlocked!";
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2800);
}

async function runConsoleCommand(command) {
  const entry = commandRegistry[command];

  if (!entry) {
    await typeConsoleLine(`Command not found: ${command}`);
    await typeConsoleLine('Type "help" to see available commands.');
    return;
  }

  await entry.run();
}

function setupSecretConsole() {
  easterTrigger.addEventListener("click", openSecretConsole);

  secretConsole.addEventListener("click", (event) => {
    if (event.target === secretConsole) {
      closeSecretConsole();
    }
  });

  secretCommand.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSecretConsole();
      return;
    }

    if (event.key !== "Enter" || commandRunning) {
      return;
    }

    const command = secretCommand.value.trim().toLowerCase();
    const dictionary = translations[currentLanguage];

    if (!command) {
      return;
    }

    appendConsoleLine(`guest@carabax:~$ ${command}`, "input");
    secretCommand.value = "";
    commandRunning = true;
    runConsoleCommand(command).finally(() => {
      commandRunning = false;
    });
  });
}

function makeGlitchedText(text) {
  const symbols = ["#", "%", "@", "?", "!", "/", "\\", "|", "*", "+", "0", "1", "░", "▒"];
  let changed = false;

  const glitched = [...text]
    .map((char) => {
      if (!/[a-zа-я0-9]/iu.test(char) || Math.random() > 0.16) {
        return char;
      }

      changed = true;
      return symbols[Math.floor(Math.random() * symbols.length)];
    })
    .join("");

  if (changed || !/[a-zа-я0-9]/iu.test(text)) {
    return glitched;
  }

  return text.replace(/[a-zа-я0-9]/iu, symbols[Math.floor(Math.random() * symbols.length)]);
}

function scramblePageText() {
  const targets = document.querySelectorAll(
    ".prompt-line span, #profile-title, .lead, .command-block .muted, .command-block [data-i18n], .terminal-footer .muted, .social-link strong, .social-link small, .section-command .muted, .process-indicator, .project-card h2, .project-card p, .project-status, .project-tags span"
  );

  targets.forEach((target) => {
    if (!target.dataset.cleanText) {
      target.dataset.cleanText = target.textContent;
    }

    target.textContent = makeGlitchedText(target.dataset.cleanText);
  });
}

function restoreGlitchedText() {
  document.querySelectorAll("[data-clean-text]").forEach((target) => {
    target.textContent = target.dataset.cleanText;
    delete target.dataset.cleanText;
  });
  translatePage(currentLanguage);
}

function enableGlitch() {
  window.clearInterval(glitchInterval);
  document.body.classList.add("is-glitched");
  scramblePageText();

  if (!reducedMotion) {
    glitchInterval = window.setInterval(scramblePageText, 420);
  }
}

function disableGlitch() {
  window.clearInterval(glitchInterval);
  glitchInterval = 0;
  document.body.classList.remove("is-glitched");
  restoreGlitchedText();
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
setupSecretConsole();
setupDotField();
