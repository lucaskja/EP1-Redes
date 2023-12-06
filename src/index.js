const ws = new WebSocket('ws://localhost:8080')

const canvas = document.querySelector("canvas"),
toolBtns = document.querySelectorAll(".tool"),
fillColor = document.querySelector("#fill-color"),
sizeSlider = document.querySelector("#size-slider"),
colorBtns = document.querySelectorAll(".colors .option"),
colorPicker = document.querySelector("#color-picker"),
clearCanvas = document.querySelector(".clear-canvas"),
saveImg = document.querySelector(".save-img"),
ctx = canvas.getContext("2d");

let prevMouseX, prevMouseY, snapshot,
isDrawing = false,
selectedTool = "brush",
brushWidth = 5,
selectedColor = "#000";
isShape = false;

const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
}

window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
});

const drawRect = (e) => {
    if(!fillColor.checked) {
        return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
}

const drawCircle = (e) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

const drawing = (e) => {
    if(!isDrawing) return;
    mainCoords = {x: e.offsetX, y: e.offsetY}
    ctx.putImageData(snapshot, 0, 0);
    
    if(selectedTool === "brush" || selectedTool === "eraser") {
        isShape = false;
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        ws.send(JSON.stringify({tool: selectedTool, coords: mainCoords, color: ctx.strokeStyle, width: ctx.lineWidth}));
    } else if(selectedTool === "rectangle"){
        isShape = true;
        drawRect(e);
    } else if(selectedTool === "circle"){
        isShape = true;
        drawCircle(e);
    } else if(selectedTool === "triangle"){
        isShape = true;
        drawTriangle(e);
    }
}

const finishDraw = (e) => {
    if(!isShape) {
        ctx.closePath();
        ctx.beginPath();
        ws.send(JSON.stringify({tool: "finish"}));
    } else{
        ws.send(JSON.stringify({tool: selectedTool, coords: {x: e.offsetX, y: e.offsetY}, prev: {x: prevMouseX, y: prevMouseY}, color: ctx.fillStyle, width: ctx.lineWidth, fill: fillColor.checked}));
    }
    isDrawing = false;
}

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
    });
});

sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
    ws.send(JSON.stringify({tool: "clear"}));
});

saveImg.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
});

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", finishDraw);

ws.onmessage = (message) => {
    let reader = new FileReader();
    reader.onload = function() {
        const messageBody = JSON.parse(reader.result);
        console.log(messageBody);
        ctx.lineWidth = messageBody.width;
        ctx.strokeStyle = messageBody.color;
        ctx.fillStyle = messageBody.color;
        if(messageBody.tool === "brush" || messageBody.tool === "eraser") {
            ctx.strokeStyle = messageBody.tool === "eraser" ? "#fff" : ctx.strokeStyle;
            ctx.lineTo(messageBody.coords.x, messageBody.coords.y);
            ctx.stroke();
        } else if(messageBody.tool === "rectangle"){
            ctx.strokeRect(messageBody.coords.x, messageBody.coords.y, messageBody.prev.x - messageBody.coords.x, messageBody.prev.y - messageBody.coords.y);
            messageBody.fill ? ctx.fillRect(messageBody.coords.x, messageBody.coords.y, messageBody.prev.x - messageBody.coords.x, messageBody.prev.y - messageBody.coords.y) : ctx.strokeRect(messageBody.coords.x, messageBody.coords.y, messageBody.prev.x - messageBody.coords.x, messageBody.prev.y - messageBody.coords.y);
        } else if(messageBody.tool === "circle"){
            ctx.beginPath();
            let radius = Math.sqrt(Math.pow((messageBody.prev.x - messageBody.coords.x), 2) + Math.pow((messageBody.prev.y - messageBody.coords.y), 2));
            ctx.arc(messageBody.prev.x, messageBody.prev.y, radius, 0, 2 * Math.PI);
            messageBody.fill ? ctx.fill() : ctx.stroke();
        }
        else if(messageBody.tool === "triangle"){
            ctx.beginPath();
            ctx.moveTo(messageBody.prev.x, messageBody.prev.y);
            ctx.lineTo(messageBody.coords.x, messageBody.coords.y);
            ctx.lineTo(messageBody.prev.x * 2 - messageBody.coords.x, messageBody.coords.y);
            ctx.closePath();
            messageBody.fill ? ctx.fill() : ctx.stroke();
        } else if(messageBody.tool === "finish"){
            ctx.closePath();
            ctx.beginPath();
        } else if(messageBody.tool === "clear"){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setCanvasBackground();
        }
    };
    reader.readAsText(message.data);
};
