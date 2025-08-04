import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { articles } from '@/data/articles';

interface Employee {
  id: string;
  name: string;
  image: string;
}

interface EmployeeProfilePopupProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeProfilePopup: React.FC<EmployeeProfilePopupProps> = ({
  employee,
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();

  if (!employee) return null;

  // Count articles for this employee
  const getArticleCount = (employeeId: string) => {
    const authorMapping: Record<string, string[]> = {
      'stefan': ['Stefan Kunc'],
      'elke': ['Dr. Elke Schneider', 'Elke Schneider'],
      'karl': ['Karl Bergmann', 'Herr Karl Bergmann'],
      'jonas': ['Jonas Richter', 'Herr Jonas Richter']
    };
    
    const authorNames = authorMapping[employeeId] || [];
    return articles.filter(article => 
      authorNames.some(name => 
        article.author === name || 
        article.author.includes(name.split(' ')[0]) ||
        article.author.includes(name.split(' ').pop() || '')
      )
    ).length;
  };

  // Get employee description based on ID
  const getEmployeeDescription = (employeeId: string) => {
    switch (employeeId) {
      case 'stefan':
        return t('about.stefan.vision.quote');
      case 'elke':
        return t('about.elke.desc');
      case 'karl':
        return t('about.karl.desc');
      case 'jonas':
        return t('about.jonas.desc');
      default:
        return '';
    }
  };

  // Get employee role
  const getEmployeeRole = (employeeId: string) => {
    switch (employeeId) {
      case 'stefan':
        return 'Gründer & Chefredakteur';
      case 'elke':
        return t('about.elke.role');
      case 'karl':
        return t('about.karl.role');
      case 'jonas':
        return t('about.jonas.role');
      default:
        return '';
    }
  };

  const articleCount = getArticleCount(employee.id);
  const description = getEmployeeDescription(employee.id);
  const role = getEmployeeRole(employee.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Mitarbeiterprofil</DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Schließen</span>
          </button>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 p-6">
          {/* Profile Image */}
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-red-accent/20">
            <img 
              src={employee.image} 
              alt={employee.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Name and Role */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-black font-serif mb-1">
              {employee.name}
            </h3>
            <p className="text-red-accent font-semibold text-sm">
              {role}
            </p>
          </div>
          
          {/* Article Count */}
          <div className="bg-gray-50 rounded-lg p-4 w-full text-center">
            <div className="text-2xl font-bold text-red-accent mb-1">
              {articleCount}
            </div>
            <div className="text-sm text-gray-600">
              {articleCount === 1 ? 'Veröffentlichter Artikel' : 'Veröffentlichte Artikel'}
            </div>
          </div>
          
          {/* Description */}
          <div className="text-center">
            <p className="text-gray-700 text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeProfilePopup;