import React from 'react';
import { AuthorityId } from '../../models/authorities';

interface InstitutionalInsigniaProps {
  authorityId: AuthorityId;
  size?: number;
  className?: string;
  showBadge?: boolean;
}

export const InstitutionalInsignia: React.FC<InstitutionalInsigniaProps> = ({
  authorityId,
  size = 32,
  className = '',
  showBadge = false
}) => {
  switch (authorityId) {
    case 'india':
      return (
        <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
          <svg 
            width={size} 
            height={size} 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Indian Railway Transit Network Emblem (Independent Demonstration · Not official GoI)"
          >
            {/* Circular Base & Gold Rim */}
            <circle cx="24" cy="24" r="22" fill="#1e3a8a" stroke="#d97706" strokeWidth="2.5" />
            <circle cx="24" cy="24" r="18" fill="#172554" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
            
            {/* Transit Wheel Hub */}
            <circle cx="24" cy="26" r="8" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="24" cy="26" r="3" fill="#ffffff" />
            {/* Transit Radial Spokes */}
            <path d="M24 18V34M16 26H32M18.3 20.3L29.7 31.7M29.7 20.3L18.3 31.7" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
            
            {/* Geometric Railway Network Signal Beacon */}
            <path d="M20 10H28L29 14H19L20 10Z" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
            <path d="M22 6H26V10H22V6Z" fill="#fef08a" />
            <circle cx="24" cy="5" r="1.5" fill="#f59e0b" />
          </svg>
          {showBadge && (
            <span className="sr-only">Indian Rail Transit Network Demonstration Emblem</span>
          )}
        </div>
      );

    case 'uk':
      return (
        <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
          <svg 
            width={size} 
            height={size} 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            aria-label="His Majesty's Government Department for Transport National Rail Crest"
          >
            {/* Deep Royal Red & Gold Base */}
            <circle cx="24" cy="24" r="22" fill="#881337" stroke="#fbbf24" strokeWidth="2" />
            
            {/* St Edward's Crown Top Arch */}
            <path d="M16 16C16 12 24 10 24 10C24 10 32 12 32 16C32 20 28 22 24 22C20 22 16 20 16 16Z" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
            <path d="M23 7H25V11H23V7ZM21 8H27V10H21V8Z" fill="#ffffff" />
            
            {/* National Rail Double Arrow Symbol */}
            <path 
              d="M14 28H28L25 25M34 32H20L23 35" 
              stroke="#ffffff" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
          {showBadge && (
            <span className="sr-only">UK Department for Transport National Rail Emblem</span>
          )}
        </div>
      );

    case 'japan':
      return (
        <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
          <svg 
            width={size} 
            height={size} 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Government of Japan MLIT JR East Emblem"
          >
            {/* Clean White Circle with Red & Green Accents */}
            <circle cx="24" cy="24" r="22" fill="#ffffff" stroke="#15803d" strokeWidth="2.5" />
            
            {/* Japanese Sun Disk Subtle Halo */}
            <circle cx="24" cy="24" r="16" fill="#f0fdf4" stroke="#dc2626" strokeWidth="1.2" />
            
            {/* Stylized JR Bold Dynamic Rail Mark */}
            <path 
              d="M17 18H23C26 18 28 20 28 22.5C28 25 26 27 23 27H17V18Z" 
              fill="#16a34a" 
            />
            <path 
              d="M23 27L29 34H24L19 28H17V34H13V15H23C27.5 15 31 18.5 31 22.5C31 26 28.5 29 25 30L31 37H26L21 31" 
              fill="#15803d" 
            />
            
            {/* Precision Punctuality Star */}
            <circle cx="34" cy="14" r="3" fill="#dc2626" />
          </svg>
          {showBadge && (
            <span className="sr-only">Government of Japan MLIT JR East Crest</span>
          )}
        </div>
      );

    case 'switzerland':
      return (
        <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
          <svg 
            width={size} 
            height={size} 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Swiss Confederation SBB CFF FFS Federal Transit Emblem"
          >
            {/* Iconic Swiss Red Shield / Rounded Hexagon */}
            <rect x="3" y="3" width="42" height="42" rx="12" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
            
            {/* SBB Cross-Arrow Combination: Central Swiss Cross + Directional Wings */}
            <rect x="21" y="14" width="6" height="20" fill="#ffffff" rx="1" />
            <rect x="14" y="21" width="20" height="6" fill="#ffffff" rx="1" />
            
            {/* SBB Horizontal Track Arrow Points */}
            <path d="M10 24L14 20V28L10 24Z" fill="#ffffff" />
            <path d="M38 24L34 20V28L38 24Z" fill="#ffffff" />
          </svg>
          {showBadge && (
            <span className="sr-only">Swiss Confederation SBB CFF FFS Federal Rail Shield</span>
          )}
        </div>
      );

    case 'germany':
      return (
        <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
          <svg 
            width={size} 
            height={size} 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Federal Republic of Germany BMDV Deutsche Bahn Emblem"
          >
            {/* Bundesschild Gold Background with Black Border */}
            <circle cx="24" cy="24" r="22" fill="#ffffff" stroke="#e11d48" strokeWidth="2.5" />
            
            {/* Federal German Tri-color subtle arc */}
            <path d="M10 10C14 6 20 4 24 4C28 4 34 6 38 10" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 12C16 8 20 7 24 7C28 7 32 8 36 12" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
            <path d="M14 14C17 11 20 10 24 10C28 10 31 11 34 14" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
            
            {/* Authentic Deutsche Bahn Red Box Rounded Logo */}
            <rect x="12" y="16" width="24" height="20" rx="4" fill="#dc2626" />
            <text 
              x="24" 
              y="31" 
              textAnchor="middle" 
              fill="#ffffff" 
              fontFamily="system-ui, -apple-system, sans-serif" 
              fontWeight="900" 
              fontSize="14" 
              letterSpacing="-0.5px"
            >
              DB
            </text>
          </svg>
          {showBadge && (
            <span className="sr-only">Federal Republic of Germany BMDV Deutsche Bahn Shield</span>
          )}
        </div>
      );

    default:
      return null;
  }
};
