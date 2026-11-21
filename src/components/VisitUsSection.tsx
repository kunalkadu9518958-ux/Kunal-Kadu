import { useState } from 'react';
import { Check, Clock, Copy, MapPin, MessageCircle, Phone } from 'lucide-react';
import { StoreConfig, buildWhatsAppUrl } from '../data/catalog';

interface VisitUsSectionProps {
  storeConfig: StoreConfig;
}

export function VisitUsSection({ storeConfig }: VisitUsSectionProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = async () => {
    const fullAddress = `${storeConfig.name}, ${storeConfig.addressLine1}, ${storeConfig.addressLine2}`;
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch {
      setCopiedAddress(false);
    }
  };

  const generalWhatsAppUrl = buildWhatsAppUrl(
    `Namaste ${storeConfig.name}, I would like to know more about your latest collections at ${storeConfig.addressLine1}.`,
    storeConfig.whatsappNumber
  );

  return (
    <section id="visit-us" className="py-16 sm:py-20 bg-[#142136] text-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-[#D4AF63] tracking-wide">
                Store Information & Directions
              </p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-[#FAF7F2] text-balance">
                Visit {storeConfig.name} in Katol
              </h2>
              <p className="mt-4 text-base text-[#FAF7F2]/80 leading-relaxed max-w-xl">
                Experience fabrics, zari weaves, and bespoke family styling in person at our showroom. Walk-ins welcome all week with dedicated bridal and festive assistance.
              </p>

              <div className="mt-8 space-y-6 border-t border-[#FAF7F2]/15 pt-8">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-[#D4AF63] shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#FAF7F2]">Store Address</h3>
                    <p className="mt-1 text-sm sm:text-base text-[#FAF7F2]/85">
                      {storeConfig.addressLine1}
                    </p>
                    <p className="text-sm text-[#FAF7F2]/65">{storeConfig.addressLine2}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-[#D4AF63] shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#FAF7F2]">Opening Hours</h3>
                    <p className="mt-1 text-sm sm:text-base text-[#FAF7F2]/85 tabular-nums">
                      {storeConfig.hoursLabel} · {storeConfig.hoursTime}
                    </p>
                    <p className="text-sm text-[#FAF7F2]/65">Monday through Sunday, including festive weekends</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-[#D4AF63] shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#FAF7F2]">Direct Store Desk</h3>
                    <p className="mt-1 text-sm sm:text-base text-[#FAF7F2]/85 tabular-nums">
                      {storeConfig.phoneDisplay}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <a
                href={storeConfig.phoneHref}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#1E1917] bg-[#D4AF63] hover:bg-[#E2BF76] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF63]"
              >
                <Phone className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                <span>Call {storeConfig.phoneDisplay}</span>
              </a>

              <a
                href={generalWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-[#FAF7F2] bg-[#58111E] hover:bg-[#701627] border border-[#FAF7F2]/15 rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF63]"
              >
                <MessageCircle className="w-4 h-4 text-[#D4AF63]" strokeWidth={1.75} aria-hidden="true" />
                <span>Message on WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-between bg-[#FAF7F2] text-[#1E1917] rounded-lg overflow-hidden border border-[#FAF7F2]/15">
            <div className="relative flex-1 min-h-[300px] sm:min-h-[340px] bg-[#F2ECE1]">
              <svg
                viewBox="0 0 600 400"
                role="img"
                aria-label="Stylized location map of Saubhagya Emporium on Main Road, Katol"
                className="w-full h-full object-cover"
              >
                <rect width="600" height="400" fill="#F2ECE1" />
                <g stroke="#E2D8C7" strokeWidth="1.2">
                  <line x1="0" y1="80" x2="600" y2="80" />
                  <line x1="0" y1="160" x2="600" y2="160" />
                  <line x1="0" y1="240" x2="600" y2="240" />
                  <line x1="0" y1="320" x2="600" y2="320" />
                  <line x1="120" y1="0" x2="120" y2="400" />
                  <line x1="240" y1="0" x2="240" y2="400" />
                  <line x1="360" y1="0" x2="360" y2="400" />
                  <line x1="480" y1="0" x2="480" y2="400" />
                </g>

                <rect x="65" y="105" width="95" height="62" rx="4" fill="#EAE0D0" />
                <rect x="195" y="100" width="110" height="72" rx="4" fill="#EAE0D0" />
                <rect x="345" y="95" width="125" height="75" rx="4" fill="#EAE0D0" />
                <rect x="90" y="232" width="125" height="78" rx="4" fill="#EAE0D0" />
                <rect x="275" y="230" width="130" height="80" rx="4" fill="#EAE0D0" />
                <rect x="440" y="225" width="95" height="85" rx="4" fill="#EAE0D0" />

                <path
                  d="M 20 202 L 580 198"
                  stroke="#FAF7F2"
                  strokeWidth="24"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 202 L 580 198"
                  stroke="#D4AF63"
                  strokeWidth="2"
                  strokeDasharray="8 6"
                />

                <path
                  d="M 215 20 L 218 380"
                  stroke="#FAF7F2"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <path
                  d="M 425 20 L 420 380"
                  stroke="#FAF7F2"
                  strokeWidth="12"
                  strokeLinecap="round"
                />

                <circle cx="216" cy="200" r="10" fill="#142136" />
                <circle cx="216" cy="200" r="4" fill="#FAF7F2" />

                <text
                  x="110"
                  y="194"
                  fill="#58111E"
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  letterSpacing="0.06em"
                >
                  MAIN ROAD, KATOL
                </text>

                <text
                  x="228"
                  y="340"
                  fill="#665B56"
                  fontSize="11"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  Katol Bus Stand Rd
                </text>

                <text
                  x="434"
                  y="68"
                  fill="#665B56"
                  fontSize="11"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  Bazaar Chowk
                </text>

                <g transform="translate(322, 180)">
                  <circle cx="0" cy="0" r="24" fill="#58111E" fillOpacity="0.14" />
                  <path
                    d="M 0 -28 C -11 -28 -20 -19 -20 -8 C -20 6 0 22 0 22 C 0 22 20 6 20 -8 C 20 -19 11 -28 0 -28 Z"
                    fill="#58111E"
                    stroke="#FAF7F2"
                    strokeWidth="2.5"
                  />
                  <circle cx="0" cy="-9" r="6" fill="#D4AF63" />
                </g>

                <g transform="translate(352, 134)">
                  <rect
                    x="0"
                    y="0"
                    width="186"
                    height="46"
                    rx="6"
                    fill="#142136"
                  />
                  <text
                    x="14"
                    y="20"
                    fill="#FAF7F2"
                    fontSize="12.5"
                    fontWeight="600"
                    fontFamily="Playfair Display, Georgia, serif"
                  >
                    Saubhagya Emporium
                  </text>
                  <text
                    x="14"
                    y="35"
                    fill="#D4AF63"
                    fontSize="10.5"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    Main Road, Katol
                  </text>
                </g>

                <g transform="translate(534, 46)">
                  <circle cx="0" cy="0" r="18" fill="#FAF7F2" stroke="#D8CCBA" strokeWidth="1" />
                  <text
                    x="0"
                    y="-3"
                    textAnchor="middle"
                    fill="#58111E"
                    fontSize="10"
                    fontWeight="700"
                  >
                    N
                  </text>
                  <path d="M 0 -13 L 3 -5 L -3 -5 Z" fill="#58111E" />
                </g>
              </svg>
            </div>

            <div className="p-5 sm:p-6 bg-[#FAF7F2] border-t border-[#E5DDD0] flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#1E1917]">
                  Main Road, Katol
                </p>
                <p className="text-xs text-[#665B56] mt-0.5">
                  Central Shopping Corridor · Easy Two & Four-Wheeler Access
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyAddress}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#1E1917] bg-[#F2ECE1] hover:bg-[#EAE0D0] border border-[#D8CCBA] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedAddress ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#58111E]" aria-hidden="true" />
                    <span>Address Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#58111E]" aria-hidden="true" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
