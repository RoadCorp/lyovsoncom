const XML_DECLARATION_PATTERN = /^(?<declaration><\?xml[^?]*\?>\s*)/u;

/**
 * Inserts an `<?xml-stylesheet?>` processing instruction immediately after
 * the XML declaration so browsers render a human-readable feed preview while
 * feed readers parse the XML untouched.
 */
export function attachXmlStylesheet(xml: string, href: string): string {
  const instruction = `<?xml-stylesheet type="text/xsl" href="${href}"?>\n`;
  if (XML_DECLARATION_PATTERN.test(xml)) {
    return xml.replace(XML_DECLARATION_PATTERN, `$<declaration>${instruction}`);
  }
  return `${instruction}${xml}`;
}
