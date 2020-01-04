import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Field, ObjectType } from 'type-graphql'

// Used for DB and graphQL datatype
@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field() //graphQL field
  @PrimaryGeneratedColumn() // type-orm DB id numerator
  id: number

  @Field()
  @Column('text', { unique: true })
  email: string

  // Exclude Field for keeping password hidden
  @Column()
  password: string
}
