const socket = io() 

const msgForm = document.querySelector('#msg-form');
const msgFormInput = msgForm.querySelector('input');
const msgFormBtn = msgForm.querySelector('button');
const sendLocBtn = document.querySelector('#send-loc');

socket.on('message', (message) => {
    console.log(message);
})

msgForm.addEventListener('submit', (e) => {
    e.preventDefault()

    msgFormBtn.setAttribute('disabled', 'disabled')

    const message = e.target.elements.msg.value

    socket.emit('sendMsg', message, (err) => {
        // console.log('The message was delivered', msg);
        msgFormBtn.removeAttribute('disabled')
        msgFormInput.value = ''
        msgFormInput.focus()
        if (err) {
            return console.log(err);
        }

        console.log('Message delivered')
    })
})

sendLocBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    sendLocBtn.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            sendLocBtn.removeAttribute('disabled')
            console.log('Location shared');
        })
    })
})
