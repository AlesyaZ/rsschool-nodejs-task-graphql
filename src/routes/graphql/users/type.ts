import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

export const UsersTypes = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(GraphQLInt) },
  }),
});
