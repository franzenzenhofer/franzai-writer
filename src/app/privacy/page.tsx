import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Franz AI Writer',
  description: 'Privacy policy for Franz AI Writer application - Learn how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-gray max-w-none">
        <p className="text-lg text-muted-foreground mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="mb-4">
            Welcome to Franz AI Writer. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy explains how we collect, use, and safeguard your information when you use our 
            AI-powered document generation service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <h3 className="text-xl font-medium mb-3">Personal Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Account information (email address, name) when you register</li>
            <li>Authentication data provided by third-party login services (Google, GitHub)</li>
            <li>Profile information you choose to provide</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-3">Usage Data</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Document content you create using our AI workflows</li>
            <li>Workflow preferences and settings</li>
            <li>Usage patterns and feature interactions</li>
            <li>Device information and browser data</li>
            <li>Session data and cookies for authentication</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="mb-4">We use your information to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide and improve our AI-powered document generation services</li>
            <li>Authenticate your account and maintain security</li>
            <li>Process your document generation requests through our AI systems</li>
            <li>Save your documents and workflow preferences</li>
            <li>Provide customer support and technical assistance</li>
            <li>Analyze usage patterns to improve our service</li>
            <li>Send important service-related communications</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">AI Processing</h2>
          <p className="mb-4">
            When you use our AI features, your inputs and prompts are processed by Google&apos;s Gemini AI services. 
            This processing includes:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Sending your text prompts to Google&apos;s AI models for content generation</li>
            <li>Processing uploaded images or documents for AI analysis</li>
            <li>Using Google Search grounding for enhanced AI responses when enabled</li>
            <li>Generating images using Google&apos;s Imagen AI service</li>
          </ul>
          <p className="mb-4">
            We do not store your AI prompts or generated content on Google&apos;s servers beyond the processing time. 
            All generated content is stored securely in our Firebase database.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Storage and Security</h2>
          <p className="mb-4">
            Your data is stored securely using Firebase services:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Documents and Content:</strong> Stored in Firebase Firestore with encryption</li>
            <li><strong>File Uploads:</strong> Stored in Firebase Storage with secure access controls</li>
            <li><strong>Authentication:</strong> Managed by Firebase Auth with industry-standard security</li>
            <li><strong>Session Data:</strong> Encrypted and stored temporarily for service functionality</li>
          </ul>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to protect your data against 
            unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Sharing and Third Parties</h2>
          <p className="mb-4">We share your data with the following trusted third-party services:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Google AI Services:</strong> For AI content generation and processing</li>
            <li><strong>Firebase/Google Cloud:</strong> For data storage, authentication, and hosting</li>
            <li><strong>Authentication Providers:</strong> Google, GitHub for secure login</li>
          </ul>
          <p className="mb-4">
            We do not sell, rent, or trade your personal information to third parties for marketing purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
            <li><strong>Erasure:</strong> Request deletion of your personal data</li>
            <li><strong>Data Portability:</strong> Export your data in a structured format</li>
            <li><strong>Restriction:</strong> Limit how we process your data</li>
            <li><strong>Objection:</strong> Object to certain types of data processing</li>
          </ul>
          <p className="mb-4">
            To exercise these rights, please contact us using the information provided below.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
          <p className="mb-4">
            We use cookies and similar technologies for:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Authentication and session management</li>
            <li>Remembering your preferences and settings</li>
            <li>Improving service performance and user experience</li>
            <li>Basic analytics to understand usage patterns</li>
          </ul>
          <p className="mb-4">
            You can control cookie settings through your browser preferences.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
          <p className="mb-4">
            We retain your data for as long as necessary to provide our services and comply with legal obligations:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Account data: Until you delete your account</li>
            <li>Document content: Until you delete the documents or your account</li>
            <li>Usage logs: Up to 12 months for service improvement</li>
            <li>Support communications: Up to 3 years for reference</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
          <p className="mb-4">
            Your data may be processed in countries other than your own, including the United States 
            where Google Cloud and Firebase services operate. We ensure appropriate safeguards are 
            in place for international data transfers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
          <p className="mb-4">
            Our service is not intended for children under 13 years of age. We do not knowingly 
            collect personal information from children under 13.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update this privacy policy from time to time. We will notify you of any material 
            changes by posting the new privacy policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="mb-4">
            If you have any questions about this privacy policy or our data practices, please contact us:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Email:</strong> privacy@franzai.com</li>
            <li><strong>Website:</strong> <a href="https://www.franzai.com/contact" className="text-blue-600 hover:underline">https://www.franzai.com/contact</a></li>
            <li><strong>Address:</strong> FranzAI Privacy Team, Vienna, Austria</li>
          </ul>
        </section>
      </div>
    </div>
  );
}