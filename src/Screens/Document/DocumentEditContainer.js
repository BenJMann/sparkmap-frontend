import { forwardRef, useContext } from "react"
import {DocumentContext} from './Document'


const DocumentEditContainer = forwardRef((_, editRef) => {
    const {setEditText, editContainerDimensions, cursor, isEditing, editText} = useContext(DocumentContext)

    return <div className="editContainer" style={{...(cursor ? {top: cursor.yPx, left: cursor.xPx} : {}), ...(!isEditing ? {visibility: 'hidden'} : {}), width: editContainerDimensions.width, height: editContainerDimensions.height}}>
        <input value={editText} ref={editRef} onChange={(e) => setEditText(e.target.value ?? "")} />
    </div>
})

export default DocumentEditContainer