const canvas = document.querySelector("canvas"),
botoesFerramentas = document.querySelectorAll(".ferramenta"),
preencherCor = document.querySelector("#preencher-cor"),
controleTamanho = document.querySelector("#controle-tamanho"),
corBotoes = document.querySelectorAll(".cores .opcao"),
selecionaCor = document.querySelector("#seleciona-cor"),
limparCanvas = document.querySelector(".limpar-canvas"),
salvarImagem = document.querySelector(".salvar-imagem"),
contextoCanvas = canvas.getContext("2d")

// global variables with default value
let mouseXAnterior, mouseYAnterior, instante,
estaDesenhando = false,
ferramentaSelecionada = "pincel",
larguraPincel = 5,
corSelecionada = "#000"

const colocarFundoCanva = () => {
    // setting whole canvas background to white, so the downloaded img background will be white
    contextoCanvas.fillStyle = "#fff"
    contextoCanvas.fillRect(0, 0, canvas.width, canvas.height)
    contextoCanvas.fillStyle = corSelecionada // setting fillstyle back to the corSelecionada, it'll be the brush color
}

window.addEventListener("load", () => {
    // setting canvas width/height.. offsetwidth/height returns viewable width/height of an element
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    colocarFundoCanva()
})

const desenhaRetangulo = (e) => {
    // if preencherCor isn't checked draw a rect with border else draw rect with background
    if(!preencherCor.checked) {
        // creating circle according to the mouse pointer
        return contextoCanvas.strokeRect(e.offsetX, e.offsetY, mouseXAnterior - e.offsetX, mouseYAnterior - e.offsetY)
    }
    contextoCanvas.fillRect(e.offsetX, e.offsetY, mouseXAnterior - e.offsetX, mouseYAnterior - e.offsetY)
}

const desenhaCirculo = (e) => {
    contextoCanvas.beginPath() // creating new path to draw circle
    // getting radius for circle according to the mouse pointer
    let radius = Math.sqrt(Math.pow((mouseXAnterior - e.offsetX), 2) + Math.pow((mouseYAnterior - e.offsetY), 2))
    contextoCanvas.arc(mouseXAnterior, mouseYAnterior, radius, 0, 2 * Math.PI) // creating circle according to the mouse pointer
    preencherCor.checked ? contextoCanvas.fill() : contextoCanvas.stroke() // if preencherCor is checked fill circle else draw border circle
}

const desenhaTriangulo = (e) => {
    contextoCanvas.beginPath() // creating new path to draw circle
    contextoCanvas.moveTo(mouseXAnterior, mouseYAnterior) // moving triangle to the mouse pointer
    contextoCanvas.lineTo(e.offsetX, e.offsetY) // creating first line according to the mouse pointer
    contextoCanvas.lineTo(mouseXAnterior * 2 - e.offsetX, e.offsetY) // creating bottom line of triangle
    contextoCanvas.closePath() // closing path of a triangle so the third line draw automatically
    preencherCor.checked ? contextoCanvas.fill() : contextoCanvas.stroke() // if preencherCor is checked fill triangle else draw border
}

const comecaDesenho = (e) => {
    estaDesenhando = true
    mouseXAnterior = e.offsetX // passing current mouseX position as mouseXAnterior value
    mouseYAnterior = e.offsetY // passing current mouseY position as mouseYAnterior value
    contextoCanvas.beginPath() // creating new path to draw
    contextoCanvas.lineWidth = larguraPincel // passing brushSize as line width
    contextoCanvas.strokeStyle = corSelecionada // passing corSelecionada as stroke style
    contextoCanvas.fillStyle = corSelecionada // passing corSelecionada as fill style
    // copying canvas data & passing as instante value.. this avoids dragging the image
    instante = contextoCanvas.getImageData(0, 0, canvas.width, canvas.height)
}

const desenhando = (e) => {
    if(!estaDesenhando) return // if estaDesenhando is false return from here
    contextoCanvas.putImageData(instante, 0, 0) // adding copied canvas data on to this canvas

    if(ferramentaSelecionada === "pincel" || ferramentaSelecionada === "borracha") {
        // if selected tool is eraser then set strokeStyle to white 
        // to paint white color on to the existing canvas content else set the stroke color to selected color
        contextoCanvas.strokeStyle = ferramentaSelecionada === "borracha" ? "#fff" : corSelecionada
        contextoCanvas.lineTo(e.offsetX, e.offsetY) // creating line according to the mouse pointer
        contextoCanvas.stroke() // drawing/filling line with color
    } else if(ferramentaSelecionada === "retangulo"){
        desenhaRetangulo(e)
    } else if(ferramentaSelecionada === "circulo"){
        desenhaCirculo(e)
    } else {
        desenhaTriangulo(e)
    }
}

botoesFerramentas.forEach(btn => {
    btn.addEventListener("click", () => { // adding click event to all tool option
        // removing active class from the previous option and adding on current clicked option
        document.querySelector(".opcoes .active").classList.remove("active")
        btn.classList.add("active")
        ferramentaSelecionada = btn.id
    })
})

controleTamanho.addEventListener("change", () => larguraPincel = controleTamanho.value) // passing slider value as brushSize

corBotoes.forEach(btn => {
    btn.addEventListener("click", () => { // adding click event to all color button
        // removing selected class from the previous option and adding on current clicked option
        document.querySelector(".opcoes .selected").classList.remove("selected")
        btn.classList.add("selected")
        // passing selected btn background color as corSelecionada value
        corSelecionada = window.getComputedStyle(btn).getPropertyValue("background-color")
    })
})

selecionaCor.addEventListener("change", () => {
    // passing picked color value from color picker to last color btn background
    selecionaCor.parentElement.style.background = selecionaCor.value
    selecionaCor.parentElement.click()
})

limparCanvas.addEventListener("click", () => {
    contextoCanvas.clearRect(0, 0, canvas.width, canvas.height) // clearing whole canvas
    colocarFundoCanva()
})

salvarImagem.addEventListener("click", () => {
    const link = document.createElement("a") // creating <a> element
    link.download = `${Date.now()}.jpg` // passing current date as link download value
    link.href = canvas.toDataURL() // passing canvasData as link href value
    link.click() // clicking link to download image
})

canvas.addEventListener("mousedown", comecaDesenho)
canvas.addEventListener("mousemove", desenhando)
canvas.addEventListener("mouseup", () => estaDesenhando = false)
