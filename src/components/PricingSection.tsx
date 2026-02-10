import React from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';

const PricingCard = ({ 
    title, 
    price, 
    description, 
    features, 
    limitNote,
    isPopular = false, 
    ctaText = "Start free trial",
    ctaLink = "/signup"
}: {
    title: string;
    price: string;
    description: string;
    features: string[];
    limitNote?: string;
    isPopular?: boolean;
    ctaText?: string;
    ctaLink?: string;
}) => {
    return (
        <div className={`
            relative p-8 rounded-2xl transition-all duration-300 flex flex-col h-full bg-white
            ${isPopular 
                ? 'border-2 border-blue-100 shadow-xl scale-105 z-10' 
                : 'border border-gray-100 shadow-sm hover:shadow-md'
            }
        `}>
            {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
                    Most used
                </div>
            )}
            
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-gray-900">{price}</span>
                    <span className="text-gray-500 text-sm">/ month</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed min-h-[40px] italic">
                    "{description}"
                </p>
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                        <Check size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            {limitNote && (
                <p className="text-xs text-gray-400 mb-6 italic text-center">
                    {limitNote}
                </p>
            )}

            <Link 
                href={ctaLink}
                className={`
                    w-full py-3 rounded-lg text-sm font-bold text-center transition-colors
                    ${isPopular 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                    }
                `}
            >
                {ctaText}
            </Link>
        </div>
    );
};

export const PricingSection = () => {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                {/* 1) Section Header */}
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                        Simple pricing. Clear decisions.
                    </h2>
                    <p className="text-xl text-gray-500 font-light">
                        Choose how much clarity you need. Upgrade when you’re ready.
                    </p>
                </div>

                {/* 2) Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
                    
                    {/* Card 1 — Starter */}
                    <PricingCard 
                        title="Starter"
                        price="$15"
                        description="Understand what changed recently."
                        features={[
                            "Automatic comparison of the latest period vs the previous one",
                            "Clear summary of the single most important change",
                            "Visibility into recent data only (last 7–14 days)",
                            "One active dataset",
                            "Guided AI explanations (no free chat)"
                        ]}
                        limitNote="Designed to show you what changed — not the full history."
                    />

                    {/* Card 2 — Growth */}
                    <PricingCard 
                        title="Growth"
                        price="$29"
                        description="See patterns without digging."
                        isPopular={true}
                        features={[
                            "Automatic comparisons across multiple periods",
                            "Extended historical view (weeks or months)",
                            "Prioritized list of changes (what matters most)",
                            "Ability to compare projects, categories, or segments",
                            "Smarter AI explanations with context"
                        ]}
                        limitNote="Ideal for ongoing monitoring and weekly decisions."
                    />

                    {/* Card 3 — Pro */}
                    <PricingCard 
                        title="Pro"
                        price="$49"
                        description="Never be surprised by your numbers."
                        features={[
                            "Real-time alerts when significant changes happen",
                            "Full historical access",
                            "Deeper explanations of why changes happened",
                            "Early signals before problems grow",
                            "Best for teams that rely on numbers daily"
                        ]}
                        limitNote="For teams that want zero blind spots."
                    />
                </div>

                {/* 3) Small Note Below Pricing */}
                <div className="text-center mt-12 space-y-2">
                    <p className="text-gray-500 text-sm font-medium">
                        All plans include a free trial. No credit card required.
                    </p>
                    <p className="text-gray-400 text-xs">
                        Upgrade only when you need more visibility.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
