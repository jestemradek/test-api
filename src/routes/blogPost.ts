import * as passport from 'passport';
import { PassportConfiguration } from '../utility/passportConfiguration';
import BlogPostController from '../controllers/blogPost';

export class BlogPostRoute extends PassportConfiguration {
  public routes(app): void {
    app.route('/user/blogPosts').get(passport.authenticate('jwt', { session: false }), BlogPostController.getBlogPosts);
    app.route('/user/blogPost').post(passport.authenticate('jwt', { session: false }), BlogPostController.addBlogPost);
    app.route('/user/blogPost/:blogPostId').get(passport.authenticate('jwt', { session: false }), BlogPostController.getBlogPost);
    app.route('/user/blogPost/:blogPostId').patch(passport.authenticate('jwt', { session: false }), BlogPostController.updateBlogPost);
    app.route('/user/blogPost/:blogPostId').delete(passport.authenticate('jwt', { session: false }), BlogPostController.deleteBlogPost);
  }
}
