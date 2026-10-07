/* Siddha Astro - Free Horoscope API with Dynamic Predictions */

// ============================================
// COMPLETE HOROSCOPE DATABASE
// ============================================

const HOROSCOPE_DATA = {
  'Mesha': {
    icon: '♈',
    period: 'Mar 21 - Apr 19',
    element: 'Fire',
    ruler: 'Mars',
    predictions: {
      daily: 'Today brings dynamic energy and courageous opportunities. Take initiative in your endeavors. This is an excellent time to start new projects and pursue your ambitions. Trust your instincts and let your natural leadership shine through.',
      weekly: 'This week is marked by momentum and forward movement. Challenges will strengthen your resolve. Financial prospects improve mid-week. Perfect time for important decisions and bold actions.',
      monthly: 'The month ahead offers growth and recognition. Your efforts are rewarded. Career advancement is likely. Relationships benefit from your enthusiastic energy. Health remains strong with regular activity.',
      career: 'Professional advancement is on the horizon. Pursue that opportunity you\'ve been considering. Your assertiveness impresses superiors. Leadership roles are favorable. Financial gains through hard work and initiative.',
      love: 'Express your feelings openly. Your charm is enhanced today. New romantic connections are possible. Existing relationships strengthen through honest communication. Single natives may meet someone special.',
      health: 'High energy levels today. Good time for exercise and physical activity. Maintain your fitness routine. Watch for overexertion. Rest when needed. Overall vitality is strong.',
      lucky: {color: 'Red', number: '9', direction: 'East', time: 'Morning', gemstone: 'Red Coral', day: 'Tuesday'}
    }
  },

  'Vrishabha': {
    icon: '♉',
    period: 'Apr 20 - May 20',
    element: 'Earth',
    ruler: 'Venus',
    predictions: {
      daily: 'Stability and comfort dominate today. A good day for financial matters and consolidating gains. Focus on building lasting foundations. Patience brings rewards. Trust in the steady progress you\'re making.',
      weekly: 'This week emphasizes material security. Financial decisions should be practical. Home and family matters gain importance. Relationships deepen through reliability and care.',
      monthly: 'A prosperous month ahead for Taurus natives. Financial stability improves. Real estate and property matters are favored. Relationships grow stronger. Health remains stable and consistent.',
      career: 'Steady progress in work. Your reliability impresses superiors. Financial benefits through dedication. Promotion or raise is possible. Security and stability in professional matters.',
      love: 'Strengthen bonds through practical gestures of care. Show love through actions. Relationships become more grounded. Loyalty and commitment are highlighted. Single natives meet stable partners.',
      health: 'Focus on healthy eating and adequate sleep. Rest when needed. Relaxation practices benefit you. Avoid overwork. Overall health is stable and improving.',
      lucky: {color: 'Green', number: '6', direction: 'South', time: 'Evening', gemstone: 'Diamond', day: 'Friday'}
    }
  },

  'Mithuna': {
    icon: '♊',
    period: 'May 21 - Jun 20',
    element: 'Air',
    ruler: 'Mercury',
    predictions: {
      daily: 'Communication shines brightly today. Share your ideas freely. Social connections bring opportunities. Your wit and charm work in your favor. Networking leads to success. Conversations are productive.',
      weekly: 'This week is excellent for communication. Negotiations succeed. Travel is favorable. Learning and studies progress well. Social gatherings bring joy.',
      monthly: 'Communication and learning dominate this month. Journeys bring success. Negotiations and contracts favor you. Social life flourishes. Career advancement through communication skills.',
      career: 'Networking pays off handsomely. Collaboration leads to success. Your ideas are valued. Communication skills are your strength. Possible promotion or new opportunities through connections.',
      love: 'Engaging conversations deepen relationships. Intellectual connections matter. Express your feelings through words. New romantic interests through social circles. Romance thrives on mental connection.',
      health: 'Mental clarity is strong. Good time for intellectual pursuits. Physical activity and fresh air benefit you. Avoid stress through relaxation. Overall health is robust.',
      lucky: {color: 'Yellow', number: '5', direction: 'North', time: 'Afternoon', gemstone: 'Emerald', day: 'Wednesday'}
    }
  },

  'Karkataka': {
    icon: '♋',
    period: 'Jun 21 - Jul 22',
    element: 'Water',
    ruler: 'Moon',
    predictions: {
      daily: 'Emotional sensitivity peaks today. Trust your intuition. Home and family matters gain importance. Nurture relationships close to your heart. Take time for self-care. Emotional intelligence guides you well.',
      weekly: 'This week emphasizes home and family. Domestic matters improve. Emotional bonds strengthen. Time for introspection. Family gatherings bring harmony.',
      monthly: 'A nurturing month for Cancer natives. Family matters improve. Emotional bonds deepen. Home and property matters are favorable. Personal growth through introspection.',
      career: 'Nurture workplace relationships. Team harmony is beneficial. Emotional intelligence aids success. Caring leadership is your strength. Financial stability through steady work.',
      love: 'Focus on emotional security and comfort in relationships. Show affection generously. Relationships deepen emotionally. Single natives meet caring partners. Family support brings joy.',
      health: 'Listen to your body\'s needs. Rest and relaxation are recommended. Emotional balance improves physical health. Comfort foods in moderation. Water-based activities benefit you.',
      lucky: {color: 'White', number: '2', direction: 'West', time: 'Evening', gemstone: 'Pearl', day: 'Monday'}
    }
  },

  'Simha': {
    icon: '♌',
    period: 'Jul 23 - Aug 22',
    element: 'Fire',
    ruler: 'Sun',
    predictions: {
      daily: 'Confidence and creativity surge powerfully. Express yourself boldly and authentically. Recognition comes to those who shine. Leadership opportunities arise. Your natural charisma is magnetic today.',
      weekly: 'This week is filled with creative energy. Your talents are recognized. Romance is favored. Social gatherings highlight you. Professional recognition comes.',
      monthly: 'A successful month for Leo natives. Creativity flourishes. Recognition and appreciation come. Romantic prospects improve. Career advancement through your talents.',
      career: 'Leadership opportunities emerge. Your vision inspires others. Creative projects succeed. Recognition for hard work. Possible promotion or new responsibilities.',
      love: 'Romance is strongly favored. Grand gestures have special meaning. Your confidence attracts partners. Relationships become more passionate. Single natives attract admirers.',
      health: 'Energy is exceptionally high. Perfect time for outdoor activities. Physical fitness improves. Confidence boosts mental health. Overall vitality is excellent.',
      lucky: {color: 'Gold', number: '1', direction: 'East', time: 'Morning', gemstone: 'Ruby', day: 'Sunday'}
    }
  },

  'Kanya': {
    icon: '♍',
    period: 'Aug 23 - Sep 22',
    element: 'Earth',
    ruler: 'Mercury',
    predictions: {
      daily: 'Attention to detail serves you very well today. Analyze situations carefully before acting. Small improvements yield significant results. Precision work is rewarded. Your analytical mind is sharp.',
      weekly: 'This week favors detailed work. Organization brings success. Health and wellness improve. Work assignments are completed excellently. Analysis and planning pay off.',
      monthly: 'An organized and productive month for Virgo natives. Health improves through good habits. Work progresses smoothly. Service to others brings satisfaction.',
      career: 'Precision work is highly rewarded. Quality over quantity approach succeeds. Attention to detail brings promotion. Analysis and planning are valued. Financial growth through careful work.',
      love: 'Show care through thoughtful actions and presence. Small gestures matter greatly. Relationships benefit from honesty. Single natives meet practical partners. Communication improves bonds.',
      health: 'Maintain your healthy routines carefully. Small habits support overall wellness. Attention to diet and exercise pays off. Mental clarity through organization. Health improves steadily.',
      lucky: {color: 'Green', number: '5', direction: 'North', time: 'Morning', gemstone: 'Green Sapphire', day: 'Wednesday'}
    }
  },

  'Tula': {
    icon: '♎',
    period: 'Sep 23 - Oct 22',
    element: 'Air',
    ruler: 'Venus',
    predictions: {
      daily: 'Balance and harmony are key to your day. Seek fairness in all dealings. Partnerships flourish under your charm. Your ability to see both sides serves you. Social grace opens doors.',
      weekly: 'This week emphasizes partnerships and relationships. Negotiations succeed. Social events bring joy. Artistic pursuits flourish. Balance brings harmony.',
      monthly: 'A harmonious month for Libra natives. Relationships deepen. Partnerships thrive. Social life flourishes. Financial benefits through collaboration.',
      career: 'Diplomacy and collaboration lead to success. Partnership ventures prosper. Negotiations favor you. Your fairness is appreciated. Team leadership succeeds.',
      love: 'Relationships deepen through understanding and compromise. Your charm attracts. Partnerships become more committed. Single natives meet charming partners. Romance flourishes.',
      health: 'Bring equilibrium to your work and rest. Balance is healing to your body and mind. Artistic activities benefit health. Social connections support wellness. Overall health improves.',
      lucky: {color: 'Light Blue', number: '6', direction: 'West', time: 'Afternoon', gemstone: 'Opal', day: 'Friday'}
    }
  },

  'Vrischika': {
    icon: '♏',
    period: 'Oct 23 - Nov 21',
    element: 'Water',
    ruler: 'Mars/Pluto',
    predictions: {
      daily: 'Transformation energy is exceptionally strong. Go deep into meaningful pursuits. Hidden truths emerge for your benefit. Trust your intuition completely. Intensity brings power.',
      weekly: 'This week favors investigation and depth. Secrets are revealed. Transformation brings growth. Intensity is your strength. Research and analysis succeed.',
      monthly: 'A transformative month for Scorpio natives. Hidden aspects surface. Depth brings wisdom. Personal growth through intensity. Power and influence increase.',
      career: 'Investigation and research yield valuable insights. Your intensity achieves results. Behind-the-scenes work succeeds. Transformation in workplace. Career advancement through determination.',
      love: 'Deepen intimacy and emotional bonds profoundly. Passion is ignited. Relationships become more committed. Single natives meet intense partners. Connection becomes spiritual.',
      health: 'Inner work and healing practices benefit greatly. Meditation helps deeply. Emotional release improves health. Transformation brings wellness. Overall vitality improves through depth.',
      lucky: {color: 'Red', number: '8', direction: 'South', time: 'Night', gemstone: 'Topaz', day: 'Tuesday'}
    }
  },

  'Dhanu': {
    icon: '♐',
    period: 'Nov 22 - Dec 21',
    element: 'Fire',
    ruler: 'Jupiter',
    predictions: {
      daily: 'Adventure and expansion call to you today. Expand your horizons boldly. Optimism and luck are your companions. Opportunities abound everywhere. Think bigger and reach higher.',
      weekly: 'This week is filled with adventure. New opportunities appear. Travel brings gains. Optimism attracts success. Learning expands your mind.',
      monthly: 'An expansive month for Sagittarius natives. Growth opportunities emerge. Travel succeeds. Luck is on your side. Career and personal expansion occur.',
      career: 'Growth opportunities abound. Think bigger and bolder. Your vision inspires. Expansion and new ventures succeed. Financial growth through opportunities.',
      love: 'Spontaneity and adventure enhance relationships. Excitement brings couples closer. New romantic adventures await. Single natives meet adventurous partners. Freedom and connection balance.',
      health: 'High energy for exploration and activities. Physical activity is excellent. Travel benefits health. Optimism boosts mental wellness. Overall vitality is strong.',
      lucky: {color: 'Purple', number: '3', direction: 'East', time: 'Afternoon', gemstone: 'Yellow Sapphire', day: 'Thursday'}
    }
  },

  'Makara': {
    icon: '♑',
    period: 'Dec 22 - Jan 19',
    element: 'Earth',
    ruler: 'Saturn',
    predictions: {
      daily: 'Discipline and determination are highlighted today. Hard work yields real results. Stay focused on your goals. Patience brings rewards. Your dedication is noticed.',
      weekly: 'This week favors steady progress. Long-term planning succeeds. Hard work is rewarded. Patience brings recognition. Climb steadily toward your goals.',
      monthly: 'A productive month for Capricorn natives. Recognition comes through effort. Long-term success builds. Responsibility brings rewards. Career advancement occurs steadily.',
      career: 'Recognition for your efforts comes. Climb steadily in your career. Long-term projects succeed. Your discipline is valued. Financial growth through persistence.',
      love: 'Build relationships on solid ground. Commitment is favored. Long-term partnerships strengthen. Single natives meet responsible partners. Reliability builds love.',
      health: 'Strength increases through discipline. Long-term health goals progress well. Consistency in healthy habits works. Physical endurance improves. Overall health strengthens.',
      lucky: {color: 'Black', number: '8', direction: 'North', time: 'Morning', gemstone: 'Blue Sapphire', day: 'Saturday'}
    }
  },

  'Kumbha': {
    icon: '♒',
    period: 'Jan 20 - Feb 18',
    element: 'Air',
    ruler: 'Saturn/Uranus',
    predictions: {
      daily: 'Innovation and vision shine brightly. Think outside the box creatively. Your uniqueness is your strength today. Stand out from the crowd. Revolutionary ideas are welcome.',
      weekly: 'This week favors innovation and fresh thinking. Your ideas are valued. Unique approaches succeed. Technology and new methods benefit you. Friends bring good luck.',
      monthly: 'An innovative month for Aquarius natives. Your fresh ideas are recognized. Unique talents bring success. Friendships deepen. Community service brings rewards.',
      career: 'Your fresh ideas are highly valued. Stand out from the crowd successfully. Innovation brings recognition. Unique approach to problems succeeds. Career advancement through originality.',
      love: 'Intellectual connections deepen profoundly. Shared ideals matter greatly. Freedom and commitment balance well. Single natives meet intellectual partners. Unconventional love works.',
      health: 'Mind is exceptionally active. Channel mental energy into creative outlets. Physical activity with friends benefits health. Innovation in health practices works. Mental wellness improves.',
      lucky: {color: 'Blue', number: '4', direction: 'West', time: 'Afternoon', gemstone: 'Hessonite', day: 'Saturday'}
    }
  },

  'Meena': {
    icon: '♓',
    period: 'Feb 19 - Mar 20',
    element: 'Water',
    ruler: 'Jupiter/Neptune',
    predictions: {
      daily: 'Imagination flows freely and creatively. Dreams offer important guidance. Compassion guides your actions beautifully. Intuition is exceptionally strong. Spiritual connection is enhanced.',
      weekly: 'This week favors creativity and imagination. Dreams guide you. Compassion brings good karma. Spiritual practices benefit greatly. Intuition is your guide.',
      monthly: 'A creative month for Pisces natives. Imagination flourishes beautifully. Compassion opens doors. Spiritual growth occurs naturally. Artistic talents shine brightly.',
      career: 'Creativity and intuition serve you well. Artistic projects succeed. Compassion in leadership works. Imagination solves problems creatively. Career benefits from unique perspective.',
      love: 'Emotional depth and empathy strengthen bonds significantly. Spiritual connection deepens. Unconditional love flows. Single natives meet spiritual partners. Compassion attracts love.',
      health: 'Meditation and spiritual practices benefit greatly. Inner peace improves wellness. Creative expression heals. Water-based activities benefit you. Emotional balance improves health.',
      lucky: {color: 'Green', number: '7', direction: 'West', time: 'Evening', gemstone: 'Cat\'s Eye', day: 'Thursday'}
    }
  }
};

