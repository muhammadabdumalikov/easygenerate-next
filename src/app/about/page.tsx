import type { Metadata } from 'next';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'About Converto',
  description: 'Learn about Converto — fast, reliable online file conversion tools.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f5f3ef]">
          <Header />
          
          <main className="px-8 py-12 max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                About Converto
              </h1>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                The mission behind our fast, reliable online file conversion tools.
              </p>
            </div>

            <article className="prose prose-indigo max-w-none bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h2>Our Purpose</h2>
              <p>
                Converto was created to remove friction from everyday file work. We noticed
                teams across product, data, and operations spending far too much time
                juggling formats, cleaning datasets, and exporting content for distribution.
                The tools were either complicated or unreliable. We set out to build a
                fast, trustworthy alternative that lives entirely in the browser and
                focuses on the tasks people do most often.
              </p>
              <h3>What We Value</h3>
              <ul>
                <li><strong>Simplicity:</strong> clean, purposeful interfaces that help you finish tasks quickly.</li>
                <li><strong>Reliability:</strong> predictable output that behaves the same every time.</li>
                <li><strong>Privacy:</strong> process locally when possible and minimize data exposure when not.</li>
                <li><strong>Accessibility:</strong> inclusive design and careful attention to details that matter.</li>
              </ul>
              <h3>How Converto Helps</h3>
              <p>
                Whether you are converting CSV to Excel for a weekly report, generating
                Markdown tables for documentation, preparing SQL inserts to seed a test
                database, beautifying JSON for review, or exporting spreadsheets to
                professional PDFs, Converto brings together dependable utilities in one
                place. We support 300+ formats and continue to expand based on real user
                feedback.
              </p>
              <h3>Built for Speed and Scale</h3>
              <p>
                Converto is engineered to be fast in real-world conditions. The interface
                is responsive, previews are instant, and downloads are optimized. For
                larger files and complex operations, we leverage scalable cloud
                infrastructure with strict retention controls. Our goal is to deliver
                results in seconds while maintaining quality and consistency.
              </p>
              <h3>Security and Privacy</h3>
              <p>
                We take security seriously. We prefer in-browser processing where
                feasible and apply isolation, encryption in transit, and short-lived
                storage for server-side tasks. Your files are never used to train models
                or shared with third parties. We believe trustworthy software should be
                transparent about how it handles your data.
              </p>
              <h3>Roadmap</h3>
              <p>
                We are actively working on bulk conversions, richer PDF tooling, image
                and media optimizations, and a universal converter that adapts options to
                your file type. We also plan to introduce team features that make it
                easier to collaborate securely and automate repetitive tasks.
              </p>
              <h3>Get Involved</h3>
              <p>
                Converto improves with your feedback. If you have a workflow suggestion,
                a new format request, or a feature idea, reach out. We prioritize
                usability and clarity and would love to learn how we can help you do your
                best work.
              </p>
            </article>
          </main>
        </div>
  );
}

