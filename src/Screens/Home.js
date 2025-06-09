import {Link} from 'react-router-dom'

import Banner from "../Images/Banner.png"

function Home() {
    return (
        <div>
            <span>Home</span>
            <img src={Banner} />
        </div>
    )
}

export default Home