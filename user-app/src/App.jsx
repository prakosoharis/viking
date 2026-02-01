import React, { useState, useEffect } from 'react';
import { Upload, LogOut, CheckCircle, Image as ImageIcon, Phone, Calendar, Camera, X, User, Mail, Building2, MapPin, Hash, ChevronDown, Send, AlertCircle, Clock, FileText, Info, ExternalLink } from 'lucide-react';
import api from './api';

// Storage key for current user session (still use localStorage for session)
const STORAGE_KEY_CURRENT_USER = 'invoice_current_user';

// Viking Helm Logo Component
const VikingHelm = ({ className = "w-16 h-16", color = "currentColor" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Left Horn */}
    <path
      d="M15 35 Q10 25 8 15 Q7 10 10 8 Q12 7 14 10 L20 30 Z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
    />

    {/* Right Horn */}
    <path
      d="M85 35 Q90 25 92 15 Q93 10 90 8 Q88 7 86 10 L80 30 Z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
    />

    {/* Helm Main Body */}
    <ellipse cx="50" cy="55" rx="32" ry="35" fill={color} />

    {/* Face Opening */}
    <rect x="35" y="50" width="30" height="25" rx="3" fill="white" opacity="0.9" />

    {/* Eye Slits */}
    <rect x="38" y="56" width="10" height="4" rx="1" fill={color} />
    <rect x="52" y="56" width="10" height="4" rx="1" fill={color} />

    {/* Nose Guard */}
    <path
      d="M48 60 L50 70 L52 60 Z"
      fill={color}
      opacity="0.8"
    />

    {/* Helm Details - Rivets */}
    <circle cx="25" cy="50" r="2" fill="white" opacity="0.6" />
    <circle cx="75" cy="50" r="2" fill="white" opacity="0.6" />
    <circle cx="30" cy="65" r="2" fill="white" opacity="0.6" />
    <circle cx="70" cy="65" r="2" fill="white" opacity="0.6" />

    {/* Top Ridge */}
    <path
      d="M30 38 Q50 35 70 38"
      stroke="white"
      strokeWidth="2"
      fill="none"
      opacity="0.5"
    />
  </svg>
);

// Info Modal Component - For displaying About, Privacy Policy, Terms
const InfoModal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden animate-scale flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto p-6 prose prose-sm max-w-none">
          {content}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Privacy Policy Content
const PrivacyPolicyContent = () => (
  <div className="space-y-6 text-gray-700">
    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">1. Information We Collect</h3>
      <p className="mb-2">CLICKZ collects the following types of information:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Personal Information:</strong> Phone number, company name, email address, organization number, and address that you provide.</li>
        <li><strong>Uploaded Content:</strong> Invoice images and PDF documents that you upload through our service.</li>
        <li><strong>Usage Data:</strong> App usage information, timestamps, and session data for service improvement.</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">2. How We Use Your Information</h3>
      <p className="mb-2">We use your information to:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Provide and maintain our invoice upload service</li>
        <li>Process and store your uploaded invoices</li>
        <li>Send invoices to designated recipients via email</li>
        <li>Communicate with you about your account and service updates</li>
        <li>Improve our services and develop new features</li>
        <li>Comply with legal obligations</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">3. Data Storage and Security</h3>
      <p className="mb-2">We implement appropriate security measures to protect your information:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>All uploaded files are encrypted during transmission and storage</li>
        <li>We use secure servers and industry-standard security protocols</li>
        <li>Access to your data is restricted to authorized personnel only</li>
        <li>Your data is stored in secure data centers with controlled access</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">4. Data Sharing and Disclosure</h3>
      <p className="mb-2">We do not sell your personal information. We may share your data only in the following circumstances:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Service Providers:</strong> With trusted third parties who assist in operating our service</li>
        <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
        <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
        <li><strong>With Your Consent:</strong> When you explicitly consent to sharing</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">5. Your Rights</h3>
      <p className="mb-2">You have the following rights regarding your data:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Access:</strong> Request a copy of your personal data</li>
        <li><strong>Correction:</strong> Update or correct inaccurate information</li>
        <li><strong>Deletion:</strong> Request deletion of your personal data</li>
        <li><strong>Objection:</strong> Object to processing of your personal data</li>
        <li><strong>Data Portability:</strong> Receive your data in a structured format</li>
      </ul>
      <p className="mt-2">To exercise these rights, please contact us using the information below.</p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">6. Data Retention</h3>
      <p>We retain your personal data for as long as necessary to provide our services and fulfill the purposes outlined in this policy. Uploaded invoices are retained according to your account settings and applicable legal requirements.</p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">7. Children's Privacy</h3>
      <p>Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.</p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">8. International Data Transfers</h3>
      <p>Your information may be transferred to and processed in countries other than your country of residence. We ensure that appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.</p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">9. Changes to This Policy</h3>
      <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.</p>
      <p className="mt-2"><strong>Last Updated:</strong> February 2025</p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">10. Contact Us</h3>
      <p className="mb-2">If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
      <ul className="list-none pl-0 space-y-1">
        <li><strong>Email:</strong> admin@clickz.co.no</li>
        <li><strong>Website:</strong> www.clickz.co.no</li>
      </ul>
    </section>
  </div>
);

