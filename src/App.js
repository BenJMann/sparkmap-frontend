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

// import '@fontsource/merriweather';
// import '@fontsource/playfair-display';
// import '@fontsource/cormorant-garamond';
// import '@fontsource/crimson-pro';
// import '@fontsource/lora';
import '@fontsource/roboto';
// import '@fontsource/open-sans';
// import '@fontsource/montserrat';
// import '@fontsource/poppins';
// import '@fontsource/lato';
// import '@fontsource/oswald';
// import '@fontsource/raleway';
// import '@fontsource/bebas-neue';
// import '@fontsource/abril-fatface';
// import '@fontsource/pacifico';
// import '@fontsource/source-code-pro';
// import '@fontsource/roboto-mono';
// import '@fontsource/fira-code';
// import '@fontsource/courier-prime';
// import '@fontsource/jetbrains-mono';
// import '@fontsource/dancing-script';
// import '@fontsource/patrick-hand';
// import '@fontsource/indie-flower';
// import '@fontsource/amatic-sc';
// import '@fontsource/shadows-into-light';

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
