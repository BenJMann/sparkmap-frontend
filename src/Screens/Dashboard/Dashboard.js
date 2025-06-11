import { useEffect, useState, useContext } from "react"

import { useNavigate } from "react-router-dom";

import { WebsocketsContext } from "../../WebsocketsProvider"
import { LoginContext } from "../../LoginProvider";

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import RenameDialog from "./RenameDialog";
import DeleteDocumentDialog from "./DeleteDocumentDialog";
import NewDocumentDialog from "./NewDocumentDialog";
import UploadCSVDialog from "./UploadCSVDialog";

import DashboardTable from "./DashboardTable";
import LeftBar from "./LeftBar";
import DashboardMenu from "./DashboardMenu";


function Dashboard() {
    const navigate = useNavigate();

    const {socket, socketLoaded} = useContext(WebsocketsContext);
    const {loggedIn} = useContext(LoginContext);

    const [documentToEdit, setDocumentToEdit] = useState(null)

    const [documents, setDocuments] = useState([])
    const [showNewPopup, setShowNewPopup] = useState(false);
    const [showImportPopup, setShowImportPopup] = useState(false)
    const [showRenameDialog, setShowRenameDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const setRowActionDialog = (action, row) => {
    setDocumentToEdit(row);
    if (action === "Rename")
      setShowRenameDialog(true)
    else if (action === "Delete")
        setShowDeleteDialog(true);
  }

    const renameDocument = (documentId, newDocumentName) => {
        socket.emit('renameDocument', {documentId, newDocumentName})
    }

    const deleteDocument = (documentId) => {
        socket.emit('deleteDocument', {documentId})
    }
    
    const createNew = (documentName) => {
        socket.emit("newDocument", {name: documentName})
        setShowNewPopup(false);
    }

    const loadCSV = (documentName, nestedJSON) => {
        socket.emit("loadCSV", {name: documentName, json: JSON.stringify(nestedJSON)})
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
          <RenameDialog open={showRenameDialog} setOpen={setShowRenameDialog}
              documentId={documentToEdit?.documentId} 
              documentName={documentToEdit?.documentName}
              renameDocument={renameDocument}
              />
          <DeleteDocumentDialog open={showDeleteDialog} setOpen={setShowDeleteDialog} 
              documentId={documentToEdit?.documentId} 
              documentName={documentToEdit?.documentName} 
              deleteDocument={deleteDocument}/>
          <NewDocumentDialog open={showNewPopup} setOpen={setShowNewPopup} createNewDocument={createNew} />
          <UploadCSVDialog open={showImportPopup} setOpen={setShowImportPopup} loadCSV={loadCSV} />
          
          <Stack direction="row">
            <Box
              sx={{
                width: '300px',
                borderRight: '1px solid black',
              }}
            >
              <LeftBar />
            </Box>
            <Box sx={{
              width: '100%'
            }}>
              <DashboardMenu setShowNewPopup={setShowNewPopup} setShowImportPopup={setShowImportPopup}/>
              <DashboardTable documents={documents} setRowActionDialog={setRowActionDialog} />
            </Box>
          </Stack>
          {/* <div style={{display:'flex', flexDirection:'row'}}>
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
        </div> */}
        </>


    )
}

export default Dashboard