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


// ---------- Google Analytics con aviso de cookies ----------
// Analytics solo se carga si la persona acepta. La elección se guarda en el navegador
// y se puede cambiar desde "Preferencias de cookies" en el footer.

const GA_ID = "G-6EH6WS7R6D";
const CLAVE_COOKIES = "santival-cookies"; // "aceptadas" o "rechazadas"

function leerEleccion() {
  try { return localStorage.getItem(CLAVE_COOKIES); } catch { return null; }
}

function guardarEleccion(valor) {
  try { localStorage.setItem(CLAVE_COOKIES, valor); } catch {}
}

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

// Modo de consentimiento de Google: todo denegado hasta que la persona acepte
gtag("consent", "default", {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
});

let analyticsCargado = false;

function cargarAnalytics() {
  gtag("consent", "update", { analytics_storage: "granted" });
  if (analyticsCargado) return;
  analyticsCargado = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.append(script);
  gtag("js", new Date());
  gtag("config", GA_ID);
}

// Borra las cookies de Analytics (_ga, _ga_XXXX) si la persona cambia a "Rechazar"
function borrarCookiesAnalytics() {
  const dominio = location.hostname.replace(/^www\./, "");
  document.cookie.split(";").forEach((c) => {
    const nombre = c.split("=")[0].trim();
    if (!nombre.startsWith("_ga")) return;
    document.cookie = `${nombre}=; Max-Age=0; path=/`;
    document.cookie = `${nombre}=; Max-Age=0; path=/; domain=.${dominio}`;
  });
}

// Envía un evento a Analytics, solo si la persona aceptó
function registrarEvento(nombre, datos = {}) {
  if (analyticsCargado && leerEleccion() === "aceptadas") gtag("event", nombre, datos);
}

function mostrarAvisoCookies() {
  if (document.querySelector(".aviso-cookies")) return;
  const aviso = document.createElement("div");
  aviso.className = "aviso-cookies";
  aviso.setAttribute("role", "region");
  aviso.setAttribute("aria-label", "Aviso de cookies");
  aviso.innerHTML = `
    <p class="aviso-cookies__texto">Usamos cookies de Google Analytics para saber cómo se usa el sitio y mejorarlo. Solo se activan si las aceptas. <a href="privacidad.html#cookies">Más información</a></p>
    <div class="aviso-cookies__botones">
      <button type="button" class="boton boton--secundario" data-cookies="rechazadas">Rechazar</button>
      <button type="button" class="boton" data-cookies="aceptadas">Aceptar</button>
    </div>`;
  aviso.addEventListener("click", (e) => {
    const eleccion = e.target.dataset.cookies;
    if (!eleccion) return;
    guardarEleccion(eleccion);
    if (eleccion === "aceptadas") {
      cargarAnalytics();
    } else {
      gtag("consent", "update", { analytics_storage: "denied" });
      borrarCookiesAnalytics();
    }
    aviso.remove();
    document.body.classList.remove("con-aviso-cookies");
  });
  document.body.append(aviso);
  document.body.classList.add("con-aviso-cookies");
}

if (leerEleccion() === "aceptadas") cargarAnalytics();
else if (!leerEleccion()) mostrarAvisoCookies();

document.querySelectorAll(".enlace-cookies").forEach((boton) => {
  boton.addEventListener("click", mostrarAvisoCookies);
});

// Evento: clics en cualquier enlace de WhatsApp (botón flotante, footer o texto)
document.addEventListener("click", (e) => {
  const enlace = e.target.closest('a[href*="wa.me"]');
  if (!enlace) return;
  const ubicacion = enlace.classList.contains("whatsapp") ? "boton_flotante"
    : enlace.closest(".footer") ? "footer" : "texto";
  registrarEvento("clic_whatsapp", { ubicacion, pagina: location.pathname });
});


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

      // Evento clave en Analytics: un contacto generado por la web
      registrarEvento("formulario_enviado", {
        tipo_trabajo: formulario.tipo.value,
        pagina: location.pathname,
      });

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
