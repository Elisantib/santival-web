// ===================================================
// MAIN - Constructora Santival
// ===================================================


// ---------- Menú móvil ----------

const toggle = document.querySelector(".header__toggle");
const menu = document.querySelector(".header__nav");

function cerrarMenu() {
  toggle.setAttribute("aria-expanded", "false");
  menu.classList.remove("is-open");
}

toggle.addEventListener("click", () => {
  const abierto = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!abierto));
  menu.classList.toggle("is-open", !abierto);
});

// Al tocar un enlace, el menú se cierra para que se vea la sección
menu.querySelectorAll("a").forEach((enlace) => {
  enlace.addEventListener("click", cerrarMenu);
});

// La tecla Escape también lo cierra
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarMenu();
});