// ============================================
// DYNAMIC HOROSCOPE GENERATOR
// ============================================

function getTodayHoroscope(rashiName) {
  const data = HOROSCOPE_DATA[rashiName];
  if (!data) return null;

  // Get base predictions
  const predictions = data.predictions;

  // Add variation based on current date
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const variation = dayOfYear % 10;

  return {
    rashi: rashiName,
    icon: data.icon,
    element: data.element,
    ruler: data.ruler,
    period: data.period,
    daily: addVariation(predictions.daily, variation),
    weekly: predictions.weekly,
    monthly: predictions.monthly,
    career: predictions.career,
    love: predictions.love,
    health: predictions.health,
    lucky: predictions.lucky,
    cosmicMessage: generateCosmicMessage(rashiName, dayOfYear)
  };
}

function addVariation(text, variation) {
  const variations = [
    text,
    text.replace(/Today/, 'This morning') + ' Fortune smiles upon you.',
    text + ' A fortunate phase begins.',
    text.replace(/Today/, 'Right now') + ' Seize the moment.',
    text + ' Success is within reach.',
    text.replace(/brings/, 'will bring') + ' Trust in the process.',
    text + ' The universe supports you.',
    text.replace(/bright/, 'extraordinary') + ' Embrace this energy.',
    text + ' Positive changes are coming.',
    text + ' Your efforts bear fruit soon.'
  ];
  return variations[variation % variations.length];
}

