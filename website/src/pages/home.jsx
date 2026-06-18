import React from 'react';
import Header from '../components/common/header';
import Footer from '../components/common/footer';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import WhyChooseUs from '../components/home/WhyChooseUs';
import HowItWorks from '../components/home/HowItWorks';
import Cta from '../components/home/cta';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Services />
        <WhyChooseUs />
        <HowItWorks />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}