import './App.css'

import socketIOClient from "socket.io-client"

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute } from './Security.js';

import Login from "./Screens/Login.js"
import Logout from './Screens/Logout.js';
import Dashboard from "./Screens/Dashboard.js"
import Home from './Screens/Home.js';
import Interface from './Screens/Interface.js';
import Document from './Screens/Document/Document.js';

import WebsocketsProvider from './WebsocketsProvider.js';
import LoginProvider from './LoginProvider.js';

function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<WebsocketsProvider />}>
        <Route path="/" element={<LoginProvider />}>
          <Route path="/" element={<Interface />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route exact path="/logout" element={<PrivateRoute />} >
              <Route exact path="/logout" element={<Logout/>} />
            </Route>
            <Route exact path="/dashboard" element={<PrivateRoute />} >
              <Route exact path="/dashboard" element={<Dashboard/>} />
            </Route>
          </Route>

          <Route exact path="/document/:documentId" element={<PrivateRoute />} >
              <Route exact path="/document/:documentId" element={<Document/>} />
            </Route>

        </Route>
       
      </Route>

    </Routes>
    </BrowserRouter>

    
  );
}

export default App;
