const calculateNodeStyle = (node) => {
    if (!node.style) return {}
    const styles = {}
    if (node.style.isBold) styles.fontWeight = 'bold'
    if (node.style.isItalic) styles.fontStyle = 'italic'
    if (node.style.isUnderlined) styles.textDecoration = "underline"
    if (node.style.selectedFont) styles.fontFamily = node.style.selectedFont
    if (node.style.fontSize) styles.fontSize = node.style.fontSize
    if (node.style.textColor) styles.color = node.style.textColor
    if (node.style.fillColor) styles.backgroundColor = node.style.fillColor
    return styles;

}

export default calculateNodeStyle