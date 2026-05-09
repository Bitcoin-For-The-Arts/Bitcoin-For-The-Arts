import { browser } from '$app/environment';

export async function ensureWebln(): Promise<void> {
  if (!browser) throw new Error('WebLN is only available in the browser');
  if (!window.webln?.enable) throw new Error('No WebLN provider found. Install Alby or another WebLN wallet.');
  await window.webln.enable();
}

export async function sendPayment(invoice: string): Promise<void> {
  await ensureWebln();
  await window.webln!.sendPayment(invoice);
}

