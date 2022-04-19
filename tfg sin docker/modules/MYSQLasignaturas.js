
const { Asignatura } = require("../modules/Asignatura.js")

function nuevaAsignatura(connection, nombre, cadenaCoindicencias, cuenta) {
    connection.query('INSERT INTO asignaturas (nombre, cadena_coincidencias, cuenta) VALUES (?,?,?)', [nombre, cadenaCoindicencias, cuenta], function (error, results, fields) {
        if (error) { throw error }
    })

}

function eliminarAsignatura(connection, id) {
    connection.query('DELETE FROM asignaturas WHERE id=?', id, function (error) { if (error) { throw error } })
}

async function getNombreAsignaturas(connection) {

    return new Promise((resolve, reject) => {

        connection.query('SELECT nombre from asignaturas', function (error, result, fields) {
            if (error) { reject(error) }
            resolve(result)
        })

    })


}

async function getAsignaturasUsuario(connection, cuenta) {

    return new Promise((resolve, reject) => {

        connection.query('SELECT * from asignaturas where cuenta =?', cuenta, function (error, result, fields) {
            if (error) { reject(error) }
            resolve(result)
        })

    })


}



//metodos relacionados con los repositorios añadidos asociados a una asignatura, 
//esto ocurre cuando algun alumno no cumple la cadena de coincidencia escrita en el nombre del repositorio.

function nuevoRepositorio(connection, nombre, autor) {
    connection.query('INSERT INTO repositorios (nombre, autor) VALUES (?,?,?)', [nombre, autor], function (error, results, fields) {
        if (error) { throw error }
    })

}

function eliminarRepositorio(connection, id) {
    connection.query('DELETE FROM repositorios WHERE id=?', id, function (error) { if (error) { throw error } })
}

async function getRepositoriosAsignatura(connection, idAsignatura) {

    return new Promise((resolve, reject) => {

        connection.query('SELECT * from repositorios WHERE id_asignatura=?', idAsignatura, function (error, result, fields) {
            if (error) { reject(error) }
            resolve(result)
        })

    })


}


/* METODO PARA OBTENER UN OBJETO ASIGNATURA TRAS RECUPERAR LOS DATOS DE LA BBDD */
async function bbddToAsignaturasMapeado(connection, cuenta) {

    var promise = new Promise(function (resolve, reject){
        var asignaturas = new Array();
        contador =0;
        getAsignaturasUsuario(connection, cuenta).then(result => {//asignaturas cuenta
            result.forEach(element => {
                //creamos la asignatura 
                var asign = new Asignatura(element.id, element.nombre, element.cadenaCoindicencias, element.cuenta, null)
                //recupearmos los repositorios de la asignatura y los añadimos al objeto.
               /*  var reposAsign = getRepositoriosAsignatura(connection, asign.id).then(res => {
                    asign.repositorios = new Array()//creamos el array de repositorios de la asignatura
                    res.forEach(repo => {//para cada repositorio lo añadimos al array
                        asign.repositorios.push({ id: repo.id, nombre: repo.nombre, autor: repo.autor })
                    }); */
                   
                    asignaturas.push(asign)//añadimos la asignatura al array que retornaremos.
                 
                    
                   
                })
                resolve(asignaturas)
    })
    })
   
  return promise
}
   


exports.nuevaAsignatura = nuevaAsignatura;
exports.eliminarAsignatura = eliminarAsignatura;
exports.getNombreAsignaturas = getNombreAsignaturas;
exports.nuevoRepositorio = nuevoRepositorio;
exports.eliminarRepositorio = eliminarRepositorio;
exports.getRepositoriosAsignatura = getRepositoriosAsignatura;
exports.bbddToAsignaturasMapeado = bbddToAsignaturasMapeado;