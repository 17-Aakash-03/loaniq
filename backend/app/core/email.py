import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text      import MIMEText
from datetime             import datetime


def send_score_email(
    to_email:    str,
    user_name:   str,
    score:       int,
    risk_tier:   str,
    explanation: list,
    tips:        list,
):
    try:
        mail_user = os.getenv("MAIL_USERNAME")
        mail_pass = os.getenv("MAIL_PASSWORD")
        mail_from = os.getenv("MAIL_FROM")
        mail_host = os.getenv("MAIL_SERVER", "smtp.gmail.com")
        mail_port = int(os.getenv("MAIL_PORT", 587))

        if not mail_user or not mail_pass:
            print("⚠ Email credentials not configured. Skipping email.")
            return False

        score_color = (
            "#00ff96" if score >= 65 else
            "#ffb800" if score >= 40 else
            "#ff2d9b"
        )
        tier_label = f"{risk_tier} Risk"
        now        = datetime.now().strftime("%d %b %Y at %I:%M %p")

        explanation_html = "".join(
            f'<li style="margin-bottom:8px;color:#555;">{e}</li>'
            for e in explanation
        )
        tips_html = "".join(
            f'''<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:10px;">
                  <div style="width:24px;height:24px;background:#ffb800;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#000;font-size:11px;flex-shrink:0;">{i+1}</div>
                  <p style="margin:0;font-size:13px;color:#666;line-height:1.6;">{t}</p>
                </div>'''
            for i, t in enumerate(tips)
        )

        html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Credit Analysis Report</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">

    <div style="background:linear-gradient(135deg,#0f2850,#1a3a6b);border-radius:12px 12px 0 0;padding:32px;text-align:center;">
      <div style="width:60px;height:60px;background:rgba(0,212,200,0.2);border:2px solid #00d4c8;border-radius:12px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:28px;">💳</div>
      <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:2px;text-transform:uppercase;">MICRO-LOAN.AI</h1>
      <p style="margin:8px 0 0;color:rgba(0,212,200,0.7);font-size:12px;letter-spacing:3px;text-transform:uppercase;">Neural Credit Intelligence System</p>
    </div>

    <div style="background:{score_color}15;border-left:4px solid {score_color};border-right:4px solid {score_color};padding:24px 32px;text-align:center;">
      <p style="margin:0 0 8px;font-size:12px;color:#888;letter-spacing:2px;text-transform:uppercase;">YOUR CREDIT SCORE</p>
      <div style="font-size:72px;font-weight:900;color:{score_color};line-height:1;font-family:'Courier New',monospace;">{score}</div>
      <div style="font-size:13px;color:#888;margin-top:4px;">out of 100</div>
      <div style="display:inline-block;margin-top:12px;padding:6px 20px;background:{score_color}20;border:1px solid {score_color}60;border-radius:20px;font-size:12px;font-weight:700;color:{score_color};letter-spacing:2px;text-transform:uppercase;">{tier_label}</div>
    </div>

    <div style="background:#fff;border-radius:0 0 12px 12px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      <p style="margin:0 0 24px;font-size:15px;color:#333;line-height:1.7;">
        Dear <strong>{user_name}</strong>,<br/><br/>
        Your credit analysis has been completed by our AI system.
        Here is a summary of your results generated on <strong>{now}</strong>.
      </p>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:28px;">
        <div style="text-align:center;padding:16px;background:#f8f9fc;border-radius:8px;border:1px solid #e8ecf0;">
          <div style="font-size:28px;font-weight:900;color:{score_color};font-family:'Courier New',monospace;">{score}</div>
          <div style="font-size:10px;color:#888;letter-spacing:1px;text-transform:uppercase;margin-top:4px;">Score</div>
        </div>
        <div style="text-align:center;padding:16px;background:#f8f9fc;border-radius:8px;border:1px solid #e8ecf0;">
          <div style="font-size:18px;font-weight:900;color:{score_color};">{tier_label}</div>
          <div style="font-size:10px;color:#888;letter-spacing:1px;text-transform:uppercase;margin-top:4px;">Risk Tier</div>
        </div>
        <div style="text-align:center;padding:16px;background:#f8f9fc;border-radius:8px;border:1px solid #e8ecf0;">
          <div style="font-size:18px;font-weight:900;color:#0f2850;">TOP {100-score}%</div>
          <div style="font-size:10px;color:#888;letter-spacing:1px;text-transform:uppercase;margin-top:4px;">Percentile</div>
        </div>
      </div>

      <div style="margin-bottom:28px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:11px;color:#888;letter-spacing:1px;text-transform:uppercase;">Score Indicator</span>
          <span style="font-size:11px;font-weight:700;color:{score_color};">{score}/100</span>
        </div>
        <div style="height:10px;background:#f0f2f5;border-radius:5px;overflow:hidden;">
          <div style="height:100%;width:{score}%;background:linear-gradient(90deg,{score_color}80,{score_color});border-radius:5px;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:4px;">
          <span style="font-size:10px;color:#e74c3c;">High Risk</span>
          <span style="font-size:10px;color:#f39c12;">Medium</span>
          <span style="font-size:10px;color:#27ae60;">Low Risk</span>
        </div>
      </div>

      <div style="margin-bottom:28px;">
        <h3 style="margin:0 0 14px;font-size:14px;color:#0f2850;letter-spacing:1px;text-transform:uppercase;border-bottom:2px solid #e8ecf0;padding-bottom:8px;">
          📊 Decision Rationale
        </h3>
        <ul style="margin:0;padding-left:20px;">
          {explanation_html}
        </ul>
      </div>

      <div style="margin-bottom:28px;padding:20px;background:#fffbf0;border-radius:8px;border:1px solid #ffd700;">
        <h3 style="margin:0 0 16px;font-size:14px;color:#b8860b;letter-spacing:1px;text-transform:uppercase;">
          💡 Score Improvement Tips
        </h3>
        {tips_html}
      </div>

      <div style="padding:16px;background:#f0f8ff;border-radius:8px;border:1px solid #b0d0ff;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;color:#555;line-height:1.7;">
          <strong style="color:#0f2850;">AI Model:</strong> Transformer Encoder + Graph Attention Network (GAT) v2.0<br/>
          <strong style="color:#0f2850;">Model AUC-ROC:</strong> 0.9618 (Excellent)<br/>
          <strong style="color:#0f2850;">Data Analyzed:</strong> 12 months of behavioral sequences<br/>
          <strong style="color:#0f2850;">Generated:</strong> {now}
        </p>
      </div>

      <div style="padding:16px;background:#f8f9fc;border-radius:8px;border-left:3px solid #ccc;">
        <p style="margin:0;font-size:11px;color:#999;line-height:1.7;">
          This report is generated by an AI model for informational purposes only.
          It does not constitute professional financial advice.
          Credit decisions should be made in consultation with a qualified financial advisor.
        </p>
      </div>
    </div>

    <div style="text-align:center;padding:20px;">
      <p style="margin:0;font-size:11px;color:#aaa;letter-spacing:1px;">
        MICRO-LOAN.AI · Neural Credit Intelligence System<br/>
        Powered by Transformer + GAT · AUC 0.9618<br/>
        <span style="color:#ccc;">This is an automated email. Please do not reply.</span>
      </p>
    </div>
  </div>
