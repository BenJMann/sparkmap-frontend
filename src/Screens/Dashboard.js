import { useEffect, useState, useContext } from "react"

import { useNavigate } from "react-router-dom";

import { WebsocketsContext } from "../WebsocketsProvider"

import { LoginContext } from "../LoginProvider";

function Dashboard() {
    const [documents, setDocuments] = useState([])
    const [showPopup, setShowPopup] = useState(false);
    const [documentName, setDocumentName] = useState("");

    const navigate = useNavigate();

    const {socket, socketLoaded} = useContext(WebsocketsContext);
    const {loggedIn} = useContext(LoginContext);
    const createNew = () => {
        socket.emit("newDocument", {name: documentName})
        setShowPopup(false);
    }

    useEffect(() => {
        if (socketLoaded  && loggedIn) {
            socket.emit("getDocuments");
            socket.removeAllListeners("documentCreated");
            socket.on("documentCreated", (data) => {
                navigate('/document/'+data.documentId)
            })
            socket.on("documentsGot", (data) => {
                setDocuments(data);
            })
        }
    }, [socketLoaded, loggedIn])
    return (
        <>
        {showPopup && <div className="popup">
            <div style={{display: 'flex', 'flexDirection': 'column', justifyContent: 'center', alignItems: 'center'}}>
            <h4>Document Name</h4>
            <input value={documentName} onChange={(e) => {setDocumentName(e.target.value)}} type="text" style={{width: '300px'}} />
            <div style={{display: 'flex', flexDirection: 'row', marginTop: '10px'}}>
            <button onClick={() => setShowPopup(false)}>Cancel</button>
            <button onClick={createNew}>Confirm</button>
            </div>
   
            </div>

        </div>}
                <div className="center-screen">
            <div className="documents">
                <div className="documentsHeader">
                    <h3>Documents</h3>
                </div>
                <div className="documentsList">
                    {documents.map((d) =>
                        <div className="documentRow" onClick={() => {navigate('/document/'+d.documentId)}}>
                            <div className="name">{d.documentName}</div>
                            <div className="lastEdited">{d.lastModified}</div>
                        </div>
                    )}
                </div>
                <button onClick={() => setShowPopup(true)} >New</button>
            </div>
        </div>
        </>


    )
}

export default Dashboard