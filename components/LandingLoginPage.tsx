import { FeatureCard } from "@/components/FeatureCard"
import { LoginCard } from "@/components/LoginCard"
import { Logo } from "@/components/Logo"
import { ThemeToggle } from "@/components/ThemeToggle"
import { landingFeatures } from "@/constants/features"

export function LandingLoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <img
        src="/auth-engineering-bg.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-105 object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-background/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/62 via-background/32 to-background/78" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/72 via-transparent to-background/20" />
      <div className="absolute right-6 top-6 z-20 sm:right-8 sm:top-8">
        <ThemeToggle />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1420px] gap-8 px-6 py-7 sm:px-8 lg:grid-cols-[1.28fr_0.9fr] lg:items-center lg:gap-12 lg:px-10">
        <section className="flex flex-col py-2">
          <div className="animate-fade-in">
            <Logo />

            <div className="mt-9 max-w-4xl md:mt-11">
              <div className="space-y-3.5">
                <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-[4.75rem]">
                  OJT Companion
                </h1>
                <p className="max-w-3xl text-lg font-medium leading-relaxed text-muted-foreground sm:text-xl">
                  Operation Apprentice Development Program 2026
                </p>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground/90">
                  An integrated learning platform designed to help OADP participants manage competency progress,
                  weekly activities, technical documentation, and operational knowledge development in a more structured
                  way.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 grid max-w-[820px] gap-4 sm:grid-cols-2">
            {landingFeatures.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center pb-8 lg:justify-end lg:pb-0">
          <LoginCard />
        </section>
      </div>
    </main>
  )
}
