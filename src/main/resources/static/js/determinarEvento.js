var enviando = false;
document.getElementById("btn_determinar").addEventListener("click", function () {
    if (enviando) return;

    enviando = true;
    contendorVariables = document.getElementById("contendorVariables");

    var valido = true;
    var inputs = contendorVariables.querySelectorAll("input");

    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].value == "") {
            valido = false;
            inputs[i].classList.add("is-invalid");
        }
        else {
            inputs[i].classList.remove("is-invalid")
        }
    }

    if (!valido) {
        enviando = false;
        return;
    }

    var data = {};
    Array.from(contendorVariables.children).forEach(function (child) {
        var input = child.querySelector("input");
        let select = child.querySelector("select");
        if (input) {
            if (input.type === "number")
                data[input.name] = parseFloat(parseFloat(input.value).toFixed(4));
            else
                data[input.name] = input.value;
        }
        if(select){
            data[select.name] = parseInt(select.value);
        }
    });

    go(window.location.href, 'POST', data)
        .then(result => {
            if (result.success) {
                console.log("hola");
                window.location.href = config.rootUrl + "/admin/eventos"; //redirijo
            } else {
                alert("Ocurrió un error en el servidor");
            }

            mandando = false;
        })
        .catch(error => {
            console.log(error);
            console.error("Error:", error);
            alert("Ocurrió un error en el servidor")
            mandando = false;
        });

    console.log(data);
});