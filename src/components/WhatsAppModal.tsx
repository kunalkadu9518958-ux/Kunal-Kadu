import { useState } from 'react';
import { Check, Copy, ExternalLink, MessageCircle, X } from 'lucide-react';
import { StoreConfig, buildWhatsAppUrl, formatInr } from '../data/catalog';
import { WishlistItem } from './WishlistDrawer';

interface WhatsAppModalProps {
  items: WishlistItem[];
  storeConfig: StoreConfig;
  onClose: () => void;
}

export function WhatsAppModal({ items, storeConfig, onClose }: WhatsAppModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [copied, setCopied] = useState(false);

  if (items.length === 0) return null;

  const itemLines = items
    .map(
      ({ product, size }, index) =>
        `${index + 1}. ${product.name} (Size: ${size}) — ${formatInr(product.priceInr)}`
    )
    .join('\n');

  const greeting = customerName.trim()
    ? `Namaste ${storeConfig.name}, my name is ${customerName.trim()}.`
    : `Namaste ${storeConfig.name},`;

  const noteLine = customerNote.trim() ? `\nNote: ${customerNote.trim()}` : '';

  const fullMessage = `${greeting}\nI would like to enquire about availability for:\n${itemLines}${noteLine}\n\nStore: ${storeConfig.addressLine1}`;
  const whatsAppHref = buildWhatsAppUrl(fullMessage, storeConfig.whatsappNumber);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#140B0C]/60 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-modal-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg bg-[#FAF7F2] border border-[#E5DDD0] rounded-lg shadow-xl overflow-hidden">
        <div className="px-6 py-4 bg-[#58111E] text-[#FAF7F2] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <MessageCircle className="w-5 h-5 text-[#D4AF63]" strokeWidth={1.75} aria-hidden="true" />
            <h2 id="whatsapp-modal-title" className="font-display text-lg font-semibold">
              WhatsApp Store Enquiry
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close WhatsApp enquiry dialog"
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-[#FAF7F2]/80 hover:text-[#FAF7F2] hover:bg-[#FAF7F2]/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="wa-name" className="block text-xs font-medium text-[#4A403B] mb-1">
                Your Name (Optional)
              </label>
              <input
                id="wa-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Aarav Deshmukh"
                className="w-full h-10 px-3 text-sm bg-[#F2ECE1] text-[#1E1917] border border-[#D8CCBA] rounded-md focus:outline-none focus:border-[#58111E]"
              />
            </div>

            <div>
              <label htmlFor="wa-note" className="block text-xs font-medium text-[#4A403B] mb-1">
                Visit / Fitting Note (Optional)
              </label>
              <input
                id="wa-note"
                type="text"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="e.g. Visiting at 6 PM today"
                className="w-full h-10 px-3 text-sm bg-[#F2ECE1] text-[#1E1917] border border-[#D8CCBA] rounded-md focus:outline-none focus:border-[#58111E]"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-[#4A403B] mb-1.5">
              Enquiry Message Preview
            </p>
            <pre className="p-3.5 text-xs sm:text-sm font-sans whitespace-pre-wrap leading-relaxed bg-[#F2ECE1] text-[#1E1917] border border-[#E5DDD0] rounded-md max-h-44 overflow-y-auto">
              {fullMessage}
            </pre>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <a
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#58111E] hover:bg-[#3F0A14] rounded-md transition-colors whitespace-nowrap min-h-[44px]"
            >
              <span>Open WhatsApp Chat</span>
              <ExternalLink className="w-4 h-4 text-[#D4AF63]" strokeWidth={1.75} aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={handleCopyMessage}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-[#1E1917] bg-[#F2ECE1] hover:bg-[#EAE0D0] border border-[#D8CCBA] rounded-md transition-colors whitespace-nowrap min-h-[44px] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#58111E]" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#58111E]" aria-hidden="true" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
