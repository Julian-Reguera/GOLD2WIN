const botonVerMas = document.getElementById("verMasEventos");
const botonVerTodos = document.getElementById("todas");
const botonVerPendientes = document.getElementById("pendientes");
const botonVerDeterminados = document.getElementById("determinadas");

const contenedor = document.getElementById("contenedorPrincipal");
var fechaInicio = new Date().toISOString();
var offset = 0;
var cargando = false;
var apartado = "";

cambiarApartado("todas")

botonVerMas.addEventListener("click", function(){
    cargarMasApuestas();
});

botonVerTodos.addEventListener("click", function(){
    cambiarApartado("todas");
});

botonVerPendientes.addEventListener("click", function(){
    cambiarApartado("pendientes");
});

botonVerDeterminados.addEventListener("click", function(){
    cambiarApartado("determinadas");
});

function cambiarApartado(nuevoApartado){
    if(cargando == false){
        cargando = true;

        botonVerTodos.parentElement.classList.remove("active");
        botonVerPendientes.parentElement.classList.remove("active");
        botonVerDeterminados.parentElement.classList.remove("active");
        document.getElementById(nuevoApartado).parentElement.classList.add("active");

        apartado = nuevoApartado;
        offset = 0;
        eliminarApuestas();
        botonVerMas.style.display = "none";
        cargando = false;
        cargarMasApuestas();
    }
}

async function cargarMasApuestas(){
    if(!cargando){
        cargando = true;
        go(config.rootUrl + '/misApuestas/cargarMas' + '?apartado=' + apartado + '&fechaInicio=' + fechaInicio+ '&offset=' + offset, 'GET').then((data) => {
            let apuestas = data.apuestas;
            console.log(data);

            for(let apuesta of apuestas){
                introducirApuesta(apuesta);
            }

            if(data.hayMasApuestas){
                botonVerMas.style.display = "block";
            }
            else{
                botonVerMas.style.display = "none";
            }

            offset += apuestas.length;
            actualizarTiempoRestante1();
            cargando = false;
        }).catch((error) => {
            console.log(error);
            botonVerMas.style.display = "block";
            cargando = false;
        });
    }
}

function pad(valor) {
    return valor < 10 ? '0' + valor : valor;
}

