import { Query, Resolver, UseMiddleware } from "type-graphql";

import { isAuth } from "../middleware/isAuth";

@Resolver()
export class BookResolver {
  @Query(() => String)
  @UseMiddleware(isAuth)
  // protect this book query, so that only logged in users can see result
  // isAuth can be thrown in to protect any returned info
  book() {
    return "The Republic";
  }
}
