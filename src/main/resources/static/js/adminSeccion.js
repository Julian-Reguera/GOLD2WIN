var inputImagenSeccionesForm = document.getElementById("inputImagenSecciones");
if (inputImagenSeccionesForm != null) {
    document.getElementById('inputImagenSecciones').addEventListener('change', function (event) {
        var file = event.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var imgPreview = document.getElementById('mostrarImagenSeccionesForm');
                imgPreview.src = e.target.result; // Mostrar la imagen
                imgPreview.style.display = "block"; // Hacer visible la vista previa
            }
            reader.readAsDataURL(file);
        }
    });
}

var menuOpcionesSeccionForm = document.getElementById("menuOpcionesSeccion");
let seccionSeleccionadaId = null;
if (menuOpcionesSeccionForm != null) {
    const contextMenu = document.getElementById("menuOpcionesSeccion");
    const contextAreas = document.querySelectorAll(".enlaceSeccionAdmin");

    contextAreas.forEach((contextArea) => {
        contextArea.addEventListener("contextmenu", function (event) {
            event.preventDefault();

            seccionSeleccionadaId = this.getAttribute("data-id");
            console.log("Sección seleccionada:", seccionSeleccionadaId);

            contextMenu.style.display = "block";
            contextMenu.style.left = `${event.pageX}px`;  // Establece la posición en el eje X
            contextMenu.style.top = `${event.pageY}px`;   // Establece la posición en el eje Y
        });
    });

    // Ocultar el menú al hacer clic en cualquier otra parte
    document.addEventListener("click", function () {
        contextMenu.style.display = "none";
    });
}

function agregarDiv(event, seccionId) {
    event.preventDefault();

    let form = document.getElementById("variableSeccionForm");
    if (!form.checkValidity()) { //esto sirve para los mensajes de required cuando arriba esta rel preventDefault
        form.reportValidity();
        return;
    }

    const contenedor = document.getElementById("contenedorVariables");
    var nombre = document.getElementById('inputnombreVarNueva').value.trim();
    var select = document.getElementById('selectTipoVarNueva');
    var opcionSeleccionada = select.options[select.selectedIndex].text;

    var isNombreVal = true;
    if (isNombreVal) isNombreVal = evitarNombresVarRepetidos(); //verifica si el nombre ya existe en la seccion actual 
    if (isNombreVal && opcionSeleccionada != "Seleccione una" && nombre != "") {
        const nuevoDiv = document.createElement("div");
        nuevoDiv.className = "col-3 variableSeccion"; // Se organizan en 3 columnas por fila
        nuevoDiv.innerHTML = `
            <div class = "d-flex flex-column">
                <div id = "divEtiquetasVariables">
                    <span>Nombre:</span>
                    <span class = "nombreVariableSpan"> ${nombre}</span>
                </div>
                <div id = "divEtiquetasVariables">
                    <span>Tipo:</span>
                    <span class = "tipoVariableSpan">${opcionSeleccionada}</span>
                </div>
            </div>
            <button class="position-absolute end-0 top-0 botonBasuraVariable">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                </svg>
            </button>
        `;
        contenedor.appendChild(nuevoDiv); // Agrega el div al contenedor
        document.getElementById('selectTipoVarNueva').selectedIndex = 0;
        document.getElementById('inputnombreVarNueva').value = '';

        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCrearVariables'));
        modal.hide();
        actualizarClasePocos();
    }
};

function eliminarSeccion() {
    //event.preventDefault();
    go(`/admin/eliminarSeccion/${seccionSeleccionadaId}`, "DELETE")
        .then(data => {
            console.log("Sección eliminada:", data.mensaje);
            window.location.href = "/admin/secciones";
        })
        .catch(error => console.error("Error al eliminar la sección:", error));
}

function redireccionarEditarSeccion() {
    window.location.href = `/admin/secciones/${seccionSeleccionadaId}/editar`;
}

async function guardarSeccion(event) {
    event.preventDefault();

    let formulario = document.getElementById("formularioSeccion");
    if (!formulario.checkValidity()) { //esto sirve para los mensajes de required cuando arriba esta rel preventDefault
        formulario.reportValidity();
        return;
    }

    const isNombreValido = await verificarNombreSeccion();
    if (isNombreValido) {
        const nombre = document.getElementById("inputNombreSeccion").value.trim(); //el trim elimina espacios en blanco innecesarios
        const tipo = document.getElementById("inputTipoSeccion").value.trim();
        const file = document.getElementById("inputImagenSecciones").files[0] || null;

        const nombreS = nombre.charAt(0).toUpperCase() + nombre.slice(1);
        const tipoS = tipo.charAt(0).toUpperCase() + tipo.slice(1);

        let base64Image = await toBase64(file);

        if (nombreS != "" && tipoS != "" && file != null) {
            const divs = document.querySelectorAll("#contenedorVariables .variableSeccion");
            const variables = [];

            divs.forEach(div => {
                const nombreV = div.querySelector(".nombreVariableSpan").innerText;
                const tipoV = div.querySelector(".tipoVariableSpan").innerText;
                variables.push({ nombreV, tipoV });
            });

            const jsonData = {
                seccionN: { nombre: nombreS, tipo: tipoS },
                imageData: { // Aquí se incluye la imagen
                    image: base64Image,
                    filename: file.name
                },
                arrayVariables: variables
            };

            go(`/admin/guardarSeccion`, "POST", jsonData)
                .then(data => {
                    console.log("Respuesta recibida:", data.mensaje);
                    window.location.href = "/admin/secciones";
                })
                .catch(error => console.error("Error go:", error));
        }
    }
    else {
        event.preventDefault();
    }
}

