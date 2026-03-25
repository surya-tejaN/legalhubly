import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

function generateOtp(): string {
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)
  const num = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0
  return String(num % 1000000).padStart(6, '0')
}

async function sendOtpEmailNow({
  supabaseUrl,
  serviceRoleKey,
  email,
  userId,
  code,
}: {
  supabaseUrl: string
  serviceRoleKey: string
  email: string
  userId: string
  code: string
}) {
  const startedAt = Date.now()

  const response = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
    },
    body: JSON.stringify({
      templateName: 'otp-verification',
      recipientEmail: email.toLowerCase(),
      idempotencyKey: `otp-${userId}-${Date.now()}`,
      templateData: { code },
    }),
  })

  const durationMs = Date.now() - startedAt
  const responseText = await response.text()

  if (!response.ok) {
    console.error('Failed to send OTP email', {
      status: response.status,
      statusText: response.statusText,
      responseText,
      durationMs,
      email: email.toLowerCase(),
    })

    return {
      ok: false,
      durationMs,
      error: `Email send failed (${response.status} ${response.statusText})`,
    }
  }

  console.log('OTP email accepted by send-transactional-email', {
    email: email.toLowerCase(),
    durationMs,
  })

  if (durationMs > 10000) {
    console.warn('OTP email enqueue took longer than expected', {
      email: email.toLowerCase(),
      durationMs,
    })
  }

  return { ok: true, durationMs, responseText }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  let body: any
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { action } = body

  // ─── GENERATE OTP ───
  if (action === 'generate') {
    const { userId, email } = body
    if (!userId || !email) {
      return new Response(JSON.stringify({ error: 'userId and email required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check rate limit: max 5 codes in last hour for this email
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('email_verification_codes')
      .select('*', { count: 'exact', head: true })
      .eq('email', email.toLowerCase())
      .gte('created_at', oneHourAgo)

    if ((count ?? 0) >= 5) {
      return new Response(JSON.stringify({ error: 'Too many verification attempts. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const code = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Invalidate previous codes for this user
    await supabase
      .from('email_verification_codes')
      .delete()
      .eq('user_id', userId)
      .eq('verified', false)

    // Store new code
    const { error: insertError } = await supabase
      .from('email_verification_codes')
      .insert({
        user_id: userId,
        email: email.toLowerCase(),
        code,
        expires_at: expiresAt,
      })

    if (insertError) {
      console.error('Failed to store OTP', insertError)
      return new Response(JSON.stringify({ error: 'Failed to generate code' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const emailResult = await sendOtpEmailNow({
      supabaseUrl,
      serviceRoleKey: supabaseServiceKey,
      email,
      userId,
      code,
    })

    if (!emailResult.ok) {
      return new Response(JSON.stringify({ error: 'Failed to send verification email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('OTP generated and email queued', {
      email: email.toLowerCase(),
      expiresAt,
      durationMs: emailResult.durationMs,
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // ─── VERIFY OTP ───
  if (action === 'verify') {
    const { email, code } = body
    if (!email || !code) {
      return new Response(JSON.stringify({ error: 'email and code required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get the latest unverified code for this email
    const { data: record, error: fetchError } = await supabase
      .from('email_verification_codes')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fetchError || !record) {
      return new Response(JSON.stringify({ error: 'No verification code found. Please request a new one.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if locked out (5+ attempts)
    if (record.attempts >= 5) {
      const lockExpiry = new Date(new Date(record.created_at).getTime() + 15 * 60 * 1000)
      if (new Date() < lockExpiry) {
        return new Response(JSON.stringify({ error: 'Too many attempts. Please wait a few minutes and request a new code.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Check expiry
    if (new Date() > new Date(record.expires_at)) {
      return new Response(JSON.stringify({ error: 'Code expired. Please request a new one.', expired: true }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check code match
    if (record.code !== code) {
      // Increment attempts
      await supabase
        .from('email_verification_codes')
        .update({ attempts: record.attempts + 1 })
        .eq('id', record.id)

      const remaining = 4 - record.attempts
      return new Response(JSON.stringify({
        error: remaining > 0
          ? `Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
          : 'Too many failed attempts. Please request a new code.',
        invalid: true,
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Code is valid! Mark as verified
    await supabase
      .from('email_verification_codes')
      .update({ verified: true })
      .eq('id', record.id)

    // Confirm user's email in auth via admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(record.user_id, {
      email_confirm: true,
    })

    if (updateError) {
      console.error('Failed to confirm user email', updateError)
      return new Response(JSON.stringify({ error: 'Verification succeeded but account activation failed. Please try logging in.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Clean up old codes for this user
    await supabase
      .from('email_verification_codes')
      .delete()
      .eq('user_id', record.user_id)
      .eq('verified', false)

    console.log('Email verified successfully', { email: email.toLowerCase(), userId: record.user_id })

    return new Response(JSON.stringify({ success: true, verified: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ error: 'Invalid action. Use "generate" or "verify".' }), {
    status: 400,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
