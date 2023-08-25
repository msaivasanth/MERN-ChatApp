import { Box, Button, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useContext, useState } from 'react'
import chatContext from '../context/chatContext'
import UserListItem from './UserListItem'
import UserBadgeItem from './UserBadgeItem'

const GroupChatModal = ({children}) => {
    const { isOpen, onOpen, onClose } = useDisclosure()

    const [groupChatName, setGroupChatName] = useState()
    const [selectedUsers, setSelectedUsers] = useState([])
    const [search, setSearch] = useState("")
    const [searchResult, setSearchResult] = useState([])
    const [loading, setLoading] = useState(false)
    const toast = useToast();
    const {user, chats, setChats} = useContext(chatContext)

    const handleSearch = async (query) => {
        setSearch(query)
        if(!query) return ;
        
        try {
            setLoading(true)
            // url = http://localhost:5000
            const result = await fetch(`http://localhost:5000/api/user/fetchUsers?search=${search}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "authToken": localStorage.getItem('token')
                }
            })

            const data = await result.json()
            setLoading(false)
            setSearchResult(data)
        } catch (error) {
            toast({
                title: 'Error Occur.',
                description: "Failed to load the search results",
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: "top-left"
              })
        }
    }

    const handleSubmit = async () => {
        if(!groupChatName || !selectedUsers) {
            toast({
                title: 'Please Fill all feilds.',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: "top-left"
            })
            return ;
        }

        try {
            const result = await fetch(`http://localhost:5000/api/chat/createGroupChat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authToken": localStorage.getItem('token')
                },

                body: JSON.stringify({name: groupChatName, users: JSON.stringify(selectedUsers.map((u) =>  u._id ))})
            })
            const data = await result.json()
            setChats([data, ...chats])
            onClose()
            toast({
                title: 'New Group Chat Created!.',
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: "bottom"
              })
        } catch (error) {
            
        }
    }

    const handleGroup = (userToAdd) => {
        if(selectedUsers.includes(userToAdd)) {
            toast({
                title: 'User already exists in group.',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: "top-left"
              })
              return ;
        }

        setSelectedUsers([...selectedUsers, userToAdd])
    }

    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sUser) => sUser._id !== delUser._id))
    }
    return (
        <>
          <Button onClick={onOpen}>{children}</Button>
    
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader
              fontSize={"35px"}
              fontFamily={"Work sans"}
              display={"flex"}
              justifyContent={"center"}
              >Create Group Chat</ModalHeader>
              <ModalCloseButton />
              <ModalBody display={"flex"} flexDir={"column"} alignItems={"center"}>
                <FormControl>
                    <Input placeholder='Chat name' mb={3}
                    onChange={(e) => setGroupChatName(e.target.value)}/>
                </FormControl>
                <FormControl>
                    <Input placeholder='Add users' mb={1}
                    onChange={(e) => handleSearch(e.target.value)}/>
                </FormControl>
                <FormControl >
                    <Box width={"100%"} display={"flex"} flexWrap={"wrap"}>
                        {selectedUsers.map(user => {
                            return <UserBadgeItem key={user._id} user={user} 
                            handleFunction={() => handleDelete(user)}/>
                        })}
                    </Box>
                    {loading ? <div>Loading</div>: (
                        searchResult.slice(0, 4).map((user) => {
                            return <UserListItem key={user._id} user={user} handleFunction={() => handleGroup(user)}/>
                        })
                    )}
                </FormControl>
              </ModalBody>
    
              <ModalFooter>
                <Button colorScheme='blue' mr={3} onClick={handleSubmit}>
                  Create Chat
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )
}

export default GroupChatModal
