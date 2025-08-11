import nodemailer from "nodemailer";



export const sendMail = async ({to,subject,html}) => {

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: "mohamed.abdelghaffar2002@gmail.com",
        pass: "enfimtkteerrybbx",
      },
    });
   await transporter.sendMail({
       from: '"saraha app" <mohamed.abdelghaffar2002@gmail.com>',
       to,
       subject,
       html,
     });
}

