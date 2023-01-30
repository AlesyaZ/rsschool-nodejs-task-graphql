import { FastifyInstance } from 'fastify';
import {
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { MemberTypes } from '../member-types/type';
import { PostsTypes } from '../posts/type';
import { ProfilesTypes } from '../profiles/type';

// @ts-ignore
export const UsersTypes = new GraphQLObjectType({
  name: 'User',
  // @ts-ignore
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(GraphQLString) },
    subscribedToUser: {
      type: new GraphQLList(UsersTypes),
      resolve: async (user: any, args, fastify: FastifyInstance) => {
        return await fastify.db.users.findMany({
          key: 'subscribedToUserIds',
          equals: [user.id],
        });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UsersTypes),
      resolve: async (user: any, args, fastify: FastifyInstance) => {
        return await fastify.db.users.findMany({
          key: 'id',
          equalsAnyOf: user.subscribedToUserIds,
        });
      },
    },
    memberType: {
      type: MemberTypes,
      resolve: async ({ id }, args, fastify: FastifyInstance) => {
        const profile = await fastify.db.profiles.findOne({
          key: 'userId',
          equals: id,
        });

        if (!profile) {
          return Promise.resolve(null);
        }

        return await fastify.db.memberTypes.findOne({
          key: 'id',
          equals: profile.memberTypeId,
        });
      },
    },
    posts: {
      type: new GraphQLList(PostsTypes),
      resolve: async ({ id }, args, fastify: FastifyInstance) => {
        return await fastify.db.posts.findMany({
          key: 'userId',
          equals: id,
        });
      },
    },
    profile: {
      type: ProfilesTypes,
      resolve: async ({ id }, args, fastify: FastifyInstance) => {
        return await fastify.db.profiles.findOne({
          key: 'userId',
          equals: id,
        });
      },
    },
  }),
});
