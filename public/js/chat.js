const socket = io()


const $formOne = document.querySelector('#formOne')
const $$formOneInput = $formOne.querySelector('input')
const $formOneButton = $formOne.querySelector('button')
const $sendLocationButton = document.querySelector('#sendLocation')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room } = Qs.parse(location.search,{ ignoreQueryPrefix: true })

const autoScroll = () => {
    //New msg element
    const $newMessage = $messages.lastElementChild

    //Height of new message
    const computedStyles = getComputedStyle($newMessage)
    const newMessageMarginBottom = parseInt(computedStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMarginBottom
    
    //Visible height
    const visibleHeight = $messages.offsetHeight

    //Height of message conatiner
    const containerHeight = $messages.scrollHeight

    //How far have i scolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset ){
        $messages.scrollTop = $messages.scrollHeight
    }

    
}

socket.on('message', (message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.msg,
        createdAt: moment(message.createdAt).format('h:mma')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage', (msg)=>{
    console.log(message);
    const html = Mustache.render(locationMessageTemplate, {
        username: msg.username,
        url: msg.url,
        createdAt: moment(msg.createdAt).format('h:mm')
    })
    $messages.insertAdjacentElement('beforeend',html)
    
})

socket.on('roomData', ({room,users}) =>{
    console.log(room);
    console.log(users);
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
    
    
} )



$formOne.addEventListener('submit', (e)=>{
    e.preventDefault();

    $formOneButton.setAttribute('disabled', 'disabled');

    const text = e.target.elements.textArea.value
    
    socket.emit('sendMessage',text, (error)=>{
        $formOneButton.removeAttribute('disabled')
        $$formOneInput.value = ''
        $$formOneInput.focus()

        if(error){
            return console.log(error);
            
        }
        console.log('Delivered');
        
        
    })
    
})

$sendLocationButton.addEventListener('click', ()=>{
    $sendLocationButton.setAttribute('disabled', 'disabled')

    if(!navigator.geolocation){ return alert('Geolocation not supported by your browser')}

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            
            lat: position.coords.latitude,
            lon: position.coords.longitude
        }, (error)=>{
            if(error){return console.log(error);
            }
            console.log('Location shared');
            $sendLocationButton.removeAttribute('disabled')
            
        })
        
    }, ()=>{
        socket.emit('geoFailed', 'can not acquire location')
        $sendLocationButton.removeAttribute('disabled')
    })
})

socket.emit('join', { username, room }, (error) =>{
    if(error){
        alert(error)
        location.href = '/'
    }
})
