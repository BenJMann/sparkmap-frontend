import { Outlet, Link } from "react-router-dom";
import { LoginContext } from "../LoginProvider";
import { useContext } from "react";

const Interface = () => {
    const {loggedIn} = useContext(LoginContext)

    return (
        <div>
            <div className="banner">
                {loggedIn ? 
                <Link to="/logout">Logout</Link>
                :
                <Link to="/login">Login</Link>}
            </div>
            <Outlet />
        </div>
    )
}

export default Interface