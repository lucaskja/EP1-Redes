const { createServer } = require('node:http')
const { readFile } = require('node:fs')
const { WebSocketServer, WebSocket } = require('ws')

const respond = (res, tipoConteudo, conteudo) => {
    res.writeHead(200, {
        'Content-Type': tipoConteudo,
        'Content-Length': conteudo.length
    })
    res.write(conteudo)
    res.end()
}

const handleWithNotFound = (res) => {
    res.writeHead(404)
    res.end()
}

const handleRequest = (req, res) => {
    switch (req.url) {
        case '/':
            readFile('src/pages/index.html', 'utf-8', (err, data) => {
                if (err) throw err

                return respond(res, 'text/html', data)
            })
            break
        case '/index.js':
            readFile('src/index.js', 'utf-8', (err, data) => {
                if (err) throw err

                return respond(res, 'text/html', data)
            })
            break
        case '/styles/style.css':
            readFile('src/styles/style.css', 'utf-8', (err, data) => {
                if (err) throw err

                return respond(res, 'text/css', data)
            })
            break
        case '/icons/rectangle.svg':
            readFile('icons/rectangle.svg', 'utf-8', (err, data) => {
                if (err) throw err

                return respond(res, 'image/svg+xml', data)
            })
            break
        case '/icons/circle.svg':
            readFile('icons/circle.svg', 'utf-8', (err, data) => {
                if (err) throw err

                return respond(res, 'image/svg+xml', data)
            })
            break
        case '/icons/triangle.svg':
            readFile('icons/triangle.svg', 'utf-8', (err, data) => {
                if (err) throw err

                return respond(res, 'image/svg+xml', data)
            })
            break
        case '/icons/brush.svg':
            readFile('icons/brush.svg', 'utf-8', (err, data) => {
                if (err) throw err

                return respond(res, 'image/svg+xml', data)
            })
            break
        case '/icons/eraser.svg':
            readFile('icons/eraser.svg', 'utf-8', (err, data) => {
                if (err) throw err

                return respond(res, 'image/svg+xml', data)
            })
            break
        default:
            handleWithNotFound(res)   
    }
}

const server = createServer((req, res) => {
    handleRequest(req, res)
})

const socketServer = new WebSocketServer({ server })

socketServer.on('connection', (ws, req) => {
    ws.id = req.headers['sec-websocket-key']
    console.log(`Novo cliente (${ws.id}) conectado`)

    ws.on('close', () => console.log(`Cliente ${ws.id} desconectado`))

    ws.on('message', (data) => {
        console.log('received: %s', data)
        socketServer.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) client.send(data)
        })
      })

    ws.onerror = function () {
        console.log('Websocket erro')
    }
})
  
server.listen(8080, () => {
    console.log('listening 8080')
})
