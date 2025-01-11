import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { IconButton } from "@mui/material"

import { HexColorPicker } from 'react-colorful';

export default function ColorPopover({children, color, setColor, onComplete = () => null}) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    onComplete();
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <IconButton style={{display: 'flex', flexDirection: 'row'}} aria-describedby={id} variant="contained" onClick={handleClick}>
        {children}
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
        <HexColorPicker color={color} onChange={setColor} />
      </Popover>
    </div>
  );
}