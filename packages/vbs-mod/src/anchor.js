export const anchor = function (props) {
    Object.defineProperty(this, 'id', {
        value: props.id,
        enumerable: false,
        writable: false
    });
    Object.defineProperty(this, 'edgePosition', {
        value: props.edgePosition,
        enumerable: false,
        writable: false
    });
    Object.defineProperty(this, 'offset', {
        value: props.offset,
        enumerable: false,
        writable: true
    });
    Object.defineProperty(this, 'linkId', {
        value: props.linkId,
        enumerable: false,
        writable: true
    });
    return this;
};
//# sourceMappingURL=anchor.js.map