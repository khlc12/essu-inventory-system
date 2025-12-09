# SSO Integration Guide for Other Systems

This guide explains what other systems need to integrate with your HR System's SSO (Single Sign-On).

---

## 📋 What You Need to Provide to Other Systems

When another system wants to integrate with your SSO, you need to provide them with:

### 1. OAuth Client Credentials

Create an OAuth client for them in your HR system (`/oauth/clients`) and provide:

- **Client ID**: `019af2a6-6ddb-7338-a3f8-b051dfa1f642` (example)
- **Client Secret**: `xK9pL2mN8qR5sT3vW7yZ1aB4cD6eF8gH0` (example - plain text)
- **Redirect URI**: The callback URL they provide (must match exactly)

### 2. OAuth Endpoints

Provide these URLs:

```
Authorization Endpoint: https://hr-production-eaf1.up.railway.app/oauth/authorize
Token Endpoint: https://hr-production-eaf1.up.railway.app/oauth/token
UserInfo Endpoint: https://hr-production-eaf1.up.railway.app/oauth/userinfo
OpenID Configuration: https://hr-production-eaf1.up.railway.app/.well-known/openid-configuration
```

### 3. Available Scopes

```
openid, profile, email, accounting, payroll, hr
```

---

## 🔧 What Other Systems Need to Implement

### Step 1: Environment Configuration

Other systems need to add these environment variables:

```env
# OAuth Provider (Your HR System)
OAUTH_PROVIDER_URL=https://hr-production-eaf1.up.railway.app

# Client Credentials (from you)
OAUTH_CLIENT_ID=019af2a6-6ddb-7338-a3f8-b051dfa1f642
OAUTH_CLIENT_SECRET=xK9pL2mN8qR5sT3vW7yZ1aB4cD6eF8gH0

# Their Callback URL (must match what you registered)
OAUTH_REDIRECT_URI=https://their-system.com/oauth/callback
```

### Step 2: Implement OAuth Flow

Other systems need to implement the **OAuth 2.0 Authorization Code Flow**:

#### Flow Overview:

1. **User clicks "Login with HR System"** → Redirect to authorization endpoint
2. **User logs in and approves** → Redirected back with authorization code
3. **Exchange code for token** → Get access token
4. **Get user info** → Retrieve user data
5. **Create/login user** → Authenticate user in their system

---

## 💻 Implementation Examples

### For Laravel Systems

#### 1. Add Routes

```php
// routes/web.php
Route::get('/oauth/redirect', [OAuthController::class, 'redirect'])
    ->name('oauth.redirect');

Route::get('/oauth/callback', [OAuthController::class, 'callback'])
    ->name('oauth.callback');
```

#### 2. Create OAuth Controller

```php
<?php
// app/Http/Controllers/Auth/OAuthController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class OAuthController extends Controller
{
    public function redirect()
    {
        $state = Str::random(40);
        session(['oauth_state' => $state]);
        
        $params = [
            'client_id' => config('services.oauth.client_id'),
            'redirect_uri' => config('services.oauth.redirect_uri'),
            'response_type' => 'code',
            'scope' => 'openid profile email',
            'state' => $state,
        ];
        
        $url = config('services.oauth.provider_url') . '/oauth/authorize?' . http_build_query($params);
        
        return redirect($url);
    }
    
    public function callback(Request $request)
    {
        // Verify state
        if ($request->get('state') !== session('oauth_state')) {
            return redirect('/login')->with('error', 'Invalid state parameter');
        }
        
        // Exchange code for token
        $response = Http::asForm()->post(config('services.oauth.provider_url') . '/oauth/token', [
            'grant_type' => 'authorization_code',
            'client_id' => config('services.oauth.client_id'),
            'client_secret' => config('services.oauth.client_secret'),
            'code' => $request->get('code'),
            'redirect_uri' => config('services.oauth.redirect_uri'),
        ]);
        
        if (!$response->successful()) {
            return redirect('/login')->with('error', 'Failed to get access token');
        }
        
        $tokenData = $response->json();
        
        // Get user info
        $userResponse = Http::withToken($tokenData['access_token'])
            ->get(config('services.oauth.provider_url') . '/oauth/userinfo');
        
        if (!$userResponse->successful()) {
            return redirect('/login')->with('error', 'Failed to get user info');
        }
        
        $userInfo = $userResponse->json();
        
        // Find or create user
        $user = \App\Models\User::firstOrCreate(
            ['email' => $userInfo['email']],
            [
                'name' => $userInfo['name'],
                'password' => bcrypt(Str::random(32)), // Random password since OAuth
            ]
        );
        
        // Update user info if needed
        $user->update([
            'name' => $userInfo['name'],
        ]);
        
        // Login the user
        Auth::login($user);
        
        return redirect('/dashboard');
    }
}
```

