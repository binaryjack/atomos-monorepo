# VBS Schema Builder - System Instructions

## CORE PRINCIPLES
- **TypeScript-first**: Strict mode, zero `any` types
- **Ultra-high standards**: 95% test coverage minimum
- **Functional constructors**: No class declarations allowed
- **One item per file**: Clean, modular structure
- **kebab-case naming**: Consistent throughout
- **Declarative patterns**: React-like declarative code

## ARCHITECTURE PATTERNS

### Constructor Functions
```typescript
export const entityName = function(this: EntityProps, props: EntityProps) {
  Object.defineProperty(this, 'property', { 
    value: props.property, 
    enumerable: false, 
    writable: false 
  });
  return this;
};
```

### File Organization
- `*.types.ts` - Type definitions
- `entity.ts` - Constructor implementation  
- `create-entity.ts` - Factory functions
- `index.ts` - Public exports

### Package Structure
- **vbs-mod**: Core models and types
- **vbs-style**: Tailwind CSS theme
- **web-ui**: Reusable web components
- **vbs-mcp**: MCP server for AI tools
- **vbs**: Main schema builder application

## FORBIDDEN PATTERNS
- `class` declarations
- `useImperativeHandle`
- `any` types
- `camelCase` in file names
- Verbose code
- Constructor functions without `this` typing

## QUALITY REQUIREMENTS
- 95% minimum test coverage
- Zero TypeScript errors
- Performance target: <=10% of solid-js
- All checks must pass: tsc, eslint, jest