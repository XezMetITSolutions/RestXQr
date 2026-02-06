const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'w01dc0ea.kasserver.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'bp@xezmet.at',
    pass: '1528797Mb'
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendDemoRequestEmail = async (data) => {
  const { name, email, phone, company, message, language, source } = data;

  const subject = `Yeni Demo Talebi: ${name}`;

  const textBody = `
    Yeni bir demo talebi alındı!
    
    Ad Soyad: ${name}
    E-posta: ${email}
    Telefon: ${phone}
    Şirket: ${company || '-'}
    Mesaj: ${message || '-'}
    
    Dil: ${language}
    Kaynak: ${source}
    Zaman: ${new Date().toLocaleString('tr-TR')}
  `;

  const htmlBody = `
    <h3>Yeni Demo Talebi</h3>
    <p>Web sitesinden yeni bir demo talebi geldi.</p>
    <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 600px;">
      <tr>
        <td style="background-color: #f8f9fa;"><strong>Ad Soyad</strong></td>
        <td>${name}</td>
      </tr>
      <tr>
        <td style="background-color: #f8f9fa;"><strong>E-posta</strong></td>
        <td><a href="mailto:${email}">${email}</a></td>
      </tr>
      <tr>
        <td style="background-color: #f8f9fa;"><strong>Telefon</strong></td>
        <td><a href="tel:${phone}">${phone}</a></td>
      </tr>
      <tr>
        <td style="background-color: #f8f9fa;"><strong>Şirket</strong></td>
        <td>${company || '-'}</td>
      </tr>
      <tr>
        <td style="background-color: #f8f9fa;"><strong>Mesaj</strong></td>
        <td>${message || '-'}</td>
      </tr>
      <tr>
        <td style="background-color: #f8f9fa;"><strong>Dil</strong></td>
        <td>${language}</td>
      </tr>
    </table>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"RestXQr Demo Request" <bp@xezmet.at>', // Sender address
      to: 'bp@xezmet.at', // List of receivers
      subject: subject,
      text: textBody,
      html: htmlBody,
      replyTo: email // Reply to the user directly
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error };
  }
};

module.exports = {
  sendDemoRequestEmail
};