#### 3. Add to `config/services.php`

```php
'oauth' => [
    'provider_url' => env('OAUTH_PROVIDER_URL'),
    'client_id' => env('OAUTH_CLIENT_ID'),
    'client_secret' => env('OAUTH_CLIENT_SECRET'),
    'redirect_uri' => env('OAUTH_REDIRECT_URI'),
],
```

#### 4. Add "Login with HR System" Button

```tsx
// resources/js/pages/auth/login.tsx
<Button
    onClick={() => {
        window.location.href = route('oauth.redirect');
    }}
    variant="outline"
>
    Sign in with HR System
</Button>
```

---

### For React/Next.js Systems

#### 1. Create OAuth Hook

```typescript
// hooks/useOAuth.ts
import { useState } from 'react';

export function useOAuth() {
    const [loading, setLoading] = useState(false);

    const redirectToSSO = () => {
        const state = Math.random().toString(36).substring(7);
        sessionStorage.setItem('oauth_state', state);
        
        const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID!,
            redirect_uri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI!,
            response_type: 'code',
            scope: 'openid profile email',
            state: state,
        });
        
        window.location.href = `${process.env.NEXT_PUBLIC_OAUTH_PROVIDER_URL}/oauth/authorize?${params}`;
    };

    const handleCallback = async (code: string, state: string) => {
        const storedState = sessionStorage.getItem('oauth_state');
        
        if (state !== storedState) {
            throw new Error('Invalid state parameter');
        }
        
        setLoading(true);
        
        try {
            // Exchange code for token
            const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_OAUTH_PROVIDER_URL}/oauth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    grant_type: 'authorization_code',
                    client_id: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID,
                    client_secret: process.env.NEXT_PUBLIC_OAUTH_CLIENT_SECRET, // Server-side only!
                    code: code,
                    redirect_uri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI,
                }),
            });
            
            const tokenData = await tokenResponse.json();
            
            // Get user info
            const userResponse = await fetch(`${process.env.NEXT_PUBLIC_OAUTH_PROVIDER_URL}/oauth/userinfo`, {
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`,
                },
            });
            
            const userInfo = await userResponse.json();
            
            // Send to your backend to create/login user
            const loginResponse = await fetch('/api/auth/oauth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userInfo),
            });
            
            const result = await loginResponse.json();
            
            return result;
        } finally {
            setLoading(false);
        }
    };

    return { redirectToSSO, handleCallback, loading };
}
```

#### 2. Add Login Button

```tsx
// components/LoginButton.tsx
import { useOAuth } from '@/hooks/useOAuth';

export function LoginButton() {
    const { redirectToSSO } = useOAuth();
    
    return (
        <button onClick={redirectToSSO}>
            Sign in with HR System
        </button>
    );
}
```

#### 3. Handle Callback

```tsx
// pages/oauth/callback.tsx
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOAuth } from '@/hooks/useOAuth';

export default function OAuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { handleCallback } = useOAuth();
    
    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        if (code && state) {
            handleCallback(code, state)
                .then(() => {
                    router.push('/dashboard');
                })
                .catch((error) => {
                    console.error('OAuth error:', error);
                    router.push('/login?error=oauth_failed');
                });
        }
    }, [code, state]);
    
    return <div>Processing login...</div>;
}
```

---

### For Node.js/Express Systems

```javascript
// routes/oauth.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Redirect to SSO
router.get('/oauth/redirect', (req, res) => {
    const state = Math.random().toString(36).substring(7);
    req.session.oauth_state = state;
    
    const params = new URLSearchParams({
        client_id: process.env.OAUTH_CLIENT_ID,
        redirect_uri: process.env.OAUTH_REDIRECT_URI,
        response_type: 'code',
        scope: 'openid profile email',
        state: state,
    });
    
    res.redirect(`${process.env.OAUTH_PROVIDER_URL}/oauth/authorize?${params}`);
});

