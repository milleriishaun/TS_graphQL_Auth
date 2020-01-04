import { ApolloError } from "apollo-server-core";
import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../graphql-types/MyContext";

// {context} gets any information about the current resolver
// here, we only care that the user.Id is defined
export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
  if (!context.req.session!.userId) {
    throw new ApolloError("not authenticated");
  }

  return next();
};
