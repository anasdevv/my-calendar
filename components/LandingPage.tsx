'use client';
import { SignIn, useUser } from '@clerk/nextjs';
import { neobrutalism } from '@clerk/themes';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const mainRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const planningImageRef = useRef<HTMLDivElement>(null);
  const signInRef = useRef<HTMLDivElement>(null);
  const floatingElements = useRef<HTMLDivElement[]>([]);
  const { isLoaded } = useUser();
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([logoRef.current, titleRef.current, subtitleRef.current], {
        opacity: 0,
        y: 50,
      });

      gsap.set(planningImageRef.current, {
        opacity: 0,
        y: -200,
      });

      gsap.set(signInRef.current, {
        opacity: 0,
        x: -300,
      });

      floatingElements.current.forEach((el, index) => {
        if (el) {
          gsap.set(el, {
            rotation: Math.random() * 360,
            scale: 0.5 + Math.random() * 0.5,
          });

          gsap.to(el, {
            y: 'random(-20, 20)',
            x: 'random(-20, 20)',
            rotation: '+=360',
            duration: 4 + Math.random() * 4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: index * 0.5,
          });
        }
      });

      const tl = gsap.timeline();

      tl.to(logoRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'back.out(1.7)',
      })
        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
          },
          '-=0.6'
        )
        .to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.4'
        )
        .to(
          planningImageRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: 'bounce.out',
          },
          '+=2'
        )
        .to(
          signInRef.current,
          {
            opacity: 1,
            x: 0,
            duration: 1.2,
            ease: 'power3.out',
          },
          '-=1'
        );

      gsap.to(logoRef.current, {
        y: -50,
        scrollTrigger: {
          trigger: mainRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      gsap.to(planningImageRef.current, {
        y: -30,
        rotation: 5,
        scrollTrigger: {
          trigger: planningImageRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const deltaX = (clientX - centerX) / centerX;
        const deltaY = (clientY - centerY) / centerY;

        gsap.to(logoRef.current, {
          x: deltaX * 10,
          y: deltaY * 10,
          duration: 0.5,
          ease: 'power2.out',
        });

        gsap.to(planningImageRef.current, {
          x: deltaX * -15,
          y: deltaY * -15,
          duration: 0.7,
          ease: 'power2.out',
        });

        gsap.to(signInRef.current, {
          x: deltaX * 8,
          y: deltaY * 8,
          duration: 0.6,
          ease: 'power2.out',
        });

        floatingElements.current.forEach((el, index) => {
          if (el) {
            gsap.to(el, {
              x: deltaX * (5 + index * 2),
              y: deltaY * (5 + index * 2),
              duration: 0.8,
              ease: 'power2.out',
            });
          }
        });
      };

      window.addEventListener('mousemove', handleMouseMove);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            ref={el => {
              if (el) floatingElements.current[i] = el;
            }}
            className="absolute opacity-10"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
          >
            <Image
              src="/schedule.svg"
              width={60 + Math.random() * 40}
              height={60 + Math.random() * 40}
              alt="Floating decoration"
              className="filter blur-sm"
            />
          </div>
        ))}
        {[...Array(4)].map((_, i) => (
          <div
            key={`events-${i}`}
            ref={el => {
              if (el) floatingElements.current[i + 6] = el;
            }}
            className="absolute opacity-5"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
          >
            <Image
              src="/events.svg"
              width={40 + Math.random() * 60}
              height={40 + Math.random() * 60}
              alt="Floating decoration"
              className="filter blur-md"
            />
          </div>
        ))}
      </div>

      <main
        ref={mainRef}
        className="relative z-10 min-h-screen flex justify-center items-center p-10 gap-24 max-md:flex-col bg-gradient-to-br from-background via-background to-muted/20"
      >
        <section className="flex flex-col items-center relative">
          <div
            ref={logoRef}
            className="relative group cursor-pointer"
            onMouseEnter={() => {
              gsap.to(logoRef.current, {
                scale: 1.1,
                rotation: 5,
                duration: 0.3,
                ease: 'power2.out',
              });
            }}
            onMouseLeave={() => {
              gsap.to(logoRef.current, {
                scale: 1,
                rotation: 0,
                duration: 0.3,
                ease: 'power2.out',
              });
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Image
              src="/logo2.svg"
              width={300}
              height={300}
              alt="Logo"
              className="relative z-10 drop-shadow-2xl"
            />
          </div>

          <h1
            ref={titleRef}
            className="text-4xl font-black lg:text-6xl text-center bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent mt-8"
            style={{
              backgroundSize: '200% 100%',
              animation: 'gradient-shift 3s ease-in-out infinite',
            }}
          >
            Your time, perfectly planned
          </h1>

          <p
            ref={subtitleRef}
            className="font-light text-lg lg:text-xl text-muted-foreground text-center max-w-2xl mt-6 leading-relaxed"
          >
            Join millions of professionals who easily book meetings with the #1
            scheduling tool. Experience seamless time management like never
            before.
          </p>

          {/* Animated Planning Image */}
          <div
            ref={planningImageRef}
            className="relative mt-12 group"
            onMouseEnter={() => {
              gsap.to(planningImageRef.current, {
                scale: 1.05,
                duration: 0.4,
                ease: 'power2.out',
              });
            }}
            onMouseLeave={() => {
              gsap.to(planningImageRef.current, {
                scale: 1,
                duration: 0.4,
                ease: 'power2.out',
              });
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Image
              src="/planning.svg"
              width={500}
              height={500}
              alt="Planning illustration"
              className="relative z-10 drop-shadow-xl filter group-hover:drop-shadow-2xl transition-all duration-300"
            />
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-10 -left-10 opacity-30">
            <Image
              src="/meeting.svg"
              width={80}
              height={80}
              alt="Meeting decoration"
              className="animate-pulse"
            />
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-20">
            <Image
              src="/events.svg"
              width={100}
              height={100}
              alt="Events decoration"
              className="animate-bounce"
            />
          </div>
        </section>

        {/* Sign In Section */}
        <div
          ref={signInRef}
          className="relative group"
          onMouseEnter={() => {
            gsap.to(signInRef.current, {
              scale: 1.02,
              duration: 0.3,
              ease: 'power2.out',
            });
          }}
          onMouseLeave={() => {
            gsap.to(signInRef.current, {
              scale: 1,
              duration: 0.3,
              ease: 'power2.out',
            });
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-2xl min-w-[340px] min-h-[420px] flex items-center justify-center">
            {/* Loading Skeleton */}
            {!isLoaded ? (
              <div
                id="signin-skeleton"
                className="absolute inset-0 flex flex-col gap-4 items-center justify-center animate-pulse z-0 pointer-events-none"
                style={{ display: 'block' }}
              >
                <div className="w-24 h-24 rounded-full bg-muted/60 mb-4" />
                <div className="w-40 h-6 rounded bg-muted/50 mb-2" />
                <div className="w-32 h-4 rounded bg-muted/40 mb-2" />
                <div className="w-48 h-10 rounded bg-muted/30" />
              </div>
            ) : (
              <div className="w-full" style={{ zIndex: 1 }} id="signin-content">
                <SignIn
                  routing="hash"
                  appearance={{
                    baseTheme: neobrutalism,
                    elements: {
                      rootBox: 'shadow-2xl',
                      card: 'bg-background/80 backdrop-blur-md border-0 shadow-none',
                    },
                  }}
                />
              </div>
            )}

            {/* Clerk SignIn */}
          </div>
        </div>
      </main>
    </>
  );
}
