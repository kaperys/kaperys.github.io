import Head from "next/head";
import Header from "@/components/Header";
import Link from "next/link";

export default function Trust() {
  return <>
    <Head><title>The Trust Equation</title></Head>
    <Header title="The Trust Equation"></Header>
    <main className="md:w-1/2">
        <p className="font-mono">Trust is a critical part of healthy relationships and great culture - both of which are required for success. In 2000, Charles H. Green, founder of <Link className="font-bold" href="https://trustedadvisor.com/why-trust-matters/understanding-trust/understanding-the-trust-equation">The Trusted Advisor</Link>, created The Trust Equation, which defines the components of trustworthiness. Here&apos;s the equation:</p>

        <h2 className="font-sans text-2xl mt-8 mb-8">T = (C + R + I) ÷ S</h2>

        <h3 className="font-sans text-xl mt-8">T = Trustworthiness</h3>
        <p className="font-mono">Trustworthiness is how others perceive your integrity, ability, and consistency - it&apos;s what makes people comfortable relying on you.</p>

        <h3 className="font-sans text-xl mt-8">C = Credibility</h3>
        <p className="font-mono italic">&quot;Do they know what they&apos;re talking about?&quot;</p>
        <p className="font-mono">In engineering teams, credibility comes from technical skill, clear communication, and sound judgment. You build it by explaining decisions transparently, sharing reasoning, and admitting when you don&apos;t know something.</p>

        <h3 className="font-sans text-xl mt-8">R = Reliability</h3>
        <p className="font-mono italic">&quot;Can I count on them to follow through?&quot;</p>
        <p className="font-mono">This is about consistency and dependability. Engineers earn reliability by doing what they say they&apos;ll do - meeting commitments, delivering quality work, and communicating early when priorities shift.</p>

        <h3 className="font-sans text-xl mt-8">I = Intimacy</h3>
        <p className="font-mono italic">&quot;Can I be open with them?&quot;</p>
        <p className="font-mono">Intimacy is psychological safety and openness. In a team, this means showing empathy, listening actively, and creating space for honest discussions - especially when things go wrong!</p>

        <h3 className="font-sans text-xl mt-8">S = Self-orientation</h3>
        <p className="font-mono italic">&quot;Who&apos;s interests come first?&quot;</p>
        <p className="font-mono">High self-orientation erodes trust. In software teams, that looks like optimizing for personal wins over team success. Low self-orientation means focusing on shared outcomes, helping others succeed, and prioritizing the collective good.</p>
    </main>
  </>
}
