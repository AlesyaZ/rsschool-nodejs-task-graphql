import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    return await this.db.posts.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const id = request.params.id;
      const post = await this.db.posts.findOne({
        key: 'id',
        equals: id,
      });

      if (!post) {
        throw this.httpErrors.notFound('Not found POST');
      }

      return reply.send(post);
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const userID = request.body.userId;
      const body = request.body;

      const post = await this.db.posts.create(body);

      const getUser = await this.db.users.findOne({
        key: 'id',
        equals: userID,
      });

      if (!getUser) {
        throw this.httpErrors.badRequest('Invalid user');
      }

      return reply.send(post);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
        const id = request.params.id;
        return await this.db.posts.delete(id);
      } catch {
        throw this.httpErrors.badRequest('Invalid post');
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
        const id = request.params.id;
        const body = request.body;

        return await this.db.posts.change(id, body);
      } catch {
        throw this.httpErrors.badRequest('Invalid post');
      }
    }
  );
};

export default plugin;
