import { ViewIcon } from '@chakra-ui/icons'
import { Button, IconButton, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from '@chakra-ui/react'
import React from 'react'

const ProfileModel = ({ user, children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (
        <div>
            {children ? (<span onClick={onOpen}>{children}</span>) : (
                <IconButton display={{ base: "flex" }} onClick={onOpen} icon={<ViewIcon />} />
            )}

            <Modal size={"lg"} isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                     display={"flex"}
                     justifyContent={"center"}
                     fontFamily={"Work sans"}
                     fontSize={"30px"}
                    >
                        {user.name}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody
                    display={"flex"}
                    flexDir={"column"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    >
                        <Image
                            borderRadius={"full"}
                            boxSize="150px"
                            src={user.pic}
                            alt={user.name}
                        />
                        <Text fontFamily={"Work sans"} fontSize={{base:"28px", md: "30px"}}>
                            Email: {user.email}
                        </Text>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    )
}

export default ProfileModel
