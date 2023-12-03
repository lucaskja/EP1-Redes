const { createServer } = require('node:http')
const { readFile } = require('node:fs')
const { WebSocketServer, WebSocket } = require('ws')

const responde = (res, tipoConteudo, conteudo) => {
    res.writeHead(200, {
        'Content-Type': tipoConteudo,
        'Content-Length': conteudo.length
    })
    res.write(conteudo)
    res.end()
}

const respondeComNaoEncontrado = (res) => {
    res.writeHead(404)
    res.end()
}

const lidaRequisicao = (req, res) => {
    switch (req.url) {
        case '/':
            readFile('src/pages/index.html', 'utf-8', (err, data) => {
                if (err) throw err

                return responde(res, 'text/html', data)
            })
            break
        case '/index.js':
            readFile('src/index.js', 'utf-8', (err, data) => {
                if (err) throw err

                return responde(res, 'text/html', data)
            })
            break
        case '/styles/style.css':
            readFile('src/styles/style.css', 'utf-8', (err, data) => {
                if (err) throw err

                return responde(res, 'text/css', data)
            })
            break
        case '/icons/retangulo.svg':
            readFile('icons/retangulo.svg', 'utf-8', (err, data) => {
                if (err) throw err

                return responde(res, 'image/svg+xml', data)
            })
            break
        case '/icons/circulo.svg':
            readFile('icons/circulo.svg', 'utf-8', (err, data) => {
                if (err) throw err

                return responde(res, 'image/svg+xml', data)
            })
            break
        case '/icons/triangulo.svg':
            readFile('icons/triangulo.svg', 'utf-8', (err, data) => {
                if (err) throw err

                return responde(res, 'image/svg+xml', data)
            })
            break
        case '/icons/pincel.svg':
            readFile('icons/pincel.svg', 'utf-8', (err, data) => {
                if (err) throw err

                return responde(res, 'image/svg+xml', data)
            })
            break
        case '/icons/borracha.svg':
            readFile('icons/borracha.svg', 'utf-8', (err, data) => {
                if (err) throw err

                return responde(res, 'image/svg+xml', data)
            })
            break
        default:
            respondeComNaoEncontrado(res)   
    }
}

const server = createServer((req, res) => {
    lidaRequisicao(req, res)
})

const socketServer = new WebSocketServer({ server })

socketServer.on('connection', (ws, req) => {
    ws.id = req.headers['sec-websocket-key']
    console.log(`Novo cliente (${ws.id}) conectado`)

    ws.on('close', () => console.log(`Cliente ${ws.id} desconectado`))

    ws.on('message', (data, isBinary) => {
        console.log('received: %s', data)
        socketServer.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) client.send(data, { binary: isBinary })
        })
      })

    ws.onerror = function () {
        console.log('Websocket erro')
    }
})
  
server.listen(8080, () => {
    console.log('listening 8080')
})
