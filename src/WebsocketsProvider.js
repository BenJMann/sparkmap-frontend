import { createContext, useState, useRef, useEffect, useMemo } from 'react'
import socketIOClient from "socket.io-client";
import { Outlet } from 'react-router-dom';

export const WebsocketsContext = createContext(null)

const wsURL = process.env.REACT_APP_API.slice(-1) === '/' ? process.env.REACT_APP_API.slice(0, -1) : process.env.REACT_APP_API

const WebsocketsProvider = () => {
    const socket = useRef(null);
    const [socketLoaded, setSocketLoaded] = useState(false)
    const [socketDisconnected, setSocketDisconnected] = useState(false)

    useEffect(() => {
        if (!socketLoaded) {
            socket.current = socketIOClient(wsURL, {transports: ['websocket']});
            setSocketLoaded(true)
        }
    }, []);

    const data = {
        socket: socket.current,
        socketLoaded,
        socketDisconnected,
        setSocketDisconnected
    }
    
    return <WebsocketsContext.Provider value={data}><Outlet /></WebsocketsContext.Provider>
}

export default WebsocketsProvider