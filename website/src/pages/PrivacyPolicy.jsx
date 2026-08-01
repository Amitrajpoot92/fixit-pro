import React from 'react';
import Header from '../components/common/header';
import Footer from '../components/common/footer';

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#050B14] min-h-screen text-slate-300 font-sans">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-20 mt-10">
        <h1 className="text-4xl font-black text-white mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <p>
            Welcome to FixitPro. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Important information and who we are</h2>
          <p>
            This privacy policy aims to give you information on how FixitPro collects and processes your personal data through your use of this website, including any data you may provide through this website when you sign up for our services.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. The data we collect about you</h2>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
            <li><strong>Financial Data</strong> includes bank account and payment card details.</li>
            <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. How we use your personal data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal or regulatory obligation.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Data security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
