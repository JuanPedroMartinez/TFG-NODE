

var barChart = document.getElementById('myChart').getContext("2d"); // node

var areaChart = document.getElementById('areaChart').getContext("2d");


const myChart = new Chart(barChart, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
    }
});



//commits por cada colaborador.
colaboradores = [];




console.log(colaboradores)

const myChart2 = new Chart(areaChart, {
    type: 'bar',
    data: {
        labels: colaboradores,
        datasets: [{
            label: 'Commits por colaborador',
            data: [300,200,100],
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

    }

});

function añadirCOlaboradores(){
    myChart2.data.labels.push("hola");
    myChart2.update();
}

añadirCOlaboradores();

//ojo con las rutas en caso de no estar en localhost, puede cambiar el funcionamiento
//https://stackoverflow.com/questions/1034621/get-the-current-url-with-javascript
async function getColaboradores() {
    var aux =await fetch(window.location.protocol+"/data?datos=collaborators&repo=Ejemplo1")
    return await aux.json();

}

getColaboradores().then(res =>{
    res.forEach(element => {
       myChart2.data.labels.push(element.name)
    })

    myChart2.update()
}
);
