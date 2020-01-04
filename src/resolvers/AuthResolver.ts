import bcrypt from "bcryptjs";
import { Arg, Ctx, Mutation, Resolver, Query } from "type-graphql";
import { User } from "../entity/User";
import { AuthInput } from "../graphql-types/AuthInput";
import { MyContext } from "../graphql-types/MyContext";
import { UserResponse } from "../graphql-types/UserResponse";

const invalidLoginResponse = {
  // array b/c more than one error may want to be returned
  // generic error messages for keeping information discrete
  errors: [
    {
      path: "email",
      message: "invalid login"
    }
  ]
};

// type-graphQL resolver
@Resolver()
export class AuthResolver {
  @Mutation(() => UserResponse)
  async register(
    // sig up users and return a User or null
    @Arg("input")
    { email, password }: AuthInput
  ): Promise<UserResponse> {
    // Check if the User exists, check against the email
    const existingUser = await User.findOne({ email });

    // Error handling, sent to the client
    if (existingUser) {
      return {
        errors: [
          {
            path: "email",
            message: "already in use"
          }
        ]
      };
    }

    // hash the password after validation
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save the newly registered User
    const user = await User.create({
      email,
      password: hashedPassword
    }).save();

    return { user };
  }

  // Handle a login attempt
  @Mutation(() => UserResponse)
  async login(
    @Arg("input") { email, password }: AuthInput,
    // Get the context in graphQL using MyContext and @ctx decorator
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    // fetch the User
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return invalidLoginResponse;
    }

    // Check if the password is valid through bcrypt
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return invalidLoginResponse;
    }

    // Persist the user through setting the session for the user
    // use ! in TS for asserting that something is 'not null' or 'not undefined'
    // The session object in the req can sometimes be undefined, but use ! to say 'is defined' b/c
    // the session middleware was added to express already in index.test
    // In the session, store arbitrary data on the user; their id
    // This sends back a cookie for the user
    ctx.req.session!.userId = user.id;

    return { user };
  }

  // After the user logs in, get the existing user
  @Query(() => User, { nullable: true }) // could also return null if the user cannot be found
  // Access the context
  async me(@Ctx() ctx: MyContext): Promise<User | undefined> {
    // read the session object for the necessary data
    if (!ctx.req.session!.userId) {
      return undefined;
    }

    // Fetch the user that is in the session
    return User.findOne(ctx.req.session!.userId);
  }

  // Log the user out
  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: MyContext): Promise<Boolean> {
    return new Promise((res, rej) =>
      // destroy() uses a callback as a parameter; and it is turned into a promise using 'new Promise'
      ctx.req.session!.destroy(err => {
        if (err) {
          console.log(err);
          // reject if error
          return rej(false);
        }

        // destroy the session in sqlite, or other DB(postgres)
        // Note: this does not clear the cookie
        ctx.res.clearCookie("qid");

        // res = resolve, meaning it worked, so return true
        return res(true);
      })
    );
  }
}
