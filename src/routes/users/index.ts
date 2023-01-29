import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    return await this.db.users.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const id = request.params.id;
      const user = await this.db.users.findOne({
        key: 'id',
        equals: id,
      });

      if (!user) {
        throw this.httpErrors.notFound('Not found user');
      }

      return reply.send(user);
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const body = request.body;

      return await this.db.users.create(body);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const id = request.params.id;

      const user = await this.db.users.findOne({
        key: 'id',
        equals: id,
      });

      try {
        if (user) {
          const profile = await this.db.profiles.findOne({
            key: 'userId',
            equals: user.id,
          });

          if (profile) {
            await this.db.profiles.delete(profile.id);
          }

          const post = await this.db.posts.findOne({
            key: 'userId',
            equals: user.id,
          });

          if (post) {
            await this.db.posts.delete(post.id);
          }

          const users = await this.db.users.findMany({
            key: 'subscribedToUserIds',
            equals: [id],
          });

          users.forEach(
            async (user) =>
              await this.db.users.change(user.id, {
                subscribedToUserIds: user.subscribedToUserIds.filter(
                  (user) => user !== id
                ),
              })
          );

          return await this.db.users.delete(id);
        }
      } catch {
        throw this.httpErrors.notFound('Not found user');
      }
      throw this.httpErrors.badRequest('Invalid user');
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const id = request.params.id;
      const userID = request.body.userId;

      const user = await this.db.users.findOne({
        key: 'id',
        equals: id,
      });

      const idUser = await this.db.users.findOne({
        key: 'id',
        equals: userID,
      });

      if (!user || !idUser) {
        throw this.httpErrors.notFound('Not found user');
      }

      try {
        const userSubscribed = [...idUser.subscribedToUserIds, id];

        return await this.db.users.change(userID, {
          subscribedToUserIds: userSubscribed,
        });
      } catch {
        throw this.httpErrors.badRequest('Invalid user');
      }
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const id = request.params.id;
      const userID = request.body.userId;

      const user = await this.db.users.findOne({
        key: 'id',
        equals: id,
      });

      const idUser = await this.db.users.findOne({
        key: 'id',
        equals: userID,
      });

      if (!user || !idUser) {
        throw this.httpErrors.notFound('Not found user');
      }

      try {
        const userSubscribed = idUser.subscribedToUserIds.filter(
          (userSubscribedId) => userSubscribedId !== id
        );

        return await this.db.users.change(userID, {
          subscribedToUserIds: userSubscribed,
        });
      } catch {
        throw this.httpErrors.badRequest('Invalid user');
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const id = request.params.id;
      const body = request.body;

      try {
        return await this.db.users.change(id, body);
      } catch {
        throw this.httpErrors.badRequest('Invalid user');
      }
    }
  );
};

export default plugin;
