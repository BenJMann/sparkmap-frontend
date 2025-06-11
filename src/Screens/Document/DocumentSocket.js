import { useEffect, useContext, useState } from "react";
import { WebsocketsContext } from "../../WebsocketsProvider"
import { LoginContext } from "../../LoginProvider"
import { DocumentContext } from "./Document";

const DocumentSocket = () => {
    const {socket, socketLoaded, socketDisconnected} = useContext(WebsocketsContext);
    const {loggedIn} = useContext(LoginContext)
    const {data, setData, setWaitingUpdateQueue, waitingUpdateQueue, setUpdatePending, updatePending, calculatePath, moveCursor, cursor, documentId, nodeStyle, getDimensionsOfNode, setDocumentName, pasteNode} = useContext(DocumentContext)

    const runScheduledUpdates = (temporaryId) => {
        if (!updatePending[temporaryId]) return;

        const updates = updatePending[temporaryId];

        updates.forEach((upd) => {
            if (upd.type === "newSiblingNode")
                socket.emit("newSiblingNode", {path: calculatePath(upd.node), before: upd.before, temporaryId: upd.temporaryId})
            else if (upd.type === "newChildNode")
                socket.emit("newChildNode", {path: calculatePath(upd.node), temporaryId: upd.temporaryId})
            else if (upd.type === "appendChildNode")
                socket.emit("appendChildNode", {path: calculatePath(upd.node), temporaryId: upd.temporaryId})
            else if (upd.type === "updateNodeText")
                socket.emit("updateNodeText", {path: calculatePath(upd.node), text: upd.text})
            else if (upd.type === 'lockCell')
                socket.emit("lockCell", {path: calculatePath(upd.node)})
            else if (upd.type === 'updateNodeStyle')
                socket.emit("updateNodeStyle", {path: calculatePath(upd.node), property: upd.property, value: upd.value})

            else if (upd.type === 'deleteCell') {
                const childrenWithoutIds = upd.children ? upd.children.filter((c) => !c.id) : []
                if (upd.node.id && childrenWithoutIds.length === 0)
                    socket.emit("deleteCell", {path: calculatePath(upd.node), parent: upd.parent.id})
            }
        })

        setUpdatePending((prev) => ({...prev, [temporaryId] : null}))
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

        resolvePathSegment(data[0], path)
        return returnData;
    }


    useEffect(() => {
        if (socketLoaded && loggedIn) {
            socket.emit("loadDocument", {documentId})
        }
    }, [socketLoaded, loggedIn])




    useEffect(() => {
        if (socketLoaded) {
            socket.removeAllListeners("newSiblingNodeCreated");
            socket.on("newSiblingNodeCreated", (d) => {
                const pathResult = resolvePath(d.path);
                if (pathResult.status === "success") {
                    const node = pathResult.node;
                    const idx = node.parent.children.indexOf(node);
                    node.parent.children = [...node.parent.children.slice(0, idx + (!d.before ? 1 : 0)), {text: '', id: d.id, creator: d.creator, width: nodeStyle.minWidth, height: nodeStyle.minHeight, locked: d.locked}, ...node.parent.children.slice(idx + (!d.before ? 1 : 0), node.parent.children.length)]
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
                
                const idx = waitingUpdateQueue.indexOf(node);
                setWaitingUpdateQueue([...waitingUpdateQueue.slice(0, idx), ...waitingUpdateQueue.slice(idx+1, waitingUpdateQueue.length)])

                runScheduledUpdates(d.temporaryId)
            })

            socket.removeAllListeners("newChildNodeCreated");
            socket.on("newChildNodeCreated", (d) => {
                const pathResult = resolvePath(d.path);
                if (pathResult.status === "success") {
                    const node = pathResult.node;
                    node.children = [{text: '', id: d.id, creator: d.creator, width: nodeStyle.minWidth, height: nodeStyle.minHeight, locked: d.locked}]
                    setData([...data])
                } else {
                    console.log("Path resolve error: " + pathResult.message)
                }
            })

            socket.removeAllListeners("newChildNodeAppended");
            socket.on("newChildNodeAppended", (d) => {
                const pathResult = resolvePath(d.path);
                if (pathResult.status === "success") {
                    const node = pathResult.node;
                    node.children = [...node.children, {text: '', id: d.id, creator: d.creator, width: nodeStyle.minWidth, height: nodeStyle.minHeight, locked: d.locked}]
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
                    node.locked = false;
                    const {width, height}= getDimensionsOfNode(node)
                    node.width = width;
                    node.height = height;
                    setData([...data])
                } else {
                    console.log("Path resolve error: " + pathResult.message)
                }
            })

            socket.removeAllListeners("nodeStyleUpdated");
            socket.on("nodeStyleUpdated", (d) => {
                const pathResult = resolvePath(d.path);
                if (pathResult.status === "success") {
                    const node = pathResult.node;
                    console.log(node)
                    if (!node.style) node.style = {}
                    if (d.property === 'selectedFont') node.style.selectedFont = d.value
                    else if (d.property === 'isBold') node.style.isBold = d.value
                    else if (d.property === 'isItalic') node.style.isItalic = d.value
                    else if (d.property === 'isUnderlined') node.style.isUnderlined= d.value
                    else if (d.property === 'fontSize') node.style.fontSize = d.value
                    else if (d.property === 'textColor') node.style.textColor = d.value
                    else if (d.property === 'fillColor') node.style.fillColor = d.value
                    const {width, height}= getDimensionsOfNode(node)
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
                setDocumentName(d.document.documentName)
            })

            socket.removeAllListeners("cellLocked");
            socket.on("cellLocked", (d) => {
                const pathResult = resolvePath(d.path);
                if (pathResult.status === "success") {
                    const node = pathResult.node;
                    node.locked = d.locked
                    setData([...data])
                } else {
                    console.log("Path resolve error: " + pathResult.message)
                }
            })

            socket.removeAllListeners("cellDeleted");
            socket.on("cellDeleted", (d) => {
                const pathResult = resolvePath(d.path);
                if (pathResult.status === "success") {
                    const node = pathResult.node;
                    const parent = node.parent;
                    const idx = parent.children.indexOf(node);
                    const children = node.children;
                    const cursorOnNode = cursor && cursor.id === node.id;

                    if (children) {
                        parent.children = [...parent.children.slice(0, idx), ...children, ...parent.children.slice(idx+1, parent.children.length)]
                        if (cursorOnNode) {
                            moveCursor(children[0])
                        }
                    }
                    else {
                        if (parent.children.length >= 2)
                            parent.children = [...parent.children.slice(0, idx), ...parent.children.slice(idx+1, parent.children.length)]
                        else
                            parent.children = null
            
                        if (cursorOnNode) moveCursor(parent);
                    }  
                    setData([...data])
                } else {
                    console.log("Path resolve error: " + pathResult.message)
                }
            })

            socket.removeAllListeners("nodePasted");
            socket.on("nodePasted", (d) => {
                const pathResultFrom = resolvePath(d.fromPath);
                if (pathResultFrom.status !== "success")
                        console.log("Path resolve error From node: " + pathResultFrom.message)
                const pathResultTo = resolvePath(d.toPath);
                if (pathResultTo.status !== "success")
                        console.log("Path resolve error To node: " + pathResultTo.message)

                if (pathResultFrom.status === "success" && pathResultTo.status === "success") {
                    const fromNode = pathResultFrom.node;
                    const toNode = pathResultTo.node;
                    pasteNode(toNode, fromNode, d.before, d.child)
                }
            })
        }
    }, [socketLoaded, data, cursor])

    if (socketDisconnected) {
        return <div className="disconnectBar">Socket disconnected. Please refresh the page.</div>
    }
    return null
}

export default DocumentSocket