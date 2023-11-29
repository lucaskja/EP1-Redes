const { createServer } = require('node:http')
const { readFile } = require('node:fs')

let pagina, script, css, imagemCirculo, imagemTriangulo, imagemRetangulo, imagemPincel, imagemBorracha

readFile('src/index.html', (err, data) => {
    pagina = data
})

readFile('src/index.js', (err, data) => {
    script = data
})

readFile('src/style.css', (err, data) => {
    css = data
})

readFile('icons/circulo.svg', (err, data) => {
    imagemCirculo = data
})

readFile('icons/triangulo.svg', (err, data) => {
    imagemTriangulo = data
})

readFile('icons/retangulo.svg', (err, data) => {
    imagemRetangulo = data
})

readFile('icons/pincel.svg', (err, data) => {
    imagemPincel = data
})

readFile('icons/borracha.svg', (err, data) => {
    imagemBorracha = data
})

function respond(res, statuCodigo, tipoConteudo, conteudo) {
    res.writeHead(statuCodigo, {
        'Content-Type': tipoConteudo,
        'Content-Length': conteudo.length
    });
    res.write(conteudo);
    res.end();
}

respondeHtml = (res, conteudo) => {
    respond(res, 200, 'text/html', conteudo)
}

respondeScript = (res, conteudo) => {
    respond(res, 200, 'text/html', conteudo)
}

respondeCss = (res, conteudo) => {
    respond(res, 200, 'text/css', conteudo)
}

respondeSvg = (res, tipoConteudo, conteudo) => {
    respond(res, 200, tipoConteudo, conteudo)
}

respondWithNotFound = (res) => {
    res.writeHead(404);
    res.end();
}

handleRequest = (req, res) => {
    switch (req.url) {
        case '/':
            respondeHtml(res, pagina);
            break;
        case '/script.js':
            respondeScript(res, script);
            break;
        case '/style.css':
            respondeCss(res, css);
            break;
        case '/icons/retangulo.svg':
            respondeSvg(res, 'image/svg+xml', imagemRetangulo);
            break;
        case '/icons/circulo.svg':
            respondeSvg(res, 'image/svg+xml', imagemCirculo);
            break;
        case '/icons/triangulo.svg':
            respondeSvg(res, 'image/svg+xml', imagemTriangulo);
            break;
        case '/icons/pincel.svg':
            respondeSvg(res, 'image/svg+xml', imagemPincel);
            break;
        case '/icons/borracha.svg':
            respondeSvg(res, 'image/svg+xml', imagemBorracha);
            break;
        default:
            respondWithNotFound(res);
    }
}

const server = createServer((req, res) => {
    handleRequest(req, res)
})

server.listen(8080, () => {
    console.log((new Date()) + ' Server is listening on port 8080')
})
