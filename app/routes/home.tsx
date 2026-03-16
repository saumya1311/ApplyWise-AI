import ResumeCard from "~/components/ResumeCard";
import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import { resumes } from "~/../constants";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  return (
    <main className="bg-[url('/images/bg-main.png')] bg-cover min-h-screen pt-0">
      <Navbar />

      <section className="main-section px-4 sm:px-10">
        <div className="page-heading py-10">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#33334d] mb-4">
            <span className="block animate-reveal delay-100">Resume Check.</span>
            <span className="block animate-reveal delay-300">Application Track.</span>
            <span className="block animate-reveal delay-500 font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Stress Less.</span>
          </h1>
        </div>

        <div className="resumes-section mt-8 animate-reveal delay-500">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      </section>
    </main>
  );
}