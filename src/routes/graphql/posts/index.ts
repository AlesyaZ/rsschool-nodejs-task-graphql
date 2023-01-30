import { FastifyInstance } from 'fastify';
import { GraphQLList, GraphQLString } from 'graphql';
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

export const getPost = {
  type: new GraphQLList(PostsTypes),
  args: {
    id: { type: GraphQLString },
  },
  async resolve(
    source: string,
    args: { id: any },
    fastify: FastifyInstance
  ): Promise<PostEntity> {
    const post = await fastify.db.posts.findOne({
      key: 'id',
      equals: args.id,
    });

    if (!post) {
      throw fastify.httpErrors.notFound('Not found POST');
    }

    return post;
  },
};
