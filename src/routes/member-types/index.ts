import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    MemberTypeEntity[]
  > {
    return await this.db.memberTypes.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const id = request.params.id;
      const memberTypes = await this.db.memberTypes.findOne({
        key: 'id',
        equals: id,
      });

      if (!memberTypes) {
        throw this.httpErrors.notFound('Not found memberTypes');
      }

      return reply.send(memberTypes);
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      try {
        const id = request.params.id;
        const body = request.body;

        return await this.db.memberTypes.change(id, body);
      } catch {
        throw this.httpErrors.badRequest('Invalid memberTypes');
      }
    }
  );
};

export default plugin;
