
import Header from '../components/Header';
import InstallSidebar from '../components/InstallSidebar';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

const PrivacyPolicy = () => {
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
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-black mb-6 font-serif">Privacy Policy</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="mb-8">
                <Shield className="h-16 w-16 text-green-500 mx-auto" />
              </div>
              
              <h2 className="text-4xl font-bold text-black mb-8 font-serif">
                We do not collect any personal data.
              </h2>
              
              <p className="text-lg text-gray-600 font-serif">
                Your privacy is important to us. We are committed to protecting your personal information 
                and maintaining transparency about our data practices.
              </p>
            </CardContent>
          </Card>
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
                <li><Link to="/about" className="hover:text-black transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-black transition-colors">Contact</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-black transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-accent">Fun Categories</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link to="/weird" className="hover:text-black transition-colors">Weird News</Link></li>
                <li><Link to="/products" className="hover:text-black transition-colors">Products</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
