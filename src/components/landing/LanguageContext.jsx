import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Default to French
    const [lang, setLang] = useState('fr');

    useEffect(() => {
        // Optional: read from localStorage if previously set
        const savedLang = localStorage.getItem('eatly_lang');
        if (savedLang && translations[savedLang]) {
            setLang(savedLang);
        }
    }, []);

    const changeLanguage = (newLang) => {
        if (translations[newLang]) {
            setLang(newLang);
            localStorage.setItem('eatly_lang', newLang);
        }
    };

    const t = (key) => {
        return translations[lang]?.[key] || translations['en']?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
