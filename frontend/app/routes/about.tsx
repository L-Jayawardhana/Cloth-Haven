import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About Us - Cloth Haven" },
    { name: "description", content: "Learn more about Cloth Haven, our mission, values, and commitment to sustainable fashion." },
  ];
}

export default function About() {
  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }
        
        .animate-fade-in-up-delayed {
          animation: fadeInUp 0.8s ease-out 0.6s forwards;
          opacity: 0;
        }
      `}</style>
      
      <div className="space-y-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl animate-fade-in-up">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop"
            alt="Fashion boutique"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/60" aria-hidden="true"></div>
          <div className="relative px-6 py-20 sm:py-28 lg:px-12 text-white">
            <div className="max-w-2xl mx-auto text-center">
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-inset ring-white/20 animate-slide-in-left">Est. 2020</span>
              <h1 className="mt-4 text-4xl sm:text-6xl font-bold tracking-tight animate-scale-in">About Cloth Haven</h1>
              <p className="mt-4 text-lg text-white/90 max-w-xl mx-auto animate-fade-in-up-delayed">Where Style Meets Sustainability</p>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="space-y-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Our Story</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Founded in 2020, Cloth Haven emerged from a simple yet powerful vision: to make premium, 
                  sustainable fashion accessible to everyone. What started as a small boutique has grown 
                  into a trusted destination for fashion-forward individuals who value quality and ethics.
                </p>
                <p>
                  We believe that fashion should be a force for good. That's why every piece in our 
                  collection is carefully curated to meet our high standards for quality, sustainability, 
                  and timeless style.
                </p>
                <p>
                  Today, Cloth Haven serves thousands of customers worldwide, offering a seamless shopping 
                  experience and a carefully curated selection that tells a story of craftsmanship and modern elegance.
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2000&auto=format&fit=crop"
                alt="Our story"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md shadow-gray-300/50 transition hover:shadow-xl hover:shadow-gray-400/60">
            <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To revolutionize the fashion industry by providing stylish, high-quality clothing 
              that doesn't compromise on sustainability or ethics. We strive to empower our 
              customers to make conscious choices while looking and feeling their best.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md shadow-gray-300/50 transition hover:shadow-xl hover:shadow-gray-400/60">
            <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              To become the world's most trusted fashion brand, known for our unwavering 
              commitment to quality, sustainability, and customer satisfaction. We envision 
              a future where every wardrobe tells a story of responsible consumption and timeless style.
            </p>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-semibold">Our Core Values</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Quality First",
                description: "We never compromise on quality. Every item is carefully selected and tested."
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Sustainability",
                description: "Environmental responsibility is at the heart of our business practices."
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
                title: "Customer Focus",
                description: "Your satisfaction is our priority with exceptional service always."
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ),
                title: "Innovation",
                description: "We continuously evolve, embracing new technologies and trends."
              }
            ].map((value) => (
              <div 
                key={value.title} 
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md shadow-gray-300/50 transition hover:shadow-xl hover:shadow-gray-400/60"
              >
                <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <p className="font-medium mb-2">{value.title}</p>
                <p className="text-sm text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sustainability Commitment Section */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-md shadow-gray-300/50">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2000&auto=format&fit=crop"
                alt="Sustainability"
                className="w-full h-[350px] object-cover"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Our Sustainability Commitment</h2>
              <div className="space-y-4">
                {[
                  {
                    title: "Eco-Friendly Materials",
                    description: "We prioritize organic cotton, recycled fabrics, and sustainable alternatives."
                  },
                  {
                    title: "Ethical Manufacturing",
                    description: "Our partners adhere to fair labor practices and maintain safe conditions."
                  },
                  {
                    title: "Carbon Neutral Shipping",
                    description: "We offset our shipping emissions and use recyclable packaging."
                  },
                  {
                    title: "Circular Fashion",
                    description: "We encourage recycling and offer take-back programs for old garments."
                  }
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-md shadow-gray-300/50">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">Our Impact</h2>
            <p className="text-gray-600">Making a difference, one garment at a time</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { number: "50K+", label: "Happy Customers" },
              { number: "100K+", label: "Products Sold" },
              { number: "95%", label: "Customer Satisfaction" },
              { number: "30+", label: "Countries Served" }
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-semibold">Meet Our Team</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: "Sarah Johnson",
                role: "Founder & CEO",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop"
              },
              {
                name: "Michael Chen",
                role: "Head of Design",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop"
              },
              {
                name: "Emma Williams",
                role: "Sustainability Director",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800&auto=format&fit=crop"
              }
            ].map((member) => (
              <div key={member.name} className="group rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-md shadow-gray-300/50 transition hover:shadow-xl hover:shadow-gray-400/60">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 text-center">
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 sm:p-10">
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Join Our Journey</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Be part of a community that values quality, sustainability, and style. 
                Discover fashion that makes a difference.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a 
                href="/products" 
                className="inline-flex items-center justify-center rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Shop now
              </a>
              <a 
                href="/register" 
                className="inline-flex items-center justify-center rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
              >
                Create Account
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

