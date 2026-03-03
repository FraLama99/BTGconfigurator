import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Compatibile con mailer.sendMail() usato in user_routes.js
const mailer = {
    sendMail: async ({ from, to, subject, text, html }) => {
        return resend.emails.send({
            from: from || 'BTG System <noreply@3dlama.it>',
            to,
            subject,
            text,
            html
        });
    }
};

export default mailer;