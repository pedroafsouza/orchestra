import SectionWrapper from './ui/SectionWrapper';
import WaitlistForm from './WaitlistForm';

export default function FinalCta() {
  return (
    <SectionWrapper className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-purple-600/10 to-accent/10 blur-2xl" />
      <div className="relative text-center">
        <h2 className="text-3xl font-bold text-white md:text-4xl">
          Ready to build your next app?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/50">
          Join the waitlist and be the first to experience Orchestra when we
          launch.
        </p>
        <div className="mt-8 flex justify-center">
          <WaitlistForm />
        </div>
      </div>
    </SectionWrapper>
  );
}
