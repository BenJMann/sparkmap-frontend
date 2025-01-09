import { forwardRef, useContext, useState } from "react"
import {DocumentContext} from './Document'


const DocumentEditContainer = forwardRef((_, editRef) => {
    const {setEditText, editContainerDimensions, cursor, isEditing, editText, setIsEditing, updateNodeText} = useContext(DocumentContext)

    const [focusTimeout, setFocusTimeout] = useState(null)

    const handleBlur = () => {
        clearTimeout(focusTimeout)
        const tmout = setTimeout(() => {
            setIsEditing(false)
            updateNodeText(cursor, editText);
        }, 10)
        setFocusTimeout(tmout)
    }
    const handleFocus = () => {
        clearTimeout(focusTimeout)
    }
    return <div className="editContainer" 
    style={{...(cursor ? {top: cursor.yPx, left: cursor.xPx} : {}), 
    ...(!isEditing ? {visibility: 'hidden'} : {}), 
    width: editContainerDimensions.width, height: editContainerDimensions.height}}>
        <input value={editText} 
        ref={editRef} 
        onBlur={(e) => { handleBlur()}} 
        onFocus={handleFocus}
        onChange={(e) => setEditText(e.target.value ?? "")} />
    </div>
})

export default DocumentEditContainer