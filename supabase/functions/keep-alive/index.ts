import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  // Só aceita POST
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  // Valida token
  const token = req.headers.get('x-keepalive-token')
  const secret = Deno.env.get('KEEP_ALIVE_SECRET')

  if (!secret || token !== secret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Query mínima usando service role interno da Edge Function
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const { error } = await supabase.rpc('now') // select now()
  
  // Fallback: qualquer query que mantenha o banco ativo
  if (error) {
    await supabase.from('portal_settings').select('id').limit(1)
  }

  return new Response(JSON.stringify({ status: 'alive', ts: new Date().toISOString() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
