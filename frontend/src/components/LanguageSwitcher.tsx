import { Globe } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useLanguage } from "../contexts/LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'en' as const, label: 'English', nativeLabel: 'English' },
    { code: 'hi' as const, label: 'Hindi', nativeLabel: 'हिन्दी' },
    { code: 'te' as const, label: 'Telugu', nativeLabel: 'తెలుగు' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" title={t('language.select')}>
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t('language.select')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center justify-between cursor-pointer ${
              language === lang.code ? 'bg-secondary' : ''
            }`}
          >
            <span>{lang.nativeLabel}</span>
            {language === lang.code && (
              <span className="ml-2 text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
