function verificarClaves(event) {
    event.preventDefault();//evitamos el submit
    clave1 = document.getElementById("pass1").value;
    clave2 = document.getElementById("pass2").value;
    console.log(clave1+clave2)

    if (clave1 != clave2) {
        document.getElementById("errorclaves").classList.add("mostrar");
        return false;
    }

    else {
        // Si las contraseñas coinciden ocultamos el mensaje de error
        document.getElementById("registro").submit();
    }
}