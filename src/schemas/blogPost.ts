import { Document, Model, model, Schema } from 'mongoose';
import { default as BlogPost } from '../models/blogPost';

export interface BlogPostModel extends BlogPost, Document {}

export const BlogPostSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  editionsIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  alias: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  subject: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  activated: Boolean,
});

export const BlogPostModel: Model<BlogPostModel> = model<BlogPostModel>('BlogPost', BlogPostSchema);
