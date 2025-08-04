import { useLanguage } from '../contexts/LanguageContext';
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  imageUrl: string;
  publishedAt: string;
  readTime?: string;
  category?: string;
  views?: number;
}

interface FeaturedArticleProps {
  article: Article;
}

export const FeaturedArticle = ({ article }: FeaturedArticleProps) => {
  const { language, t } = useLanguage();

  const getLocalizedTitle = (title: string) => {
    if (language === 'de') {
      const translations: { [key: string]: string } = {
        "The Great Sock Conspiracy": "Die große Socken-Verschwörung",
        "Local Cat Elected Mayor": "Lokale Katze zum Bürgermeister gewählt",
        "Breaking: Water is Wet": "Eilmeldung: Wasser ist nass",
        "Man Discovers Fire, Again": "Mann entdeckt Feuer, wieder",
        "Scientists Baffled by Tuesday": "Wissenschaftler verwirrt über Dienstag",
        "Weather Exists, Experts Say": "Wetter existiert, sagen Experten",
        "Local Man Has Opinion": "Lokaler Mann hat Meinung",
        "Gravity Still Working": "Schwerkraft funktioniert noch",
        "Area Dog Very Good": "Lokaler Hund sehr gut"
      };
      return translations[title] || title;
    }
    return title;
  };

  const getLocalizedExcerpt = (excerpt: string) => {
    if (language === 'de') {
      const translations: { [key: string]: string } = {
        "An in-depth investigation into the mysterious disappearance of socks from laundry loads worldwide.": "Eine tiefgreifende Untersuchung über das mysteriöse Verschwinden von Socken aus Wäscheladungen weltweit.",
        "In a surprising turn of events, Mr. Whiskers promises tuna for all and mandatory nap times.": "In einer überraschenden Wendung verspricht Herr Schnurrbart Thunfisch für alle und obligatorische Schlafenszeiten.",
        "Groundbreaking research confirms what we've all suspected: water has indeed been wet this whole time.": "Bahnbrechende Forschung bestätigt, was wir alle vermutet haben: Wasser war tatsächlich die ganze Zeit nass.",
        "Local inventor claims to have 'discovered' fire, despite evidence of its existence for millennia.": "Lokaler Erfinder behauptet, Feuer 'entdeckt' zu haben, trotz Beweisen für dessen Existenz seit Jahrtausenden.",
        "The scientific community is completely stumped by the weekly occurrence of Tuesday.": "Die wissenschaftliche Gemeinschaft ist völlig ratlos über das wöchentliche Auftreten des Dienstags.",
        "Leading meteorologists confirm that weather is, in fact, a real phenomenon that happens.": "Führende Meteorologen bestätigen, dass Wetter tatsächlich ein reales Phänomen ist, das passiert.",
        "Breaking news: Local resident forms personal viewpoint on current events.": "Eilmeldung: Lokaler Bewohner bildet persönliche Ansicht zu aktuellen Ereignissen.",
        "In physics news, gravity continues to pull objects toward the Earth's center.": "In Physik-Nachrichten zieht die Schwerkraft weiterhin Objekte zum Erdmittelpunkt.",
        "Local canine receives universal acclaim for being the goodest boy in the neighborhood.": "Lokaler Vierbeiner erhält universelle Anerkennung dafür, der beste Junge in der Nachbarschaft zu sein."
      };
      return translations[excerpt] || excerpt;
    }
    return excerpt;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return language === 'de' 
      ? date.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-2xl shadow-premium overflow-hidden hover:shadow-elevation-4 transition-all duration-500 group animate-fade-in-up">
      <div className="grid lg:grid-cols-2 gap-0">
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <img 
            src={article.imageUrl} 
            alt={getLocalizedTitle(article.title)}
            className="w-full h-80 lg:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {article.category && (
            <div className="absolute top-6 left-6">
              <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full shadow-elevation-2">
                {article.category}
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="px-2 py-1 bg-accent text-accent-foreground rounded-md font-medium">
              {t('featured')}
            </span>
            <span className="text-primary">•</span>
            <span className="font-medium">{t('latest')}</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl lg:text-4xl font-display font-bold leading-tight text-foreground group-hover:text-primary transition-colors duration-300">
              {getLocalizedTitle(article.title)}
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              {getLocalizedExcerpt(article.excerpt)}
            </p>
          </div>

          {/* Meta Information */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span className="font-medium">{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            {article.readTime && (
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{article.readTime}</span>
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="pt-4">
            <Link to={`/article/${article.id}`}>
              <Button size="lg" className="group/btn font-display font-semibold shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-300">
                {t('readMore')}
                <ArrowRight size={18} className="ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};