export const link = function (props) {
    Object.defineProperty(this, 'id', {
        value: props.id,
        enumerable: false,
        writable: false
    });
    Object.defineProperty(this, 'leftEntityId', {
        value: props.leftEntityId,
        enumerable: false,
        writable: false
    });
    Object.defineProperty(this, 'rightEntityId', {
        value: props.rightEntityId,
        enumerable: false,
        writable: false
    });
    Object.defineProperty(this, 'leftCardinality', {
        value: props.leftCardinality,
        enumerable: false,
        writable: true
    });
    Object.defineProperty(this, 'rightCardinality', {
        value: props.rightCardinality,
        enumerable: false,
        writable: true
    });
    Object.defineProperty(this, 'renderType', {
        value: props.renderType,
        enumerable: false,
        writable: true
    });
    Object.defineProperty(this, 'leftAnchorId', {
        value: props.leftAnchorId,
        enumerable: false,
        writable: true
    });
    Object.defineProperty(this, 'rightAnchorId', {
        value: props.rightAnchorId,
        enumerable: false,
        writable: true
    });
    return this;
};
//# sourceMappingURL=link.js.map