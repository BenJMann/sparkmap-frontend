import { useEffect, forwardRef, useContext } from "react";
import { Plus } from "@styled-icons/fa-solid"

import { DocumentContext } from "./Document";

import calculateNodeStyle from "../CalculateNodeStyles";

const DocumentRender = () => {
    const {data, grid, setGrid, gridWindow, setGridWindow, setGridWindowRefresh,
        screenPosition, setScreenPosition, screenDimensions, totalDimensions, setTotalDimensions,
        setCursor, cursor,
        isEditing, editText, setEditText, editContainerDimensions,
        browseModifier, setHoveredNode, hoveredNode,
        createSiblingNode, createChildNode, updateNodeText,
        nodeStyle,username
        } = useContext(DocumentContext)

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
                                    className={"cell " + (cursor===row ? 'selected ' : '') + (row.locked ? 'lockedCell' : (row.creator === username ? 'myCell' : 'yourCell'))} 
                                    style={{left: row.xPx, top: row.yPx, height: row.height, width: row.width, ...calculateNodeStyle(row), ...(row.copying ? {border: '2px solid red'} : {}) }}
                                    >
                                        <div className="cellText" style={{position: 'relative', padding: nodeStyle.padding}}>{row.text}
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
                                null
                            }
                            </>
                        )
                    })}
                    </>


    )
}

export default DocumentRender