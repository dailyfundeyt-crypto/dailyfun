
import Header from '../components/Header';
import InstallSidebar from '../components/InstallSidebar';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const Products = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <InstallSidebar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-red-accent hover:text-blue-accent mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Startseite
          </Link>

          <h1 className="text-3xl font-bold text-black mb-6 font-serif">Unsere Produkte</h1>
          
          <p className="text-gray-600 mb-8">
            Entdecke unsere einzigartigen Produkte voller Humor und interessanter Fakten.
          </p>
        </div>

        {/* Products Grid - Flexibel für zukünftige Erweiterungen */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-4xl">
          {/* Einzelnes Produktfeld */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Quadratischer Bild-Platzhalter */}
            <div className="aspect-square bg-gray-100 overflow-hidden">
              <img
                src="/lovable-uploads/d60c8951-db95-4a1b-bd2e-35466f8bb081.png"
                alt="Schildkröte mit Kappe und Sonnenbrille"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Produktinhalt */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-black mb-4 font-serif">
                Noch nicht Verfügbar
              </h2>
              
              {/* Produkt-Details */}
              <ul className="text-gray-700 mb-4 space-y-2">
                <li className="flex items-center">
                  <span className="font-medium">Kategorie:</span>
                  <span className="ml-2">Buch</span>
                </li>
                <li className="flex items-center">
                  <span className="font-medium">Thema:</span>
                  <span className="ml-2">Fakten</span>
                </li>
                <li className="flex items-center">
                  <span className="font-medium">Seiten:</span>
                  <span className="ml-2">200</span>
                </li>
              </ul>
              
              {/* Preis */}
              <div className="text-2xl font-bold text-red-accent mb-6">
                999 €
              </div>
              
              {/* Button */}
              <a
                href="https://youtube.com/@dailyfunen?feature=shared"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full bg-red-accent text-white px-6 py-3 rounded-md font-medium hover:bg-blue-accent transition-colors duration-300"
              >
                <span>Mehr erfahren</span>
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </div>
          </div>
        </div>

        {/* Zusätzlicher Info-Bereich */}
        <div className="mt-12 bg-gray-50 rounded-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-black mb-4 font-serif">Bald verfügbar</h3>
          <p className="text-gray-700 text-lg">
            Wir arbeiten hart daran, dir bald unser erstes Produkt präsentieren zu können. 
            Ein Buch voller unterhaltsamer Fakten, das Daily Fun direkt zu dir nach Hause bringt!
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 text-black py-12 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 font-serif">Daily Fun</h3>
              <p className="text-gray-600 mb-4 font-serif italic">
                "Delivering reliable news and engaging stories to keep you informed and entertained - because life's too short for boring headlines."
              </p>
              <p className="text-gray-600 text-sm">
                © 2024 Daily Fun. All rights reserved.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-red-accent">Quick Links</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-accent">Fun Categories</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">Weird News</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Products</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Products;
