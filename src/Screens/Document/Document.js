import { useState, useEffect, useCallback, useRef, useContext, useLayoutEffect, createContext } from "react"
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
import { V } from "@styled-icons/fa-solid"

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
        padding: 5,
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

    const [browseModifier, setBrowseModifier] = useState(false);
    const [screenPosBeforeBrowseModifierChange, setScreenPosBeforeBrowseModifierChange] = useState(null)

    const [hoveredNode, setHoveredNode] = useState(null);

    const [isNewNode, setIsNewNode] = useState(false);

    const [showSharePopup, setShowSharePopup] = useState(false);

    const [temporaryIdCounter, setTemporaryIdCounter] = useState(0);

    const [waitingUpdateQueue, setWaitingUpdateQueue] = useState([])
    const [updatePending, setUpdatePending] = useState({})

    const [windowSize, setWindowSize] = useState({width: 0, height: 0});
    const [editContainerDimensions, setEditContainerDimensions] = useState({width: 0, height: 0})


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

    const getDimensionsOfNode = (node) => {
        const {width, height} = getDimensionsOfText(node.text, {minWidth: nodeStyle.minWidth + 'px', minHeight: nodeStyle.minHeight + 'px', padding: nodeStyle.padding + "px", maxWidth: nodeStyle.maxWidth + "px"})
        return {width: width+5, height}
    }

    const scrollNodeIntoView = (node) => {
        const left = node.xPx;
        const right = node.xPx + node.width + 22
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
        setCursor(node.parent.children[idx + (!before ? 1 : 0)])
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
        const temporaryId = getTemporaryId()
        node.children = [{text: '', width: nodeStyle.minWidth, height: nodeStyle.minHeight, temporaryId, creator: username}]
        setData([...data])
        setCursor(node.children[0])
        addToWaitingUpdateQueue(node.children[0])
        setEditText(key ?? "")
        setIsEditing(true);
        setGridWindowRefresh(true);
        if (node.id)
            socket.emit("newChildNode", {path: calculatePath(node), temporaryId})
        else
            scheduleUpdate(node.temporaryId, {node, type: 'newChildNode', temporaryId})
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
            setCursor(children[0])
        }
        else {
            if (parent.children.length > 2)
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
        const width = windowSize.width - 20;
        const height = windowSize.height - 150;
        setScreenDimensions({width, height})
    }, [windowSize])

  

    

    useEffect(() => {
        if (screenPosBeforeBrowseModifierChange && !gridWindowRefresh) {
            scrollNodeIntoPosition(cursor, screenPosBeforeBrowseModifierChange)
            setScreenPosBeforeBrowseModifierChange(null)
        }
    }, [screenPosBeforeBrowseModifierChange, gridWindowRefresh])


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

    

     useEffect(() => {
        if (!browseModifier) {
            if (cursor && cursor.type === 'placeholder')
                setCursor(cursor.before ? cursor.nextNode : cursor.prevNode)
            else if (cursor && cursor.type === 'childPlaceholder') setCursor(cursor.parent);
        }
     }, [browseModifier])

     const docCtxt = {
        data,
        setData,
        setWaitingUpdateQueue,
        waitingUpdateQueue,
        setUpdatePending,
        updatePending,
        calculatePath,
        setCursor,
        cursor,
        documentId,
        documentName,
        setDocumentName,
        nodeStyle,
        getDimensionsOfNode,
        setScreenPosBeforeBrowseModifierChange,
        isEditing,
        editText,
        browseModifier,
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
        grid,
        setGrid,
        screenPosition,
        setGridWindow,
        gridWindow,
        setScreenPosition,
        setTotalDimensions,
        setHoveredNode,
        hoveredNode,
        updateNodeText,
        setEditText,
        screenDimensions,
        username,
        editContainerDimensions,
        totalDimensions,
        scrollNodeIntoPosition
     }
    

    return (
        <DocumentContext.Provider value={docCtxt}>
        <div>
            <DocumentHeader setShowSharePopup={setShowSharePopup} />
            <SharePopup show={showSharePopup} onHide={() => setShowSharePopup(false)}/>
            <DocumentSocket  />
            <div className="documentContainer">
            <img src={Background} width={screenDimensions.width} height={screenDimensions.height} style={{position: 'absolute'}}/>
            <div className="documentContent">
                        <DocumentKeys
                        getNodeScreenPosition={getNodeScreenPosition}
                        ref={documentRef}
                        >
                            {data.length === 0 ?
                            <img src={Loading} style={{position: 'absolute', top: (window.innerHeight/2)-150, left: (window.innerWidth/2)-150}} />
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