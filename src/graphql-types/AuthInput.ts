import { Field, InputType } from 'type-graphql'

// Accept object with email and password for auth
@InputType()
export class AuthInput {
  @Field()
  email: string

  @Field()
  password: string
}
