import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Carousel.css';

interface CarouselSlide {
    image: string;
    title: string;
    description: string;
}

// Import images properly for Vite
import slide1 from '../assets/slide1.jpg.webp';
import slide2 from '../assets/slide2.jpg.webp';
import slide3 from '../assets/slide3.jpg.webp';

const carouselData: CarouselSlide[] = [
    {
        image: slide1,
        title: 'Empowering Communities',
        description: 'Building stronger futures through sustainable development and education.',
    },
    {
        image: slide2,
        title: 'Healthcare Initiatives',
        description: 'Providing accessible healthcare services to underserved communities.',
    },
    {
        image: slide3,
        title: 'Educational Programs',
        description: 'Creating opportunities through quality education and skill development.',
    },
];

const Carousel = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    }
    if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + carouselData.length) % carouselData.length);
    }
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, []);    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + carouselData.length) % carouselData.length);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const handleImageClick = () => {
        navigate('/ourwork');
    };

    return (
        <div className="carousel">
            <div 
                className="carousel-inner"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {carouselData.map((slide, index) => (
                    <div key={index} 
                         className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                         style={{ transform: `translateX(${100 * (index - currentSlide)}%)` }}
                         onClick={handleImageClick}>
                        <img src={slide.image} alt={slide.title} width="800" height="400" />
                        <div className="carousel-content">
                            <h2>{slide.title}</h2>
                            <p>{slide.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <button className="carousel-button prev" onClick={prevSlide}>
                &#8249;
            </button>
            <button className="carousel-button next" onClick={nextSlide}>
                &#8250;
            </button>

            <div className="carousel-dots">
                {carouselData.map((_, index) => (
                    <button
                        key={index}
                        className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Carousel;