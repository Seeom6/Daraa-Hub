'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  suggestions?: string[];
  recentSearches?: string[];
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = 'ابحث عن منتجات...',
  onSearch,
  suggestions = [],
  recentSearches = [],
  showSuggestions = true,
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    if (onSearch) {
      onSearch(suggestion);
    } else {
      router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    }
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (showSuggestions && (suggestions.length > 0 || recentSearches.length > 0)) {
      setShowDropdown(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  const shouldShowDropdown =
    showDropdown &&
    showSuggestions &&
    (filteredSuggestions.length > 0 || (query === '' && recentSearches.length > 0));

  return (
    <div className="relative w-full">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`
          relative flex items-center bg-white/5 backdrop-blur-sm border rounded-xl
          transition-all duration-200
          ${isFocused ? 'border-primary ring-2 ring-primary/20' : 'border-white/10'}
        `}
        >
          {/* Search Icon */}
          <div className="absolute right-4 ltr:right-auto ltr:left-4 text-white/40">
            <Search className="w-5 h-5" />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="
              w-full px-12 py-3 bg-transparent text-white placeholder:text-white/40
              focus:outline-none
            "
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute left-4 ltr:left-auto ltr:right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {shouldShowDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-xl z-50"
          >
            <div className="max-h-80 overflow-y-auto">
              {/* Recent Searches */}
              {query === '' && recentSearches.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs text-white/60 font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    عمليات البحث الأخيرة
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full px-3 py-2 text-right ltr:text-left text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4 text-white/40" />
                      {search}
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {filteredSuggestions.length > 0 && (
                <div className="p-2">
                  {query === '' && recentSearches.length > 0 && (
                    <div className="border-t border-white/10 my-2" />
                  )}
                  <div className="px-3 py-2 text-xs text-white/60 font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    اقتراحات
                  </div>
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-3 py-2 text-right ltr:text-left text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Search className="w-4 h-4 text-white/40" />
                      <span
                        dangerouslySetInnerHTML={{
                          __html: suggestion.replace(
                            new RegExp(query, 'gi'),
                            (match) => `<strong class="text-primary">${match}</strong>`
                          ),
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

