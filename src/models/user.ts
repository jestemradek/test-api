import { BlogPostModel } from '../schemas/blogPost';
import * as mongoose from 'mongoose';

export default interface User {
  activated: boolean;
  activationToken: string;
  email: string;
  firstName: string;
  lastName: string;
  locale: string;
  password: string;
  passwordChangeDate: Date;
  blogPostsIds: mongoose.Types.DocumentArray<BlogPostModel>;
}
