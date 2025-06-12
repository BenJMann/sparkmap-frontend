function rgbToHsv({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;

  if (delta) {
    switch (max) {
      case r: h = ((g - b) / delta) % 6; break;
      case g: h = (b - r) / delta + 2; break;
      case b: h = (r - g) / delta + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h, s, v };
}

function hsvToRgb({ h, s, v }) {
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function isTextVisible(bg, text = { r: 0, g: 0, b: 0 }) {
  const luminance = ({ r, g, b }) => {
    const toLin = (c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
  };

  const L1 = luminance(bg);
  const L2 = luminance(text);
  const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);

  return ratio >= 4.5;
}

const colorNameToHue = {
  red: 0,
  orange: 30,
  yellow: 60,
  lime: 90,
  green: 120,
  teal: 150,
  cyan: 180,
  "sky blue": 210,
  blue: 240,
  indigo: 270,
  violet: 300,
  magenta: 330
};


const modifyHue = (hsv, delta) => {
  const newH = (hsv.h + delta + 360) % 360;
  return { ...hsv, h: newH }
};

function modifySaturation(hsv, delta) {
  const newS = Math.min(1, Math.max(0, hsv.s + delta));
  return { ...hsv, s: newS };
}


function modifyValue(hsv, delta) {
  const newV = Math.min(1, Math.max(0, hsv.v + delta));
  return { ...hsv, v: newV };
}

function moveHueToward(currentHue, targetHue, step) {
  if (typeof targetHue === 'string') targetHue = colorNameToHue(targetHue)
  const delta = ((targetHue - currentHue + 540) % 360) - 180;
  const shift = Math.abs(delta) < step ? delta : Math.sign(delta) * step;
  return (currentHue + shift + 360) % 360;
}


const calculateNodeStyle = (node, selectedNodes) => {
    const styles = {}
    if (node.style?.isBold) styles.fontWeight = 'bold'
    if (node.style?.isItalic) styles.fontStyle = 'italic'
    if (node.style?.isUnderlined) styles.textDecoration = "underline"
    if (node.style?.selectedFont) styles.fontFamily = node.style.selectedFont
    if (node.style?.fontSize) styles.fontSize = node.style.fontSize
    if (node.style?.textColor) styles.color = node.style.textColor
    if (node.style?.fillColor) styles.backgroundColor = node.style.fillColor
    const isSelected = selectedNodes?.includes(node);
    if (isSelected && ! node.copying) styles.boxShadow = '0 0 7px 2px blue'
    if (!isSelected && node.copying) styles.boxShadow = '0 0 7px 2px red'
    if (isSelected && node.copying) styles.boxShadow = '0 0 7px 2px rgb(255, 0, 174)'
    return styles;

}

export default calculateNodeStyle