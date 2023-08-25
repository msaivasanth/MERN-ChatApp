import './App.css';
import { ChakraProvider } from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import ChatPage from './Components/ChatPage';
import Home from './Components/Home';
import ChatState from './context/ChatState';

function App() {
  return (
    <div className='App'>
      <ChatState>
        <Router>
        <ChakraProvider>
            <Switch>
              <Route exact path="/">
                <Home />
              </Route>
              <Route exact path="/chatpage">
                <ChatPage />
              </Route>
              </Switch>
        </ChakraProvider>
        </Router>
      </ChatState>
    </div>
  );
}

export default App;