function generateCosmicMessage(rashi, dayOfYear) {
  const messages = {
    'Mesha': [
      'Mars energizes your bold ventures today',
      'Your confidence attracts success',
      'Action brings immediate results',
      'Leadership opportunities emerge',
      'Your fire burns brightest now'
    ],
    'Vrishabha': [
      'Venus blesses your material pursuits',
      'Stability strengthens your position',
      'Financial wisdom guides you',
      'Your patience is rewarded',
      'Earth energy grounds your success'
    ],
    'Mithuna': [
      'Mercury illuminates your path',
      'Communication opens new doors',
      'Your ideas gain traction',
      'Connections bring opportunities',
      'Air currents carry your success'
    ],
    'Karkataka': [
      'The Moon nurtures your growth',
      'Emotional wisdom guides you',
      'Home and heart align',
      'Family bonds strengthen',
      'Water energies flow in your favor'
    ],
    'Simha': [
      'The Sun amplifies your brilliance',
      'Your charisma is magnetic',
      'Recognition comes naturally',
      'Leadership shines brightly',
      'Fire burns with divine purpose'
    ],
    'Kanya': [
      'Mercury sharpens your focus',
      'Details reveal opportunities',
      'Organization brings success',
      'Your precision is appreciated',
      'Earth grounds your plans perfectly'
    ],
    'Tula': [
      'Venus enhances your charm',
      'Balance creates harmony',
      'Partnerships flourish naturally',
      'Your grace opens doors',
      'Air carries diplomatic winds'
    ],
    'Vrischika': [
      'Pluto deepens your power',
      'Transformation serves you',
      'Intensity achieves results',
      'Hidden strength emerges',
      'Water flows with hidden wisdom'
    ],
    'Dhanu': [
      'Jupiter expands your horizons',
      'Luck follows your ventures',
      'Adventure calls you forward',
      'Growth is limitless',
      'Fire propels you upward'
    ],
    'Makara': [
      'Saturn rewards your discipline',
      'Hard work bears fruit',
      'Your climb continues upward',
      'Recognition comes with time',
      'Earth supports your foundation'
    ],
    'Kumbha': [
      'Uranus sparks your innovation',
      'Your unique vision thrives',
      'Revolutionary ideas emerge',
      'Friends bring good fortune',
      'Air carries novel winds'
    ],
    'Meena': [
      'Neptune inspires your dreams',
      'Imagination flows abundantly',
      'Compassion opens hearts',
      'Spiritual growth accelerates',
      'Water carries mystical currents'
    ]
  };

  const rashiMessages = messages[rashi] || messages['Mesha'];
  return rashiMessages[dayOfYear % rashiMessages.length];
}

// ============================================
// GET TODAY'S RASHI (from panchangam data)
// ============================================

async function getTodayRashi(panchangamData) {
  if (panchangamData && panchangamData.rashi) {
    const rashiText = panchangamData.rashi.toLowerCase();
    for (const rashi of Object.keys(HOROSCOPE_DATA)) {
      if (rashiText.includes(rashi.toLowerCase())) {
        return rashi;
      }
    }
  }

  // Fallback: calculate from day of year
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const rashis = Object.keys(HOROSCOPE_DATA);
  return rashis[dayOfYear % rashis.length];
}

// ============================================
// ALL RASHIS DATA
// ============================================

function getAllRashiHoroscopes() {
  const horoscopes = {};
  for (const rashi of Object.keys(HOROSCOPE_DATA)) {
    horoscopes[rashi] = getTodayHoroscope(rashi);
  }
  return horoscopes;
}

// ============================================
// EXPORT
// ============================================

window.SiddhaHoroscope = {
  getTodayHoroscope,
  getTodayRashi,
  getAllRashiHoroscopes,
  HOROSCOPE_DATA
};
