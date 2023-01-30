import { FastifyInstance } from 'fastify';
import { GraphQLList } from 'graphql';
import { PostEntity } from '../../../utils/DB/entities/DBPosts';
import { PostsTypes } from './type';

export const getPosts = {
  type: new GraphQLList(PostsTypes),
  async resolve(
    source: string,
    args: string,
    fastify: FastifyInstance
  ): Promise<PostEntity[]> {
    return await fastify.db.posts.findMany();
  },
};
