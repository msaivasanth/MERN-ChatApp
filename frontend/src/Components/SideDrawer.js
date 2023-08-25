import { Avatar, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Spinner, Text, Tooltip, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useContext, useState } from 'react'
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons'
import ProfileModel from './ProfileModel'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import ChatLoading from './ChatLoading'
import UserListItem from './UserListItem'
import chatContext from '../context/chatContext'
import { getSender } from '../config/ChatLogics'
import { Effect } from 'react-notification-badge'
import NotificationBadge from 'react-notification-badge'
const SideDrawer = () => {
    const [search, setSearch] = useState("")
    const [searchResult, setSearchResult] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingChat, setLoadingChat] = useState(false)
    let history = useHistory()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()

    const {user, setSelectedChat, chats, setChats, notification, setNotification} = useContext(chatContext)
    const logoutHandler = () => {
        localStorage.removeItem('token')
        history.push('/')
    }

    const handleSearch = async () => {
        setLoading(true)
        if(!search) {
            toast({
                title: 'Enter something to search.',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: "top-left"
              })
              setLoading(false)
              return ;
        }

        try {
            const result = await fetch(`https://talk-a-tive-je3r.onrender.com/api/user/fetchUsers?search=${search}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "authToken": localStorage.getItem('token')
                }
            })
            const data = await result.json()
            
            setLoading(false)
            console.log(data)
            setSearchResult(data)

        } catch (error) {
            toast({
                title: 'Error Occur.',
                description: "Failed to fetch users",
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: "top-left"
              })
              setLoading(false)
        }
    }

    const accessChat = async (userId) => {
        try {
            setLoadingChat(true)
            const result = await fetch(`https://talk-a-tive-je3r.onrender.com/api/chat/accessChat/${userId}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "authToken": localStorage.getItem('token')
                }
            })
            const data = await result.json()

            if(!chats.find((c) =>  c._id === data._id)) setChats([data, ...chats])

            setSelectedChat(data)
            setLoadingChat(false)
            onClose()
        } catch (error) {
            toast({
                title: 'Error fetching the detials.',
                description: error.message,
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: "top-left"
              })
              setLoading(false)
        }
    }
  return (
    <div>
        <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            w={"100%"}
            p={"5px 10px 5px 10px"}
            borderWidth={"5px"}
        >
            <Tooltip label="search users to chat" hasArrow placement='bottom-end'>
                <Button variant={"ghost"}onClick={onOpen} >
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <Text display={{base:"none", md:"flex"}} px={4} >
                        Search User
                    </Text>
                </Button>
            </Tooltip>

            <Text fontSize={"2xl"} fontFamily={"Work sans"}>
                Talk-A-Tive
            </Text>

            <div>
                <Menu>
                    <MenuButton p={1}>
                        <NotificationBadge 
                        count={notification.length}
                        effect={Effect.SCALE}
                        />
                       <BellIcon fontSize={"2xl"} m={1}/>
                    </MenuButton>
                    <MenuList pl={2}>
                        {!notification.length && "No new messages"}
                        {notification.map((notif)=> {
                            return <MenuItem key={notif._id} onClick={() => {
                                setSelectedChat(notif.chat)
                                setNotification(notification.filter((n) => n !== notif))
                            }}>
                                {notif.chat.isGroupChat ? `New message in ${notif.chat.chatName}`: `New message from ${getSender(user, notif.chat.users)}`}
                            </MenuItem>
                        })}
                    </MenuList>
                </Menu>
                <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                        <Avatar size={"sm"} cursor={"pointer"} name={user.name} src={user.pic}/>
                    </MenuButton>
                    <MenuList>
                        <ProfileModel user={user}>
                            <MenuItem>My Profile</MenuItem>
                        </ProfileModel>
                        <MenuDivider />
                        <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                    </MenuList>
                </Menu>
            </div>
        </Box>

        <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
            <DrawerOverlay />
            <DrawerContent>
                <DrawerHeader borderBottomWidth={"1px"}> Search Users </DrawerHeader>
                <DrawerBody>
                    <Box display={"flex"} pb={2}>
                        <Input
                            placeholder='Search using name or email'
                            mr={2}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)} />
                        <Button 
                        onClick={handleSearch}
                        >Go</Button>
                    </Box>
                    {loading ?( <ChatLoading /> ): (
                        searchResult.map((user) => {
                            return <UserListItem key={user._id}
                            user={user} handleFunction = {() => accessChat(user._id)}
                            />
                        })
                    )}
                    {loadingChat && <Spinner ml={"auto"} display={"flex"} /> }
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    </div>
  )
}

export default SideDrawer
