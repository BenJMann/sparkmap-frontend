import { useState, useContext, useEffect } from "react"
import { WebsocketsContext } from "../WebsocketsProvider"

const SharePopup = ({show, onHide, documentId}) => {
    const [username, setUsername] = useState('')
    const {socket, socketLoaded} = useContext(WebsocketsContext);
    const [errorText, setErrorText] = useState('')
    const share = () => {
        setErrorText('')
        socket.emit("shareDocument", {username})
    }

    useEffect(() => {
        if (socketLoaded) {
            socket.removeAllListeners("documentShared")
            socket.on("documentShared", (data) => {
                if (data.error) setErrorText(data.message)
                else {
                    onHide();
                }
            })
        }
    }, [socketLoaded])

    useEffect(() => {
        setErrorText('');
        setUsername('')
    }, [show])

    if (!show) return null;

    return (
        <div className="popup">
        <div style={{display: 'flex', 'flexDirection': 'column', justifyContent: 'center', alignItems: 'center'}}>
        <h4>Share</h4>
        <label htmlFor="with">Username:</label>
        <input id="with" value={username} onChange={(e) => {setUsername(e.target.value)}} type="text" style={{width: '300px'}} />
        <div style={{display: 'flex', flexDirection: 'row', marginTop: '10px'}}>
        <button onClick={onHide}>Cancel</button>
        <button onClick={share}>Confirm</button>
        </div>
        <div className="errorText">{errorText}</div>
        </div>
    </div>
    )
}

export default SharePopup