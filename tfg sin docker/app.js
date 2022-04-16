const { Octokit, App } = require("octokit");
const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const { response } = require("express");
const moduloAsignaturas = require("./modules/Asignaturas.js");

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'nodelogin'
});

function callback() {
	return true;
}
const app = express();


app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json()); //permite recibir parametros en json.            
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));


var octokit = new Octokit({ auth: "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" })
let user = "JuanPedroMartinez"

async function getUsuario(usuario) {
	var res = await octokit.rest.users.getByUsername({ username: usuario });
	return res;
}

async function getReposUsuario(usuario) {
	var res = await octokit.rest.repos.listForAuthenticatedUser({

		type: "all",
	})
	var salida = [];
	res.data.forEach(element => {
		salida.push({ "repo": element.name, "owner": element.owner.login, "url": element.clone_url});
	})
	return salida;
}

async function getColaboradoresRepo(repositorio, usuario) {
	var res = await octokit.rest.repos.listCollaborators({
		owner: usuario,
		repo: repositorio,
	});
	var salida = [];
	res.data.forEach(element => {
		salida.push({ "name": element.login })
	})
	return salida;
}

async function getCommitsRepo(repositorio, usuario) {
	var res = await octokit.rest.repos.listCommits({
		owner: usuario,
		repo: repositorio,
	})
	var salida = [];
	res.data.forEach(element => {
		salida.push({ "author": element.commit.author.name, "date": element.commit.author.date, "sha" : element.sha });

	})

	return salida;
}

async function getPatch(repositorio, usuario, referencia){
	var res = await octokit.request('GET /repos/{owner}/{repo}/commits/{ref}', {
		owner: usuario,
		repo: repositorio,
		ref: referencia
	  })

	var salida="";
	res.data.files.forEach(element => {
		salida+= element.filename
		salida+="\n"
		salida+=element.patch
		salida+= "\n\n\n"
	});


	return salida;
}



//RUTAS DE ACCESO

// http://localhost:3000/
app.get('/', function (request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/login.html'));
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
				// Redirect to home page
				response.redirect('/misRepos');
			} else {
				response.send('Incorrect Username and/or Password!');
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
	let repassword = request.body.repassword;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE username = ? OR email = ?', [username, email], function (error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// si el usuario existe o el email informamos al usuario.
			if (results.length > 0) {
				//en caso de estar registrado analizar que hacer.


			} else {
				connection.query('INSERT INTO accounts (username, password, email) VALUES (?,?,?)', [username, password, email], function (error, results, fields) {
					if (error) throw error;
					request.session.loggedin = true;
					request.session.username = username;
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

// http://localhost:3000/home
app.get('/home', function (request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		//recuperamos los datos de github.


		response.sendFile(path.join(__dirname + '/home.html'));
	} else {
		// Not logged in
		response.send('Please login to view this page!');
	}
});

app.get('/misRepos', function (request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		//recuperamos los datos de github.


		response.sendFile(path.join(__dirname + '/misRepos.html'));
	} else {
		// Not logged in
		response.send('Please login to view this page!');
	}
});

app.get('/registro', function (request, response) {
	response.sendFile(path.join(__dirname + '/registro.html'));
});

app.get('/data', function (request, response) {
	if (request.query.datos == "repos") {
		getReposUsuario(request.session.username).then(resu => response.send(resu));

	}
	if (request.query.datos == "commits") {
		getCommitsRepo(request.query.repo, request.query.owner).then(resu => response.send(resu))
	}
	if (request.query.datos == "collaborators") {
		getColaboradoresRepo(request.query.repo, request.session.username).then(resu => response.send(resu))
	}
	if (request.query.datos == "patch") {
		getPatch(request.query.repo, request.query.owner, request.query.sha).then(resu => response.send(resu))
	}


});
//getCommitsRepo("TDS2122-31-AppVideo", "JuanPedroMartinez").then(res =>console.log(res))



//console.log(moduloAsignaturas.getAsignaturas(connection))

moduloAsignaturas.getAsignaturas(connection).then(res => console.log(res))


app.listen(3000);
