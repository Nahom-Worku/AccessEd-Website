import Link from 'next/link'
import {
  FileText, Search, CheckCircle, Upload, FlaskConical, MessageSquare,
  ClipboardCheck, BarChart3, BookOpen, RefreshCw, Lock, Shield, Smartphone,
  Trophy, Building2, Cpu, ArrowRight, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const APP_STORE_URL = 'https://apps.apple.com/us/app/accessed/id6758074938'

const features = [
  {
    icon: FileText,
    title: 'Document-Aware Intelligence',
    description: "Your documents aren't just uploaded. They're indexed, embedded, and mapped for precise retrieval. Every answer traces back to an exact page.",
    capabilities: [
      'Page-level citations you can tap to verify',
      'Printed-to-PDF page number alignment',
      'Per-document isolation for secure retrieval',
      'Multi-document course-level search',
    ],
    visual: {
      label: 'Retrieval Pipeline',
      color: '#F28C28',
      steps: [
        { icon: Upload, title: 'Upload PDF', sub: 'Text extraction + chunking' },
        { icon: FlaskConical, title: 'Semantic Embedding', sub: 'Vector representations per chunk' },
        { icon: Search, title: 'Context Retrieval', sub: 'Most relevant passages found' },
        { icon: CheckCircle, title: 'Verified Answer', sub: 'Cited response with page numbers' },
      ],
    },
  },
  {
    icon: BarChart3,
    title: 'Dynamic Knowledge Graph',
    description: "AccessEd doesn't rely on predefined topics. It extracts concepts directly from your questions and builds a living model of what you know and what you don't.",
    capabilities: [
      'Real-time proficiency tracking per concept',
      'Novice to Expert tier evolution',
      'Weak concept detection and prioritization',
      'Cross-document knowledge mapping',
    ],
    visual: {
      label: 'Knowledge Model',
      color: '#3B82F6',
      proficiency: [
        { name: 'Binary Trees', value: 92, color: '#22C55E', tier: 'Expert', tierBg: '#F0FDF4', tierColor: '#16A34A' },
        { name: 'Graph Theory', value: 68, color: '#3B82F6', tier: 'Skilled', tierBg: '#EFF6FF', tierColor: '#2563EB' },
        { name: 'Recursion', value: 45, color: '#F28C28', tier: 'Building', tierBg: '#FEF3E2', tierColor: '#C45A0E' },
        { name: 'Dynamic Prog.', value: 20, color: '#EF4444', tier: 'Novice', tierBg: '#FEF2F2', tierColor: '#DC2626' },
      ],
    },
    reversed: true,
  },
  {
    icon: ClipboardCheck,
    title: 'Adaptive Quiz Engine',
    description: "Quizzes aren't random. They're generated based on your weaknesses, weighted by how recently you've studied each concept, and scored to update your proficiency in real time.",
    capabilities: [
      'Weakness-driven question selection',
      'Difficulty-aware scoring adjustments',
      'Concept clustering across documents',
      'Wrong-answer re-testing in future sessions',
    ],
    visual: {
      label: 'Quiz Intelligence',
      color: '#8B5CF6',
      steps: [
        { icon: BarChart3, title: 'Detect weak concepts', sub: 'From quiz history + knowledge graph' },
        { icon: FlaskConical, title: 'Weight question pool', sub: 'Prioritize struggling areas' },
        { icon: BarChart3, title: 'Update proficiency', sub: 'Real-time mastery adjustments' },
      ],
    },
  },
  {
    icon: BookOpen,
    title: 'Mistake Journal',
    description: 'Every wrong answer is captured, not discarded. Your Mistake Journal builds a persistent record of what tripped you up, so you can revisit, relearn, and close the gap.',
    capabilities: [
      'Every incorrect answer logged with context',
      'Mistakes resurface in future quiz sessions',
      'Proficiency updates when you correct past errors',
      'Clear view of recurring weak spots',
    ],
    visual: {
      label: 'Mistake Tracking',
      color: '#EF4444',
      steps: [
        { icon: FileText, title: 'Wrong answer captured', sub: 'Question, your answer, and correct answer saved' },
        { icon: RefreshCw, title: 'Re-tested automatically', sub: 'Same concept appears in next quiz' },
        { icon: CheckCircle, title: 'Corrected and updated', sub: 'Proficiency rises when you get it right' },
      ],
    },
    reversed: true,
  },
]

const pipeline = [
  { num: 1, title: 'Upload PDF', desc: 'Drop your textbook, lecture notes, or slides' },
  { num: 2, title: 'Index & Embed', desc: 'Semantic embeddings for accurate retrieval' },
  { num: 3, title: 'Ask Anything', desc: 'Citation-verified answers from your documents' },
  { num: 4, title: 'Extract Concepts', desc: 'Topics detected from your conversations' },
  { num: 5, title: 'Adaptive Quizzes', desc: 'Questions targeted at your weak spots' },
  { num: 6, title: 'Track Mastery', desc: 'Real-time proficiency updates per concept' },
]

const recognition = [
  { icon: Trophy, title: 'Swift Student Challenge 2025', desc: 'Distinguished Winner' },
  { icon: Building2, title: 'Demoed at Apple Park', desc: 'Cupertino, CA' },
  { icon: Smartphone, title: 'Built in SwiftUI', desc: 'Native iOS experience' },
  { icon: Cpu, title: 'On-Device + Cloud AI', desc: 'Dual intelligence architecture' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#111111]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/92 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-[1120px] mx-auto px-8 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-[22px] font-extrabold tracking-tight">
            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
              <span className="text-amber-500 font-bold text-lg">A</span>
            </div>
            AccessEd
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-semibold">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#111] text-white hover:bg-[#333] rounded-xl px-5">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-40 pb-24 text-center">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="inline-flex items-center gap-2.5 text-xs font-bold text-[#C45A0E] uppercase tracking-[1.5px] mb-7">
            <span className="w-6 h-px bg-[#F28C28]/50" />
            Master Your Materials
            <span className="w-6 h-px bg-[#F28C28]/50" />
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-[80px] font-black leading-[1.05] tracking-[-3px] mb-7">
            Your PDFs.<br />Your <span className="text-[#F28C28]">Learning Engine.</span>
          </h1>
          <p className="text-xl text-[#555] max-w-[620px] mx-auto mb-5 leading-relaxed">
            AccessEd transforms your documents into a personalized study system with page-verified answers, adaptive quizzes, and real-time mastery tracking.
          </p>
          <p className="text-sm text-[#888] mb-12">
            Built by an <strong className="text-[#555]">Apple Swift Student Challenge Distinguished Winner</strong>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="xl" className="bg-[#111] text-white hover:bg-[#333] rounded-2xl px-10 py-5 text-[17px] font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                <ArrowRight className="h-5 w-5 mr-2" />
                Try the Web App
              </Button>
            </Link>
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="xl" className="rounded-2xl px-10 py-5 text-[17px] font-semibold">
                Download for iOS
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features - A Different Kind of Study System */}
      <section className="py-28">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C45A0E] uppercase tracking-[2px] mb-4">
              <span className="w-5 h-0.5 bg-[#F28C28]" />
              Under the Hood
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-[-1.5px] leading-[1.15] mb-5">
              A Different Kind of<br />Study System
            </h2>
            <p className="text-lg text-[#555] max-w-[560px] mx-auto">
              AccessEd isn&apos;t a chatbot wrapped around your files. It&apos;s an architecture built for learning.
            </p>
          </div>

          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`grid md:grid-cols-2 gap-20 items-center mb-24 last:mb-0 ${feature.reversed ? 'md:[direction:rtl]' : ''}`}
            >
              <div className={feature.reversed ? 'md:[direction:ltr]' : ''}>
                <div className="w-12 h-12 rounded-[14px] bg-[#FEF3E2] flex items-center justify-center mb-5">
                  <feature.icon className="h-6 w-6 text-[#F28C28]" />
                </div>
                <h3 className="text-[28px] font-extrabold tracking-[-0.5px] mb-4 leading-[1.2]">
                  {feature.title}
                </h3>
                <p className="text-base text-[#555] leading-[1.7] mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.capabilities.map((cap, i) => (
                    <li key={i} className="flex items-center gap-3 text-[15px] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28] flex-shrink-0" />
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`flex justify-center ${feature.reversed ? 'md:[direction:ltr]' : ''}`}>
                <div className="w-full max-w-[440px] bg-[#FAFAF8] border border-[#E8E8E5] rounded-3xl p-10">
                  <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#E8E8E5]">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: feature.visual.color }} />
                    <span className="text-xs font-semibold text-[#888] uppercase tracking-[1px]">
                      {feature.visual.label}
                    </span>
                  </div>
                  {'proficiency' in feature.visual ? (
                    <div className="space-y-4">
                      {feature.visual.proficiency!.map((p, i) => (
                        <div key={i} className="flex items-center gap-3.5">
                          <span className="text-[13px] font-semibold w-[120px] flex-shrink-0">{p.name}</span>
                          <div className="flex-1 h-2 bg-[#E8E8E5] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${p.value}%`, backgroundColor: p.color }} />
                          </div>
                          <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded" style={{ backgroundColor: p.tierBg, color: p.tierColor }}>
                            {p.tier}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {feature.visual.steps!.map((step, i) => (
                        <div key={i} className="flex items-start gap-3.5 py-3.5 border-t first:border-t-0 border-black/[0.04]">
                          <div className="w-9 h-9 rounded-[10px] bg-[#FEF3E2] flex items-center justify-center flex-shrink-0">
                            <step.icon className="h-[18px] w-[18px] text-[#F28C28]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{step.title}</p>
                            <p className="text-xs text-[#888] mt-0.5">{step.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline - How It Works */}
      <section className="py-28 bg-[#FAFAF8]">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C45A0E] uppercase tracking-[2px] mb-4">
              <span className="w-5 h-0.5 bg-[#F28C28]" />
              How It Works
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-[-1.5px] leading-[1.15] mb-5">
              From Static PDF to<br />Living Learning System
            </h2>
            <p className="text-lg text-[#555]">
              Six steps between your upload and mastery. All of it happens automatically.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {pipeline.map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-10 h-10 rounded-full bg-[#F28C28] text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                  {step.num}
                </div>
                <h4 className="font-bold text-sm mb-1.5">{step.title}</h4>
                <p className="text-xs text-[#888] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="py-28">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C45A0E] uppercase tracking-[2px] mb-4">
                <span className="w-5 h-0.5 bg-[#F28C28]" />
                Privacy First
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-[-1.5px] leading-[1.15] mb-5">
                Designed with<br />Privacy in Mind
              </h2>
              <p className="text-base text-[#555] leading-[1.7] mb-8">
                Your study materials are personal. AccessEd is built so your data stays yours. Isolated, encrypted, and never shared.
              </p>
              <div className="space-y-6">
                {[
                  { icon: Lock, title: 'Document Isolation', desc: 'Your files are isolated per user. No cross-user data mixing, ever.' },
                  { icon: Shield, title: 'Secure Validation', desc: 'File hashing and validation before any processing begins.' },
                  { icon: Smartphone, title: 'On-Device AI', desc: "Study offline with Apple's on-device models. Your data never leaves your phone." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FEF3E2] flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-[#F28C28]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                      <p className="text-sm text-[#888]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-48 h-48 rounded-full bg-[#FEF3E2] flex items-center justify-center">
                <Shield className="h-24 w-24 text-[#F28C28]/60" strokeWidth={1} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recognition */}
      <section className="py-28 bg-[#FAFAF8]">
        <div className="max-w-[1120px] mx-auto px-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C45A0E] uppercase tracking-[2px] mb-4">
            <span className="w-5 h-0.5 bg-[#F28C28]" />
            Recognition
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-[-1.5px] mb-12">
            Built for the Future of Learning
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {recognition.map((item, i) => (
              <div key={i} className="bg-white border border-[#E8E8E5] rounded-2xl p-6 text-center">
                <item.icon className="h-8 w-8 mx-auto mb-4 text-[#555]" />
                <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-[#888]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 text-center">
        <div className="max-w-[1120px] mx-auto px-8">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-[-1.5px] mb-5">
            Start mastering your<br />materials today.
          </h2>
          <p className="text-lg text-[#555] mb-10">
            Upload your first document and see the difference a real learning system makes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="xl" className="bg-[#111] text-white hover:bg-[#333] rounded-2xl px-10 py-5 text-[17px] font-semibold shadow-lg">
                <ArrowRight className="h-5 w-5 mr-2" />
                Get Started Free
              </Button>
            </Link>
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="xl" className="rounded-2xl px-10 py-5 text-[17px] font-semibold">
                Download for iOS
              </Button>
            </a>
          </div>
          <p className="text-sm text-[#888] mt-6">Free to start. No credit card required.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-[#E8E8E5]">
        <div className="max-w-[1120px] mx-auto px-8 text-center">
          <div className="flex justify-center gap-8 mb-4">
            <Link href="/terms" className="text-sm text-[#888] hover:text-[#111]">Terms of Service</Link>
            <Link href="/privacy" className="text-sm text-[#888] hover:text-[#111]">Privacy Policy</Link>
            <Link href="/support" className="text-sm text-[#888] hover:text-[#111]">Support</Link>
          </div>
          <p className="text-xs text-[#BBB]">&copy; 2026 AccessEd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
