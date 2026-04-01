export interface VbsElementProps {
  readonly id?: string;
  readonly className?: string;
  readonly children?: Node[];
}

export const vbsElement = function(tagName: string, props: VbsElementProps = {}) {
  const element = document.createElement(tagName);
  
  if (props.id) {
    element.id = props.id;
  }
  
  if (props.className) {
    element.className = props.className;
  }
  
  if (props.children) {
    props.children.forEach(child => element.appendChild(child));
  }
  
  return element;
};