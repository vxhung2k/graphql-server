import { gql } from 'apollo-server';

const typeDefs = gql`
  type ResponseData {
    id: String
    success: Boolean
  }
  type ResponseMutation {
    message: String
    success: Boolean
  }
  type User @key(fields: "id") {
    id: ID
    email: String
    gender: String
    avatar: String
    fullName: String
    province: Int
    district: Int
    phoneNumber: String
    ward: Int
    street: String
    houseNumber: String
    dateOfBirth: String
    timestamp: String
  }
  type Product @key(fields: "id") {
    id: ID
  }
  type Pagination {
    page: Int
    limit: Int
    totalPage: Int
    total: Int
    hasNextPage: Boolean
    hasPrevPage: Boolean
    items: [User]
  }
  type Address @key(fields: "id") {
    id: ID
    name: String
  }
  type UserSerializer {
    id: String
  }
  type AuthResponse {
    id: String!
    token: String!
  }
  input DataSearch {
    email: String
    fullName: String
    phoneNumber: String
    gender: String
    province: Int
    district: Int
    ward: Int
    street: String
    houseNumber: String
    # key:String
  }
  input DataUser {
    id: ID
    username: String
    password: String
    email: String
    fullName: String
    phoneNumber: String
    gender: String
    avatar: String
    province: Int
    district: Int
    ward: Int
    street: String
    houseNumber: String
    dateOfBirth: String
    timestamp: String
  }
  input DataLike {
    user_id: String
    product_id: String
  }
  type DataLikeRes {
    user_id: String
    product_id: String
    is_liked: Boolean
  }
  input DataComment {
    user_id: String
    product_id: String
    comment: String
    parent_id: String
  }
  type DataCommentRes {
    user_id: String
    product_id: String
    comment: String
    parent_id: String
  }
  input DataProduct {
    name: String
  }
  extend type Query {
    getUserById(id: ID!): User
    getAllUser(page: Int!, size: Int!): Pagination!
    getListProvince: [Address]
    getDistrictOfProvince(id: Int!): [Address]
    getWardOfDistrict(id: Int!): [Address]
    login(username: String!, password: String!): AuthResponse
    logout: ResponseMutation
    filterUser(data: DataSearch!, page: Int!, size: Int!): Pagination!
    # getMoreComment(data:):
  }
  extend type Mutation {
    createUser(data: DataUser!): ResponseData
    updateUser(data: DataUser!): User
    deleteUser(id: ID!): ResponseMutation
    resetPassword(password: String!, otp: String!): ResponseMutation
    changePassword(
      password: String!
      password_confirm: String!
      email: String!
      otp: String!
    ): ResponseMutation
    sendOtp(email: String!): ResponseMutation
    likeOrUnlike(data: DataLike!): DataLikeRes!
    comment(data: DataComment!): DataCommentRes!
    createProduct(data: DataProduct!): ResponseData
    updateProduct(data: DataProduct): Product
    deleteProduct(id: ID!): ResponseMutation
  }
`;
export default typeDefs;