// Terms of Service Content
const TermsOfServiceContent = () => (
  <div className="space-y-6 text-gray-700">
    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">1. Acceptance of Terms</h3>
      <p>By accessing or using the CLICKZ invoice upload service ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.</p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">2. Description of Service</h3>
      <p>CLICKZ is an invoice upload service that allows registered users to upload invoice images and PDF documents for processing and delivery to designated recipients via email.</p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">3. User Responsibilities</h3>
      <p className="mb-2">As a user of CLICKZ, you agree to:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Provide accurate and complete information when creating your account</li>
        <li>Only upload invoices that you have the right to share</li>
        <li>Ensure that uploaded content does not violate any laws or third-party rights</li>
        <li>Maintain the confidentiality of your account credentials</li>
        <li>Notify us immediately of any unauthorized use of your account</li>
        <li>Not use the service for any illegal or unauthorized purpose</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">4. Acceptable Use Policy</h3>
      <p className="mb-2">You agree NOT to:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Upload malicious, harmful, or illegal content</li>
        <li>Impersonate any person or entity</li>
        <li>Interfere with or disrupt the Service or servers</li>
        <li>Attempt to gain unauthorized access to any portion of the Service</li>
        <li>Use the Service to transmit spam or unsolicited communications</li>
        <li>Upload content that infringes on intellectual property rights</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">5. Uploaded Content</h3>
      <p className="mb-2">Regarding content you upload:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>You retain ownership of the content you upload</li>
        <li>You grant us a license to process, store, and transmit your uploaded content for the purpose of providing the Service</li>
        <li>You are responsible for ensuring you have all necessary rights to upload the content</li>
        <li>We may remove content that violates these Terms or applicable laws</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">6. Intellectual Property</h3>
      <p className="mb-2">The Service and its original content, features, and functionality are owned by CLICKZ and are protected by international copyright, trademark, and other intellectual property laws. You may not:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Copy, modify, or distribute the Service</li>
        <li>Use any trademarks, logos, or service marks without our prior written consent</li>
        <li>Reverse engineer or attempt to extract source code from the Service</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">7. Termination</h3>
      <p className="mb-2">We may suspend or terminate your account and access to the Service at our sole discretion, without prior notice, for conduct that we believe:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Violates these Terms</li>
        <li>Is harmful to other users, us, or third parties</li>
        <li>Violates applicable law</li>
      </ul>
      <p className="mt-2">Upon termination, your right to use the Service will immediately cease.</p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">8. Disclaimers</h3>
      <p className="mb-2">THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>MERCHANTABILITY</li>
        <li>FITNESS FOR A PARTICULAR PURPOSE</li>
        <li>NON-INFRINGEMENT</li>
        <li>ACCURACY OR RELIABILITY OF INFORMATION</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">9. Limitation of Liability</h3>
      <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, CLICKZ SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE, ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE.</p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">10. Indemnification</h3>
      <p>You agree to indemnify and hold harmless CLICKZ from any claims, damages, losses, liabilities, and expenses arising from:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Your use of the Service</li>
        <li>Your violation of these Terms</li>
        <li>Your violation of any third-party rights</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">11. Governing Law</h3>
      <p>These Terms shall be governed by and construed in accordance with the laws of Norway, without regard to its conflict of law provisions.</p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">12. Changes to Terms</h3>
      <p>We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the updated Terms on this page. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.</p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">13. Contact Information</h3>
      <p className="mb-2">For questions about these Terms, please contact:</p>
      <ul className="list-none pl-0 space-y-1">
        <li><strong>Email:</strong> admin@clickz.co.no</li>
        <li><strong>Website:</strong> www.clickz.co.no</li>
      </ul>
    </section>
  </div>
);