function formatearFecha(fecha) {
    const anio = fecha.getFullYear();
    const mes = pad(fecha.getMonth() + 1); // ¡Mes empieza en 0!
    const dia = pad(fecha.getDate());
    const hora = pad(fecha.getHours());
    const minuto = pad(fecha.getMinutes());
    const segundo = pad(fecha.getSeconds());
  
    return `${anio}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
}

function eliminarApuestas(){
    const elementos = contenedor.querySelectorAll("._contenedor-apuesta");
    elementos.forEach(el => el.remove());
}

function introducirApuesta(apuesta){
    const fechaCierre = new Date(apuesta.fechaCierre);
    let tipoApuesta = apuesta.afavor ? "a favor" : "en contra";
    let cuotaUtilizada = apuesta.afavor ? apuesta.cuotaFaborable : apuesta.cuotaDesfavorable;
    let diferenciaDinero = 0;
    let cantidadQueGanaria = cuotaUtilizada * apuesta.cantidad;
    cantidadQueGanaria = Math.trunc(cantidadQueGanaria);
   
    if(apuesta.estado == "Perdida")
        diferenciaDinero = apuesta.cantidad ;
    else if(apuesta.estado == "Ganada"){
        diferenciaDinero = Math.trunc(apuesta.cantidad * cuotaUtilizada);
    }

    let ganancias;

    if(apuesta.estado == "Perdida")
        ganancias = 0;
    else if(apuesta.estado == "Ganada")
        ganancias = diferenciaDinero;
    else if(apuesta.estado == "Pendiente")
        ganancias = 0;
    else
        ganancias = apuesta.cantidad;

    let html = `<div class="bettingBox mx-auto p-1 w-100 shadow-lg rounded"
                    data-formula="${apuesta.nombreFormula}" 
                    data-cantidad="${apuesta.cantidad}" 
                    data-a-favor="${apuesta.afavor}">
                    <div class="headRowBettingBox d-flex align-items-center justify-content-between p-2"  id="bettingBox-${apuesta.id}"
                        type="button" data-bs-toggle="collapse" 
                        data-bs-target="#miDesplegable${apuesta.id}" 
                        aria-expanded="false" 
                        aria-controls="miDesplegable${apuesta.id}">
                        
                        <div class="left d-flex align-items-center">
                            <div class="headRowBettingBoxLeftElement fw-bold me-2">
                            ${Math.trunc(apuesta.cantidad / 100)},${apuesta.cantidad % 100}€ (${Math.trunc(cantidadQueGanaria / 100)},${cantidadQueGanaria % 100}€)
                            </div>
                            <div class="fw-semibold text-uppercase" >
                                (#<span>${apuesta.id}</span>)
                            </div>
                            <div class="fw-semibold text-uppercase">${apuesta.formula}</div>
                            
                            <div class=""> 
                                Apostaste 
                                <span >${tipoApuesta}</span>
                            </div>
                        </div>
                        
                        <div class="right d-flex align-items-center">
                            <span class="small me-1">
                                ${fechaCierre > new Date() ? "Hace" : "Quedan"} <span class="tiempo-restante-apuesta" 
                                        data-fecha-evento-apuesta="${formatearFecha(fechaCierre)}">
                                    </span>
                            </span>

                            <div class="headRowBettingBoxRightElement me-1 small">
                                ${apuesta.estado == "Perdida" ? "<div class='text-danger'>Perdida</div>" : ""}
                                ${apuesta.estado == "Ganada" ? "<div class='text-success'>Ganada</div>" : ""}
                                ${apuesta.estado == "Pendiente" ? "<div class='text-warning'>Indeterminada</div>" : ""}
                            </div>
                            
                            <button class="btn btn-sm btn-custom" type="button" data-bs-toggle="collapse" 
                                data-bs-target="#miDesplegable${apuesta.id}" 
                                aria-expanded="false" 
                                aria-controls="miDesplegable${apuesta.id}" id="mensajeDesplegable">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down" viewBox="0 0 16 16">
                                    <path d="M3.204 5h9.592L8 10.481zm-.753.659 4.796 5.48a1 1 0 0 0 1.506 0l4.796-5.48c.566-.647.106-1.659-.753-1.659H3.204a1 1 0 0 0-.753 1.659"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="collapse mt-2" id="miDesplegable${apuesta.id}">
                        <div class="infoRowBettingBox p-3">
                            <p class="mb-2">
                                <span>
                                CUOTA >> ${cuotaUtilizada.toFixed(2)}
                                </span>
                            </p>
                            <p class="mb-1 fw-bold">${apuesta.nombreSeccion} - ${apuesta.nombreEvento}</p>
                            <p class="small text-muted">${apuesta.nombreFormula}</p>
                        </div>

                        <div class="footerRowBettingBox mt-2 p-2 d-flex align-items-center justify-content-between">
                            <div class="left text-center">
                                <p class="mb-1">Importe: ${Math.trunc(apuesta.cantidad / 100)},${apuesta.cantidad % 100}€</p>
                            </div>

                            <div class="mid text-center">
                                ${apuesta.estado == "Ganada" ? `<p class="mb-1">Ganancias:<span>${Math.trunc(diferenciaDinero / 100)},${diferenciaDinero % 100}€</span></p>`:""}
                                ${apuesta.estado == "Perdida" ? `<p class="mb-1">Perdidas:<span>${Math.trunc(diferenciaDinero / 100)},${diferenciaDinero % 100}€</span></p>`:""}
                            </div>

                            <div class="right text-center">
                                <p class="mb-1">Ganado: ${Math.trunc(ganancias / 100)},${ganancias % 100}€</p>
                            </div>
                        </div>
                    </div>
                </div>`;

    let divApuesta = document.createElement("div");
    divApuesta.className = "_contenedor-apuesta";
    divApuesta.innerHTML = html;

    contenedor.insertBefore(divApuesta, botonVerMas);
}

/*FUNCIONES PARA ACTUALIZAR EL TIEMPO QUE QUEDA PARA QUE CONCLUYA UNA APUESTA*/
function actualizarTiempoRestanteApuesta() {
    const elementosTiempoRestante = document.querySelectorAll(".tiempo-restante-apuesta");
    elementosTiempoRestante.forEach((elemento) => {
        const fechaEventoStr = elemento.getAttribute("data-fecha-evento-apuesta");  
        if (!fechaEventoStr) return;

        // Convertir la cadena a una fecha en JavaScript
        const fechaEvento = new Date(fechaEventoStr.replace(" ", "T")); // Reemplaza el espacio con 'T' para compatibilidad

        // Obtener la fecha actual
        const ahora = new Date();

        // Calcular la diferencia en milisegundos
        const diferencia = fechaEvento - ahora;

        if (diferencia <= 0) {
            /*elemento.textContent = "Evento iniciado";
            return;*/
            // Convertir la diferencia en días, horas y minutos
            const dias = -Math.floor(diferencia / (1000 * 60 * 60 * 24));
            const horas = -Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutos = -Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
            // Mostrar la salida en el formato adecuado
            if (dias > 0) {
                elemento.textContent = `${dias} días`;
            } else {
                elemento.textContent = `${horas}h ${minutos}m`;
            }
        }

        else{
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
        }
        
        
    });
}

var tiempoRestanteAux = document.querySelectorAll(".tiempo-restante-apuesta");
if(tiempoRestanteAux.length != 0){
    actualizarTiempoRestanteApuesta();
    setInterval(actualizarTiempoRestante1, 60000); // Actualizar cada minuto
}