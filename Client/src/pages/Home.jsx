import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main>
      <Hero />
    </main>
  );
}

// hero content
const Hero = () => (
<section className="hero">
  <div className="hero_layout">
    <div className="hero_text">
      <h1 className="hero_title">Welcome to MovieFinder+</h1>
      <p className="hero_subtitle">Your next favorite movie is just a search away. Happy watching!</p>
    </div>
  </div>
</section>
);
