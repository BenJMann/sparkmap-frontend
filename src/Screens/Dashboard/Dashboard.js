import { useEffect, useState, useContext } from "react"

import { useNavigate } from "react-router-dom";

import { WebsocketsContext } from "../../WebsocketsProvider"

import { LoginContext } from "../../LoginProvider";

import CSVReader from "../CSVReader";

import RenameDialog from "../RenameDialog";
import DeleteDocumentDialog from "./DeleteDocumentDialog";
import DashboardTable from "./DashboardTable";


function Dashboard() {
    const [documents, setDocuments] = useState([])
    const [showNewPopup, setShowNewPopup] = useState(false);
    const [showImportPopup, setShowImportPopup] = useState(false)
    const [showRenameDialog, setShowRenameDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)


    const [documentName, setDocumentName] = useState("");


    const [nestedJSON, setNestedJSON] = useState(null)

    const setRowActionDialog = (action, row) => {
    setDocumentToEdit(row);
    if (action === "Rename")
      setShowRenameDialog(true)
    else if (action === "Delete")
        setShowDeleteDialog(true);
  }

    const navigate = useNavigate();

    const {socket, socketLoaded} = useContext(WebsocketsContext);
    const {loggedIn} = useContext(LoginContext);

    const [documentToEdit, setDocumentToEdit] = useState(null)

    const renameDocument = (documentId, newDocumentName) => {
        socket.emit('renameDocument', {documentId, newDocumentName})
    }

    const deleteDocument = (documentId) => {
        socket.emit('deleteDocument', {documentId})
    }


    const createNew = () => {
        socket.emit("newDocument", {name: documentName})
        setShowNewPopup(false);
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
        {showRenameDialog && 
        <RenameDialog open={showRenameDialog} setOpen={setShowRenameDialog}
            documentId={documentToEdit.documentId} documentName={documentToEdit.documentName}
            renameDocument={renameDocument}
            />}
        {showDeleteDialog &&
        <DeleteDocumentDialog open={showDeleteDialog} setOpen={setShowDeleteDialog} 
            documentId={documentToEdit.documentId} documentName={documentToEdit.documentName} 
            deleteDocument={deleteDocument}/>}
        {showNewPopup && <div className="popup">
            <div style={{display: 'flex', 'flexDirection': 'column', justifyContent: 'center', alignItems: 'center'}}>
            <h4>Document Name</h4>
            <input value={documentName} onChange={(e) => {setDocumentName(e.target.value)}} type="text" style={{width: '300px'}} />
            <div style={{display: 'flex', flexDirection: 'row', marginTop: '10px'}}>
            <button onClick={() => setShowNewPopup(false)}>Cancel</button>
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
            <div className="documents" style={{width: '80%'}}>
                <div className="documentsHeader">
                    <h3>Documents</h3>
                </div>
                <DashboardTable documents={documents} setRowActionDialog={setRowActionDialog} />
                <button onClick={() => setShowNewPopup(true)} >New</button>
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