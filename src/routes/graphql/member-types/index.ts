import { GraphQLList, GraphQLString } from 'graphql';
import { FastifyInstance } from 'fastify';
import { MemberTypes } from './type';
import { MemberTypeEntity } from '../../../utils/DB/entities/DBMemberTypes';
import { updateMemberTypeInput } from './input';

export const getMemberTypes = {
  type: new GraphQLList(MemberTypes),
  resolve: async (
    source: string,
    args: string,
    fastify: FastifyInstance
  ): Promise<MemberTypeEntity[]> => {
    return await fastify.db.memberTypes.findMany();
  },
};

export const getMemberType = {
  type: new GraphQLList(MemberTypes),
  args: {
    id: { type: GraphQLString },
  },
  resolve: async (
    source: string,
    args: { id: any },
    fastify: FastifyInstance
  ): Promise<MemberTypeEntity> => {
    const memberType = await fastify.db.memberTypes.findOne({
      key: 'id',
      equals: args.id,
    });

    if (!memberType) {
      throw fastify.httpErrors.notFound('Not found memberTypes');
    }

    return memberType;
  },
};

export const updateMemberTypeResolver = {
  type: new GraphQLList(MemberTypes),
  args: {
    inputId: { type: GraphQLString },
    input: { type: updateMemberTypeInput },
  },
  resolve: async (
    source: any,
    {
      inputId,
      input,
    }: {
      inputId: string;
      input: Partial<Omit<MemberTypeEntity, 'id' | 'userId'>>;
    },
    fastify: FastifyInstance
  ): Promise<MemberTypeEntity> => {
    try {
      return await fastify.db.memberTypes.change(inputId, input);
    } catch {
      throw fastify.httpErrors.badRequest('Invalid memberTypes');
    }
  },
};
