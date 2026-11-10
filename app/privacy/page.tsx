import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  ArrowLeft,
  Mail,
  MapPin,
  ExternalLink,
  Lock,
  FileText,
  UserCheck,
  EyeOff,
  Server,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Notice and data handling policy for SkyDrive - True Zero-Retention Cloud Storage.",
};

const TOC_ITEMS = [
  { id: "infocollect", label: "1. What Information Do We Collect?" },
  { id: "infouse", label: "2. How Do We Process Your Information?" },
  { id: "whoshare", label: "3. When & With Whom Do We Share Information?" },
  { id: "cookies", label: "4. Cookies & Tracking Technologies" },
  { id: "sociallogins", label: "5. How Do We Handle Social Logins?" },
  { id: "inforetain", label: "6. How Long Do We Keep Your Information?" },
  { id: "infosafe", label: "7. How Do We Keep Your Information Safe?" },
  { id: "infominors", label: "8. Do We Collect Information From Minors?" },
  { id: "privacyrights", label: "9. What Are Your Privacy Rights?" },
  { id: "DNT", label: "10. Controls for Do-Not-Track (DNT)" },
  { id: "otherlaws", label: "11. Specific Regional Privacy Rights" },
  { id: "policyupdates", label: "12. Updates to This Notice" },
  { id: "contact", label: "13. Contact Information" },
  { id: "request", label: "14. Review, Update, or Delete Your Data" },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* ── Subtle Background Grid & Atmospheric Glow ── */}
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
        {/* Hero Title */}
        <div className="mb-10 text-center sm:text-left border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Legal Notice</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Last updated: <span className="font-semibold text-foreground">November 10, 2026</span>
          </p>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground max-w-3xl">
            This Privacy Notice for <strong>SkyDrive</strong> (&ldquo;<strong>we</strong>,&rdquo; &ldquo;<strong>us</strong>,&rdquo; or &ldquo;<strong>our</strong>&rdquo;) describes how and why we might access, collect, store, use, and/or share (&ldquo;<strong>process</strong>&rdquo;) your personal information when you use our services (&ldquo;<strong>Services</strong>&rdquo;), including when you visit our website at{" "}
            <a
              href="https://skydrive.web.id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium inline-flex items-center gap-0.5"
            >
              https://skydrive.web.id
              <ExternalLink className="w-3 h-3 inline" />
            </a>{" "}
            or interact with our application.
          </p>

          <div className="mt-4 p-4 rounded-xl bg-card border border-border/80 flex items-start gap-3 text-sm">
            <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-muted-foreground leading-relaxed">
              <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at{" "}
              <a
                href="mailto:reskyprabowo89@gmail.com"
                className="text-primary hover:underline font-medium"
              >
                reskyprabowo89@gmail.com
              </a>.
            </p>
          </div>
        </div>

        {/* ── Special Google API Limited Use Disclosure Banner ── */}
        <section className="mb-10 p-5 sm:p-6 rounded-2xl bg-sky-500/10 border border-sky-500/25 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                Google API Services User Data Policy Compliance
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                SkyDrive&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                >
                  Google API Services User Data Policy
                  <ExternalLink className="w-3 h-3" />
                </a>
                , including the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy#limited-use"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                >
                  Limited Use requirements
                  <ExternalLink className="w-3 h-3" />
                </a>.
              </p>
              <p className="text-xs text-muted-foreground">
                We do not transfer or disclose your Google user data to third parties, advertising platforms, data brokers, or information resellers, nor do we use Google user data to serve advertisements or train machine learning models.
              </p>
            </div>
          </div>
        </section>

        {/* ── Summary of Key Points ── */}
        <section className="mb-12 p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Summary of Key Points
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            This summary highlights the key takeaways from our Privacy Notice. Use the{" "}
            <a href="#toc" className="text-primary hover:underline font-medium">
              Table of Contents
            </a>{" "}
            to navigate directly to detailed sections.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
              <span className="font-semibold text-foreground block mb-1">
                What personal information do we process?
              </span>
              <p className="text-muted-foreground text-xs leading-relaxed">
                When you visit or use our Services, we process voluntarily provided information (such as your name and email) and stream your personal files directly from Google Drive upon your instruction.{" "}
                <a href="#personalinfo" className="text-primary hover:underline font-medium">
                  Learn more
                </a>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
              <span className="font-semibold text-foreground block mb-1">
                Do we process sensitive personal information?
              </span>
              <p className="text-muted-foreground text-xs leading-relaxed">
                We only stream files you explicitly access via connected Google Drive accounts with your authorization. We do not inspect or index personal content in server databases.{" "}
                <a href="#sensitiveinfo" className="text-primary hover:underline font-medium">
                  Learn more
                </a>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
              <span className="font-semibold text-foreground block mb-1">
                Do we collect third-party information?
              </span>
              <p className="text-muted-foreground text-xs leading-relaxed">
                We receive profile information from Google OAuth authentication when you link your Google Drive accounts.{" "}
                <a href="#othersources" className="text-primary hover:underline font-medium">
                  Learn more
                </a>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
              <span className="font-semibold text-foreground block mb-1">
                How do we keep your information safe?
              </span>
              <p className="text-muted-foreground text-xs leading-relaxed">
                We implement in-memory streaming pipelines and strict zero-retention architecture. No file metadata or binaries are persisted on intermediate server disks.{" "}
                <a href="#infosafe" className="text-primary hover:underline font-medium">
                  Learn more
                </a>.
              </p>
            </div>
          </div>
        </section>

        {/* ── Table of Contents ── */}
        <section id="toc" className="mb-12 p-6 rounded-2xl bg-muted/30 border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Table of Contents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
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

        {/* ── Full Policy Content ── */}
        <div className="space-y-12 text-sm sm:text-base leading-relaxed text-muted-foreground">
          {/* Section 1 */}
          <section id="infocollect" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              1. What Information Do We Collect?
            </h2>

            <div id="personalinfo" className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                Personal information you disclose to us
              </h3>
              <p>
                <em className="text-foreground">In Short:</em> We collect personal information that you provide to us voluntarily.
              </p>
              <p>
                We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products, participate in activities on the Services, or otherwise contact us.
              </p>
              <p>The personal information we collect may include:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Names</li>
                <li>Email addresses</li>
              </ul>
            </div>

            <div id="sensitiveinfo" className="space-y-3 pt-2">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                Sensitive Information
              </h3>
              <p>
                When necessary, with your consent or as otherwise permitted by applicable law, we process:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Personal file access:</strong> We stream files directly between your client browser and Google Drive API servers in-memory based on your active upload and download requests.
                </li>
              </ul>
            </div>

            <div id="sociallogins" className="space-y-3 pt-2">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                Social Media & Google OAuth Login Data
              </h3>
              <p>
                We allow you to register and authenticate using Google OAuth. If you choose this method, we receive basic authentication profile details (such as your name, email address, profile picture, and authorized OAuth access tokens needed to communicate with Google Drive API v3 on your behalf).
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                Information automatically collected
              </h3>
              <p>
                <em className="text-foreground">In Short:</em> Some technical information — such as your Internet Protocol (IP) address, browser, and device characteristics — is collected automatically when you visit our Services.
              </p>
              <p>
                This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as IP address, browser type, operating system, language preferences, device name, and technical log timestamps. This is required for security, fraud prevention, and session management.
              </p>
            </div>

            <div id="othersources" className="space-y-3 pt-2">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                Information collected from other sources
              </h3>
              <p>
                To provide unified storage management, we query quota metrics and metadata directly from the Google Drive APIs for accounts you explicitly link to SkyDrive.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="infouse" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              2. How Do We Process Your Information?
            </h2>
            <p>
              <em className="text-foreground">In Short:</em> We process your information to provide, improve, and administer our Services, communicate with you, ensure security and fraud prevention, and comply with law.
            </p>
            <p>We process your personal information for purposes including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>To facilitate account creation and authentication:</strong> Enabling secure login sessions and multi-account Google Drive linkage.
              </li>
              <li>
                <strong>To provide unified cloud operations:</strong> Calculating real-time aggregate storage quotas and routing upload/download streams across your authorized Google accounts.
              </li>
              <li>
                <strong>To respond to user inquiries and support requests:</strong> Resolving technical questions and troubleshooting issues.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="whoshare" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              3. When and With Whom Do We Share Your Personal Information?
            </h2>
            <p>
              <em className="text-foreground">In Short:</em> We may share information in specific situations described below:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
              </li>
              <li>
                <strong>Legal Obligations:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, or judicial proceedings.
              </li>
            </ul>
            <p className="font-semibold text-foreground">
              We never sell, trade, or rent your personal information or file data to third-party advertisers.
            </p>
          </section>

          {/* Section 4 */}
          <section id="cookies" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              4. Do We Use Cookies and Other Tracking Technologies?
            </h2>
            <p>
              <em className="text-foreground">In Short:</em> We use strictly necessary cookies to keep you signed in and remember your language preferences.
            </p>
            <p>
              SkyDrive uses first-party cookies necessary for authentication sessions (<code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">better-auth.session_token</code>) and user language preferences (<code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">skydrive_lang</code>). We do not deploy third-party advertising cookies, cross-site trackers, or commercial profiling cookies.
            </p>
          </section>

          {/* Section 5 */}
          <section id="sociallogins" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              5. How Do We Handle Your Social Logins?
            </h2>
            <p>
              When you authenticate with Google, we receive authorization credentials strictly for interacting with your Google Drive under user-consented scopes. We recommend reviewing Google&apos;s Privacy Policy and your account settings on Google to manage connected apps at any time.
            </p>
          </section>

          {/* Section 6 */}
          <section id="inforetain" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              6. How Long Do We Keep Your Information?
            </h2>
            <p>
              <em className="text-foreground">In Short:</em> We keep your information only as long as necessary to fulfill the purposes outlined in this notice.
            </p>
            <p>
              User account profiles are kept as long as you maintain an active account with us. In line with our <strong>True Zero-Retention</strong> architecture, file lists, document metadata, and file binaries are never stored in server databases, eliminating residual file retention.
            </p>
          </section>

          {/* Section 7 */}
          <section id="infosafe" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              7. How Do We Keep Your Information Safe?
            </h2>
            <p>
              We have implemented appropriate organizational and technical safeguards:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>AES-256 encrypted token vaults for stored OAuth credentials.</li>
              <li>Zero intermediate disk storage — file operations stream entirely in volatile server memory.</li>
              <li>TLS 1.3 encrypted data transmission across all public and internal interfaces.</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              Please note that no electronic transmission or digital system can be guaranteed 100% secure. You should always use strong passwords and secure network environments.
            </p>
          </section>

          {/* Section 8 */}
          <section id="infominors" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              8. Do We Collect Information From Minors?
            </h2>
            <p>
              We do not knowingly solicit data from or market to children under 18 years of age. By using the Services, you represent that you are at least 18 years old or that you are the parent or guardian of such a minor and consent to their use of the Services.
            </p>
          </section>

          {/* Section 9 */}
          <section id="privacyrights" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              9. What Are Your Privacy Rights?
            </h2>
            <p>
              Depending on your location, you may have rights under applicable privacy laws (including GDPR, CCPA, and Indonesia PDP Law UU No. 27/2022) to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Request access to your personal information.</li>
              <li>Request correction of inaccuracies or deletion of your account.</li>
              <li>Withdraw your consent to data processing at any time.</li>
            </ul>
            <p id="withdrawconsent">
              To withdraw consent or delete your account, you can disconnect your Google Drive accounts from your SkyDrive dashboard settings or email us at{" "}
              <a href="mailto:reskyprabowo89@gmail.com" className="text-primary hover:underline">
                reskyprabowo89@gmail.com
              </a>.
            </p>
          </section>

          {/* Section 10 */}
          <section id="DNT" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              10. Controls for Do-Not-Track (DNT) Features
            </h2>
            <p>
              Most web browsers include a Do-Not-Track (&ldquo;DNT&rdquo;) feature or setting. Because no uniform standard for recognizing and implementing DNT signals has been finalized, we do not currently respond to automated DNT browser signals.
            </p>
          </section>

          {/* Section 11 */}
          <section id="otherlaws" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              11. Do Other Regions Have Specific Privacy Rights?
            </h2>
            <p>
              Users in Australia and New Zealand are protected under Australia&apos;s Privacy Act 1988 and New Zealand&apos;s Privacy Act 2020. You may submit complaints regarding Australian Privacy Principles to the{" "}
              <a
                href="https://www.oaic.gov.au/privacy/privacy-complaints/lodge-a-privacy-complaint-with-us"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                OAIC
                <ExternalLink className="w-3 h-3" />
              </a>{" "}
              or New Zealand Privacy Commissioner.
            </p>
          </section>

          {/* Section 12 */}
          <section id="policyupdates" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              12. Do We Make Updates to This Notice?
            </h2>
            <p>
              Yes, we will update this notice as necessary to remain compliant with relevant laws and service updates. The revised version will be indicated by the &ldquo;Last updated&rdquo; date at the top of this page.
            </p>
          </section>

          {/* Section 13 */}
          <section id="contact" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              13. How Can You Contact Us About This Notice?
            </h2>
            <p>
              If you have questions, comments, or concerns about this notice, please reach out to us:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-card border border-border flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground text-sm block">Email Support</span>
                  <a
                    href="mailto:reskyprabowo89@gmail.com"
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    reskyprabowo89@gmail.com
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

          {/* Section 14 */}
          <section id="request" className="scroll-mt-24 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2">
              14. How Can You Review, Update, or Delete the Data We Collect?
            </h2>
            <p>
              Based on the applicable laws of your country, you may have the right to request access to the personal information we collect from you, details about how we process it, correct inaccuracies, or delete your data.
            </p>
            <p>
              To submit a formal Data Subject Access Request (DSAR), please use our online form:
            </p>
            <div className="pt-2">
              <a
                href="https://app.termly.io/dsar/11c31566-81ce-49cb-b164-97d1a35ad3ee"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow hover:bg-primary/90 transition-all active:scale-95"
              >
                <span>Submit Data Subject Access Request (DSAR)</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </section>
        </div>

        {/* ── Footer Attribution & Disclaimer ── */}
        <div className="mt-16 pt-8 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} SkyDrive. All rights reserved.</p>
          <p>
            Created using{" "}
            <a
              href="https://termly.io/products/privacy-policy-generator/"
              target="_blank"
              rel="noopener external noreferrer"
              className="text-primary hover:underline"
            >
              Termly&apos;s Privacy Policy Generator
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

