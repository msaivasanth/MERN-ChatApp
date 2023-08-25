import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import  { useHistory } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'

const SignUp = () => {
    const [show, setShow] = useState(false)

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [cpassword, setCpassword] = useState("")
    const [pic, setPic] = useState("")
    const [loading, setLoading] = useState(false)
    let history = useHistory();
    const toast = useToast()

    const handleClick = ()=> setShow(!show);

    const postDetails = (pics) => {
      setLoading(true)
      if(pics === undefined || pics === null) {
        toast({
          title: 'No image.',
          description: "The image you gave is not there.",
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: "bottom"
        })
        setLoading(false)
        return;
      }
      console.log(pics)
      if(pics.type === 'image/jpeg' || pics.type === 'image/png') {
        const data = new FormData()
        data.append('file', pics)
        data.append('upload_preset', 'chat-app')
        data.append('cloud_name', "detuevaxw")

        fetch('https://api.cloudinary.com/v1_1/detuevaxw/image/upload', {
          method: 'post',
          body: data,
        }).then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString())
          console.log("image", data.url.toString())
          setLoading(false)
        })
        .catch((error) => {
          console.log(error)
          setLoading(false)
        })
      }

      else {
        toast({
          title: 'Please Select an Image.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: "bottom"
        })
      }
    }

    const submitHandler = async () => {
      // let {name, email, password} = credentials
      if(!name || !email || !password || !cpassword || !pic) {
        toast({
          title: 'Please Enter all credentials.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: "bottom"
        })
        return ;
      }
      if(password !== cpassword) {
        toast({
          title: 'Incorrect confirm passowrd.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: "bottom"
        })
        return ;
      }
      const response = await fetch("https://chat-app-backend-black.vercel.app/api/user/createUser", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
      
          body: JSON.stringify({name, email, password, pic}), // body data type must match "Content-Type" header
          });
          const note = await response.json();
          console.log(pic)
          // console.log(note.authToken)
          // setCredentials({name:"", email: "", password: "", cpassword:""})
          setName(""); setEmail(""); setPassword(""); setCpassword(""); setPic("");
          if(note.success) {
            toast({
              title: 'Successfully signed in.',
              status: 'success',
              duration: 5000,
              isClosable: true,
              position: "bottom"
            })
            localStorage.setItem('token', note.authToken);
            history.push('/chatpage')
          //   props.showAlert("Signed in successfully", "success")
          }
          else {
            toast({
              title: 'Please Enter valid credentials.',
              status: 'warning',
              duration: 5000,
              isClosable: true,
              position: "bottom"
            })
          //   props.showAlert("Invalid Credentials", "danger")
          console.log("Invalid Credentials")
          }


          console.log(note);
    }
  return (
    <VStack spacing={'5px'}>
      <FormControl id='name' isRequired>
        <FormLabel required>Name</FormLabel>
        <Input placeholder='Enter your name' 
        onChange={(e) => setName(e.target.value)}/>
      </FormControl>

      <FormControl id='email' isRequired>
        <FormLabel required>Email</FormLabel>
        <Input placeholder='Enter your email' 
        onChange={(e) => setEmail(e.target.value)}/>
      </FormControl>
      
      <FormControl id='password' isRequired>
        <FormLabel required>Password</FormLabel>
        <InputGroup>
            <Input 
            type={show ? "text": "password"}
            placeholder='Enter your password'
            onChange={(e) => setPassword(e.target.value)} />
            <InputRightElement width={'4.5rem'}>
                <Button h={'1.75rem'} size={'sm'} onClick={handleClick}>
                    {show ? "Hide": "Show"}
                </Button>
            </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id='cpassword' isRequired>
        <FormLabel required>Confirm Password</FormLabel>
        <InputGroup>
            <Input 
            type={show ? "text": "password"}
            placeholder='Enter your confirm password'
            onChange={(e) => setCpassword(e.target.value)} />
            <InputRightElement width={'4.5rem'}>
                <Button h={'1.75rem'} size={'sm'} onClick={handleClick}>
                    {show ? "Hide": "Show"}
                </Button>
            </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id='pic' isRequired>
        <FormLabel required>Upload your picture</FormLabel>
        <Input type='file'
        p={1.5}
        accept='image/*' 
        onChange={(e) => postDetails(e.target.files[0])}/>
      </FormControl>

        <Button
            colorScheme='blue'
            width={"100%"}
            marginTop={"15px"}
            onClick={submitHandler}
            isLoading={loading}>
                Submit
            </Button>
    </VStack>
  )
}

export default SignUp
