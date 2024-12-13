import { useState, useContext } from "react"
import Select from "react-select"
import { DocumentContext } from "../Document"

const TabGeneral = () => {
    const {grid, documentName} = useContext(DocumentContext)

    const fontOptions = [
        { value: 'arial', label: 'Arial', font:  "Arial"},
        { value: 'times', label: 'Times New Roman', font: "Times New Roman"},
        { value: 'courier', label: 'Courier New', font: "Courier New" }
      ]

      const [font, setFont] = useState(fontOptions[0]);
      const [fontSize, setFontSize] = useState(12);
       const updateFont = (font) => {
        setFont(font);
       }

       function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
      }
       const updateFontSize = (size) => {
        setFontSize(size)
       }
       const generateCSV = () => {
        const csv = grid.map((r) => {
            return [...Array(r.x).map(_ => ','), r.text].join()
        }).join("\n")

        download(`${documentName}.csv`, csv)
       }

       return (
        <div style={{display:'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <div style={{width: '200px'}}>
                <Select 
                    styles={{
                        control: (baseStyles, state) => {
                            return {
                                ...baseStyles,
                                fontFamily: state.selectProps.value?.font
                            }
                        },
                        option: (baseStyles, state) => {
                            return {
                            ...baseStyles,
                            fontFamily: state.data.font,
                        }},
                    }}    
                    options={fontOptions}
                    value={font}
                    onChange={updateFont}/>
                
                <div style={{display: 'flex', flexDirection: 'row', marginTop: '10px'}}>
                    <div style={{border: '1px solid #ccc', padding: '7px', fontWeight: 'bold', marginRight: '10px'}}>B</div>
                    <div style={{border: '1px solid #ccc', padding: '7px', textDecoration: 'underline', marginRight: '10px'}}>U</div>
                    <div style={{border: '1px solid #ccc', padding: '9px', fontStyle: 'italic', marginRight: '15px'}}>I</div>
                    <div style={{marginTop: '7px'}}>
                        <input type="number" min={1} max={72} value={fontSize} onChange={(e) => updateFontSize(e.target.value)}></input>
                    </div>
                </div>
            </div>
            <div style={{textDecoration: 'underline', color: 'white', cursor: 'pointer'}}
            onClick={generateCSV}>Export to CSV</div>
        </div>
      
       )

        
}

export default TabGeneral