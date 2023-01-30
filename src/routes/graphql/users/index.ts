import { FastifyInstance } from 'fastify';
import { GraphQLList, GraphQLString } from 'graphql';
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

export const getUser = {
  type: UsersTypes,
  args: {
    id: { type: GraphQLString },
  },
  async resolve(
    source: string,
    args: { id: any },
    fastify: FastifyInstance
  ): Promise<UserEntity> {
    const user = await fastify.db.users.findOne({
      key: 'id',
      equals: args.id,
    });

    if (!user) {
      throw fastify.httpErrors.notFound('Not found user');
    }

    return user;
  },
};
