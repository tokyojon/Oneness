import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Star, Heart, Shield, Zap } from 'lucide-react'
import Image from 'next/image'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#121212] overflow-x-hidden font-sans text-slate-800 dark:text-slate-100">

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100 via-[#faf9f6] to-[#faf9f6] dark:from-stone-900 dark:via-[#121212] dark:to-[#121212] opacity-80" />
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-orange-300/20 to-pink-300/20 blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-300/20 to-purple-300/20 blur-[120px] animate-pulse-slow delay-1000" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">

          {/* Text Content */}
          <div className="flex-1 text-center md:text-left space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 border border-amber-200/50 dark:border-white/10 backdrop-blur-sm shadow-sm">
              <Star className="w-4 h-4 text-amber-500 mr-2 fill-amber-500" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Welcome to Oneness Kingdom</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-stone-800 to-stone-500 dark:from-white dark:to-stone-400">
                Unite in <br /> Harmony & Love
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed">
              A new digital nation built on the principles of peace, sustainability, and authentic connection. Join the movement today.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg hover:shadow-orange-500/25 transition-all text-lg font-bold">
                  Join the Kingdom <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-full border-2 border-stone-200 dark:border-stone-700 bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-lg font-medium">
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="pt-8 flex items-center justify-center md:justify-start gap-8 text-sm text-stone-500 dark:text-stone-400 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>sovereign Identity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Gift Economy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Global Community</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="flex-1 w-full max-w-lg md:max-w-none relative animate-fade-in-up delay-200">
            <div className="relative w-full aspect-square md:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/30 dark:border-white/10 bg-white/20 backdrop-blur-md">
              {/* Placeholder for a cool image or 3D element */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-blue-100/50 dark:from-stone-800/50 dark:to-stone-900/50 flex items-center justify-center">
                <span className="text-9xl opacity-20 select-none">OK</span>
              </div>
              {/* Abstract Shapes */}
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-pink-400/30 rounded-full blur-2xl animate-float-slow" />
              <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-blue-400/30 rounded-full blur-2xl animate-float-delayed" />
            </div>

            {/* Floating Card */}
            <div className="absolute bottom-10 -left-10 md:-left-20 bg-white dark:bg-stone-800 p-4 rounded-2xl shadow-xl border border-stone-100 dark:border-stone-700 w-64 animate-bounce-slow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Active Citizens</h3>
                  <p className="text-xs text-stone-500">Growing daily</p>
                </div>
              </div>
              <div className="h-2 w-full bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
                <div className="h-full w-[85%] bg-green-500 rounded-full" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative bg-white dark:bg-[#1a1614]">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Built for a New Era</h2>
            <p className="text-lg text-stone-600 dark:text-stone-400">
              Experience a platform where technology serves humanity, fostering genuine connection and collective prosperity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Sovereignty First', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Your data, your identity. You own your digital presence completely.' },
              { title: 'Gift Economy', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50', desc: 'Transactions based on gratitude and abundance, not just profit.' },
              { title: 'Conscious AI', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50', desc: 'AI tools designed to enhance human creativity and connection.' },
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-[#faf9f6] dark:bg-stone-900 border border-stone-100 dark:border-stone-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} dark:bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
