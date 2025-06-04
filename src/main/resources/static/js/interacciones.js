/*FUNCIONES PARA EL MODO OSCURO/CLARO */
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r
    }, null);
}

function applyThemeFromCookie() {
    let theme = getCookie('theme');

    // Si no hay cookie, se crea con valor "oscuro"
    if (!theme) {
        theme = 'oscuro';
        setCookie('theme', theme, 365);
    }

    const html = document.documentElement;

    if (theme === 'oscuro') {
        html.setAttribute('data-bs-theme', 'dark');
    } else {
        html.removeAttribute('data-bs-theme');
    }
}

document.querySelectorAll(".cambiadorTema").forEach(elemento => {
    elemento.addEventListener("click", function () {
        const html = document.documentElement;
        let theme = getCookie('theme');

        if (theme === 'oscuro' || theme === null) {
            theme = 'claro';
            html.removeAttribute('data-bs-theme');
            setCookie('theme', theme, 365);
        }
        else {
            theme = 'oscuro';
            html.setAttribute('data-bs-theme', 'dark');
            setCookie('theme', theme, 365); // dura 1 año
        }
    });
});

// Ejecutar al cargar la página
applyThemeFromCookie();

/* OTRAS FUNCIONES GLOBALES*/
function actualizarTiempoRestante() {
    const elementosTiempoRestante = document.querySelectorAll(".tiempo-restante");
    elementosTiempoRestante.forEach((elemento) => {
        const fechaEventoStr = elemento.getAttribute("data-fecha-evento");
        if (!fechaEventoStr) return;

        // Convertir la cadena a una fecha en JavaScript
        const fechaEvento = new Date(fechaEventoStr); // Reemplaza el espacio con 'T' para compatibilidad

        // Obtener la fecha actual
        const ahora = new Date();

        // Calcular la diferencia en milisegundos
        const diferencia = fechaEvento - ahora;

        if (diferencia <= 0) {
            elemento.textContent = "Evento iniciado";
            return;
        }

        // Convertir la diferencia en días, horas y minutos
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

        // Mostrar la salida en el formato adecuado
        if (dias > 0) {
            elemento.textContent = `${dias} días`;
        } else {
            elemento.textContent = `${horas}h ${minutos}m`;
        }
    });
}

var tiempoRestanteAux = document.querySelectorAll(".tiempo-restante");
if (tiempoRestanteAux.length != 0) {
    actualizarTiempoRestante();
    setInterval(actualizarTiempoRestante, 60000); // Actualizar cada minuto
}

var botonIzSecciones = document.getElementById("btnIzSecciones");
if (botonIzSecciones != null) {
    botonIzSecciones.addEventListener("click", function (event) {
        var contenedor = document.getElementById("menuSeccionesComprimido");
        contenedor.scrollLeft -= contenedor.clientWidth / 2;

    });
}

var botonDrsecciones = document.getElementById("btnDrSecciones");
if (botonDrsecciones != null) {
    botonDrsecciones.addEventListener("click", function (event) {
        var contenedor = document.getElementById("menuSeccionesComprimido");
        contenedor.scrollLeft += contenedor.clientWidth / 2;

    });
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}