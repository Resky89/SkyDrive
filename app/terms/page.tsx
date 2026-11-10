import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Scale,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service and legal agreements for using SkyDrive - Unified Multi-Account Cloud Storage Pool.",
};

const TOC_ITEMS = [
  { id: "services", label: "1. Our Services" },
  { id: "ip", label: "2. Intellectual Property Rights" },
  { id: "userreps", label: "3. User Representations" },
  { id: "userreg", label: "4. User Registration" },
  { id: "prohibited", label: "5. Prohibited Activities" },
  { id: "ugc", label: "6. User Generated Contributions" },
  { id: "license", label: "7. Contribution License" },
  { id: "thirdparty", label: "8. Third-Party Websites & Content" },
  { id: "sitemanage", label: "9. Services Management" },
  { id: "ppyes", label: "10. Privacy Policy" },
  { id: "copyrightno", label: "11. Copyright Infringements" },
  { id: "terms", label: "12. Term and Termination" },
  { id: "modifications", label: "13. Modifications & Interruptions" },
  { id: "law", label: "14. Governing Law" },
  { id: "disputes", label: "15. Dispute Resolution" },
  { id: "corrections", label: "16. Corrections" },
  { id: "disclaimer", label: "17. Disclaimer" },
  { id: "liability", label: "18. Limitations of Liability" },
  { id: "indemnification", label: "19. Indemnification" },
  { id: "userdata", label: "20. User Data" },
  { id: "electronic", label: "21. Electronic Communications & Signatures" },
  { id: "misc", label: "22. Miscellaneous" },
  { id: "contact", label: "23. Contact Us" },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* ── Background Grid & Horizon Glow ── */}
      <div className="fixed inset-0 bg-[radial-gradient(hsl(var(--muted-foreground)/0.12)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none -z-10" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[850px] h-[300px] bg-gradient-to-b from-primary/10 via-sky-500/5 to-transparent blur-3xl rounded-full pointer-events-none -z-10" />

      {/* ── Header Bar ── */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group transition-transform active:scale-95"
          >
            <Image
              src="/SkyDrive1.svg"
              alt="SkyDrive Logo"
              width={130}
              height={32}
              className="h-8 w-auto dark:brightness-110"
              priority
            />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/60"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Title & Introduction */}
        <div className="mb-10 text-center sm:text-left border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-3">
            <Scale className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Last updated: <span className="font-semibold text-foreground">November 10, 2026</span>
          </p>

          <div className="mt-6 p-5 rounded-2xl bg-card border border-border/80 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="text-base font-bold text-foreground">AGREEMENT TO OUR LEGAL TERMS</h2>
            <p>
              We are <strong>SkyDrive</strong> (&ldquo;<strong>Company</strong>,&rdquo; &ldquo;<strong>we</strong>,&rdquo; &ldquo;<strong>us</strong>,&rdquo; &ldquo;<strong>our</strong>&rdquo;), registered in <strong>Indonesia</strong> at Ciawi, Bogor, Jawa Barat, Bogor, Jawa Barat 16721.
            </p>
            <p>
              We operate the website{" "}
              <a
                href="https://skydrive.web.id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium inline-flex items-center gap-0.5"
              >
                https://skydrive.web.id
                <ExternalLink className="w-3 h-3 inline" />
              </a>{" "}
              (the &ldquo;<strong>Site</strong>&rdquo;), as well as any other related products and services that refer or link to these legal terms (collectively, the &ldquo;<strong>Services</strong>&rdquo;).
            </p>
            <p>
              You can contact us by phone at <strong>085923461660</strong>, email at{" "}
              <a href="mailto:reskyprabowo89@gmail.com" className="text-primary hover:underline font-medium">
                reskyprabowo89@gmail.com
              </a>
              , or by mail to Ciawi, Bogor, Jawa Barat, Bogor, Jawa Barat 16721, Indonesia.
            </p>
            <p className="font-medium text-foreground">
              These Legal Terms constitute a legally binding agreement between you and SkyDrive. By accessing the Services, you agree to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.
            </p>
            <p className="text-xs text-muted-foreground">
              All users who are minors in their jurisdiction (generally under 18) must have permission and direct supervision from a parent or guardian to use the Services.
            </p>
          </div>
        </div>

        {/* ── Table of Contents ── */}
        <section id="toc" className="mb-12 p-6 rounded-2xl bg-muted/30 border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {TOC_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-muted-foreground hover:text-primary transition-colors py-1 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </section>

        {/* ── Full Terms Sections ── */}
        <div className="space-y-12 text-sm sm:text-base leading-relaxed text-muted-foreground">
          {/* Section 1 */}
          <section id="services" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              1. Our Services
            </h2>
            <p>
              The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country.
            </p>
            <p>
              Those who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.
            </p>
          </section>

          {/* Section 2 */}
          <section id="ip" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              2. Intellectual Property Rights
            </h2>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Our Intellectual Property</h3>
            <p>
              We are the owner or licensee of all intellectual property rights in our Services, including source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics (the &ldquo;Content&rdquo;), and trademarks, service marks, and logos (the &ldquo;Marks&rdquo;).
            </p>
            <p>
              Our Content and Marks are protected by copyright and trademark laws around the world. The Content and Marks are provided &ldquo;AS IS&rdquo; for your personal, non-commercial use or internal business purposes only.
            </p>

            <h3 className="text-base sm:text-lg font-semibold text-foreground pt-2">Your Use of Our Services</h3>
            <p>
              Subject to compliance with these Legal Terms, we grant you a non-exclusive, non-transferable, revocable license to access the Services solely for personal or internal business purposes.
            </p>
            <p>
              Except as permitted herein, no part of the Services, Content, or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for commercial purposes without our express prior written permission.
            </p>
          </section>

          {/* Section 3 */}
          <section id="userreps" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              3. User Representations
            </h2>
            <p>By using the Services, you represent and warrant that:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>All registration information you submit is true, accurate, current, and complete.</li>
              <li>You will maintain the accuracy of such information and promptly update it as necessary.</li>
              <li>You have the legal capacity and agree to comply with these Legal Terms.</li>
              <li>You are not a minor in your jurisdiction, or have received parental permission to use the Services.</li>
              <li>You will not access the Services through automated or non-human means (bots, scripts).</li>
              <li>You will not use the Services for any illegal or unauthorized purpose.</li>
              <li>Your use will not violate any applicable law or regulation.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="userreg" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              4. User Registration
            </h2>
            <p>
              You may be required to register to use the Services. You agree to keep your password confidential and are responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine it is inappropriate, obscene, or objectionable.
            </p>
          </section>

          {/* Section 5 */}
          <section id="prohibited" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              5. Prohibited Activities
            </h2>
            <p>
              You may not access or use the Services for any purpose other than that for which we make them available. Prohibited activities include:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Systematically retrieving data or content to compile a collection, database, or directory without written permission.</li>
              <li>Tricking, defrauding, or misleading us or other users, especially to learn sensitive account information.</li>
              <li>Circumventing, disabling, or interfering with security-related features of the Services.</li>
              <li>Disparaging, tarnishing, or otherwise harming us and/or the Services.</li>
              <li>Uploading viruses, Trojan horses, spamming, or excessive repetitive postings that disrupt system operations.</li>
              <li>Using automated systems (spiders, offline readers, scrapers) without express authorization.</li>
              <li>Deciphering, decompiling, disassembling, or reverse engineering any software comprising the Services.</li>
              <li>Using the Services to compete with us or for unauthorized commercial revenue-generating endeavors.</li>
              <li>Selling or transferring your profile to any third party.</li>
            </ul>
          </section>

          {/* Section 6 & 7 */}
          <section id="ugc" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              6. User Generated Contributions
            </h2>
            <p>
              The Services may allow you to submit feedback, comments, suggestions, or other content (&ldquo;Contributions&rdquo;). You represent and warrant that your Contributions are original or you hold the necessary rights, that they do not infringe third-party intellectual property or privacy rights, and do not contain defamatory or illegal content.
            </p>
          </section>

          <section id="license" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              7. Contribution License
            </h2>
            <p>
              You retain full ownership of all your personal contributions and files. When you submit feedback or public comments to us, you grant us a worldwide, royalty-free license to host, display, and utilize such feedback for service improvement.
            </p>
          </section>

          {/* Section 8 */}
          <section id="thirdparty" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              8. Third-Party Websites and Content
            </h2>
            <p>
              The Services link to and interact with third-party platforms (principally Google Cloud and Google Drive APIs). We are not responsible for any third-party websites or content accessed through the Services. Your relationship with Google is governed exclusively by Google&apos;s Terms of Service and Privacy Policy.
            </p>
          </section>

          {/* Section 9 */}
          <section id="sitemanage" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              9. Services Management
            </h2>
            <p>
              We reserve the right to monitor the Services for violations, take appropriate legal action against violators, refuse or restrict access to any user, and manage the Services in a manner designed to protect our rights and property.
            </p>
          </section>

          {/* Section 10 */}
          <section id="ppyes" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              10. Privacy Policy
            </h2>
            <p>
              We care about data privacy and security. Please review our Privacy Policy at{" "}
              <Link href="/privacy" className="text-primary hover:underline font-semibold inline-flex items-center gap-0.5">
                https://skydrive.web.id/privacy
                <ExternalLink className="w-3 h-3 inline" />
              </Link>
              . By using the Services, you agree to be bound by our Privacy Policy.
            </p>
            <p>
              The Services are hosted in <strong>Singapore</strong>. If you access the Services from regions with differing data protection laws, your continued use constitutes consent to transfer and process data in Singapore.
            </p>
          </section>

          {/* Section 11 */}
          <section id="copyrightno" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              11. Copyright Infringements
            </h2>
            <p>
              We respect the intellectual property rights of others. If you believe material available on or through the Services infringes upon your copyright, notify us immediately at{" "}
              <a href="mailto:reskyprabowo89@gmail.com" className="text-primary hover:underline font-medium">
                reskyprabowo89@gmail.com
              </a>.
            </p>
          </section>

          {/* Section 12 */}
          <section id="terms" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              12. Term and Termination
            </h2>
            <p>
              These Legal Terms remain in full force while you use the Services. We reserve the right to deny access or terminate user accounts at our sole discretion, without warning, for breach of any term or applicable regulation.
            </p>
          </section>

          {/* Section 13 */}
          <section id="modifications" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              13. Modifications and Interruptions
            </h2>
            <p>
              We reserve the right to change or modify the Services at any time without notice. We cannot guarantee uninterrupted service availability and are not liable for any downtime resulting from maintenance or technical issues.
            </p>
          </section>

          {/* Section 14 & 15 */}
          <section id="law" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              14. Governing Law
            </h2>
            <p>
              These Legal Terms shall be governed by and defined following the laws of <strong>Indonesia</strong>. Both parties consent that Indonesian courts have exclusive jurisdiction over any disputes arising under these terms.
            </p>
          </section>

          <section id="disputes" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              15. Dispute Resolution
            </h2>
            <p>
              <strong>Informal Negotiations:</strong> Parties agree to attempt informal negotiations for at least 30 days before initiating formal arbitration.
            </p>
            <p>
              <strong>Binding Arbitration:</strong> Unresolved disputes shall be finally settled under UNCITRAL Arbitration Rules by one (1) arbitrator seated in <strong>Bogor, Indonesia</strong>, conducted in the Indonesian language.
            </p>
          </section>

          {/* Section 16 & 17 */}
          <section id="corrections" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              16. Corrections
            </h2>
            <p>
              There may be typographical errors, inaccuracies, or omissions on the Services. We reserve the right to correct any errors and update information at any time without prior notice.
            </p>
          </section>

          <section id="disclaimer" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              17. Disclaimer
            </h2>
            <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs sm:text-sm leading-relaxed uppercase">
              THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </div>
          </section>

          {/* Section 18 & 19 */}
          <section id="liability" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              18. Limitations of Liability
            </h2>
            <p className="uppercase text-xs sm:text-sm">
              IN NO EVENT WILL WE BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, OR LOSS OF DATA. OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER WILL AT ALL TIMES BE LIMITED TO <strong>$300.00 USD</strong>.
            </p>
          </section>

          <section id="indemnification" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              19. Indemnification
            </h2>
            <p>
              You agree to defend, indemnify, and hold us harmless from any loss, damage, liability, or claim (including reasonable attorneys&apos; fees) arising from your use of the Services, breach of these Legal Terms, or violation of third-party rights.
            </p>
          </section>

          {/* Section 20, 21, 22 */}
          <section id="userdata" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              20. User Data
            </h2>
            <p>
              We maintain certain operational data transmitted to manage system performance. You remain solely responsible for all data transmitted or related to your activities. We hold no liability for data loss or corruption.
            </p>
          </section>

          <section id="electronic" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              21. Electronic Communications, Transactions, and Signatures
            </h2>
            <p>
              Visiting the Services, emailing us, or submitting web forms constitutes electronic communication. You consent to receive communications electronically and agree that digital disclosures satisfy legal writing requirements.
            </p>
          </section>

          <section id="misc" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              22. Miscellaneous
            </h2>
            <p>
              These Legal Terms constitute the entire agreement between you and SkyDrive. Our failure to exercise or enforce any right shall not operate as a waiver. If any provision is deemed unlawful or void, that provision is severable without affecting the validity of remaining provisions.
            </p>
          </section>

          {/* Section 23 */}
          <section id="contact" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              23. Contact Us
            </h2>
            <p>
              In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-card border border-border flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-semibold text-foreground block">Email</span>
                  <a
                    href="mailto:reskyprabowo89@gmail.com"
                    className="text-primary hover:underline text-xs sm:text-sm font-medium"
                  >
                    reskyprabowo89@gmail.com
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-semibold text-foreground block">Phone</span>
                  <a
                    href="tel:085923461660"
                    className="text-primary hover:underline text-xs sm:text-sm font-medium"
                  >
                    085923461660
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-semibold text-foreground block">Mailing Address</span>
                  <p className="text-muted-foreground text-xs leading-relaxed mt-0.5">
                    <strong>SkyDrive</strong>
                    <br />
                    Ciawi, Bogor, Jawa Barat 16721
                    <br />
                    Indonesia
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── Footer Attribution ── */}
        <div className="mt-16 pt-8 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} SkyDrive. All rights reserved.</p>
          <p>
            Created using{" "}
            <a
              href="https://termly.io/products/terms-and-conditions-generator/"
              target="_blank"
              rel="noopener external noreferrer"
              className="text-primary hover:underline"
            >
              Termly&apos;s Terms and Conditions Generator
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

