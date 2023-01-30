import { FastifyInstance } from 'fastify';
import { GraphQLList } from 'graphql';
import { UserEntity } from '../../../utils/DB/entities/DBUsers';
import { UsersTypes } from './type';

export const getUsers = {
  type: new GraphQLList(UsersTypes),
  async resolve(
    source: string,
    args: string,
    fastify: FastifyInstance
  ): Promise<UserEntity[]> {
    return await fastify.db.users.findMany();
  },
};
