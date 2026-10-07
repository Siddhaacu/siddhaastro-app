/* Siddha Astro - Free Kundali/Birth Chart API */

// ============================================
// PLANETARY DATA & INFORMATION
// ============================================

const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

const PLANET_INFO = {
  'Sun': {
    symbol: '☉', color: 'Gold', element: 'Fire', significance: 'Self, ego, vitality, authority',
    strength: 'Aries, Leo, Sagittarius', weakness: 'Libra', exaltation: 'Aries', debilitation: 'Libra'
  },
  'Moon': {
    symbol: '☽', color: 'White', element: 'Water', significance: 'Mind, emotions, mother, nourishment',
    strength: 'Cancer, Taurus, Pisces', weakness: 'Scorpio', exaltation: 'Taurus', debilitation: 'Scorpio'
  },
  'Mars': {
    symbol: '♂', color: 'Red', element: 'Fire', significance: 'Courage, energy, conflict, passion',
    strength: 'Aries, Scorpio, Capricorn', weakness: 'Libra', exaltation: 'Capricorn', debilitation: 'Cancer'
  },
  'Mercury': {
    symbol: '☿', color: 'Green', element: 'Air', significance: 'Communication, intellect, commerce',
    strength: 'Gemini, Virgo, Aquarius', weakness: 'Pisces', exaltation: 'Virgo', debilitation: 'Pisces'
  },
  'Jupiter': {
    symbol: '♃', color: 'Yellow', element: 'Air', significance: 'Wisdom, expansion, prosperity, spirituality',
    strength: 'Sagittarius, Pisces', weakness: 'Gemini, Virgo', exaltation: 'Cancer', debilitation: 'Capricorn'
  },
  'Venus': {
    symbol: '♀', color: 'White', element: 'Water', significance: 'Love, beauty, art, pleasure, relationships',
    strength: 'Libra, Taurus, Pisces', weakness: 'Virgo, Aries', exaltation: 'Pisces', debilitation: 'Virgo'
  },
  'Saturn': {
    symbol: '♄', color: 'Black', element: 'Air', significance: 'Discipline, limitation, karma, time',
    strength: 'Capricorn, Aquarius, Libra', weakness: 'Cancer, Leo', exaltation: 'Libra', debilitation: 'Aries'
  },
  'Rahu': {
    symbol: '☊', color: 'Smoky', element: 'Mixed', significance: 'Illusion, materialism, desires, obsession',
    strength: 'Gemini, Virgo', weakness: 'Sagittarius', exaltation: 'Gemini', debilitation: 'Sagittarius'
  },
  'Ketu': {
    symbol: '☋', color: 'Smoky', element: 'Mixed', significance: 'Liberation, spirituality, detachment, past',
    strength: 'Sagittarius, Pisces', weakness: 'Gemini', exaltation: 'Sagittarius', debilitation: 'Gemini'
  }
};

const RASHIS = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karkataka', 'Simha', 'Kanya',
  'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'
];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

// ============================================
// KUNDALI CALCULATION ENGINE
// ============================================

function calculateKundali(birthDate, birthTime, birthCity = 'Hyderabad') {
  try {
    // Parse inputs
    const date = new Date(birthDate);
    const [hours, minutes] = birthTime.split(':').map(Number);
    
    // Default coordinates (Hyderabad)
    let latitude = 17.385;
    let longitude = 78.4867;
    
    // Simple city lookup (can be expanded)
    const cityCoords = {
      'Mumbai': {lat: 19.0760, lon: 72.8777},
      'Delhi': {lat: 28.7041, lon: 77.1025},
      'Bangalore': {lat: 12.9716, lon: 77.5946},
      'Chennai': {lat: 13.0827, lon: 80.2707},
      'Kolkata': {lat: 22.5726, lon: 88.3639},
      'Hyderabad': {lat: 17.385, lon: 78.4867},
      'Pune': {lat: 18.5204, lon: 73.8567},
      'Ahmedabad': {lat: 23.0225, lon: 72.5714}
    };
    
    if (cityCoords[birthCity]) {
      latitude = cityCoords[birthCity].lat;
      longitude = cityCoords[birthCity].lon;
    }
    
    // Calculate Lagna (Ascendant) based on birth time
    const lagna = calculateLagna(date, hours, minutes, latitude, longitude);
    
    // Calculate Moon position (Nakshatra & Rashi)
    const moonData = calculateMoonPosition(date, hours);
    
    // Calculate planetary positions
    const planets = calculatePlanetaryPositions(date, hours, latitude, longitude);
    
    // Calculate Dasha (planetary period)
    const dasha = calculateDasha(moonData.nakshatra);
    
    // Calculate important houses
    const houses = calculateHouses(lagna, planets);
    
    // Generate insights
    const insights = generateInsights(lagna, planets, moonData);
    
    // Generate remedies
    const remedies = generateRemedies(planets, moonData);
    
    return {
      birthDate: date.toLocaleDateString('en-IN'),
      birthTime: birthTime,
      birthCity: birthCity,
      latitude: latitude.toFixed(4),
      longitude: longitude.toFixed(4),
      lagna: lagna,
      moon: moonData.rashi,
      moonNakshatra: moonData.nakshatra,
      planets: planets,
      houses: houses,
      dasha: dasha,
      insights: insights,
      remedies: remedies,
      kundaliSummary: generateKundaliSummary(lagna, planets, moonData)
    };
  } catch (error) {
    console.error('Kundali calculation error:', error);
    return null;
  }
}

