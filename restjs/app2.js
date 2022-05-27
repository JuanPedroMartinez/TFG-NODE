const { Octokit, App } = require("octokit");

const express = require('express');
const path = require('path');
const { response } = require("express");
const { application } = require("express");


const app = express();

app.use(express.json()); //permite recibir parametros en json.            
app.use(express.urlencoded({ extended: true }));



async function getUsuario(usuario,token) {
	var octokit = new Octokit({auth: token})
	var res = await octokit.rest.users.getByUsername({ username: usuario });
	return res;
}

async function getReposUsuario(usuario, token) {
	var octokit = new Octokit({auth: token})
	var res = await octokit.rest.repos.listForAuthenticatedUser({

		type: "all",
	})
	var salida = [];
	res.data.forEach(element => {
		salida.push({ "repo": element.name, "owner": element.owner.login, "url": element.clone_url});
	})
	return salida;

}

async function getColaboradoresRepo(repositorio, usuario, token) {
	var octokit = new Octokit({auth: token})

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

async function getCommitsRepo(repositorio, usuario, token) {

	var octokit = new Octokit({auth: token})

	var res = await octokit.rest.repos.listCommits({
		owner: usuario,
		repo: repositorio,
	})
	var salida = [];
	res.data.forEach(element => {
		salida.push({ "author": element.commit.author.name, "date": element.commit.author.date, "sha": element.sha });

	})
	return salida;
}

async function getPatch(repositorio, usuario, referencia,token) {
	var octokit = new Octokit({auth: token})

	var res = await octokit.request('GET /repos/{owner}/{repo}/commits/{ref}', {
		owner: usuario,
		repo: repositorio,
		ref: referencia
	})

	var salida = "";
	res.data.files.forEach(element => {
		salida += element.filename
		salida += "\n"
		salida += element.patch
		salida += "\n\n\n"
	});


	return salida;
}


//RUTAS DE ACCESO PARA PETICIONES A LA API REST.

app.get('/repos', function (request, response) {

	getReposUsuario(request.query.user, request.body.token).then(resu => response.send(resu));

});

app.get('/commits', function (request, response) {
	console.log("imprimo el token recibido : "+request.body.token)
	 getCommitsRepo(request.query.repo, request.query.owner, request.body.token)
		.then(resu => response.send(resu))
		.catch(err => console.log(err)) 
	
})

app.get('/collaborators', function (request, response) {

	getColaboradoresRepo(request.query.repo, request.query.user, request.body.token).then(resu => response.send(resu))
	
})

app.get('/patch', function (request, response){
	console.log("recibo la peticion en restjs")
	getPatch(request.query.repo, request.query.owner, request.query.sha,request.body.token).then(resu => response.send(resu))
});


app.listen(3001);
