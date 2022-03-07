

//hago la peticion para obtener los repositorios del 
const tabla = document.getElementById("tablaRepos");

async function getRepositoriosUsuario() {
    var aux = await fetch(window.location.protocol + "/data?datos=repos")
    return await aux.json();

}

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
        fila.onclick = () =>{
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


//control de las busquedas y filtrados de los repositorios.












