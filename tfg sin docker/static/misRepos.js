


//hago la peticion para obtener los repositorios del 
const tabla = document.getElementById("tablaRepos");

async function getRepositoriosUsuario() {
    var aux = await fetch(window.location.protocol + "/data?datos=repos")
    return await aux.json();

}

async function getAsignaturasUsuario() {
    var aux = await fetch(window.location.protocol + "/data?datos=asignaturas")
    return await aux.json();

}

//recuperamos las asignaturas del usuario y las colocamos en el selector.

getAsignaturasUsuario().then(result => {
  
    //almacenamos los datos recuperados en la session del usuario.
    sessionStorage.setItem('asignaturas', JSON.stringify(result));
    selector = document.querySelector("#selectorAsignatura")
    contador =0;
    result.forEach(asignatura => {
        selector.innerHTML += "<option value="+contador+">"+asignatura.nombre+"</option>";
        contador++;
    });
})


//construccion de la tabla de repòsitorios.
getRepositoriosUsuario().then((repos) => {//recuperamos los repositorios 


    //inicializamos la tabla.
   var indice=0;
   for (let index = 0; index < 5; index++) {
       
       
  
    repos.forEach(repo => {
        indice++;
        var fila = tabla.insertRow(1);
        fila.insertCell(0).innerHTML = repo.repo;
        fila.insertCell(1).innerHTML = repo.owner;
        fila.insertCell(2).innerHTML = '<button  id="goGit" type="button" class="btn btn-success">Ir a Git</button>' +
            '<button id="copy" type="button" class="btn-copiar mx-3 btn btn-info"><i class="bi bi-clipboard"></i></button>';

        //añadimos el evento para llevarnos a la estadisticas de un repositorio al hacer click en alguna de las filas.
        fila.cells[0].onclick = () =>{
            window.location.href = window.location.protocol + "/home?repo="+repo.repo+"&owner="+repo.owner;
        }
        fila.cells[1].onclick = () =>{
            window.location.href = window.location.protocol + "/home?repo="+repo.repo+"&owner="+repo.owner;
        }
        //añadimos los eventos de click de los botones.

        document.getElementById("goGit").onclick = () => {
            window.location.href = repo.url;
        }

        document.getElementById("copy").onclick = () => {
            navigator.clipboard.writeText(repo.url);

        }
    
    });
}

});


//una vez el documento esta cargado añadimos el evento de seleccion de asignatura.
window.onload = () => {
    document.querySelector("#selectorAsignatura").addEventListener("change", (e) => {
        asignaturaSeleccionada = JSON.parse(sessionStorage.getItem("asignaturas"))[e.target.value]
        console.log(asignaturaSeleccionada)
        document.getElementById("buscador").value = asignaturaSeleccionada.cadenaCoindicencias;
        filtrarRepositorios(asignaturaSeleccionada.cadenaCoindicencias);
    })
}



//funcion para el filtrado de la tabla al buscar o seleccionar asignaturas.

function filtrarRepositorios(cadenaFiltrado){

for(var i=1; i<tabla.rows.length; i++){
    nombreRepositorio = tabla.rows[i].cells[0].textContent
     if(!nombreRepositorio.includes(cadenaFiltrado)) // las filas cuyo nombre no contienen la cadena, se ocultan.
    { 
        tabla.rows[i].style = "display:none;"
    }
    else{
        tabla.rows[i].removeAttribute("style")
    } 
}
}









