import { Outlet, Link } from "react-router-dom";
import Header from './Header'
import Footer from './Footer'

function Interface() {
  return (
    <>
        <Header />
        <Outlet />
        <Footer />
    </>
  );
}
export default Interface;