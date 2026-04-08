import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

const FAQS = [
  {
    q: "How do I post a task?",
    a: "Click on the '+' icon in the bottom navigation bar (Task) to post a task. Provide details like duration, location, and the price you're offering."
  },
  {
    q: "How do I become a professional?",
    a: "During registration, you can toggle 'I am a Professional' and upload your portfolio or testimonial to verify your skills."
  },
  {
    q: "How do I communicate with someone?",
    a: "Once someone accepts your task or you accept theirs, you can chat directly inside the app using the messages tab."
  },
  {
    q: "What kind of tasks can I post?",
    a: "You can post anything from cleaning, local delivery, assembly, gardening, to pet care. Just make sure it is legal and safe."
  }
];

export default function HelpSupportPage() {
  return (
    <div className="min-h-dvh bg-surface text-on-surface">
      <TopBar title="Help & Support" showBack={true} showMenu={false} />

      <main className="pt-24 pb-16 px-6 max-w-2xl mx-auto space-y-8">
        {/* Contact Support */}
        <section className="bg-surface-container-low rounded-xl p-8 card-shadow text-center border-t-4 border-primary">
          <span className="material-symbols-outlined text-4xl text-primary mb-2">support_agent</span>
          <h2 className="text-2xl font-bold font-headline mb-3 text-on-surface">Need further assistance?</h2>
          <p className="text-on-surface-variant mb-6">
            If you couldn't find the answer to your question in our FAQs, please feel free to reach out to our dedicated support team directly via email.
          </p>
          <a href="mailto:tasksnaphelp@gmail.com" className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-md">
            <span className="material-symbols-outlined text-[20px]">mail</span>
            tasksnaphelp@gmail.com
          </a>
        </section>

        {/* FAQs */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold uppercase tracking-wider text-on-surface-variant px-1">Frequently Asked Questions</h3>
          
          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="bg-surface-container-lowest p-5 rounded-lg border border-surface-container-highest/20 shadow-sm">
                <h4 className="font-bold text-lg text-on-surface flex items-start gap-2 font-headline">
                  <span className="text-primary mt-0.5">•</span>
                  {faq.q}
                </h4>
                <p className="text-on-surface-variant mt-2 ml-4 font-medium">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
