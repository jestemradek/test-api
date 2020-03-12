import { default as User } from '../models/user';
import { Document, model, Schema, PassportLocalDocument, PassportLocalModel, PassportLocalSchema } from 'mongoose';
import * as passportLocalMongoose from 'passport-local-mongoose';
import * as uniqueValidator from 'mongoose-unique-validator';
import isEmail from 'validator/lib/isEmail';
import { localeValidator } from '../config/localeConfig';

export interface UserModel extends User, Document, PassportLocalDocument {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserModelPassport<T extends PassportLocalDocument> extends PassportLocalModel<T> {}
export interface UserRequest extends Request {
  user: UserModel;
}
export const UserSchema: PassportLocalSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      uniqueCaseInsensitive: true,
      lowercase: true,
      trim: true,
      validate: [isEmail, 'Please fill a valid email address'],
    },
    activated: { type: Boolean, default: false },
    activationToken: {
      type: String,
      default: require('rand-token').suid(128),
    },
    locale: {
      type: String,
      required: true,
      validate: [localeValidator, 'Entered locale is not available'],
    },
    passwordChangeDate: { type: Date, default: Date.now },
    blogPostsIds: [{ type: Schema.Types.ObjectId, ref: 'blogPost' }],
  },
  {
    timestamps: true,
  },
);

UserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1209600, partialFilterExpression: { activated: false } });
UserSchema.plugin(uniqueValidator);
UserSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
});
UserSchema.methods.toJSON = function(): JSON {
  const obj = this.toObject();
  delete obj.salt;
  delete obj.hash;
  delete obj.activationToken;
  delete obj.blogPosts;
  return obj;
};

export const UserModel: UserModelPassport<UserModel> = model<UserModel>('User', UserSchema);
