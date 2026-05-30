const supabase = require('../supabase');

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
    let { data: cars, error } = await query.order('created_at', { ascending: false });

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

    if (error) {
      throw error;
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
    const { data: car, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!car) {
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

    const { data: newCar, error } = await supabase
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

    if (error) {
      throw error;
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

    // Get current record first
    const { data: currentCar, error: getError } = await supabase
      .from('cars')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (getError || !currentCar) {
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

    const { data: updatedCar, error: updateError } = await supabase
      .from('cars')
      .update(updatePayload)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
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
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      throw error;
    }

    res.json({ message: 'Car removed successfully' });
  } catch (error) {
    console.error('Delete car error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
