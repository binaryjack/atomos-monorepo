import type { SchemaGraphKernel } from '../core/create-schema-graph-kernel';
import type { Property } from '@atomos/structura-core';

export const createPrismaAdapter = (kernel: SchemaGraphKernel) => {
    
    const mapTypeToPrisma = (dataType: string): string => {
        switch (dataType) {
            case 'string': return 'String';
            case 'number': return 'Int';
            case 'boolean': return 'Boolean';
            default: return 'String';
        }
    };

    return Object.freeze({
        generatePrismaSchema: (): string => {
            const { entities, links } = kernel.getSnapshot();
            
            let output = `generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\n`;

            Object.values(entities).forEach(entity => {
                output += `model ${entity.name} {\n`;
                
                // Add properties
                entity.properties.forEach((prop: Property) => {
                    const pType = mapTypeToPrisma(prop.dataType);
                    const modifier = prop.validation?.required ? '' : '?';
                    const isId = prop.key === 'id' ? ' @id @default(uuid())' : '';
                    
                    output += `  ${prop.key} ${pType}${modifier}${isId}\n`;
                });

                // Add relationships (reading links where this entity is the source/left)
                const outgoingLinks = Object.values(links).filter(l => l.leftEntityId === entity.id);
                outgoingLinks.forEach(link => {
                    const targetEntity = entities[link.rightEntityId];
                    if (targetEntity) {
                        const relationName = targetEntity.name.toLowerCase();
                        // Naive 1:N or 1:1 inference for demo purposes
                        const isMany = (link.rightCardinality === '*' || link.rightCardinality === '1..*') ? '[]' : '?';
                        output += `  ${relationName} ${targetEntity.name}${isMany}\n`;
                    }
                });

                output += `}\n\n`;
            });

            return output;
        }
    });
};
