const users = []


const addUser = ({id, username, room}) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate data
    if(!username || !room){ return { error: 'Username and room required'}}

    //check for exsisting user
    const exsitingUser = users.find( (user) => user.room === room && user.username === username)

    if(exsitingUser){ return {error: 'Username is in use'}}

    //Store user
    const user = {
        id,
        username,
        room
    }
    users.push(user)
    return { user }

}

const removeUser = (id) =>{
    const index = users.findIndex( (user) => user.id === id )

    if(index !== -1 ){
        return users.splice(index,1)[0]
    }
}

const getUser = (id) =>{
    return users.find( (user) => user.id === id )
}

const getUsersInRoom = (room) => {
    return users.filter( (user) => user.room === room)
}

addUser({
    id: 22,
    username: "T",
    room: '  S Philly'
})

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
