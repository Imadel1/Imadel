import { v4 as uuidv4 } from 'uuid';

export interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
}

export const projects: Project[] = [
  {
    id: uuidv4(),
    title: 'Hand in hand, for a better future!',
    description:
      'Hand in hand, for a better future! #IMADEL provided support on 24/09 to 125 households through food and nutritional assistance. This action, rendered by the S... Read more',
    images: ['/src/assets/slide1.jpg.webp', '/src/assets/slide2.jpg.webp', '/src/assets/slide3.jpg.webp'],
  },
  {
    id: uuidv4(),
    title: 'Distribution of NFI kits to IDPs!',
    description:
      'Distribution of NFI kits to IDPs! IMADEL has provided support to 10 IDP households in Medina Coura (Mopti) through the distribution of essential kits for the elderly. Read more',
    images: ['/src/assets/slide2.jpg.png', '/src/assets/slide3.jpg.png', '/src/assets/slide1.jpg.png'],
  },
  {
    id: uuidv4(),
    title: 'Training to protect, raising awareness to act.',
    description:
      'Training to protect, raising awareness to act. As part of its fight against Gender-Based Violence (GBV), #IMADEL in partnership with #ActionAid, a group of women who have been working on the Gender-Based Violence (GBV)... Read more',
    images: ['/src/assets/slide3.jpg.png', '/src/assets/slide1.jpg.png', '/src/assets/slide2.jpg.png'],
  },
  {
    id: uuidv4(),
    title: 'Support today, to rebuild tomorrow!',
    description:
      'Support today, to rebuild tomorrow! Support today, to rebuild tomorrow! IMADEL has provided support to 85 displaced households through the distribution of kits to the São Paulo S... Read more',
    images: ['/src/assets/slide1.jpg.png', '/src/assets/slide2.jpg.png', '/src/assets/slide3.jpg.png'],
  },
  {
    id: uuidv4(),
    title: 'Solidarity in action, to restore hope and dignity!',
    description:
      'Solidarity in action, to restore hope and dignity! "Solidarity in action, to restore hope and dignity!" As part of its humanitarian commitment, #IMADEL has carried out a humanitarian and cultural work in the United States. Read more',
    images: ['/src/assets/slide2.jpg.png', '/src/assets/slide3.jpg.png', '/src/assets/slide1.jpg.png'],
  },
  {
    id: uuidv4(),
    title: 'Awareness of #VBG',
    description:
      'Awareness of #VBG #IMADEL conducted awareness sessions on #VBG and ticks related to shocks and natural disasters in the region. Read more',
    images: ['/src/assets/slide3.jpg.png', '/src/assets/slide1.jpg.png', '/src/assets/slide2.jpg.png'],
  },
  {
    id: uuidv4(),
    title: 'Assistance to IDPs',
    description:
      'Assistance to IDPs IMADEL, in partnership with Action Aid International, has assisted 125 internally displaced households, i.e. 750 beneficiaries, on the site of the S... Read more',
    images: ['/src/assets/slide1.jpg.png', '/src/assets/slide2.jpg.png', '/src/assets/slide3.jpg.png'],
  },
  {
    id: uuidv4(),
    title: 'Local development',
    description:
      'Local development As part of the implementation of the Top Up NGO project #IMADEL with the support of #Action #Aid international Mali... Read more',
    images: ['/src/assets/slide2.jpg.png', '/src/assets/slide3.jpg.png', '/src/assets/slide1.jpg.png'],
  },
  {
    id: uuidv4(),
    title: 'Humanitarian assistance',
    description:
      'Humanitarian assistance On JUNE 16, 2025, the NGO #IMADEL, an implementing partner of the #UNICEF organized a distribution activity of... Read more',
    images: ['/src/assets/slide3.jpg.png', '/src/assets/slide1.jpg.png', '/src/assets/slide2.jpg.png'],
  },
  {
    id: uuidv4(),
    title: 'Child protection',
    description:
      'Child protection 🌟 Because every child matters. And that each need deserves a dignified response. In a context marked by the... Read more',
    images: ['/src/assets/slide1.jpg.png', '/src/assets/slide2.jpg.png', '/src/assets/slide3.jpg.png'],
  },
  {
    id: uuidv4(),
    title: 'Cooking demonstration',
    description:
      'Cooking demonstration In the commune of Dimbal, Bankass circle, IMADEL, in partnership with Plan International, organized a nutritional cooking demonstration at the Dimbal... Read more',
    images: ['/src/assets/slide2.jpg.png', '/src/assets/slide3.jpg.png', '/src/assets/slide1.jpg.png'],
  },
  {
    id: uuidv4(),
    title: 'Fight against malnutrition',
    description:
      'Fight against malnutrition #lutte_contre_la_malnutrition #IMADEL with the support of these partners, works to implement actions and strategies to ensure that the S... Read more',
    images: ['/src/assets/slide3.jpg.png', '/src/assets/slide1.jpg.png', '/src/assets/slide2.jpg.png'],
  },
];
