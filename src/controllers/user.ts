import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserModel, UserRequest } from '../schemas/user';
import { APILogger } from '../utility/logger';
import { formatOutput } from '../utility/apiUtility';
import { Mailer } from '../utility/mailer';
import { validatePassword } from '../utility/passportConfiguration';
import { jwtSecret } from '../config/jwtConfig';

export default {
  getUser(req: Request, res: Response): void {
    const user = req.user as UserModel;
    APILogger.logger.info(`[GET] [/user] email: ${user.email}`);
    formatOutput(res, user, 200);
  },

  addUser(req: Request, res: Response): void {
    const { firstName, lastName, email, password, locale } = req.body;
    const newUser = new UserModel({
      firstName,
      lastName,
      email,
      locale,
    });

    APILogger.logger.info(`[POST] [/user] ${newUser.email}`);

    if (validatePassword(password)) {
      UserModel.register(newUser, password, (err, user) => {
        if (err) {
          APILogger.logger.warn(`[POST] [/user] something went wrong when saving a new user ${newUser.email} | ${err.message}`);
          res.status(400).send(err.message);
          return null;
        }
        Mailer.sendEmail(newUser.email, newUser.firstName + ' ' + newUser.lastName, 'userRegistration', user.locale, {
          name: newUser.firstName + ' ' + newUser.lastName,
          activationToken: user.activationToken,
        });
        formatOutput(res, user, 201);
      });
    } else {
      APILogger.logger.warn(
        `[POST] [/user] password too easy, needed 1 upper case letter, 1 lower case letter, 1 digit. total must be equal or greater than 10 characters`,
      );
      res
        .status(400)
        .send(
          'password too easy, needed 1 upper case letter, 1 lower case letter, 1 digit. total must be equal or greater than 10 characters',
        );
    }
  },

  updateUser(req: Request, res: Response): void {
    const id = req.user;
    UserModel.findOne({ _id: id }, async (err, user) => {
      if (err) {
        APILogger.logger.info(`[PATCH] [/user] something went wrong during updating user, error: ${err}`);
        res.status(400).send();
        return null;
      }
      if (!user) {
        APILogger.logger.info(`[PATCH] [/user] user not found`);
        res.status(404).send();
        return null;
      }
      APILogger.logger.info(`[PATCH] [/user] ${user}`);

      user.email = req.body.email || user.email;

      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.locale = req.body.locale || user.locale;

      if (req.body.password) {
        if (validatePassword(req.body.password)) {
          user.passwordChangeDate = new Date();
          await user.setPassword(req.body.password);
        } else {
          APILogger.logger.warn(
            `[POST] [/user] password too easy, needed 1 upper case letter, 1 lower case letter, 1 digit. total must be equal or greater than 10 characters`,
          );
          res
            .status(400)
            .send(
              'password too easy, needed 1 upper case letter, 1 lower case letter, 1 digit. total must be equal or greater than 10 characters',
            );
          return null;
        }
      }

      await user.save(err2 => {
        if (err2) {
          APILogger.logger.warn(`User updating problem: ${err2.message}`);
          res.status(400).send(`User updating problem: ${err2.message}`);
          return null;
        }
        res.status(204).send();
      });
    });
  },

  removeUser(req: Request, res: Response): void {
    const id = req.user;
    UserModel.findOne({ _id: id }, (err, user) => {
      if (err) {
        APILogger.logger.info(`[DELETE] [/user] user with _id: ${id} not found`);
        res.status(404).send();
        return null;
      }
      APILogger.logger.warn(`[DELETE] [/user] ${user.email}`);
      user.remove(err2 => {
        APILogger.logger.info(`[DELETE] [/user] something went wrong on deleting user, error: ${err2}`);
        return res.status(204).send();
      });
    });
  },

  login(req: UserRequest, res: Response): void {
    if (req.user.activated) {
      jwt.sign(
        { id: req.user._id },
        jwtSecret,
        {
          expiresIn: 21600,
        },
        (err, token) => {
          if (err) {
            APILogger.logger.info(`[GET] [/user/login] user ${req.user.email} not authorized `);
            res.status(401).send();
            return null;
          }
          res.json({ token: token });
        },
      );
    } else {
      APILogger.logger.info(`[GET] [/user/login] user ${req.user.email} has no activated account`);
      res.status(403).send();
    }
  },
  activate(req: Request, res: Response): void {
    UserModel.findOneAndUpdate(
      { email: req.body.email, activationToken: req.body.activationToken },
      { activated: true },
      { new: true },
      err => {
        if (err) {
          APILogger.logger.info(`[PATCH] [/user/activation] Activation error: ${err.message}`);
          res.status(401).send();
          return null;
        }

        APILogger.logger.info(`[PATCH] [/user/activation] User ${req.body.email} activated`);
        res.status(204).send();
      },
    );
  },
};
