// import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

// export function Footer() {
//   return (
//     <footer className="w-full bg-gray-900 dark:bg-gray-950 text-white mt-auto">
//       <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
//           <div className="sm:col-span-2 lg:col-span-1">
//             <div className="flex items-center gap-2 mb-3 md:mb-4">
//               {/* <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
//                 <span className="text-white font-bold">E♻</span>
//               </div> */}
//               <div className="w-12 h-12 flex items-center justify-center">
//   <img
//     src="/assets/logo.png"
//     alt="EvoBin Logo"
//     className="w-full h-full object-contain"
//   />
// </div>


//               <span className="text-lg md:text-xl font-bold text-white">EvoBin</span>
//             </div>
//             <p className="text-gray-300 dark:text-gray-400 text-sm md:text-base">
//               Transforming e-waste management with AI-powered solutions for a sustainable future.
//             </p>
//           </div>

//           <div>
//             <h4 className="mb-3 md:mb-4 text-base md:text-lg font-semibold text-white">Quick Links</h4>
//             <ul className="space-y-2 text-gray-300 dark:text-gray-400 text-sm md:text-base">
//               <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
//               <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
//               <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
//               <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
//             </ul>
//           </div>

//           <div>
//             <h4 className="mb-3 md:mb-4 text-base md:text-lg font-semibold text-white">Resources</h4>
//             <ul className="space-y-2 text-gray-300 dark:text-gray-400 text-sm md:text-base">
//               <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
//               <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
//               <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
//               <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
//             </ul>
//           </div>

//           <div>
//             <h4 className="mb-3 md:mb-4 text-base md:text-lg font-semibold text-white">Connect With Us</h4>
//             <div className="flex gap-3 flex-wrap">
//               <a href="#" className="w-10 h-10 bg-white/10 dark:bg-white/5 rounded-lg flex items-center justify-center hover:bg-primary transition-colors" aria-label="Facebook">
//                 <Facebook className="h-5 w-5 text-white" />
//               </a>
//               <a href="#" className="w-10 h-10 bg-white/10 dark:bg-white/5 rounded-lg flex items-center justify-center hover:bg-primary transition-colors" aria-label="Twitter">
//                 <Twitter className="h-5 w-5 text-white" />
//               </a>
//               <a href="#" className="w-10 h-10 bg-white/10 dark:bg-white/5 rounded-lg flex items-center justify-center hover:bg-primary transition-colors" aria-label="Instagram">
//                 <Instagram className="h-5 w-5 text-white" />
//               </a>
//               <a href="#" className="w-10 h-10 bg-white/10 dark:bg-white/5 rounded-lg flex items-center justify-center hover:bg-primary transition-colors" aria-label="LinkedIn">
//                 <Linkedin className="h-5 w-5 text-white" />
//               </a>
//             </div>
//           </div>
//         </div>

//         <div className="border-t border-white/10 dark:border-white/5 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-300 dark:text-gray-400 text-sm md:text-base">
//           <p>&copy; 2025 EvoBin. All rights reserved.</p>
//         </div>
//       </div>
//     </footer>
//   );
// }
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="w-full bg-gray-900 text-white mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src="/assets/logo.png"
                  alt="EvoBin Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg md:text-xl font-bold text-white">EvoBin</span>
            </div>
            <p className="text-gray-300 text-sm md:text-base">
              Transforming e-waste management with AI-powered solutions for a sustainable future.
            </p>
          </div>

          <div>
            <h4 className="mb-3 md:mb-4 text-base md:text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-gray-300 text-sm md:text-base">
              <li><button onClick={() => onNavigate("about")} className="hover:text-white transition-colors">About Us</button></li>
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 md:mb-4 text-base md:text-lg font-semibold text-white">Resources</h4>
            <ul className="space-y-2 text-gray-300 text-sm md:text-base">
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 md:mb-4 text-base md:text-lg font-semibold text-white">Connect With Us</h4>
            <div className="flex gap-3 flex-wrap">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="h-5 w-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="h-5 w-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="h-5 w-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <Linkedin className="h-5 w-5 text-white" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-300 text-sm md:text-base">
          <p>&copy; 2025 EvoBin. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
