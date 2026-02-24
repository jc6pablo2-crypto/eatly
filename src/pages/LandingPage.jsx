import Nav from '../components/landing/Nav'
import HeroSection from '../components/landing/HeroSection'
import Process from '../components/landing/Process'
import Insights from '../components/landing/Insights'
import Pricing from '../components/landing/Pricing'
import Testimonials from '../components/landing/Testimonials'
import Footer from '../components/landing/Footer'
import { LanguageProvider } from '../components/landing/LanguageContext'

export default function LandingPage() {
    return (
        <LanguageProvider>
            <div className="bg-[#F7F9FA] min-h-screen font-sans text-foreground selection:bg-brand-500/30">
                <Nav />
                <main>
                    <HeroSection />
                    <Process />
                    <Insights />
                    <Pricing />
                    <Testimonials />
                </main>
                <Footer />
            </div>
        </LanguageProvider>
    )
}
