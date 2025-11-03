import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CheckCircle2, Heart, Users, BrainCircuit } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');
  const feature1Image = PlaceHolderImages.find(p => p.id === 'feature-1');
  const feature2Image = PlaceHolderImages.find(p => p.id === 'feature-2');
  const feature3Image = PlaceHolderImages.find(p => p.id === 'feature-3');

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white">
        {heroImage && (
            <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                priority
                data-ai-hint={heroImage.imageHint}
            />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-4 max-w-4xl mx-auto animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
            Welcome to the Oneness Kingdom
          </h1>
          <p className="text-lg md:text-2xl text-primary-foreground/90 mb-8">
            A new social model based on contribution, connection, love, peace, and harmony.
          </p>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-300 hover:scale-105">
            <Link href="/register">Join our kingdom</Link>
          </Button>
        </div>
      </section>

      <section id="features" className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">A Meta-Social Platform of Love and Contribution</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We are building a new international community state where value is not defined by economic or military power, but by love and connection.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Contribute & Connect"
              description="Your actions of love, learning, and contribution are visualized and circulated as value within our community."
              image={feature1Image}
            />
            <FeatureCard
              title="Build a Human Network"
              description="Create meaningful relationships through follows, evaluations, recommendations, and even form digital family bonds."
              image={feature2Image}
            />
            <FeatureCard
              title="AI-Powered Community"
              description="Our platform uses AI for fair matching, recommendations, and to ensure the safety and harmony of our kingdom."
              image={feature3Image}
            />
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">How to Become a Citizen</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Follow these simple steps to start your journey in the Oneness Kingdom.
            </p>
          </div>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <Step
              step="1"
              title="Register Your Account"
              description="Create your profile and begin your journey towards oneness."
            />
            <Step
              step="2"
              title="AI-Powered Verification"
              description="Secure your identity with our advanced, AI-enhanced verification process."
            />
            <Step
              step="3"
              title="Contribute & Flourish"
              description="Engage with the community, share your gifts, and grow within the kingdom."
            />
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">Ready to Change the World?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Join a global movement dedicated to creating a society built on the foundations of love, peace, and harmony. Your journey starts now.
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-300 hover:scale-105">
                <Link href="/register">Start Your Journey</Link>
            </Button>
        </div>
      </section>
    </div>
  );
}

const FeatureCard = ({ title, description, image }: { title: string; description: string; image?: { imageUrl: string; description: string; imageHint: string } }) => (
  <Card className="text-center bg-card shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-2">
    <CardHeader className="items-center">
      {image && (
        <div className="relative w-full h-40 mb-4 rounded-t-lg overflow-hidden">
          <Image src={image.imageUrl} alt={image.description} layout="fill" objectFit="cover" data-ai-hint={image.imageHint} />
        </div>
      )}
      <CardTitle className="font-headline text-2xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const Step = ({ step, title, description }: { step: string; title: string; description: string }) => (
  <div className="flex flex-col items-center">
    <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4 border-4 border-background shadow-lg">
      {step}
    </div>
    <h3 className="text-xl font-headline font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);
