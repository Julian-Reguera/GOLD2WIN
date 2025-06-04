"use strict"

/**
 * WebSocket API, which only works once initialized
 */
const ws = {

    /**
     * Number of retries if connection fails
     */
    retries: 3,

    /**
     * Default action when message is received. 
     */
    receive: (data) => {
        console.log(data);

        switch (data.tipoEvento) {
            case "actualizarDinero":
                let componentesDidponible = document.getElementsByClassName("dineroDisponible");
                let componentesRetenido = document.getElementsByClassName("dineroRetenido");
                let disponible = data.dineroDisponible;
                let retenido = data.dineroRetenido;

                for (let i = 0; i < componentesDidponible.length; i++) {
                    componentesDidponible[i].innerHTML = parseInt(disponible/100) +","+disponible%100  + " €";
                }
                for (let i = 0; i < componentesRetenido.length; i++) {
                    componentesRetenido[i].innerHTML =  parseInt(retenido/100) + "," + retenido%100  + " €";
                }

                go(config.rootUrl + "/cartera/ingresarDinero", "POST", {entera: 0, decimal: 0}); //actualiza el saldo del modelo

                break;
            case "baneoRecibido":
                go(config.rootUrl + "/logout", "POST",{}).then(function(response) {
                    location.reload(true);});

                break;
            case "newUser":
                anadirFilaUsuario(data.user);
                break;
            case "newReporte":
                anadirFilaReporte(data.reporte);
                break;
            case "eventoCreado":
                anadirFilaEvento(data.evento);
                break;
        }
    },

    headers: { 'X-CSRF-TOKEN': config.csrf.value },

    /**
     * Attempts to establish communication with the specified
     * web-socket endpoint. If successfull, will call 
     */
    initialize: (endpoint, subs = []) => {
        try {
            ws.stompClient = Stomp.client(endpoint);
            ws.stompClient.reconnect_delay = 2000;
            // only works on modified stomp.js, not on original from mantainer's site
            ws.stompClient.reconnect_callback = () => ws.retries-- > 0;
            ws.stompClient.connect(ws.headers, () => {
                ws.connected = true;
                console.log('Connected to ', endpoint, ' - subscribing:');
                while (subs.length != 0) {
                    let sub = subs.pop();
                    console.log(` ... to ${sub} ...`)
                    ws.subscribe(sub);
                }
            });
            console.log("Connected to WS '" + endpoint + "'")
        } catch (e) {
            console.log("Error, connection to WS '" + endpoint + "' FAILED: ", e);
        }
    },

    /*modificacion para poder poner una funcion callback personalizada pero el comportamiento original siga funcionando*/
    subscribe: (sub,comportamiento) => {
        try {
            if(!comportamiento){
                ws.stompClient.subscribe(sub,
                    (m) => ws.receive(JSON.parse(m.body))); // fails if non-json received!
                console.log("Hopefully subscribed to " + sub);
            }
            else{
                ws.stompClient.subscribe(sub,
                    (m) => comportamiento(JSON.parse(m.body))); // fails if non-json received!
                console.log("Hopefully subscribed to " + sub);
            }
            
        } catch (e) {
            console.log("Error, could not subscribe to " + sub, e);
        }
    }
}

/**
 * Sends an "ajax" request using Fetch. Sends JSON and expects JSON back.
 * 
 * @param {string} url 
 * @param {string} method (GET|POST)
 * @param {*} data, typically a JSON-izable object, like a Message
 * @param {*} headers, to be used instead of defaults, if specified. To send NO headers,
 *  use {}. To send defaults, specify no value, or use false
 * 
 * @return {Promise}, which you should chain with `.then()` to manage responses, 
 *             and with `.catch()` to manage possible errors. 
 *             Errors will be notified as
 *  {
 *     url: <that you were accessing>, 
 *     data: <data you sent>,
 *     status: <code, such as 403>, 
 *     text: <describing the error>
 *  }
 */
