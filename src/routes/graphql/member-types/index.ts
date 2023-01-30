import { GraphQLList } from 'graphql';
import { FastifyInstance } from 'fastify';
import { MemberTypes } from './type';
import { MemberTypeEntity } from '../../../utils/DB/entities/DBMemberTypes';

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
