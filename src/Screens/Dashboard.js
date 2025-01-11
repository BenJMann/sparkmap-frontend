import { useEffect, useState, useContext } from "react"

import { useNavigate } from "react-router-dom";

import { WebsocketsContext } from "../WebsocketsProvider"

import { LoginContext } from "../LoginProvider";

import CSVReader from "./CSVReader";

import { Link } from "@mui/material";

import { DataGrid, GridActionsCellItem, GRID_STRING_COL_DEF } from '@mui/x-data-grid';

import { IconButton } from "@mui/material"
import { MoreVert } from "@mui/icons-material";

import Popover from "@mui/material/Popover";

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import RenameDialog from "./RenameDialog";
import DeleteDocumentDialog from "./DeleteDocumentDialog";

function DocumentPopover({row, setDocumentToEdit, setRenameDialogOpen, setDeleteDialogOpen}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRename = () => {
    setDocumentToEdit(row)
    setRenameDialogOpen(true)
    handleClose()
  }

  const handleDelete = () => {
    setDocumentToEdit(row)
    setDeleteDialogOpen(true);
    handleClose();
  }

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <IconButton style={{display: 'flex', flexDirection: 'row'}} aria-describedby={id} variant="contained" onClick={handleClick}>
      <MoreVert />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <List
        >
            <ListItem>
                <ListItemButton>
                    <ListItemText primary="Rename" onClick={handleRename} />
                </ListItemButton>
            </ListItem>
            <ListItem>
                <ListItemButton>
                    <ListItemText primary="Delete" onClick={handleDelete} />
                </ListItemButton>
            </ListItem>
        </List>
      </Popover>
    </div>
  );
}


function Dashboard() {
    const [documents, setDocuments] = useState([])
    const [showPopup, setShowPopup] = useState(false);
    const [documentName, setDocumentName] = useState("");

    const [showImportPopup, setShowImportPopup] = useState(false)

    const [nestedJSON, setNestedJSON] = useState(null)


    const navigate = useNavigate();

    const {socket, socketLoaded} = useContext(WebsocketsContext);
    const {loggedIn} = useContext(LoginContext);

    const [documentToEdit, setDocumentToEdit] = useState(null)
    const [renameDialogOpen, setRenameDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const renameDocument = (documentId, newDocumentName) => {
        socket.emit('renameDocument', {documentId, newDocumentName})
    }

    const deleteDocument = (documentId) => {
        socket.emit('deleteDocument', {documentId})
    }

    const LinkCell = (props) => {
        return (
            <Link href={`/document/${props.row.documentId}`}>{props.value}</Link>
        )
    }
    
    const ActionsCell = (props) => {
        return (
            <DocumentPopover {...props} setDocumentToEdit={setDocumentToEdit} setRenameDialogOpen={setRenameDialogOpen} 
            setDeleteDialogOpen={setDeleteDialogOpen}/>
        )
    }
    
    const linkColumnType = {
        ...GRID_STRING_COL_DEF,
        type: 'custom',
        resizable: false,
        filterable: false,
        sortable: false,
        editable: false,
        groupable: false,
        display: 'flex',
        renderCell: (params) => <LinkCell {...params} />,
      };

      const actionColumnType = {
        ...GRID_STRING_COL_DEF,
        type: 'custom',
        resizable: false,
        filterable: false,
        sortable: false,
        editable: false,
        groupable: false,
        display: 'flex',
        renderCell: (params) => <ActionsCell {...params} />,
      };


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
      
      const columns = [
        { field: 'documentName', headerName: 'Document', width: 350, ...linkColumnType
         },
        { field: 'lastModified', headerName: 'Modified', width: 150 },
        { field: 'actions', headerName: 'Actions', width: 250, ...actionColumnType }
      ];


    return (
        <>
        {renameDialogOpen && 
        <RenameDialog open={renameDialogOpen} setOpen={setRenameDialogOpen}
            documentId={documentToEdit.documentId} documentName={documentToEdit.documentName}
            renameDocument={renameDocument}
            />}
        {deleteDialogOpen &&
        <DeleteDocumentDialog open={deleteDialogOpen} setOpen={setDeleteDialogOpen} 
            documentId={documentToEdit.documentId} documentName={documentToEdit.documentName} 
            deleteDocument={deleteDocument}/>}
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
            <div className="documents" style={{width: '80%'}}>
                <div className="documentsHeader">
                    <h3>Documents</h3>
                </div>
                {/* <div className="documentsList">
                    {documents.map((d) =>
                        <div className="documentRow" onClick={() => {navigate('/document/'+d.documentId)}}>
                            <div className="name">{d.documentName}</div>
                            <div className="lastEdited">{d.lastModified}</div>
                        </div>
                    )}
                </div> */}
                <div style={{ height: 300, width: '100%' }}>
                    <DataGrid rows={documents} getRowId={(r) => r.documentId} columns={columns} />
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