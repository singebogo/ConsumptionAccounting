
const USER_KEY = 'user'

function saveUser(user){
    localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function getUser(){
    return localStorage.getItem(USER_KEY) || {}
}

function removeUser(){
    localStorage.removeItem(USER_KEY)
}