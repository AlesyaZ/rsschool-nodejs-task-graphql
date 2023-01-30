import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { getMemberType, getMemberTypes } from './member-types';
import { createPostResolver, getPost, getPosts } from './posts';
import { createProfileResolver, getProfile, getProfiles } from './profiles';
import { graphqlBodySchema } from './schema';
import { createUserResolver, getUser, getUsers } from './users';

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

      const Mutation = new GraphQLObjectType({
        name: 'Mutation',
        fields: {
          createUser: createUserResolver,
          createProfile: createProfileResolver,
          createPost: createPostResolver,
        },
      });

      const schema = new GraphQLSchema({
        query: Query,
        mutation: Mutation,
      });

      const queryBody: any = request.body.query;
      const variablesBody = request.body.variables;

      return await graphql({
        schema,
        source: String(queryBody),
        variableValues: variablesBody,
        contextValue: fastify,
      });
    }
  );
};

export default plugin;
