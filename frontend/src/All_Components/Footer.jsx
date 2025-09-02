import { Instagram, Facebook, Youtube, Mail, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z" />
  </svg>
);

export default function ModernFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left">
        {/* Social Media */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Connect With Us</h4>
          <div className="flex justify-center sm:justify-start gap-4">
            <Link
              to="https://instagram.com"
              className="text-gray-500 hover:text-pink-600 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </Link>
            <Link
              to="https://facebook.com"
              className="text-gray-500 hover:text-blue-600 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </Link>
            <Link
              to="https://tiktok.com"
              className="text-gray-500 hover:text-black transition-colors"
              aria-label="TikTok"
            >
              <TikTokIcon/>
            </Link>
            <Link
              to="https://youtube.com"
              className="text-gray-500 hover:text-red-600 transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Contact</h4>
          <div className="flex flex-col items-center sm:items-start gap-1 text-xs text-gray-600">
            <Link to="mailto:info@spiritueelchatten.nl" className="flex items-center gap-1 hover:text-gray-900">
              <Mail className="w-3 h-3" /> info@spiritueelchatten.com
            </Link>
            <Link to="/contact" className="flex items-center gap-1 hover:text-gray-900">
              <MessageSquare className="w-3 h-3" /> Live Chat
            </Link>
          </div>
        </div>

        {/* Legal */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Legal</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>KvK-nummer: 82380503</p>
            <p>BTW nr: 196122053B01</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Spiritueel Chatten</h4>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}