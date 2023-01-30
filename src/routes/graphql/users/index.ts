import { FastifyInstance } from 'fastify';
import { GraphQLList, GraphQLString } from 'graphql';
import { Omit } from 'ts-toolbelt/out/Object/_api';
import { ProfileEntity } from '../../../utils/DB/entities/DBProfiles';
import { UserEntity } from '../../../utils/DB/entities/DBUsers';
import {
  createUserInput,
  subscribeUserInput,
  unSubscribeUserInput,
  UpdateUserInput,
} from './input';
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

export const createUserResolver = {
  type: UsersTypes,
  args: {
    input: { type: createUserInput },
  },
  async resolve(
    source: string,
    { input }: { input: Omit<UserEntity, 'id'> },
    fastify: FastifyInstance
  ) {
    const user = await fastify.db.users.create(input);

    return user;
  },
};

export const updateUserResolver = {
  type: UsersTypes,
  args: {
    input: { type: UpdateUserInput },
    inputId: { type: GraphQLString },
  },
  async resolve(
    source: string,
    {
      inputId,
      input,
    }: { inputId: string; input: Partial<Omit<UserEntity, 'id'>> },
    fastify: FastifyInstance
  ) {
    try {
      return await fastify.db.users.change(inputId, input);
    } catch {
      throw fastify.httpErrors.badRequest('Invalid user');
    }
  },
};

export const subscribeUserResolver = {
  type: UsersTypes,
  args: {
    input: { type: subscribeUserInput },
  },
  async resolve(
    source: string,
    { input }: Record<'input', Pick<ProfileEntity, 'id' | 'userId'>>,
    fastify: FastifyInstance
  ) {
    const user = await fastify.db.users.findOne({
      key: 'id',
      equals: input.id,
    });

    const idUser = await fastify.db.users.findOne({
      key: 'id',
      equals: input.userId,
    });

    if (!user || !idUser) {
      throw fastify.httpErrors.notFound('Not found user');
    }

    try {
      const userSubscribed = [...idUser.subscribedToUserIds, input.id];

      return await fastify.db.users.change(input.userId, {
        subscribedToUserIds: userSubscribed,
      });
    } catch {
      throw fastify.httpErrors.badRequest('Invalid user');
    }
  },
};

export const unsubscribeUserResolver = {
  type: UsersTypes,
  args: {
    input: { type: unSubscribeUserInput },
  },
  async resolve(
    source: string,
    { input }: Record<'input', Pick<ProfileEntity, 'id' | 'userId'>>,
    fastify: FastifyInstance
  ) {
    const user = await fastify.db.users.findOne({
      key: 'id',
      equals: input.id,
    });

    const idUser = await fastify.db.users.findOne({
      key: 'id',
      equals: input.userId,
    });

    if (!user || !idUser) {
      throw fastify.httpErrors.notFound('Not found user');
    }

    const usersubscribedId = idUser.subscribedToUserIds.includes(input.id);

    if (!usersubscribedId) {
      throw fastify.httpErrors.badRequest('Invalid user');
    }

    const userSubscribed = idUser.subscribedToUserIds.filter(
      (userSubscribedId) => userSubscribedId !== input.id
    );

    return await fastify.db.users.change(input.userId, {
      subscribedToUserIds: userSubscribed,
    });
  },
};
