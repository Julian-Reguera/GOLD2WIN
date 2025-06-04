async function cambiarDatosPerfil(event){
    event.preventDefault();

    const id = document.getElementById("inputIdUser").value.trim();
    const username = document.getElementById("inputUsername").value.trim();
    const email = document.getElementById("inputEmail").value.trim();

    const isUsernameValido = await verificarUsername();
    const isEmailValido = await verificarEmail();
    if(isUsernameValido && isEmailValido){
        if(document.getElementById("password").dataset.bd == "false"){
            const jsonData = {
                username: username,
                email: email,
            };
            go(config.rootUrl + '/user/' + id, "POST", jsonData)
            .then(data => {
                console.log("Respuesta recibida:", data.mensaje);
                window.location.href = config.rootUrl + '/user/' + id;
            })
            .catch(error => console.error("Error go:", error));
        }
        else{
            const jsonData = {
                username: username,
                email: email,
            };
            go(config.rootUrl + '/user/' + id, "POST", jsonData)
            .then(data => {
                console.log("Respuesta recibida:", data.mensaje);
                const id = document.getElementById("inputIdUser").value.trim();
                window.location.href = config.rootUrl + '/user/' + id;
            })
            .catch(error => console.error("Error go:", error));
        }
    }
}

async function verificarUsername() {
    const username = document.getElementById("inputUsername").value.trim();
    const id = document.getElementById("inputIdUser").value.trim();
    try {
        const response = await fetch(`/user/verificarUsername?username=${encodeURIComponent(username)}&id=${encodeURIComponent(id)}`);
        const data = await response.json();

        if (data.existe) {  
            document.getElementById("inputUsername").classList.add("is-invalid");
            document.getElementById("mensajeErrorUsername").classList.add("invalid-feedback");
            document.getElementById("mensajeErrorUsername").style.display = 'block';
            console.log("false");
            return false;
        } else {    
            document.getElementById("inputUsername").classList.remove("is-invalid");
            document.getElementById("mensajeErrorUsername").classList.remove("invalid-feedback");
            document.getElementById("mensajeErrorUsername").style.display = 'none';
            console.log("true");
            return true;
        }
    } catch (error) {
        console.error("Error al verificar el nombre:", error);
        return false;
    }
}

async function verificarEmail() {
    const email = document.getElementById("inputEmail").value.trim();
    const id = document.getElementById("inputIdUser").value.trim();
    try {
        const response = await fetch(`/user/verificarEmail?email=${encodeURIComponent(email)}&id=${encodeURIComponent(id)}`);
        const data = await response.json();

        if (data.existe) {  
            document.getElementById("inputEmail").classList.add("is-invalid");
            document.getElementById("mensajeErrorEmail").classList.add("invalid-feedback");
            document.getElementById("mensajeErrorEmail").style.display = 'block';
            console.log("false");
            return false;
        } else {    
            document.getElementById("inputEmail").classList.remove("is-invalid");
            document.getElementById("mensajeErrorEmail").classList.remove("invalid-feedback");
            document.getElementById("mensajeErrorEmail").style.display = 'none';
            console.log("true");
            return true;
        }
    } catch (error) {
        console.error("Error al verificar el nombre:", error);
        return false;
    }
}


function cambiarContrasenha(event) {
    event.preventDefault();
    const id = document.getElementById("inputIdUser").value.trim();

    let form = document.getElementById("cambiarContrasenhaForm");
    if (!form.checkValidity()) { //esto sirve para los mensajes de required cuando arriba esta rel preventDefault
        form.reportValidity();
        return;
    }

    var con = document.getElementById('inputContrasenha').value.trim();

    var sonIguales = confirmarContrasenhas();
    if (!sonIguales || con.length < 0) {
        return;
    }
    else{
        const inputCon = document.getElementById("password");
        inputCon.value = con;
        inputCon.dataset.bd = "false"
        var botonVis = document.getElementById("botonVisualizarCon");
        botonVis.style.display = "block";

        goTexto(config.rootUrl + '/user/' + id+'/password', "POST", {password: con})
            .then(data => {
                console.log("Respuesta recibida:", data.mensaje);
            })
            .catch(error => console.error("Error go:", error));

        document.getElementById('inputContrasenha').value = '';
        document.getElementById('inputContrasenha2').value = '';

        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCambiarContrasenha'));
        modal.hide();
    }
};

function confirmarContrasenhas() { 
    const con = document.getElementById("inputContrasenha").value.trim();
    const con2 = document.getElementById('inputContrasenha2').value.trim();
    try {

        let iguales = false;
        if (con == con2) {
            iguales = true;
        }

        if (!iguales) { 
            document.getElementById("inputContrasenha").classList.add("is-invalid");
            document.getElementById("mensajeErrorCon").classList.add("invalid-feedback");
            document.getElementById("mensajeErrorCon").style.display = 'block';
            return false;
        } else {  
            document.getElementById("inputContrasenha").classList.remove("is-invalid");
            document.getElementById("mensajeErrorCon").classList.remove("invalid-feedback");
            document.getElementById("mensajeErrorCon").style.display = 'none';
            return true;
        }
    } catch (error) {
        console.error("Error al comparar contraseñas:", error);
        return false;
    }
}

function hacerVisible(objetivo) {
    const passwordInput = document.getElementById(objetivo);
    console.log(objetivo);
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
}

var inputImagenUsuarioForm = document.getElementById("inputImagenUsuario");
if (inputImagenUsuarioForm != null) {
    document.getElementById('inputImagenUsuario').addEventListener('change', function (event) {
        var file = event.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var imgPreview = document.getElementById('mostrarImagenUsuario');
                imgPreview.src = e.target.result; // Mostrar la imagen
            }
            reader.readAsDataURL(file);

            mandarImagen();
        }
    });
}

async function mandarImagen() {
    const file = document.getElementById("inputImagenUsuario").files[0] || null;
    const id = document.getElementById("inputIdUser").value.trim();
    let base64Image = null;
    let fileName = null;
    if (file != null) { base64Image = await toBase64(file); fileName = file.name; }

    const jsonData = {
        imageData: { // Aquí se incluye la imagen
            image: base64Image,
            filename: fileName
        },
    };

    go(config.rootUrl + '/user/' + id + '/pic', "POST", jsonData)
        .then(data => {
            console.log("Respuesta recibida:", data.mensaje);
            const id = document.getElementById("inputIdUser").value.trim();
            window.location.href = "/user/"+id;
        })
        .catch(error => console.error("Error go:", error));
}