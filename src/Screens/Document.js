import { useState, useEffect, useCallback, useRef, useContext, useLayoutEffect } from "react"
import { useParams } from "react-router-dom"
import { Plus, ShareAlt } from "@styled-icons/fa-solid"

import Background from "../Images/texture.jpg"

import { WebsocketsContext } from "../WebsocketsProvider"

import { LoginContext } from "../LoginProvider"

import SharePopup from '../Popups/SharePopup'

var getDimensionsOfText = function(text, styles) {
    var isObjectJSON = function(obj) {
        return obj && typeof obj === 'object' && !Array.isArray(obj);
    };

    var element = document.createElement('div');
    if (isObjectJSON(styles)) {
        var styleKeys = Object.keys(styles);
        for (var i = 0, n = styleKeys.length; i < n; ++i) {
            element.style[styleKeys[i]] = styles[styleKeys[i]];
        }
    }
    element.style.display = 'inline-block';
    element.innerHTML = text;
    document.body.appendChild(element);
    var width = element.offsetWidth;
    var height = element.offsetHeight;
    document.body.removeChild(element);
    return {width, height};
};

const Document = () => {
    const {documentId} = useParams()
    const {socket, socketLoaded} = useContext(WebsocketsContext);
    const {sessionLoaded, username } = useContext(LoginContext);
    const [nodeStyle, setNodeStyle] = useState({
        indent: 150,
        minWidth: 50,
        minHeight: 18,
        marginCollapsed: 5,
        marginExpanded: 20,
        padding: 5,
        maxWidth: 250
    })

    const [data, setData] = useState([])

    const [grid, setGrid] = useState([])
    const [gridWindow, setGridWindow] = useState([])
    const [screenPosition, setScreenPosition] = useState({x: 0, y: 0})
    const [screenDimensions, setScreenDimensions] = useState({width: 1800, height: 800})

    const [totalDimensions, setTotalDimensions] = useState({width: 0, height: 0})

    const [cursor, setCursor] = useState(data[0])
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState("")

    const editRef = useRef();
    const documentRef = useRef();


    const [gridWindowRefresh, setGridWindowRefresh] = useState(false)

    const [browseModifier, setBrowseModifier] = useState(false);
    const [screenPosBeforeBrowseModifierChange, setScreenPosBeforeBrowseModifierChange] = useState(null)
    const [hoverModifier, setHoverModifier] = useState(false);

    const [hoveredNode, setHoveredNode] = useState(null);

    const [isNewNode, setIsNewNode] = useState(false);

    const [showSharePopup, setShowSharePopup] = useState(false);

    const [temporaryIdCounter, setTemporaryIdCounter] = useState(0);

    const [waitingUpdateQueue, setWaitingUpdateQueue] = useState([])

    const [editContainerDimensions, setEditContainerDimensions] = useState({width: 0, height: 0})

    const getDimensionsOfNode = (node) => {
        const {width, height} = getDimensionsOfText(node.text, {minWidth: nodeStyle.minWidth + 'px', minHeight: nodeStyle.minHeight + 'px', padding: nodeStyle.padding + "px", maxWidth: nodeStyle.maxWidth + "px"})
        return {width: width+5, height}
    }


    const addToWaitingUpdateQueue = (d) => {
        setWaitingUpdateQueue((prev) => [...prev, d])
    }

    const getTemporaryId = () => {
        const id = temporaryIdCounter;
        setTemporaryIdCounter((prev) => prev+1)
        return id;
    }


    useEffect(() => {
        if (sessionLoaded) {
            socket.emit("loadDocument", {documentId})
        }
    }, [sessionLoaded])

    useEffect(() => {
        const {width, height} = getDimensionsOfText(editText, {minWidth: nodeStyle.minWidth + 'px', minHeight: nodeStyle.minHeight + 'px', fontSize: '11pt', fontFamily: 'Arial, Helvetica, sans-serif'})

        setEditContainerDimensions({width: width+15, height})
    }, [editText])

    const [windowSize, setWindowSize] = useState({width: 0, height: 0});
        useLayoutEffect(() => {
          function updateSize() {
            setWindowSize({width: window.innerWidth, height: window.innerHeight});
          }
          window.addEventListener('resize', updateSize);
          updateSize();
          return () => window.removeEventListener('resize', updateSize);
        }, []);

    useEffect(() => {
        const width = windowSize.width - 20;
        const height = windowSize.height - 150;
        setScreenDimensions({width, height})
    }, [windowSize])

    useEffect(() => {
        if (socketLoaded) {
            socket.removeAllListeners("newSiblingNodeCreated");
            socket.on("newSiblingNodeCreated", (d) => {
                const pathResult = resolvePath(d.path);
                if (pathResult.status === "success") {
                    const node = pathResult.node;
                    const idx = node.parent.children.indexOf(node);
                    node.parent.children = [...node.parent.children.slice(0, idx + (!d.before ? 1 : 0)), {text: '', id: d.id, creator: d.creator, width: nodeStyle.minWidth, height: nodeStyle.minHeight}, ...node.parent.children.slice(idx + (!d.before ? 1 : 0), node.parent.children.length)]
                    setData([...data])
                } else {
                    console.log("Path resolve error: " + pathResult.message)
                }
            })

            socket.removeAllListeners("newNodeCompleted");
            socket.on("newNodeCompleted", (d) => {
                const node = waitingUpdateQueue.find((n) => n.temporaryId === d.temporaryId)
                node.id = d.id;
                node.creator = d.creator;
                setData([...data])
            })

            socket.removeAllListeners("newChildNodeCreated");
            socket.on("newChildNodeCreated", (d) => {
                const pathResult = resolvePath(d.path);
                if (pathResult.status === "success") {
                    const node = pathResult.node;
                    node.children = [{text: '', id: d.id, creator: d.creator, width: nodeStyle.minWidth, height: nodeStyle.minHeight}]
                    setData([...data])
                } else {
                    console.log("Path resolve error: " + pathResult.message)
                }
            })

            socket.removeAllListeners("nodeTextUpdated");
            socket.on("nodeTextUpdated", (d) => {
                const pathResult = resolvePath(d.path);
                if (pathResult.status === "success") {
                    const node = pathResult.node;
                    node.text = d.text;
                    node.creator = d.creator;
                    const {width, height}= getDimensionsOfNode(d)
                    node.width = width;
                    node.height = height;
                    setData([...data])
                } else {
                    console.log("Path resolve error: " + pathResult.message)
                }
            })

            socket.removeAllListeners("documentLoaded");
            socket.on("documentLoaded", (d) => {
                function setWidth(node) {
                    const {width, height}= getDimensionsOfNode(node)
                    node.width = width;
                    node.height = height;
                    if (node.children) {
                        node.children.forEach((c) => setWidth(c))
                    }
                }
                setWidth(d.nodes[0]);
                setData(d.nodes)
            })
        }
    }, [socketLoaded, data])

    const createSiblingNode = (node, before, key) => {
        const idx = node.parent.children.indexOf(node);
        const temporaryId = getTemporaryId()
        node.parent.children = [...node.parent.children.slice(0, idx + (!before ? 1 : 0)), {text: '', width: nodeStyle.minWidth, height: nodeStyle.minHeight, temporaryId, creator: username}, ...node.parent.children.slice(idx + (!before ? 1 : 0), node.parent.children.length)]
        setData([...data])
        setCursor(node.parent.children[idx + (!before ? 1 : 0)])
        setEditText(key)
        setIsEditing(true);
        setGridWindowRefresh(true);
        addToWaitingUpdateQueue(node.parent.children[idx + (!before ? 1 : 0)])
        socket.emit("newSiblingNode", {path: calculatePath(node), before, temporaryId})
    }

    const createChildNode = (node, key) => {
        const temporaryId = getTemporaryId()
        node.children = [{text: '', width: nodeStyle.minWidth, height: nodeStyle.minHeight, temporaryId, creator: username}]
        setData([...data])
        setCursor(node.children[0])
        addToWaitingUpdateQueue(node.children[0])
        setEditText(key)
        setIsEditing(true);
        setGridWindowRefresh(true);
        socket.emit("newChildNode", {path: calculatePath(node), temporaryId})
    }

    const updateNodeText = (node, text) => {
        node.text = text;
        const {width, height}= getDimensionsOfNode(node)
        node.width = width;
        node.height = height;
        node.creator = username
        setIsEditing(false);
        setIsNewNode(false);
        setData([...data])
        socket.emit("updateNodeText", {path: calculatePath(node), text})
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

    const resolvePath = (path) => {
        const returnData = {}

        const resolvePathSegment = (node, arr) => {
            if (node.children) {
                const nextNode = node.children.find((n) => n.id === arr[0])
                if (nextNode) {
                    if (arr.length >1) {
                        resolvePathSegment(nextNode, arr.slice(1, arr.length))
                    } else {
                        returnData.status = "success"
                        returnData.node = nextNode;
                    }
                } else {
                    returnData.status = "fail"
                    returnData.message = "could not find node"
                }
            } else {
                returnData.status = "fail"
                returnData.message = "node did not have children"
            }
        }

        resolvePathSegment(data[0], path.slice(1, path.length))
        return returnData;
    }

    const scrollNodeIntoView = (node) => {
        const left = node.xPx;
        const right = node.xPx + node.width
        const top = node.yPx;
        const bottom = node.yPx + node.height + 22;

        const screenLeft = documentRef.current.scrollLeft
        const screenTop = documentRef.current.scrollTop;
        const screenRight = screenLeft + screenDimensions.width;
        const screenBottom = screenTop + screenDimensions.height;


        let dx = 0, dy = 0;
        if (left < screenLeft) dx = left - screenLeft
        else if (right > screenRight) dx = right - screenRight
        else dx = 0;

        if (top < screenTop) dy = top - screenTop
        else if (bottom > screenBottom) dy = bottom - screenBottom
        else dy = 0

        documentRef.current.scrollTo(screenLeft + dx, screenTop + dy)
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

    useEffect(() => {
        if (screenPosBeforeBrowseModifierChange && !gridWindowRefresh) {
            scrollNodeIntoPosition(cursor, screenPosBeforeBrowseModifierChange)
            setScreenPosBeforeBrowseModifierChange(null)
        }
    }, [screenPosBeforeBrowseModifierChange, gridWindowRefresh])
    useEffect(() => {
        if (isEditing && !gridWindowRefresh) {
          scrollNodeIntoView(cursor);
          setTimeout(() => editRef.current.focus(),10)
        } else {
          documentRef.current.focus();
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

    const handleKeyDown = useCallback((event) => {
        if (event.ctrlKey) {
            if (event.key === "e") {
                event.preventDefault();
                cursor && setScreenPosBeforeBrowseModifierChange(getNodeScreenPosition(cursor))
                setGridWindowRefresh(true);
                setBrowseModifier(!browseModifier);
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
                    setIsEditing(true);
                    setEditText(cursor.text);
                }
            }  
        }
        else if (event.key === "Escape") {
            if (isEditing) {
                setIsEditing(false);
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
                    setIsEditing(true);
                    setEditText(event.key);
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
     }, [cursor, isEditing, editText, data, browseModifier, hoverModifier])

     useEffect(() => {
        if (!browseModifier) {
            if (cursor && cursor.type === 'placeholder')
                setCursor(cursor.before ? cursor.nextNode : cursor.prevNode)
            else if (cursor && cursor.type === 'childPlaceholder') setCursor(cursor.parent);
        }
     }, [browseModifier])

    useEffect(() => {
        let y = 0;
        let arr = []
        let totalHeight = 0;
        let maxDepth = 0;
        let maxX = 0;

        const topMargin = browseModifier ? nodeStyle.marginExpanded : nodeStyle.marginCollapsed;

        const getNode = (d, xDepth, parent) => {
            let prevChildren = false;
            maxDepth = Math.max(xDepth-1, maxDepth)
            let prevNode = undefined;
            d.forEach((node, i) => {
                node.y = y;
                node.x = xDepth-1
                node.yPx = totalHeight + topMargin;
                node.xPx = parent && !parent.root ? parent.xPx + parent.width : 0;
                maxX = Math.max(node.xPx + node.width, maxX)
                if (prevNode) {node.firstNode = false; node.prevNode = prevNode;}
                else node.firstNode = true
                prevNode = node;
                if (parent) {
                    node.parent = parent
                    }
                if (d[i+1]) {node.lastNode = false; node.nextNode = d[i+1]}
                else node.lastNode = true;
                    node.prevPlaceholder = {
                        type: 'placeholder',
                        before: true,
                        nextNode: node,
                        prevNode: node.prevNode,
                        parent: node.parent,
                        children: node.children,
                        yPx: totalHeight,
                        xPx: node.xPx
                    }
                node.nextPlaceholder = {
                    type: 'placeholder',
                    before: false,
                    prevNode: node,
                    nextNode: node.nextNode,
                    parent: node.parent,
                    children: node.children,
                    yPx: totalHeight + node.height+ (browseModifier ? nodeStyle.marginExpanded : nodeStyle.marginCollapsed),
                    xPx: node.xPx
                }
                if (!node.children) {
                    node.childPlaceholder = {
                        type: 'childPlaceholder',
                        parent: node,
                        prevNode: node.prevNode,
                        nextNode: node.nextNode,
                        yPx: totalHeight + nodeStyle.marginExpanded,
                        xPx: node.xPx + node.width
                    }
                }
                if (!node.root) {
                    arr.push(node)
                    const nextMargin = browseModifier ? nodeStyle.marginExpanded : nodeStyle.marginCollapsed;

                    totalHeight += node.height + nextMargin;
                }
                y++;
                prevChildren = false;
                if (node.children) {
                    getNode(node.children, xDepth+1, node)
                    prevChildren = true;
                }
            })
        }
        getNode(data, 0);
        setGrid(arr);
        setTotalDimensions({width:maxX, height: totalHeight})
    }, [data, browseModifier])

    useEffect(() => {
        const arr = []
        grid.forEach((row, y) => {
            const inYbounds = row.yPx + row.height + nodeStyle.marginCollapsed >= screenPosition.y && row.yPx + nodeStyle.marginCollapsed <= (screenPosition.y + screenDimensions.height)
            const inXbounds = row.xPx + row.width >= screenPosition.x && row.xPx  <= screenPosition.x + screenDimensions.width
            if ((inYbounds && inXbounds) || row === cursor) { 
                 arr.push(row)
            }
        })
        setGridWindow(arr);
        setGridWindowRefresh(false)
    }, [screenPosition, grid])

    return (
        <div>
            <div className="documentHeader">
                <div className="alignRight">
                    <div className="shareButton" onClick={() => setShowSharePopup(true)}>
                        <ShareAlt width="30px" height="30px"/>
                    </div>
                </div>
            </div>
            <SharePopup show={showSharePopup} onHide={() => setShowSharePopup(false)}/>
            <div className="documentContainer">
            <img src={Background} width={screenDimensions.width} height={screenDimensions.height} style={{position: 'absolute'}}/>
            <div className="documentContent">
                <div className="documentContent inner" 
                onScroll={(e) => {setScreenPosition({x: e.currentTarget.scrollLeft, y: e.currentTarget.scrollTop})}} 
                style={{width: screenDimensions.width, height: screenDimensions.height}}
                tabIndex="0"
                onKeyDown={handleKeyDown} 
                ref={documentRef}>
                    <>
                    {gridWindow.map((row, y) => {
                        if (!row) return null
                        return (
                            <>
                            {
                                (!isEditing || cursor !== row) ?
                                                
                                <div 
                                onMouseEnter={() => setHoveredNode(row)} 
                                onMouseLeave={() => setHoveredNode(null)}
                                >
                                {(browseModifier && (hoveredNode === row || cursor===row.prevPlaceholder)) &&
                                    <div className="placeholder" style={{top: row.prevPlaceholder.yPx, left: row.prevPlaceholder.xPx, minWidth: row.width, minHeight: nodeStyle.marginExpanded}}>
                                        <div onClick={() => {
                                            createSiblingNode(row, true)
                                        }} className={"circle " + (cursor===row.prevPlaceholder ? 'placeholderHighlighted' : '')}>
                                            <Plus  />
                                        </div>
                                    </div>
                                    }
                                    
                                    
                                    
                                    <div onClick={() => {
                                        if (isEditing) {
                                            updateNodeText(cursor, editText);
                                        } setCursor(row);
                                    }} 
                                    className={"cell " + (cursor===row ? 'selected ' : '') + (row.creator === username ? 'myCell' : 'yourCell')} 
                                    style={{left: row.xPx, top: row.yPx, height: row.height, width: row.width }}
                                    >
                                        <div style={{position: 'relative', padding: nodeStyle.padding}}>{row.text}
                                        </div>
                                    </div>
                                
                                    {
                                    (browseModifier&& (hoveredNode === row || cursor===row.nextPlaceholder))  &&
                                    <div className={"placeholder" } style={{top: row.nextPlaceholder.yPx, left: row.nextPlaceholder.xPx, minWidth: row.width, minHeight: nodeStyle.marginExpanded}}>
                                        <div onClick={() => {
                                            createSiblingNode(row, false)
                                        }} className={"circle " + (cursor===row.nextPlaceholder ? 'placeholderHighlighted' : '')}>
                                            <Plus  />
                                        </div>
                                    </div>
                                    }

                                    {row.childPlaceholder &&
                                    <>
                                        {
                                        (browseModifier && (hoveredNode === row || cursor===row.childPlaceholder)) &&
                                        <div className={"placeholder" } style={{top: row.childPlaceholder.yPx, left: row.childPlaceholder.xPx, minWidth: nodeStyle.marginExpanded, minHeight: row.height}}>
                                            <div onClick={() => {
                                                createChildNode(row)
                                            }} className={"circle " + (cursor===row.childPlaceholder ? 'placeholderHighlighted' : '')}>
                                                <Plus  />
                                            </div>
                                        </div>
                                        }
                                    </>
                                    }




                                </div>
                                :
                                <div className="editContainer" style={{top: row.yPx, left: row.x*nodeStyle.indent, width: editContainerDimensions.width, height: editContainerDimensions.height}}>
                                    <input value={editText} ref={editRef} onChange={(e) => setEditText(e.target.value)} />
                                </div>
                            }
                            </>
                        )
                    })}
                    </>

                    <div className="stretcher" style={{top: totalDimensions.height, left: totalDimensions.width}}></div>
                </div>
            </div>
            </div>
        </div>
       
    )
}

export default Document