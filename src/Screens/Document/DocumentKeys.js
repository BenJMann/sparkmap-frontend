import { useCallback, forwardRef, useContext, useState } from "react";
import { DocumentContext } from "./Document";
const DocumentKeys = forwardRef(({children}, ref) => {
    const {cursor, isEditing, editText, data, browseModifier, 
        setScreenPosBeforeBrowseModifierChange,
        getNodeScreenPosition,
        setGridWindowRefresh,
        setBrowseModifier,
        deleteCell,
        updateNodeText,
        isNewNode,
        setIsNewNode,
        createSiblingNode,
        createChildNode,
        editCell,
        setIsEditing,
        setCursor,
        totalDimensions,
        screenDimensions,
        screenPosition,
        setScreenPosition} = useContext(DocumentContext)
    const handleKeyDown = useCallback((event) => {
        if (event.ctrlKey) {
            if (event.key === "e") {
                event.preventDefault();
                cursor && setScreenPosBeforeBrowseModifierChange(getNodeScreenPosition(cursor))
                setGridWindowRefresh(true);
                setBrowseModifier(!browseModifier);
            }
            else if (event.key === "Delete") {
                deleteCell(cursor)
            }
            if (event.shiftKey) {
                if (event.key === 'Enter') {
                    if (isEditing)
                        updateNodeText(cursor, editText);
                    setIsNewNode(true);
                    createSiblingNode(cursor, true)
                }
            }
            else {
                if (event.key === "Enter") {
                    if (isEditing)
                        updateNodeText(cursor, editText);
                    setIsNewNode(true);
                    createSiblingNode(cursor, false)
                }
            }
        }
        else if (event.key === 'Tab') {
            event.preventDefault()
            if (cursor.type !== 'placeholder' && cursor.type !== 'childPlaceholder') {
                if (isEditing)
                    updateNodeText(cursor, editText);
                setIsNewNode(true);
                createChildNode(cursor)
            }
        }
        else if (event.key === 'Enter') {
            if (isEditing) {
                updateNodeText(cursor, editText);
            }
            else {
                if (cursor.type === "placeholder") {
                    setIsNewNode(true);
                    createSiblingNode(cursor.before ? cursor.nextNode : cursor.prevNode, cursor.before)
                }
                else if (cursor.type === 'childPlaceholder') {
                    setIsNewNode(true);
                    createChildNode(cursor.parent)
                }
                else {
                    if (!cursor.locked)
                        editCell(cursor, cursor.text)
                }
            }  
        }
        else if (event.key === "Escape") {
            if (isEditing) {
                setIsEditing(false);
                if (isNewNode) {
                    deleteCell(cursor);
                }
            }
        }
        else if (event.key.length === 1 && !event.ctrlKey) {
            if (!isEditing) {
                event.preventDefault();
                if (cursor.type === "placeholder") {
                    setIsNewNode(true);
                    createSiblingNode(cursor.before ? cursor.nextNode : cursor.prevNode, cursor.before, event.key)
                } else if (cursor.type === 'childPlaceholder') {
                    setIsNewNode(true);
                    createChildNode(cursor.parent, event.key);
                }
                else {
                    if (!cursor.locked)
                        editCell(cursor, event.key)
                }
            }
        }
        else if (event.key === "ArrowDown") { 
            if (!isEditing) {
                event.preventDefault(); 
                if (cursor.type === 'placeholder' || cursor.type==='childPlaceholder' || !browseModifier) {
                    if (cursor.nextNode) setCursor(cursor.nextNode) 
                }
                else {
                    if (cursor.nextPlaceholder) setCursor(cursor.nextPlaceholder)
                }
            }
        }
        else if (event.key === "ArrowUp") {  
            if (!isEditing) {
                event.preventDefault(); 
                if (cursor.type === 'placeholder' || cursor.type==='childPlaceholder' || !browseModifier || !cursor.prevPlaceholder) {
                    if (cursor.prevNode) setCursor(cursor.prevNode) 
                }
                else {
                    if (cursor.prevPlaceholder) setCursor(cursor.prevPlaceholder)
                }
            }
        }
        else if (event.key === "ArrowLeft") { 
            if (!isEditing) {
                event.preventDefault(); 
                if (cursor.parent) setCursor(cursor.parent) 
            }
        }
        else if (event.key === "ArrowRight") { 
            if (!isEditing) {
                event.preventDefault(); 
                if (cursor.children) setCursor(cursor.children[0]) 
                else if (cursor.childPlaceholder && browseModifier) {
                    setCursor(cursor.childPlaceholder)
                }
            }
        }
     }, [cursor, isEditing, editText, data, browseModifier, screenPosition])


    return <div     tabIndex="0"
                    onKeyDown={handleKeyDown} 
                    ref={ref}
                    className="documentContent inner" 
                    onScroll={(e) => {setScreenPosition({x: e.currentTarget.scrollLeft, y: e.currentTarget.scrollTop})}} 
                    style={{width: screenDimensions.width, height: screenDimensions.height, outline: 'none'}}
                    >
                    {children}
                    <div className="stretcher" style={{top: totalDimensions.height, left: totalDimensions.width}}></div>
                </div>

})

export default DocumentKeys