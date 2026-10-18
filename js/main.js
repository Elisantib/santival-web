// ===================================================
// MAIN - Constructora Santival
// ===================================================


// ---------- Menú móvil ----------

const header = document.querySelector(".header");
const toggle = document.querySelector(".header__toggle");
const menu = document.querySelector(".header__nav");

function cerrarMenu() {
  toggle.setAttribute("aria-expanded", "false");
  menu.classList.remove("is-open");
  actualizarHeader();
}

toggle.addEventListener("click", () => {
  const abierto = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!abierto));
  menu.classList.toggle("is-open", !abierto);
  actualizarHeader();
});

// Al tocar un enlace, el menú se cierra para que se vea la sección
menu.querySelectorAll("a").forEach((enlace) => {
  enlace.addEventListener("click", cerrarMenu);
});

// La tecla Escape también lo cierra
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarMenu();
});


// ---------- Header sobre el hero ----------
// Transparente arriba de todo; sólido al bajar o con el menú abierto

function actualizarHeader() {
  const bajo = window.scrollY > 40;
  const menuAbierto = menu.classList.contains("is-open");
  header.classList.toggle("is-solid", bajo || menuAbierto);
}

window.addEventListener("scroll", actualizarHeader, { passive: true });
actualizarHeader();
