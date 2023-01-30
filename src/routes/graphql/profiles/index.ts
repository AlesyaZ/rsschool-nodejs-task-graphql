import { FastifyInstance } from 'fastify';
import { GraphQLList } from 'graphql';
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
