const ws = new WebSocket('ws://localhost:8080')

const canvas = document.querySelector("canvas"),
toolBtns = document.querySelectorAll(".tool"),
fillColor = document.querySelector("#fill-color"),
sizeSlider = document.querySelector("#size-slider"),
colorBtns = document.querySelectorAll(".colors .option"),
colorPicker = document.querySelector("#color-picker"),
clearCanvas = document.querySelector(".clear-canvas"),
saveImg = document.querySelector(".save-img"),
ctx = canvas.getContext("2d")

let prevMouseX, prevMouseY, snapshot,
isDrawing = false,
selectedTool = "brush",
brushWidth = 5,
selectedColor = "#000"

const setCanvasBackground = () => {
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = selectedColor
}

window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    setCanvasBackground()
})

const drawRect = (e, prev = {x: prevMouseX, y: prevMouseY}, fill = fillColor.checked) => {
    fill ? ctx.fillRect(prev.x, prev.y, e.offsetX - prev.x, e.offsetY - prev.y) : ctx.strokeRect(prev.x, prev.y, e.offsetX - prev.x, e.offsetY - prev.y)
}

const drawCircle = (e, prev = {x: prevMouseX, y: prevMouseY}, fill = fillColor.checked) => {
    ctx.beginPath()
    let radius = Math.sqrt(Math.pow((prev.x - e.offsetX), 2) + Math.pow((prev.y - e.offsetY), 2))
    ctx.arc(prev.x, prev.y, radius, 0, 2 * Math.PI)
    fill ? ctx.fill() : ctx.stroke()
    ctx.closePath()
    ctx.beginPath()
}

const drawTriangle = (e, prev = {x: prevMouseX, y: prevMouseY}, fill = fillColor.checked) => {
    ctx.beginPath()
    ctx.moveTo(prev.x, prev.y)
    ctx.lineTo(e.offsetX, e.offsetY)
    ctx.lineTo(prev.x * 2 - e.offsetX, e.offsetY)
    ctx.closePath()
    fill ? ctx.fill() : ctx.stroke()
    ctx.beginPath()
}

function drawBrush(e, color = selectedColor, tool = selectedTool) {
    ctx.strokeStyle = tool === "eraser" ? "#fff" : color
    ctx.lineTo(e.offsetX, e.offsetY)
    ctx.stroke()
}

const startDraw = (e) => {
    isDrawing = true
    prevMouseX = e.offsetX
    prevMouseY = e.offsetY
    ctx.beginPath()
    ctx.lineWidth = brushWidth
    ctx.strokeStyle = selectedColor
    ctx.fillStyle = selectedColor
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height)
}

const drawing = (e) => {
    if(!isDrawing) return
    mainCoords = {offsetX: e.offsetX, offsetY: e.offsetY}
    ctx.putImageData(snapshot, 0, 0)
    
    if(selectedTool === "brush" || selectedTool === "eraser") {
        drawBrush(e)
        ws.send(JSON.stringify({
            tool: selectedTool,
            coords: mainCoords,
            color: ctx.strokeStyle,
            width: ctx.lineWidth,
        }))
    } else if(selectedTool === "rectangle"){
        drawRect(e)
    } else if(selectedTool === "circle"){
        drawCircle(e)
    } else if(selectedTool === "triangle"){
        drawTriangle(e)
    }
}

const finishDraw = (e) => {
    if(selectedTool === "brush" || selectedTool === "eraser") {
        ctx.closePath()
        ctx.beginPath()
        ws.send(JSON.stringify({ tool: "finish" }))
    } else if(selectedTool === "rectangle" || selectedTool === "circle" || selectedTool === "triangle"){
        ws.send(JSON.stringify({
            tool: selectedTool,
            coords: {offsetX: e.offsetX, offsetY: e.offsetY},
            prev: {x: prevMouseX, y: prevMouseY},
            color: ctx.fillStyle,
            width: ctx.lineWidth,
            fill: fillColor.checked,
        }))
    }
    isDrawing = false
}

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active")
        btn.classList.add("active")
        selectedTool = btn.id
    })
})

sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value)

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected")
        btn.classList.add("selected")
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color")
    })
})

colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value
    colorPicker.parentElement.click()
})

clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setCanvasBackground()
    ws.send(JSON.stringify({ tool: "clear" }))
})

saveImg.addEventListener("click", () => {
    const link = document.createElement("a")
    link.download = `${Date.now()}.jpg`
    link.href = canvas.toDataURL()
    link.click()
})

canvas.addEventListener("mousedown", startDraw)
canvas.addEventListener("mousemove", drawing)
canvas.addEventListener("mouseup", finishDraw)

ws.onmessage = (message) => {
    const reader = new FileReader()
    reader.readAsText(message.data)

    reader.onload = () => {
        const messageBody = JSON.parse(reader.result)
        console.log('Recebi: ', messageBody)

        ctx.lineWidth = messageBody.width
        ctx.strokeStyle = messageBody.color
        ctx.fillStyle = messageBody.color

        if (messageBody.tool === "brush" || messageBody.tool === "eraser") {
            drawBrush(messageBody.coords, messageBody.color, messageBody.tool)
        } else if (messageBody.tool === "rectangle"){
            drawRect(messageBody.coords, messageBody.prev, messageBody.fill)
        } else if (messageBody.tool === "circle"){
            drawCircle(messageBody.coords, messageBody.prev, messageBody.fill)
        }
        else if (messageBody.tool === "triangle"){
            drawTriangle(messageBody.coords, messageBody.prev, messageBody.fill)
        } else if (messageBody.tool === "finish"){
            ctx.closePath()
            ctx.beginPath()
        } else if (messageBody.tool === "clear"){
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            setCanvasBackground()
        }
    }
}