// About Us Content
const AboutUsContent = () => (
  <div className="space-y-6 text-gray-700">
    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">About CLICKZ</h3>
      <p>CLICKZ is a modern invoice management solution designed to streamline how businesses handle their invoice documentation and delivery. Our platform simplifies the process of uploading, managing, and sharing invoices with clients and partners.</p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Our Mission</h3>
      <p>To provide businesses with an efficient, secure, and user-friendly platform for invoice management that saves time, reduces errors, and improves cash flow.</p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">What We Do</h3>
      <p className="mb-2">CLICKZ offers a comprehensive invoice upload solution that includes:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Easy Upload:</strong> Capture and upload invoices via camera or file selection</li>
    <li><strong>Multiple Formats:</strong> Support for images (JPG, PNG, HEIC, WebP) and PDF documents</li>
    <li><strong>Secure Storage:</strong> Bank-level encryption for all uploaded documents</li>
    <li><strong>Email Delivery:</strong> Automatic delivery of invoices to designated recipients</li>
    <li><strong>Upload History:</strong> Track and manage all your uploads in one place</li>
    <li><strong>Session Management:</strong> Organize uploads into sessions for better tracking</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Why Choose CLICKZ?</h3>
      <p className="mb-2">We understand the challenges businesses face with invoice management. That's why we built CLICKZ with focus on:</p>
      <ul className="list-disc pl-6 space-y-1">
    <li><strong>Simplicity:</strong> Intuitive interface that anyone can use</li>
    <li><strong>Security:</strong> Your data is protected with enterprise-grade security</li>
    <li><strong>Reliability:</strong> 99.9% uptime guarantee for business continuity</li>
    <li><strong>Speed:</strong> Fast uploads and processing</li>
    <li><strong>Support:</strong> Dedicated customer support team</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Our Commitment</h3>
      <p>We are committed to continuously improving our platform based on user feedback and evolving business needs. Your success is our priority, and we work hard to ensure CLICKZ meets and exceeds your expectations.</p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Contact Us</h3>
      <p className="mb-2">We'd love to hear from you! Reach out to us:</p>
      <ul className="list-none pl-0 space-y-1">
        <li><strong>Email:</strong> admin@clickz.co.no</li>
        <li><strong>Website:</strong> www.clickz.co.no</li>
      </ul>
    </section>
  </div>
);

// Footer Component
const Footer = ({ onOpenModal }) => (
  <footer className="bg-gray-900 text-white mt-auto">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Company Info */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logo.png" alt="CLICKZ Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold">CLICKZ</span>
          </div>
          <p className="text-gray-400 text-sm">
            Simplifying invoice management for modern businesses.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold mb-4">Information</h4>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => onOpenModal('about')}
                className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
              >
                <Info className="w-4 h-4" />
                About Us
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenModal('privacy')}
                className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
              >
                <Info className="w-4 h-4" />
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenModal('terms')}
                className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
              >
                <Info className="w-4 h-4" />
                Terms of Service
              </button>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold mb-4">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <a href="mailto:admin@clickz.co.no" className="hover:text-white transition-colors">
                admin@clickz.co.no
              </a>
            </li>
            <li>
              <a
                href="https://www.clickz.co.no"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                www.clickz.co.no
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
        <p>&copy; {new Date().getFullYear()} CLICKZ. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

