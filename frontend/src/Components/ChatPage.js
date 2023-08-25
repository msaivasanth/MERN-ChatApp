import React, { useContext, useEffect, useState } from 'react'
import chatContext from '../context/chatContext';
import { useHistory } from 'react-router-dom'
import { Box } from '@chakra-ui/react';
import SideDrawer from './SideDrawer';
import MyChats from './MyChats';
import ChatBox from './ChatBox';
const ChatPage = () => {
  const {user, getUserDetails  } = useContext(chatContext)
  let history = useHistory();
  const [fetchAgain, setFetchAgain] = useState(false)

  useEffect(() => {
    if(localStorage.getItem('token')){
        getUserDetails();
        //eslint-disable-next-line
    }
    else {
        history.push('/')
    }
    //eslint-disable-next-line
  }, [history])
  return (
    <div style={{width: "100%"}}>
      {user && <SideDrawer  />}
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        w={"100%"}
        h={"91.5vh"}
        p={"10px"}
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
      </Box>
      {/* This is the chat page of {user.name + " " + user.email} */}
    </div>
  )
}

export default ChatPage
