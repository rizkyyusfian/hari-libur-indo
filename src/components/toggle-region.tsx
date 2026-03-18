'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';

interface ToggleRegionProps {
  regions: string[];
  onChange: (region: string) => void;
  value?: string;
}

export function ToggleRegion({ regions, onChange, value }: ToggleRegionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-lg border-2 border-burgundy dark:border-darkred bg-cream dark:bg-darkblue text-burgundy dark:text-cream font-bold hover:bg-burgundy/10 dark:hover:bg-darkred/10 transition flex items-center gap-2"
      >
        <MapPin size={18} />
        {value || 'Pilih Wilayah'}
      </button>

      {isOpen && (
        <div className="absolute top-12 left-0 z-50 bg-cream dark:bg-darkblue border-2 border-burgundy dark:border-darkred rounded-lg shadow-xl p-2 space-y-1 min-w-max">
          {regions.map(region => (
            <button
              key={region}
              onClick={() => {
                onChange(region);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-lg font-bold transition ${
                value === region
                  ? 'bg-darkred dark:bg-darkred/40 text-cream dark:text-cream'
                  : 'bg-cream dark:bg-darkblue text-burgundy dark:text-cream hover:bg-lightblue/30 dark:hover:bg-lightblue/20'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
