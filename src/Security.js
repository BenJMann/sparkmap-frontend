import { Navigate, Outlet } from 'react-router-dom'

export function PrivateRoute({ children, ...rest }) {
  
    const isAuth = sessionStorage.getItem("token")
    
    return isAuth ? <Outlet /> : <Navigate to="/login" />
  }