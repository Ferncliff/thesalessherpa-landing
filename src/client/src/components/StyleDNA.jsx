import React, { useState, useEffect } from 'react';
import { SparklesIcon, DocumentTextIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

const STORAGE_KEY = 'sherpa_style_dna';

function extractStyleDNA(emails) {
  const text = emails.join('\n\n');
  const lines = emails.map(e => e.trim()).filter(Boolean);

  // --- Greeting style ---
  const greetingPatterns = ['Hi ', 'Hello ', 'Hey ', 'Dear ', 'Good morning', 'Good afternoon', 'Hope this finds you'];
  const greetings = greetingPatterns.filter(g => text.toLowerCase().includes(g.toLowerCase()));
  const primaryGreeting = greetings[0] || 'Hi';

  // --- Length preference ---
  const avgWords = Math.round(
    lines.reduce((sum, e) => sum + e.split(/\s+/).length, 0) / lines.length
  );
  const lengthLabel = avgWords < 80 ? 'Short & punchy (< 80 words)' : avgWords < 150 ? 'Medium (80–150 words)' : 'Long-form (150+ words)';

  // --- Tone signals ---
  const casualSignals = ['hope', 'quick', 'just wanted', 'thought you', 'curious', 'honestly', 'actually', "i'd love", 'no pressure'];
  const formalSignals = ['pleased', 'per our', 'as discussed', 'pursuant', 'kindly', 'regarding', 'respectfully'];
  const casualCount = casualSignals.filter(s => text.toLowerCase().includes(s)).length;
  const formalCount = formalSignals.filter(s => text.toLowerCase().includes(s)).length;
  const tone = casualCount >= formalCount ? 'Conversational & direct' : 'Professional & formal';

  // --- CTA patterns ---
  const ctaPatterns = [
    { pattern: '15 minutes', label: '15-minute call ask' },
    { pattern: '30 minutes', label: '30-minute call ask' },
    { pattern: 'quick call', label: 'Quick call ask' },
    { pattern: 'worth a conversation', label: '"Worth a conversation" close' },
    { pattern: 'open to', label: '"Open to..." soft ask' },
    { pattern: 'makes sense', label: '"If this makes sense..." qualifier' },
    { pattern: 'reply', label: 'Simple reply ask' },
    { pattern: 'thoughts', label: '"Thoughts?" close' },
    { pattern: 'connect', label: 'Connection-first ask' },
  ];
  const foundCTAs = ctaPatterns.filter(c => text.toLowerCase().includes(c.pattern)).map(c => c.label);

  // --- Signature style ---
  const signoffs = ['Best', 'Thanks', 'Regards', 'Cheers', 'Talk soon', 'Looking forward', 'Appreciate'];
  const usedSignoffs = signoffs.filter(s => text.toLowerCase().includes(s.toLowerCase()));

  // --- Key phrases (find 2–4 word sequences that repeat) ---
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
  const bigramCounts = {};
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i].length > 3 && words[i + 1].length > 3) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      bigramCounts[bigram] = (bigramCounts[bigram] || 0) + 1;
    }
  }
  const stopWords = ['that the', 'and the', 'to the', 'of the', 'in the', 'for the', 'with the', 'this is', 'you are', 'would be', 'have been', 'will be'];
  const keyPhrases = Object.entries(bigramCounts)
    .filter(([phrase, count]) => count > 1 && !stopWords.includes(phrase))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([phrase]) => phrase);

  // --- Question frequency ---
  const questionCount = (text.match(/\?/g) || []).length;
  const questionStyle = questionCount === 0 ? 'Declarative (no questions)' : questionCount <= 2 ? 'Light use of questions' : 'Question-heavy style';

  // --- Name use ---
  const usesFirstName = text.match(/Hi \w+,|Hello \w+,|Hey \w+,/i) !== null;

  return {
    greeting: primaryGreeting,
    tone,
    length: lengthLabel,
    avgWords,
    ctas: foundCTAs.length > 0 ? foundCTAs : ['Direct ask / no soft qualifier'],
    signoff: usedSignoffs[0] || 'Best',
    keyPhrases,
    questionStyle,
    usesFirstName,
    emailCount: lines.length,
    extractedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };
}

