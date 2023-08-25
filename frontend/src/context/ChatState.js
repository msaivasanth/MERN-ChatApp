import { useEffect, useState } from "react";
import chatContext from "./chatContext";

const ChatState = (props) => {
    const [user, setUser] = useState("")
    const [selectedChat, setSelectedChat] = useState("")
    const [chats, setChats] = useState([])
    const [notification, setNotification] = useState([])
    
    const [loggedUser, setLoggedUser] = useState()

    const getUserDetails = async () => {
        const data = await fetch('http://localhost:5000/api/user/getuser', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "authToken": localStorage.getItem('token')
            }
        })
        const result = await data.json()
        setUser(result)
        console.log(result)
        // console.log(user)
    }

    
    return(
        <chatContext.Provider value={{ user, getUserDetails, selectedChat, setSelectedChat, chats, setChats, loggedUser, setLoggedUser, notification, setNotification }}>
            {props.children}
        </chatContext.Provider>
    )
}

export default ChatState;