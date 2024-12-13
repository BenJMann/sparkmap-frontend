import { forwardRef, useContext } from "react"
import {DocumentContext} from './Document'


const DocumentEditContainer = forwardRef((_, editRef) => {
    const {setEditText, editContainerDimensions, cursor, isEditing, editText, setIsEditing, updateNodeText} = useContext(DocumentContext)

    return <div className="editContainer" style={{...(cursor ? {top: cursor.yPx, left: cursor.xPx} : {}), ...(!isEditing ? {visibility: 'hidden'} : {}), width: editContainerDimensions.width, height: editContainerDimensions.height}}>
        <input value={editText} ref={editRef} onBlur={(e) => {setIsEditing(false); updateNodeText(cursor, editText)}} onChange={(e) => setEditText(e.target.value ?? "")} />
    </div>
})

export default DocumentEditContainer