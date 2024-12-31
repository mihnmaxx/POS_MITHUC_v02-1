from flask_mail import Message
from flask import current_app

class MailService:
    def __init__(self, mail):
        self.mail = mail

    def send_verification_email(self, email, token):
        subject = 'Xác thực tài khoản'
        sender = current_app.config['MAIL_USERNAME']
        verify_url = f'{current_app.config["HOSTNAME"]}/api/auth/verify-email/{token}'
    
        msg = Message(
            subject,
            sender=sender,
            recipients=[email],
            html=f'''
                <h1>Xác thực tài khoản</h1>
                <p>Click vào link sau để xác thực email của bạn:</p>
                <a href="{verify_url}">Xác thực ngay</a>
            '''
        )
        
        self.mail.send(msg)