function go(url, method, data = {}, headers = false) {
    let params = {
        method: method, // POST, GET, POST, PUT, DELETE, etc.
        headers: headers === false ? {
            "Content-Type": "application/json; charset=utf-8",
        } : headers,
        body: data instanceof FormData ? data : JSON.stringify(data)
    };
    if (method === "GET") {
        // GET requests cannot have body; I could URL-encode, but it would not be used here
        delete params.body;
    } else {
        params.headers["X-CSRF-TOKEN"] = config.csrf.value;
    }
    console.log("sending", url, params)
    return fetch(url, params)
        .then(response => {
            const r = response;
            if (r.ok) {
                return r.json().then(json => Promise.resolve(json));
            } else {
                return r.text().then(text => Promise.reject({
                    url,
                    data: JSON.stringify(data),
                    status: r.status,
                    text
                }));
            }
        });
}

function goTexto(url, method, data = {}, headers = false) {
    let params = {
        method: method, // POST, GET, POST, PUT, DELETE, etc.
        headers: headers === false ? {
            "Content-Type": "application/json; charset=utf-8",
        } : headers,
        body: data instanceof FormData ? data : JSON.stringify(data)
    };
    if (method === "GET") {
        // GET requests cannot have body; I could URL-encode, but it would not be used here
        delete params.body;
    } else {
        params.headers["X-CSRF-TOKEN"] = config.csrf.value;
    }
    console.log("sending", url, params)
    return fetch(url, params)
        .then(response => {
            const r = response;
            if (r.ok) {
                return r.text().then(json => Promise.resolve(json));
            } else {
                return r.text().then(text => Promise.reject({
                    url,
                    data: JSON.stringify(data),
                    status: r.status,
                    text
                }));
            }
        });
}

/**
 * Fills an image element with the image retrieved from a URL.
 * 
 * while `targetImg.src = url` would also display the image, this code
 * has the advantage of using a data:url instead of a link; so that you can later
 * upload the image somewhere else using postImage
 * 
 * @return {Promise}, which you should chain with `.then()` to manage responses, 
 *             and with `.catch()` to manage possible errors. 
 * 
 * @param url of an image
 * @param targetImg element to populate with its data
 */
function readImageUrlData(url, targetImg) {
    return fetch(url)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        }))
        .then(data => targetImg.src = data);
}

/**
 * Fills an image element with the image retrieved from a file input.
 * 
 * Uses a data:url, also allowing the use of postImage. This is handy for
 * previews
 * 
 * @param file to use; for example, fileInput.files[0] would be the 1st one
 * @param targetImg element to populate with its data
 */
function readImageFileData(file, targetImg) {

    // see https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
    if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
        let reader = new FileReader();
        reader.addEventListener("load", e => {
            console.log(e);
            targetImg.src = reader.result
        }, false);

        reader.readAsDataURL(file);
    } else {
        console.log("Not a good format: ", file.name);
    }
}

/**
 * Sends contents of a displayed image as a POST request to a server
 * 
 * @param img element to get the data from (MUST be using a data:url)
 * @param endpoint url to send the data to
 * @param name of field that will contain the image data (as expected by server)
 * @param filename to use 
 * 
 * @return {Promise}, which you should chain with `.then()` to manage responses, 
 *        and with `.catch()` to manage possible errors. 
 */
function postImage(img, endpoint, name, filename) {
    // from https://stackoverflow.com/a/30470303/15472
    function toBlob(dataurl) {
        let arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {
            type: mime
        });
    }
    let imageBlob = toBlob(img.src);
    let fd = new FormData();
    fd.append(name, imageBlob, filename);
    return go(endpoint, "POST", fd, {})
}

/**
 * Actions to perform once the page is fully loaded
 */
document.addEventListener("DOMContentLoaded", () => {
    if (config.socketUrl) {
        let subs = config.admin ? ["/topic/admin", "/user/queue/updates"] : ["/user/queue/updates"]
        if (config.topics && config.topics.length > 0) {
            subs = subs.concat(config.topics.split(",").map(t => `/topic/${t}`));
        }
        ws.initialize(config.socketUrl, subs);

        let p = document.querySelector("#nav-unread");
        if (p) {
            go(`${config.rootUrl}/user/unread`, "GET").then(d => p.textContent = d.unread);
        }
    } else {
        console.log("Not opening websocket: missing config", config)
    }

    // add your after-page-loaded JS code here; or even better, call 
    // 	 document.addEventListener("DOMContentLoaded", () => { /* your-code-here */ });
    //   (assuming you do not care about order-of-execution, all such handlers will be called correctly)
});

