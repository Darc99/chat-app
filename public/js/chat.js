const socket = io() 

socket.on('message', (message) => {
    console.log(message);
})

document.querySelector('#msg-form').addEventListener('submit', (e) => {
    e.preventDefault()

    const message = e.target.elements.msg.value

    socket.emit('sendMsg', message)
})

document.querySelector('#send-loc').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        })
    })
})
