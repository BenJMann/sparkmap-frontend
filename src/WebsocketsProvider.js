import { createContext, useState, useRef, useEffect, useMemo } from 'react'
import socketIOClient from "socket.io-client";
import { Outlet } from 'react-router-dom';

export const WebsocketsContext = createContext(null)

const WebsocketsProvider = () => {
    const socket = useRef(null);
    const [socketSet, setSocketSet] = useState(false)

    useEffect(() => {
        if (!socketSet) {
            socket.current = socketIOClient(process.env.REACT_APP_API, {transports: ['websocket']});
            setSocketSet(true)
        }
    }, []);

    const data = {
        socket: socket.current,
        socketLoaded: socketSet
    }
    
    return <WebsocketsContext.Provider value={data}><Outlet /></WebsocketsContext.Provider>
}

export default WebsocketsProvider