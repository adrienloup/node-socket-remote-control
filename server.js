const twig = require('twig')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const server = require('http').createServer(app)

app.use('/public', express.static('public', {maxage: '1h'}))

app.set('twig options', {
	allow_async: true,
	strict_variables: true
})

const routes = [
	{path: '/', twig: 'home.twig'}
	,{path: '/about', twig: 'about.twig'}
	,{path: '/contact', twig: 'contact.twig'}
	,{path: '/remote-control', twig: 'remote-control.twig'}
]

routes.forEach(route => {
	app.get(route.path, function(req, res) {
		res.setHeader('Cache-Control', 'public, max-age=3600')
		res.render(route.twig, {partial: !!req.query.partial})
	})
})

app.use(function(req, res, next) {
	res.status(404)
	res.render('error.twig')
})

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const io = require('socket.io')(server)
const clients = []

var current_room = null

const remoteControle = io.on('connection', function(socket) {
	console.log('Connected')
	
	socket.on('load', function(data) {
		console.log(`Room ${data.room}`)
		current_room = data.room
		socket.join(data.room)
		socket.to(data.room).emit('access', { access: 'granted'	})
	})

	clients.push(socket)

	socket.on('disconnect', function() {
		console.log('Disconnect')
		remoteControle.to(Object.keys(socket.rooms)[0]).emit('stop')
		let i = clients.indexOf(socket)
		clients.splice(i, 1)
	})

	socket.on('message', function(data) {
		remoteControle.to(Object.keys(socket.rooms)[0]).emit('messageSuccess', data)
	})

	socket.on('rooms', function() {
		remoteControle.to(Object.keys(socket.rooms)[0]).emit('room', { room: current_room })
	})

	socket.on('page-changed', function(data) {
		remoteControle.to(Object.keys(socket.rooms)[0]).emit('navigate', { hash: data.hash })
	})

	socket.on('stop-control', function() {
		remoteControle.to(Object.keys(socket.rooms)[0]).emit('stop')
	})

	socket.on('arrow-up', function() {
		remoteControle.to(Object.keys(socket.rooms)[0]).emit('slide-up')
	})

	socket.on('arrow-down', function() {
		remoteControle.to(Object.keys(socket.rooms)[0]).emit('slide-down')
	})

})

server.listen(process.env.port || 8080)
