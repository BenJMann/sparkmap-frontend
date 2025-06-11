import { useState } from "react"

import { Link } from "@mui/material";

import { DataGrid, GridActionsCellItem, GRID_STRING_COL_DEF } from '@mui/x-data-grid';

import { IconButton } from "@mui/material"
import { MoreVert } from "@mui/icons-material";

import Popover from "@mui/material/Popover";

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

function DocumentPopover({row, setRowActionDialog}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRename = () => {
    setRowActionDialog("Rename", row)
    handleClose()
  }

  const handleDelete = () => {
    setRowActionDialog("Delete", row)
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


function DashboardTable({documents, setRowActionDialog}) {
    const LinkCell = (props) => {
        return (
            <Link href={`/document/${props.row.documentId}`}>{props.value}</Link>
        )
    }
    
    const ActionsCell = (props) => {
        return (
            <DocumentPopover {...props} setRowActionDialog={setRowActionDialog} />
        )
    }
    
    const linkColumnType = {
        // ...GRID_STRING_COL_DEF,
        type: 'custom',
        resizable: false,
        filterable: false,
        sortable: false,
        editable: false,
        groupable: false,
        // display: 'flex',
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
      
      const columns = [
        { field: 'documentName', headerName: 'Document', width: 750, ...linkColumnType
         },
        { field: 'lastModified', headerName: 'Modified', width: 250 },
        { field: 'actions', headerName: 'Actions', width: 50, ...actionColumnType }
      ];


    return (
        <div style={{ height: 400, width: 1200, padding: 30 }}>
            <DataGrid rows={documents} getRowId={(r) => r.documentId} columns={columns} />
        </div>
    )
}

export default DashboardTable