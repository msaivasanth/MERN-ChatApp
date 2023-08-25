import React, { useContext, useEffect, useState } from 'react'
import chatContext from '../context/chatContext'
import { Box, Button, Stack, Text, useToast } from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
import ChatLoading from './ChatLoading'
import { getSender } from '../config/ChatLogics'
import GroupChatModal from './GroupChatModal'
const MyChats = ({fetchAgain}) => {
  const {user, getUserDetails, selectedChat, setSelectedChat, chats, setChats, loggedUser, setLoggedUser } = useContext(chatContext)
  const toast = useToast()

  
  const fetchChats = async () => {
    try {
      const result = await fetch(`http://localhost:5000/api/chat/fetchChats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "authToken": localStorage.getItem('token')
        }
      })
      const data = await result.json()
      setChats(data)
      // console.log(data)
    } catch (error) {
      toast({
        title: 'Enter Occured.',
        description: "Failed to search chats",
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: "top-left"
      })
    }
  }

  useEffect(() => {
    setLoggedUser(user)
    fetchChats()
    // eslint-disable-next-line
  }, [fetchAgain])

  return (
    
      <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      h={"100%"}
      borderRadius="lg"
      borderWidth="1px">
        <Box pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        alignItems="center"
        justifyContent="space-between"
        >
           My Chats
          <GroupChatModal>
              <Button display={"flex"}
                fontSize={{ base: "17px", md: "10px", lg: "17px" }}
                rightIcon={<AddIcon />}>
                  New Group Chat
                </Button>
          </GroupChatModal>
        </Box>

        <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
        > 
          {chats ? (
            <Stack overflowY={"scroll"}>
              {chats.map((chat) => {
                return <Box
                 onClick={() => setSelectedChat(chat)}
                 cursor="pointer"
                 bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                 color={selectedChat === chat ? "black" : "black"}
                 px={3}
                 py={2}
                 borderRadius="lg"
                 key={chat._id}
               >
                 <Text>
                  {!chat.isGroupChat
                    ? getSender(user, chat.users)
                    : chat.chatName}
                </Text>
               </Box>
              })}
            </Stack>
          ): 
          ( <ChatLoading />)}

        </Box>
      </Box>
    
  )
}

export default MyChats
