import { useContext } from "react";

import { DocumentContext } from "./Document";

const BreadcrumbsTrail = () => {
        const {
            screenPosition, breadcrumbs,
            moveCursor, cursor,
            isEditing, editText,  updateNodeText,
            nodeStyle,username, breadcrumbHeight
            } = useContext(DocumentContext)
            
            return <div style={{borderBottom: '1px solid black', height: breadcrumbHeight,
               overflow: 'hidden',   // Clips overflow (safety measure)
               position: 'relative'
    }}>
        {breadcrumbs.map((bc, i) =>  <div 
            onClick={(e) => {
                if (isEditing) updateNodeText(cursor, editText);
                moveCursor(bc);
            }}
            key={i}
            className={"cell " + (bc.creator === username ? 'myCell' : 'yourCell')}
            style={{
                height: breadcrumbHeight,
                width: bc.width,
                minWidth: 0,
                top: 0,
                left: bc.xPx - screenPosition.x,
                cursor: 'pointer', // ✅ Explicitly set (ensure no conflicts)
                pointerEvents: 'auto', // Ensure the element is interactive
            }}
            >
            <div className="breadcrumbText" style={{ height: breadcrumbHeight, padding: nodeStyle.padding }}>
                {bc.text}
            </div>
        </div>
        )}
    </div>
}

export default BreadcrumbsTrail;