const TG_USER = "lanperor";

const links = [...document.querySelectorAll(".site-nav a")];
const onIndex = Boolean(document.getElementById("home"));
const navToggle = document.querySelector(".nav-toggle");
const sections = onIndex
  ? links
      .map((link) => {
        const href = link.getAttribute("href") || "";
        const id = href.includes("#") ? href.slice(href.indexOf("#") + 1) : "";
        return id ? document.getElementById(id) : null;
      })
      .filter(Boolean)
  : [];

function sectionIdFromHash(id) {
  const el = document.getElementById(id);
  return el?.closest(".page-section")?.id || id;
}

function closeNav() {
  document.body.classList.remove("is-nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
}

function setActive(id) {
  const navId = sectionIdFromHash(id);
  links.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const hash = href.includes("#") ? href.slice(href.indexOf("#")) : href;
    link.classList.toggle("is-active", hash === `#${navId}`);
  });
  document.body.classList.toggle("is-away", navId !== "home");
  document.body.classList.toggle("is-contacts", navId === "contacts");
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    const id = link.getAttribute("href").slice(1);
    if (id) setActive(id);
    closeNav();
  });
});

navToggle?.addEventListener("click", () => {
  const open = document.body.classList.toggle("is-nav-open");
  navToggle.setAttribute("aria-expanded", String(open));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeNav();
});

function pickSection() {
  document.body.classList.toggle("is-scrolled", window.scrollY > 10);
  if (!onIndex) return;
  const nearBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;
  if (nearBottom) {
    setActive("contacts");
    return;
  }
  const probe = window.scrollY + Math.min(240, window.innerHeight * 0.3);
  let current = sections[0]?.id || "home";
  for (const section of sections) {
    if (section.offsetTop - 88 <= probe) current = section.id;
  }
  setActive(current);
}

if (onIndex) {
  window.addEventListener("scroll", pickSection, { passive: true });
  window.addEventListener("resize", pickSection);
  setActive(sectionIdFromHash((location.hash || "#home").slice(1) || "home"));
  pickSection();
} else {
  document.body.classList.add("is-away");
  window.addEventListener("scroll", () => {
    document.body.classList.toggle("is-scrolled", window.scrollY > 10);
  }, { passive: true });
}

const stepDetail = document.getElementById("step-detail");
const stepButtons = [...document.querySelectorAll(".step-btn")];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderStep(button) {
  const title = button.querySelector("h3")?.textContent || "";
  const detail = button.dataset.detail || "Сюда позже впишем подробный текст этого шага.";
  const you = button.dataset.you || "";
  const we = button.dataset.we || "";
  const index = stepButtons.indexOf(button) + 1;
  stepButtons.forEach((item) => {
    const open = item === button;
    item.classList.toggle("is-open", open);
    item.setAttribute("aria-expanded", String(open));
  });
  if (stepDetail) {
    stepDetail.innerHTML = `
      <p class="eyebrow">Шаг ${index}</p>
      <h3>${escapeHtml(title)}</h3>
      <p class="muted">${escapeHtml(detail)}</p>
      ${
        you && we
          ? `<dl class="step-split">
              <div><dt>Вы</dt><dd>${escapeHtml(you)}</dd></div>
              <div><dt>Мы</dt><dd>${escapeHtml(we)}</dd></div>
            </dl>`
          : ""
      }
    `;
  }
}

stepButtons.forEach((button) => {
  button.addEventListener("click", () => renderStep(button));
});

const themeToggle = document.querySelector(".theme-toggle");
const storedTheme = localStorage.getItem("fahriyos-theme");
if (storedTheme === "dark" || storedTheme === "light") {
  document.documentElement.setAttribute("data-theme", storedTheme);
}

themeToggle?.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("fahriyos-theme", next);
});

const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const packageSelect = contactForm?.querySelector("select[name='package']");

function showFormStatus(message, kind) {
  if (!formStatus) return;
  formStatus.hidden = false;
  formStatus.dataset.kind = kind || "";
  formStatus.textContent = message;
}

document.querySelectorAll("[data-pack]").forEach((el) => {
  el.addEventListener("click", () => {
    if (!packageSelect) return;
    packageSelect.value = el.dataset.pack;
  });
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const name = String(data.get("name") || "").trim();
  const contact = String(data.get("contact") || "").trim();
  const message = String(data.get("message") || "").trim();
  const option = packageSelect?.selectedOptions[0];
  const packTitle = option?.dataset.title || option?.textContent || "";
  const packPrice = option?.dataset.price || "";
  const packValue = option?.value || "";
  const submitBtn = contactForm.querySelector("button[type='submit']");

  if (!packValue) {
    showFormStatus("Выберите пакет или услугу.", "err");
    packageSelect?.focus();
    return;
  }
  if (!contact) {
    showFormStatus("Укажите телефон или Telegram, чтобы мы могли ответить.", "err");
    contactForm.querySelector("[name='contact']")?.focus();
    return;
  }

  const packText = {
    prep: "Групповые занятия, записи уроков, пробные тесты, материалы.",
    admission: "Подбор вуза, подготовка документов, подача заявки, сопровождение до пригласительного письма.",
    settle: "Жильё, документы, банк и SIM-карта, подача на ВНЖ, страховка.",
    online: "Подбор вуза, подготовка документов, подача заявки, сопровождение до пригласительного письма, жильё, документы, банк и SIM-карта, подача на ВНЖ, страховка.",
    full: "Встреча в аэропорту, совместные визиты, всё из пакетов 2 и 3.",
    "one-uni": "Подача в один университет.",
    "three-uni": "Подача в три и более университетов.",
    insurance: "Страховка для ВНЖ.",
    ikamet: "Подача на студенческий ВНЖ.",
  }[packValue] || "";

  const lines = [
    "Здравствуйте, FahriYOS.EDU!",
    name ? `Меня зовут ${name}.` : "",
    packTitle ? `Интересует пакет: ${packTitle}${packPrice ? ` (${packPrice})` : ""}.` : "Хочу консультацию по поступлению.",
    packText,
    message,
    contact ? `Мой контакт: ${contact}` : "",
  ].filter(Boolean);

  const url = `https://t.me/${TG_USER}?text=${encodeURIComponent(lines.join("\n"))}`;
  showFormStatus("Откроется Telegram с текстом заявки. Нажмите «Отправить» в мессенджере, чтобы мы её получили.", "ok");
  if (submitBtn) submitBtn.disabled = true;
  window.open(url, "_blank", "noopener");
  window.setTimeout(() => {
    if (submitBtn) submitBtn.disabled = false;
  }, 1200);
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = [...document.querySelectorAll(".reveal")];
if (!reduceMotion && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  revealItems.forEach((el) => io.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add("is-in"));
}
