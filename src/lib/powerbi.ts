/**
 * Constrói a URL de embed do Power BI.
 * ⚠️ CATRACA: "Publish to Web" é público por design.
 */
export function buildEmbedUrl(settings: {
  active_mode: 'report_id' | 'embed_url'
  report_id?: string | null
  embed_url?: string | null
}): string | null {
  if (settings.active_mode === 'embed_url') {
    return settings.embed_url ?? null
  }
  if (settings.active_mode === 'report_id') {
    const template =
      process.env.POWERBI_EMBED_URL_TEMPLATE ??
      'https://app.powerbi.com/view?r={{REPORT_ID}}'
    if (!settings.report_id) return null
    return template.replace('{{REPORT_ID}}', settings.report_id)
  }
  return null
}
