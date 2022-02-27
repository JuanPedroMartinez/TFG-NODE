const { Octokit, App } = require("octokit");
const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const { response } = require("express");

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
let user = "JuanpeTFG"

async function obtenerUsuario(usuario) {
	var res = await octokit.rest.users.getByUsername({ username: usuario });
	return res;
}

async function obtenerReposUsuario(usuario) {
	var res = await octokit.rest.repos.listForAuthenticatedUser({

		type: "all",
	})
	mostrarNombresRepos(res)
	var salida = [];
	res.data.forEach(element => {
		salida.push({ "repo": element.name, "owner": element.owner.login });
	})
	return salida;
}

async function obtenerColaboradoresRepo(repositorio, usuario) {
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


async function obtenerCommitsRepo(repositorio, usuario) {
	var res = await octokit.rest.repos.listCommits({
		owner: usuario,
		repo: repositorio,
	})
	var salida = [];
	res.data.forEach(element => {
		salida.push({ "author": element.commit.author.name, "date": element.commit.author.date });

	})
	//mostrarCommitsRepo(res);
	return salida;
}

obtenerCommitsRepo("Ejemplo1", "JuanpeTFG")
function mostrarNombresRepos(repos) {

	repos.data.forEach(element => {//para cada repo procesamos los commits
		obtenerCommitsRepo(element.name, element.owner.login);
	});


}

function mostrarCommitsRepo(commits) {
	commits.data.forEach(element => {
		console.log(element.commit.author.name);
		console.log(element.commit.author.date)
	});


}

//response =   obtenerUsuario(user).then(val => console.log(val));
//obtenerReposUsuario(user);






//rutas de acceso.

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
				response.redirect('/home');
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
					response.redirect("/home");
				});
			}

		});
	} else {
		response.send('Please enter Username and Password!');

	}
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

app.get('/registro', function (request, response) {
	response.sendFile(path.join(__dirname + '/registro.html'));
});

app.get('/data', function (request, response) {
	if (request.query.datos == "repos") {
		obtenerReposUsuario(request.session.username).then(resu => response.send(resu));

	}
	if (request.query.datos == "commits") {
		obtenerCommitsRepo(request.query.repo, request.session.username).then(resu => response.send(resu))
	}
	if (request.query.datos == "collaborators") {
		obtenerColaboradoresRepo(request.query.repo, request.session.username).then(resu => response.send(resu))
	}

});



app.listen(3000);
