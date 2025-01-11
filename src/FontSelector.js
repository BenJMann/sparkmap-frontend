import React, { useState } from 'react';
import { Autocomplete, TextField, Typography } from '@mui/material';

export const fontClasses = [
  { name: "Merriweather", cssClass: "font-merriweather" },
  { name: "Playfair Display", cssClass: "font-playfair-display" },
  { name: "Cormorant Garamond", cssClass: "font-cormorant-garamond" },
  { name: "Crimson Pro", cssClass: "font-crimson-pro" },
  { name: "Lora", cssClass: "font-lora" },
  { name: "Roboto", cssClass: "font-roboto" },
  { name: "Open Sans", cssClass: "font-open-sans" },
  { name: "Montserrat", cssClass: "font-montserrat" },
  { name: "Poppins", cssClass: "font-poppins" },
  { name: "Lato", cssClass: "font-lato" },
  { name: "Oswald", cssClass: "font-oswald" },
  { name: "Raleway", cssClass: "font-raleway" },
  { name: "Bebas Neue", cssClass: "font-bebas-neue" },
  { name: "Abril Fatface", cssClass: "font-abril-fatface" },
  { name: "Pacifico", cssClass: "font-pacifico" },
  { name: "Source Code Pro", cssClass: "font-source-code-pro" },
  { name: "Roboto Mono", cssClass: "font-roboto-mono" },
  { name: "Fira Code", cssClass: "font-fira-code" },
  { name: "Courier Prime", cssClass: "font-courier-prime" },
  { name: "JetBrains Mono", cssClass: "font-jetbrains-mono" },
  { name: "Dancing Script", cssClass: "font-dancing-script" },
  { name: "Patrick Hand", cssClass: "font-patrick-hand" },
  { name: "Indie Flower", cssClass: "font-indie-flower" },
  { name: "Amatic SC", cssClass: "font-amatic-sc" },
  { name: "Shadows Into Light", cssClass: "font-shadows-into-light" }
];

const FontSelector = ({selectedFont, handleChange}) => {
  return (
    <div style={{ padding: '20px' }}>
      <Autocomplete
        value={selectedFont}
        onChange={handleChange}
        options={fontClasses}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => <TextField {...params} label="Select Font" />}
        renderOption={(props, option) => (
          <li {...props}>
            <span className={option.cssClass}>
              {option.name}
            </span>
          </li>
        )}
      />
    </div>
  );
};

export default FontSelector;