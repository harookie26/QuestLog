import React from 'react'
import { Facebook, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-violet-200 border-t border-violet-300">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-violet-900">
        <div>
          <div className="font-semibold mb-2">QuestLog</div>
          <div className="text-xs text-violet-800">Discussion boards for questions, predictions, guides, and tips in video games.</div>
          <div className="flex gap-3 mt-4 text-violet-800">
            <a href="#" aria-label="facebook" className="p-1 rounded hover:bg-violet-300/50">
              <Facebook size={18} />
            </a>
            <a href="#" aria-label="twitter" className="p-1 rounded hover:bg-violet-300/50">
              <Twitter size={18} />
            </a>
            <a href="#" aria-label="instagram" className="p-1 rounded hover:bg-violet-300/50">
              <Instagram size={18} />
            </a>
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Learn more</div>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">Privacy Policy</a></li>
            <li><a href="#" className="hover:underline">Partnerships</a></li>
            <li><a href="#" className="hover:underline">The Team</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Support</div>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">Help / Contact Us</a></li>
            <li><a href="#" className="hover:underline">Report</a></li>
            <li><a href="#" className="hover:underline">Legal</a></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
