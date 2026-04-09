const nodemailer = require('nodemailer');

function createMailer(config) {
    const isConfigured = Boolean(
        config.smtpHost
        && config.smtpUser
        && config.smtpPassword
        && config.smtpFromEmail,
    );

    const transporter = isConfigured
        ? nodemailer.createTransport({
            host: config.smtpHost,
            port: config.smtpPort,
            secure: config.smtpSecure,
            auth: {
                user: config.smtpUser,
                pass: config.smtpPassword,
            },
        })
        : null;

    async function sendPasswordResetEmail({ email, name, resetUrl }) {
        const subject = 'Восстановление пароля';
        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
                <h2 style="margin-bottom: 12px;">Восстановление доступа</h2>
                <p>${name ? `Здравствуйте, ${name}.` : 'Здравствуйте.'}</p>
                <p>Мы получили запрос на смену пароля для аккаунта в приложении «Мои ложки».</p>
                <p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 10px 16px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px;">
                        Сбросить пароль
                    </a>
                </p>
                <p>Если кнопка не открывается, скопируйте ссылку вручную:</p>
                <p style="word-break: break-all;">${resetUrl}</p>
                <p>Если это были не вы, просто проигнорируйте письмо.</p>
            </div>
        `;
        const text = [
            'Восстановление доступа',
            '',
            name ? `Здравствуйте, ${name}.` : 'Здравствуйте.',
            'Мы получили запрос на смену пароля для аккаунта в приложении «Мои ложки».',
            `Ссылка для сброса пароля: ${resetUrl}`,
            'Если это были не вы, просто проигнорируйте письмо.',
        ].join('\n');

        if (!transporter) {
            if (config.isDevelopment) {
                console.log(`Password reset link for ${email}: ${resetUrl}`);
                return;
            }

            const error = new Error('SMTP is not configured');
            error.statusCode = 500;
            throw error;
        }

        await transporter.sendMail({
            from: config.smtpFromName
                ? `"${config.smtpFromName}" <${config.smtpFromEmail}>`
                : config.smtpFromEmail,
            to: email,
            subject,
            text,
            html,
        });
    }

    return {
        isConfigured,
        sendPasswordResetEmail,
    };
}

module.exports = {
    createMailer,
};
