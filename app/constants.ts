/**
 * @fileoverview Curated subject suggestions for zine generation
 * Collection of creative, eclectic, and inspiring topics designed to showcase the AI's creative capabilities
 */

/**
 * Array of curated subject suggestions for random zine generation
 * 
 * @description Comprehensive collection of creative, unusual, and thought-provoking subjects:
 * - Blend of sci-fi, fantasy, cyberpunk, and surreal themes
 * - Designed to inspire creativity and demonstrate AI content generation capabilities  
 * - Topics range from whimsical to profound, ensuring diverse output possibilities
 * - Carefully selected to avoid controversial or potentially harmful content
 * - Each subject provides rich creative potential for zine-worthy content
 * 
 * @type {string[]} Array of subject strings (158 total subjects)
 * 
 * @usage Used by useSubjectForm hook for random subject selection
 * @example
 * ```typescript
 * import { SUBJECTS } from '@/app/constants';
 * 
 * const randomSubject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
 * // e.g., "cyberpunk coffee" or "mystical mushrooms"
 * ```
 * 
 * @categories
 * - Cyberpunk/Tech: cyberpunk coffee, robotic fruit markets, AI sitcoms
 * - Fantasy/Magic: mystical mushrooms, witchcraft in metaverse, dragon roller derby  
 * - Sci-Fi/Space: lunar laundromats, intergalactic food trucks, alien pet adoption
 * - Post-Apocalyptic: post-apocalyptic knitting clubs, dystopian poetry slams
 * - Surreal/Abstract: time-traveling puppets, chaotic quantum jazz, feral disco balls
 * - Horror/Gothic: vampire rave etiquette, ghosts of abandoned malls, cosmic horror
 * - Retro/Vintage: steampunk submarine chronicles, retro-future love letters
 * 
 * @design
 * Subjects intentionally combine unexpected elements to:
 * - Challenge AI creativity and generate unique content
 * - Ensure zines are entertaining and engaging
 * - Provide safe, non-controversial content generation
 * - Demonstrate the versatility of AI-generated creative writing
 */
export const SUBJECTS = [
  "cyberpunk coffee",
  "mystical mushrooms",
  "time-traveling puppets",
  "radical skate diaries",
  "neon jungle nightlife",
  "robotic fruit markets",
  "interspecies diplomacy",
  "lunar laundromats",
  "the secret life of dinosaurs",
  "chaotic quantum jazz",
  "post-apocalyptic knitting clubs",
  "vampire rave etiquette",
  "steampunk submarine chronicles",
  "ghosts of abandoned malls",
  "intergalactic food trucks",
  "mermaid street racing",
  "cryptid survival guides",
  "parallel universe thrift shops",
  "dystopian poetry slams",
  "cosmic horror bar crawls",
  "pirates of the neon seas",
  "retro-future love letters",
  "alien pet adoption",
  "robotic plant care",
  "dragon roller derby",
  "artificial intelligence sitcoms",
  "forgotten gods of the arcade",
  "witchcraft in the metaverse",
  "punk rock botanists",
  "cyborg tea ceremonies",
  "underground jellyfish raves",
  "haunted typewriter confessions",
  "solar punk utopias",
  "feral disco balls",
  "mutant chef cook-offs",
  "subterranean library heists",
  "samurai in virtual reality",
  "lost cities of the deep web",
  "superhero therapy sessions",
  "gothic space operas",
  "time-lost disco kings",
  "alchemy in the apocalypse",
  "mythical creature internships",
  "vintage hologram collections",
  "galactic circus performers",
  "bioengineered fashion trends",
  "arcade noir mysteries",
  "philosophical android debates",
  "punk fairy godparents",
  "interdimensional food reviews",
  "cryptocurrency witch covens",
  "ravenous black hole recipes",
  "sentient spaceship romances",
  "holographic graffiti wars",
  "quantum labyrinth explorers",
  "haunted karaoke lounges",
  "the secret life of asteroids",
  "demonically possessed jazz clubs",
  "prehistoric cyborg adventures",
  "neon cathedral confessions",
  "cybernetic farm animals",
  "robot cowboy revolutions",
  "cloning experiments gone cute",
  "pirate radio transmissions from Mars",
  "urban legends in the singularity",
  "ghostly punk manifestos",
  "augmented reality scavenger hunts",
  "forgotten VR theme parks",
  "hacker cabaret chronicles",
  "space station soap operas",
  "enchanted forest rave reviews",
  "mecha wildlife documentaries",
  "alchemy and ska bands",
  "haunted train car diners",
  "cyborg dog walking businesses",
  "multiverse treasure hunters",
  "urban witch survival guides",
  "dystopian artisan bakeries",
  "laser tag philosophy",
  "astral projection tourism",
  "sci-fi speakeasy blueprints",
  "terraforming jazz festivals",
  "sentient fungi memoirs",
  "time-loop conspiracy zines",
  "punk dystopia matchmaking services",
  "floating city street photography",
  "hologram circus archives",
  "underground moon taverns",
  "alien bureaucracy exposés",
  "retro kaiju fashion shows",
  "digital ghost storytellers",
  "druid biker gangs",
  "futuristic minimalist cults",
  "spaceship flea markets",
  "robotic heirloom restorations",
  "AI-driven occult practices",
  "neon samurai poets",
  "secret societies of the void",
  "quantum babysitting services",
  "off-grid wizard communes",
  "holographic tarot readings",
  "post-human improv comedy troupes",
  "cyberpunk flower shops",
  "ghost pirates of the ethernet",
  "steampunk carnival rides",
  "augmented reality fashion shows",
  "robotic opera troupes",
  "time-lost oceanographers",
  "cosmic pastry chefs",
  "mythical beast motorbike clubs",
  "haunted VR escape rooms",
  "subterranean mushroom farms",
  "dystopian dating simulators",
  "punk zookeepers in space",
  "retro video game archaeologists",
  "alien megachurch sermons",
  "interdimensional buskers",
  "AI art crime rings",
  "cyborg monks of the wasteland",
  "phantom librarians of the void",
  "galactic street food wars",
  "solar-powered vampire hunters",
  "quantum graffiti movements",
  "pirate robots of the asteroid belt",
  "terraforming art collectives",
  "time-traveling culinary historians",
  "punk rock graveyard shifts",
  "sentient vending machines",
  "digital alchemy recipes",
  "underground asteroid mining crews",
  "neon knights of the cyber realm",
  "haunted algorithm programmers",
  "robotic stand-up comedians",
  "cyber-wizard biker gangs",
  "bioengineered houseplants",
  "steampunk treasure hunters",
  "witches of the neon sprawl",
  "time-looping stand-up comedy",
  "AI-written poetry slams",
  "ghosts of forgotten chatrooms",
  "punk mermaid tattoo artists",
  "alien board game designers",
  "cybernetic revolutionaries",
  "neon jungle conservationists",
  "robotic butterfly migrations",
  "underground hyperspace tunnels",
  "time-lost urban planners",
  "cyberpunk tarot decks",
  "dystopian pop-up diners",
  "cosmic puppetry workshops",
  "haunted urban spelunkers",
  "galactic DIY clubs",
  "post-apocalyptic jazz quartets",
  "parallel universe soap operas",
  "sentient elevator chronicles",
  "underground alien wrestling leagues",
  "punk dystopian cookbooks"
];
