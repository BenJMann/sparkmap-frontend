import React, { useCallback, forwardRef, useContext, useState, useMemo } from "react";
import { DocumentContext } from "./Document";
import { Edit } from "@styled-icons/fa-solid";
import { Mode } from "@mui/icons-material";

const Keys = {
    Typable: /^[A-Za-z0-9`=\\[\];',./\- !@#£$%^&*()_+{}|:"<>?~]$/,
    ArrowUp: "ArrowUp",
    ArrowDown: "ArrowDown",
    ArrowLeft: "ArrowLeft",
    ArrowRight: "ArrowRight",
    Backspace: "Backspace",
    Delete: "Delete",
    Escape: "Escape",
    Enter: "Enter",
    Tab: "Tab",
    Shift: "Shift",
    Control: "Control",
    Alt: "Alt",
    Space: "Space",
    PageUp: "PageUp",
    PageDown: "PageDown",
    Home: "Home",
    End: "End",
    Insert: "Insert",
    CapsLock: "CapsLock",
    NumLock: "NumLock",
    ScrollLock: "ScrollLock",
    x: "x",
    v: "v"
}

const Modifiers = {
    Shift: "Shift",
    Control: "Control",
    Alt: "Alt",
}

const Modes = {
    Normal: "Normal",
    Edit: "Edit",
    All: undefined
}

const KeyManager = forwardRef(({functions, screenDimensions, totalDimensions, setScreenPosition, subchildren, isEditing}, ref) => {
    const [modifierPressed, setModifierPressed] = useState(null);

    const currentModes = useMemo(() => {
        if (!isEditing) return [Modes.Normal, Modes.All]
        else return [Modes.Edit, Modes.All]
    }, [isEditing])

    const [keyBindings, setKeyBindings] = useState(
        new Map([
            [{key: Keys.ArrowLeft, modifiers:[]}, "f_moveCursorLeft"],
            [{key: Keys.ArrowRight, modifiers:[]}, "f_moveCursorRight"],
            [{key: Keys.ArrowUp, modifiers:[]}, "f_moveCursorUp"],
            [{key: Keys.ArrowDown, modifiers:[]}, "f_moveCursorDown"],
            [{key: Keys.x, modifiers:[Modifiers.Control]}, "f_copyNode"],
            [{key: Keys.v, modifiers:[Modifiers.Control, Modifiers.Shift]}, "f_pasteNodeAbove"],
            [{key: Keys.v, modifiers:[Modifiers.Control]}, "f_pasteNodeBelow"],
            [{key: Keys.Tab, modifiers:[]}, "f_createChildNode"],
            [{key: Keys.Enter, modifiers:[]}, "f_toggleEdit"], 
            [{key: Keys.Enter, modifiers:[Modifiers.Control, Modifiers.Shift]}, "f_createSiblingNodeAbove"],
            [{key: Keys.Enter, modifiers:[Modifiers.Control]}, "f_createSiblingNodeBelow"],
            [{key: Keys.Delete, modifiers:[]}, "f_deleteCell"],
            [{key: Keys.Escape, modifiers:[]}, "f_escapeEdit"], 

            [{key: Keys.Typable, modifiers:[], mode: Modes.Normal}, "f_enterType"],
        ])
    );

    const handleKey = useCallback((event, direction) => {
        const key = event.key;
        const modifiers = [];

        if (event.ctrlKey) modifiers.push(Modifiers.Control);
        if (event.shiftKey) modifiers.push(Modifiers.Shift);
        if (event.altKey) modifiers.push(Modifiers.Alt);

        const keyWithModifiers = {key, modifiers}

        if (keyWithModifiers.key === "Control" || keyWithModifiers.key === "Shift" || keyWithModifiers.key === "Alt") {
            if (direction === "keydown") {
                setModifierPressed(keyWithModifiers.key);
                return;
            }
            else if (direction === "keyup") {
                if (modifierPressed === keyWithModifiers.key) { 
                    const newKeyWithModifiers ={key: keyWithModifiers.key, modifiers: keyWithModifiers.modifiers.filter(m => m !== keyWithModifiers.key)};
                    callFunction(newKeyWithModifiers, event)
                    setModifierPressed(null);
                    return;
                }
                else setModifierPressed(null);
                return
            }
        }
        else {
            setModifierPressed(null);
        }
        if (direction === "keydown")
            callFunction(keyWithModifiers, event)
    }, [keyBindings, modifierPressed, functions]);

    const callFunction = useCallback((keyWithModifiers, event) => {
        let matchedAction = null;
        for (const [key, value] of keyBindings) {
            if (key.key instanceof RegExp &&
                key.key.test(event.key) &&
                currentModes.includes(key.mode)) {
                    matchedAction = value;
                    break
            }
            else if (key.key === keyWithModifiers.key && 
               key.modifiers.length === keyWithModifiers.modifiers.length &&
               key.modifiers.every(mod => keyWithModifiers.modifiers.includes(mod)) &&
               currentModes.includes(key.mode)) {
                matchedAction = value;
                break;
            }
        }
        if (matchedAction) {
            event.preventDefault();
            const func = functions[matchedAction];
            if (typeof func === 'function') {
                func(keyWithModifiers);
            }
        }
    }, [keyBindings, functions]);

    const handleKeyDown = useCallback((event) => {
        handleKey(event, "keydown");
    }, [keyBindings, modifierPressed, functions]);

    const handleKeyUp = useCallback((event) => {
        handleKey(event, "keyup");
    }, [keyBindings, modifierPressed, functions]);

    return <div tabIndex="0"
                onKeyDown={handleKeyDown} 
                onKeyUp={handleKeyUp}
                ref={ref}
                className="documentContent inner" 
                onScroll={(e) => {setScreenPosition({x: e.currentTarget.scrollLeft, y: e.currentTarget.scrollTop})}} 
                style={{width: screenDimensions.width, height: screenDimensions.height, outline: 'none'}}
                >
                {subchildren}
                <div className="stretcher" style={{top: totalDimensions.height, left: totalDimensions.width}}></div>
            </div>
})
const DocumentKeys = forwardRef(({children}, ref) => {
    const {cursor, isEditing, editText, data, 
        deleteCell,
        updateNodeText,
        isNewNode,
        setIsNewNode,
        createSiblingNode,
        createChildNode,
        editCell,
        setIsEditing,
        moveCursor,
        totalDimensions,
        screenDimensions,
        setScreenPosition,
        copyNode,
        pasteNode} = useContext(DocumentContext)

    const f_deleteCell = useCallback(() => {
        deleteCell(cursor);
    }, [cursor])

    const f_copyNode = useCallback(() => {
        copyNode();
    })

    const f_pasteNodeAbove = useCallback(() => {
        pasteNode(cursor, false)
    }, [cursor])

    const f_pasteNodeBelow = useCallback(() => {
        pasteNode(cursor, false)
    }, [cursor])

    const f_createSiblingNodeAbove = useCallback(() => {
        if (isEditing)
            updateNodeText(cursor, editText);
        setIsNewNode(true);
        createSiblingNode(cursor, true)
    }, [isEditing, cursor, editText])

     const f_createSiblingNodeBelow = useCallback(() => {
        if (isEditing)
            updateNodeText(cursor, editText);
        setIsNewNode(true);
        createSiblingNode(cursor, false)
    }, [isEditing, cursor, editText])

    const f_createChildNode = useCallback(() => {
        if (isEditing)
            updateNodeText(cursor, editText);
        setIsNewNode(true);
        createChildNode(cursor)
    }, [isEditing, cursor, editText])

    const f_escapeEdit = useCallback(() => {
        if (isEditing) {
            setIsEditing(false);
            if (isNewNode) {
                deleteCell(cursor);
            }
        }
    }, [isEditing, isNewNode, cursor])

    const f_enterType = useCallback((keyWithModifiers) => {
        if (!isEditing) {
            if (!cursor.locked)
                editCell(cursor, keyWithModifiers.key)
        }
    }, [isEditing, cursor])

    const f_moveCursorDown = useCallback(() => {
        if (!isEditing) {
            if (cursor.nextNode) moveCursor(cursor.nextNode)
        }
    }, [isEditing, cursor])

    const f_moveCursorUp = useCallback(() => {
        if (!isEditing) {
            if (cursor.prevNode) moveCursor(cursor.prevNode)
        }
    }, [isEditing, cursor])

    const f_moveCursorLeft = useCallback(() => {
        console.log("Running!")
        if (!isEditing) {
            if (cursor.parent) moveCursor(cursor.parent) 
        }
    }, [isEditing, cursor])

    const f_moveCursorRight = useCallback(() => {
        if (!isEditing) {
            if (cursor.children) moveCursor(cursor.children[0]) 
        }
    }, [isEditing, cursor])

    const f_toggleEdit = useCallback(() => {
        if (isEditing) {
            updateNodeText(cursor, editText);
        }
        else if (!cursor.locked)
            editCell(cursor, cursor.text)
    }, [isEditing, editText, cursor])

    const functions = {
            f_moveCursorUp,
            f_moveCursorDown,
            f_moveCursorLeft,
            f_moveCursorRight,
            f_copyNode,
            f_pasteNodeAbove,
            f_pasteNodeBelow,
            f_createChildNode,
            f_createSiblingNodeAbove,
            f_createSiblingNodeBelow,
            f_deleteCell,
            f_enterType,
            f_escapeEdit,
            f_toggleEdit
        }

     return <KeyManager ref={ref}
        screenDimensions={screenDimensions}
        totalDimensions={totalDimensions}
        setScreenPosition={setScreenPosition}
        isEditing={isEditing}
        subchildren={children}
        functions={functions}
     />
})

export default DocumentKeys