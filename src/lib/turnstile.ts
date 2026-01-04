import axios from 'axios';

export async function verifyTurnstileToken(token: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY is not defined');
    return { success: false, error: 'Turnstile secret key missing' };
  }

  if (!token) {
    return { success: false, error: 'Token missing' };
  }

  try {
    const response = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        secret: secretKey,
        response: token,
      }
    );

    const data = response.data;
    if (data.success) {
      return { success: true };
    } else {
      return { success: false, error: data['error-codes']?.[0] || 'Verification failed' };
    }
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return { success: false, error: 'Internal verification error' };
  }
}
