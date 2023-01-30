import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<ProfileEntity[]> {
    return await this.db.profiles.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const id = request.params.id;
      const profile = await this.db.profiles.findOne({
        key: 'id',
        equals: id,
      });

      if (!profile) {
        throw this.httpErrors.notFound('Not found profile');
      }

      return reply.send(profile);
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const userID = request.body.userId;
      const body = request.body;

      const getUser = await this.db.users.findOne({
        key: 'id',
        equals: userID,
      });

      const getProfiles = await fastify.db.profiles.findOne({
        key: 'userId',
        equals: userID,
      });

      const typeId = await fastify.db.memberTypes.findOne({
        key: 'id',
        equals: body.memberTypeId,
      });

      if (!getUser || getProfiles || !typeId) {
        throw this.httpErrors.badRequest('Invalid profiles');
      }

      const profile = await this.db.profiles.create(body);

      return reply.send(profile);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      try {
        const id = request.params.id;
        return await this.db.profiles.delete(id);
      } catch {
        throw this.httpErrors.badRequest('Invalid profiles');
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      try {
        const id = request.params.id;
        const body = request.body;

        return await this.db.profiles.change(id, body);
      } catch {
        throw this.httpErrors.badRequest('Invalid profiles');
      }
    }
  );
};

export default plugin;
