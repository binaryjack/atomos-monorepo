export const edge = function (props) {
    Object.defineProperty(this, 'position', {
        value: props.position,
        enumerable: false,
        writable: false
    });
    Object.defineProperty(this, 'entityId', {
        value: props.entityId,
        enumerable: false,
        writable: false
    });
    Object.defineProperty(this, 'thickness', {
        value: props.thickness,
        enumerable: false,
        writable: true
    });
    Object.defineProperty(this, 'anchors', {
        value: props.anchors,
        enumerable: false,
        writable: true
    });
    Object.defineProperty(this, 'isHighlighted', {
        value: props.isHighlighted,
        enumerable: false,
        writable: true
    });
    return this;
};
//# sourceMappingURL=edge.js.map