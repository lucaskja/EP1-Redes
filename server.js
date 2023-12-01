const { createServer } = require('node:http')
const { readFile } = require('node:fs')
const WebSocket = require('ws')

const responde = (res, tipoConteudo, conteudo) => {
    res.writeHead(200, {
        'Content-Type': tipoConteudo,
        'Content-Length': conteudo.length
    })
    res.write(conteudo)
    res.end()
}

respondeComNaoEncontrado = (res) => {
    res.writeHead(404)
    res.end()
}

lidaRequisicao = (req, res) => {
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
  
const wss = new WebSocket.Server({ noServer: true })

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message)
        }
        })
    })
})

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request)
    })
})

server.listen(8080, () => {
    console.log(`${new Date()} Server is listening on port 8080`)
})
