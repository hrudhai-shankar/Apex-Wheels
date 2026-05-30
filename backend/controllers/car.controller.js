const supabase = require('../supabase');

const localCars = [
  {
    id: 1,
    name: 'Model Y',
    brand: 'Tesla',
    type: 'Electric',
    transmission: 'Automatic',
    fuel_type: 'Electric',
    seats: 5,
    price_per_day: 7500,
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80',
    description: 'Experience the future of road trips with the Tesla Model Y. Boasting dual-motor AWD, an ultra-premium minimalist interior, state-of-the-art Autopilot safety integrations, and zero exhaust emissions.',
    rental_type: 'luxury',
    rating: 4.8,
    reviews: 124,
    available: true
  },
  {
    id: 2,
    name: 'M4 Competition',
    brand: 'BMW',
    type: 'Coupe',
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    seats: 4,
    price_per_day: 12000,
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
    description: 'Unleash absolute performance on the asphalt. The BMW M4 Competition combines a twin-turbocharged inline-six engine with race-car dynamics, custom leather bucket seats, and head-turning sports luxury looks.',
    rental_type: 'luxury',
    rating: 4.9,
    reviews: 86,
    available: true
  },
  {
    id: 3,
    name: 'Ghost',
    brand: 'Rolls Royce',
    type: 'Sedan',
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    seats: 4,
    price_per_day: 45000,
    image: 'https://images.unsplash.com/photo-1631245054178-5a0d5c05f778?auto=format&fit=crop&w=800&q=80',
    description: 'The pinnacle of automotive luxury. The Rolls Royce Ghost is perfect for elite events and VIP arrivals, featuring the iconic starlight headliner and an uncompromising whisper-quiet V12 engine.',
    rental_type: 'wedding',
    rating: 5.0,
    reviews: 42,
    available: true
  },
  {
    id: 4,
    name: 'S-Class Maybach',
    brand: 'Mercedes',
    type: 'Luxury',
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    seats: 4,
    price_per_day: 28000,
    image: 'https://images.unsplash.com/photo-1622199675204-747372d627a8?auto=format&fit=crop&w=800&q=80',
    description: 'Unrivaled chauffeur-driven luxury. Perfect for weddings and executive transport. Features massaging rear seats, ambient lighting, and world-class ride comfort.',
    rental_type: 'wedding',
    rating: 4.9,
    reviews: 67,
    available: true
  },
  {
    id: 5,
    name: 'Mustang 1967',
    brand: 'Ford',
    type: 'Coupe',
    transmission: 'Manual',
    fuel_type: 'Petrol',
    seats: 4,
    price_per_day: 16000,
    image: 'https://images.unsplash.com/photo-1549420042-3ee3737b98ae?auto=format&fit=crop&w=800&q=80',
    description: 'Classic American muscle from the golden era. A fully restored 1967 Mustang with the iconic V8 burble, perfect for cinematic shoots and vintage-themed weddings.',
    rental_type: 'vintage',
    rating: 4.7,
    reviews: 31,
    available: true
  },
  {
    id: 6,
    name: '190 SL Roadster',
    brand: 'Mercedes',
    type: 'Convertible',
    transmission: 'Manual',
    fuel_type: 'Petrol',
    seats: 2,
    price_per_day: 22000,
    image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80',
    description: 'An elegant classic from the 1950s. The open-top 190 SL offers an authentic vintage touring experience with immaculate styling and analog driving purity.',
    rental_type: 'vintage',
    rating: 4.9,
    reviews: 14,
    available: true
  },
  {
    id: 7,
    name: 'G-Class AMG 63',
    brand: 'Mercedes',
    type: 'Luxury',
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    seats: 5,
    price_per_day: 22000,
    image: 'https://images.unsplash.com/photo-1520050206274-a1ae446cb3cc?auto=format&fit=crop&w=800&q=80',
    description: 'The ultimate luxury off-road icon. The G-Wagon AMG 63 represents commanding prestige, featuring a handcrafted twin-turbo V8, premium Nappa leather interiors, and unmatched road presence.',
    rental_type: 'luxury',
    rating: 4.8,
    reviews: 112,
    available: true
  },
  {
    id: 8,
    name: 'Fortuner Legend',
    brand: 'Toyota',
    type: 'SUV',
    transmission: 'Automatic',
    fuel_type: 'Diesel',
    seats: 7,
    price_per_day: 4500,
    image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80',
    description: 'The undisputed king of Indian roads. The Toyota Fortuner delivers incredible off-road capability, absolute reliability, a high commanding driving position, and a spacious 7-seater layout.',
    rental_type: 'standard',
    rating: 4.5,
    reviews: 340,
    available: true
  },
  {
    id: 9,
    name: '911 Carrera S',
    brand: 'Porsche',
    type: 'Luxury',
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    seats: 4,
    price_per_day: 19500,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    description: 'The gold standard of sports cars. The Porsche 911 Carrera S offers legendary rear-engine dynamics, iconic styling heritage, luxurious interior trim, and peerless precision control.',
    rental_type: 'luxury',
    rating: 5.0,
    reviews: 58,
    available: true
  }
];

