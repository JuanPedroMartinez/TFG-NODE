CREATE DATABASE IF NOT EXISTS `nodelogin` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `nodelogin`;

CREATE TABLE IF NOT EXISTS `accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `token` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE(username)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

CREATE TABLE  IF NOT EXISTS asignaturas (
  id     int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT, 
  nombre   VARCHAR(50) NOT NULL, 
  cadena_coincidencias VARCHAR(50) NOT NULL,
  cuenta VARCHAR(50) NOT NULL,
  FOREIGN KEY(cuenta) REFERENCES accounts(username)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS repositorios(
  id     int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT, 
  nombre   VARCHAR(50) NOT NULL, 
  autor VARCHAR(50) NOT NULL,
  id_asignatura    int(11) NOT NULL,
  FOREIGN KEY(id_asignatura) REFERENCES asignaturas(id)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

INSERT INTO `accounts` (`id`, `username`, `password`, `email`) VALUES (1, 'test', 'test', 'test@test.com');