import * as nodemailer from 'nodemailer';
import { APILogger } from './logger';
import * as fs from 'fs';
import * as ejs from 'ejs';
import { emailCfg } from '../config/mailerConfig';

export class Mailer {
  public static sendEmail(toEmail: string, toName: string, reason: string, locale = 'en', content: {}): void {
    const templatesFolder = 'dist/templates/email/';
    const ejsTemplateFile = '/' + reason + '.ejs';
    const subjectFile = '/' + reason + '.subject.txt';

    let ejsTemplate: string = null;
    let subject: string = null;

    if (fs.existsSync(templatesFolder + locale + ejsTemplateFile) && fs.existsSync(templatesFolder + locale + subjectFile)) {
      try {
        ejsTemplate = fs.readFileSync(templatesFolder + locale + ejsTemplateFile, 'utf8').toString();
        subject = fs.readFileSync(templatesFolder + locale + subjectFile, 'utf8').toString();
      } catch (err) {
        APILogger.logger.error(`[EMAIL] sending problem to: ${toEmail}, reason: ${reason}, error: ${err}`);
      }
    } else {
      if (locale !== 'en') {
        try {
          ejsTemplate = fs.readFileSync(templatesFolder + 'en' + ejsTemplateFile, 'utf8').toString();
          subject = fs.readFileSync(templatesFolder + 'en' + subjectFile, 'utf8').toString();
          APILogger.logger.error(`[EMAIL] reason: ${reason}, error: template in language ${locale} not found, using en`);
        } catch (err) {
          APILogger.logger.error(`[EMAIL] sending problem to: ${toEmail}, reason: ${reason}, error: ${err}`);
        }
      } else {
        APILogger.logger.error(`[EMAIL] sending problem to: ${toEmail}, reason: ${reason}, error: templates not found`);
      }
    }

    let html = null;
    try {
      html = ejs.render(ejsTemplate, content);
    } catch (err) {
      APILogger.logger.error(`[EMAIL] sending problem to: ${toEmail}, reason: ejsTemplate templating problem, error: ${err}`);
    }

    if (subject != null && html != null) {
      const transporter = nodemailer.createTransport({
        service: emailCfg.emailService,
        auth: {
          user: emailCfg.emailAuth.user,
          pass: emailCfg.emailAuth.pass,
        },
      });

      const mailOptions = {
        from: `${emailCfg.emailSenderName} <${emailCfg.emailFrom}>`,
        to: `${toName} <${toEmail}>`,
        subject: subject,
        html: html,
      };

      Promise.resolve(transporter.sendMail(mailOptions))
        .then(() => {
          APILogger.logger.info(`[EMAIL] sent to: ${toEmail}`);
        })
        .catch(error => {
          APILogger.logger.error(`[EMAIL] sending problem to: ${toEmail}, error: ${error}`);
        });
    }
  }
}