async function verificarNombreSeccion() {
    const nombreS = document.getElementById("inputNombreSeccion").value.trim();
    try {
        const response = await fetch(`/admin/verificarSeccion?nombre=${encodeURIComponent(nombreS)}`);
        const data = await response.json();

        if (data.existe) {  //el nombre existe
            document.getElementById("inputNombreSeccion").classList.add("is-invalid");
            document.getElementById("mensajeError").classList.add("invalid-feedback");
            document.getElementById("mensajeError").style.display = 'block';
            return false;
        } else {    //el nombre no existe
            document.getElementById("inputNombreSeccion").classList.remove("is-invalid");
            document.getElementById("mensajeError").classList.remove("invalid-feedback");
            document.getElementById("mensajeError").style.display = 'none';
            return true;
        }
    } catch (error) {
        console.error("Error al verificar el nombre:", error);
        return false;
    }
}

function evitarNombresVarRepetidos() { //esta funcion sirve para verificarnombres de variables repetidos en la misma seccion
    const nombreV = document.getElementById("inputnombreVarNueva").value.trim();
    try {
        const divs = document.querySelectorAll("#contenedorVariables .variableSeccion");

        let existe = false;
        divs.forEach(div => {

            const nombreVarExistente = div.querySelector(".nombreVariableSpan").innerText;
            console.log("nombreVarExistente: " + nombreVarExistente);
            if (nombreVarExistente == nombreV) {
                existe = true;
            }

        });

        if (existe) { //el nombre existe
            document.getElementById("inputnombreVarNueva").classList.add("is-invalid");
            document.getElementById("mensajeErrorVar").classList.add("invalid-feedback");
            document.getElementById("mensajeErrorVar").style.display = 'block';
            return false;
        } else {    //el nombre no existe
            document.getElementById("inputnombreVarNueva").classList.remove("is-invalid");
            document.getElementById("mensajeErrorVar").classList.remove("invalid-feedback");
            document.getElementById("mensajeErrorVar").style.display = 'none';
            return true;
        }
    } catch (error) {
        console.error("Error al verificar el nombre:", error);
        return false;
    }
}

async function editarSeccion() {
    event.preventDefault();     //solo sirve para q los test redireccionen bien 
    let formularioEditar = document.getElementById("formularioSeccion");

    if (!formularioEditar.checkValidity()) { //esto sirve para los mensajes de required cuando arriba esta rel preventDefault
        formularioEditar.reportValidity();
        return;
    }
    const nombreS = document.getElementById("inputNombreSeccion").value.trim(); //el trim elimina espacios en blanco innecesarios
    const tipo = document.getElementById("inputTipoSeccion").value.trim();
    const file = document.getElementById("inputImagenSecciones").files[0] || null;

    const tipoS = tipo.charAt(0).toUpperCase() + tipo.slice(1);

    let base64Image = null;
    let fileName = null;
    if (file != null) { base64Image = await toBase64(file); fileName = file.name; }

    if (nombreS != "" && tipoS != "") {
        const divs = document.querySelectorAll("#contenedorVariables .variableSeccion");
        const variables = [];

        divs.forEach(div => {

            const nombreV = div.querySelector(".nombreVariableSpan").innerText;
            const tipoV = div.querySelector(".tipoVariableSpan").innerText;
            variables.push({ nombreV, tipoV });

        });

        const jsonData = {
            seccionN: { nombre: nombreS, tipo: tipoS },
            imageData: { // Aquí se incluye la imagen
                image: base64Image,
                filename: fileName
            },
            arrayVariables: variables
        };

        go(`/admin/editarSeccion`, "POST", jsonData)
            .then(data => {
                console.log("Respuesta recibida:", data.mensaje);
                window.location.href = "/admin/secciones";
            })
            .catch(error => console.error("Error go:", error));
    }
}

var variableSeccionesForm = document.getElementById("variableSeccionForm");
if (variableSeccionesForm != null) {
    document.getElementById("variableSeccionForm").addEventListener("submit", function (event) {
        event.preventDefault();
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (event) {
        if (event.target.closest('.botonBasuraVariable')) {
            event.preventDefault();
            const boton = event.target.closest('.botonBasuraVariable');
            const div = boton.closest('.variableSeccion');

            if (div) {
                div.remove();
            }
        }
    });
});

function actualizarClasePocos() {
    const contenedor = document.getElementById('contenedorVariables'); // ← Usás el ID directamente
    const divs = contenedor.querySelectorAll(':scope > div');

    if (divs.length <= 2) {
        contenedor.classList.add('limitar');
    } else {
        contenedor.classList.remove('limitar');
    }
}