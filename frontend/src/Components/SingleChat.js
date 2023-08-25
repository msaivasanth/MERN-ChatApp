import React, { useContext, useEffect, useState } from 'react'
import chatContext from '../context/chatContext'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { getSender, getSenderFull } from '../config/ChatLogics'
import ProfileModel from './ProfileModel'
import UpdateGroupChatModel from './UpdateGroupChatModel'
import './style.css'
import ScrollableChat from './ScrollableChat'
import io from 'socket.io-client'
import Lottie from 'react-lottie'
import animationData from '../animation/typing.json'

const ENDPOINT = 'https://talk-a-tive-je3r.onrender.com'
var socket, selectedChatCompare;

const SingleChat = ({fetchAgain, setFetchAgain}) => {
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState()
    const [socketConnected, setSocketConnected] = useState(false)

    const[typing, setTyping] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    
    const {user, selectedChat, setSelectedChat, notification, setNotification} = useContext(chatContext)
    
    const toast = useToast()
    
    
    const fetchAllMessages = async () => {
        if(!selectedChat) return ;

        try {
            setLoading(true)
            const result = await fetch(`https://talk-a-tive-je3r.onrender.com/api/message/allMessages/${selectedChat._id}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "authToken": localStorage.getItem('token')
                }
            })
            
            const data = await result.json()

            // console.log(messages)
            setMessages(data)
            setLoading(false)

            socket.emit('join chat', selectedChat._id)
        } catch (error) {
            toast({
                title: "Error Occured",
                description: "Failed to Load messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position:'bottom'
            })
            return ;
        }
    }

    const sendMessage = async (event) => {
        if(event.key === 'Enter' && newMessage) {
            socket.emit('stop typing', selectedChat._id)
            try {
                // setLoading(true)
                setNewMessage('')
                const result = await fetch('http://localhost:5000/api/message/sendMessage', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "authToken": localStorage.getItem('token')
                    },

                    body: JSON.stringify({content: newMessage, chatId: selectedChat._id})
                })
                const data = await result.json()

                // console.log(data)
                socket.emit('new message', data)
                // setLoading(false)
                setMessages([...messages, data])
            } catch (error) {
                toast({
                    title: "Error Occured",
                    description: "Failed to send message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position:'bottom'
                })
                return ;
            }
        }
    }

    useEffect(() => {
        socket = io(ENDPOINT)
        socket.emit('setup', user)
        socket.on('connected', () => {setSocketConnected(true)})
        socket.on('typing', ()=> setIsTyping(true))
        socket.on('stop typing', ()=> setIsTyping(false))
    },[]) 
    
    useEffect(() => {
        fetchAllMessages();

        selectedChatCompare = selectedChat
    }, [selectedChat])

    

    useEffect(()=> {
        socket.on('message received', (newMessageReceived) => {
            if(!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
                //give notification
                if(!notification.includes(newMessageReceived)) {
                    setNotification([newMessageReceived, ...notification])
                    setFetchAgain(!fetchAgain)
                }
            }
            else {
                setMessages([...messages, newMessageReceived])
            }
        })
    })

    const typingHandler = (e) => {
        setNewMessage(e.target.value)

        if(!socketConnected) return ;

        if(!typing) {
            setTyping(true)
            socket.emit('typing', selectedChat._id)
        }

        let lastTypingTime = new Date().getTime()
        var timeLength = 3000

        setTimeout(()=> {
            var timeNow = new Date().getTime();
            var diff = timeNow - lastTypingTime

            if(diff >= timeLength && typing) {
                socket.emit('stop typing', selectedChat._id)
                setTyping(false)
            }
        }, timeLength)
    }

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        renderSettings: {
            preserveAspectRatio: 'XmidYmid slice' 
        }
    }
  return (
    <>
      {selectedChat ? (
        <>
            <Text
                fontSize={{ base: "28px", md: "30px"}}
                pb={3}
                px={2}
                w={"100%"}
                fontFamily={"Work sans"}
                display={"flex"}
                justifyContent={{base: "space-between"}}
                alignItems={"center"}
            >
                <IconButton
                    display={{ base: "flex", md: "none"}}
                    icon={<ArrowBackIcon />}
                    onClick={() => setSelectedChat("")}
                    />
                    {
                        selectedChat.isGroupChat ? (
                            <>
                            {selectedChat.chatName.toUpperCase()}
                            <UpdateGroupChatModel fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchAllMessages={fetchAllMessages} />
                            </>
                        ):(
                        <>
                            {getSender(user, selectedChat.users)}
                            <ProfileModel user={getSenderFull(user, selectedChat.users)} />
                        </>)
                    }
            </Text>
            <Box
                display={"flex"}
                flexDir={"column"}
                justifyContent={"flex-end"}
                p={3}
                bg={"#E8E8E8"}
                w={"100%"}
                h={"100%"}
                borderRadius={"lg"}
                overflowY={"hidden"}
            >
                {loading ? (
                    <>
                    <Spinner
                    size={"xl"}
                    w={20}
                    h={20}
                    alignSelf={'center'}
                    margin={"auto"} />
                    </>
                ): (
                    <>
                    <div className='messages'>
                        <ScrollableChat messages={messages} user={user}/>
                    </div>
                    </>
                )}
                <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                    {isTyping ? <div >
                        <Lottie
                        options={defaultOptions}
                        width={70}
                        style={{marginTop: 15, marginBottom: 15, marginLeft: 0}}
                        />
                        </div>:(<></>)}
                    <Input
                        variant={"filled"}
                        bg="#E0E0E0"
                        placeholder='Enter a message...'
                        value={newMessage}
                        onChange={typingHandler}
                    />
                </FormControl>
            </Box>
        </>
      ): (<>
        <Box display={"flex"} alignItems={"center"} justifyContent={"center"} h={"100%"}>
            <Text fontSize={"3xl"} pb={3} fontFamily={"Work sans"}>
                Click on a user to start chating
            </Text>
        </Box>
      </>)}
    </>
  )
}

export default SingleChat
