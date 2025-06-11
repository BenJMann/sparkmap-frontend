import { useEffect, useContext } from "react";

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
        selectedNodes
        } = useContext(DocumentContext)

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
                else node.firstNode = true
                prevNode = node;
                if (parent && xDepth > 1) {
                    node.parent = parent
                    }
                if (d[i+1]) {node.lastNode = false; node.nextNode = d[i+1]}
                else node.lastNode = true;
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
                                    <div onClick={(e) => {
                                        if (isEditing) updateNodeText(cursor, editText);
                                        moveCursor(row, e.shiftKey);
                                    }} 
                                        className={"cell " + (cursor===row ? 'selected ' : '') + (row.locked ? 'lockedCell' : (row.creator === username ? 'myCell' : 'yourCell') + (selectedNodes.includes(row) ? ' prevSelected' : ''))} 
                                        style={{left: row.xPx, top: row.yPx, height: row.height, width: row.width, ...calculateNodeStyle(row), ...(row.copying ? {border: '2px solid red'} : {}) }}
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
                            </>
                        )
                    })}
                    </>


    )
}

export default DocumentRender