function calculateLagna(date, hours, minutes, lat, lon) {
  // Simplified Lagna calculation based on birth time
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const timeInMinutes = hours * 60 + minutes;
  const seasonalShift = Math.sin((dayOfYear - 80) * Math.PI / 182) * 2;
  
  const lagnaIndex = (Math.floor((timeInMinutes / 4) + seasonalShift + dayOfYear / 10)) % 12;
  return RASHIS[lagnaIndex];
}

function calculateMoonPosition(date, hours) {
  // Moon moves approximately 12-13 degrees per day
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const hoursFraction = hours / 24;
  const moonDegree = ((dayOfYear + hoursFraction) * 13.2) % 360;
  
  // Nakshatra (0-27)
  const nakshatraIndex = Math.floor(moonDegree / 13.33) % 27;
  const nakshatra = NAKSHATRAS[nakshatraIndex];
  
  // Rashi (0-11)
  const rashiIndex = Math.floor(moonDegree / 30) % 12;
  const rashi = RASHIS[rashiIndex];
  
  return {
    degree: moonDegree.toFixed(2),
    rashi: rashi,
    nakshatra: nakshatra,
    nakshatraPercent: ((moonDegree % 13.33) / 13.33 * 100).toFixed(1)
  };
}

function calculatePlanetaryPositions(date, hours, lat, lon) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const dayFraction = hours / 24;
  
  const positions = {};
  const speeds = {
    'Sun': 1.0,
    'Moon': 13.2,
    'Mars': 0.524,
    'Mercury': 1.383,
    'Jupiter': 0.083,
    'Venus': 1.602,
    'Saturn': 0.033,
    'Rahu': -0.053,
    'Ketu': -0.053
  };
  
  for (const planet of PLANETS) {
    const baseDegree = (dayOfYear + dayFraction) * speeds[planet];
    const degree = baseDegree % 360;
    const rashiIndex = Math.floor(degree / 30) % 12;
    const rashi = RASHIS[rashiIndex];
    const degreeInRashi = degree % 30;
    
    positions[planet] = {
      degree: degree.toFixed(2),
      rashi: rashi,
      degreeInRashi: degreeInRashi.toFixed(2),
      status: getPlanetStatus(planet, rashi)
    };
  }
  
  return positions;
}

function getPlanetStatus(planet, rashi) {
  const info = PLANET_INFO[planet];
  if (info.exaltation === rashi) return 'Exalted ⬆';
  if (info.debilitation === rashi) return 'Debilitated ⬇';
  if (info.strength.includes(rashi)) return 'Strong';
  if (info.weakness.includes(rashi)) return 'Weak';
  return 'Neutral';
}

function calculateHouses(lagna, planets) {
  const lagnaIndex = RASHIS.indexOf(lagna);
  const houses = {
    '1st House (Lagna)': RASHIS[lagnaIndex],
    '4th House (Home)': RASHIS[(lagnaIndex + 3) % 12],
    '7th House (Marriage)': RASHIS[(lagnaIndex + 6) % 12],
    '10th House (Career)': RASHIS[(lagnaIndex + 9) % 12]
  };
  return houses;
}

