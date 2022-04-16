const res = require("express/lib/response")


function nuevaAsignatura(connection, nombre, cadenaCoindicencias, cuenta) {
    connection.query('INSERT INTO asignaturas (nombre, cadena_coincidencias, cuenta) VALUES (?,?,?)', [nombre, cadenaCoindicencias, cuenta], function (error, results, fields){
        if (error) {throw error}
    })

}

function eliminarAsignatura(connection, id){
    connection.query('DELETE FROM asignaturas WHERE id=?',id, function (error){if (error){throw error}})
}

 async function getAsignaturas(connection){
  
   return new Promise((resolve, reject) => {

    connection.query('SELECT nombre from asignaturas',function(error,result, fields){
        if (error){reject(error)}
         resolve(result)
     })

   })


}

exports.nuevaAsignatura = nuevaAsignatura;
exports.eliminarAsignatura = eliminarAsignatura;
exports.getAsignaturas = getAsignaturas;