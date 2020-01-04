import { Field, ObjectType } from 'type-graphql'

import { FieldError } from './FieldError'
import { User } from '../entity/User'

// Response to register can be User or Error, and either can be null
@ObjectType()
export class UserResponse {
  // Generic response for User
  @Field(() => User, { nullable: true })
  user?: User

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]
}