function calculateDasha(nakshatra) {
  const nakshatraIndex = NAKSHATRAS.indexOf(nakshatra);
  const dashas = [
    {name: 'Ketu', years: 7},
    {name: 'Venus', years: 20},
    {name: 'Sun', years: 6},
    {name: 'Moon', years: 10},
    {name: 'Mars', years: 7},
    {name: 'Rahu', years: 18},
    {name: 'Jupiter', years: 16},
    {name: 'Saturn', years: 19},
    {name: 'Mercury', years: 17}
  ];
  
  const dashaCycle = Math.floor(nakshatraIndex / 3);
  const current = dashas[dashaCycle];
  const next = dashas[(dashaCycle + 1) % 9];
  
  return {
    current: `${current.name} (${current.years} years)`,
    next: `${next.name} (${next.years} years)`,
    message: `Currently under ${current.name} dasha. Focus on ${getdashaAdvice(current.name)}`
  };
}

function getdashaAdvice(dasha) {
  const advice = {
    'Ketu': 'spirituality and detachment',
    'Venus': 'relationships and prosperity',
    'Sun': 'power and authority',
    'Moon': 'emotional balance and family',
    'Mars': 'courage and action',
    'Rahu': 'worldly gains and materialism',
    'Jupiter': 'wisdom and expansion',
    'Saturn': 'hard work and discipline',
    'Mercury': 'communication and learning'
  };
  return advice[dasha] || 'personal growth';
}

function generateInsights(lagna, planets, moonData) {
  const insights = [];
  
  // Lagna insight
  const lagnaInfo = `Lagna in ${lagna} indicates a ${getlagnaDescription(lagna)} personality.`;
  insights.push(lagnaInfo);
  
  // Moon insight
  const moonInsight = `Moon in ${moonData.rashi} (${moonData.nakshatra}) brings ${getMoonInsight(moonData.rashi)} traits.`;
  insights.push(moonInsight);
  
  // Strong planet
  for (const [planet, data] of Object.entries(planets)) {
    if (data.status === 'Exalted ⬆') {
      insights.push(`${planet} is exalted in your chart, strengthening ${PLANET_INFO[planet].significance}.`);
      break;
    }
  }
  
  // Career insight
  const careerInsight = generateCareerInsight(lagna, planets);
  insights.push(careerInsight);
  
  // Relationship insight
  const relationshipInsight = generateRelationshipInsight(planets);
  insights.push(relationshipInsight);
  
  return insights;
}

function getlagnaDescription(lagna) {
  const descriptions = {
    'Mesha': 'courageous, bold, ambitious',
    'Vrishabha': 'stable, reliable, material-oriented',
    'Mithuna': 'communicative, curious, intellectual',
    'Karkataka': 'emotional, protective, home-loving',
    'Simha': 'confident, creative, leadership-oriented',
    'Kanya': 'analytical, practical, detail-focused',
    'Tula': 'diplomatic, artistic, relationship-oriented',
    'Vrischika': 'intense, transformative, secretive',
    'Dhanu': 'optimistic, philosophical, adventurous',
    'Makara': 'disciplined, ambitious, responsible',
    'Kumbha': 'innovative, humanitarian, progressive',
    'Meena': 'imaginative, spiritual, compassionate'
  };
  return descriptions[lagna] || 'unique and dynamic';
}

function getMoonInsight(rashi) {
  const insights = {
    'Mesha': 'strong will and directness', 'Vrishabha': 'calmness and steadiness',
    'Mithuna': 'intellectual curiosity', 'Karkataka': 'sensitivity and nurturing',
    'Simha': 'pride and magnanimity', 'Kanya': 'precision and discrimination',
    'Tula': 'balance and diplomacy', 'Vrischika': 'depth and intensity',
    'Dhanu': 'optimism and exploration', 'Makara': 'seriousness and patience',
    'Kumbha': 'innovation and idealism', 'Meena': 'imagination and compassion'
  };
  return insights[rashi] || 'unique emotional nature';
}

function generateCareerInsight(lagna, planets) {
  const careers = {
    'Mesha': 'military, sports, leadership, entrepreneurship',
    'Vrishabha': 'banking, agriculture, arts, real estate',
    'Mithuna': 'communication, teaching, business, writing',
    'Karkataka': 'nursing, hospitality, counseling, family business',
    'Simha': 'management, politics, entertainment, teaching',
    'Kanya': 'medicine, accounting, analysis, research',
    'Tula': 'law, diplomacy, art, aesthetics, relations',
    'Vrischika': 'psychology, research, occult, finance',
    'Dhanu': 'education, travel, philosophy, publishing',
    'Makara': 'administration, engineering, governance',
    'Kumbha': 'technology, innovation, social work, science',
    'Meena': 'arts, spirituality, counseling, music'
  };
  
  return `Career prospects strong in ${careers[lagna] || 'diverse fields'}.`;
}