// Helper to map DB snake_case columns to frontend camelCase
const mapCar = (car) => {
  if (!car) return null;
  return {
    _id: car.id,
    name: car.name,
    brand: car.brand,
    type: car.type,
    transmission: car.transmission,
    fuelType: car.fuel_type,
    seats: car.seats,
    pricePerDay: Number(car.price_per_day),
    image: car.image,
    description: car.description,
    rentalType: car.rental_type || 'standard',
    rating: Number(car.rating) || 0,
    reviews: Number(car.reviews) || 0,
    available: car.available,
  };
};

// @desc    Get all cars (with filters and search)
// @route   GET /api/cars
// @access  Public
exports.getCars = async (req, res) => {
  try {
    const { search, brand, type, rentalType, minRating, seats, maxPrice, available } = req.query;
    
    let cars = [];
    let error = null;

    try {
      let query = supabase.from('cars').select('*');

      // Filter availability
      if (available !== undefined) {
        query = query.eq('available', available === 'true');
      }

      // Filter brand
      if (brand) {
        query = query.eq('brand', brand);
      }

      // Filter minimum seats capacity
      if (seats) {
        query = query.gte('seats', Number(seats));
      }

      // Filter maximum price per day
      if (maxPrice) {
        query = query.lte('price_per_day', Number(maxPrice));
      }

      // Text search (brand OR model/name matching)
      if (search) {
        query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
      }

      // These columns may not exist yet — apply them but catch errors
      if (rentalType) {
        query = query.eq('rental_type', rentalType);
      }
      if (minRating) {
        query = query.gte('rating', Number(minRating));
      }

      // Execute query sorted by creation time
      let result = await query.order('created_at', { ascending: false });
      cars = result.data;
      error = result.error;

      // If error mentions missing column, retry without the new column filters
      if (error && error.message && (error.message.includes('rental_type') || error.message.includes('rating'))) {
        console.warn('New columns not found in DB, retrying without them:', error.message);
        let fallbackQuery = supabase.from('cars').select('*');
        if (available !== undefined) fallbackQuery = fallbackQuery.eq('available', available === 'true');
        if (brand) fallbackQuery = fallbackQuery.eq('brand', brand);
        if (seats) fallbackQuery = fallbackQuery.gte('seats', Number(seats));
        if (maxPrice) fallbackQuery = fallbackQuery.lte('price_per_day', Number(maxPrice));
        if (search) fallbackQuery = fallbackQuery.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
        const fallbackResult = await fallbackQuery.order('created_at', { ascending: false });
        cars = fallbackResult.data;
        error = fallbackResult.error;
      }
    } catch (dbErr) {
      console.warn('Database query failed, using in-memory fallback:', dbErr.message);
      error = dbErr;
    }

    // Fallback to local cars array if there is a connection/fetch error
    if (error || !cars || cars.length === 0) {
      console.log('Using in-memory mock cars database fallback.');
      let filtered = [...localCars];

      if (available !== undefined) {
        const isAvail = available === 'true';
        filtered = filtered.filter(c => c.available === isAvail);
      }
      if (brand) {
        filtered = filtered.filter(c => c.brand.toLowerCase() === brand.toLowerCase());
      }
      if (seats) {
        filtered = filtered.filter(c => c.seats >= Number(seats));
      }
      if (maxPrice) {
        filtered = filtered.filter(c => c.price_per_day <= Number(maxPrice));
      }
      if (rentalType) {
        filtered = filtered.filter(c => c.rental_type === rentalType);
      }
      if (minRating) {
        filtered = filtered.filter(c => c.rating >= Number(minRating));
      }
      if (search) {
        const term = search.toLowerCase();
        filtered = filtered.filter(c => c.name.toLowerCase().includes(term) || c.brand.toLowerCase().includes(term));
      }
      
      cars = filtered;
    }

    // Map rows to frontend-friendly camelCase
    res.json(cars.map(mapCar));
  } catch (error) {
    console.error('Get cars error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single car by ID
// @route   GET /api/cars/:id
// @access  Public
exports.getCarById = async (req, res) => {
  try {
    let car = null;
    let error = null;

    try {
      const { data, error: dbErr } = await supabase
        .from('cars')
        .select('*')
        .eq('id', req.params.id)
        .maybeSingle();
      
      car = data;
      error = dbErr;
    } catch (dbErr) {
      error = dbErr;
    }

    if (error || !car) {
      // Look in localCars
      const foundLocal = localCars.find(c => c.id.toString() === req.params.id.toString());
      if (foundLocal) {
        return res.json(mapCar(foundLocal));
      }
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json(mapCar(car));
  } catch (error) {
    console.error('Get car by ID error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new car
// @route   POST /api/cars
// @access  Private/Admin
exports.createCar = async (req, res) => {
  try {
    const { name, brand, type, transmission, fuelType, seats, pricePerDay, image, description } = req.body;

    if (!name || !brand || !type || !transmission || !fuelType || !seats || !pricePerDay || !image || !description) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    let newCar = null;
    try {
      const { data, error } = await supabase
        .from('cars')
        .insert([
          {
            name,
            brand,
            type,
            transmission,
            fuel_type: fuelType,
            seats: Number(seats),
            price_per_day: Number(pricePerDay),
            image,
            description,
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      newCar = data;
    } catch (dbErr) {
      // Mock local insertion
      newCar = {
        id: localCars.length + 1,
        name,
        brand,
        type,
        transmission,
        fuel_type: fuelType,
        seats: Number(seats),
        price_per_day: Number(pricePerDay),
        image,
        description,
        available: true,
        rental_type: 'standard',
        rating: 5.0,
        reviews: 1
      };
      localCars.push(newCar);
    }

    res.status(201).json(mapCar(newCar));
  } catch (error) {
    console.error('Create car error:', error.message);
    res.status(400).json({ message: 'Invalid data provided', error: error.message });
  }
};

// @desc    Update a car
// @route   PUT /api/cars/:id
// @access  Private/Admin
exports.updateCar = async (req, res) => {
  try {
    const { name, brand, type, transmission, fuelType, seats, pricePerDay, image, description, available } = req.body;

    let currentCar = null;
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', req.params.id)
        .maybeSingle();
      
      if (error) throw error;
      currentCar = data;
    } catch (dbErr) {
      currentCar = localCars.find(c => c.id.toString() === req.params.id.toString());
    }

    if (!currentCar) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Build update properties
    const updatePayload = {
      name: name !== undefined ? name : currentCar.name,
      brand: brand !== undefined ? brand : currentCar.brand,
      type: type !== undefined ? type : currentCar.type,
      transmission: transmission !== undefined ? transmission : currentCar.transmission,
      fuel_type: fuelType !== undefined ? fuelType : currentCar.fuel_type,
      seats: seats !== undefined ? Number(seats) : currentCar.seats,
      price_per_day: pricePerDay !== undefined ? Number(pricePerDay) : currentCar.price_per_day,
      image: image !== undefined ? image : currentCar.image,
      description: description !== undefined ? description : currentCar.description,
      available: available !== undefined ? available : currentCar.available,
    };

    let updatedCar = null;
    try {
      const { data, error } = await supabase
        .from('cars')
        .update(updatePayload)
        .eq('id', req.params.id)
        .select()
        .single();
      
      if (error) throw error;
      updatedCar = data;
    } catch (dbErr) {
      // Mock local update
      const idx = localCars.findIndex(c => c.id.toString() === req.params.id.toString());
      if (idx !== -1) {
        localCars[idx] = { ...localCars[idx], ...updatePayload };
        updatedCar = localCars[idx];
      }
    }

    res.json(mapCar(updatedCar));
  } catch (error) {
    console.error('Update car error:', error.message);
    res.status(400).json({ message: 'Error updating car', error: error.message });
  }
};

// @desc    Delete a car
// @route   DELETE /api/cars/:id
// @access  Private/Admin
exports.deleteCar = async (req, res) => {
  try {
    let success = false;
    try {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', req.params.id);
      
      if (error) throw error;
      success = true;
    } catch (dbErr) {
      const idx = localCars.findIndex(c => c.id.toString() === req.params.id.toString());
      if (idx !== -1) {
        localCars.splice(idx, 1);
        success = true;
      }
    }

    if (!success) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ message: 'Car removed successfully' });
  } catch (error) {
    console.error('Delete car error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
