import { FastifyInstance } from 'fastify';
import { GraphQLList, GraphQLString } from 'graphql';
import { ProfileEntity } from '../../../utils/DB/entities/DBProfiles';
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
