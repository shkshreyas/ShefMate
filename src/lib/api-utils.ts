// Free APIs for chef data
const RANDOM_USER_API = 'https://randomuser.me/api/';
const RECIPE_API = 'https://www.themealdb.com/api/json/v1/1/';
const QUOTES_API = 'https://api.quotable.io/random';

// Get random chef profile data
export async function getRandomChefProfile() {
  try {
    const response = await fetch(RANDOM_USER_API);
    const data = await response.json();
    const user = data.results[0];
    
    return {
      name: `${user.name.first} ${user.name.last}`,
      image: user.picture.large,
      location: `${user.location.city}, ${user.location.country}`,
      phone: user.phone,
      email: user.email,
    };
  } catch (error) {
    console.error('Error fetching random chef profile:', error);
    return null;
  }
}

// Get random cuisine type
export async function getRandomCuisine() {
  try {
    const response = await fetch(`${RECIPE_API}list.php?a=list`);
    const data = await response.json();
    const cuisines = data.meals;
    const randomCuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
    return randomCuisine.strArea;
  } catch (error) {
    console.error('Error fetching cuisine:', error);
    return 'Indian';
  }
}

// Get random chef quote
export async function getRandomChefQuote() {
  try {
    const response = await fetch(QUOTES_API);
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Error fetching quote:', error);
    return 'Passionate about creating memorable dining experiences.';
  }
}

// Get random chef specialties
export async function getRandomSpecialties() {
  try {
    const response = await fetch(`${RECIPE_API}list.php?c=list`);
    const data = await response.json();
    const categories = data.meals;
    const specialties = [];
    
    // Get 3 random categories
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * categories.length);
      specialties.push(categories[randomIndex].strCategory);
    }
    
    return specialties;
  } catch (error) {
    console.error('Error fetching specialties:', error);
    return ['Indian', 'Continental', 'Fusion'];
  }
}

// Get random chef rating and reviews
export function getRandomRating() {
  const rating = (4 + Math.random()).toFixed(1);
  const reviews = Math.floor(Math.random() * 100) + 10;
  return { rating, reviews };
}

// Get random serving capacity
export function getRandomServingCapacity() {
  return Math.floor(Math.random() * 20) + 10;
}

// Get random price range
export function getRandomPriceRange() {
  const min = Math.floor(Math.random() * 500) + 500;
  const max = min + Math.floor(Math.random() * 1000) + 500;
  return `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')}`;
} 