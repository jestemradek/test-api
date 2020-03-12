import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as expressWinston from 'express-winston';
import * as mongoose from 'mongoose';
import * as winston from 'winston';

import { APIRoute } from './routes/api';
import { UserRoute } from './routes/user';
import { BlogPostRoute } from './routes/blogPost';
import * as errorHandler from './utility/errorHandler';

class App {
  public app: express.Application;
  public apiRoutes: APIRoute = new APIRoute();
  public userRoutes: UserRoute = new UserRoute();
  public blogPostRoutes: BlogPostRoute = new BlogPostRoute();
  public mongoUrl: string;
  public mongoUser: string;
  public mongoPass: string;

  constructor() {
    this.mongoUrl = 'mongodb://192.168.99.115:27017/cm-rest-api';

    this.app = express();
    this.app.use(bodyParser.json());
    this.apiRoutes.routes(this.app);
    this.userRoutes.routes(this.app);
    this.blogPostRoutes.routes(this.app);
    this.mongoSetup();
    this.app.use(
      expressWinston.errorLogger({
        transports: [new winston.transports.Console()],
      }),
    );

    this.app.use(errorHandler.logging);
    this.app.use(errorHandler.clientErrorHandler);
    this.app.use(errorHandler.errorHandler);
  }

  private mongoSetup(): void {
    mongoose.set('useCreateIndex', true);
    mongoose.set('useFindAndModify', false);
    mongoose.connect(this.mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
}

export default new App().app;
