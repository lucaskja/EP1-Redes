const { createServer } = require('node:http')
const { readFile } = require('node:fs')

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

handleRequest = (req, res) => {
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

                console.log(data)

                return responde(res, 'text/html', data)
            })
            break
        case '/styles/style.css':
            readFile('src/styles/style.css', 'utf-8', (err, data) => {
                if (err) throw err

                console.log(data)

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
    handleRequest(req, res)
})

server.listen(8080, () => {
    console.log((new Date()) + ' Server is listening on port 8080')
})
