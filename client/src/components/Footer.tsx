import { HeartPulse } from 'lucide-react';
import { BsTelegram, BsWhatsapp, BsGithub, BsInstagram } from 'react-icons/bs';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex items-center">
            <HeartPulse className="h-6 w-6 text-primary mr-2" />
            <span className="text-lg font-semibold text-gray-900">Docdot</span>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-6">
              <a href="https://t.me/docdotbot" className="text-gray-400 hover:text-gray-500" target="_blank" rel="noopener noreferrer">
                <BsTelegram className="h-5 w-5" />
              </a>
              <a href="https://chat.whatsapp.com/I1pKGskAUOf5HPhfjfH58q" className="text-gray-400 hover:text-gray-500" target="_blank" rel="noopener noreferrer">
                <BsWhatsapp className="h-5 w-5" />
              </a>
              <a href="https://github.com" className="text-gray-400 hover:text-gray-500" target="_blank" rel="noopener noreferrer">
                <BsGithub className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-gray-500" target="_blank" rel="noopener noreferrer">
                <BsInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 md:flex md:items-center md:justify-between">
          <div className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Docdot. All rights reserved.
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap justify-center space-x-4 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900">Terms of Service</a>
            <a href="#" className="hover:text-gray-900">Contact Us</a>
            <a href="#" className="hover:text-gray-900">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
