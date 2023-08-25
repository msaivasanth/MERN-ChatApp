import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

const Login = () => {
    const [show, SetShow] = useState(false)

    const [email, SetEmail] = useState()
    const [password, SetPassword] = useState()
    let history = useHistory()
    const toast = useToast()

    const handleClick = ()=> SetShow(!show)
    const submitHandler = async (e)=> {
        e.preventDefault();
        if(!email || !password) {
          toast({
            title: 'Please Enter all values.',
            description: "Enter email and password",
            status: 'warning',
            duration: 5000,
            isClosable: true,
            position: "bottom"
          })
          return ;
        }
        const response = await fetch("http://localhost:5000/api/user/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
        
            body: JSON.stringify({email: email, password: password}), // body data type must match "Content-Type" header
          });
          const note = await response.json();
          if(note.success) {
            toast({
              title: 'Successfully logged in.',
              status: 'success',
              duration: 5000,
              isClosable: true,
              position: "bottom"
            })
            localStorage.setItem('token', note.authToken);
            // props.showAlert("Login Successfully", "success")
            history.push('/chatpage')
          }
          else {
            toast({
              title: 'Please Enter valid credentials.',
              description: "Enter correct email and password",
              status: 'warning',
              duration: 5000,
              isClosable: true,
              position: "bottom"
            })
            // props.showAlert("Wrong Credentials", "danger")
            console.log("Wrong Credentials")
          }
        //   setCredentials({email: "", password:""})
    }
  return (
    <div>
        <VStack spacing={'5px'}>
            <FormControl id='email' isRequired>
                <FormLabel required>Email</FormLabel>
                <Input placeholder='Enter your email' 
                value={email}
                onChange={(e) => SetEmail(e.target.value)}
                />
            </FormControl>
            
            <FormControl id='password' isRequired>
                <FormLabel required>Password</FormLabel>
                <InputGroup>
                    <Input 
                    type={show ? "text": "password"}
                    placeholder='Enter your password'
                    value={password}
                    onChange={(e) => SetPassword(e.target.value)} />
                    <InputRightElement width={'4.5rem'}>
                        <Button h={'1.75rem'} size={'sm'} onClick={handleClick}>
                            {show ? "Hide": "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <Button
                colorScheme='blue'
                width={"100%"}
                marginTop={"15px"}
                onClick={submitHandler}>
                    Submit
            </Button>
            <Button
                varient='solid'
                colorScheme='red'
                width={"100%"}
                marginTop={"15px"}
                onClick={() => {
                    SetEmail("guest@gmail.com")
                    SetPassword("12345")
                }}>
                    Get Guest User Credentials
            </Button>
        </VStack>
    </div>
  )
}

export default Login
