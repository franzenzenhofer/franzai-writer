import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Franz AI Writer',
  description: 'Terms of service for Franz AI Writer application - User agreements and service guidelines.',
};

export default function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-gray max-w-none">
        <p className="text-lg text-muted-foreground mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
          <p className="mb-4">
            By accessing and using Franz AI Writer, you accept and agree to be bound by the terms and 
            provision of this agreement. If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
          <p className="mb-4">
            Franz AI Writer is an AI-powered document generation platform that provides:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Multi-stage workflow wizards for document creation</li>
            <li>AI content generation using Google&apos;s Gemini models</li>
            <li>Image generation capabilities using Google&apos;s Imagen AI</li>
            <li>Document export in multiple formats (HTML, DOCX, Markdown, PDF)</li>
            <li>Document management and storage</li>
            <li>Collaborative features and sharing options</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
          <h3 className="text-xl font-medium mb-3">Account Registration</h3>
          <p className="mb-4">
            You may create an account to access additional features. When you create an account, you agree to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized use</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-3">Account Responsibilities</h3>
          <p className="mb-4">You are responsible for:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Keeping your login credentials secure</li>
            <li>All content created and stored in your account</li>
            <li>Compliance with these terms and applicable laws</li>
            <li>Any consequences resulting from sharing your account</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
          <p className="mb-4">You agree not to use Franz AI Writer to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Generate content that is illegal, harmful, or violates others&apos; rights</li>
            <li>Create misleading, defamatory, or fraudulent content</li>
            <li>Generate content that infringes on intellectual property rights</li>
            <li>Produce spam, malware, or other malicious content</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Attempt to reverse engineer or exploit our systems</li>
            <li>Use the service for any commercial purposes without authorization</li>
            <li>Generate content that promotes violence, hate speech, or discrimination</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">AI Content and Limitations</h2>
          <h3 className="text-xl font-medium mb-3">AI-Generated Content</h3>
          <p className="mb-4">
            Our service uses AI models to generate content. You acknowledge that:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>AI-generated content may contain inaccuracies or biases</li>
            <li>Generated content should be reviewed and verified before use</li>
            <li>We do not guarantee the accuracy, completeness, or reliability of AI output</li>
            <li>You are responsible for fact-checking and validating generated content</li>
            <li>AI models may occasionally produce inappropriate or unexpected content</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-3">Content Ownership</h3>
          <p className="mb-4">
            You retain ownership of content you create using our service. However:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>You grant us a license to process and store your content for service delivery</li>
            <li>AI-generated content may not be eligible for copyright protection</li>
            <li>You are responsible for ensuring your content doesn&apos;t infringe others&apos; rights</li>
            <li>We may use aggregated, anonymized data to improve our services</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
          <p className="mb-4">
            Franz AI Writer and its original content, features, and functionality are owned by FranzAI 
            and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
          <p className="mb-4">
            You may not copy, modify, distribute, sell, or lease any part of our services or included 
            software without our written permission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Service Availability</h2>
          <h3 className="text-xl font-medium mb-3">Uptime and Maintenance</h3>
          <p className="mb-4">We strive to maintain high service availability but:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>We do not guarantee 100% uptime or availability</li>
            <li>Scheduled maintenance may temporarily interrupt service</li>
            <li>Third-party dependencies (AI services) may affect availability</li>
            <li>We may modify or discontinue features with reasonable notice</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-3">Service Changes</h3>
          <p className="mb-4">
            We reserve the right to modify, suspend, or discontinue any part of our service at any time. 
            We will provide reasonable notice for significant changes that affect user experience.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data and Privacy</h2>
          <p className="mb-4">
            Your privacy is important to us. Please review our Privacy Policy to understand how we 
            collect, use, and protect your information. By using our service, you consent to our 
            data practices as described in the Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
          <p className="mb-4">
            To the maximum extent permitted by law, FranzAI shall not be liable for any indirect, 
            incidental, special, consequential, or punitive damages, including but not limited to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Loss of profits, data, or business opportunities</li>
            <li>Damages resulting from AI-generated content inaccuracies</li>
            <li>Service interruptions or security breaches</li>
            <li>Third-party actions or content</li>
          </ul>
          <p className="mb-4">
            Our total liability for any claims shall not exceed the amount you paid for the service 
            in the 12 months preceding the claim.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Indemnification</h2>
          <p className="mb-4">
            You agree to indemnify and hold harmless FranzAI from any claims, damages, or expenses 
            arising from your use of the service, violation of these terms, or infringement of any 
            third-party rights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Termination</h2>
          <h3 className="text-xl font-medium mb-3">Termination by You</h3>
          <p className="mb-4">
            You may terminate your account at any time by contacting us or using account deletion 
            features when available.
          </p>
          
          <h3 className="text-xl font-medium mb-3">Termination by Us</h3>
          <p className="mb-4">We may terminate or suspend your account if:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>You violate these terms of service</li>
            <li>You engage in fraudulent or illegal activities</li>
            <li>Your account is inactive for an extended period</li>
            <li>We discontinue the service</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-3">Effect of Termination</h3>
          <p className="mb-4">
            Upon termination, your right to use the service ceases immediately. We may delete your 
            data according to our data retention policies, though we may retain some data as required 
            by law or for legitimate business purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Dispute Resolution</h2>
          <p className="mb-4">
            Any disputes arising from these terms or your use of the service shall be resolved through:
          </p>
          <ol className="list-decimal pl-6 mb-4">
            <li>Good faith negotiation between the parties</li>
            <li>Mediation if negotiation fails</li>
            <li>Binding arbitration as a last resort</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
          <p className="mb-4">
            These terms shall be governed by and construed in accordance with the laws of Austria, 
            without regard to its conflict of law provisions. Any legal actions shall be brought 
            in the courts of Vienna, Austria.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these terms at any time. We will notify users of material 
            changes by email or through the service. Continued use of the service after changes 
            constitutes acceptance of the new terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Severability</h2>
          <p className="mb-4">
            If any provision of these terms is found to be invalid or unenforceable, the remaining 
            provisions shall continue in full force and effect.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Email:</strong> legal@franzai.com</li>
            <li><strong>Website:</strong> <a href="https://www.franzai.com/contact" className="text-blue-600 hover:underline">https://www.franzai.com/contact</a></li>
            <li><strong>Address:</strong> FranzAI Legal Team, Vienna, Austria</li>
          </ul>
        </section>
      </div>
    </div>
  );
}