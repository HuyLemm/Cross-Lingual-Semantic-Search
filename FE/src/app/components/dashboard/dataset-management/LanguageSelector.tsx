import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: 'english' | 'vietnamese';
  onLanguageChange: (language: 'english' | 'vietnamese') => void;
}

export default function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-center space-x-4">
          <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Language:
          </span>
          <div className="flex space-x-2">
            <Button
              variant={selectedLanguage === 'english' ? 'default' : 'outline'}
              onClick={() => onLanguageChange('english')}
              className="px-6"
            >
              English
            </Button>
            <Button
              variant={selectedLanguage === 'vietnamese' ? 'default' : 'outline'}
              onClick={() => onLanguageChange('vietnamese')}
              className="px-6"
            >
              Vietnamese
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
