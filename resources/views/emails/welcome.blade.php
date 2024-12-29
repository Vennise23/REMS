<!DOCTYPE html>
<html>
<head>
    <title>Welcome to {{ config('app.name') }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: #22C55E;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 0 0 5px 5px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #22C55E;
            color: #FFFFFF !important;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
            min-width: 200px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 0.9em;
        }
        .credentials {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to {{ config('app.name') }}</h1>
    </div>
    
    <div class="content">
        <h2>Hello {{ $firstname }} {{ $lastname }}!</h2>
        
        <p>Thank you for joining us. Your account has been successfully created.</p>
        
        <div class="credentials">
            <h3>Your Login Credentials</h3>
            <p><strong>Email:</strong> {{ $email }}</p>
            <p><strong>Temporary Password:</strong> {{ $temporaryPassword }}</p>
        </div>

        <p>For security reasons, please reset your password immediately after your first login.</p>

        <div style="text-align: center;">
            <a href="{{ $resetUrl }}" class="button">
                Reset Your Password
            </a>
        </div>

        <p>Or copy this link to your browser:</p>
        <p style="word-break: break-all; color: #22C55E;">
            {{ $resetUrl }}
        </p>

        <p><strong>Note:</strong> This password reset link will expire in 10 minutes.This link can only be used once; it becomes invalid after being accessed.</p>

        <div class="footer">
            <p>If you did not create this account, please ignore this email or contact support.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html> 