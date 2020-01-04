import { Field, ObjectType } from 'type-graphql'

// Return graphQL errors in a meaningful way
@ObjectType()
export class FieldError {
  @Field()
  path: string

  @Field()
  message: string
}
