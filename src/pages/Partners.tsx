import './Partners.css';

const Partners = () => {
    const partners = [
        {
            name: 'Care International',
            image: '/src/assets/partners/care.png',
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
            image: '/src/assets/partners/savechildren.png',
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
            image: '/src/assets/partners/worldvision.png',
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
            image: '/src/assets/partners/redcross.png',
            link: 'https://www.icrc.org',
            description: 'International humanitarian organization providing assistance in conflicts'
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
                                <img
                                    src={partner.image}
                                    alt={`${partner.name} logo`}
                                    className="partner-logo"
                                />
                            </div>
                            <h3 className="partner-name">{partner.name}</h3>
                            <p className="partner-description">{partner.description}</p>
                        </a>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Partners;