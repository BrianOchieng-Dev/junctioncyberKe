import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'sw';

interface Translations {
  [key: string]: {
    en: string;
    sw: string;
  };
}

export const translations: Translations = {
  nav_home: { en: 'Home', sw: 'Nyumbani' },
  nav_services: { en: 'Services', sw: 'Huduma' },
  nav_about: { en: 'About', sw: 'Kuhusu' },
  nav_team: { en: 'Team', sw: 'Timu' },
  nav_faq: { en: 'FAQ', sw: 'Maswali' },
  nav_gallery: { en: 'Gallery', sw: 'Picha' },
  nav_contact: { en: 'Contact', sw: 'Mawasiliano' },
  book_now: { en: 'Book Now', sw: 'Weka Nafasi' },
  get_ticket: { en: 'Get Ticket', sw: 'Chukua Tiketi' },
  hero_tag: { en: 'A Premier Multi-Business Experience', sw: 'Uzoefu Bora wa Biashara Mseto' },
  hero_title_1: { en: 'Elegance in', sw: 'Kifahari katika' },
  hero_title_2: { en: 'Every Detail.', sw: 'Kila Undani.' },
  hero_desc: { 
    en: 'The Junction Cyber offers a curated ecosystem of premium services. From visionary tech solutions to elite grooming and automotive care.', 
    sw: 'Junction Cyber inatoa mfumo ulioratibiwa wa huduma bora. Kutoka kwa suluhisho za kiteknolojia hadi huduma za unyoaji na matunzo ya gari.' 
  },
  explore_btn: { en: 'Explore Services', sw: 'Gundua Huduma' },
  pricing_btn: { en: 'View Pricing', sw: 'Angalia Bei' },
  request_quote: { en: 'Request a Quote', sw: 'Omba Makadirio' },
  make_inquiry: { en: 'Make an Inquiry', sw: 'Uliza Swali' },
  
  // Services
  services_title: { en: 'Our Signature Verticals', sw: 'Huduma Zetu Kuu' },
  services_desc: { en: 'Comprehensive services designed to cater to every facet of your premium lifestyle.', sw: 'Huduma kamilifu zilizoundwa kukidhi kila kipengele cha mtindo wako wa maisha.' },
  cat_cyber: { en: 'Cyber Services', sw: 'Huduma za Mtandao' },
  cat_barber: { en: 'Precision Barber', sw: 'Kinyozi Bingwa' },
  cat_carwash: { en: 'Elite Carwash', sw: 'Osho la Magari' },
  cat_laundry: { en: 'Premium Laundry', sw: 'Dobi wa Kisasa' },

  // About
  about_title_1: { en: 'A Junction of', sw: 'Kutana kwa' },
  about_title_2: { en: 'Technology & Tradition.', sw: 'Teknolojia na Jadi.' },
  about_desc: { 
    en: 'Founded on the pillars of excellence, The Junction Cyber is more than just a multi-service center. We are a curated ecosystem where high-performance digital services meet artisanal grooming and automotive perfection.',
    sw: 'Ilioanzishwa kwa misingi ya ubora, Junction Cyber ni zaidi ya kituo cha huduma mseto. Sisi ni mfumo ambapo huduma za kidijitali hukutana na unyoaji wa kisanii na matunzo bora ya magari.'
  },

  // Contact / Forms
  contact_title: { en: 'Connect with Executive Care.', sw: 'Wasiliana na Huduma ya Juu.' },
  full_name: { en: 'Full Name', sw: 'Jina Kamili' },
  email_addr: { en: 'Email Address', sw: 'Barua Pepe' },
  service_interest: { en: 'Service of Interest', sw: 'Huduma Unayohitaji' },
  detailed_msg: { en: 'Detailed Message', sw: 'Ujumbe wa Kina' },
  send_inquiry: { en: 'Send Inquiry', sw: 'Tuma Swali' },
  location: { en: 'Location / City', sw: 'Mahali / Mji' },
  password: { en: 'Password', sw: 'Nywila' },
  prof_full_name: { en: 'Full Name', sw: 'Jina Kamili' },
  prof_phone: { en: 'Phone Number', sw: 'Nambari ya Simu' },
  prof_address: { en: 'Primary Address', sw: 'Anwani Kuu' },
  prof_car_plate: { en: 'Car Plate Number', sw: 'Namba ya Gari' },
  prof_pref_service: { en: 'Preferred Service', sw: 'Huduma Unayopendelea' },
  prof_loyalty_pts: { en: 'Member Loyalty Points', sw: 'Pointi za Uaminifu' },
  prof_status_tier: { en: 'Status Tier', sw: 'Kiwango cha Uanachama' },
  prof_save: { en: 'Save Luxury Profile', sw: 'Hifadhi Maelezo Bora' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
