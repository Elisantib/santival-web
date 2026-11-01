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

menu.querySelectorAll("a").forEach((enlace) => {
  enlace.addEventListener("click", cerrarMenu);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarMenu();
});


// ---------- Header sobre el hero ----------

function actualizarHeader() {
  const bajo = window.scrollY > 40;
  const menuAbierto = menu.classList.contains("is-open");
  header.classList.toggle("is-solid", bajo || menuAbierto);
}

window.addEventListener("scroll", actualizarHeader, { passive: true });
actualizarHeader();


// ---------- Formulario de contacto ----------

const formulario = document.querySelector(".formulario");
const modal = document.querySelector("#modal-envio");
const botonEnviar = formulario.querySelector(".formulario__enviar");

function mostrarModal(titulo, texto) {
  modal.querySelector(".modal__titulo").textContent = titulo;
  modal.querySelector(".modal__texto").textContent = texto;
  modal.classList.toggle("modal--error", titulo.startsWith("No"));
  modal.showModal();
}

formulario.addEventListener("submit", async (e) => {
  e.preventDefault();
  botonEnviar.disabled = true;
  botonEnviar.textContent = "Enviando…";

  try {
    const respuesta = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(formulario)).toString(),
    });
    if (!respuesta.ok) throw new Error(respuesta.status);

    formulario.reset();
    mostrarModal(
      "¡Gracias por escribirnos!",
      "Recibimos tu mensaje. Revisaremos tu proyecto y te contactaremos a la brevedad."
    );
  } catch {
    mostrarModal(
      "No pudimos enviar tu mensaje",
      "Inténtalo de nuevo en unos minutos o escríbenos directo por WhatsApp al +56 9 3386 1293."
    );
  } finally {
    botonEnviar.disabled = false;
    botonEnviar.textContent = "Enviar mensaje";
  }
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.close();
});
