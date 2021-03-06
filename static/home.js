
const barChart = document.getElementById('myChart').getContext("2d"); // node

const barChart2 = document.getElementById('areaChart').getContext("2d");

const colabsCommits = []; //objeto con numero de commits por colaborador.s
const colaComDat = [];//objeto con numero de commtis por fecha  y colaborador.
const colores = ['rgba(255, 87, 51,  0.6)',
    'rgba(199, 0, 57 , 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(93, 64, 55, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(255, 206, 86, 0.6)'];
const coloresBorde = ['rgba(255, 87, 51, 1)',
    'rgba(199, 0, 57 , 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(93, 64, 55, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(255, 206, 86, 1)']


const myChart = new Chart(barChart, {
    type: 'bar',
    data: {
        labels: ['Septiembre', 'Octubre', 'Noviembre', 'Diciembre', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto',],
        datasets: [],

    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
    }
});


const myChart2 = new Chart(barChart2, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Commits totales realizados',
            data: [],
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)'
            ],
            hoverOffset: 4
        }],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,

        scales: {
            y: {
                ticks: {
                    stepSize: 1,
                    beginAtZero: true,
                },
            },
        },

    }

});

//ojo con las rutas en caso de no estar en localhost, puede cambiar el funcionamiento
//https://stackoverflow.com/questions/1034621/get-the-current-url-with-javascript
async function getDatosRepo() {
    var params = new URLSearchParams(window.location.search)
    var repo = params.get("repo");
    var owner = params.get("owner");
    var aux = await fetch(window.location.protocol + "/data?datos=commits&repo="+repo+ "&owner=" + owner)
    return await aux.json();

}




//funcion para inicializar los graficos tras recibir los datos del servidor.
async function inicializarGraficos() {
    res = await getDatosRepo();
    modificarGrafico2(res);
    modificarGrafico1(res);
    accordeonCommits(res);
}

async function modificarGrafico2(entrada) {


    entrada.forEach(element => {
        autor = element.author;

        //comprobamos si el colaborador ya lo tenemos registrado.
        //en caso afirmativo aumentamos su valor del contador de commits.
        if (colabsCommits[autor] != undefined) {//si lo contiene sumo
            colabsCommits[autor]++;
        }
        else {//si no lo creo
            colabsCommits[autor] = 1;

        }
        //actualizo el grafico con los datos filtrados.

    });
    for (const key in colabsCommits) {

        myChart2.data.labels.push(key);
        myChart2.data.datasets[0].data.push(colabsCommits[key]);

    }
    myChart2.update();
}

async function modificarGrafico1(res) {
  

    res.forEach(element => {
        autor = element.author;
        date = (parseInt(element.date.substring(5, 7)) - 1 + 4) % 12;//tomamos unicamente el mes de la fecha.
        console.log(date);

        //comprobamos si el colaborador ya lo tenemos registrado.
        //en caso afirmativo aumentamos su valor del contador de commits.
        if (colaComDat[autor] != undefined) {//si contiene al autor sumo
            if (colaComDat[autor][date] != undefined) {
                //comprobamos tambien la fecha del commit.
                colaComDat[autor][date]++;
            }
            else {
                colaComDat[autor][date] = 1;
            }
        }
        else {//si no lo creo

            colaComDat[autor] = new Array();
            colaComDat[autor][date] = 1;

        }
    });

    console.log(colaComDat)

    //Para cada colaborador inicializamos el grafico con los datos de 
    //numero de commits por cada mes.
    contColor = 0;
    for (var keyAutor in colaComDat) {
        console.log(keyAutor);
        

        myChart.data.datasets.push({
            label: "Commits" + keyAutor,
            data: colaComDat[keyAutor],
            backgroundColor: [
                colores[contColor],
            ],
            borderColor: [
                coloresBorde[contColor],
            ],
            borderWidth: 1
        });
        contColor++ % 6;
    }

    myChart.update();


}


async function accordeonCommits(res){
  
    
    var acordeon = document.getElementById("accordionExample");
    contador=0;
    res.forEach(element => {
        acordeon.innerHTML += '<div class="accordion-item">'+
      ' <h2 class="accordion-header" id="heading' + contador+'">'+
           '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"'+
              ' data-bs-target="#collapse'+ element.sha+'" aria-expanded="false" aria-controls="collapse'+ element.sha+'">'+
                element.author +
          ' </button> </h2>'+
       '<div id="collapse'+ element.sha+'" class="accordion-collapse collapse" aria-labelledby="heading'+ contador+'" data-bs-parent="#accordionExample">'+
         '  <div class="accordion-body bg-dark text-white">'+
           
       ' </div> </div> </div>' 

    contador++; //contador para que los ids de los elementos sean unicos.
    });
    
}



//en caso de que se seleccione algun commit para consultar el patch entonces hacemos otra peticion para as?? obtener mas datos del commit,
//no saturando as?? el servidor con peticiones de commits que en algunos casos no seran consultados.
async function consultaCommit(sha){
    var params = new URLSearchParams(window.location.search)
    var repo = params.get("repo");
    var owner = params.get("owner");
    var response = await fetch(window.location.protocol + "/data?datos=patch&repo="+repo+ "&owner=" + owner +"&sha=" +sha)
    return await response.text();
}
document.getElementById("accordionExample").addEventListener("show.bs.collapse", (e) =>{
    sha = e.target.id.split("collapse")[1]
    consultaCommit(sha).then( respuesta =>{
        //insertamos la respuesta con el patch del commit en el interior del acordeon.
        document.querySelector("#collapse"+sha + " .accordion-body").innerHTML = "<pre>"+respuesta+"</pre>"
    })
    console.log(e.target.id.split("collapse")[1])
})



inicializarGraficos();

function irInicio(){
    window.location.replace("http://"+window.location.host);
}