import './Partners.css';

const Partners = () => {
    const partners = [
        {
            name: 'Care International',
            image: '/src/assets/partners/care.svg',
            link: 'https://www.care-international.org',
            description: 'Global humanitarian organization fighting poverty and social injustice'
        },
        {
            name: 'Oxfam',
            image: '/src/assets/partners/oxfam.png',
            link: 'https://www.oxfam.org',
            description: 'International confederation working to end poverty and injustice'
        },
        {
            name: 'Save the Children',
            image: '/src/assets/partners/savechildren.svg',
            link: 'https://www.savethechildren.org',
            description: 'Leading independent organization creating lasting change for children'
        },
        {
            name: 'UNICEF',
            image: '/src/assets/partners/unicef.png',
            link: 'https://www.unicef.org',
            description: 'UN agency working for children\'s rights and well-being worldwide'
        },
        {
            name: 'World Vision',
            image: '/src/assets/partners/worldvision.svg',
            link: 'https://www.worldvision.org',
            description: 'Christian humanitarian organization working to create lasting change'
        },
        {
            name: 'ActionAid',
            image: '/src/assets/partners/actionaid.png',
            link: 'https://www.actionaid.org',
            description: 'International anti-poverty agency working to eradicate poverty'
        },
        {
            name: 'Plan International',
            image: '/src/assets/partners/plan.png',
            link: 'https://plan-international.org',
            description: 'Development and humanitarian organization working for children\'s rights'
        },
        {
            name: 'Red Cross',
            image: '/src/assets/partners/redcross.svg',
            link: 'https://www.icrc.org',
            description: 'International humanitarian organization providing assistance in conflicts'
        },
        {
            name: 'IOM – UN Migration',
            image: '',
            link: 'https://www.iom.int',
            description: 'International Organization for Migration'
        },
        {
            name: 'Fondation Prince Albert II de Monaco',
            image: '',
            link: 'https://www.fpa2.org',
            description: 'Foundation dedicated to environmental protection and sustainable development'
        },
        {
            name: 'SNV (Netherlands Development Organisation)',
            image: '',
            link: 'https://www.snv.org',
            description: 'Netherlands Development Organisation'
        },
        {
            name: 'UNESCO',
            image: '',
            link: 'https://www.unesco.org',
            description: 'United Nations Educational, Scientific and Cultural Organization'
        },
        {
            name: 'Veolia Eau',
            image: 'src/assets/partners/logo-veolia.png.webp',
            link: 'https://www.veolia.com',
            description: 'Global leader in optimized resource management'
        },
        {
            name: 'Visit Andorra',
            image: '/src/assets/partners/andorra.avif',
            link: 'https://visitandorra.com/en/',
            description: 'Official tourism website of Andorra'
        },
        {
            name: 'Croix-Rouge Malienne (Malian Red Cross)',
            image: '',
            link: 'https://croix-rouge.ml',
            description: 'Malian Red Cross'
        },
        {
            name: 'MINUSMA (United Nations Multidimensional Integrated Stabilization Mission in Mali)',
            image: '',
            link: 'https://minusma.unmissions.org',
            description: 'UN mission in Mali'
        },
        {
            name: 'SOS Sahel',
            image: 'src/assets/partners/sossahel.webp',
            link: 'https://www.sossahel.org',
            description: 'Organization fighting desertification in Sahel'
        },
        {
            name: 'U.S. Department of Defense – HIV/AIDS Prevention Program',
            image: '',
            link: 'https://www.defense.gov',
            description: 'US DoD HIV/AIDS prevention'
        },
        {
            name: 'FHI 360',
            image: 'src/assets/partners/fhi360.svg',
            link: 'https://www.fhi360.org',
            description: 'Non-profit human development organization'
        },
        {
            name: 'USAID (United States Agency for International Development)',
            image: '',
            link: 'https://www.usaid.gov',
            description: 'US Agency for International Development'
        },
        {
            name: 'WFP (World Food Programme)',
            image: 'src/assets/partners/wfp.svg',
            link: 'https://www.wfp.org',
            description: 'World Food Programme'
        },
        {
            name: 'UNDP (United Nations Development Programme)',
            image: 'src/assets/partners/undp.svg',
            link: 'https://www.undp.org',
            description: 'United Nations Development Programme'
        },
        {
            name: 'International Rescue Committee (IRC)',
            image: 'src/assets/partners/international-rescue-committee-seeklogo.svg',
            link: 'https://www.rescue.org',
            description: 'Humanitarian aid organization'
        },
        {
            name: 'Danish Red Cross',
            image: 'src/assets/partners/drc-300x300.jpg',
            link: 'https://www.rodekors.dk',
            description: 'Danish Red Cross'
        }

    ];

    return (
        <div className="partners">
            {/* Hero Section */}
            <section className="partners-hero">
                <h1>Our Partners</h1>
                <p>
                    We are proud to collaborate with these outstanding organizations that share our commitment
                    to creating lasting change and improving lives across communities.
                </p>
            </section>

            {/* Partners Grid */}
            <section className="partners-section">
                <div className="partners-grid">
                    {partners.map((partner, index) => (
                        <a
                            key={index}
                            href={partner.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="partner-card"
                        >
                            <div className="partner-logo-container">
                                {partner.image && (
                                    <img
                                        src={partner.image}
                                        alt={`${partner.name} logo`}
                                        className="partner-logo"
                                    />
                                )}
                            </div>
                            <h3 className="partner-name">{partner.name}</h3>
                        </a>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Partners;