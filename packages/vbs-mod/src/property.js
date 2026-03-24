export const property = function (props) {
    Object.defineProperty(this, 'key', {
        value: props.key,
        enumerable: false,
        writable: false
    });
    Object.defineProperty(this, 'value', {
        value: props.value,
        enumerable: false,
        writable: true
    });
    Object.defineProperty(this, 'type', {
        value: props.type,
        enumerable: false,
        writable: false
    });
    Object.defineProperty(this, 'componentType', {
        value: props.componentType,
        enumerable: false,
        writable: false
    });
    Object.defineProperty(this, 'validation', {
        value: props.validation,
        enumerable: false,
        writable: false
    });
    return this;
};
//# sourceMappingURL=property.js.map