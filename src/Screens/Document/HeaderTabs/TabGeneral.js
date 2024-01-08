import { useState } from "react"
import Select from "react-select"

const TabGeneral = () => {
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

       const updateFontSize = (size) => {
        setFontSize(size)
       }
       return (
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
       )

        
}

export default TabGeneral