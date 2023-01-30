import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { getMemberType, getMemberTypes } from './member-types';
import { getPost, getPosts } from './posts';
import { getProfile, getProfiles } from './profiles';
import { graphqlBodySchema } from './schema';
import { getUser, getUsers } from './users';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const Query = new GraphQLObjectType({
        name: 'Query',
        fields: {
          users: getUsers,
          profiles: getProfiles,
          posts: getPosts,
          memberTypes: getMemberTypes,
          user: getUser,
          profile: getProfile,
          post: getPost,
          memberType: getMemberType,
        },
      });

      const schema = new GraphQLSchema({
        query: Query,
      });

      return await graphql({
        schema,
        source: '',
      });
    }
  );
};

export default plugin;
