import React from 'react'
import { Box, Container, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react' 
import Login from './Login'
import SignUp from './SignUp'
const Home = () => {
  return (
    <Container maxW="xl" centerContent>
      <Box display="flex"
        justifyContent="center"
        p={3} 
        bg={"black"} 
        w={"100%"} 
        m="40px 0 15px 0" 
        borderRadius="lg" 
        borderWidth="1px"
        >
        <Text fontSize={'4xl'} fontFamily={'Work sans'} color={"white"} >Talk-A-Tive</Text>
      </Box>
      <Box bg={'black'} w={'100%'} p={4} borderRadius="lg" borderWidth="1px">
        <Tabs color={"white"} variant='soft-rounded' >
            <TabList>
                <Tab width={"50%"}>Login</Tab>
                <Tab width={"50%"}>Sign Up</Tab>
            </TabList>
            <TabPanels>
                <TabPanel> <Login/> </TabPanel>
                <TabPanel> <SignUp/> </TabPanel>
            </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
}

export default Home