// Success Modal Component
const SuccessModal = ({ isOpen, onClose, count }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-scale">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-600 mb-6">
            {count} {count === 1 ? 'image' : 'images'} uploaded
          </p>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// Login Screen Component
const LoginScreen = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [modalType, setModalType] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phone.trim()) {
      onLogin(phone.trim());
    }
  };

  const getModalContent = (type) => {
    switch (type) {
      case 'about':
        return { title: 'About Us', content: <AboutUsContent /> };
      case 'privacy':
        return { title: 'Privacy Policy', content: <PrivacyPolicyContent /> };
      case 'terms':
        return { title: 'Terms of Service', content: <TermsOfServiceContent /> };
      default:
        return null;
    }
  };

  const modalData = getModalContent(modalType);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 animate-slide-up">
            <div className="text-center mb-8">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <img src="/logo.png" alt="Company Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">CLICKZ</h1>
              <p className="text-gray-600">Enter your phone number to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812 3456 7890"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-lg"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-lg shadow-lg shadow-blue-200 hover:shadow-xl"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer onOpenModal={setModalType} />

      {/* Info Modal */}
      <InfoModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        title={modalData?.title || ''}
        content={modalData?.content}
      />
    </div>
  );
};

// Main Dashboard Component
const Dashboard = ({ user, onLogout }) => {
  const MAX_FILES = 10;
  const MIN_FILES = 1;

  const [uploads, setUploads] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [expandedSession, setExpandedSession] = useState(null);
  const [clientAdvertisements, setClientAdvertisements] = useState([]);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    loadUploads();
    loadClientAdvertisements();
  }, []);

  const loadClientAdvertisements = async () => {
    try {
      const ads = await api.getClientAdvertisements();
      setClientAdvertisements(ads);
    } catch (error) {
      console.error('Failed to load client advertisements:', error);
    }
  };

  let scrollTimeout;
  const handleScroll = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      loadUploads();
    }, 500);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Group uploads by session
  const groupUploadsBySession = (uploads) => {
    const sessions = {};
    uploads.forEach(upload => {
      const sessionNum = upload.session_number || 1;
      if (!sessions[sessionNum]) {
        sessions[sessionNum] = [];
      }
      sessions[sessionNum].push(upload);
    });

    // Convert to array and sort by session number descending (newest first)
    return Object.entries(sessions)
      .map(([sessionNum, uploads]) => ({
        sessionNumber: parseInt(sessionNum),
        uploads: uploads.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)),
        uploadedAt: uploads[0].uploaded_at // Use first upload's timestamp
      }))
      .sort((a, b) => b.sessionNumber - a.sessionNumber);
  };

  const toggleSession = (sessionNumber) => {
    setExpandedSession(expandedSession === sessionNumber ? null : sessionNumber);
  };

  const loadUploads = async () => {
    try {
      const userUploads = await api.getUserUploads(user._id);
      setUploads(userUploads);
    } catch (error) {
      console.error('Failed to load uploads:', error);
      alert('Failed to load your uploads. Please try again.');
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;

    // Validate file count
    if (files.length > MAX_FILES) {
      alert(`You can only upload a maximum of ${MAX_FILES} files at once.\nPlease select ${MAX_FILES} files or fewer.`);
      return;
    }

    if (files.length < MIN_FILES) {
      alert(`Please select at least ${MIN_FILES} file to upload.`);
      return;
    }

    // Process files
    const processedFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const arrayBuffer = await file.arrayBuffer();
        const fileData = {
          name: file.name,
          type: file.type || 'image/jpeg',
          size: file.size,
          arrayBuffer: arrayBuffer,
          fromCamera: false
        };
        processedFiles.push(fileData);
      } catch (error) {
        console.error(`Failed to process file ${i}:`, error);
      }
    }

    setSelectedFiles(processedFiles);
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    const inputId = e.target.id; // camera-input or gallery-input

    // Validate file count
    if (files.length > MAX_FILES) {
      alert(`You can only upload a maximum of ${MAX_FILES} files at once.\nPlease select ${MAX_FILES} files or fewer.`);
      e.target.value = ''; // Reset input
      return;
    }

    if (files.length < MIN_FILES) {
      alert(`Please select at least ${MIN_FILES} file to upload.`);
      e.target.value = ''; // Reset input
      return;
    }

    const processedFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Store as object with buffer and metadata
        const fileData = {
          name: file.name,
          type: file.type || 'image/jpeg',
          size: file.size,
          arrayBuffer: arrayBuffer,
          fromCamera: inputId === 'camera-input' // Flag for camera files
        };

        processedFiles.push(fileData);
      } catch (error) {
        console.error(`Failed to process file ${i}:`, error);
      }
    }

    setSelectedFiles(processedFiles);
    e.target.value = ''; // Reset input for re-selection
  };

  const handleUpload = async () => {
    // Validate file count
    if (selectedFiles.length === 0) {
      alert('Please select at least 1 file to upload.');
      return;
    }

    if (selectedFiles.length > MAX_FILES) {
      alert(`You can only upload a maximum of ${MAX_FILES} files at once.`);
      return;
    }

    try {
      const result = await api.uploadImages(user._id, selectedFiles);

      setUploadCount(result.count);
      setShowModal(true);
      setSelectedFiles([]);

      // Reload uploads
      loadUploads();
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Failed to upload images: ${error.message || 'Please try again'}`);
    }
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles(selectedFiles.filter((_, index) => index !== indexToRemove));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getModalContent = (type) => {
    switch (type) {
      case 'about':
        return { title: 'About Us', content: <AboutUsContent /> };
      case 'privacy':
        return { title: 'Privacy Policy', content: <PrivacyPolicyContent /> };
      case 'terms':
        return { title: 'Terms of Service', content: <TermsOfServiceContent /> };
      default:
        return null;
    }
  };

  const modalData = getModalContent(modalType);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/logo.png" alt="CLICKZ Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Invoice Upload</h1>
                <p className="text-sm text-gray-600">{user.phone_number}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* User Profile Section */}
        {(user.company_name || user.company_email || user.address) && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-xl p-6 sm:p-8 mb-8 animate-slide-up border-2 border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                <p className="text-sm text-gray-600">Account Information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Name */}
              {user.company_name && (
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Company Name</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user.company_name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Organization Number */}
              {user.org_nr && (
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Hash className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Org Number</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user.org_nr}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Phone Number */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Number</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{user.phone_number}</p>
                  </div>
                </div>
              </div>

              {/* Email */}
              {user.company_email && (
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user.company_email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Address */}
              {user.address && (
                <div className="bg-white rounded-xl p-4 shadow-sm md:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</p>
                      <p className="text-sm font-bold text-gray-900">
                        {user.address}
                        {user.zip_code && <span className="text-gray-600 ml-2">• {user.zip_code}</span>}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-8 animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Images</h2>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            className={`relative border-3 border-dashed rounded-2xl p-12 text-center transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50 scale-105'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            {/* Hidden input for camera (no multiple - iOS issue) */}
            <input
              type="file"
              id="camera-input"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Hidden input for gallery/file picker */}
            <input
              type="file"
              id="gallery-input"
              multiple
              accept="image/*,.pdf,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Upload Images
            </h3>
            <p className="text-gray-600 mb-2">
              Take a photo or choose from gallery
            </p>
            <p className="text-sm text-blue-600 font-semibold mb-6">
              Min: {MIN_FILES} file • Max: {MAX_FILES} files per upload
            </p>

            <div className="flex gap-3 justify-center flex-wrap">
              <label
                htmlFor="camera-input"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold cursor-pointer shadow-lg shadow-blue-200"
              >
                <Camera className="w-5 h-5" />
                Take Photo
              </label>

              <label
                htmlFor="gallery-input"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-all font-semibold cursor-pointer shadow-lg"
              >
                <ImageIcon className="w-5 h-5" />
                Choose Files
              </label>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              All image formats supported (JPG, PNG, HEIC, WebP, etc.)
            </p>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">
                  Selected Files
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${selectedFiles.length >= MAX_FILES ? 'text-red-600' : 'text-blue-600'}`}>
                    {selectedFiles.length} / {MAX_FILES}
                  </span>
                  {selectedFiles.length >= MAX_FILES && (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Max reached</span>
                  )}
                </div>
              </div>
              <div className="space-y-3 mb-6">
                {Array.from(selectedFiles).map((file, idx) => {
                  const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

                  return (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 group hover:bg-gray-100 transition-colors">
                      {isPDF ? (
                        <FileText className="w-5 h-5 text-red-600 flex-shrink-0" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium text-gray-700 truncate flex-1">
                        {file.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        onClick={() => removeFile(idx)}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedFiles([])}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                >
                  Clear All
                </button>
                <button
                  onClick={handleUpload}
                  className="flex-1 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold text-lg shadow-lg shadow-green-200"
                >
                  Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Upload History */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Uploads</h2>

          {uploads.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg">No uploads yet</p>
              <p className="text-gray-500 text-sm mt-2">Upload your first invoice above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupUploadsBySession(uploads).map((session) => (
                <div key={session.sessionNumber} className="border border-gray-200 rounded-2xl overflow-hidden">
                  {/* Session Header */}
                  <button
                    onClick={() => toggleSession(session.sessionNumber)}
                    className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                        {session.sessionNumber}
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-gray-900 text-lg">
                          Upload Session {session.sessionNumber}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <ImageIcon className="w-4 h-4" />
                            {session.uploads.length} {session.uploads.length === 1 ? 'file' : 'files'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(session.uploadedAt)}
                          </span>

                          {/* Email Status Badge */}
                          {session.uploads[0].email_status === 'sent' && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                              <Send className="w-3 h-3" />
                              Email Sent
                            </span>
                          )}
                          {session.uploads[0].email_status === 'failed' && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold">
                              <AlertCircle className="w-3 h-3" />
                              Email Failed
                            </span>
                          )}
                          {session.uploads[0].email_status === 'pending' && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-semibold">
                              <Clock className="w-3 h-3" />
                              Sending...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-6 h-6 text-gray-600 transition-transform ${
                        expandedSession === session.sessionNumber ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Session Content */}
                  {expandedSession === session.sessionNumber && (
                    <div className="p-6 bg-white">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {session.uploads.map((upload) => {
                          const isPDF = upload.image_url.toLowerCase().endsWith('.pdf');

                          return (
                            <div key={upload._id} className="group relative bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                              <div className="aspect-square overflow-hidden bg-gray-200 flex items-center justify-center">
                                {isPDF ? (
                                  <div className="flex flex-col items-center justify-center p-8">
                                    <FileText className="w-20 h-20 text-red-600 mb-2" />
                                    <span className="text-sm text-gray-700 font-semibold text-center">PDF Document</span>
                                  </div>
                                ) : (
                                  <img
                                    src={api.getImageUrl(upload.image_url)}
                                    alt="Invoice"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                )}
                              </div>
                              <div className="p-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(upload.uploaded_at)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Our Clients Section */}
      {clientAdvertisements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Clients</h2>
            <p className="text-gray-600">Trusted by leading companies</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {clientAdvertisements.map((ad) => (
              <div
                key={ad._id}
                className={`bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col items-center justify-center ${
                  ad.url ? 'cursor-pointer hover:scale-105' : ''
                }`}
              >
                {/* Image - Clickable if URL exists */}
                {ad.url ? (
                  <a
                    href={ad.url.startsWith('http') ? ad.url : `https://${ad.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center"
                  >
                    <img
                      src={api.getImageUrl(ad.image_url)}
                      alt={ad.name || 'Client Logo'}
                      className="max-w-full max-h-24 object-contain"
                    />
                  </a>
                ) : (
                  <img
                    src={api.getImageUrl(ad.image_url)}
                    alt={ad.name || 'Client Logo'}
                    className="max-w-full max-h-24 object-contain"
                  />
                )}

                {/* Name */}
                {ad.name && (
                  <p className="mt-3 text-sm font-semibold text-gray-900 text-center truncate w-full">
                    {ad.name}
                  </p>
                )}

                {/* URL */}
                {ad.url && (
                  <a
                    href={ad.url.startsWith('http') ? ad.url : `https://${ad.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-xs text-blue-600 hover:text-blue-800 text-center truncate w-full flex items-center justify-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span className="truncate">{ad.url}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <SuccessModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        count={uploadCount}
      />

      {/* Footer */}
      <Footer onOpenModal={setModalType} />

      {/* Info Modal */}
      <InfoModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        title={modalData?.title || ''}
        content={modalData?.content}
      />
    </div>
  );
};

// Main App Component
function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Load current user from localStorage
    const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    }
  }, []);

  const handleLogin = async (phoneNumber) => {
    try {
      const user = await api.login(phoneNumber);
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    } catch (error) {
      console.error('Login failed:', error);

      // Check if it's a "user not found" error
      if (error.message && error.message.includes('not registered')) {
        alert(
          'Phone number not registered.\n\n' +
          'Please contact your administrator to create an account for you.'
        );
      } else {
        alert('Login failed. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  };

  return (
    <>
      {!currentUser ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
