export function createSVG(type: string, parent: Element) {
    const xmlns = "http://www.w3.org/2000/svg";

    const node = document.createElementNS(xmlns, type);
    parent.appendChild(node);
    return node;
}