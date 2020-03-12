import * as passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserModel } from '../schemas/user';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const passwordValidator = require('password-validator');
import { jwtSecret } from '../config/jwtConfig';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const verifyCallback = (payload, done) => {
  return UserModel.findOne({ _id: payload.id })
    .then(user => {
      const iat = new Date(payload.iat * 1000);
      const pwdChg = new Date(user.passwordChangeDate);
      pwdChg.setMilliseconds(0); // due to fact as iat doesn't storing ms
      if (user.passwordChangeDate && pwdChg.getTime() > iat.getTime()) {
        return done(null, false, {
          message: 'Invalid token. Password was changed!',
        });
      }
      return done(null, user);
    })
    .catch(err => {
      return done(err);
    });
};

export class PassportConfiguration {
  constructor() {
    passport.use(
      new Strategy(
        {
          secretOrKey: jwtSecret,
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        },
        verifyCallback,
      ),
    );
    passport.use(UserModel.createStrategy());
  }
}

export const validatePassword = (password: string): boolean => {
  const schema = new passwordValidator();
  schema
    .is()
    .min(10)
    .is()
    .max(50)
    .has()
    .uppercase()
    .has()
    .lowercase()
    .has()
    .digits();
  return schema.validate(password);
};