/*FUNCIONES PARA LOS WEB-SOCKETS DE ADMINISTRACION*/
function anadirFilaUsuario(usuario){
    const tableUsers = window.tableUsers;
    let fila = [];

    if(!tableUsers)
        return;

    fila.push(usuario.id);
    fila.push(usuario.username);
    fila.push(usuario.email);
    fila.push(usuario.saldo);
    fila.push(usuario.rol);
    fila.push(usuario.expulsadoHasta ? usuario.expulsadoHasta : "No ha sido expulsado");

    let opciones = `<div class="dropdown">
                            <button class="btn btn-sm" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                                </svg>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                                <li><a class="dropdown-item" href="#" href="${config.rootUrl}/user/${usuario.id}">Ver Más</a></li>`

    if (usuario.rol && usuario.rol.split(',').includes('ADMIN')) {
        opciones += `<li>
                        <a class="dropdown-item" href="#" role="button" onclick="ascenderUsuario(${usuario.id})">
                            ascender    
                        </a>
                    </li>`;
    }

    opciones += `<li>
                    <a class="dropdown-item abridorModalExpulsion" href="#" role="button" data-id="${usuario.id}" data-nombre="${usuario.username}" data-fecha="${usuario.expulsadoHasta}">
                        Expulsar
                    </a>
                </li>
            </ul>
        </div>`

    fila.push(opciones);

    console.log(tableUsers);
    tableUsers.rows.add(fila);
}

function anadirFilaReporte(reporte){
    const tableReports = window.tableReports;

    if(!tableReports)
        return;

    let fila = [];

    fila.push(reporte.id);
    fila.push(reporte.usuarioReportado);
    fila.push(reporte.fechaReporte);
    fila.push(reporte.resuelto);
    fila.push(reporte.fechaResolucion);
    fila.push(reporte.mensaje);

    let opciones = `<div class="dropdown">
                        <button class="btn btn-sm" type="button" id="dropdownMenuButton"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                                <path
                                    d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
                            </svg>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                            <li><button class="dropdown-item ver-detalles-btn" type="button"
                                    onclick="abrirModalVerMasReporte(${reporte.id})"> Ver
                                    Detalles </button>
                            </li>`;

    if(!reporte.resuelto)
        opciones += `<li><button class="dropdown-item" type="button" onclick="abrirModal(${reporte.id})">Resolver</button></li>`;

    opciones += `</ul>
                </div>`;

    fila.push(opciones);
    tableReports.rows.add(fila);
}

function anadirFilaEvento(evento){
    const tablaEvento = window.tablaEvento;

    if(!tablaEvento)
        return;

    let fila = [];

    fila.push(evento.id);
    fila.push(evento.nombre);
    fila.push(evento.fechaCierre);
    fila.push(evento.estado);
    fila.push(evento.seccion);

    let opcinoes = `<div class="dropdown">
                        <button class="btn btn-sm" type="button" th:id="'dropdownMenuButton-' + ${evento.id}" data-bs-toggle="dropdown" aria-expanded="false">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                                <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                            </svg>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                            <li><button class="dropdown-item boton-editar" onclick="modalModoEdicion(${evento.id})" type="button" data-bs-toggle="modal" data-bs-target="#modalCrearEvento">Editar</button></li>
                            <li><button class="dropdown-item boton-editar" onclick="modalModoVerMas(${evento.id})" type="button" data-bs-toggle="modal" data-bs-target="#modalCrearEvento">Ver detalles</button></li>
                            <li><a class="dropdown-item ${evento.estado != "Pendiente" ? "disabled":""}" id="botonDropdownDeterminarEvento-${evento.id}" href="${config.rootUrl}/admin/eventos/determinar/${evento.id}">Determinar</a></li>
                            <li><button class="dropdown-item text-danger  ${evento.estado != "Pendiente" ? "disabled":""}" type="button" data-bs-toggle="modal" data-bs-target="#cancelarEventoModal-${evento.id}">Cancelar</button></li>
                        </ul>
                    </div>`;
    fila.push(opcinoes);

    tablaEvento.rows.add(fila);
}