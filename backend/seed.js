require('dotenv').config();
const supabase = require('./supabase');

const sampleCars = [
  {
    name: 'Model Y',
    brand: 'Tesla',
    type: 'Electric',
    transmission: 'Automatic',
    fuelType: 'Electric',
    seats: 5,
    pricePerDay: 7500,
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80',
    description: 'Experience the future of road trips with the Tesla Model Y. Boasting dual-motor AWD, an ultra-premium minimalist interior, state-of-the-art Autopilot safety integrations, and zero exhaust emissions.',
    rentalType: 'luxury',
    rating: 4.8,
    reviews: 124,
    available: true
  },
  {
    name: 'M4 Competition',
    brand: 'BMW',
    type: 'Coupe',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 4,
    pricePerDay: 12000,
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
    description: 'Unleash absolute performance on the asphalt. The BMW M4 Competition combines a twin-turbocharged inline-six engine with race-car dynamics, custom leather bucket seats, and head-turning sports luxury looks.',
    rentalType: 'luxury',
    rating: 4.9,
    reviews: 86,
    available: true
  },
  {
    name: 'Ghost',
    brand: 'Rolls Royce',
    type: 'Sedan',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 4,
    pricePerDay: 45000,
    image: 'https://images.unsplash.com/photo-1631245054178-5a0d5c05f778?auto=format&fit=crop&w=800&q=80',
    description: 'The pinnacle of automotive luxury. The Rolls Royce Ghost is perfect for elite events and VIP arrivals, featuring the iconic starlight headliner and an uncompromising whisper-quiet V12 engine.',
    rentalType: 'wedding',
    rating: 5.0,
    reviews: 42,
    available: true
  },
  {
    name: 'S-Class Maybach',
    brand: 'Mercedes',
    type: 'Luxury',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 4,
    pricePerDay: 28000,
    image: 'https://images.unsplash.com/photo-1622199675204-747372d627a8?auto=format&fit=crop&w=800&q=80',
    description: 'Unrivaled chauffeur-driven luxury. Perfect for weddings and executive transport. Features massaging rear seats, ambient lighting, and world-class ride comfort.',
    rentalType: 'wedding',
    rating: 4.9,
    reviews: 67,
    available: true
  },
  {
    name: 'Mustang 1967',
    brand: 'Ford',
    type: 'Coupe',
    transmission: 'Manual',
    fuelType: 'Petrol',
    seats: 4,
    pricePerDay: 16000,
    image: 'https://images.unsplash.com/photo-1549420042-3ee3737b98ae?auto=format&fit=crop&w=800&q=80',
    description: 'Classic American muscle from the golden era. A fully restored 1967 Mustang with the iconic V8 burble, perfect for cinematic shoots and vintage-themed weddings.',
    rentalType: 'vintage',
    rating: 4.7,
    reviews: 31,
    available: true
  },
  {
    name: '190 SL Roadster',
    brand: 'Mercedes',
    type: 'Convertible',
    transmission: 'Manual',
    fuelType: 'Petrol',
    seats: 2,
    pricePerDay: 22000,
    image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80',
    description: 'An elegant classic from the 1950s. The open-top 190 SL offers an authentic vintage touring experience with immaculate styling and analog driving purity.',
    rentalType: 'vintage',
    rating: 4.9,
    reviews: 14,
    available: true
  },
  {
    name: 'G-Class AMG 63',
    brand: 'Mercedes',
    type: 'Luxury',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    pricePerDay: 22000,
    image: 'https://images.unsplash.com/photo-1520050206274-a1ae446cb3cc?auto=format&fit=crop&w=800&q=80',
    description: 'The ultimate luxury off-road icon. The G-Wagon AMG 63 represents commanding prestige, featuring a handcrafted twin-turbo V8, premium Nappa leather interiors, and unmatched road presence.',
    rentalType: 'luxury',
    rating: 4.8,
    reviews: 112,
    available: true
  },
  {
    name: 'Fortuner Legend',
    brand: 'Toyota',
    type: 'SUV',
    transmission: 'Automatic',
    fuelType: 'Diesel',
    seats: 7,
    pricePerDay: 4500,
    image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80',
    description: 'The undisputed king of Indian roads. The Toyota Fortuner delivers incredible off-road capability, absolute reliability, a high commanding driving position, and a spacious 7-seater layout.',
    rentalType: 'standard',
    rating: 4.5,
    reviews: 340,
    available: true
  },
  {
    name: '911 Carrera S',
    brand: 'Porsche',
    type: 'Luxury',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 4,
    pricePerDay: 19500,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    description: 'The gold standard of sports cars. The Porsche 911 Carrera S offers legendary rear-engine dynamics, iconic styling heritage, luxurious interior trim, and peerless precision control.',
    rentalType: 'luxury',
    rating: 5.0,
    reviews: 58,
    available: true
  }
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to Supabase...');
    
    // Clear existing cars - delete matching rows (where id is greater than 0)
    console.log('Clearing existing cars table...');
    const { error: deleteError } = await supabase
      .from('cars')
      .delete()
      .gt('id', 0);

    if (deleteError) {
      throw deleteError;
    }
    console.log('Cars table cleared.');

    // Map properties to snake_case columns
    const insertPayload = sampleCars.map((c) => ({
      name: c.name,
      brand: c.brand,
      type: c.type,
      transmission: c.transmission,
      fuel_type: c.fuelType,
      seats: c.seats,
      price_per_day: c.pricePerDay,
      image: c.image,
      description: c.description,
      rental_type: c.rentalType,
      rating: c.rating,
      reviews: c.reviews,
      available: c.available,
    }));

    console.log('Inserting sample vehicles into Supabase...');
    const { data: insertedCars, error: insertError } = await supabase
      .from('cars')
      .insert(insertPayload)
      .select();

    if (insertError) {
      throw insertError;
    }

    console.log(`Successfully seeded ${insertedCars.length} cars in the database!`);
    console.log('Seeding completed. Ready to roll!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding process failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