// Handle callback
router.get('/oauth/callback', async (req, res) => {
    const { code, state } = req.query;
    
    // Verify state
    if (state !== req.session.oauth_state) {
        return res.redirect('/login?error=invalid_state');
    }
    
    try {
        // Exchange code for token
        const tokenResponse = await axios.post(
            `${process.env.OAUTH_PROVIDER_URL}/oauth/token`,
            {
                grant_type: 'authorization_code',
                client_id: process.env.OAUTH_CLIENT_ID,
                client_secret: process.env.OAUTH_CLIENT_SECRET,
                code: code,
                redirect_uri: process.env.OAUTH_REDIRECT_URI,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }
        );
        
        // Get user info
        const userResponse = await axios.get(
            `${process.env.OAUTH_PROVIDER_URL}/oauth/userinfo`,
            {
                headers: {
                    'Authorization': `Bearer ${tokenResponse.data.access_token}`,
                },
            }
        );
        
        const userInfo = userResponse.data;
        
        // Find or create user
        let user = await User.findOne({ email: userInfo.email });
        if (!user) {
            user = await User.create({
                email: userInfo.email,
                name: userInfo.name,
                password: require('crypto').randomBytes(32).toString('hex'),
            });
        }
        
        // Login user (set session)
        req.session.userId = user.id;
        
        res.redirect('/dashboard');
    } catch (error) {
        console.error('OAuth error:', error);
        res.redirect('/login?error=oauth_failed');
    }
});
```

---

## 📝 UserInfo Response Format

When other systems call `/oauth/userinfo`, they receive:

```json
{
    "sub": "1",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "email_verified": true,
    "employee_id": "EMP001",
    "employee_number": "12345",
    "department": "IT Department",
    "position": "Software Developer",
    "roles": ["employee", "user"],
    "permissions": ["view-dashboard", "access-employees-module"]
}
```

---

## ✅ Checklist for Other Systems

- [ ] Get OAuth client credentials from you (Client ID, Secret)
- [ ] Configure environment variables
- [ ] Implement OAuth redirect route
- [ ] Implement OAuth callback route
- [ ] Add "Login with HR System" button to login page
- [ ] Handle user creation/login after OAuth
- [ ] Test the complete flow
- [ ] Handle errors gracefully

---

## 🔒 Security Best Practices

1. **Never expose Client Secret in frontend code** - Only use it server-side
2. **Always validate the state parameter** - Prevents CSRF attacks
3. **Use HTTPS in production** - Required for OAuth security
4. **Store tokens securely** - Use secure session storage
5. **Validate redirect URIs** - Ensure they match exactly

---

## 🐛 Common Issues

### "Invalid redirect URI"
- **Solution**: Ensure the redirect URI in their system matches exactly what you registered (including protocol, domain, port, and path)

### "Client not found"
- **Solution**: Verify the Client ID is correct

### "Invalid authorization code"
- **Solution**: Authorization codes expire quickly and can only be used once. Get a fresh code.

### "Unauthenticated" on userinfo
- **Solution**: Ensure the Bearer token is sent in the Authorization header

---

## 📞 Support

If other systems need help integrating, they should:
1. Check this guide first
2. Verify their OAuth client credentials
3. Test with the OpenID Configuration endpoint: `https://hr-production-eaf1.up.railway.app/.well-known/openid-configuration`
4. Contact you for assistance

---

## 🎯 Quick Reference

**Your HR System (SSO Provider):**
- Base URL: `https://hr-production-eaf1.up.railway.app`
- Authorization: `GET /oauth/authorize`
- Token: `POST /oauth/token`
- UserInfo: `GET /oauth/userinfo`
- Discovery: `GET /.well-known/openid-configuration`

**Other Systems (SSO Clients):**
- Need: Client ID, Client Secret, Redirect URI
- Must implement: Redirect route, Callback route, User creation/login

