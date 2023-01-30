import { FastifyInstance } from 'fastify';
import { GraphQLList, GraphQLString } from 'graphql';
import { ProfileEntity } from '../../../utils/DB/entities/DBProfiles';
import { createProfileInput, updateProfileInput } from './input';
import { ProfilesTypes } from './type';

export const getProfiles = {
  type: new GraphQLList(ProfilesTypes),
  async resolve(
    source: string,
    args: string,
    fastify: FastifyInstance
  ): Promise<ProfileEntity[]> {
    return await fastify.db.profiles.findMany();
  },
};

export const getProfile = {
  type: new GraphQLList(ProfilesTypes),
  args: {
    id: { type: GraphQLString },
  },
  async resolve(
    source: string,
    args: { id: any },
    fastify: FastifyInstance
  ): Promise<ProfileEntity> {
    const profile = await fastify.db.profiles.findOne({
      key: 'id',
      equals: args.id,
    });

    if (!profile) {
      throw fastify.httpErrors.notFound('Not found profile');
    }

    return profile;
  },
};

export const createProfileResolver = {
  type: new GraphQLList(ProfilesTypes),
  args: {
    input: { type: createProfileInput },
  },
  async resolve(
    source: string,
    { input }: { input: Omit<ProfileEntity, 'id'> },
    fastify: FastifyInstance
  ): Promise<ProfileEntity> {
    const getUser = await fastify.db.users.findOne({
      key: 'id',
      equals: input.userId,
    });

    const getProfiles = await fastify.db.profiles.findOne({
      key: 'userId',
      equals: input.userId,
    });

    const typeId = await fastify.db.memberTypes.findOne({
      key: 'id',
      equals: input.memberTypeId,
    });

    if (!getUser || getProfiles || !typeId) {
      throw fastify.httpErrors.badRequest('Invalid profiles');
    }

    const profile = await fastify.db.profiles.create(input);

    return profile;
  },
};

export const updateProfileResolver = {
  type: new GraphQLList(ProfilesTypes),
  args: {
    inputId: { type: GraphQLString },
    input: { type: updateProfileInput },
  },
  resolve: async (
    source: any,
    {
      inputId,
      input,
    }: {
      inputId: string;
      input: Partial<Omit<ProfileEntity, 'id' | 'userId'>>;
    },
    fastify: FastifyInstance
  ) => {
    const profile = await fastify.db.profiles.findOne({
      key: 'id',
      equals: inputId,
    });

    if (!profile) {
      throw fastify.httpErrors.notFound('Not found Profile');
    }

    return await fastify.db.profiles.change(inputId, input);
  },
};
