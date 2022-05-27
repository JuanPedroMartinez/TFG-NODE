const { Octokit, App } = require("octokit");
const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const { response } = require("express");
const axios = require('axios').default;
const moduloAsignaturas = require("./modules/MYSQLasignaturas.js");
const { Asignatura } = require("./modules/Asignatura.js")

const connection = mysql.createConnection({
	host: process.env.MYSQL_HOST,
	user: 'user',
	password: 'root',
	database: 'nodelogin'
});

const app = express();

app.set('trust proxy', 1) // trust first proxy
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json()); //permite recibir parametros en json.            
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));


//RUTAS DE ACCESO

// http://localhost:3000/
app.get('/', function (request, response) {
	//en caso de estar loggeado.
	if (request.session.loggedin) {
		response.sendFile(path.join(__dirname + '/misRepos.html'));
	} else {
		response.sendFile(path.join(__dirname + '/login.html'));
	}

});


// http://localhost:3000/auth
app.post('/auth', function (request, response) {
	// Capture the input fields
	let username = request.body.username;
	let password = request.body.password;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.username = username;
				request.session.token = results[0].token;
				octokit = new Octokit({ auth: request.session.token }) // inicializamos octokit.

				// Redirect to home page
				response.redirect('/misRepos');
			} else {
				response.sendFile(path.join(__dirname + '/static/errors/loginErr.html'));
			}

		});
	} else {
		response.send('Please enter Username and Password!');

	}
});
// http://localhost:3000/register
app.post('/register', function (request, response) {
	// Capture the input fields
	let username = request.body.username;
	let email = request.body.email;
	let password = request.body.password;
	let token = request.body.token;
	console.log(token)
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE username = ? OR email = ?', [username, email], function (error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// si el usuario existe o el email informamos al usuario.
			if (results.length > 0) {
				response.send("El usuario ya existe.")


			} else {
				connection.query('INSERT INTO accounts (username, password, email, token) VALUES (?,?,?,?)', [username, password, email, token], function (error, results, fields) {
					if (error) throw error;
					request.session.loggedin = true;
					request.session.username = username;
					request.session.token = token
					octokit = new Octokit({ auth: token })
					response.redirect("/misRepos");
				});
			}

		});
	} else {
		response.send('Please enter Username and Password!');

	}
});
//metodo post para añadir una asingatura.
app.post('/addAsignatura', function (request, response) {
	var asignatura = request.body.asignatura;
	var cadenaCoindicencia = request.body.cadenacoincidencia;

	moduloAsignaturas.nuevaAsignatura(connection, asignatura, cadenaCoindicencia, request.session.username)
	response.redirect("/misRepos")
});
//metodo post para añadir un repositorio a una asingatura.
app.post('/addRepoAsignatura', function (request, response) {
	var asignatura = request.body.asignatura;
	var propietario = request.body.propietario;
	var repositorio = request.body.repositorio;

	console.log(asignatura + propietario + repositorio)
	moduloAsignaturas.nuevoRepositorio(connection, repositorio, propietario, asignatura);
	response.status(201).end();
});
app.get('/asignaturas', function (request, response) {
	moduloAsignaturas.bbddToAsignaturasMapeado(connection, request.session.username).then(resu => response.send(resu))
});

// http://localhost:3000/home
app.get('/home', function (request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		//recuperamos los datos de github.
		response.sendFile(path.join(__dirname + '/home.html'));
	} else {
		// Not logged in
		response.sendFile(path.join(__dirname + '/login.html'));
	}
});

app.get('/misRepos', function (request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		//recuperamos los datos de github.


		response.sendFile(path.join(__dirname + '/misRepos.html'));
	} else {
		// Not logged in
		response.sendFile(path.join(__dirname + '/login.html'));
	}
});

app.get('/registro', function (request, response) {
	response.sendFile(path.join(__dirname + '/registro.html'));
});

app.get('/data', function (request, response) {
	if (request.query.datos == "repos") {
		axios({
			method: 'get',
			url: "http://"+ process.env.PROXY_REST+ ":3001/repos",
			data: {
				token:request.session.token
			}
		}).then(res => response.send(res.data)).catch(err => console.log(err))

	}
	if (request.query.datos == "commits") {

		axios({
			method: 'get',
			url: "http://"+ process.env.PROXY_REST+ ":3001/commits?repo="+ request.query.repo
						+ "&owner=" + request.query.owner,
			data: {
				token:request.session.token
			}
		}).then(res => response.send(res.data)).catch(err => console.log(err))
	}
	if (request.query.datos == "collaborators") {
		axios({
			method: 'get',
			url: "http://"+ process.env.PROXY_REST+ ":3001/commits?repo="+ request.query.repo
						+ "&owner=" + request.query.owner,
			data: {
				token:request.session.token
			}
		}).then(res => response.send(res.data)).catch(err => console.log(err))

	}
	if (request.query.datos == "patch") {
		axios({
			method: 'get',
			url: "http://"+ process.env.PROXY_REST+ ":3001/patch?repo="+ request.query.repo
						+ "&owner=" + request.query.owner + "&sha=" + request.query.sha,
			data: {
				token:request.session.token
			}
		}).then(res => response.send(res.data)).catch(err => console.log(err))

	}



});



app.listen(3000);
