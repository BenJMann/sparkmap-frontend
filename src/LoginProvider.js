import { Outlet } from "react-router-dom"
import { createContext, useState, useRef, useEffect, useMemo, useContext } from 'react'
import { ApiLogin } from "./api"

import { useNavigate, Navigate } from "react-router-dom"

import { WebsocketsContext } from "./WebsocketsProvider";

export const LoginContext = createContext(null)


const LoginProvider = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [sessionLoaded, setSessionLoaded] = useState(false);
    const {socket, socketLoaded} = useContext(WebsocketsContext)
    const [un, setUn] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (socketLoaded) {
            socket.removeAllListeners("loggedIn");
            socket.on("loggedIn", () => {
                navigate("/dashboard")
                setLoggedIn(true)
            })
            socket.removeAllListeners("loggedOut");
            socket.on("loggedOut", () => {
                navigate("/")
                setLoggedIn(false)
            })
            socket.removeAllListeners("sessionLoaded");
            socket.on("sessionLoaded", () => {
                setSessionLoaded(true);
            })
        }
    }, [socketLoaded])

    const loadSession = async() => {
        if (sessionStorage.getItem('token')) {
            setLoggedIn(true);
            socket.emit("loadSession", {token: sessionStorage.getItem("token").split(" ")[1]})
        }
    }

    useEffect(() => {
        if (socketLoaded) {
            loadSession();
            setUn(sessionStorage.getItem("username"))
        }
    }, [socketLoaded])


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

    const data = {
        loggedIn,
        login,
        logout,
        sessionLoaded,
        username: un
    }
    
    return <LoginContext.Provider value={data}><Outlet /></LoginContext.Provider>
}

export default LoginProvider