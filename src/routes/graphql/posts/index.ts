import { FastifyInstance } from 'fastify';
import { GraphQLList, GraphQLString } from 'graphql';
import { PostEntity } from '../../../utils/DB/entities/DBPosts';
import { createPostInput, updatePostInput } from './input';
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

export const createPostResolver = {
  type: new GraphQLList(PostsTypes),
  args: {
    input: { type: createPostInput },
  },
  async resolve(
    source: string,
    { input }: { input: Omit<PostEntity, 'id'> },
    fastify: FastifyInstance
  ): Promise<PostEntity> {
    const post = await fastify.db.posts.create(input);

    const getUser = await fastify.db.users.findOne({
      key: 'id',
      equals: input.userId,
    });

    if (!getUser) {
      throw fastify.httpErrors.badRequest('Invalid user');
    }

    return post;
  },
};

export const updatePostResolver = {
  type: new GraphQLList(PostsTypes),
  args: {
    input: { type: updatePostInput },
    inputId: { type: GraphQLString },
  },
  resolve: async (
    source: any,
    {
      inputId,
      input,
    }: {
      inputId: string;
      input: Partial<Omit<PostEntity, 'id' | 'userId'>>;
    },
    fastify: FastifyInstance
  ) => {
    try {
      return await fastify.db.posts.change(inputId, input);
    } catch {
      throw fastify.httpErrors.badRequest('Invalid post');
    }
  },
};
