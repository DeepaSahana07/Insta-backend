// Free API services for Instagram clone
import axios from 'axios';

class FreeAPIService {
  constructor() {
    this.jsonPlaceholder = 'https://jsonplaceholder.typicode.com';
    this.picsum = 'https://picsum.photos';
    this.randomUser = 'https://randomuser.me/api';
  }

  // Get demo posts from JSONPlaceholder
  async getDemoPosts(limit = 10) {
  try {
    const response = await axios.get(`${this.jsonPlaceholder}/posts?_limit=${limit}`);
    const posts = response.data;
    
    const aestheticUsernames = [
      'wanderlust_soul', 'coffee_vibes', 'sunset_chaser', 'ocean_dreams', 'city_lights',
      'nature_lover', 'art_enthusiast', 'foodie_adventures', 'travel_diaries', 'creative_mind'
    ];
    
    const enhancedPosts = await Promise.all(posts.map(async (post, index) => {
      const imageId = 100 + index;
      const userResponse = await axios.get(`${this.randomUser}?seed=${post.userId}`);
      const user = userResponse.data.results[0];
      
      return {
        id: `demo-${post.id}`,
        _id: `demo-${post.id}`,
        caption: this.getRelevantCaption(index),
        image: `${this.picsum}/600/600?random=${imageId}`,
        user: {
          id: post.userId,
          username: aestheticUsernames[index % aestheticUsernames.length],
          name: `${user.name.first} ${user.name.last}`,
          avatar: user.picture.medium,
          profilePicture: user.picture.medium
        },
        likes: Math.floor(Math.random() * 1000) + 50,
        comments: [],
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    }));
    
    return enhancedPosts;
  } catch (error) {
    console.error('Error fetching demo posts:', error);
    return this.getFallbackPosts();
  }
}

getRelevantCaption(index) {
  const captions = [
    'Lost in the beauty of nature 🌿 Sometimes you need to disconnect to reconnect.',
    'Golden hour magic ✨ Perfect lighting makes everything beautiful.',
    'Coffee and contemplation ☕ The best way to start any morning.',
    'Urban adventures 🏙️ Every street has its own story to tell.',
    'Sunset vibes 🌅 Nature\'s daily masterpiece never disappoints.',
    'Foodie paradise found 🍽️ When presentation matches the incredible taste.',
    'Travel dreams realized ✈️ This place exceeded all my expectations.',
    'Creative mood today 🎨 Art is how we decorate space and time.',
    'Weekend wellness 💆‍♀️ Self-care isn\'t selfish, it\'s essential.',
    'Making memories 📸 Life is about collecting moments, not things.'
  ];
  return captions[index % captions.length];
}

  // Get demo users
  async getDemoUsers(count = 10) {
    try {
      const response = await axios.get(`${this.randomUser}?results=${count}`);
      return response.data.results.map((user, index) => ({
        id: index + 1,
        username: user.login.username,
        name: `${user.name.first} ${user.name.last}`,
        avatar: user.picture.medium,
        followers: Math.floor(Math.random() * 10000) + 100,
        following: Math.floor(Math.random() * 1000) + 50,
        posts: Math.floor(Math.random() * 100) + 10,
        bio: `${user.name.first}'s Instagram profile`,
        isFollowing: Math.random() > 0.5
      }));
    } catch (error) {
      console.error('Error fetching demo users:', error);
      return this.getFallbackUsers();
    }
  }

  // Get random image
  getRandomImage(width = 600, height = 600, category = '') {
    const categories = ['nature', 'city', 'technology', 'food', 'animals'];
    const selectedCategory = category || categories[Math.floor(Math.random() * categories.length)];
    return `${this.picsum}/${width}/${height}?${selectedCategory}&random=${Date.now()}`;
  }

  // Fallback data when APIs fail
  getFallbackPosts() {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      caption: `Demo post ${i + 1}`,
      content: `This is a demo post content for post ${i + 1}`,
      image: `/src/assets/img${(i % 9) + 1}.jpg`,
      user: {
        id: (i % 5) + 1,
        username: `user${(i % 5) + 1}`,
        name: `Demo User ${(i % 5) + 1}`,
        avatar: `/src/assets/user${(i % 15) + 1}.jpg`
      },
      likes: Math.floor(Math.random() * 1000) + 10,
      comments: Math.floor(Math.random() * 50) + 1,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      liked: Math.random() > 0.7
    }));
  }

  getFallbackUsers() {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      username: `user${i + 1}`,
      name: `Demo User ${i + 1}`,
      avatar: `/src/assets/user${(i % 15) + 1}.jpg`,
      followers: Math.floor(Math.random() * 10000) + 100,
      following: Math.floor(Math.random() * 1000) + 50,
      posts: Math.floor(Math.random() * 100) + 10,
      bio: `Demo user ${i + 1}'s profile`,
      isFollowing: Math.random() > 0.5
    }));
  }
}

export default new FreeAPIService();