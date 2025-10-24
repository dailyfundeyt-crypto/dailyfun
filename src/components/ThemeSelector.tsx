import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette } from 'lucide-react';

const themes = [
  { id: 'dark', name: 'Dark Mode', gradient: 'from-gray-900 to-black' },
  { id: 'light', name: 'Light Mode', gradient: 'from-gray-50 to-white' },
  { id: 'red', name: 'Red', gradient: 'from-red-600 to-red-900' },
  { id: 'blue', name: 'Blue', gradient: 'from-blue-400 to-blue-900' },
  { id: 'green', name: 'Green', gradient: 'from-green-400 to-green-900' },
  { id: 'yellow', name: 'Yellow', gradient: 'from-yellow-200 to-orange-600' },
  { id: 'orange', name: 'Orange', gradient: 'from-yellow-400 to-orange-600' },
  { id: 'pink', name: 'Pink', gradient: 'from-purple-900 to-pink-500' },
] as const;

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="bg-background border shadow-sm overflow-hidden">
      <CardHeader className="pb-4 border-b bg-muted/30">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Farbthema
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-4">
          Wähle ein Farbthema für den Hintergrund der Website aus.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id as any)}
              className={`
                relative group rounded-xl overflow-hidden transition-all duration-200
                ${theme === t.id ? 'ring-4 ring-primary ring-offset-2 ring-offset-background scale-105' : 'hover:scale-105'}
              `}
            >
              <div className={`w-full h-24 bg-gradient-to-br ${t.gradient}`} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2">
                <p className="text-white text-xs font-medium text-center">{t.name}</p>
              </div>
              {theme === t.id && (
                <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                  <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