export default function StyleDNA() {
  const [emails, setEmails] = useState(['', '', '']);
  const [dna, setDna] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setDna(JSON.parse(stored)); } catch (e) {}
    }
  }, []);

  const handleAnalyze = () => {
    const filled = emails.filter(e => e.trim().length > 20);
    if (filled.length < 1) {
      alert('Paste at least one email sample (20+ characters) to extract your Style DNA.');
      return;
    }
    setAnalyzing(true);
    setTimeout(() => {
      const result = extractStyleDNA(filled);
      setDna(result);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      setAnalyzing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1400);
  };

  const handleClear = () => {
    if (window.confirm('Clear your Style DNA profile? This cannot be undone.')) {
      setDna(null);
      setEmails(['', '', '']);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const addEmailSlot = () => setEmails([...emails, '']);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <SparklesIcon className="h-7 w-7 text-orange-500" />
            <h1 className="text-2xl font-bold text-slate-900">Style DNA</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            We extract your Style DNA so every draft sounds like <span className="font-semibold text-orange-600">you</span>, not a template.
          </p>
        </div>
        {dna && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="text-green-700 text-sm font-semibold">DNA Active</span>
            <span className="text-green-500 text-xs ml-1">· {dna.emailCount} emails analyzed · {dna.extractedAt}</span>
          </div>
        )}
      </div>

      {/* Active DNA Profile */}
      {dna && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">Your Style DNA Profile</h2>
              <p className="text-orange-100 text-sm">Applied to all generated drafts</p>
            </div>
            <button
              onClick={handleClear}
              className="text-orange-200 hover:text-white transition-colors flex items-center gap-1 text-sm"
            >
              <TrashIcon className="h-4 w-4" />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <DNACard label="Greeting Style" value={dna.greeting + '[First Name],'} icon="👋" />
            <DNACard label="Tone" value={dna.tone} icon="🎯" />
            <DNACard label="Length Preference" value={dna.length} sub={`avg ${dna.avgWords} words`} icon="📏" />
            <DNACard label="Question Style" value={dna.questionStyle} icon="❓" />
            <DNACard label="Sign-off" value={dna.signoff} icon="✍️" />
            <DNACard label="Uses First Name" value={dna.usesFirstName ? 'Yes — personalizes greeting' : 'No — generic opening'} icon="👤" />
          </div>

          {dna.ctas.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">CTA Patterns</p>
              <div className="flex flex-wrap gap-2">
                {dna.ctas.map((cta, i) => (
                  <span key={i} className="bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-3 py-1 text-xs font-medium">
                    {cta}
                  </span>
                ))}
              </div>
            </div>
          )}

          {dna.keyPhrases.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Your Signature Phrases</p>
              <div className="flex flex-wrap gap-2">
                {dna.keyPhrases.map((phrase, i) => (
                  <span key={i} className="bg-slate-50 text-slate-700 border border-slate-200 rounded-full px-3 py-1 text-xs font-medium capitalize">
                    "{phrase}"
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email Input Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3">
          <DocumentTextIcon className="h-5 w-5 text-slate-400" />
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {dna ? 'Update Your Style DNA' : 'Paste Your Prospecting Emails'}
            </h2>
            <p className="text-slate-500 text-sm">
              Paste 3–5 of your best outbound emails below. The more you paste, the more accurate your DNA.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {emails.map((email, idx) => (
            <div key={idx}>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Sample {idx + 1} {idx < 3 ? '' : '(optional)'}
              </label>
              <textarea
                className="w-full h-32 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
                placeholder={
                  idx === 0
                    ? "Hi [First Name], I was looking at [Company]'s recent expansion into..."
                    : idx === 1
                    ? "Hope this finds you well — I wanted to reach out because..."
                    : "Paste another email you're proud of here..."
                }
                value={email}
                onChange={e => {
                  const updated = [...emails];
                  updated[idx] = e.target.value;
                  setEmails(updated);
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={addEmailSlot}
            className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            + Add another email
          </button>

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Extracting DNA...
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                {dna ? 'Re-extract Style DNA' : 'Extract My Style DNA'}
              </>
            )}
          </button>
        </div>

        {saved && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <CheckCircleIcon className="h-5 w-5" />
            Style DNA saved — all future drafts will match your voice.
          </div>
        )}
      </div>

      {/* How it works */}
      {!dna && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-orange-800 mb-3">How Style DNA works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Paste your emails', desc: 'Drop in 3–5 of your real outbound emails — the ones you\'re proud of.' },
              { step: '2', title: 'We extract your DNA', desc: 'Sherpa analyzes tone, length, CTAs, greetings, and signature phrases.' },
              { step: '3', title: 'Every draft sounds like you', desc: 'No more templates that sound like everyone else. Your voice, every time.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                  {step}
                </div>
                <div>
                  <p className="text-orange-900 font-semibold text-sm">{title}</p>
                  <p className="text-orange-700 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DNACard({ label, value, sub, icon }) {
  return (
    <div className="px-6 py-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{icon} {label}</p>
      <p className="text-slate-800 font-semibold text-sm">{value}</p>
      {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}
