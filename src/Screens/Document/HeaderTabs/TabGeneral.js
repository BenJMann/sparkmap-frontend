import { useState, useContext, useEffect } from "react"
import Select from "react-select"
import { DocumentContext } from "../Document"
import FontSelector, {fontClasses} from "../../../FontSelector"
import { FormatBold, FormatItalic, FormatUnderlined, FormatColorFill, FormatColorText } from "@mui/icons-material"
import { IconButton } from "@mui/material"
import ColorPopover from "../../ColorPopover"
import Button from '@mui/material/Button';

const TabGeneral = () => {
    const {grid, documentName, cursor, data, setData} = useContext(DocumentContext)
      const [fontSize, setFontSize] = useState(12);
      const [isBold, setIsBold] = useState(false);
      const [isItalic, setIsItalic] = useState(false);
      const [isUnderlined, setIsUnderlined] = useState(false)

      const [selectedFont, setSelectedFont] = useState(fontClasses.find((c) => c.name==="Roboto"));

      const [textColor, setTextColor] = useState("#000")
      const [fillColor, setFillColor] = useState("#fff")

      useEffect(() => {
        if (cursor) {
            setIsBold(cursor.style?.isBold ?? false)
            setIsItalic(cursor.style?.isItalic ?? false)
            setIsUnderlined(cursor.style?.isUnderlined ?? false)
            
            setSelectedFont(fontClasses.find((c) => c.name === cursor.style?.selectedFont) ?? fontClasses.find((c) => c.name==="Roboto"))

            setFontSize(cursor.style?.fontSize?.split?.("p")?.[0] ?? 11)

            setTextColor(cursor.style?.textColor ?? '#000')

            setFillColor(cursor.style?.fillColor ?? '#fff')
        }
      }, [cursor])

       function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
      }

       const generateCSV = () => {
        const csv = grid.map((r) => {
            return [...Array(r.x).map(_ => ','), r.text].join()
        }).join("\n")

        download(`${documentName}.csv`, csv)
       }

       const handleFontChange = (event, newValue) => {
        if (cursor) {
            if (!cursor.style) cursor.style = {selectedFont: newValue.name}
            else cursor.style.selectedFont = newValue.name
            setSelectedFont(newValue);
            setData([...data])
        }
      };

       const toggleBold = () => {
        if (cursor) {
            if (!cursor.style) cursor.style = {isBold: !isBold}
            else cursor.style.isBold = !isBold
            setIsBold((prev) => !prev)
            setData([...data])
        }
       }

       const toggleItalic = () => {
        if (cursor) {
            if (!cursor.style) cursor.style = {isItalic: !isItalic}
            else cursor.style.isItalic = !isItalic
            setIsItalic((prev) => !prev)
            setData([...data])
        }
       }

       const toggleUnderlined = () => {
        if (cursor) {
            if (!cursor.style) cursor.style = {isUnderlined: !isUnderlined}
            else cursor.style.isUnderlined = !isUnderlined
            setIsUnderlined((prev) => !prev)
            setData([...data])
        }
       }

       const updateFontSize = (size) => {
        if (cursor) {
            if (!cursor.style) cursor.style = {fontSize: size + "pt"}
            else cursor.style.fontSize = size + "pt"
            setFontSize(size)
            setData([...data])
        }
       }

       const handleTextColorChange = (v) => {
        if (cursor) {
            if (!cursor.style) cursor.style = {textColor: v}
            else cursor.style.textColor = v
            setTextColor(v)
        }
       }
       const handleTextColorComplete = () => {
        setData([...data])
       }

       const handleFillColorChange = (v) => {
        if (cursor) {
            if (!cursor.style) cursor.style = {fillColor: v}
            else cursor.style.fillColor = v
            setFillColor(v)
        }
       }
       const handleFillColorComplete = () => {
        setData([...data])
       }

       return (
        <div style={{display:'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start'}}>
                <div style={{width: '300px'}}>
                    <FontSelector selectedFont={selectedFont} handleChange={handleFontChange}/>
                </div>
                <div style={{display: 'flex', flexDirection: 'row', marginTop: '10px', alignItems: 'center'}}>
                    <IconButton
                        onClick={toggleBold}
                        style={isBold ? {borderBottom: "1px solid black", borderLeft: '1px solid black', backgroundColor: '#8fafdd'}
                            : {}}>
                        <FormatBold />
                    </IconButton>
                    <IconButton onClick={toggleItalic}
                        style={isItalic ? {borderBottom: "1px solid black", borderLeft: '1px solid black', backgroundColor: '#8fafdd'}
                            : {}}>
                        <FormatItalic />
                    </IconButton>
                    <IconButton
                    onClick={toggleUnderlined}
                    style={isUnderlined ? {borderBottom: "1px solid black", borderLeft: '1px solid black', backgroundColor: '#8fafdd'}
                        : {}}
                        >
                        <FormatUnderlined />
                    </IconButton>
                    <div style={{marginTop: '2px', marginLeft: 10}}>
                        <input type="number" min={1} max={72} value={fontSize} onChange={(e) => updateFontSize(e.target.value)}></input>
                    </div>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', marginLeft: 20}}>
                    <ColorPopover color={textColor} setColor={handleTextColorChange} onComplete={handleTextColorComplete}>
                        <FormatColorText />
                        <Button style={{marginLeft: 15}} variant="outlined">
                            <div style={{width: 45, height: 20, backgroundColor: textColor}} />
                        </Button>
                    </ColorPopover>
                    <ColorPopover color={fillColor} setColor={handleFillColorChange} onComplete={handleFillColorComplete}>
                        <FormatColorFill />
                        <Button style={{marginLeft: 15}} variant="outlined">
                            <div style={{width: 45, height: 20, backgroundColor: fillColor}} />
                        </Button>
                    </ColorPopover>
                </div>
            </div>
            <div style={{textDecoration: 'underline', color: 'white', cursor: 'pointer'}}
            onClick={generateCSV}>Export to CSV</div>
        </div>
      
       )

        
}

export default TabGeneral