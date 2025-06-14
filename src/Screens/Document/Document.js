import { useState, useEffect, useCallback, useRef, useContext, useLayoutEffect, createContext, useMemo } from "react"
import { useParams } from "react-router-dom"


import Background from "../../Images/texture.jpg"
import Loading from '../../Images/loading.gif'


import { WebsocketsContext } from "../../WebsocketsProvider"

import { LoginContext } from "../../LoginProvider"

import SharePopup from '../../Popups/SharePopup'

import DocumentHeader from "./DocumentHeader"
import DocumentKeys from "./DocumentKeys"
import DocumentRender from "./DocumentRender"
import DocumentSocket from "./DocumentSocket"
import DocumentEditContainer from "./DocumentEditContainer"
import BreadcrumbsTrail from "./BreadcrumbsTrail"

import calculateNodeStyle from "../CalculateNodeStyles"

export const DocumentContext = createContext(null);



const Document = () => {
    const {documentId} = useParams()
    const {socket} = useContext(WebsocketsContext);
    const {username } = useContext(LoginContext);
    const [nodeStyle, setNodeStyle] = useState({
        indent: 150,
        minWidth: 50,
        minHeight: 18,
        marginCollapsed: 5,
        marginExpanded: 20,
        padding: 10,
        maxWidth: 250
    })

    const [data, setData] = useState([])

    const [grid, setGrid] = useState([])
    const [gridWindow, setGridWindow] = useState([])
    const [screenPosition, setScreenPosition] = useState({x: 0, y: 0})
    const [screenDimensions, setScreenDimensions] = useState({width: 1800, height: 800})

    const [totalDimensions, setTotalDimensions] = useState({width: 0, height: 0})

    const [documentName, setDocumentName] = useState("")

    const [cursor, setCursor] = useState(data[0])
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState("")

    const editRef = useRef();
    const documentRef = useRef();


    const [gridWindowRefresh, setGridWindowRefresh] = useState(false)

    const [hoveredNode, setHoveredNode] = useState(null);

    const [isNewNode, setIsNewNode] = useState(false);

    const [showSharePopup, setShowSharePopup] = useState(false);

    const [temporaryIdCounter, setTemporaryIdCounter] = useState(0);

    const [waitingUpdateQueue, setWaitingUpdateQueue] = useState([])
    const [updatePending, setUpdatePending] = useState({})

    const [windowSize, setWindowSize] = useState({width: 0, height: 0});
    const [editContainerDimensions, setEditContainerDimensions] = useState({width: 0, height: 0})

    const [nodeToCopy, setNodeToCopy] = useState(null)

    const [selectedNodes, setSelectedNodes] = useState([])

    const breadcrumbHeight = 40;
    const breadcrumbsEnabled = true;
    
    const [breadcrumbs, setBreadcrumbs] = useState([]);

    const breadcrumbsDisplayed = useMemo(() => breadcrumbsEnabled && breadcrumbs.length > 0, [breadcrumbs, breadcrumbsEnabled])
    

    const selectNode = (node) => {
            setSelectedNodes((prev) => [...prev, node].reduce((acc, current) => {
                const exists = acc.some(item => 
                item === current
                );
                return exists ? acc : [...acc, current];
            }, []))
    }
    
    const clearSelection = () => {
        setSelectedNodes([])
    }

    const moveCursor = (node, isSelecting) => {
        if (typeof node === 'string') {
            if (node === 'child') {
                if (cursor.prevNav) {
                    if (cursor.children.includes(cursor.prevNav))
                        node = cursor.prevNav;
                    else {
                        cursor.prevNav = undefined;
                        node = cursor.children[0];
                    }
                }
                else node = cursor.children[0]
            }
        }
        if (!node || node.root) return
        if (cursor) {
            cursor.parent.prevNav = cursor;
            cursor.dirtyStyles = true;
        }
        if (cursor && isSelecting)
            selectNode(cursor);
        else clearSelection();
        node.dirtyStyles = true;
        setCursor(node);
    }

    const isNodeParentOf = (node, parent) => {
        let curNode = node;
        while (curNode.parent) {
            if (curNode === parent) return true
            else curNode = curNode.parent
        }
        return false
    }

    const copyNode = () => {
        unmarkAsCopying();
        setNodeToCopy(cursor)

        const markAsCopying = (node) => {
            node.copying = true
            if (node.children) {
                node.children.forEach((n) => markAsCopying(n))
            }
        }
        markAsCopying(cursor)
    }

    const toggleCollapse = (node) => {
        if (node.children && !node.collapsed) {
            node.collapsed = true;
        }
        else node.collapsed = false;
        setData([...data]); // Force a re-render in case of UI feedback
    }

    const unmarkAsCopying = (node) => {
        if (!node && nodeToCopy) {
            node = nodeToCopy
            setNodeToCopy(null);
        }
        else if (!node) return;
        node.copying = false;
        if (node.children) {
            node.children.forEach(unmarkAsCopying);
        }
    };

    const generateSuggestionAI = () => {
        if (!cursor) return;
        // const nodesToParent = []
        // const getNodesToParent = (node) => {
        //     nodesToParent.push(node);
        //     if (node.parent && !node.parent.root)
        //         getNodesToParent(node.parent)
        // }
        // getNodesToParent(cursor);

        const addToNewMap = (node) => {
            const newNodes = [];
            node.children.forEach((c) => {
                const newNode = {text: c.text, ...(c === cursor ? {nodeToGenerateFrom: true} : {})}
                newNodes.push(newNode)
                if (c.children) {
                    const children = addToNewMap(c);
                    newNode.children = children;
                }
            })
            return newNodes;
        }
        const newMap = addToNewMap(data[0]);

        console.log("Generating suggestion")
        socket.emit("generateSuggestion", {node: calculatePath(cursor), map: JSON.stringify(newMap)});
    }

    const pasteNodeAsChild = (to, from) => {
        const nodeFrom = from || nodeToCopy;
        
        if (!nodeFrom) {
            console.error("No source node provided for pasting.");
            return;
        }
    
        // Unmark copying state if no source node (`from`) is provided
        if (!from) {
            unmarkAsCopying(nodeToCopy);
        }

        // Prevent pasting a node as a child of itself
        if (isNodeParentOf(to, nodeFrom)) {
            console.log("Cannot paste a node into one of its descendants.");
            setData([...data]); // Force a re-render in case of UI feedback
            return;
        }

        const fromParent = nodeFrom.parent;
    
        // Find removal index
        const fromIdx = fromParent.children.indexOf(nodeFrom);
    
        if (fromIdx === -1) {
            console.error("Invalid node indices for paste operation.");
            return;
        }

        const [movedNode] = fromParent.children.splice(fromIdx, 1); // Remove from old parent
        
        if (to.children) to.children = [...to.children, movedNode]
        else to.children = [movedNode]

        // Reset copying state and update references
        if (!from) {
            setNodeToCopy(null);
            moveCursor(nodeFrom);
        }
    
        // Update the data structure and refresh the grid window
        setData([...data]);
        setGridWindowRefresh(true);

        socket.emit("pasteNodeAsChild", {fromPath: calculatePath(nodeFrom), toPath: calculatePath(to)})
    }
    const pasteNode = (to, from, before) => {
        const nodeFrom = from || nodeToCopy;
    
        if (!nodeFrom) {
            console.error("No source node provided for pasting.");
            return;
        }
    
        // Unmark copying state if no source node (`from`) is provided
        if (!from) {
            unmarkAsCopying(nodeToCopy);
        }
    
        // Prevent pasting a node as a child of itself
        if (isNodeParentOf(to, nodeFrom)) {
            console.log("Cannot paste a node into one of its descendants.");
            setData([...data]); // Force a re-render in case of UI feedback
            return;
        }
    
        const toParent = to.parent;
        const fromParent = nodeFrom.parent;
    
        // Find insertion and removal indices
        const toIdx = toParent.children.indexOf(to) + (!before ? 1 : 0);
        const fromIdx = fromParent.children.indexOf(nodeFrom);
    
        if (toIdx === -1 || fromIdx === -1) {
            console.error("Invalid node indices for paste operation.");
            return;
        }
    
        if (fromParent === toParent) {
            // Reorder within the same parent
            const children = [...fromParent.children];
            const [movedNode] = children.splice(fromIdx, 1); // Remove nodeFrom
            children.splice(toIdx > fromIdx ? toIdx - 1 : toIdx, 0, movedNode); // Insert at new index
            fromParent.children = children;
        } else {
            // Move node between different parents
            const [movedNode] = fromParent.children.splice(fromIdx, 1); // Remove from old parent
            toParent.children.splice(toIdx, 0, movedNode); // Add to new parent
        }
    
        // Reset copying state and update references
        if (!from) {
            setNodeToCopy(null);
            moveCursor(nodeFrom);
        }
    
        // Update the data structure and refresh the grid window
        setData([...data]);
        setGridWindowRefresh(true);

        socket.emit("pasteNode", {fromPath: calculatePath(nodeFrom), toPath: calculatePath(to), before})
    };


    const copyTreeToClipboard = (node) => {
        console.log("COPYING");
        let text = "";
        const addText = (node, indent) => {
            let tabs = '';
            for (let i=0; i<indent; i++) {
                tabs = tabs + "\t";
            }
            text = text + tabs + node.text + "\n";
            if (node.children) {
                node.children.forEach((child) => addText(child, indent+1))
            }
        }
        addText(node, 0)
        navigator.clipboard.writeText(text.slice(0, -1));
    }
    

const getDimensionsOfText = function(text, styles) {
    // Create a measurement container that matches your real node environment
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.visibility = 'hidden';
    container.style.left = '-9999px';
    container.style.whiteSpace = 'pre-wrap'; // Preserve whitespace but wrap
    
    // Apply all base styles that your actual nodes use
    container.style.fontFamily = 'inherit'; // Or your specific font
    container.style.fontSize = 'inherit';   // Or your specific size
    container.style.lineHeight = 'normal';  // Or your specific line height
    container.style.boxSizing = 'border-box';
    
    // Create the measurement element
    const element = document.createElement('div');
    element.style.display = 'inline-block';
    element.innerHTML = text;
    container.appendChild(element);
    document.body.appendChild(container);


    // Apply custom styles
    if (styles && typeof styles === 'object' && !Array.isArray(styles)) {
        Object.assign(element.style, styles);
    }
    

    
    // Force layout calculation
    const width = Math.ceil(element.offsetWidth);
    const height = Math.ceil(element.offsetHeight);
    
    // Clean up
    document.body.removeChild(container);
    
    return {width, height};
};

    const getDimensionsOfNode = (node) => {
        const nodeStyles = {
            minWidth: nodeStyle.minWidth + 'px',
            minHeight: nodeStyle.minHeight + 'px',
            padding: nodeStyle.padding + 'px',
            maxWidth: nodeStyle.maxWidth + 'px',
            fontFamily: "'Roboto', sans-serif",
            fontSize: '11pt',
            ...calculateNodeStyle(node)
        };
        
        const {width, height} = getDimensionsOfText(node.text, nodeStyles);
        
        // Add buffer if needed (adjust these values based on your testing)
        return {
            width: Math.ceil(width * 1.05),  // 5% buffer
            height: Math.ceil(height * 1.1)   // 10% buffer for line height variations
        };
    };

    const scrollNodeIntoView = (node) => {
        const left = node.xPx;
        const right = node.xPx + node.width + 22
        const top = node.yPx;
        const bottom = node.yPx + node.height + 22;

        const screenLeft = documentRef.current.scrollLeft + 200;
        const screenTop = documentRef.current.scrollTop + 200;
        const screenRight = documentRef.current.scrollLeft + screenDimensions.width - 200;
        const screenBottom = documentRef.current.scrollTop + screenDimensions.height - 200;


        let dx = 0, dy = 0;
        if (left < screenLeft) dx = left - screenLeft
        else if (right > screenRight) dx = right - screenRight
        else dx = 0;

        if (top < screenTop) dy = top - screenTop
        else if (bottom > screenBottom) dy = bottom - screenBottom
        else dy = 0

        documentRef.current.scrollTo(documentRef.current.scrollLeft + dx, documentRef.current.scrollTop + dy)
    }

    const getNodeScreenPosition = (node) => {
        const left = node.xPx;
        const top = node.yPx;

        const screenLeft = documentRef.current.scrollLeft
        const screenTop = documentRef.current.scrollTop;

        return {x: left - screenLeft, y: top - screenTop}
    }
    const scrollNodeIntoPosition = (node, position) => {
        const newPos = getNodeScreenPosition(node);
        const dx = newPos.x - position.x
        const dy = newPos.y - position.y;

        const screenLeft = documentRef.current.scrollLeft
        const screenTop = documentRef.current.scrollTop;

        documentRef.current.scrollTo(screenLeft + dx, screenTop + dy)
    }

    const addToWaitingUpdateQueue = (d) => {
        setWaitingUpdateQueue((prev) => [...prev, d])
    }

    const scheduleUpdate = (temporaryId, d) => {
        if (updatePending[temporaryId]) updatePending[temporaryId].push(d)
        else updatePending[temporaryId] = [d]
    }

    const calculatePath = (node) => {
        const calculatePathSegment = (node, arr) => {
            arr.push(node.id)
            if (node.parent) calculatePathSegment(node.parent, arr)
        }

        const arr = [];
        calculatePathSegment(node, arr)
        return arr.reverse();
    }

    const getTemporaryId = () => {
        const id = temporaryIdCounter;
        setTemporaryIdCounter((prev) => prev+1)
        return id;
    }

    const createSiblingNode = (node, before, key) => {
        const idx = node.parent.children.indexOf(node);
        const temporaryId = getTemporaryId()
        node.parent.children = [...node.parent.children.slice(0, idx + (!before ? 1 : 0)), {text: '', width: nodeStyle.minWidth, height: nodeStyle.minHeight, temporaryId, creator: username}, ...node.parent.children.slice(idx + (!before ? 1 : 0), node.parent.children.length)]
        setData([...data])
        moveCursor(node.parent.children[idx + (!before ? 1 : 0)])
        setEditText(key ?? "")
        setIsEditing(true);
        setGridWindowRefresh(true);
        addToWaitingUpdateQueue(node.parent.children[idx + (!before ? 1 : 0)])
        if (node.id)
            socket.emit("newSiblingNode", {path: calculatePath(node), before, temporaryId})
        else
            scheduleUpdate(node.temporaryId, {node, before, type: 'newSiblingNode', temporaryId})
    }

    const createChildNode = (node, key) => {
        if (node.children) return appendChildNode(node, key)

        const temporaryId = getTemporaryId()
        node.children = [{text: '', width: nodeStyle.minWidth, height: nodeStyle.minHeight, temporaryId, creator: username}]
        setData([...data])
        moveCursor(node.children[0])
        addToWaitingUpdateQueue(node.children[0])
        setEditText(key ?? "")
        setIsEditing(true);
        setGridWindowRefresh(true);
        if (node.id)
            socket.emit("newChildNode", {path: calculatePath(node), temporaryId})
        else
            scheduleUpdate(node.temporaryId, {node, type: 'newChildNode', temporaryId})
    }

    const appendChildNode = (node, key) => {
        const temporaryId = getTemporaryId()
        node.children = [...node.children, {text: '', width: nodeStyle.minWidth, height: nodeStyle.minHeight, temporaryId, creator: username}]
        setData([...data])
        moveCursor(node.children[node.children.length-1])
        addToWaitingUpdateQueue(node.children[node.children.length-1])
        setEditText(key ?? "")
        setIsEditing(true);
        setGridWindowRefresh(true);
        if (node.id)
            socket.emit("appendChildNode", {path: calculatePath(node), temporaryId})
        else
            scheduleUpdate(node.temporaryId, {node, type: 'appendChildNode', temporaryId})
    }

    const updateNodeText = (node, text) => {
        node.text = text;
        const {width, height}= getDimensionsOfNode(node)
        node.width = width;
        node.height = height;
        node.creator = username
        scrollNodeIntoView(node)
        setIsEditing(false);
        setIsNewNode(false);
        setData([...data])
        if (node.id)
            socket.emit("updateNodeText", {path: calculatePath(node), text})
        else
            scheduleUpdate(node.temporaryId, {node, type: 'updateNodeText', text})
    }

    const editCell = (node, text) => {
        setIsEditing(true);
        setEditText(text ?? "");

        if (node.id)
            socket.emit("lockCell", {path: calculatePath(node)})
        else
            scheduleUpdate(node.temporaryId, {node, type: 'lockCell'})
    }

    const deleteCell = (node) => {
        const parent = node.parent;
        const idx = parent.children.indexOf(node);
        const children = node.children;
        if (children) {
            parent.children = [...parent.children.slice(0, idx), ...children, ...parent.children.slice(idx+1, parent.children.length)]
            moveCursor(children[0])
        }
        else {
            if (parent.children.length >= 2)
                parent.children = [...parent.children.slice(0, idx), ...parent.children.slice(idx+1, parent.children.length)]
            else
                parent.children = null

            setCursor(parent);
        }  
        setData([...data])

        const childrenWithoutIds = children ? children.filter((c) => !c.id) : []

        if (node.id && childrenWithoutIds.length === 0)
            socket.emit("deleteCell", {path: calculatePath(node), parent: parent.id})
        else {
            if (!node.id) {
                scheduleUpdate(node.temporaryId, {node, parent, children, type: 'deleteCell'})
            }
            if (childrenWithoutIds.length > 0) childrenWithoutIds.forEach((c) => {
                scheduleUpdate(c.temporaryId, {node, parent, children, type: 'deleteCell'})
            })
        }
    }




    useEffect(() => {
        const {width, height} = getDimensionsOfText(editText, {minWidth: nodeStyle.minWidth + 'px', minHeight: nodeStyle.minHeight + 'px', fontSize: '11pt', fontFamily: 'Arial, Helvetica, sans-serif'})
        setEditContainerDimensions({width: width+15, height})
    }, [editText])


    useLayoutEffect(() => {
        function updateSize() {
        setWindowSize({width: window.innerWidth, height: window.innerHeight});
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        const width = windowSize.width;
        const height = windowSize.height - 125 - (breadcrumbsDisplayed ? breadcrumbHeight : 0);
        setScreenDimensions({width, height})
    }, [windowSize, breadcrumbsDisplayed])


    useEffect(() => {
        if (isEditing && !gridWindowRefresh) {
          scrollNodeIntoView(cursor);
          editRef?.current?.focus()
        } else {
          documentRef.current.focus({preventScroll: true});
        }
      }, [isEditing, gridWindowRefresh]);

      useEffect(() => {
        setHoveredNode(null)
      }, [data])

      useEffect(() => {
        if (cursor) {
            scrollNodeIntoView(cursor)
        }
      }, [cursor])



     const docCtxt = {
        data,
        setData,
        setWaitingUpdateQueue,
        waitingUpdateQueue,
        setUpdatePending,
        updatePending,
        calculatePath,
        moveCursor,
        cursor,
        documentId,
        documentName,
        setDocumentName,
        nodeStyle,
        getDimensionsOfNode,
        isEditing,
        editText,
        getNodeScreenPosition,
        setGridWindowRefresh,
        deleteCell,
        updateNodeText,
        isNewNode,
        setIsNewNode,
        createSiblingNode,
        createChildNode,
        editCell,
        setIsEditing,
        grid,
        setGrid,
        screenPosition,
        setGridWindow,
        gridWindow,
        setScreenPosition,
        setTotalDimensions,
        setHoveredNode,
        hoveredNode,
        setEditText,
        screenDimensions,
        username,
        editContainerDimensions,
        totalDimensions,
        scrollNodeIntoPosition,
        scheduleUpdate,
        copyNode,
        pasteNode,
        selectedNodes,
        toggleCollapse,
        unmarkAsCopying,
        copyTreeToClipboard,
        breadcrumbs,
        setBreadcrumbs,
        breadcrumbHeight,
        pasteNodeAsChild,
        generateSuggestionAI
     }
    

    return (
        <DocumentContext.Provider value={docCtxt}>
        <div>
            <DocumentHeader setShowSharePopup={setShowSharePopup} />
            {breadcrumbsDisplayed && <BreadcrumbsTrail/> }
            <SharePopup show={showSharePopup} onHide={() => setShowSharePopup(false)}/>
            <DocumentSocket  />
            <div className="documentContainer">
            <img alt="" src={Background} width={screenDimensions.width} height={screenDimensions.height} style={{position: 'absolute'}}/>
            <div className="documentContent">
                        <DocumentKeys
                        getNodeScreenPosition={getNodeScreenPosition}
                        ref={documentRef}
                        >
                            {data.length === 0 ?
                            <img alt="Loading" src={Loading} style={{position: 'absolute', top: (window.innerHeight/2)-150, left: (window.innerWidth/2)-150}} />
                        :
                        <>
                            <DocumentRender />
                            <DocumentEditContainer ref={editRef} />         
                        </>}

                        </DocumentKeys>

            </div>
            </div>
        </div>
        </DocumentContext.Provider>
       
    )
}

export default Document