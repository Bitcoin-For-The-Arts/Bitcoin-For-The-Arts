import BitcoinQr from '@/components/BitcoinQr';
import CopyButton from '@/components/CopyButton';

export default function BitcoinDonationCard({ address }: { address: string }) {
  const isPlaceholder = address.startsWith('bc1qarts');

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6">
      <div className="text-sm font-semibold tracking-tight">Donate Bitcoin</div>
      <p className="mt-2 text-sm leading-relaxed text-black/70">
        Send BTC to the address below. Use the QR code for mobile wallets.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-start">
        <div className="sm:col-span-7">
          <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-black/60">
              Address
            </div>
            <div className="mt-2 break-all font-mono text-sm">{address}</div>
            {isPlaceholder ? (
              <div className="mt-3 text-xs text-black/60">
                Set <span className="font-mono">NEXT_PUBLIC_BTC_DONATION_ADDRESS</span>{' '}
                to your real donation address.
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <CopyButton text={address} />
            <a
              href={`bitcoin:${address}`}
              className="inline-flex items-center justify-center rounded-md border border-black/15 px-4 py-2 text-sm font-semibold transition-colors hover:bg-black/5"
            >
              Open in wallet
            </a>
          </div>

          <div className="mt-6 text-xs leading-relaxed text-black/60">
            Tip: always verify the address before sending. Bitcoin transactions are
            irreversible.
          </div>
        </div>

        <div className="sm:col-span-5 sm:flex sm:justify-end">
          <BitcoinQr text={address} size={208} />
        </div>
      </div>
    </div>
  );
}

