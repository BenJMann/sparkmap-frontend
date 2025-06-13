import { useEffect, useContext, useState } from "react";

import { DocumentContext } from "./Document";

import calculateNodeStyle from "../CalculateNodeStyles";

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const DocumentRender = () => {
    const {data, grid, setGrid, gridWindow, setGridWindow, setGridWindowRefresh,
        screenPosition, screenDimensions, setTotalDimensions,
        moveCursor, cursor,
        isEditing, editText,
        browseModifier, setHoveredNode, updateNodeText,
        nodeStyle,username,
        selectedNodes,
        setBreadcrumbs
        } = useContext(DocumentContext)

        const [gridWindowWithoutCursor, setGridWindowWithoutCursor] = useState([])

    useEffect(() => {
        let y = 0;
        let arr = []
        let totalHeight = 0;
        let maxDepth = 0;
        let maxX = 0;

        const topMargin = nodeStyle.marginCollapsed;

        const getNode = (d, xDepth, parent) => {
            maxDepth = Math.max(xDepth-1, maxDepth)
            let prevNode;
            d.forEach((node, i) => {
                node.y = y;
                node.x = xDepth-1
                node.yPx = totalHeight + topMargin;
                node.xPx = parent && !parent.root ? parent.xPx + parent.width : 0;
                maxX = Math.max(node.xPx + node.width, maxX)
                if (prevNode) {node.firstNode = false; node.prevNode = prevNode;}
                else {node.firstNode = true; node.prevNode = undefined; }
                prevNode = node;
                if (parent) {
                    node.parent = parent
                    }
                if (d[i+1]) {node.lastNode = false; node.nextNode = d[i+1]}
                else {node.lastNode = true; node.nextNode = undefined}
                if (!node.root) {
                    arr.push(node)

                    totalHeight += node.height + nodeStyle.marginCollapsed;
                }
                y++;
                if (node.children && !node.collapsed) {
                    getNode(node.children, xDepth+1, node)
                }
            })
        }
        getNode(data, 0);
        setGrid(arr);
        setTotalDimensions({width:maxX, height: totalHeight})
    }, [data, browseModifier])

    useEffect(() => {
        const arr = []
        const arrNoCursor = [];
        grid.forEach((row, y) => {
            const inYbounds = row.yPx + row.height + nodeStyle.marginCollapsed >= screenPosition.y && row.yPx + nodeStyle.marginCollapsed <= (screenPosition.y + screenDimensions.height)
            const inXbounds = row.xPx + row.width >= screenPosition.x && row.xPx  <= screenPosition.x + screenDimensions.width
            if ((inYbounds && inXbounds)) { 
                 arr.push(row)
                 arrNoCursor.push(row)
            }
            else if (row === cursor) {
                arr.push(row)
            }
        })
        setGridWindow(arr);
        setGridWindowWithoutCursor(arrNoCursor);
    }, [screenPosition, grid])

 
    const [spans, setSpans] = useState([])
    useEffect(() => {
        if (!gridWindowWithoutCursor?.length) return;

        const parentsNodeList = [];
        let node = gridWindowWithoutCursor[0];

        // Find parent nodes with nextNode outside `gridWindow`
        while (node?.parent && !node.parent.root) {
            node = node.parent;
            if (node.nextNode && !gridWindowWithoutCursor.includes(node.nextNode)) {
                parentsNodeList.push(node);
            }
        }

        const partialsList = [];

        gridWindowWithoutCursor.forEach((n) => {
            if (!parentsNodeList.includes(n)) {
                // Clamp 'above' span height to avoid negative/oversized values
                if (n.prevNode && !gridWindowWithoutCursor.includes(n.prevNode)) {
                    const spanTop = screenPosition.y;
                    const spanBottom = n.yPx;
                    const height = Math.max(0, spanBottom - spanTop); // Ensure height ≥ 0
                    partialsList.push({
                        x: n.xPx + n.width / 2,
                        y: spanTop,
                        type: 'above',
                        height,
                    });
                }

                // Clamp 'below' span height
                if (n.nextNode && !gridWindowWithoutCursor.includes(n.nextNode)) {
                    const spanTop = n.yPx + n.height;
                    const spanBottom = screenPosition.y + screenDimensions.height;
                    const height = Math.max(0, spanBottom - spanTop); // Ensure height ≥ 0
                    partialsList.push({
                        x: n.xPx + n.width / 2,
                        y: spanTop,
                        type: 'below',
                        height,
                    });
                }
            }
        });

        // Full-height spans (if needed)
        const fullHeightSpans = parentsNodeList.map((node) => ({
            x: node.xPx + node.width / 2,
            type: 'fullHeight',
            height: screenDimensions.height,
        }));

        setSpans([...fullHeightSpans, ...partialsList]);
        setGridWindowRefresh(false);
    }, [gridWindowWithoutCursor, screenPosition.y, screenDimensions.height]);



    useEffect(() => {
        if (!cursor) return setBreadcrumbs([])
        const inYbounds = cursor.yPx + cursor.height + nodeStyle.marginCollapsed >= screenPosition.y && cursor.yPx + nodeStyle.marginCollapsed <= (screenPosition.y + screenDimensions.height)
       if (!inYbounds) return setBreadcrumbs([]);
        let node = cursor;
        const parentsNodeList = [];

        while (node?.parent && !node.parent.root) {
            node = node.parent;
            if (!gridWindow.includes(node)) {
                parentsNodeList.push(node);
            }
        }
        setBreadcrumbs(parentsNodeList.reverse().filter((bc) => bc.xPx + bc.width - screenPosition.x >= 0));
    }, [gridWindow, cursor, screenPosition.x])

    return (
                    <>
                    {spans.map((s, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                left: `${s.x}px`,
                                top: s.type === 'above' ? `${screenPosition.y}px` : 
                                    s.type === 'below' ? `${s.y}px` : 
                                    `${screenPosition.y}px`,
                                width: '6px',
                                height: s.type === 'fullHeight' ? `${s.height}px` : 
                                    s.type === 'above' ? `${s.height}px` : 
                                    `${s.height}px`,
                                pointerEvents: 'none', // Prevent blocking clicks
                            }}
                        >
                            <div style={{height: '100%', width: '50%', borderRight: '1px dashed #777'}} />
                        </div>
                    ))}
                    {gridWindow.map((row, i) => {
                        if (!row) return null
                        return (
                            <div key={i}>
                            {
                                (!isEditing || cursor !== row) ?
                                                
                                <div 
                                onMouseEnter={() => setHoveredNode(row)} 
                                onMouseLeave={() => setHoveredNode(null)}
                                >                                  
                                    <div onClick={(e) => {
                                        if (isEditing) updateNodeText(cursor, editText);
                                        moveCursor(row, e.shiftKey);
                                    }} 
                                        className={"cell " + (cursor===row ? 'selected ' : '') + (row.locked ? 'lockedCell' : (row.creator === username ? 'myCell' : 'yourCell'))} 
                                        style={{left: row.xPx, top: row.yPx, height: row.height, width: row.width, ...calculateNodeStyle(row, selectedNodes) }}
                                    >
                                        <div className="cellText" style={{position: 'relative', padding: nodeStyle.padding}}>{row.text}</div>
                                    </div>
                                    {row.collapsed &&
                                        <AddCircleOutlineIcon className="plusIcon" style={{position: 'absolute', left: row.xPx + row.width + 5, top: row.yPx + row.height/2 - 9}}/>
                                    }
                                </div>
                                :
                                null
                            }
                            </div>
                        )
                    })}
                    </>


    )
}

export default DocumentRender