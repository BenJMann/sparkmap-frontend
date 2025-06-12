import React, { useCallback, forwardRef, useContext, useState, useMemo } from "react";
import { DocumentContext } from "./Document";

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
    Space: " ",
    PageUp: "PageUp",
    PageDown: "PageDown",
    Home: "Home",
    End: "End",
    Insert: "Insert",
    CapsLock: "CapsLock",
    NumLock: "NumLock",
    ScrollLock: "ScrollLock",
    x: /[xX]/,
    v: /[vV]/,
    s: /[sS]/,
    d: /[dD]/,
    c: /[cC]/
}

const Modifiers = {
    Shift: "Shift",
    Control: "Control",
    Alt: "Alt",
    OptionalShift: "OptionalShift"
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
            [{key: Keys.ArrowLeft, modifiers:[Modifiers.Shift]}, "f_moveCursorLeftAndSelect"],
            [{key: Keys.ArrowRight, modifiers:[Modifiers.Shift]}, "f_moveCursorRightAndSelect"],
            [{key: Keys.ArrowUp, modifiers:[Modifiers.Shift]}, "f_moveCursorUpAndSelect"],
            [{key: Keys.ArrowDown, modifiers:[Modifiers.Shift]}, "f_moveCursorDownAndSelect"],
            [{key: Keys.x, modifiers:[Modifiers.Control]}, "f_copyNode"],
            [{key: Keys.v, modifiers:[Modifiers.Control, Modifiers.Shift]}, "f_pasteNodeAbove"],
            [{key: Keys.v, modifiers:[Modifiers.Control]}, "f_pasteNodeBelow"],
            [{key: Keys.c, modifiers:[Modifiers.Control]}, "f_copyTreeToClipboard"],
            [{key: Keys.Tab, modifiers:[]}, "f_createChildNode"],
            [{key: Keys.Enter, modifiers:[]}, "f_toggleEdit"], 
            [{key: Keys.Enter, modifiers:[Modifiers.Control, Modifiers.Shift]}, "f_createSiblingNodeAbove"],
            [{key: Keys.Enter, modifiers:[Modifiers.Control]}, "f_createSiblingNodeBelow"],
            [{key: Keys.Delete, modifiers:[]}, "f_deleteCell"],
            [{key: Keys.Escape, modifiers:[], mode: Modes.Normal}, "f_unmarkAsCopying"], 
            [{key: Keys.Escape, modifiers:[], mode: Modes.Edit}, "f_escapeEdit"], 
            [{key: Keys.Space, modifiers:[Modifiers.Control]}, "f_toggleCollapse"], 

            [{key: Keys.Typable, modifiers:[Modifiers.OptionalShift], mode: Modes.Normal}, "f_enterType"],
            
            [{key: Keys.s, modifiers:[Modifiers.Control]}, "f_doNothing"], 
            [{key: Keys.d, modifiers:[Modifiers.Control]}, "f_doNothing"], 

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
        if (direction === "keydown") {
            callFunction(keyWithModifiers, event)
        }
    }, [keyBindings, modifierPressed, functions]);

    const modifiersMatch = useCallback((bindingKey, pressedKey) => {
        const isOptionalShift = bindingKey.modifiers.includes(Modifiers.OptionalShift);
        const pressedModifiers = new Set(pressedKey.modifiers);
        const requiredModifiers = new Set(bindingKey.modifiers);
        
        if (isOptionalShift) {
            // Remove OptionalShift from required modifiers
            requiredModifiers.delete(Modifiers.OptionalShift);
            
            // Check if pressed modifiers contain all required modifiers
            const hasRequiredModifiers = [...requiredModifiers].every(mod => pressedModifiers.has(mod));
            
            // Check shift state
            const hasShift = pressedModifiers.has(Modifiers.Shift);
            
            // Valid cases:
            // 1. Has required modifiers and no extra modifiers (shift not pressed)
            // 2. Has required modifiers plus shift (shift pressed)
            return hasRequiredModifiers && 
                (pressedKey.modifiers.length === requiredModifiers.size || 
                    (pressedKey.modifiers.length === requiredModifiers.size + 1 && hasShift));
        }
        
        // Normal case - exact match required
        return pressedKey.modifiers.length === bindingKey.modifiers.length &&
            [...requiredModifiers].every(mod => pressedModifiers.has(mod));
    }, []);

    const callFunction = useCallback((keyWithModifiers, event) => {
        let matchedAction = null;
        for (const [key, value] of keyBindings) {
            if (key.key instanceof RegExp &&
                key.key.test(keyWithModifiers.key) &&
                modifiersMatch(key, keyWithModifiers) &&
                currentModes.includes(key.mode)) {
                    matchedAction = value;
                    break
            }
            else if (key.key === keyWithModifiers.key && 
               modifiersMatch(key, keyWithModifiers) &&
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
        pasteNode,
        toggleCollapse,
        unmarkAsCopying,
        copyTreeToClipboard
    } = useContext(DocumentContext)

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
        if (!isEditing) {
            if (cursor.parent) moveCursor(cursor.parent) 
        }
    }, [isEditing, cursor])

    const f_moveCursorRight = useCallback(() => {
        if (!isEditing) {
            if (cursor.children) moveCursor('child') 
        }
    }, [isEditing, cursor])

    const f_moveCursorDownAndSelect = useCallback(() => {
        if (!isEditing) {
            if (cursor.nextNode) moveCursor(cursor.nextNode, true)
        }
    }, [isEditing, cursor])

    const f_moveCursorUpAndSelect = useCallback(() => {
        if (!isEditing) {
            if (cursor.prevNode) moveCursor(cursor.prevNode, true)
        }
    }, [isEditing, cursor])

    const f_moveCursorLeftAndSelect = useCallback(() => {
        if (!isEditing) {
            if (cursor.parent) moveCursor(cursor.parent, true) 
        }
    }, [isEditing, cursor])

    const f_moveCursorRightAndSelect = useCallback(() => {
        if (!isEditing) {
            if (cursor.children) moveCursor('child', true) 
        }
    }, [isEditing, cursor])

    const f_toggleEdit = useCallback(() => {
        if (isEditing) {
            updateNodeText(cursor, editText);
        }
        else if (!cursor.locked)
            editCell(cursor, cursor.text)
    }, [isEditing, editText, cursor])

    const f_toggleCollapse = useCallback(() => {
        toggleCollapse(cursor);
    }, [isEditing, editText, cursor])

    const f_unmarkAsCopying = useCallback(() => {
        unmarkAsCopying();
    }, [unmarkAsCopying])

    const f_copyTreeToClipboard = useCallback(() => {
        console.log("Callback")
        copyTreeToClipboard(cursor);
    }, [cursor])

    const f_doNothing = useCallback(() => null, [])

    const functions = {
            f_moveCursorUp,
            f_moveCursorDown,
            f_moveCursorLeft,
            f_moveCursorRight,
            f_moveCursorUpAndSelect,
            f_moveCursorDownAndSelect,
            f_moveCursorLeftAndSelect,
            f_moveCursorRightAndSelect,
            f_copyNode,
            f_pasteNodeAbove,
            f_pasteNodeBelow,
            f_createChildNode,
            f_createSiblingNodeAbove,
            f_createSiblingNodeBelow,
            f_deleteCell,
            f_enterType,
            f_escapeEdit,
            f_toggleEdit,
            f_toggleCollapse,
            f_unmarkAsCopying,
            f_copyTreeToClipboard,
            f_doNothing
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