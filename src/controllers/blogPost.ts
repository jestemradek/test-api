import { Request, Response } from 'express';
import { UserModel } from '../schemas/user';
import { APILogger } from '../utility/logger';
import { formatOutput } from '../utility/apiUtility';
import { BlogPostModel } from '../schemas/blogPost';

export default {
  getBlogPosts(req: Request, res: Response): void {
    const user = req.user as UserModel;
    BlogPostModel.find({ userId: user._id }, (err, blogPosts) => {
      if (err) {
        APILogger.logger.warn(`BlogPosts get problem: ${err.message}`);
        res.status(400).send(`BlogPosts get problem: ${err.message}`);
        return null;
      }
      APILogger.logger.info(`[GET] [/user/blogPosts] user: ${user.email}`);
      formatOutput(res, blogPosts, 200);
    });
  },
  getBlogPost(req: Request, res: Response): void {
    const user = req.user as UserModel;
    BlogPostModel.findOne({ _id: req.params.blogPostId, userId: user._id }, (err, blogPost) => {
      if (err) {
        APILogger.logger.warn(`BlogPost get problem: ${err.message}`);
        res.status(400).send(`BlogPost get problem: ${err.message}`);
        return null;
      }
      if (!blogPost) {
        APILogger.logger.warn(`[GET] [/user/blogPost/${req.params.blogPostId}] blogPost not found`);
        res.status(404).send(`BlogPost not found`);
        return null;
      }
      APILogger.logger.info(`[GET] [/user/blogPost/${req.params.blogPostId}]`);
      formatOutput(res, blogPost, 200);
    });
  },
  addBlogPost(req: Request, res: Response): void {
    const user = req.user as UserModel;
    const userId = user._id;
    const { alias, date, subject, content } = req.body;
    const newBlogPost = new BlogPostModel({
      userId,
      alias,
      date,
      subject,
      content,
    });
    newBlogPost.save((err, blogPost) => {
      if (err) {
        APILogger.logger.warn(`BlogPost adding problem: ${err.message}`);
        res.status(400).send(`BlogPost adding problem: ${err.message}`);
        return null;
      }

      user.blogPostsIds.push(blogPost._id);
      user.save();

      APILogger.logger.info(`[POST] [/user/blogPost] user: ${user.email}`);
      formatOutput(res, blogPost, 201);
    });
  },
  updateBlogPost(req: Request, res: Response): void {
    const user = req.user as UserModel;
    const { alias, date, subject, content } = req.body;

    BlogPostModel.findOneAndUpdate(
      { _id: req.params.blogPostId, userId: user._id },
      { alias: alias, date: date, subject: subject, content: content },
      { new: true },
      (err, blogPost) => {
        if (err) {
          APILogger.logger.warn(`[PATCH] [/user/blogPost] blogPost updating problem: ${err.message}`);
          res.status(400).send(`[PATCH] [/user/blogPost] blogPost updating problem: ${err.message}`);
          return null;
        }
        if (!blogPost) {
          APILogger.logger.warn(`[PATCH] [/user/blogPost] blogPost not found`);
          res.status(404).send(`[PATCH] [/user/blogPost] blogPost not found`);
          return null;
        }
        APILogger.logger.info(`[PATCH] [/user/blogPost] blogPost: ${req.params.blogPostId}`);
        formatOutput(res, blogPost, 200);
      },
    );
  },
  deleteBlogPost(req: Request, res: Response): void {
    const user = req.user as UserModel;
    BlogPostModel.findOne({ _id: req.params.blogPostId, userId: user._id }, (err, blogPost) => {
      if (err) {
        APILogger.logger.warn(`BlogPost deleting problem: ${err.message}`);
        res.status(400).send(`BlogPost deleting problem: ${err.message}`);
        return null;
      }
      if (!blogPost) {
        APILogger.logger.warn(`[PATCH] [/user/blogPost] blogPost not found`);
        res.status(404).send(`[PATCH] [/user/blogPost] blogPost not found`);
        return null;
      }
      blogPost.remove(err => {
        if (err) {
          APILogger.logger.warn(`BlogPost deleting problem: ${err.message}`);
          res.status(400).send(`BlogPost deleting problem: ${err.message}`);
          return null;
        }

        user.blogPostsIds.pull({ _id: blogPost._id });
        user.save();

        APILogger.logger.info(`[DELETE] [/user/blogPost] blogPost: ${req.params.blogPostId}`);
        res.status(204).send();
      });
    });
  },
};
