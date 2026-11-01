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

// Solo en las páginas que tienen formulario (home y contacto)
const formulario = document.querySelector(".formulario");
const modal = document.querySelector("#modal-envio");

function mostrarModal(titulo, texto) {
  modal.querySelector(".modal__titulo").textContent = titulo;
  modal.querySelector(".modal__texto").textContent = texto;
  modal.classList.toggle("modal--error", titulo.startsWith("No"));
  modal.showModal();
}

if (formulario) {
  const botonEnviar = formulario.querySelector(".formulario__enviar");

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
}


// ---------- Visor de obras (obras.html) ----------
// Al abrir una obra se copia su <template> al visor y se arma la galería de fotos.

const visor = document.querySelector("#visor-obra");

if (visor) {
  const principal = visor.querySelector(".visor__principal");
  const info = visor.querySelector(".visor__info");
  const contador = visor.querySelector(".visor__contador");
  const controles = visor.querySelector(".visor__controles");
  let fotos = [];
  let actual = 0;

  function mostrarFoto(i) {
    actual = (i + fotos.length) % fotos.length;
    principal.replaceChildren(fotos[actual].cloneNode());
    contador.textContent = `${actual + 1} de ${fotos.length}`;
  }

  document.querySelectorAll(".obra__abrir").forEach((boton) => {
    boton.addEventListener("click", () => {
      const detalle = boton.closest(".obra").querySelector(".obra__detalle").content.cloneNode(true);
      fotos = [...detalle.querySelectorAll(".visor__fotos img")];
      detalle.querySelector(".visor__fotos").remove();
      info.replaceChildren(detalle);
      controles.hidden = fotos.length < 2;
      mostrarFoto(0);
      visor.showModal();
    });
  });

  visor.querySelectorAll(".visor__flecha").forEach((flecha) => {
    flecha.addEventListener("click", () => mostrarFoto(actual + Number(flecha.dataset.paso)));
  });

  // Flechas del teclado para pasar fotos
  visor.addEventListener("keydown", (e) => {
    if (fotos.length < 2) return;
    if (e.key === "ArrowRight") mostrarFoto(actual + 1);
    if (e.key === "ArrowLeft") mostrarFoto(actual - 1);
  });

  visor.querySelector(".visor__cerrar").addEventListener("click", () => visor.close());

  // Cerrar al hacer clic en el fondo oscuro
  visor.addEventListener("click", (e) => {
    if (e.target === visor) visor.close();
  });
}
