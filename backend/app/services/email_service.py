import json
import logging
import smtplib
import urllib.request
import urllib.error
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger("karigar_ai.email_service")


class EmailService:
    def __init__(self):
        self.resend_api_key = settings.RESEND_API_KEY
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.EMAILS_FROM_EMAIL
        self.from_name = settings.EMAILS_FROM_NAME

    def is_configured(self) -> bool:
        return bool(self.resend_api_key or (self.smtp_host and self.smtp_user and self.smtp_password))

    def _send_via_resend(self, to_email: str, subject: str, html_content: str, text_content: str) -> bool:
        url = "https://api.resend.com/emails"
        payload = {
            "from": "KarigarAI <onboarding@resend.dev>",
            "to": [to_email],
            "subject": subject,
            "html": html_content,
            "text": text_content,
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Authorization": f"Bearer {self.resend_api_key}",
                "Content-Type": "application/json",
                "User-Agent": "KarigarAI-Backend/1.0",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                res_body = response.read().decode("utf-8")
                logger.info(f"Resend email dispatched successfully to {to_email}: {res_body}")
                return True
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8") if e.fp else str(e)
            logger.error(f"Resend HTTP error ({e.code}) sending to {to_email}: {err_body}")
            return False
        except Exception as e:
            logger.error(f"Resend connection exception sending to {to_email}: {e}")
            return False

    def send_otp_email(self, to_email: str, otp_code: str) -> bool:
        """
        Dispatches a clean HTML OTP verification email to the user's inbox.
        Uses Resend API if RESEND_API_KEY is present, or falls back to SMTP.
        """
        subject = f"{otp_code} is your KarigarAI Password Reset Code"
        text_content = f"KarigarAI Password Reset Code: {otp_code}\nThis code is valid for 10 minutes."
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #fcfbf9; margin: 0; padding: 20px; }}
            .container {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #fde68a; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
            .header {{ text-align: center; border-bottom: 1px solid #fef3c7; padding-bottom: 20px; margin-bottom: 24px; }}
            .brand {{ font-size: 24px; font-weight: 800; color: #b45309; font-family: serif; }}
            .subtitle {{ font-size: 13px; color: #78350f; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }}
            .title {{ font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 12px; }}
            .otp-box {{ background: #fffbeb; border: 2px dashed #f59e0b; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0; }}
            .otp-code {{ font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #b45309; font-family: monospace; }}
            .expiry-note {{ font-size: 12px; color: #92400e; margin-top: 8px; font-weight: 600; }}
            .footer {{ font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 20px; margin-top: 28px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="brand">✨ KarigarAI</div>
              <div class="subtitle">Artisan Digital Portal</div>
            </div>
            <div class="title">Password Reset Verification</div>
            <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
              Namaste! We received a request to reset your password for your KarigarAI artisan account. Please use the 6-digit verification OTP code below:
            </p>
            <div class="otp-box">
              <div class="otp-code">{otp_code}</div>
              <div class="expiry-note">⏳ Code expires in 10 minutes</div>
            </div>
            <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">
              If you did not request a password reset, please ignore this email or contact support if you suspect unauthorized access.
            </p>
            <div class="footer">
              © 2026 KarigarAI Platform • Empowering Indian Artisans
            </div>
          </div>
        </body>
        </html>
        """

        if not self.is_configured():
            logger.info(f"[EMAIL SERVICE SIMULATION] Configured=False. OTP for {to_email}: {otp_code}")
            return False

        # Priority 1: Resend API
        if self.resend_api_key:
            resend_ok = self._send_via_resend(to_email, subject, html_content, text_content)
            if resend_ok:
                return True

        # Priority 2: Standard SMTP
        if self.smtp_host and self.smtp_user and self.smtp_password:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = f"{self.from_name} <{self.from_email}>"
                msg["To"] = to_email

                msg.attach(MIMEText(text_content, "plain"))
                msg.attach(MIMEText(html_content, "html"))

                if self.smtp_port == 465:
                    with smtplib.SMTP_SSL(self.smtp_host, self.smtp_port, timeout=10) as server:
                        server.login(self.smtp_user, self.smtp_password)
                        server.sendmail(self.from_email, [to_email], msg.as_string())
                else:
                    with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=10) as server:
                        server.starttls()
                        server.login(self.smtp_user, self.smtp_password)
                        server.sendmail(self.from_email, [to_email], msg.as_string())

                logger.info(f"Successfully sent OTP email to {to_email} via SMTP")
                return True
            except Exception as e:
                logger.error(f"Failed to send email to {to_email} via SMTP: {e}")
                return False

        return False


email_service = EmailService()
