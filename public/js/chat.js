const socket = io() 

const msgForm = document.querySelector('#msg-form');
const msgFormInput = msgForm.querySelector('input');
const msgFormBtn = msgForm.querySelector('button');
const sendLocBtn = document.querySelector('#send-loc');
const msgs = document.querySelector('#msgs')

//Templates
const msgTemplate = document.querySelector('#msg-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Query String
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

//Scrolling effect
const autoscroll = () => {
    // New message element
    const $newMessage = msgs.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    // Visible height
    const visibleHeight = msgs.offsetHeight

    // Height of messages container
    const containerHeight = msgs.scrollHeight

    // How far have I scrolled?
    const scrollOffset = msgs.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        msgs.scrollTop = msgs.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(msgTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    msgs.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMsg', (location) => {
    console.log(location)
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    msgs.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

//roomInfo 
socket.on('roomInfo', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
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

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})