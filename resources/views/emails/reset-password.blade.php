<!DOCTYPE html>
<html>
<head>
    <title>Reset Password</title>
</head>
<body>
    <h1>Reset Your Password</h1>
    
    <p>You have requested to reset your password.</p>
    
    <p>Click the button below to reset your password:</p>
    
    <a href="{{ $reset_link }}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Reset Password
    </a>
    
    <p>This link will expire in 10 minutes (at {{ $expires_at }}).</p>
    
    <p>If you did not request a password reset, please ignore this email.</p>
</body>
</html> 