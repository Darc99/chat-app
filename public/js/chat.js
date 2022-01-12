const socket = io() 

socket.on('message', (message) => {
    console.log(message);
})

document.querySelector('#msg-form').addEventListener('submit', (e) => {
    e.preventDefault()

    const message = e.target.elements.msg.value

    socket.emit('sendMsg', message)
})