import { Link, useLocation } from "wouter";
import { Stethoscope, Globe } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center" data-testid="link-home">
            <Stethoscope className="text-medical-blue text-2xl mr-3" />
            <span className="text-xl font-semibold text-gray-900">Personal Medical Assistant</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              className="text-medical-gray hover:text-medical-blue transition-colors"
              data-testid="link-features"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="text-medical-gray hover:text-medical-blue transition-colors"
              data-testid="link-how-it-works"
            >
              How It Works
            </a>
            <Link 
              href="/demo" 
              className="text-medical-gray hover:text-medical-blue transition-colors"
              data-testid="link-demo"
            >
              Demo
            </Link>
            <Link 
              href="/journey" 
              className="text-medical-gray hover:text-medical-blue transition-colors"
              data-testid="link-journey"
            >
              Journey
            </Link>
            <div className="flex items-center space-x-2">
              <Globe className="text-medical-gray" size={16} />
              <select 
                className="text-medical-gray border-none bg-transparent focus:outline-none"
                data-testid="select-language"
              >
                <option value="en">EN</option>
                <option value="th">TH</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
