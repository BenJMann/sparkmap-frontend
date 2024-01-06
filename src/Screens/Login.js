import { useState, useEffect, useContext } from "react"

import { useNavigate, Navigate } from "react-router-dom"

import { LoginContext } from "../LoginProvider"

function Login({setLoggedIn}) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const [errorText, setErrorText] = useState("")

    const {loggedIn, login} = useContext(LoginContext)

    const navigate = useNavigate();

    const handleLogin = async () => {
        setErrorText("")
        const result = login(username, password);
        if (result?.error) setErrorText(result.message)
    }

    if (sessionStorage.getItem("token")) return <Navigate to="/dashboard" />

    return (
        <div className="center-screen">
            <div className="login-box">
                <h1 className="login-header">Login</h1>

                <div className="login-content">
                    <div style={{marginBottom: '50px'}}>
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div style={{marginBottom: '50px'}}>
                    <label htmlFor="password" >Password</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>

                    <button onClick={handleLogin}>Submit</button>

                    <div style={{marginTop: '100px', color: 'red'}}>
                        {errorText}
                    </div>
   
                </div>
            </div>
        </div>
    )
}

export default Login