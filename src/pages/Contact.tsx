
import Header from '../components/Header';
import InstallSidebar from '../components/InstallSidebar';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

const Contact = () => {
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

          <h1 className="text-3xl font-bold text-black mb-6 font-serif">Contact Us</h1>
          
          <p className="text-gray-600 mb-8">
            Get in touch with us! We're here to help and answer any questions you might have.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2">
            {/* German Inquiries */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <Mail className="h-12 w-12 text-red-accent mx-auto" />
                </div>
                <h2 className="text-xl font-bold text-black mb-4 font-serif">
                  For German Inquiries
                </h2>
                <a 
                  href="mailto:dailyfunde.kontakt@gmail.com"
                  className="text-red-accent hover:text-blue-accent text-lg font-medium transition-colors"
                >
                  dailyfunde.kontakt@gmail.com
                </a>
              </CardContent>
            </Card>

            {/* English Inquiries */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <Mail className="h-12 w-12 text-blue-accent mx-auto" />
                </div>
                <h2 className="text-xl font-bold text-black mb-4 font-serif">
                  For English Inquiries
                </h2>
                <a 
                  href="mailto:dailyfunen.contact@gmail.com"
                  className="text-blue-accent hover:text-red-accent text-lg font-medium transition-colors"
                >
                  dailyfunen.contact@gmail.com
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Additional Contact Information */}
          <div className="mt-12 bg-gray-50 rounded-lg p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-black mb-4 font-serif text-center">We'd Love to Hear From You!</h3>
            <p className="text-gray-700 text-center text-lg">
              Whether you have questions, feedback, or just want to say hello, don't hesitate to reach out. 
              We typically respond within 24 hours.
            </p>
          </div>
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

export default Contact;
