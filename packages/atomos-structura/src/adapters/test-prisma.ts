import { createSchemaGraphKernel } from '../core/create-schema-graph-kernel.js';
import { createPrismaAdapter } from './create-prisma-adapter.js';

function run() {
    const kernel = createSchemaGraphKernel();
    const adapter = createPrismaAdapter(kernel);

    // Create a User entity
    kernel.addEntity({
        id: 'user-entity',
        name: 'User',
        properties: [
            {
                key: 'id',
                label: 'ID',
                value: '',
                dataType: 'string',
                componentType: 'input',
                validation: { required: { value: true } }
            },
            {
                key: 'email',
                label: 'Email',
                value: '',
                dataType: 'string',
                componentType: 'input',
                validation: { required: { value: true } }
            }
        ],
        position: { x: 0, y: 0 },
        dimensions: { width: 100, height: 100 },
        edges: [],
        code: '',
        createdAt: Date.now(),
        updatedAt: Date.now()
    });

    // Create a Post entity
    kernel.addEntity({
        id: 'post-entity',
        name: 'Post',
        properties: [
            {
                key: 'id',
                label: 'ID',
                value: '',
                dataType: 'string',
                componentType: 'input',
                validation: { required: { value: true } }
            },
            {
                key: 'title',
                label: 'Title',
                value: '',
                dataType: 'string',
                componentType: 'input',
                validation: { required: { value: true } }
            }
        ],
        position: { x: 100, y: 100 },
        dimensions: { width: 100, height: 100 },
        edges: [],
        code: '',
        createdAt: Date.now(),
        updatedAt: Date.now()
    });

    // Link User to Post
    kernel.addLink({
        id: 'link-user-post',
        leftEntityId: 'user-entity',
        rightEntityId: 'post-entity',
        leftAnchorId: 'a1',
        rightAnchorId: 'a2',
        leftCardinality: '1',
        rightCardinality: '*',
        renderType: 'linear'
    });

    const schemaStr = adapter.generatePrismaSchema();

    console.log("=== Generated Prisma Schema ===");
    console.log(schemaStr);
}

run();
