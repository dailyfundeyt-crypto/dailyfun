import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Card, CardContent } from '../components/ui/card';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Headline */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 font-serif">
            Welcome to Daily Fun – The Team Behind Your Daily Laughs!
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-red-accent to-blue-accent mx-auto"></div>
        </section>

        {/* Introduction Section */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg md:text-xl leading-relaxed text-gray-700 font-serif">
              In a world where news often feels overwhelming or depressing, Daily Fun steps in to change just that. 
              We are your daily dose of <span className="text-red-accent font-bold">trustworthy entertainment</span> and 
              <span className="text-blue-accent font-bold"> absurd insights</span>, proving that staying informed can actually be a blast!
            </p>
          </div>
        </section>

        {/* Stefan Kunc's Vision Section */}
        <section className="mb-16">
          <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="text-3xl font-bold text-black font-serif mb-6">Stefan Kunc's Vision</h2>
                <p className="text-lg leading-relaxed text-gray-700 font-serif italic">
                  "As Stefan Kunc, I launched Daily Fun because I firmly believe that information doesn't have to be dry and tedious. 
                  My goal was to create a platform that masters the balance between serious reporting and genuine entertainment value – 
                  with a passionate and dedicated team."
                </p>
              </div>
              <div className="order-1 lg:order-2 flex justify-center">
                <img 
                  src="/lovable-uploads/dd996217-e9c4-456c-af16-469f05791ad2.png" 
                  alt="Stefan Kunc" 
                  className="w-64 h-64 rounded-full object-cover border-4 border-gradient-to-r from-red-accent to-blue-accent shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* The Team Behind Daily Fun Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black font-serif mb-4">The Team Behind Daily Fun</h2>
            <div className="w-32 h-1 bg-gradient-to-r from-red-accent to-blue-accent mx-auto mb-6"></div>
          </div>

          {/* Team Image */}
          <div className="mb-8 flex justify-center">
            <img 
              src="/lovable-uploads/2151975f-6840-4107-86fe-8c20727a7fef.png" 
              alt="Daily Fun Team" 
              className="max-w-full h-auto rounded-lg shadow-lg border border-gray-200"
            />
          </div>

          {/* Team Introduction */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <p className="text-lg leading-relaxed text-gray-700 font-serif">
              We are the faces behind Daily Fun – a creative and dedicated team working tirelessly every day to present 
              the news to you with a wink. Our team spirit and shared vision drive us to create humorous yet trustworthy content. 
              We combine human expertise with cutting-edge technology to offer you a unique perspective on global events.
            </p>
          </div>

          {/* Individual Team Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Dr. Elke Schneider */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <img 
                    src="/lovable-uploads/2679b50f-c4f9-40d5-bbce-828296880ba2.png" 
                    alt="Dr. Elke Schneider" 
                    className="w-32 h-32 rounded-full border-4 border-red-accent/20"
                  />
                </div>
                <h3 className="text-xl font-bold text-black font-serif mb-2">Dr. Elke Schneider (AI)</h3>
                <p className="text-red-accent font-semibold mb-3">Head of Humour & Creativity</p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Elke is our master of good vibes. With her sharp mind and unparalleled wit, she ensures that 
                  every article and every video has that typical Daily Fun charm.
                </p>
              </CardContent>
            </Card>

            {/* Mr. Karl Bergmann */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <img 
                    src="/lovable-uploads/afb210bd-6729-403e-857a-9271499984f4.png" 
                    alt="Mr. Karl Bergmann" 
                    className="w-32 h-32 rounded-full border-4 border-blue-accent/20"
                  />
                </div>
                <h3 className="text-xl font-bold text-black font-serif mb-2">Mr. Karl Bergmann (AI)</h3>
                <p className="text-blue-accent font-semibold mb-3">Lead Story Weaver</p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Karl is our fact-checker and storyteller all in one. He dives deep into subjects, packaging 
                  even complex topics into understandable, captivating, and often astonishing narratives.
                </p>
              </CardContent>
            </Card>

            {/* Mr. Jonas Richter */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <img 
                    src="/lovable-uploads/3e2b5f3d-bb10-4914-847d-e40fa0928943.png" 
                    alt="Mr. Jonas Richter" 
                    className="w-32 h-32 rounded-full border-4 border-red-accent/20"
                  />
                </div>
                <h3 className="text-xl font-bold text-black font-serif mb-2">Mr. Jonas Richter (AI)</h3>
                <p className="text-red-accent font-semibold mb-3">Content Alchemist</p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Jonas transforms ideas into visual magic. Whether it's designing our videos or preparing 
                  infographics – he makes sure our content is not only funny but also visually impressive.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-red-accent/5 to-blue-accent/5 rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-black font-serif mb-4">Our Values</h2>
              <h3 className="text-xl text-gray-600 font-serif italic">What Matters to Us</h3>
              <div className="w-24 h-1 bg-gradient-to-r from-red-accent to-blue-accent mx-auto mt-4"></div>
            </div>
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-lg leading-relaxed text-gray-700 font-serif">
                At Daily Fun, <span className="text-red-accent font-bold">trust</span>, 
                <span className="text-blue-accent font-bold"> humor</span>, and 
                <span className="text-red-accent font-bold"> innovation</span> are at the core of everything we do. 
                We deliver facts that are accurate, but in a way that brings joy. We are curious and, above all: never boring!
              </p>
            </div>
          </div>
        </section>

        {/* Outlook / Call to Action Section */}
        <section className="mb-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black font-serif mb-6">Join the Daily Fun Family</h2>
            <div className="w-32 h-1 bg-gradient-to-r from-red-accent to-blue-accent mx-auto mb-6"></div>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg leading-relaxed text-gray-700 font-serif mb-8">
                Dive into the world of Daily Fun! Discover our latest articles and videos and follow us on social media 
                so you don't miss a thing. We look forward to making you smile!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-red-accent hover:bg-red-accent/90 text-white px-8 py-3 rounded-md font-semibold transition-colors">
                  Explore Our Articles
                </button>
                <button className="bg-blue-accent hover:bg-blue-accent/90 text-white px-8 py-3 rounded-md font-semibold transition-colors">
                  Follow Us
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 text-black py-12 border-t border-gray-200">
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
                <li><a href="#" className="hover:text-black transition-colors">Comedy</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Pets & Animals</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Food & Recipes</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Weird News</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
