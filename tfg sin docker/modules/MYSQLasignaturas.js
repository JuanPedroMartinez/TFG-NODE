
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

    salida = new Array(); //array para devolver las asignaturas.
    //recuperamos las asingaturas del usuario 
    var asignaturas = await getAsignaturasUsuario(connection, cuenta);
    console.log(asignaturas);
    for (var element of asignaturas) {
        repositorios = await getRepositoriosAsignatura(connection, element.id)
        salida.push(new Asignatura(element.id, element.nombre, element.cadena_coincidencias, element.cuenta, repositorios))
    }
  
 
return salida

}



exports.nuevaAsignatura = nuevaAsignatura;
exports.eliminarAsignatura = eliminarAsignatura;
exports.getNombreAsignaturas = getNombreAsignaturas;
exports.nuevoRepositorio = nuevoRepositorio;
exports.eliminarRepositorio = eliminarRepositorio;
exports.getRepositoriosAsignatura = getRepositoriosAsignatura;
exports.bbddToAsignaturasMapeado = bbddToAsignaturasMapeado;