import { useEffect, useContext } from "react"
import { LoginContext } from "../LoginProvider";

const Logout = () => {

    const {logout} = useContext(LoginContext)
    useEffect(() => {
        logout();
    }, [])

    return <>Logging you out</>
}

export default Logout