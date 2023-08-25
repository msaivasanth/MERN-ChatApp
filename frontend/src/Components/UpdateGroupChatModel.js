import { ViewIcon } from '@chakra-ui/icons'
import { Box, Button, FormControl, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useContext, useState } from 'react'
import chatContext from '../context/chatContext'
import UserBadgeItem from './UserBadgeItem'
import UserListItem from './UserListItem'

const UpdateGroupChatModel = ({ fetchAgain, setFetchAgain, fetchAllMessages }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { user, selectedChat, setSelectedChat } = useContext(chatContext)

    const [groupChatName, setGroupChatName] = useState("")
    const [search, setSearch] = useState()
    const [searchResult, setSearchResult] = useState()
    const [loading, setLoading] = useState(false)
    const [renameLoading, setRenameLoading] = useState(false)
    const toast = useToast()

    
    const handleAddUser = async (user1) => {
        console.log(selectedChat)
        console.log(user.name)
        if(selectedChat.users.find((u) => u._id === user1._id)) {
            toast({
                title: 'User already exists in group.',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: "top-left"
            })
              return ;
        }
            
        if(selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: 'Only admins can add someone!',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: "bottom"
          })
          return ;
        }
        
        try {
            setLoading(true)
            const result = await fetch('https://talk-a-tive-je3r.onrender.com/api/chat/addToGroup', {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "authToken": localStorage.getItem('token')
                },
                
                body: JSON.stringify({chatId: selectedChat._id, userId: user1._id})
            })
            
            const data = await result.json()
            
            setSelectedChat(data)
            setFetchAgain(!fetchAgain)
            setLoading(false)
        } catch (error) {
            toast({
                title: 'Error occured.',
                description: error.response.data.message,
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            setRenameLoading(false)
        }
    }

    const handleRemove = async (user1) => {
        if(selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) { 
            toast({
                title: 'Only admins can remove someone.',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: "bottom"
              })
              setRenameLoading(false)
              return ;
        }

        try {
            setLoading(true)
            const result = await fetch('https://talk-a-tive-je3r.onrender.com/api/chat/removeFromGroup', {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "authToken": localStorage.getItem('token')
                },
                body: JSON.stringify({chatId: selectedChat._id, userId: user1._id})
            })

            const data = await result.json()

            user1._id === user._id ? setSelectedChat(): setSelectedChat(data)
            fetchAllMessages()
            setFetchAgain(!fetchAgain)
            setLoading(false)
        } 
        catch (error) {
            console.log(error.message)
        }
    }


    const handleRename = async () => {
        if(!groupChatName) return;

        try {
            setRenameLoading(true)
            const result = await fetch('https://talk-a-tive-je3r.onrender.com/api/chat/renameGroupChat', {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "authToken": localStorage.getItem('token')
                },
                body: JSON.stringify({chatId: selectedChat._id, chatName: groupChatName})
            })

            const data = await result.json()
            // console.log(data)
            setSelectedChat(data)
            setFetchAgain(!fetchAgain)
            setRenameLoading(false)
        } catch (error) {
            toast({
                title: 'Error occured.',
                description: error.response.data.message,
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: "bottom"
              })
              setRenameLoading(false)
        }

        setGroupChatName("")
    }

    const handleSearch = async (query) => {
        setSearch(query)
        if(!query) return ;
        
        try {
            setLoading(true)
            const result = await fetch(`https://talk-a-tive-je3r.onrender.com/api/user/fetchUsers?search=${search}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "authToken": localStorage.getItem('token')
                }
            })

            const data = await result.json()
            setSearchResult(data)
            setLoading(false)
        } catch (error) {
            toast({
                title: 'Error Occur.',
                description: "Failed to load the search results",
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: "top-left"
              })
              setLoading(false)
        }
    }
    return (
        <>
            <IconButton onClick={onOpen} icon={<ViewIcon />} />

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontFamily={"Work sans"}
                        fontSize={"35px"}
                        display={"flex"}
                        justifyContent={"center"}
                    >{selectedChat.chatName}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display={"flex"} flexDir={"column"} alignItems={"center"}>
                        <Box width={"100%"} display={"flex"} flexWrap={"wrap"} pb={3}>
                            {selectedChat.users.map((u) => {
                                return <UserBadgeItem key={u._id} user={u}
                                    handleFunction={() => handleRemove(u)} />
                            })
                            }
                        </Box>

                        <FormControl display="flex">
                            <Input
                                placeholder="Chat Name"
                                mb={3}
                                value={groupChatName}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                            <Button
                                variant="solid"
                                colorScheme="teal"
                                ml={1}
                                isLoading={renameLoading}
                                onClick={handleRename}
                            >
                                Update
                            </Button>
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder="Add User to group"
                                mb={1}
                                onChange={(e) => handleSearch(e.target.value)}
                                />
                                {loading? (<Spinner size={"lg"}/>) : (
                                    searchResult?.map((user) => {
                                        return <UserListItem
                                        key={user._id}
                                        user={user}
                                        handleFunction={() => handleAddUser(user)} />
                                    })
                                ) }
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='red' mr={3} onClick={() => handleRemove(user)}>
                            Leave Group
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default UpdateGroupChatModel
