import GradientBlob from './ui/GradientBlob';
import WaitlistForm from './WaitlistForm';

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-32 md:pb-32 md:pt-44">
      <GradientBlob className="-right-40 -top-40 h-[600px] w-[600px]" />
      <GradientBlob className="-left-60 top-20 h-[500px] w-[500px] opacity-50" />

      <div className="relative mx-auto max-w-4xl text-center">
        <h1 className="bg-gradient-to-r from-white via-white to-accent bg-clip-text text-5xl font-extrabold leading-tight tracking-tight text-transparent md:text-7xl">
          Build native mobile apps from a prompt
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 md:text-xl">
          Describe your app in plain English. Orchestra builds real,
          server-driven native screens — and deploys them instantly. No React
          Native. No Flutter. Just ship.
        </p>
        <div id="waitlist" className="mt-10 flex justify-center">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
