import { Outlet } from "react-router-dom"
import { createContext, useState, useRef, useEffect, useMemo, useContext } from 'react'
import { ApiLogin } from "./api"

import { useNavigate, Navigate } from "react-router-dom"

import { WebsocketsContext } from "./WebsocketsProvider";

export const LoginContext = createContext(null)


const LoginProvider = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const {socket, socketLoaded, setSocketDisconnected, socketDisconnected} = useContext(WebsocketsContext)
    const [un, setUn] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (socketLoaded) {
            socket.removeAllListeners("disconnect")
            socket.on("disconnect", () => {
                setSocketDisconnected(true)
            })
            socket.removeAllListeners("loggedIn");
            socket.on("loggedIn", (reload) => {
                if (!reload)
                    navigate("/dashboard")
                setLoggedIn(true)
            })
            socket.removeAllListeners("loggedOut");
            socket.on("loggedOut", () => {
                navigate("/")
                setLoggedIn(false)
            })
            socket.removeAllListeners("recovered")
            socket.on("recovered", () => {
                if (sessionStorage.getItem('token')) {
                    const token = sessionStorage.getItem('token')
                    socket.emit("recoveredLogin", {token: token.split("BEARER ")[1]})
                }
            })
            socket.removeAllListeners("recoveredLoggedIn")
            socket.on("recoveredLoggedIn", () => {
                setSocketDisconnected(false);
            })
        }
    }, [socketLoaded, socketDisconnected])


    const login = async (username, password) => {
        const result = await ApiLogin({username, password})
        if (result.status === "fail") {
            return {error: true, message: result.message}
        }
        if (result.status === "success") {
            sessionStorage.setItem("token", "BEARER "+result.data.accessToken)
            sessionStorage.setItem("username", username)
            setUn(username)
            socket.emit("login", {token: result.data.accessToken})
        }
    }
    const logout = () => {
            sessionStorage.removeItem("token");
            socket.emit("logOut")
    }

    useEffect(() => {
        if (socketLoaded && !loggedIn && sessionStorage.getItem('token')) {
            socket.emit("login", {reload: true, token: sessionStorage.getItem('token').split(" ")[1]})
            const username = sessionStorage.getItem('username')
            setUn(username)
        }
    }, [socketLoaded, loggedIn])

    const data = {
        loggedIn,
        login,
        logout,
        username: un
    }
    
    return <LoginContext.Provider value={data}><Outlet /></LoginContext.Provider>
}

export default LoginProvider