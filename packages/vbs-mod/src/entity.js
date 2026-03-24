import { baseEntity } from './base-entity.js';
export const entity = function (props) {
    baseEntity.call(this, props);
    Object.defineProperty(this, 'name', {
        value: props.name,
        enumerable: false,
        writable: true
    });
    Object.defineProperty(this, 'propertiesRows', {
        value: props.propertiesRows,
        enumerable: false,
        writable: true
    });
    Object.defineProperty(this, 'position', {
        value: props.position,
        enumerable: false,
        writable: true
    });
    Object.defineProperty(this, 'dimensions', {
        value: props.dimensions,
        enumerable: false,
        writable: true
    });
    Object.defineProperty(this, 'edges', {
        value: props.edges,
        enumerable: false,
        writable: true
    });
    return this;
};
//# sourceMappingURL=entity.js.map