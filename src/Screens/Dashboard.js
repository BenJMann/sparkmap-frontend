import { useEffect, useState, useContext } from "react"

import { useNavigate } from "react-router-dom";

import { WebsocketsContext } from "../WebsocketsProvider"

import { LoginContext } from "../LoginProvider";

import CSVReader from "./CSVReader";

function Dashboard() {
    const [documents, setDocuments] = useState([])
    const [showPopup, setShowPopup] = useState(false);
    const [documentName, setDocumentName] = useState("");

    const [showImportPopup, setShowImportPopup] = useState(false)

    const [delimeter, setDelemiter] = useState(",")

    const [nestedJSON, setNestedJSON] = useState(null)


    const navigate = useNavigate();

    const {socket, socketLoaded} = useContext(WebsocketsContext);
    const {loggedIn} = useContext(LoginContext);
    const createNew = () => {
        socket.emit("newDocument", {name: documentName})
        setShowPopup(false);
    }

    const loadCSV = () => {
        socket.emit("loadCSV", {name: documentName, json: JSON.stringify(nestedJSON)})
    }

    function gridToNestedJSON(grid) {
        const root = [];
        const stack = [{ level: -1, children: root }];
      
        for (const row of grid) {
          // Find the first non-empty cell and its level
          const level = row.findIndex(cell => cell !== undefined && cell !== null && cell !== '');
          if (level === -1) continue;
      
          const node = { text: row[level], children: [] };
      
          // Find the appropriate parent based on the current level
          while (stack.length > 0 && stack[stack.length - 1].level >= level) {
            stack.pop();
          }
      
          // Add the node to the parent's children
          stack[stack.length - 1].children.push(node);
      
          // Push the current node onto the stack
          stack.push({ level, children: node.children });
        }
      
        setNestedJSON(root)
      }

    useEffect(() => {
        if (socketLoaded  && loggedIn) {
            socket.emit("getDocuments");
            socket.removeAllListeners("documentCreated");
            socket.on("documentCreated", (data) => {
                navigate('/document/'+data.documentId)
            })
            socket.removeAllListeners("csvLoaded");
            socket.on("csvLoaded", (data) => {
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

        {showImportPopup && <div className="popup2">
            <div style={{display: 'flex', 'flexDirection': 'column', justifyContent: 'center', alignItems: 'center'}}>
            <h4>CSV File</h4>
            <CSVReader callback={gridToNestedJSON}/>
            <h4>New Document Name To create:</h4>
            <input value={documentName} onChange={(e) => {setDocumentName(e.target.value)}} type="text" style={{width: '300px'}} />
            <div style={{display: 'flex', flexDirection: 'row', marginTop: '10px'}}>
            <button onClick={() => setShowImportPopup(false)}>Cancel</button>
            <button onClick={loadCSV}>Confirm</button>
            </div>
   
            </div>

        </div>}
                <div style={{display:'flex', flexDirection:'row'}}>
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
            <div>
                <div style={{padding: 100}}>
                    <button onClick={() => setShowImportPopup(true)}>
                        Upload from CSV
                    </button>
                </div>
            </div>
        </div>
        </>


    )
}

export default Dashboard