function generateRelationshipInsight(planets) {
  const venusRashi = planets['Venus']?.rashi;
  if (!venusRashi) return 'Venus placement suggests romantic prospects.';
  
  const relationshipNatures = {
    'Tula': 'harmonious and balanced relationships',
    'Vrishabha': 'loyal and long-lasting bonds',
    'Vrischika': 'deep and intense connections',
    'Meena': 'compassionate and spiritual partnerships'
  };
  
  return `Relationships tend toward ${relationshipNatures[venusRashi] || 'meaningful connections'}.`;
}

function generateRemedies(planets, moonData) {
  const remedies = [];
  
  // Find debilitated or weak planets
  for (const [planet, data] of Object.entries(planets)) {
    if (data.status === 'Debilitated ⬇') {
      remedies.push({
        planet: planet,
        remedy: `Strengthen ${planet} through regular ${getRemedy(planet)}. Wear ${getGemstone(planet)} if approved by astrologer.`,
        mantra: getMantra(planet)
      });
    }
  }
  
  // If no weak planets, suggest general practices
  if (remedies.length === 0) {
    remedies.push({
      planet: 'General',
      remedy: 'Practice meditation, yoga, and donate to charity regularly.',
      mantra: 'Om Namo Bhagavate Vasudevaya'
    });
  }
  
  return remedies.slice(0, 3); // Return top 3 remedies
}

function getRemedy(planet) {
  const remedies = {
    'Sun': 'charitable donations and morning sun gazing',
    'Moon': 'water rituals and offerings to mother',
    'Mars': 'martial arts practice and strength training',
    'Mercury': 'learning and communication exercises',
    'Jupiter': 'meditation and teaching others',
    'Venus': 'artistic pursuits and service to others',
    'Saturn': 'discipline, fasting, and hard work',
    'Rahu': 'meditation and detachment practices',
    'Ketu': 'spiritual practices and charity'
  };
  return remedies[planet] || 'spiritual practices';
}

function getGemstone(planet) {
  const gemstones = {
    'Sun': 'Ruby',
    'Moon': 'Pearl',
    'Mars': 'Red Coral',
    'Mercury': 'Emerald',
    'Jupiter': 'Yellow Sapphire',
    'Venus': 'Diamond',
    'Saturn': 'Blue Sapphire',
    'Rahu': 'Hessonite',
    'Ketu': 'Cat\'s Eye'
  };
  return gemstones[planet] || 'an auspicious gemstone';
}

function getMantra(planet) {
  const mantras = {
    'Sun': 'Om Surya Namaha',
    'Moon': 'Om Chandra Namaha',
    'Mars': 'Om Mangal Namaha',
    'Mercury': 'Om Budha Namaha',
    'Jupiter': 'Om Guru Namaha',
    'Venus': 'Om Shukra Namaha',
    'Saturn': 'Om Shani Namaha',
    'Rahu': 'Om Rahu Namaha',
    'Ketu': 'Om Ketu Namaha'
  };
  return mantras[planet] || 'Om Namah Shivaya';
}

function generateKundaliSummary(lagna, planets, moonData) {
  const strongPlanets = Object.entries(planets)
    .filter(([_, data]) => data.status === 'Exalted ⬆' || data.status === 'Strong')
    .map(([name, _]) => name)
    .slice(0, 3);
  
  const weakPlanets = Object.entries(planets)
    .filter(([_, data]) => data.status === 'Debilitated ⬇' || data.status === 'Weak')
    .map(([name, _]) => name)
    .slice(0, 3);
  
  return {
    lagna: lagna,
    moonSign: moonData.rashi,
    moonNakshatra: moonData.nakshatra,
    strongPlanets: strongPlanets.length > 0 ? strongPlanets : ['Balanced chart'],
    weakPlanets: weakPlanets.length > 0 ? weakPlanets : ['All planets well-placed'],
    overallStrength: ((12 - weakPlanets.length) / 12 * 100).toFixed(0) + '%'
  };
}

// ============================================
// HASH-BASED FALLBACK
// ============================================

function calculateKundaliFromHash(dateString) {
  // For demo/fallback purposes
  const hash = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const lagnaIndex = hash % 12;
  const moonIndex = (hash * 7) % 12;
  const nakshatraIndex = (hash * 11) % 27;
  
  return {
    lagna: RASHIS[lagnaIndex],
    moon: RASHIS[moonIndex],
    nakshatra: NAKSHATRAS[nakshatraIndex],
    isHash: true
  };
}

// ============================================
// EXPORT
// ============================================

window.SiddhaKundali = {
  calculateKundali,
  calculateKundaliFromHash,
  PLANETS,
  PLANET_INFO
};
