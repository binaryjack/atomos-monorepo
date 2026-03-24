# VBS Schema Builder

A lightweight, TypeScript-first schema builder with entity relationships, built with zero external dependencies.

## 🏗️ Project Structure

```
vbs-monorepo/
├── packages/
│   ├── vbs/           # Main schema builder application
│   ├── web-ui/        # Reusable web components  
│   ├── vbs-mcp/       # MCP server for AI tools
│   ├── vbs-mod/       # Shared models, types, enums
│   └── vbs-style/     # Theme and style guide (Tailwind CSS)
└── system-instructions.md
```

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run development server
cd packages/vbs
pnpm serve
```

## 📦 Packages

### @vbs/vbs
Main schema builder application with visual canvas for creating entity relationships.

### @vbs/web-ui
Reusable web components built with vanilla TypeScript and Web Components.

### @vbs/vbs-mcp
Model Context Protocol server providing AI tools for schema manipulation.

### @vbs/vbs-mod
Core models and types: Entity, Link, Property, Anchor, Edge, Settings.

### @vbs/vbs-style
Tailwind CSS theme and style guide for consistent UI design.

## 🏛️ Architecture

- **TypeScript-first**: Strict mode, zero `any` types
- **Functional constructors**: No classes, Object.defineProperty pattern
- **One item per file**: Clean, modular structure  
- **kebab-case naming**: Consistent throughout
- **Ultra-high standards**: 95% test coverage minimum

## 🔧 Core Models

- **BaseEntity**: Common properties (id, code, timestamps)
- **Entity**: Schema entities with properties rows and edges
- **Link**: Relationships between entities with cardinalities
- **Property**: Typed properties (string, number, boolean)
- **Anchor**: Connection points on entity edges
- **Edge**: Resize handlers and anchor hosts
- **Settings**: Tool configuration options

## 🚦 Commands

```bash
pnpm build        # Build all packages
pnpm dev          # Watch mode development
pnpm test         # Run all tests
pnpm lint         # Lint all packages
pnpm type-check   # TypeScript validation
pnpm clean        # Clean dist folders
```

## 📋 Development Guidelines

- Follow the system instructions in `system-instructions.md`
- Use functional constructors with proper `this` typing
- Maintain 95% test coverage
- Zero TypeScript errors policy
- Performance target: <=10% of solid-js bundle size