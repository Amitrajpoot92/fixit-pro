import React from 'react';
import Header from '../components/common/header';
import Footer from '../components/common/footer';

export default function TermsConditions() {
  return (
    <div className="bg-[#050B14] min-h-screen text-slate-300 font-sans">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-20 mt-10">
        <h1 className="text-4xl font-black text-white mb-8">Terms and Conditions</h1>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <p>
            Welcome to FixitPro! These terms and conditions outline the rules and regulations for the use of FixitPro's Website, located at fixitpro.in.
          </p>
          <p>
            By accessing this website we assume you accept these terms and conditions. Do not continue to use FixitPro if you do not agree to take all of the terms and conditions stated on this page.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Cookies</h2>
          <p>
            We employ the use of cookies. By accessing FixitPro, you agreed to use cookies in agreement with the FixitPro's Privacy Policy.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">License</h2>
          <p>
            Unless otherwise stated, FixitPro and/or its licensors own the intellectual property rights for all material on FixitPro. All intellectual property rights are reserved. You may access this from FixitPro for your own personal use subjected to restrictions set in these terms and conditions.
          </p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Service Limitations</h2>
          <p>
            The services provided by our technicians are subject to the availability of parts and the condition of your device. We are not liable for pre-existing issues or data loss during the repair process.
          </p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Liability</h2>
          <p>
            In no event shall FixitPro, nor any of its officers, directors and employees, shall be held liable for anything arising out of or in any way connected with your use of this website whether such liability is under contract.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