</body>
</html>"""

        msg = MIMEMultipart('alternative')
        msg['Subject']  = f"🎯 Your Credit Score: {score}/100 — {tier_label} | Micro-Loan.AI"
        msg['From']     = f"Micro-Loan.AI <{mail_from}>"
        msg['To']       = to_email
        msg['X-Mailer'] = 'Micro-Loan.AI Notification System'
        msg['Reply-To'] = mail_from
        msg.attach(MIMEText(html, 'html'))

        with smtplib.SMTP(mail_host, mail_port) as server:
            server.ehlo()
            server.starttls()
            server.login(mail_user, mail_pass)
            server.sendmail(mail_from, to_email, msg.as_string())

        print(f"✅ Email sent to {to_email}")
        return True

    except Exception as e:
        print(f"⚠ Email failed: {e}")
        return False


def send_reset_password_email(
    to_email:  str,
    user_name: str,
    token:     str,
) -> bool:
    try:
        mail_user = os.getenv("MAIL_USERNAME")
        mail_pass = os.getenv("MAIL_PASSWORD")
        mail_from = os.getenv("MAIL_FROM")
        mail_host = os.getenv("MAIL_SERVER", "smtp.gmail.com")
        mail_port = int(os.getenv("MAIL_PORT", 587))

        if not mail_user or not mail_pass:
            print("⚠ Email credentials not configured.")
            return False

        reset_url = f"http://localhost:3000/reset-password?token={token}"
        now       = datetime.now().strftime("%d %b %Y at %I:%M %p")

        html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">

    <div style="background:linear-gradient(135deg,#0f2850,#1a3a6b);border-radius:12px 12px 0 0;padding:32px;text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">🔐</div>
      <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:2px;text-transform:uppercase;">PASSWORD RESET</h1>
      <p style="margin:8px 0 0;color:rgba(0,212,200,0.7);font-size:12px;letter-spacing:2px;text-transform:uppercase;">MICRO-LOAN.AI Security</p>
    </div>

    <div style="background:#fff;border-radius:0 0 12px 12px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 24px;">
        Dear <strong>{user_name}</strong>,<br/><br/>
        We received a request to reset your password for your Micro-Loan.AI account.
        Click the button below to set a new password.
        This link expires in <strong>1 hour</strong>.
      </p>

      <div style="text-align:center;margin:32px 0;">
        <a href="{reset_url}"
           style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#0f2850,#00d4c8);color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;letter-spacing:2px;text-transform:uppercase;box-shadow:0 4px 15px rgba(0,212,200,0.3);">
          🔑 RESET MY PASSWORD
        </a>
      </div>

      <div style="padding:16px;background:#f8f9fc;border-radius:8px;border-left:3px solid #00d4c8;margin-bottom:20px;">
        <p style="margin:0;font-size:12px;color:#666;line-height:1.7;">
          <strong>Can't click the button?</strong> Copy and paste this link in your browser:<br/>
          <a href="{reset_url}" style="color:#0f2850;word-break:break-all;font-size:11px;">{reset_url}</a>
        </p>
      </div>

      <div style="padding:16px;background:#fff8f0;border-radius:8px;border-left:3px solid #ffb800;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;color:#666;line-height:1.7;">
          ⚠️ <strong>Security notice:</strong> If you did not request a password reset,
          please ignore this email. Your password will remain unchanged.
          This link will expire at {now} + 1 hour.
        </p>
      </div>

      <div style="padding:16px;background:#f8f9fc;border-radius:8px;border-left:3px solid #ccc;">
        <p style="margin:0;font-size:11px;color:#999;line-height:1.7;">
          This is an automated security email from Micro-Loan.AI.
          Please do not reply to this email.
        </p>
      </div>
    </div>

    <div style="text-align:center;padding:20px;">
      <p style="margin:0;font-size:11px;color:#aaa;letter-spacing:1px;">
        MICRO-LOAN.AI · Neural Credit Intelligence System<br/>
        Powered by Transformer + GAT · AUC 0.9618
      </p>
    </div>
  </div>
</body>
</html>"""

        msg = MIMEMultipart('alternative')
        msg['Subject']  = "🔐 Reset Your Micro-Loan.AI Password"
        msg['From']     = f"Micro-Loan.AI Security <{mail_from}>"
        msg['To']       = to_email
        msg['X-Mailer'] = 'Micro-Loan.AI Security System'
        msg['Reply-To'] = mail_from
        msg.attach(MIMEText(html, 'html'))

        with smtplib.SMTP(mail_host, mail_port) as server:
            server.ehlo()
            server.starttls()
            server.login(mail_user, mail_pass)
            server.sendmail(mail_from, to_email, msg.as_string())

        print(f"✅ Reset email sent to {to_email}")
        return True

    except Exception as e:
        print(f"⚠ Reset email failed: {e}")
        return False