import * as passport from 'passport';
import { PassportConfiguration } from '../utility/passportConfiguration';
import userController from '../controllers/user';

export class UserRoute extends PassportConfiguration {
  public routes(app): void {
    app.route('/user').post(userController.addUser);
    app.route('/user/activation').patch(userController.activate);
    app.route('/user/login').get(passport.authenticate('local', { session: false }), userController.login);
    app.route('/user').patch(passport.authenticate('jwt', { session: false }), userController.updateUser);
    app.route('/user').delete(passport.authenticate('jwt', { session: false }), userController.removeUser);
    app.route('/user').get(passport.authenticate('jwt', { session: false }), userController.getUser);
  }
}
