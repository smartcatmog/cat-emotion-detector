export const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50">Privacy Policy</h1>
        <p className="text-gray-600 dark:text-gray-400">Last updated: March 2025</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">1. Introduction</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Cat Emotion Detector ("we", "us", "our", or "Company") operates the Cat Emotion Detector website and application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">2. Information Collection and Use</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We collect different types of information for various purposes to provide and improve our Service to you.
          </p>
          <div className="space-y-2 ml-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-50">Types of Data Collected:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Image Data:</strong> Photos you upload for analysis</li>
              <li><strong>Analysis Results:</strong> Emotion detection results and interpretations</li>
              <li><strong>Usage Data:</strong> Information about how you use our Service</li>
              <li><strong>Device Information:</strong> Browser type, IP address, and device type</li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">3. Data Collection Consent</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Before uploading an image, you will be asked to consent to data collection. This consent is optional:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
            <li><strong>With Consent:</strong> Your anonymized data may be used to improve our AI models</li>
            <li><strong>Without Consent:</strong> Your data will not be stored for training purposes</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">4. Data Storage and Security</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Your data is stored securely using industry-standard encryption. We use Supabase for data storage, which implements:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
            <li>Encryption at rest</li>
            <li>Encryption in transit (HTTPS/TLS)</li>
            <li>Regular security audits</li>
            <li>Automated backups</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">5. Data Retention</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We retain your data for as long as necessary to provide our Service. You can request deletion of your data at any time. Deleted data will be permanently removed from our systems within 30 days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">6. Third-Party Services</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Our Service uses the following third-party services:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
            <li><strong>Anthropic Claude API:</strong> For image analysis and emotion detection</li>
            <li><strong>Supabase:</strong> For data storage and management</li>
            <li><strong>Vercel:</strong> For hosting and deployment</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mt-2">
            These services have their own privacy policies. We encourage you to review them.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">7. Your Rights</h2>
          <p className="text-gray-700 dark:text-gray-300">
            You have the right to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of data collection</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">8. Contact Us</h2>
          <p className="text-gray-700 dark:text-gray-300">
            If you have any questions about this Privacy Policy, please contact us through our website.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">9. Changes to This Policy</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this page.
          </p>
        </section>
      </div>
    </div>
  );
};
