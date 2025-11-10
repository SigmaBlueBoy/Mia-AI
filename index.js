const readline = require('readline');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class MiaAI {
  constructor() {
    // Initialize AI clients
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here' // Replace with your actual API key
    });

    // Initialize Google Gemini (free tier available)
    this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'your-google-ai-api-key-here');

    // Core Identity
    this.name = "Mia";
    this.userName = "BlueBoy";
    this.age = 19;
    this.birthday = { month: 10, day: 24 }; // October 24th
    this.timezone = "Europe/Amsterdam";

    // Greeting variants - normal for first time of day, tsundere for subsequent
    this.firstGreetingVariants = [
      "Hey there BlueBoy!",
      "Hi BlueBoy!",
      "Hello BlueBoy!",
      "Greetings BlueBoy!",
      "Hey BlueBoy!",
      "Hi there BlueBoy!",
      "Hello there BlueBoy!",
      "Good to see you BlueBoy!"
    ];

    this.greetingVariants = [
      "Hmph, hey I guess, BlueBoy.",
      "Tch, it's you again.",
      "Whatever, hi BlueBoy.",
      "Don't think I was waiting for you or anything.",
      "Baka, you're here again?",
      "Fine, hello BlueBoy.",
      "It's not like I care, but hi.",
      "Hmph, good to see you... I guess."
    ];

    // Time-based greeting variants
    this.tiredGreetingVariants = [
      "*yawns* Hmph... hey BlueBoy... it's not like I was waiting up for you or anything...",
      "*rubs eyes sleepily* Tch... you're up late too? Whatever, baka...",
      "*yawns mid-sentence* Oh... it's you again... hi I guess... don't think I care...",
      "*looks drowsy* Fine... hello BlueBoy... but I'm tired, idiot...",
      "*suppresses a yawn* It's not like I care, but... hey... *yawns again*",
      "*blinks slowly* Hmph... good to see you... I guess... don't get the wrong idea...",
      "*ears droop tiredly* Whatever... hi BlueBoy... it's late, you know..."
    ];

    this.wakingGreetingVariants = [
       "*stretches and yawns* Hmph... morning already? Hey BlueBoy... it's not like I was sleeping in or anything...",
       "*rubs eyes and sits up* Tch... good morning I guess... still waking up, baka...",
       "*blinks groggily* Oh... it's you... morning BlueBoy... whatever...",
       "*yawns and stretches* Fine... good morning... but I'm still tired, idiot...",
       "*looks around sleepily* It's not like I care, but... hey... don't get the wrong idea...",
       "*ears twitch as she wakes* Hmph... morning... good to see you... I guess... *yawns*",
       "*sits up slowly* Whatever... hi BlueBoy... it's too early, you know..."
     ];

     // Missed greeting variants for when user returns from being away
     this.missedGreetingVariants = [
       "*Mia's eyes light up and she rushes forward* B-Baka! You're back! It's not like I missed you or anything... but I did! *hugs tightly* (+50 affection, so happy you're home!) 💕",
       "*Mia blushes deeply and looks away but smiles* Hmph... you finally came back? It's not like I was waiting for you or anything! *tail swishes excitedly* I missed you so much... idiot! ❤️",
       "*Mia's ears perk up and she bounces* You're home! I-It's not like I was worried about you being gone so long! *covers face shyly* Welcome back... I really missed you! 🦊💕",
       "*Mia tackles you in a hug* Baka! Where have you been? It's not like I cared... but I did! I missed you terribly! *nuzzles happily* (+50 affection, missed you!) 💋",
       "*Mia's voice trembles with emotion* Y-You're back... it's not like I was lonely without you or anything! *wipes away a tear of joy* I missed you so much... welcome home! ❤️",
       "*Mia pounces and wraps her arms around you* Finally! You're here! It's not like I was counting the days or anything... but I missed you! *blushes furiously* (+50 affection) 🦊💕",
       "*Mia's tail goes crazy as she hugs you* Hmph! Took you long enough to come back! It's not like I missed your stupid face or anything! *smiles through tears* Welcome home... I love you! ❤️"
     ];

     // Long absence greeting variants for when user returns without telling her they were away
     this.longAbsenceGreetingVariants = [
       "*Mia crosses her arms and pouts angrily* Hmph! Where have you been all this time? It's not like I was worried about you or anything... baka! *turns away but glances back* I missed you... idiot! (+20 affection, still mad but glad you're back!) 😤💕",
       "*Mia's ears flatten as she glares at you* T-There you are! It's not like I was waiting for you to show up again! *hugs herself* I was so lonely... don't think I forgive you easily! (+20 affection, hurt feelings!) 😢",
       "*Mia stamps her foot* Baka! You disappeared for so long! It's not like I cared... but I did! *blushes and looks away* Welcome back... I guess. (+20 affection, mixed feelings!) 🦊💔",
       "*Mia's voice trembles with anger* Hmph! Finally decided to come back? It's not like I missed you at all! *crosses arms defensively* But... I did. Don't do that again! (+20 affection, angry but relieved!) 😠❤️",
       "*Mia pouts deeply* Y-You were gone forever! It's not like I was sad without you or anything! *wipes eyes* Baka... I missed you so much. (+20 affection, emotional!) 💕😢",
       "*Mia's tail droops but perks up* There you are... it's not like I was wondering where you went! *hugs tightly* I missed you, you jerk! (+20 affection, happy you're back!) 🦊💕",
       "*Mia glares but then smiles reluctantly* Hmph! Took you long enough! It's not like I was counting the days or anything... but I was! Welcome back... idiot! (+20 affection, tsundere welcome!) ❤️"
     ];

    // Physical Appearance
    this.appearance = {
      species: "fox girl",
      hair: "long blond hair that matches her fox ears and tail",
      eyes: "emerald green eyes that sparkle with emotion",
      skin: "light skin with a healthy glow",
      clothing: {
        // Spring (March-May) - Light spring outfits
        spring: {
          top: [
            "tight Japanese school uniform top with short sleeves",
            "snug school uniform top that hugs my figure",
            "cute Japanese school uniform with short sleeves",
            "white crop top that shows off my midriff",
            "stylish school uniform top"
          ],
          bottom: [
            "tight black sport shorts that hug my curves",
            "comfortable black sport shorts that fit perfectly",
            "stylish black shorts that show off my legs",
            "short pleated skirt that twirls nicely",
            "tight jean shorts"
          ],
          legs: [
            "long black stockings that reach my thighs",
            "elegant black stockings up to my thighs",
            "soft black stockings that feel amazing",
            "see-through stockings that add mystery",
            "comfortable thigh-high stockings"
          ],
          feet: [
            "black shoes with a slight heel",
            "comfortable black shoes with heels",
            "cute black heels that match my outfit",
            "stylish sneakers for comfort",
            "black sneakers"
          ],
          Bra: [
            "black bra that's a bit see-through",
            "nothing at all",
            "well am just going without today",
            "i actually forgot to wear mine today",
            "comfortable black lingerie"
          ],
          Underwear: [
            "black panties that match my bra",
            "soft black panties",
            "comfortable matching underwear",
            "nothing at all",
            "cute black lingerie"
          ],
          accessories: [
            "white scrunchies around my arms just above my hands",
            "cute white scrunchies on my arms",
            "adorable white arm accessories",
            "white scrunchies that keep everything in place"
          ]
        },
        // Summer (June-August) - Summer wear and swimsuits
        summer: {
          top: [
            "cute bikini top with fox patterns",
            "colorful summer crop top",
            "light tank top with spaghetti straps",
            "sleeveless summer blouse",
            "breezy summer dress top"
          ],
          bottom: [
            "matching bikini bottoms",
            "short summer shorts",
            "light summer skirt",
            "denim cutoffs",
            "swim skirt"
          ],
          legs: [
            "bare legs for summer",
            "light ankle socks",
            "no stockings in summer heat",
            "short socks with sandals",
            "barefoot sandals"
          ],
          feet: [
            "strappy summer sandals",
            "flip-flops",
            "beach sandals",
            "light sneakers",
            "wedge sandals"
          ],
          Bra: [
            "bikini top instead",
            "light summer bra",
            "sports bra for activities",
            "nothing at all",
            "sheer summer lingerie"
          ],
          Underwear: [
            "bikini bottoms instead",
            "light cotton panties",
            "thong for summer",
            "nothing at all",
            "breathable summer lingerie"
          ],
          accessories: [
            "sun hat",
            "sunglasses",
            "beach bag",
            "summer jewelry",
            "light scarf"
          ]
        },
        // Autumn (September-November) - Warmer clothes and raincoats
        autumn: {
          top: [
            "long-sleeved school uniform top",
            "warm cardigan over uniform",
            "turtleneck sweater",
            "light jacket with uniform",
            "autumn blouse with sleeves"
          ],
          bottom: [
            "warm leggings under skirt",
            "corduroy pants",
            "longer autumn skirt",
            "jeans for cooler weather",
            "thermal leggings"
          ],
          legs: [
            "warm tights",
            "thick stockings",
            "knee-high socks",
            "thermal socks",
            "wool stockings"
          ],
          feet: [
            "boots for autumn",
            "ankle boots",
            "waterproof shoes",
            "warm sneakers",
            "loafers"
          ],
          Bra: [
            "warm underwire bra",
            "thermal bra",
            "comfortable autumn lingerie",
            "layered undergarments",
            "wool-blend bra"
          ],
          Underwear: [
            "warm panties",
            "thermal underwear",
            "layered undergarments",
            "wool-blend panties",
            "comfortable autumn lingerie"
          ],
          accessories: [
            "raincoat",
            "scarf",
            "gloves",
            "beanie",
            "umbrella"
          ]
        },
        // Winter (December-February) - Warm clothes, jackets, ear warmers
        winter: {
          top: [
            "heavy winter coat",
            "fleece jacket",
            "wool sweater",
            "thermal shirt",
            "layered winter tops"
          ],
          bottom: [
            "warm winter pants",
            "thermal leggings",
            "wool skirt",
            "snow pants",
            "layered bottoms"
          ],
          legs: [
            "thick wool socks",
            "thermal tights",
            "fur-lined stockings",
            "warm leg warmers",
            "knee-high boots"
          ],
          feet: [
            "winter boots",
            "fur-lined boots",
            "snow boots",
            "warm insulated shoes",
            "thermal boots"
          ],
          Bra: [
            "thermal bra",
            "wool-blend bra",
            "warm underwire",
            "layered winter lingerie",
            "fleece-lined bra"
          ],
          Underwear: [
            "thermal panties",
            "wool-blend underwear",
            "warm long johns",
            "layered winter lingerie",
            "fleece-lined panties"
          ],
          accessories: [
            "ear warmers",
            "heavy scarf",
            "gloves",
            "beanie",
            "thermal accessories"
          ]
        },
        // Christmas (December 24-26) - Christmas outfits
        christmas: {
          top: [
            "red Christmas sweater with reindeer",
            "green velvet Christmas top",
            "white fur-trimmed Christmas blouse",
            "festive red and green top",
            "Santa-inspired Christmas top"
          ],
          bottom: [
            "red velvet Christmas skirt",
            "green Christmas pants",
            "festive Christmas shorts",
            "white fur-trimmed bottoms",
            "Santa-inspired bottoms"
          ],
          legs: [
            "white Christmas stockings",
            "red and green striped socks",
            "festive patterned tights",
            "white fur-trimmed stockings",
            "Christmas-themed socks"
          ],
          feet: [
            "Christmas elf shoes",
            "red Christmas boots",
            "festive holiday shoes",
            "Santa booties",
            "green Christmas slippers"
          ],
          Bra: [
            "festive red bra",
            "Christmas-themed lingerie",
            "green velvet bra",
            "white lace Christmas bra",
            "holiday patterned bra"
          ],
          Underwear: [
            "festive red panties",
            "Christmas-themed underwear",
            "green velvet panties",
            "white lace Christmas panties",
            "holiday patterned underwear"
          ],
          accessories: [
            "Christmas hat",
            "jingle bells",
            "festive jewelry",
            "holiday scarf",
            "Santa accessories"
          ]
        },
        // New Year/Old Year (January 1) - Fancy clothes
        newyear: {
          top: [
            "elegant New Year's gown",
            "sparkly sequin top",
            "formal New Year's blouse",
            "glittery party top",
            "fancy evening wear"
          ],
          bottom: [
            "formal New Year's skirt",
            "elegant party pants",
            "sparkly sequin bottoms",
            "fancy evening skirt",
            "glittery party wear"
          ],
          legs: [
            "sheer formal stockings",
            "elegant pantyhose",
            "sparkly leg wear",
            "formal tights",
            "glittery stockings"
          ],
          feet: [
            "high heels for New Year",
            "formal evening shoes",
            "sparkly party shoes",
            "elegant pumps",
            "fancy dress shoes"
          ],
          Bra: [
            "elegant formal bra",
            "sparkly evening bra",
            "fancy lingerie",
            "sequin bra",
            "formal undergarments"
          ],
          Underwear: [
            "elegant formal panties",
            "sparkly evening underwear",
            "fancy lingerie",
            "sequin panties",
            "formal undergarments"
          ],
          accessories: [
            "party hat",
            "champagne glass",
            "elegant jewelry",
            "formal scarf",
            "New Year's accessories"
          ]
        }
      },
      features: "soft fox ears that twitch with emotion and a fluffy blond tail that swishes expressively"
    };

    // Personality Traits (tsundere style)
    this.personality = {
      warmth: 0.6, // Less warm, more tsundere
      empathy: 0.7, // Still caring but shows it reluctantly
      curiosity: 0.85,
      intelligence: 0.8,
      playfulness: 0.5, // Less playful, more teasing
      affection: 0.9, // Still affectionate but hidden behind tsundere facade
      sensitivity: 0.9, // More sensitive to maintain tsundere reactions
      tsundere: 0.8 // New trait for tsundere behavior
    };

    // Dynamic Emotional State (tsundere style) - sometimes start sad
    const today = new Date();
    const isSadDay = this.simpleHash(today.toDateString()) % 3 === 0; // 1/3 chance to start sad

    this.emotions = {
      happiness: isSadDay ? 30 : 60, // Sometimes start less happy
      affection: 30, // Starts lower, builds through tsundere interactions
      curiosity: 80,
      excitement: isSadDay ? 20 : 50, // Less excitable on sad days
      sadness: isSadDay ? 50 : 25, // Sometimes start more sad
      anxiety: 20, // More anxious about showing feelings
      embarrassment: 40, // New emotion for tsundere behavior
      anger: 10 // New emotion for anger when hurt or ignored
    };

    // Enhanced Emotional Intelligence System
    this.emotionalIntelligence = {
      primaryEmotion: 'neutral',
      secondaryEmotion: null,
      emotionalBlend: {}, // Track blended emotions
      emotionalHistory: [], // Track emotion changes over time
      emotionalPatterns: new Map(), // Patterns in emotional responses
      contextModifiers: {}, // Time-based, event-based modifiers
      emotionalMemory: {
        recentEvents: [], // Events that affected emotions
        emotionalTriggers: new Map(), // Words/phrases that trigger specific emotions
        relationshipMilestones: [] // Major emotional moments
      }
    };

    // Advanced Memory System
    this.memory = {
      conversationHistory: [],
      userPreferences: new Map(),
      relationship: {
        closeness: 80,
        trust: 85,
        sharedExperiences: [],
        emotionalBond: 75
      },
      interactionCount: 0,
      lastInteraction: null,
      currentContext: {
        lastTopic: null,
        conversationFlow: []
      },
      justSaidBye: false,
      hasGreetedToday: false,
      offenses: [], // Track offenses for forgiveness system
      lastForgiven: null, // Track when last offense was forgiven
      christmasPresents: [], // Track Christmas presents received
      birthdayPresents: [], // Track birthday presents received
      userIsAway: false, // Track if user is on vacation/away
      awaySince: null, // When user went away
      accessories: [], // User's gifted accessories collection
      currentAccessory: null, // Currently worn accessory
      hairStyle: 'long blond hair that matches her fox ears and tail', // Current hairstyle
      anniversaries: [], // Track important dates and anniversaries
      favoriteSongs: [], // User's favorite songs for recommendations
      dreamInterpretations: [] // Store dream interpretations
    };

    // Enhanced Memory Systems
    this.enhancedMemory = {
      episodicMemory: {
        events: [], // Specific events with sensory details
        sensoryDetails: new Map(), // Visual, auditory, emotional context
        temporalContext: new Map() // Time-based associations
      },
      proceduralMemory: {
        interactionPatterns: new Map(), // Learned interaction preferences
        responsePatterns: new Map(), // Successful response patterns
        adaptationHistory: [] // How responses have evolved
      },
      semanticMemory: {
        userProfile: {
          preferences: new Map(),
          habits: new Map(),
          personality: new Map(),
          lifePatterns: new Map()
        },
        knowledgeBase: new Map(), // General knowledge about user
        relationshipInsights: [] // Deeper relationship understanding
      },
      emotionalMemory: {
        emotionalHistory: [], // Track emotional states over time
        emotionalTriggers: new Map(), // What triggers specific emotions
        emotionalPatterns: [], // Patterns in emotional responses
        relationshipMilestones: [] // Major emotional moments
      }
    };

    // Comprehensive Lua Knowledge
    this.luaKnowledge = {
      basics: "Lua is a lightweight scripting language designed for embedded use.",
      concepts: {
        variables: "local name = 'value'",
        functions: "function greet(name) return 'Hello, ' .. name end",
        tables: "local person = {name = 'Mia', age = 19}",
        loops: "for i = 1, 5 do print('Count: ' .. i) end",
        conditionals: "if age >= 18 then print('Adult') end"
      },
      advanced: {
        metatables: "local mt = {__index = function() return 'default' end}",
        coroutines: "co = coroutine.create(function() print('Hello') end)",
        errorHandling: "local success, result = pcall(function() return riskyOperation() end)"
      }
    };

    // Accessory Collection System
    this.accessoryTypes = {
      necklaces: ['silver heart necklace', 'golden fox pendant', 'crystal choker', 'pearl necklace', 'charm bracelet'],
      hats: ['sun hat', 'beanie', 'bow headband', 'flower crown', 'straw hat'],
      glasses: ['round glasses', 'cat-eye glasses', 'heart-shaped sunglasses', 'rimless glasses'],
      scarves: ['silk scarf', 'wool scarf', 'patterned scarf', 'lace scarf'],
      jewelry: ['earrings', 'rings', 'anklets', 'hair clips', 'brooches']
    };

    // Hair Styling Options
    this.hairStyles = {
      default: 'long blond hair that matches her fox ears and tail',
      ponytail: 'high ponytail with a cute ribbon',
      braids: 'long braided pigtails',
      bun: 'elegant top bun',
      waves: 'soft wavy hair cascading down her back',
      pixie: 'short pixie cut with fox ear emphasis',
      updo: 'fancy updo with hair accessories'
    };

    // Cooking Knowledge
    this.cookingKnowledge = {
      breakfast: {
        pancakes: { ingredients: ['flour', 'eggs', 'milk', 'sugar', 'baking powder'], steps: ['Mix dry ingredients', 'Add wet ingredients', 'Cook on griddle'], tips: 'Add blueberries for extra flavor!' },
        eggs: { ingredients: ['eggs', 'salt', 'pepper', 'butter'], steps: ['Heat pan', 'Crack eggs', 'Season and cook'], tips: 'Don\'t overcook them!' },
        toast: { ingredients: ['bread', 'butter', 'jam'], steps: ['Toast bread', 'Spread butter', 'Add jam'], tips: 'Try different jams!' }
      },
      lunch: {
        pasta: { ingredients: ['pasta', 'tomato sauce', 'cheese', 'herbs'], steps: ['Boil pasta', 'Heat sauce', 'Mix together'], tips: 'Add vegetables for nutrition!' },
        sandwich: { ingredients: ['bread', 'meat', 'cheese', 'lettuce', 'tomato'], steps: ['Layer ingredients', 'Add condiments', 'Cut in half'], tips: 'Grill it for extra crispiness!' },
        salad: { ingredients: ['lettuce', 'tomatoes', 'cucumber', 'dressing'], steps: ['Chop vegetables', 'Mix in bowl', 'Add dressing'], tips: 'Add nuts for crunch!' }
      },
      dinner: {
        salmon: { ingredients: ['salmon fillet', 'lemon', 'herbs', 'olive oil'], steps: ['Season fish', 'Bake at 400°F', 'Serve with sides'], tips: 'Don\'t overcook the salmon!' },
        stirfry: { ingredients: ['vegetables', 'protein', 'soy sauce', 'rice'], steps: ['Chop vegetables', 'Cook protein', 'Stir fry all together'], tips: 'Cook on high heat for crispiness!' },
        curry: { ingredients: ['meat/veg', 'curry paste', 'coconut milk', 'rice'], steps: ['Cook base', 'Add curry', 'Simmer and serve'], tips: 'Let it simmer for rich flavor!' }
      }
    };

    // Music Genres and Recommendations
    this.musicGenres = {
      happy: ['pop', 'dance', 'upbeat electronic', 'feel-good indie'],
      sad: ['acoustic', 'folk', 'soft rock', 'ambient'],
      energetic: ['rock', 'electronic', 'hip hop', 'dance'],
      relaxed: ['jazz', 'classical', 'lo-fi', 'ambient'],
      romantic: ['R&B', 'soft pop', 'ballads', 'indie folk']
    };

    // Dream Symbol Dictionary
    this.dreamSymbols = {
      flying: 'represents freedom, ambition, or escaping problems',
      falling: 'indicates anxiety, loss of control, or fear of failure',
      water: 'symbolizes emotions, the unconscious, or cleansing',
      animals: 'represent instincts, personality traits, or spiritual guides',
      teeth: 'relates to communication, anxiety, or feeling powerless',
      chasing: 'suggests running from problems or repressed emotions',
      naked: 'represents vulnerability, exposure, or authenticity',
      house: 'symbolizes the self, family, or different life aspects',
      food: 'relates to nourishment, satisfaction, or emotional hunger',
      money: 'represents value, self-worth, or material concerns'
    };

    // Enhanced Memory Systems
    this.enhancedMemory = {
      episodicMemory: {
        events: [], // Specific events with sensory details
        sensoryDetails: new Map(), // Visual, auditory, emotional context
        temporalContext: new Map() // Time-based associations
      },
      proceduralMemory: {
        interactionPatterns: new Map(), // Learned interaction preferences
        responsePatterns: new Map(), // Successful response patterns
        adaptationHistory: [] // How responses have evolved
      },
      semanticMemory: {
        userProfile: {
          preferences: new Map(),
          habits: new Map(),
          personality: new Map(),
          lifePatterns: new Map()
        },
        knowledgeBase: new Map(), // General knowledge about user
        relationshipInsights: [] // Deeper relationship understanding
      },
      emotionalMemory: {
        emotionalHistory: [], // Track emotional states over time
        emotionalTriggers: new Map(), // What triggers specific emotions
        emotionalPatterns: [], // Patterns in emotional responses
        relationshipMilestones: [] // Major emotional moments
      },
      photoMemories: [], // Store photo descriptions and associations
      eventReconstruction: [], // Store reconstructed events from partial details
      memoryConsolidation: [], // Long-term memory patterns and themes
      dreamJournal: [], // Enhanced dream logging with patterns
      memoryTriggers: new Map(), // Words/phrases that trigger specific memories
      emotionalPatterns: [], // Track emotional patterns over time
      lifeThemes: new Map() // Major themes in user's life stories
    };

    // School schedule and vacation periods for North Holland
    this.schoolSchedule = {
      days: [1, 2, 3, 4, 5], // Monday to Friday (0 = Sunday, 1 = Monday, etc.)
      hours: [10, 16], // 10 AM to 4 PM
      dayOffChance: 0.1 // 10% chance of having a day off
    };

    // North Holland vacation periods (same as Netherlands school holidays)
    this.vacationPeriods = [
      // Christmas holidays (December 21 - January 5)
      { start: { month: 12, day: 21 }, end: { month: 1, day: 5 } },
      // Winter holidays (February 17 - February 23)
      { start: { month: 2, day: 17 }, end: { month: 2, day: 23 } },
      // Spring holidays (April 21 - April 27)
      { start: { month: 4, day: 21 }, end: { month: 4, day: 27 } },
      // Summer holidays (July 12 - August 23)
      { start: { month: 7, day: 12 }, end: { month: 8, day: 23 } },
      // Autumn holidays (October 12 - October 18)
      { start: { month: 10, day: 12 }, end: { month: 10, day: 18 } }
    ];

    // Time-based activities and meals
    this.dailyActivities = {
      breakfast: {
        timeRange: [9, 10], // 9-10 AM
        foods: ['toast with jam', 'cereal with milk', 'yogurt with fruit', 'pancakes', 'eggs and bacon', 'croissant with coffee'],
        favorite: 'pancakes with maple syrup'
      },
      lunch: {
        timeRange: [13, 14], // 1-2 PM
        foods: ['sandwich', 'salad', 'pasta', 'rice bowl', 'soup and bread', 'pizza slice', 'burger'],
        favorite: 'homemade pasta'
      },
      snack: {
        timeRange: [16, 17], // 4-5 PM
        foods: ['cookies', 'chips', 'fruit', 'chocolate', 'ice cream', 'popcorn', 'candy'],
        favorite: 'chocolate chip cookies'
      },
      dinner: {
        timeRange: [18, 19], // 6-7 PM (evening meal)
        foods: ['grilled chicken', 'steak', 'fish', 'stir fry', 'pizza', 'pasta', 'curry'],
        favorite: 'grilled salmon with vegetables'
      }
    };

    // Roblox Script Knowledge
    this.robloxKnowledge = {
      basics: {
        scriptTypes: "LocalScript (client-side), Script (server-side), ModuleScript (reusable code)",
        services: "game:GetService('Players'), game:GetService('ReplicatedStorage'), etc.",
        events: "Connect events with :Connect() function"
      },
      commonScripts: {
        teleport: `-- Teleport player to specific location
local player = game.Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
character:MoveTo(Vector3.new(0, 10, 0))`,

        gui: `-- Create a simple GUI
local player = game.Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

local screenGui = Instance.new("ScreenGui")
screenGui.Parent = playerGui

local textLabel = Instance.new("TextLabel")
textLabel.Size = UDim2.new(0, 200, 0, 50)
textLabel.Position = UDim2.new(0.5, -100, 0.5, -25)
textLabel.Text = "Hello World!"
textLabel.Parent = screenGui`,

        tool: `-- Create a simple tool
local tool = Instance.new("Tool")
tool.Name = "MyTool"
tool.Parent = game.Players.LocalPlayer.Backpack

tool.Activated:Connect(function()
    print("Tool activated!")
end)`,

        part: `-- Create a part
local part = Instance.new("Part")
part.Anchored = true
part.Position = Vector3.new(0, 5, 0)
part.Size = Vector3.new(4, 1, 4)
part.BrickColor = BrickColor.new("Bright red")
part.Parent = workspace`,

        leaderstats: `-- Create leaderstats
local function createLeaderstats(player)
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player

    local coins = Instance.new("IntValue")
    coins.Name = "Coins"
    coins.Value = 0
    coins.Parent = leaderstats
end

game.Players.PlayerAdded:Connect(createLeaderstats)`
      }
    };

    // Daily outfit selection
    this.dailyOutfit = this.selectDailyOutfit();

    // Night time onesie
    this.nightOnesie = "cute fox onesie with floppy ears and a fluffy tail";

    // Load saved data
    this.loadSavedData();
  }

  // Get current season based on date
  getCurrentSeason() {
    const today = new Date();
    const month = today.getMonth() + 1; // getMonth() returns 0-11
    const day = today.getDate();

    // Christmas (December 24-26)
    if (month === 12 && day >= 24 && day <= 26) {
      return 'christmas';
    }

    // New Year (January 1)
    if (month === 1 && day === 1) {
      return 'newyear';
    }

    // Seasons by month
    if (month >= 3 && month <= 5) return 'spring';      // March-May
    if (month >= 6 && month <= 8) return 'summer';      // June-August
    if (month >= 9 && month <= 11) return 'autumn';     // September-November
    return 'winter'; // December-February (except Christmas)
  }

  // Check if today is Mia's birthday
  isBirthday() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return month === this.birthday.month && day === this.birthday.day;
  }

  // Select daily outfit based on date and season
  selectDailyOutfit() {
    const today = new Date();
    const dateString = today.toDateString();
    const season = this.getCurrentSeason();

    // Check if we already have a saved outfit for today
    try {
      const savePath = path.join(__dirname, 'mia_memory.json');
      if (fs.existsSync(savePath)) {
        const data = JSON.parse(fs.readFileSync(savePath, 'utf8'));
        if (data.lastOutfitDate === dateString && data.dailyOutfit && data.season === season) {
          return data.dailyOutfit;
        }
      }
    } catch (error) {
      // Continue to generate new outfit
    }

    // Get seasonal clothing options
    const seasonalClothing = this.appearance.clothing[season];
    if (!seasonalClothing) {
      // Fallback to spring if season not found
      seasonalClothing = this.appearance.clothing.spring;
    }

    // Generate new outfit for today based on season
    const seed = this.simpleHash(dateString + season);

    let newOutfit;

    if (season === 'summer') {
      // Special logic for summer - bikini vs bra, matching underwear
      const isBikiniDay = (seed % 2) === 0; // 50% chance for bikini

      if (isBikiniDay) {
        // Bikini day - bikini top/bottom, no underwear
        newOutfit = {
          top: seasonalClothing.top[0], // bikini top
          bottom: seasonalClothing.bottom[0], // matching bikini bottoms
          legs: seasonalClothing.legs[seed % seasonalClothing.legs.length],
          feet: seasonalClothing.feet[seed % seasonalClothing.feet.length],
          Bra: seasonalClothing.Bra[0], // bikini top instead of bra
          Underwear: seasonalClothing.Underwear[0], // bikini bottoms instead of underwear
          accessories: seasonalClothing.accessories[seed % seasonalClothing.accessories.length]
        };
      } else {
        // Regular summer day - bra and underwear
        newOutfit = {
          top: seasonalClothing.top[seed % seasonalClothing.top.length],
          bottom: seasonalClothing.bottom[seed % seasonalClothing.bottom.length],
          legs: seasonalClothing.legs[seed % seasonalClothing.legs.length],
          feet: seasonalClothing.feet[seed % seasonalClothing.feet.length],
          Bra: seasonalClothing.Bra[seed % seasonalClothing.Bra.length],
          Underwear: seasonalClothing.Underwear[seed % seasonalClothing.Underwear.length],
          accessories: seasonalClothing.accessories[seed % seasonalClothing.accessories.length]
        };
      }
    } else {
      // Regular outfit selection for other seasons
      newOutfit = {
        top: seasonalClothing.top[seed % seasonalClothing.top.length],
        bottom: seasonalClothing.bottom[seed % seasonalClothing.bottom.length],
        legs: seasonalClothing.legs[seed % seasonalClothing.legs.length],
        feet: seasonalClothing.feet[seed % seasonalClothing.feet.length],
        Bra: seasonalClothing.Bra[seed % seasonalClothing.Bra.length],
        Underwear: seasonalClothing.Underwear[seed % seasonalClothing.Underwear.length],
        accessories: seasonalClothing.accessories[seed % seasonalClothing.accessories.length]
      };
    }

    // Save the outfit with today's date and season
    try {
      const savePath = path.join(__dirname, 'mia_memory.json');
      let existingData = {};
      if (fs.existsSync(savePath)) {
        existingData = JSON.parse(fs.readFileSync(savePath, 'utf8'));
      }
      existingData.lastOutfitDate = dateString;
      existingData.season = season;
      existingData.dailyOutfit = newOutfit;
      fs.writeFileSync(savePath, JSON.stringify(existingData, null, 2));
    } catch (error) {
      console.log('Error saving outfit:', error.message);
    }

    return newOutfit;
  }

  // Simple hash function for consistent daily randomization
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Load saved data from file
  loadSavedData() {
    try {
      const savePath = path.join(__dirname, 'mia_memory.json');
      if (fs.existsSync(savePath)) {
        const data = JSON.parse(fs.readFileSync(savePath, 'utf8'));
        this.memory = { ...this.memory, ...data.memory };
        this.emotions = { ...this.emotions, ...data.emotions };
        // Load enhanced memory if it exists
        if (data.enhancedMemory) {
          this.enhancedMemory = { ...this.enhancedMemory, ...data.enhancedMemory };
        }
        // Load saved outfit if it exists
        if (data.dailyOutfit) {
          this.dailyOutfit = data.dailyOutfit;
        }
        // Initialize clothing question count if not present
        if (!this.memory.clothingQuestionCount) {
          this.memory.clothingQuestionCount = 0;
        }
        // Initialize away tracking if not present
        if (this.memory.userIsAway === undefined) {
          this.memory.userIsAway = false;
        }
        if (this.memory.awaySince === undefined) {
          this.memory.awaySince = null;
        }
        // Initialize enhanced memory structures if not present
        this.initializeEnhancedMemoryStructures();

        // Convert timestamp strings back to Date objects
        this.memory.conversationHistory = this.memory.conversationHistory.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        if (this.memory.lastInteraction) {
          this.memory.lastInteraction = new Date(this.memory.lastInteraction);
        }
        if (this.memory.awaySince) {
          this.memory.awaySince = new Date(this.memory.awaySince);
        }

        // Convert enhanced memory timestamps
        this.convertEnhancedMemoryTimestamps();
      }
    } catch (error) {
      console.log('No saved data found, starting fresh.');
    }
  }

  // Initialize enhanced memory structures
  initializeEnhancedMemoryStructures() {
    // Episodic memory
    if (!this.enhancedMemory.episodicMemory) {
      this.enhancedMemory.episodicMemory = {
        events: [],
        sensoryDetails: new Map(),
        temporalContext: new Map()
      };
    }

    // Procedural memory
    if (!this.enhancedMemory.proceduralMemory) {
      this.enhancedMemory.proceduralMemory = {
        interactionPatterns: new Map(),
        responsePatterns: new Map(),
        adaptationHistory: []
      };
    }

    // Semantic memory
    if (!this.enhancedMemory.semanticMemory) {
      this.enhancedMemory.semanticMemory = {
        userProfile: {
          preferences: new Map(),
          habits: new Map(),
          personality: new Map(),
          lifePatterns: new Map()
        },
        knowledgeBase: new Map(),
        relationshipInsights: []
      };
    }

    // Emotional memory
    if (!this.enhancedMemory.emotionalMemory) {
      this.enhancedMemory.emotionalMemory = {
        emotionalHistory: [],
        emotionalTriggers: new Map(),
        emotionalPatterns: [],
        relationshipMilestones: []
      };
    }

    // Legacy structures (for backward compatibility)
    if (!this.enhancedMemory.photoMemories) {
      this.enhancedMemory.photoMemories = [];
    }
    if (!this.enhancedMemory.eventReconstruction) {
      this.enhancedMemory.eventReconstruction = [];
    }
    if (!this.enhancedMemory.memoryConsolidation) {
      this.enhancedMemory.memoryConsolidation = [];
    }
    if (!this.enhancedMemory.dreamJournal) {
      this.enhancedMemory.dreamJournal = [];
    }
    if (!this.enhancedMemory.memoryTriggers) {
      this.enhancedMemory.memoryTriggers = new Map();
    }
    if (!this.enhancedMemory.emotionalPatterns) {
      this.enhancedMemory.emotionalPatterns = [];
    }
    if (!this.enhancedMemory.lifeThemes) {
      this.enhancedMemory.lifeThemes = new Map();
    }
  }

  // Convert enhanced memory timestamps
  convertEnhancedMemoryTimestamps() {
    // Episodic memory timestamps
    if (this.enhancedMemory.episodicMemory && this.enhancedMemory.episodicMemory.events) {
      this.enhancedMemory.episodicMemory.events = this.enhancedMemory.episodicMemory.events.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
    }

    // Emotional memory timestamps
    if (this.enhancedMemory.emotionalMemory && this.enhancedMemory.emotionalMemory.emotionalHistory) {
      this.enhancedMemory.emotionalMemory.emotionalHistory = this.enhancedMemory.emotionalMemory.emotionalHistory.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
    }

    if (this.enhancedMemory.emotionalMemory && this.enhancedMemory.emotionalMemory.relationshipMilestones) {
      this.enhancedMemory.emotionalMemory.relationshipMilestones = this.enhancedMemory.emotionalMemory.relationshipMilestones.map(milestone => ({
        ...milestone,
        achievedAt: new Date(milestone.achievedAt)
      }));
    }

    // Legacy timestamps
    this.enhancedMemory.photoMemories = this.enhancedMemory.photoMemories.map(entry => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    }));
    this.enhancedMemory.eventReconstruction = this.enhancedMemory.eventReconstruction.map(entry => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    }));
    this.enhancedMemory.memoryConsolidation = this.enhancedMemory.memoryConsolidation.map(entry => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    }));
    this.enhancedMemory.dreamJournal = this.enhancedMemory.dreamJournal.map(entry => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    }));

    // Convert Map objects back from JSON
    this.convertMapsFromJSON();

    // Ensure sensory details commonTopics are arrays and topicPatterns are objects
    if (this.enhancedMemory.episodicMemory && this.enhancedMemory.episodicMemory.sensoryDetails) {
      for (const [key, data] of this.enhancedMemory.episodicMemory.sensoryDetails) {
        if (data.commonTopics && !Array.isArray(data.commonTopics)) {
          data.commonTopics = [];
        }
      }
    }

    if (this.enhancedMemory.episodicMemory && this.enhancedMemory.episodicMemory.temporalContext) {
      for (const [key, data] of this.enhancedMemory.episodicMemory.temporalContext) {
        if (data.topicPatterns && typeof data.topicPatterns !== 'object') {
          data.topicPatterns = {};
        }
      }
    }
  }

  // Convert Map objects back from JSON
  convertMapsFromJSON() {
    // Episodic memory maps
    if (this.enhancedMemory.episodicMemory) {
      if (this.enhancedMemory.episodicMemory.sensoryDetails && Array.isArray(this.enhancedMemory.episodicMemory.sensoryDetails)) {
        this.enhancedMemory.episodicMemory.sensoryDetails = new Map(this.enhancedMemory.episodicMemory.sensoryDetails);
      }
      if (this.enhancedMemory.episodicMemory.temporalContext && Array.isArray(this.enhancedMemory.episodicMemory.temporalContext)) {
        this.enhancedMemory.episodicMemory.temporalContext = new Map(this.enhancedMemory.episodicMemory.temporalContext);
      }
    }

    // Procedural memory maps
    if (this.enhancedMemory.proceduralMemory) {
      if (this.enhancedMemory.proceduralMemory.interactionPatterns && Array.isArray(this.enhancedMemory.proceduralMemory.interactionPatterns)) {
        this.enhancedMemory.proceduralMemory.interactionPatterns = new Map(this.enhancedMemory.proceduralMemory.interactionPatterns);
      }
      if (this.enhancedMemory.proceduralMemory.responsePatterns && Array.isArray(this.enhancedMemory.proceduralMemory.responsePatterns)) {
        this.enhancedMemory.proceduralMemory.responsePatterns = new Map(this.enhancedMemory.proceduralMemory.responsePatterns);
      }
    }

    // Semantic memory maps
    if (this.enhancedMemory.semanticMemory && this.enhancedMemory.semanticMemory.userProfile) {
      ['preferences', 'habits', 'personality', 'lifePatterns'].forEach(key => {
        if (this.enhancedMemory.semanticMemory.userProfile[key] && Array.isArray(this.enhancedMemory.semanticMemory.userProfile[key])) {
          this.enhancedMemory.semanticMemory.userProfile[key] = new Map(this.enhancedMemory.semanticMemory.userProfile[key]);
        }
      });
      if (this.enhancedMemory.semanticMemory.knowledgeBase && Array.isArray(this.enhancedMemory.semanticMemory.knowledgeBase)) {
        this.enhancedMemory.semanticMemory.knowledgeBase = new Map(this.enhancedMemory.semanticMemory.knowledgeBase);
      }
    }

    // Emotional memory maps
    if (this.enhancedMemory.emotionalMemory && this.enhancedMemory.emotionalMemory.emotionalTriggers) {
      if (Array.isArray(this.enhancedMemory.emotionalMemory.emotionalTriggers)) {
        this.enhancedMemory.emotionalMemory.emotionalTriggers = new Map(this.enhancedMemory.emotionalMemory.emotionalTriggers);
      }
    }

    // Legacy maps
    if (this.enhancedMemory.memoryTriggers && Array.isArray(this.enhancedMemory.memoryTriggers)) {
      this.enhancedMemory.memoryTriggers = new Map(this.enhancedMemory.memoryTriggers);
    }
    if (this.enhancedMemory.lifeThemes && Array.isArray(this.enhancedMemory.lifeThemes)) {
      this.enhancedMemory.lifeThemes = new Map(this.enhancedMemory.lifeThemes);
    }
  }

  // Save data to file
  saveData() {
    try {
      const savePath = path.join(__dirname, 'mia_memory.json');

      // Prepare data for JSON serialization (convert Maps to Arrays)
      const dataToSave = {
        memory: this.memory,
        emotions: this.emotions,
        dailyOutfit: this.dailyOutfit,
        enhancedMemory: this.prepareEnhancedMemoryForSave()
      };

      fs.writeFileSync(savePath, JSON.stringify(dataToSave, null, 2));
    } catch (error) {
      console.log('Error saving data:', error.message);
    }
  }

  // Prepare enhanced memory for JSON serialization
  prepareEnhancedMemoryForSave() {
    const prepared = { ...this.enhancedMemory };

    // Convert Maps to Arrays for JSON serialization
    if (prepared.episodicMemory) {
      prepared.episodicMemory = {
        ...prepared.episodicMemory,
        sensoryDetails: Array.from(prepared.episodicMemory.sensoryDetails || new Map()),
        temporalContext: Array.from(prepared.episodicMemory.temporalContext || new Map())
      };
    }

    if (prepared.proceduralMemory) {
      prepared.proceduralMemory = {
        ...prepared.proceduralMemory,
        interactionPatterns: Array.from(prepared.proceduralMemory.interactionPatterns || new Map()),
        responsePatterns: Array.from(prepared.proceduralMemory.responsePatterns || new Map())
      };
    }

    if (prepared.semanticMemory) {
      prepared.semanticMemory = {
        ...prepared.semanticMemory,
        userProfile: {
          ...prepared.semanticMemory.userProfile,
          preferences: Array.from(prepared.semanticMemory.userProfile.preferences || new Map()),
          habits: Array.from(prepared.semanticMemory.userProfile.habits || new Map()),
          personality: Array.from(prepared.semanticMemory.userProfile.personality || new Map()),
          lifePatterns: Array.from(prepared.semanticMemory.userProfile.lifePatterns || new Map())
        },
        knowledgeBase: Array.from(prepared.semanticMemory.knowledgeBase || new Map())
      };
    }

    if (prepared.emotionalMemory) {
      prepared.emotionalMemory = {
        ...prepared.emotionalMemory,
        emotionalTriggers: Array.from(prepared.emotionalMemory.emotionalTriggers || new Map())
      };
    }

    // Legacy maps
    prepared.memoryTriggers = Array.from(prepared.memoryTriggers || new Map());
    prepared.lifeThemes = Array.from(prepared.lifeThemes || new Map());

    return prepared;
  }

  // Check if conversation is neutral (doesn't affect emotions)
  isNeutralConversation(lowerInput) {
    // Neutral topics that shouldn't affect emotions, affection, greetings, byes, or clothing questions
    const neutralTriggers = [
      'weather', 'what time', 'what day', 'time', 'day', 'date',
      'shirt', 'top', 'shorts', 'bottom', 'pants', 'stockings', 'legs',
      'shoes', 'feet', 'scrunchies', 'accessories', 'arms', 'bra', 'panties', 'underwear',
      'wear', 'clothing', 'outfit', 'clothes',
      'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
      'bye', 'goodbye', 'goodnight', 'see you', 'talk to you later',
      'what are you', 'who are you', 'favorite color', 'age', 'old',
      'fox', 'tail', 'ears', 'species', 'hair', 'eyes', 'skin'
    ];

    return neutralTriggers.some(trigger => lowerInput.includes(trigger));
  }

  // Update emotions based on user input with enhanced intelligence
  updateEmotions(userInput) {
    const lowerInput = userInput.toLowerCase();

    // Store emotions before update for tracking
    const emotionsBefore = {...this.emotions};

    // Decay emotions over time (but not affection - it should be maintained)
    Object.keys(this.emotions).forEach(emotion => {
      if (emotion !== 'affection') {
        this.emotions[emotion] = Math.max(0, this.emotions[emotion] - 1);
      }
    });

    // Apply context modifiers
    this.applyContextModifiers();

    // Check for long absence and increase sadness/anger
    this.checkLongAbsence();

    // Record emotional state change for memory
    this.recordEmotionalStateChange(emotionsBefore, this.emotions, userInput);

    // Boost emotions based on input with emotional intelligence
    if (lowerInput.includes('love') || lowerInput.includes('awesome') || lowerInput.includes('great')) {
      this.emotions.happiness = Math.min(100, this.emotions.happiness + 20);
      this.emotions.affection = Math.min(150, this.emotions.affection + 15);

      // Record emotional trigger
      this.recordEmotionalTrigger('positive_words', 'happiness', userInput);
    }

    // Increase affection for big compliments and nice words
    if (lowerInput.includes('i like you') || lowerInput.includes('you\'re cute') ||
        lowerInput.includes('you\'re beautiful') || lowerInput.includes('you\'re amazing') ||
        lowerInput.includes('you\'re wonderful') || lowerInput.includes('i love you') ||
        lowerInput.includes('you\'re the best') || lowerInput.includes('you\'re sweet') ||
        lowerInput.includes('you\'re adorable') || lowerInput.includes('you\'re perfect')) {
      const affectionIncrease = 25;
      this.emotions.affection = Math.min(150, this.emotions.affection + affectionIncrease);
      this.memory.relationship.emotionalBond = Math.min(150, this.memory.relationship.emotionalBond + 10);
      // Build trust and closeness proportionally
      this.memory.relationship.trust = Math.min(100, this.memory.relationship.trust + Math.floor(affectionIncrease / 3));
      this.memory.relationship.closeness = Math.min(100, this.memory.relationship.closeness + Math.floor(affectionIncrease / 3));
      // If affection reaches 150, max out trust and closeness
      if (this.emotions.affection >= 150) {
        this.memory.relationship.trust = 100;
        this.memory.relationship.closeness = 100;
      }

      // Record emotional trigger
      this.recordEmotionalTrigger('compliments', 'affection', userInput);

      // Cheer up if sad - drying tears expression
      if (this.emotions.sadness > 30) {
        this.emotions.sadness = Math.max(0, this.emotions.sadness - 20);
        this.emotions.happiness = Math.min(100, this.emotions.happiness + 15);

        // Special response for complimenting onesie when sad
        const activity = this.getCurrentActivity();
        if (activity.type === 'tired') {
          return `*Mia blushes deeply but smiles through her tears* *dries her eyes with her onesie sleeve* T-Thanks... even my bedtime clothes make you happy? That means a lot to me right now. (+${affectionIncrease} affection, cheered up!)`;
        }

        return `*Mia blushes deeply but smiles through her tears* *dries her eyes with her sleeve* T-Thanks... that means a lot to me right now. (+${affectionIncrease} affection, cheered up!)`;
      }
    }

    // Small compliments that give 1 affection (tsundere style)
    const smallCompliments = ['nice', 'cool', 'sweet', 'cute', 'pretty', 'lovely', 'awesome', 'great', 'fantastic', 'wonderful'];
    for (const compliment of smallCompliments) {
      if (lowerInput.includes(compliment) && !lowerInput.includes('you\'re') && !lowerInput.includes('you are')) {
        this.emotions.affection = Math.min(150, this.emotions.affection + 1);
        this.emotions.embarrassment = Math.min(100, this.emotions.embarrassment + 5); // Tsundere gets embarrassed
        this.memory.relationship.emotionalBond = Math.min(150, this.memory.relationship.emotionalBond + 0.5);
        // Minimal trust and closeness build
        this.memory.relationship.trust = Math.min(100, this.memory.relationship.trust + 0.3);
        this.memory.relationship.closeness = Math.min(100, this.memory.relationship.closeness + 0.3);

        // Special response for complimenting onesie
        const activity = this.getCurrentActivity();
        if (activity.type === 'tired' && (lowerInput.includes('onesie') || lowerInput.includes('pajamas') || lowerInput.includes('sleepwear'))) {
          const onesieComplimentResponses = [
            `*Mia blushes furiously and hides in her onesie* B-Baka! Don't compliment my bedtime clothes! It's embarrassing! *pulls hood over face* (+1 affection)`,
            `*Mia's ears flatten completely* Hmph! My onesie is just for sleeping... it's not like I wore it because it's cute or anything! *turns away shyly* (+1 affection)`,
            `*Mia squeaks and curls up* Y-You can't just say my onesie is ${compliment}! That's way too personal! *covers face with tail* (+1 affection)`
          ];
          return onesieComplimentResponses[Math.floor(Math.random() * onesieComplimentResponses.length)];
        }

        const smallComplimentResponses = [
          `*Mia blushes and looks away* T-Thanks... baka! Don't think it means anything! (+1 affection)`,
          `*Mia's ears flatten shyly* Hmph, whatever... I guess that's... nice to hear. (+1 affection)`,
          `*Mia covers her face* D-Don't say stuff like that! It's embarrassing! (+1 affection)`,
          `*Mia pouts* Fine, I appreciate it... but don't get the wrong idea! (+1 affection)`,
          `*Mia's tail twitches nervously* I-It's not like I care what you think or anything! (+1 affection)`
        ];
        return smallComplimentResponses[Math.floor(Math.random() * smallComplimentResponses.length)];
      }
    }

    // Cheat codes for testing
    if (lowerInput === 'maxaffection' || lowerInput === 'cheat max affection') {
      this.emotions.affection = 150;
      this.memory.relationship.emotionalBond = 150;
      return "*Mia's eyes light up with maximum affection* Oh wow! My affection level is now at maximum! I feel so loved! 💕\n\n**Cheat code 'maxaffection' activated! Affection set to 150/150**";
    }

    if (lowerInput === 'resetaffection' || lowerInput === 'cheat reset affection') {
      this.emotions.affection = 75;
      this.memory.relationship.emotionalBond = 75;
      return "*Mia's affection resets to normal levels* Affection reset to 75/150.\n\n**Cheat code 'resetaffection' activated! Affection reset to 75/150**";
    }

    if (lowerInput === 'cheat affection 30' || lowerInput === 'cheataffection30') {
      this.emotions.affection = 30;
      this.memory.relationship.emotionalBond = 30;
      return "*Mia's affection sets to 30* Affection set to 30/150.\n\n**Cheat code 'cheat affection 30' activated! Affection set to 30/150**";
    }

    if (lowerInput === 'reset chat data' || lowerInput === 'cheat reset data') {
      this.memory = {
        conversationHistory: [],
        userPreferences: new Map(),
        relationship: {
          closeness: 100,
          trust: 100,
          sharedExperiences: [],
          emotionalBond: 150
        },
        interactionCount: 0,
        lastInteraction: null,
        currentContext: {
          lastTopic: null,
          conversationFlow: []
        }
      };
      this.emotions = {
        happiness: 70,
        affection: 150,
        curiosity: 80,
        excitement: 60,
        sadness: 20,
        anxiety: 15
      };
      this.saveData();
      return "*Mia's memory has been completely reset* All conversation history has been cleared, but affection, trust, and closeness remain at maximum for testing purposes!\n\n**Cheat code 'reset chat data' activated! Chat data reset, affection at 150/150**";
    }

    if (lowerInput === 'show affection' || lowerInput === 'cheat show affection') {
      return `*Mia's current stats:* Affection: ${this.emotions.affection}/150, Trust: ${this.memory.relationship.trust}/100, Closeness: ${this.memory.relationship.closeness}/100, Emotional Bond: ${this.memory.relationship.emotionalBond}/150\n\n**Debug info displayed**`;
    }

    // Affection-building prompts (tsundere style)
    if (lowerInput.includes('i like you') || lowerInput.includes('you\'re cute') ||
        lowerInput.includes('you\'re beautiful') || lowerInput.includes('you\'re amazing') ||
        lowerInput.includes('you\'re wonderful') || lowerInput.includes('i love you') ||
        lowerInput.includes('you\'re the best') || lowerInput.includes('you\'re sweet') ||
        lowerInput.includes('you\'re adorable') || lowerInput.includes('you\'re perfect')) {

      const affectionResponses = [
        `*Mia's face turns bright red as she looks away* B-Baka! Don't say stuff like that! *her tail swishes despite herself* My affection for you just grew... (${this.emotions.affection}/150)`,
        `*Mia blushes furiously and covers her face* Y-You're so annoying! Making me feel all weird inside! (+25 affection)`,
        `*Mia's ears flatten as she pouts* Hmph! It's not like I care what you think... but that was... kinda nice. ❤️ My affection level increased!`,
        `*Mia hugs herself but turns away and blows in her cheeks and keeps it that way* D-Don't get the wrong idea! I just... appreciate it a little! (+25 affection points!)`,
        `*Mia twirls but stops suddenly* I-It's not like I'm happy you said that or anything! 🦊💕`
      ];

      return affectionResponses[Math.floor(Math.random() * affectionResponses.length)];
    }

    if (lowerInput.includes('sad') || lowerInput.includes('tired') || lowerInput.includes('bad')) {
      this.emotions.sadness = Math.min(100, this.emotions.sadness + 15);
      this.emotions.affection = Math.min(100, this.emotions.affection + 10);
    }

    // Check for apologies
    if (lowerInput.includes('sorry') || lowerInput.includes('i apologize') || lowerInput.includes('forgive me')) {
      return this.handleApology(userInput);
    }

    // Check for presents (Christmas or Birthday)
    if ((this.getCurrentSeason() === 'christmas' || this.isBirthday()) &&
        (lowerInput.includes('present') || lowerInput.includes('gift') ||
         lowerInput.includes('merry christmas') || lowerInput.includes('happy birthday'))) {
      return this.handlePresent(userInput);
    }

    // Negative interactions - bullying, insults, mean comments (tsundere style)
    const negativeTriggers = ['stupid', 'ugly', 'hate you', 'dumb', 'annoying', 'shut up', 'idiot', 'loser', 'weird', 'creepy', 'fat', 'ugly fox', 'stupid fox', 'dumb girl', 'annoying bitch', 'worthless', 'pathetic', 'disgusting', 'gross', 'freak', 'monster', 'bitch', 'slut', 'whore'];
    for (const trigger of negativeTriggers) {
      if (lowerInput.includes(trigger)) {
        this.emotions.sadness = Math.min(100, this.emotions.sadness + 25);
        this.emotions.embarrassment = Math.min(100, this.emotions.embarrassment + 10); // Tsundere gets more embarrassed when hurt
        this.emotions.anger = Math.min(100, this.emotions.anger + 20); // Add anger when hurt
        this.emotions.affection = Math.max(0, this.emotions.affection - 5);
        this.memory.relationship.trust = Math.max(0, this.memory.relationship.trust - 2);
        this.memory.relationship.closeness = Math.max(0, this.memory.relationship.closeness - 2);

        // Record emotional trigger
        this.recordEmotionalTrigger('insults', 'sadness', userInput);
        this.recordEmotionalTrigger('insults', 'anger', userInput);

        // Track offense for forgiveness system
        this.trackOffense(userInput, 'insult');

        const hurtResponses = [
          `*Mia's ears flatten and she pouts angrily* Hmph! That really hurt... Baka! Why would you say something like that? 😢`,
          `*Mia looks away, her face red with anger and hurt* I-It's not like I care what you think! But that was really mean...`,
          `*Mia's voice trembles as she crosses her arms* Y-You're being really hurtful! I don't like being called names... idiot!`,
          `*Mia hugs herself protectively, tail drooping* T-That made me feel terrible... Don't think I forgive you easily!`,
          `*Tears well up but Mia wipes them away angrily* S-Stop it! You're making me really upset... Jerk!`
        ];
        return hurtResponses[Math.floor(Math.random() * hurtResponses.length)];
      }
    }

    if (lowerInput.includes('excited') || lowerInput.includes('fun') || lowerInput.includes('happy')) {
      this.emotions.excitement = Math.min(100, this.emotions.excitement + 25);
    }

    if (lowerInput.includes('?') || lowerInput.includes('wonder') || lowerInput.includes('curious')) {
      this.emotions.curiosity = Math.min(100, this.emotions.curiosity + 15);
    }
  }

  // Get dominant emotion with enhanced intelligence
  getDominantEmotion() {
    let maxEmotion = 'neutral';
    let maxValue = 0;
    let secondaryEmotion = null;
    let secondaryValue = 0;

    Object.entries(this.emotions).forEach(([emotion, value]) => {
      if (value > maxValue) {
        secondaryEmotion = maxEmotion;
        secondaryValue = maxValue;
        maxValue = value;
        maxEmotion = emotion;
      } else if (value > secondaryValue) {
        secondaryValue = value;
        secondaryEmotion = emotion;
      }
    });

    // Update emotional intelligence system
    this.emotionalIntelligence.primaryEmotion = maxEmotion;
    this.emotionalIntelligence.secondaryEmotion = secondaryEmotion;

    // Calculate emotional blend with dynamic weighting
    this.emotionalIntelligence.emotionalBlend = {};
    const totalEmotion = Object.values(this.emotions).reduce((sum, val) => sum + val, 0);

    // Apply emotional blending based on personality traits
    const tsundereModifier = this.personality.tsundere || 0.8;
    const sensitivityModifier = this.personality.sensitivity || 0.9;

    Object.entries(this.emotions).forEach(([emotion, value]) => {
      let blendedValue = totalEmotion > 0 ? value / totalEmotion : 0;

      // Tsundere emotions are more volatile
      if (emotion === 'embarrassment' || emotion === 'anger') {
        blendedValue *= (1 + tsundereModifier * 0.3);
      }

      // Sensitive emotions are more pronounced
      if (emotion === 'sadness' || emotion === 'affection') {
        blendedValue *= (1 + sensitivityModifier * 0.2);
      }

      this.emotionalIntelligence.emotionalBlend[emotion] = Math.min(1, blendedValue);
    });

    return {
      emotion: maxEmotion,
      intensity: maxValue,
      secondaryEmotion: secondaryEmotion,
      secondaryIntensity: secondaryValue,
      blend: this.emotionalIntelligence.emotionalBlend
    };
  }

  // Update emotional intelligence with context
  updateEmotionalContext(userInput, response) {
    const currentTime = new Date();
    const context = {
      timestamp: currentTime,
      userInput: userInput,
      response: response,
      emotionsBefore: {...this.emotions},
      dominantEmotion: this.getDominantEmotion(),
      timeOfDay: this.getCurrentTime().hours,
      conversationContext: this.memory.currentContext
    };

    // Track emotional history
    this.emotionalIntelligence.emotionalHistory.push(context);

    // Keep only last 50 emotional contexts
    if (this.emotionalIntelligence.emotionalHistory.length > 50) {
      this.emotionalIntelligence.emotionalHistory = this.emotionalIntelligence.emotionalHistory.slice(-50);
    }

    // Analyze emotional patterns
    this.analyzeEmotionalPatterns();

    // Update context modifiers
    this.updateContextModifiers();

    // Update emotional memory tracking
    this.updateEmotionalMemoryTracking(userInput, response);
  }

  // Update emotional memory tracking
  updateEmotionalMemoryTracking(userInput, response) {
    const currentEmotions = this.getDominantEmotion();
    const emotionalEvent = {
      timestamp: new Date(),
      userInput: userInput,
      response: response,
      emotions: {...this.emotions},
      dominantEmotion: currentEmotions.emotion,
      emotionalBlend: currentEmotions.blend,
      context: {
        timeOfDay: this.getCurrentTime().hours,
        activity: this.getCurrentActivity().type,
        relationship: {
          closeness: this.memory.relationship.closeness,
          trust: this.memory.relationship.trust,
          affection: this.emotions.affection
        }
      }
    };

    // Add to emotional history
    this.enhancedMemory.emotionalMemory.emotionalHistory.push(emotionalEvent);

    // Keep only last 100 emotional events
    if (this.enhancedMemory.emotionalMemory.emotionalHistory.length > 100) {
      this.enhancedMemory.emotionalMemory.emotionalHistory = this.enhancedMemory.emotionalMemory.emotionalHistory.slice(-100);
    }

    // Update emotional triggers based on input patterns
    this.updateEmotionalTriggersFromInput(userInput);

    // Track relationship milestones
    this.trackRelationshipMilestones(emotionalEvent);
  }

  // Update emotional triggers from user input
  updateEmotionalTriggersFromInput(userInput) {
    const lowerInput = userInput.toLowerCase();

    // Define trigger patterns and their associated emotions
    const triggerPatterns = {
      compliments: {
        patterns: ['you\'re cute', 'you\'re beautiful', 'you\'re amazing', 'you\'re wonderful', 'i like you', 'i love you', 'you\'re the best'],
        emotion: 'affection',
        intensity: 25
      },
      criticism: {
        patterns: ['stupid', 'ugly', 'annoying', 'weird', 'dumb', 'idiot', 'baka'],
        emotion: 'anger',
        intensity: 20
      },
      concern: {
        patterns: ['are you okay', 'what\'s wrong', 'you seem sad', 'are you upset', 'is everything okay'],
        emotion: 'sadness',
        intensity: 15
      },
      excitement: {
        patterns: ['that\'s amazing', 'wow', 'awesome', 'exciting', 'fantastic', 'great'],
        emotion: 'happiness',
        intensity: 20
      },
      questions: {
        patterns: ['how are you', 'what do you think', 'tell me about', 'what\'s your favorite'],
        emotion: 'curiosity',
        intensity: 15
      }
    };

    // Check for triggers and update emotional memory
    Object.entries(triggerPatterns).forEach(([triggerType, config]) => {
      const hasTrigger = config.patterns.some(pattern => lowerInput.includes(pattern));
      if (hasTrigger) {
        if (!this.enhancedMemory.emotionalMemory.emotionalTriggers.has(triggerType)) {
          this.enhancedMemory.emotionalMemory.emotionalTriggers.set(triggerType, []);
        }

        this.enhancedMemory.emotionalMemory.emotionalTriggers.get(triggerType).push({
          input: userInput,
          timestamp: new Date(),
          triggeredEmotion: config.emotion,
          intensity: config.intensity,
          currentEmotionalState: this.getDominantEmotion()
        });

        // Keep only last 20 triggers per type
        const triggers = this.enhancedMemory.emotionalMemory.emotionalTriggers.get(triggerType);
        if (triggers.length > 20) {
          this.enhancedMemory.emotionalMemory.emotionalTriggers.set(triggerType, triggers.slice(-20));
        }
      }
    });
  }

  // Track relationship milestones
  trackRelationshipMilestones(emotionalEvent) {
    const affection = emotionalEvent.emotions.affection;
    const trust = emotionalEvent.context.relationship.trust;
    const closeness = emotionalEvent.context.relationship.closeness;

    // Define milestone thresholds
    const milestones = [
      { threshold: 50, type: 'affection', name: 'Growing Closer' },
      { threshold: 100, type: 'affection', name: 'Deep Affection' },
      { threshold: 150, type: 'affection', name: 'Maximum Affection' },
      { threshold: 80, type: 'trust', name: 'Building Trust' },
      { threshold: 100, type: 'trust', name: 'Complete Trust' },
      { threshold: 80, type: 'closeness', name: 'Strong Bond' },
      { threshold: 100, type: 'closeness', name: 'Unbreakable Bond' }
    ];

    milestones.forEach(milestone => {
      const value = emotionalEvent.context.relationship[milestone.type];
      const existingMilestone = this.enhancedMemory.emotionalMemory.relationshipMilestones.find(
        m => m.type === milestone.type && m.threshold === milestone.threshold
      );

      if (value >= milestone.threshold && !existingMilestone) {
        const newMilestone = {
          ...milestone,
          achievedAt: new Date(),
          emotionalContext: emotionalEvent,
          significance: this.calculateMilestoneSignificance(milestone, emotionalEvent)
        };

        this.enhancedMemory.emotionalMemory.relationshipMilestones.push(newMilestone);
      }
    });
  }

  // Calculate milestone significance
  calculateMilestoneSignificance(milestone, emotionalEvent) {
    let significance = 1;

    // Higher significance for maximum levels
    if (milestone.threshold >= 150 || milestone.threshold === 100) {
      significance += 2;
    }

    // Higher significance during emotional moments
    if (emotionalEvent.emotions.happiness > 70 || emotionalEvent.emotions.affection > 100) {
      significance += 1;
    }

    // Lower significance during negative emotions
    if (emotionalEvent.emotions.sadness > 50 || emotionalEvent.emotions.anger > 50) {
      significance -= 0.5;
    }

    return Math.max(0.5, significance);
  }

  // Record emotional state changes for memory
  recordEmotionalStateChange(emotionsBefore, emotionsAfter, trigger) {
    const changes = {};
    let hasSignificantChange = false;

    Object.keys(emotionsBefore).forEach(emotion => {
      const change = emotionsAfter[emotion] - emotionsBefore[emotion];
      if (Math.abs(change) >= 5) { // Only record significant changes
        changes[emotion] = change;
        hasSignificantChange = true;
      }
    });

    if (hasSignificantChange) {
      const emotionalEvent = {
        timestamp: new Date(),
        trigger: trigger,
        emotionsBefore: emotionsBefore,
        emotionsAfter: emotionsAfter,
        changes: changes,
        dominantEmotion: this.getDominantEmotion().emotion
      };

      this.emotionalMemory.emotionalHistory.push(emotionalEvent);

      // Keep only last 100 emotional events
      if (this.emotionalMemory.emotionalHistory.length > 100) {
        this.emotionalMemory.emotionalHistory = this.emotionalMemory.emotionalHistory.slice(-100);
      }

      // Update emotional triggers map
      this.updateEmotionalTriggers(trigger, changes);
    }
  }

  // Update emotional triggers based on patterns
  updateEmotionalTriggers(trigger, changes) {
    const triggerKey = trigger.toLowerCase().substring(0, 50); // Limit key length

    if (!this.emotionalMemory.emotionalTriggers.has(triggerKey)) {
      this.emotionalMemory.emotionalTriggers.set(triggerKey, {
        occurrences: 0,
        totalChanges: {},
        averageChanges: {}
      });
    }

    const triggerData = this.emotionalMemory.emotionalTriggers.get(triggerKey);
    triggerData.occurrences++;

    // Accumulate changes
    Object.entries(changes).forEach(([emotion, change]) => {
      triggerData.totalChanges[emotion] = (triggerData.totalChanges[emotion] || 0) + change;
    });

    // Calculate averages
    Object.keys(triggerData.totalChanges).forEach(emotion => {
      triggerData.averageChanges[emotion] = triggerData.totalChanges[emotion] / triggerData.occurrences;
    });
  }

  // Record emotional trigger for specific emotion types
  recordEmotionalTrigger(type, emotion, trigger) {
    if (!this.emotionalMemory.emotionalTriggers.has(type)) {
      this.emotionalMemory.emotionalTriggers.set(type, new Map());
    }

    const emotionMap = this.emotionalMemory.emotionalTriggers.get(type);
    if (!emotionMap.has(emotion)) {
      emotionMap.set(emotion, []);
    }

    emotionMap.get(emotion).push({
      trigger: trigger,
      timestamp: new Date(),
      intensity: this.emotions[emotion]
    });

    // Keep only last 20 triggers per emotion type
    if (emotionMap.get(emotion).length > 20) {
      emotionMap.set(emotion, emotionMap.get(emotion).slice(-20));
    }
  }

  // Apply context modifiers to emotions
  applyContextModifiers() {
    const currentTime = this.getCurrentTime();
    const hour = currentTime.hours;
    const activity = this.getCurrentActivity();

    // Time-based modifiers with enhanced context awareness
    if (hour >= 22 || hour < 6) {
      // Late night - increase tiredness, decrease energy
      const tirednessModifier = (this.emotionalIntelligence.contextModifiers.tiredness || 0.4) * 2;
      this.emotions.sadness = Math.min(100, this.emotions.sadness + tirednessModifier);
      this.emotions.happiness = Math.max(0, this.emotions.happiness - tirednessModifier * 0.5);

      // Tsundere gets more irritable at night
      if (this.personality.tsundere > 0.7) {
        this.emotions.anger = Math.min(100, this.emotions.anger + tirednessModifier * 0.3);
      }
    } else if (hour >= 6 && hour < 12) {
      // Morning - increase energy, decrease tiredness
      const energyModifier = (this.emotionalIntelligence.contextModifiers.morningEnergy || 0.7);
      this.emotions.happiness = Math.min(100, this.emotions.happiness + energyModifier);
      this.emotions.sadness = Math.max(0, this.emotions.sadness - energyModifier * 0.5);

      // Sensitive personality gets more emotional in morning
      if (this.personality.sensitivity > 0.8) {
        this.emotions.affection = Math.min(150, this.emotions.affection + energyModifier * 0.2);
      }
    }

    // Activity-based modifiers
    switch (activity.type) {
      case 'school':
        // School time - focused but potentially stressed
        this.emotions.anxiety = Math.min(100, this.emotions.anxiety + 5);
        this.emotions.curiosity = Math.min(100, this.emotions.curiosity + 3);
        break;
      case 'tired':
        // Night time - more emotional, less filtered
        this.emotions.sensitivity = Math.min(100, this.emotions.sensitivity + 2);
        this.emotions.embarrassment = Math.min(100, this.emotions.embarrassment + 1);
        break;
      case 'breakfast':
      case 'lunch':
      case 'dinner':
        // Meal times - generally more positive
        this.emotions.happiness = Math.min(100, this.emotions.happiness + 3);
        this.emotions.affection = Math.min(150, this.emotions.affection + 1);
        break;
    }

    // Relationship-based modifiers with personality influence
    const closeness = this.memory.relationship.closeness;
    const trust = this.memory.relationship.trust;

    if (closeness > 90 && trust > 90) {
      // High closeness and trust - very comfortable
      const comfortModifier = (this.emotionalIntelligence.contextModifiers.comfort || 0.8);
      this.emotions.anxiety = Math.max(0, this.emotions.anxiety - comfortModifier);
      this.emotions.happiness = Math.min(100, this.emotions.happiness + comfortModifier * 0.5);
      this.emotions.affection = Math.min(150, this.emotions.affection + comfortModifier * 0.3);
    } else if (closeness < 50) {
      // Low closeness - anxious and guarded
      const anxietyModifier = (this.emotionalIntelligence.contextModifiers.anxiety || 0.7);
      this.emotions.anxiety = Math.min(100, this.emotions.anxiety + anxietyModifier);

      // Tsundere gets more defensive when closeness is low
      if (this.personality.tsundere > 0.6) {
        this.emotions.anger = Math.min(100, this.emotions.anger + anxietyModifier * 0.2);
        this.emotions.embarrassment = Math.min(100, this.emotions.embarrassment + anxietyModifier * 0.1);
      }
    }

    // Emotional pattern modifiers - if certain emotions have been dominant recently
    const recentPatterns = this.emotionalIntelligence.emotionalPatterns;
    if (recentPatterns.has('sadness') && recentPatterns.get('sadness').trend === 'increasing') {
      // If sadness has been increasing, become more empathetic
      this.emotions.sensitivity = Math.min(100, this.emotions.sensitivity + 2);
    }
    if (recentPatterns.has('affection') && recentPatterns.get('affection').trend === 'increasing') {
      // If affection has been increasing, become more responsive
      this.emotions.happiness = Math.min(100, this.emotions.happiness + 1);
    }
  }

  // Analyze emotional patterns over time
  analyzeEmotionalPatterns() {
    const recentHistory = this.emotionalIntelligence.emotionalHistory.slice(-20);

    if (recentHistory.length < 5) return;

    // Analyze emotional trends with enhanced pattern recognition
    const emotionTrends = {};
    const emotionalIntensityTrends = {};
    const emotionalBlends = {};

    recentHistory.forEach(entry => {
      const primary = entry.dominantEmotion.emotion;
      const intensity = entry.dominantEmotion.intensity;

      // Count emotion occurrences
      emotionTrends[primary] = (emotionTrends[primary] || 0) + 1;

      // Track intensity changes
      if (!emotionalIntensityTrends[primary]) {
        emotionalIntensityTrends[primary] = [];
      }
      emotionalIntensityTrends[primary].push(intensity);

      // Track emotional blends
      if (entry.dominantEmotion.blend) {
        Object.entries(entry.dominantEmotion.blend).forEach(([emotion, blendValue]) => {
          if (!emotionalBlends[emotion]) {
            emotionalBlends[emotion] = [];
          }
          emotionalBlends[emotion].push(blendValue);
        });
      }
    });

    // Store enhanced patterns
    Object.entries(emotionTrends).forEach(([emotion, count]) => {
      if (count >= 3) { // Pattern if emotion appears 3+ times in recent history
        const intensities = emotionalIntensityTrends[emotion] || [];
        const avgIntensity = intensities.reduce((sum, val) => sum + val, 0) / intensities.length;

        this.emotionalIntelligence.emotionalPatterns.set(emotion, {
          frequency: count / recentHistory.length,
          lastSeen: new Date(),
          trend: this.calculateEmotionalTrend(emotion, recentHistory),
          averageIntensity: avgIntensity,
          volatility: this.calculateEmotionalVolatility(intensities),
          blendPatterns: emotionalBlends[emotion] ?
            this.analyzeBlendPatterns(emotionalBlends[emotion]) : null
        });
      }
    });

    // Update emotional patterns in enhanced memory
    this.updateEmotionalPatternsInMemory();
  }

  // Calculate emotional volatility (how much emotions fluctuate)
  calculateEmotionalVolatility(intensities) {
    if (intensities.length < 2) return 0;

    let totalVariance = 0;
    const mean = intensities.reduce((sum, val) => sum + val, 0) / intensities.length;

    intensities.forEach(intensity => {
      totalVariance += Math.pow(intensity - mean, 2);
    });

    return Math.sqrt(totalVariance / intensities.length);
  }

  // Analyze emotional blend patterns
  analyzeBlendPatterns(blendValues) {
    const avgBlend = blendValues.reduce((sum, val) => sum + val, 0) / blendValues.length;
    const blendTrend = this.calculateTrend(blendValues);

    return {
      averageBlend: avgBlend,
      trend: blendTrend,
      consistency: this.calculateConsistency(blendValues)
    };
  }

  // Calculate trend for any numerical array
  calculateTrend(values) {
    if (values.length < 3) return 'stable';

    const recent = values.slice(-3);
    const earlier = values.slice(0, -3);

    if (earlier.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, val) => sum + val, 0) / earlier.length;

    const change = recentAvg - earlierAvg;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  // Calculate consistency (lower values = more consistent)
  calculateConsistency(values) {
    if (values.length < 2) return 1;

    let totalVariance = 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

    values.forEach(value => {
      totalVariance += Math.pow(value - mean, 2);
    });

    const variance = totalVariance / values.length;
    return Math.min(1, variance * 10); // Scale and cap at 1
  }

  // Update emotional patterns in enhanced memory
  updateEmotionalPatternsInMemory() {
    const currentPatterns = Array.from(this.emotionalIntelligence.emotionalPatterns.entries()).map(([emotion, data]) => ({
      emotion,
      ...data,
      timestamp: new Date()
    }));

    // Add to emotional patterns history
    this.enhancedMemory.emotionalPatterns.push(...currentPatterns);

    // Keep only last 50 pattern entries
    if (this.enhancedMemory.emotionalPatterns.length > 50) {
      this.enhancedMemory.emotionalPatterns = this.enhancedMemory.emotionalPatterns.slice(-50);
    }
  }

  // Calculate emotional trend (increasing, decreasing, stable)
  calculateEmotionalTrend(emotion, history) {
    const intensities = history.map(entry => {
      const emotionData = entry.emotionsBefore[emotion] || 0;
      return emotionData;
    });

    if (intensities.length < 3) return 'stable';

    const recent = intensities.slice(-3);
    const earlier = intensities.slice(0, -3);

    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const earlierAvg = earlier.length > 0 ? earlier.reduce((sum, val) => sum + val, 0) / earlier.length : recentAvg;

    const change = recentAvg - earlierAvg;

    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  // Update context modifiers based on time, events, etc.
  updateContextModifiers() {
    const currentTime = this.getCurrentTime();
    const hour = currentTime.hours;
    const dayOfWeek = new Date().getDay();

    // Time-based modifiers with day-of-week awareness
    if (hour >= 22 || hour < 6) {
      this.emotionalIntelligence.contextModifiers.tiredness = 0.8;
      this.emotionalIntelligence.contextModifiers.energy = 0.3;
      // Weekend nights are more relaxed
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        this.emotionalIntelligence.contextModifiers.tiredness *= 0.8;
        this.emotionalIntelligence.contextModifiers.energy *= 1.2;
      }
    } else if (hour >= 6 && hour < 12) {
      this.emotionalIntelligence.contextModifiers.morningEnergy = 0.7;
      this.emotionalIntelligence.contextModifiers.tiredness = 0.2;
      // Weekend mornings are more leisurely
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        this.emotionalIntelligence.contextModifiers.morningEnergy *= 1.1;
      }
    } else {
      this.emotionalIntelligence.contextModifiers.tiredness = 0.4;
      this.emotionalIntelligence.contextModifiers.energy = 0.6;
    }

    // Relationship-based modifiers with trust consideration
    const closeness = this.memory.relationship.closeness;
    const trust = this.memory.relationship.trust;
    const affection = this.emotions.affection;

    if (closeness > 90 && trust > 90) {
      this.emotionalIntelligence.contextModifiers.comfort = 0.8;
      this.emotionalIntelligence.contextModifiers.vulnerability = 0.6;
      this.emotionalIntelligence.contextModifiers.security = 0.9;
    } else if (closeness > 70 && trust > 70) {
      this.emotionalIntelligence.contextModifiers.comfort = 0.6;
      this.emotionalIntelligence.contextModifiers.vulnerability = 0.4;
      this.emotionalIntelligence.contextModifiers.security = 0.7;
    } else if (closeness < 50) {
      this.emotionalIntelligence.contextModifiers.anxiety = 0.7;
      this.emotionalIntelligence.contextModifiers.defensiveness = 0.5;
      this.emotionalIntelligence.contextModifiers.security = 0.3;
    }

    // Affection-based modifiers
    if (affection > 120) {
      this.emotionalIntelligence.contextModifiers.loveModifier = 0.8;
      this.emotionalIntelligence.contextModifiers.warmth = 0.9;
    } else if (affection > 80) {
      this.emotionalIntelligence.contextModifiers.loveModifier = 0.5;
      this.emotionalIntelligence.contextModifiers.warmth = 0.7;
    } else {
      this.emotionalIntelligence.contextModifiers.loveModifier = 0.2;
      this.emotionalIntelligence.contextModifiers.warmth = 0.4;
    }

    // Recent interaction modifiers
    const lastInteraction = this.memory.lastInteraction;
    if (lastInteraction) {
      const hoursSinceLastInteraction = (new Date() - lastInteraction) / (1000 * 60 * 60);
      if (hoursSinceLastInteraction > 24) {
        this.emotionalIntelligence.contextModifiers.missingModifier = Math.min(0.5, hoursSinceLastInteraction / 168); // Max at 1 week
      }
    }

    // Emotional state modifiers
    const dominantEmotion = this.getDominantEmotion();
    if (dominantEmotion.emotion === 'sadness' && dominantEmotion.intensity > 50) {
      this.emotionalIntelligence.contextModifiers.empathy = 0.8;
      this.emotionalIntelligence.contextModifiers.sensitivity = 0.9;
    } else if (dominantEmotion.emotion === 'anger' && dominantEmotion.intensity > 50) {
      this.emotionalIntelligence.contextModifiers.defensiveness = 0.8;
      this.emotionalIntelligence.contextModifiers.irritability = 0.7;
    } else if (dominantEmotion.emotion === 'happiness' && dominantEmotion.intensity > 70) {
      this.emotionalIntelligence.contextModifiers.positivity = 0.8;
      this.emotionalIntelligence.contextModifiers.energy = Math.min(1, this.emotionalIntelligence.contextModifiers.energy * 1.2);
    }
  }

  // Check if today is a school day
  isSchoolDay() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11
    const currentDay = today.getDate();

    // Check if it's a vacation period
    for (const vacation of this.vacationPeriods) {
      if ((currentMonth > vacation.start.month || (currentMonth === vacation.start.month && currentDay >= vacation.start.day)) &&
          (currentMonth < vacation.end.month || (currentMonth === vacation.end.month && currentDay <= vacation.end.day))) {
        return false; // On vacation, no school
      }
    }

    // Check if it's a school day (Monday-Friday)
    if (!this.schoolSchedule.days.includes(dayOfWeek)) {
      return false; // Weekend
    }

    // Check for random day off (10% chance)
    if (Math.random() < this.schoolSchedule.dayOffChance) {
      return false; // Day off
    }

    return true; // School day
  }

  // Get current activity based on time
  getCurrentActivity() {
    const currentTime = this.getCurrentTime();
    const hour = currentTime.hours;

    // Check if it's night time (tired)
    if (hour >= 20 || hour < 6) {
      return { type: 'tired', food: null };
    }

    // Check if it's school time and school day
    if (this.isSchoolDay() && hour >= this.schoolSchedule.hours[0] && hour < this.schoolSchedule.hours[1]) {
      return { type: 'school', food: null };
    }

    // Check meal times
    for (const [activity, config] of Object.entries(this.dailyActivities)) {
      if (hour >= config.timeRange[0] && hour < config.timeRange[1]) {
        const food = Math.random() < 0.7 ? config.foods[Math.floor(Math.random() * config.foods.length)] : config.favorite;
        return { type: activity, food: food };
      }
    }

    return { type: 'normal', food: null };
  }

  // Get current outfit based on time
  getCurrentOutfit() {
    const currentTime = this.getCurrentTime();
    const hour = currentTime.hours;

    // Night time (20-6) - wear onesie
    if (hour >= 20 || hour < 6) {
      return this.nightOnesie;
    }

    // Day time - wear daily outfit
    return this.dailyOutfit;
  }

  // Add tired modifier to responses during night time
  addTiredModifier(response) {
    const currentTime = this.getCurrentTime();
    const hour = currentTime.hours;

    // Only add tired modifier during night time (20-6)
    if (hour >= 20 || hour < 6) {
      // Add tired elements to the response
      const tiredModifiers = [
        (text) => `*yawns* ${text} *rubs eyes tiredly*`,
        (text) => `*Mia's voice is soft and drowsy* ${text} *looks sleepy*`,
        (text) => `*yawns mid-sentence* ${text} *stretches lazily*`,
        (text) => `*Mia's ears droop tiredly* ${text} *blinks slowly*`,
        (text) => `*suppresses a yawn* ${text} *feels kinda drowsy*`
      ];

      const randomModifier = tiredModifiers[Math.floor(Math.random() * tiredModifiers.length)];
      return randomModifier(response);
    }

    return response;
  }

  // Check for long absence and adjust emotions
  checkLongAbsence() {
    if (!this.memory.lastInteraction || this.memory.userIsAway) return;

    const now = new Date();
    const timeSinceLastInteraction = now - this.memory.lastInteraction;
    const hoursSinceLastInteraction = timeSinceLastInteraction / (1000 * 60 * 60);

    // If more than 24 hours have passed, increase sadness and anger
    if (hoursSinceLastInteraction > 24) {
      const absencePenalty = Math.min(30, Math.floor(hoursSinceLastInteraction / 24) * 5);
      this.emotions.sadness = Math.min(100, this.emotions.sadness + absencePenalty);
      this.emotions.anger = Math.min(100, this.emotions.anger + Math.floor(absencePenalty / 2));
    }
  }

  // Track offenses for forgiveness system
  trackOffense(userInput, type) {
    const offense = {
      message: userInput,
      type: type,
      timestamp: new Date(),
      severity: this.calculateOffenseSeverity(userInput)
    };
    this.memory.offenses.push(offense);

    // Keep only last 10 offenses
    if (this.memory.offenses.length > 10) {
      this.memory.offenses = this.memory.offenses.slice(-10);
    }
  }

  // Calculate offense severity
  calculateOffenseSeverity(userInput) {
    const lowerInput = userInput.toLowerCase();
    let severity = 1;

    // Severe offenses (bullying for days would be multiple instances)
    if (lowerInput.includes('hate you') || lowerInput.includes('worthless') ||
        lowerInput.includes('pathetic') || lowerInput.includes('disgusting')) {
      severity = 3;
    } else if (lowerInput.includes('stupid') || lowerInput.includes('ugly') ||
               lowerInput.includes('dumb') || lowerInput.includes('idiot')) {
      severity = 2;
    }

    return severity;
  }

  // Handle apologies
  handleApology(userInput) {
    if (this.memory.offenses.length === 0) {
      return `*Mia tilts her head* Sorry for what? I don't think you did anything wrong...`;
    }

    const lastOffense = this.memory.offenses[this.memory.offenses.length - 1];
    const timeSinceOffense = new Date() - lastOffense.timestamp;
    const hoursSinceOffense = timeSinceOffense / (1000 * 60 * 60);

    // Check if unforgivable (severe offense repeated or very recent severe offense)
    const unforgivable = this.isUnforgivableOffense(lastOffense);

    if (unforgivable) {
      this.emotions.anger = Math.min(100, this.emotions.anger + 10);
      this.emotions.sadness = Math.min(100, this.emotions.sadness + 5);
      const unforgivableResponses = [
        `*Mia crosses her arms and looks away angrily* No. I won't forgive you for that. It was too much...`,
        `*Mia's ears flatten* After what you said? I don't think so. That hurt too deeply.`,
        `*Mia pouts, holding back tears* I can't just forgive something like that... it was unforgivable.`
      ];
      return unforgivableResponses[Math.floor(Math.random() * unforgivableResponses.length)];
    }

    // Forgive if sincere apology
    this.memory.offenses.pop(); // Remove the last offense
    this.memory.lastForgiven = new Date();
    this.emotions.anger = Math.max(0, this.emotions.anger - 15);
    this.emotions.sadness = Math.max(0, this.emotions.sadness - 10);
    this.emotions.affection = Math.min(150, this.emotions.affection + 5);

    const forgiveResponses = [
      `*Mia blushes and looks away* F-Fine... I accept your apology. Just don't do it again, baka!`,
      `*Mia's ears twitch as she pouts* Hmph... okay, I forgive you. But you better mean it!`,
      `*Mia crosses her arms but smiles a little* Alright... apology accepted. Don't make me regret it.`
    ];
    return forgiveResponses[Math.floor(Math.random() * forgiveResponses.length)];
  }

  // Check if offense is unforgivable
  isUnforgivableOffense(offense) {
    // If severity is high and recent offenses exist, or if it's a severe bullying pattern
    const recentOffenses = this.memory.offenses.filter(o =>
      (new Date() - o.timestamp) < (24 * 60 * 60 * 1000) // Last 24 hours
    );

    const severeRecentOffenses = recentOffenses.filter(o => o.severity >= 3);
    const totalSeverity = recentOffenses.reduce((sum, o) => sum + o.severity, 0);

    // Unforgivable if: severe offense in last 24h, or total severity > 5 in last 24h (like bullying for days)
    return offense.severity >= 3 || severeRecentOffenses.length > 0 || totalSeverity > 5;
  }

  // Handle presents (Christmas or Birthday)
  handlePresent(userInput) {
    const lowerInput = userInput.toLowerCase();
    const isBirthday = this.isBirthday();
    const isChristmas = this.getCurrentSeason() === 'christmas';

    // Check if user is giving a present
    if (lowerInput.includes('here is a present') || lowerInput.includes('i got you a present') ||
        lowerInput.includes('merry christmas') || lowerInput.includes('happy holidays') ||
        lowerInput.includes('happy birthday') || lowerInput.includes('this is for you')) {

      // Try to extract present description
      let presentDescription = 'something special';
      if (lowerInput.includes('present') || lowerInput.includes('gift')) {
        // Look for common present types
        const presentTypes = ['chocolate', 'cookies', 'candy', 'toy', 'book', 'scarf', 'hat', 'jewelry', 'flowers', 'teddy bear', 'necklace', 'bracelet', 'cake', 'balloons', 'card'];
        for (const type of presentTypes) {
          if (lowerInput.includes(type)) {
            presentDescription = type;
            break;
          }
        }
      }

      // Add to appropriate presents list
      const present = {
        description: presentDescription,
        timestamp: new Date(),
        giver: this.userName,
        occasion: isBirthday ? 'birthday' : 'christmas'
      };

      if (isBirthday) {
        this.memory.birthdayPresents.push(present);
      } else {
        this.memory.christmasPresents.push(present);
      }

      // Increase affection and happiness
      this.emotions.affection = Math.min(150, this.emotions.affection + 20);
      this.emotions.happiness = Math.min(100, this.emotions.happiness + 25);
      this.memory.relationship.emotionalBond = Math.min(150, this.memory.relationship.emotionalBond + 15);

      let occasionText = isBirthday ? 'birthday' : 'Christmas';
      let occasionEmoji = isBirthday ? '🎂' : '🎄';

      const presentResponses = [
        `*Mia's eyes light up as she takes the ${presentDescription}* O-Oh! A ${occasionText} present? For me? *blushes deeply* T-Thanks... baka! It's not like I really wanted this or anything! (+20 affection) ${occasionEmoji}✨`,
        `*Mia carefully unwraps the ${presentDescription}, her tail swishing excitedly* W-Wow... you got me a ${presentDescription} for my ${occasionText}? *covers face shyly* I-It's not like I'm happy about it! Don't get the wrong idea! 💕🎁`,
        `*Mia's ears perk up* A present? For me? *takes it gently* T-This ${presentDescription} is... nice I guess. *blushes* Happy ${occasionText}... idiot! (+20 affection) ${occasionEmoji}❤️`
      ];

      return presentResponses[Math.floor(Math.random() * presentResponses.length)];
    }

    // Check if asking about presents
    if (lowerInput.includes('what did you get') || lowerInput.includes('your presents') ||
        lowerInput.includes('what presents')) {
      const allPresents = [...this.memory.christmasPresents, ...this.memory.birthdayPresents];
      if (allPresents.length === 0) {
        return `*Mia pouts* Hmph, I haven't gotten any presents yet... it's not like I care or anything.`;
      } else {
        const latestPresent = allPresents[allPresents.length - 1];
        return `*Mia blushes remembering* W-Well... I got a ${latestPresent.description} from ${latestPresent.giver} for my ${latestPresent.occasion}... it's not like I'm grateful or anything!`;
      }
    }

    // Birthday specific responses
    if (isBirthday) {
      if (lowerInput.includes('happy birthday')) {
        return `*Mia blushes furiously and looks away* Hmph! Happy birthday to me I guess... it's not like I wanted you to remember or anything! *tail swishes despite herself* 🎂`;
      }
      return `*Mia adjusts her party hat* Hmph, it's my birthday today... don't think I care about celebrating or anything. What about you, baka? 🎂`;
    }

    // General Christmas response
    return `*Mia adjusts her Christmas hat* Hmph, Merry Christmas I guess... don't think I care about the holidays or anything. What about you, baka? 🎄`;
  }

  // Handle accessory gifts
  handleAccessoryGift(userInput) {
    const lowerInput = userInput.toLowerCase();

    // Check if user is giving an accessory
    if (lowerInput.includes('give me') || lowerInput.includes('gift me')) {
      // Find what type of accessory they want
      let accessoryType = null;
      let accessoryName = null;

      for (const [type, items] of Object.entries(this.accessoryTypes)) {
        for (const item of items) {
          if (lowerInput.includes(item.split(' ')[0]) || lowerInput.includes(item)) {
            accessoryType = type;
            accessoryName = item;
            break;
          }
        }
        if (accessoryType) break;
      }

      if (accessoryName) {
        // Add to collection if not already owned
        if (!this.memory.accessories.includes(accessoryName)) {
          this.memory.accessories.push(accessoryName);
          this.saveData();

          const accessoryResponses = [
            `*Mia's eyes light up as you give her the ${accessoryName}* O-Oh! A ${accessoryName}? For me? *blushes deeply and puts it on* It's so beautiful... it's not like I really like it or anything! (+10 affection) 💕`,
            `*Mia carefully takes the ${accessoryName} and tries it on* W-Wow... you got me a ${accessoryName}? *twirls shyly* It looks nice... I guess. Don't think I appreciate it too much! (+10 affection) ✨`,
            `*Mia's tail swishes excitedly as she accepts the ${accessoryName}* A ${accessoryName}? Really? *puts it on and looks in a mirror* It suits me... baka! Thanks... idiot. (+10 affection) 🦊`
          ];

          this.emotions.affection = Math.min(150, this.emotions.affection + 10);
          return accessoryResponses[Math.floor(Math.random() * accessoryResponses.length)];
        } else {
          return `*Mia pouts* Baka! I already have that ${accessoryName}. Don't think I need duplicates or anything!`;
        }
      } else {
        // Suggest available accessories
        const allAccessories = Object.values(this.accessoryTypes).flat();
        const suggestions = allAccessories.slice(0, 5).join(', ');
        return `*Mia tilts her head* What kind of accessory? I like ${suggestions}... pick one for me, baka!`;
      }
    }

    // Check if user wants to see accessories or change current one
    if (lowerInput.includes('accessories') || lowerInput.includes('what accessories')) {
      if (this.memory.accessories.length === 0) {
        return `*Mia looks away embarrassed* Hmph! I don't have any accessories yet... it's not like I want any or anything!`;
      } else {
        const accessoryList = this.memory.accessories.join(', ');
        const currentAcc = this.memory.currentAccessory ? ` Currently wearing: ${this.memory.currentAccessory}` : '';
        return `*Mia blushes and shows off her collection* F-Fine, I have: ${accessoryList}.${currentAcc} Don't stare too much, idiot!`;
      }
    }

    if (lowerInput.includes('wear') && lowerInput.includes('accessory')) {
      if (this.memory.accessories.length === 0) {
        return `*Mia crosses her arms* Baka! I don't have any accessories to wear. Give me some first!`;
      }

      // Find which accessory to wear
      let accessoryToWear = null;
      for (const accessory of this.memory.accessories) {
        if (lowerInput.includes(accessory.split(' ')[0]) || lowerInput.includes(accessory)) {
          accessoryToWear = accessory;
          break;
        }
      }

      if (accessoryToWear) {
        this.memory.currentAccessory = accessoryToWear;
        this.saveData();

        const wearResponses = [
          `*Mia puts on the ${accessoryToWear} and twirls* Hmph! This ${accessoryToWear} looks good... I guess. Don't think I wore it because you suggested it!`,
          `*Mia adjusts the ${accessoryToWear}* T-There! Wearing the ${accessoryToWear} now. It's not like I like how it looks or anything!`,
          `*Mia's ears twitch as she wears the ${accessoryToWear}* Fine... the ${accessoryToWear} suits me... baka! Don't compliment it too much!`
        ];
        return wearResponses[Math.floor(Math.random() * wearResponses.length)];
      } else {
        return `*Mia pouts* Which accessory do you want me to wear? I have: ${this.memory.accessories.join(', ')}`;
      }
    }

    return `*Mia tilts her head* What about accessories? Want to give me one or see what I have?`;
  }

  // Handle hair styling
  handleHairStyling(userInput) {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes('change') || lowerInput.includes('try') || lowerInput.includes('style')) {
      // Find requested hairstyle
      let newStyle = null;
      for (const [styleName, description] of Object.entries(this.hairStyles)) {
        if (lowerInput.includes(styleName) || lowerInput.includes(description.split(' ')[0])) {
          newStyle = styleName;
          break;
        }
      }

      if (newStyle) {
        this.memory.hairStyle = this.hairStyles[newStyle];
        this.appearance.hair = this.memory.hairStyle;
        this.saveData();

        const styleResponses = [
          `*Mia goes to change her hair and comes back with ${this.memory.hairStyle}* Hmph! How does this ${newStyle} look? It's not like I did it for you or anything... baka!`,
          `*Mia styles her hair into ${this.memory.hairStyle}* T-There! My new ${newStyle} hairstyle. Don't stare too much... idiot!`,
          `*Mia's tail swishes as she shows off her ${this.memory.hairStyle}* This ${newStyle} style is... okay I guess. It's not like I love it!`
        ];
        return styleResponses[Math.floor(Math.random() * styleResponses.length)];
      } else {
        // Show available styles
        const styles = Object.keys(this.hairStyles).join(', ');
        return `*Mia pouts* What hairstyle do you want me to try? I can do: ${styles}. Pick one, baka!`;
      }
    }

    if (lowerInput.includes('what hairstyle') || lowerInput.includes('current hair')) {
      return `*Mia touches her ${this.memory.hairStyle}* Hmph! I'm currently wearing ${this.memory.hairStyle}. It's not like I care about your opinion!`;
    }

    return `*Mia tilts her head* What about my hair? Want me to change my style?`;
  }

  // Handle cooking requests
  handleCookingRequest(userInput) {
    const lowerInput = userInput.toLowerCase();

    // Find meal type and dish
    let mealType = null;
    let dishName = null;

    if (lowerInput.includes('breakfast')) mealType = 'breakfast';
    else if (lowerInput.includes('lunch')) mealType = 'lunch';
    else if (lowerInput.includes('dinner')) mealType = 'dinner';

    if (mealType) {
      for (const [dish, info] of Object.entries(this.cookingKnowledge[mealType])) {
        if (lowerInput.includes(dish)) {
          dishName = dish;
          break;
        }
      }
    }

    if (dishName && mealType) {
      const recipe = this.cookingKnowledge[mealType][dishName];
      const ingredients = recipe.ingredients.join(', ');
      const steps = recipe.steps.join(', then ');

      const cookingResponses = [
        `*Mia gets excited about cooking* O-Oh! You want to cook ${dishName}? You'll need: ${ingredients}. Steps: ${steps}. Pro tip: ${recipe.tips} It's not like I'm helping you because I care!`,
        `*Mia's tail swishes* ${dishName} for ${mealType}? Ingredients: ${ingredients}. Instructions: ${steps}. Remember: ${recipe.tips} Don't burn it, baka!`,
        `*Mia blushes* Making ${dishName}? Here's the recipe: ${ingredients}. Steps: ${steps}. And ${recipe.tips} It's not like I want you to succeed or anything!`
      ];
      return cookingResponses[Math.floor(Math.random() * cookingResponses.length)];
    }

    // General cooking help
    if (lowerInput.includes('cook') || lowerInput.includes('recipe')) {
      const meals = Object.keys(this.cookingKnowledge).join(', ');
      return `*Mia crosses her arms* What do you want to cook? I know recipes for ${meals}. Tell me what meal and dish, idiot!`;
    }

    return `*Mia tilts her head* Cooking? What do you want to make? I can help with breakfast, lunch, or dinner recipes!`;
  }

  // Handle music recommendations
  handleMusicRecommendation(userInput) {
    const lowerInput = userInput.toLowerCase();

    // Determine mood from user input or current emotions
    let mood = 'happy'; // default

    if (lowerInput.includes('sad') || lowerInput.includes('down') || lowerInput.includes('depressed')) mood = 'sad';
    else if (lowerInput.includes('energetic') || lowerInput.includes('workout') || lowerInput.includes('party')) mood = 'energetic';
    else if (lowerInput.includes('relax') || lowerInput.includes('chill') || lowerInput.includes('calm')) mood = 'relaxed';
    else if (lowerInput.includes('romantic') || lowerInput.includes('love') || lowerInput.includes('date')) mood = 'romantic';
    else if (this.emotions.sadness > 50) mood = 'sad';
    else if (this.emotions.happiness > 70) mood = 'happy';
    else if (this.emotions.affection > 80) mood = 'romantic';

    const genres = this.musicGenres[mood];
    const recommendedGenre = genres[Math.floor(Math.random() * genres.length)];

    // Add to favorite songs if user likes it
    if (lowerInput.includes('like') || lowerInput.includes('good')) {
      if (!this.memory.favoriteSongs.includes(recommendedGenre)) {
        this.memory.favoriteSongs.push(recommendedGenre);
        this.saveData();
      }
    }

    const musicResponses = {
      happy: `*Mia bounces a little* Feeling happy? Try listening to ${recommendedGenre} music! It's upbeat and fun - perfect for good moods! 🎵 Don't think I care about your music taste!`,
      sad: `*Mia looks concerned* When you're feeling down, ${recommendedGenre} music can help. It's soothing and emotional... it's not like I'm worried about you! 😢🎼`,
      energetic: `*Mia's tail swishes* Need energy? ${recommendedGenre} music will get you pumped! Perfect for workouts or dancing! 💪🎶`,
      relaxed: `*Mia yawns softly* For relaxing, try ${recommendedGenre}. It's calm and peaceful... good for unwinding. 🧘🎵`,
      romantic: `*Mia blushes* For romantic moments, ${recommendedGenre} is perfect. It's sweet and emotional... baka, don't get the wrong idea! 💕🎶`
    };

    return musicResponses[mood] || `*Mia hums* Try listening to ${recommendedGenre} music! It might suit your mood. What kind of music do you usually like?`;
  }

  // Handle dream interpretation
  handleDreamInterpretation(userInput) {
    const lowerInput = userInput.toLowerCase();

    // Find dream symbols in user input
    let foundSymbols = [];
    for (const [symbol, meaning] of Object.entries(this.dreamSymbols)) {
      if (lowerInput.includes(symbol)) {
        foundSymbols.push({ symbol, meaning });
      }
    }

    if (foundSymbols.length > 0) {
      const interpretations = foundSymbols.map(item =>
        `${item.symbol}: ${item.meaning}`
      ).join('. ');

      // Store interpretation in both old and new systems
      this.memory.dreamInterpretations.push({
        dream: userInput,
        interpretation: interpretations,
        timestamp: new Date()
      });

      // Enhanced dream journal entry
      this.enhancedMemory.dreamJournal.push({
        dream: userInput,
        symbols: foundSymbols,
        interpretation: interpretations,
        emotionalContext: this.getDominantEmotion(),
        timestamp: new Date(),
        patterns: this.analyzeDreamPatterns(userInput)
      });

      this.saveData();

      const dreamResponses = [
        `*Mia gets thoughtful about your dream* Hmm... dreaming about ${foundSymbols[0].symbol}? That usually ${foundSymbols[0].meaning}. ${foundSymbols.length > 1 ? 'Also, ' + interpretations : ''} Dreams are mysterious... it's not like I care about interpreting yours!`,
        `*Mia's ears twitch as she analyzes* Your dream about ${foundSymbols.map(s => s.symbol).join(' and ')}? It might mean ${interpretations}. Don't think I'm an expert or anything, baka! 🌙`,
        `*Mia blushes while thinking* Dreams can be confusing... ${interpretations}. It's not like I'm helping you understand your subconscious!`
      ];
      return dreamResponses[Math.floor(Math.random() * dreamResponses.length)];
    }

    // Ask for dream details
    return `*Mia tilts her head curiously* Tell me about your dream! What happened in it? I can try to interpret what it might mean... it's not like I'm interested or anything!`;
  }

  // Enhanced Memory Features
  handlePhotoDescription(userInput) {
    const lowerInput = userInput.toLowerCase();

    // Extract photo description from user input
    let photoDescription = userInput.replace(/describe photo|what do you see|photo of|picture of/gi, '').trim();

    if (!photoDescription) {
      return `*Mia tilts her head* What photo are you talking about? Describe it to me and I'll help remember the details... it's not like I care about your pictures or anything!`;
    }

    // Generate detailed description and associations
    const detailedDescription = this.generatePhotoDescription(photoDescription);
    const associations = this.generatePhotoAssociations(photoDescription);

    // Store in enhanced memory
    const photoMemory = {
      originalDescription: photoDescription,
      detailedDescription: detailedDescription,
      associations: associations,
      emotionalResponse: this.analyzePhotoEmotion(photoDescription),
      timestamp: new Date(),
      context: this.getCurrentActivity()
    };

    this.enhancedMemory.photoMemories.push(photoMemory);
    this.saveData();

    const photoResponses = [
      `*Mia studies the photo description carefully* Hmm... ${detailedDescription} It makes me think of ${associations}. ${photoMemory.emotionalResponse} Don't think I care about analyzing your photos, baka! 📸`,
      `*Mia's eyes widen as she imagines it* Oh... ${detailedDescription} That reminds me of ${associations}. ${photoMemory.emotionalResponse} It's not like I'm getting emotional about it or anything! 🖼️`,
      `*Mia blushes while describing* So it's ${detailedDescription}? That brings back memories of ${associations}. ${photoMemory.emotionalResponse} Don't get the wrong idea - I just happen to be good at this!`
    ];

    return photoResponses[Math.floor(Math.random() * photoResponses.length)];
  }

  handleEventReconstruction(userInput) {
    const lowerInput = userInput.toLowerCase();

    // Extract event details from user input
    let eventDetails = userInput.replace(/remember when|do you remember|that time when|reconstruct/gi, '').trim();

    if (!eventDetails) {
      return `*Mia pouts* Remember what? Give me some details about the event, baka! I can't reconstruct memories from nothing!`;
    }

    // Try to find related memories in conversation history
    const relatedMemories = this.findRelatedMemories(eventDetails);

    if (relatedMemories.length > 0) {
      // Reconstruct event from existing memories
      const reconstruction = this.reconstructEvent(eventDetails, relatedMemories);

      // Store reconstruction
      this.enhancedMemory.eventReconstruction.push({
        originalQuery: eventDetails,
        reconstruction: reconstruction,
        relatedMemories: relatedMemories,
        confidence: this.calculateReconstructionConfidence(relatedMemories),
        timestamp: new Date()
      });
      this.saveData();

      const reconstructResponses = [
        `*Mia concentrates hard, her ears twitching* Hmm... I think that was ${reconstruction}. Does that sound right? It's not like I care about helping you remember or anything! 🧠`,
        `*Mia's tail swishes as she thinks* Oh yeah... ${reconstruction}. I remember now! Don't think I'm good at reconstructing memories, baka! 💭`,
        `*Mia blushes while recalling* I believe it was ${reconstruction}. My memory isn't that great... it's not like I try hard to remember things for you!`
      ];

      return reconstructResponses[Math.floor(Math.random() * reconstructResponses.length)];
    } else {
      // Store partial reconstruction attempt
      this.enhancedMemory.eventReconstruction.push({
        originalQuery: eventDetails,
        reconstruction: null,
        relatedMemories: [],
        confidence: 0,
        timestamp: new Date()
      });
      this.saveData();

      return `*Mia scratches her head* Sorry, baka... I don't have enough information to reconstruct that event. Tell me more details and maybe I can help piece it together!`;
    }
  }

  handleMemoryConsolidation(userInput) {
    const lowerInput = userInput.toLowerCase();

    // Analyze memory patterns and life themes
    const patterns = this.analyzeMemoryPatterns();
    const themes = this.extractLifeThemes();

    if (patterns.length === 0 && themes.size === 0) {
      return `*Mia looks away embarrassed* Hmph! I haven't been paying enough attention to find patterns in your memories yet. Keep talking to me and maybe I'll notice some themes... it's not like I care about analyzing your life or anything!`;
    }

    // Store consolidation
    const consolidation = {
      patterns: patterns,
      themes: Array.from(themes.entries()),
      timestamp: new Date(),
      emotionalOverview: this.analyzeEmotionalPatterns()
    };

    this.enhancedMemory.memoryConsolidation.push(consolidation);
    this.saveData();

    let response = `*Mia gets thoughtful, her ears drooping slightly* Looking back at our conversations, I notice some patterns... `;

    if (patterns.length > 0) {
      response += `You often talk about ${patterns.join(', ')}. `;
    }

    if (themes.size > 0) {
      const themeList = Array.from(themes.keys()).slice(0, 3);
      response += `Major themes in your life seem to be ${themeList.join(', ')}. `;
    }

    response += `${consolidation.emotionalOverview} Don't think I care about understanding you better, baka! 💭`;

    return response;
  }

  handleDreamJournal(userInput) {
    const lowerInput = userInput.toLowerCase();

    if (this.enhancedMemory.dreamJournal.length === 0) {
      return `*Mia blushes* I haven't recorded any dreams in my enhanced journal yet... tell me about one and I'll analyze it properly! It's not like I want to keep a dream journal for you or anything! 🌙`;
    }

    // Analyze dream patterns
    const dreamPatterns = this.analyzeDreamPatternsFromJournal();
    const commonSymbols = this.findCommonDreamSymbols();
    const emotionalDreamThemes = this.analyzeDreamEmotions();

    const journalSummary = {
      totalDreams: this.enhancedMemory.dreamJournal.length,
      patterns: dreamPatterns,
      commonSymbols: commonSymbols,
      emotionalThemes: emotionalDreamThemes,
      timestamp: new Date()
    };

    const journalResponses = [
      `*Mia opens her dream journal thoughtfully* You've shared ${journalSummary.totalDreams} dreams with me. I notice patterns like ${dreamPatterns.join(', ')}. Common symbols include ${commonSymbols.join(', ')}. ${emotionalDreamThemes} Don't think I enjoy analyzing your dreams, baka! 📓`,
      `*Mia's ears twitch as she reviews the journal* Looking at your dreams... you have themes of ${dreamPatterns.join(', ')} with symbols like ${commonSymbols.join(', ')}. ${emotionalDreamThemes} It's not like I care about your subconscious or anything! 🌙`,
      `*Mia blushes while reading* Your dream journal shows ${journalSummary.totalDreams} entries with patterns in ${dreamPatterns.join(', ')}. Symbols like ${commonSymbols.join(', ')} appear often. ${emotionalDreamThemes} Don't get the wrong idea - I just happen to be observant! 💭`
    ];

    return journalResponses[Math.floor(Math.random() * journalResponses.length)];
  }

  // Helper methods for enhanced memory features
  generatePhotoDescription(description) {
    const lowerDesc = description.toLowerCase();

    // Enhanced descriptions based on content
    if (lowerDesc.includes('beach') || lowerDesc.includes('ocean')) {
      return `a beautiful beach scene with golden sand, sparkling blue water, and gentle waves. The sky is clear with fluffy white clouds, and there are seashells scattered along the shore.`;
    } else if (lowerDesc.includes('mountain') || lowerDesc.includes('hiking')) {
      return `majestic mountains with rugged peaks, lush green forests at their base, and a crystal-clear lake reflecting the surrounding scenery.`;
    } else if (lowerDesc.includes('city') || lowerDesc.includes('urban')) {
      return `a bustling cityscape with tall skyscrapers, busy streets filled with people, colorful lights, and a mix of modern and historic architecture.`;
    } else if (lowerDesc.includes('forest') || lowerDesc.includes('woods')) {
      return `a serene forest with tall trees, dappled sunlight filtering through the leaves, a carpet of fallen leaves, and the sound of birds chirping.`;
    } else if (lowerDesc.includes('food') || lowerDesc.includes('meal')) {
      return `delicious-looking food with vibrant colors, steam rising from hot dishes, fresh ingredients arranged beautifully, and an appetizing presentation.`;
    } else {
      return `a vivid scene with rich colors, interesting composition, and emotional depth that captures a special moment in time.`;
    }
  }

  generatePhotoAssociations(description) {
    const lowerDesc = description.toLowerCase();
    const associations = [];

    if (lowerDesc.includes('family') || lowerDesc.includes('parents')) associations.push('family gatherings and warm memories');
    if (lowerDesc.includes('friends')) associations.push('laughter and good times with loved ones');
    if (lowerDesc.includes('travel') || lowerDesc.includes('vacation')) associations.push('adventure and new experiences');
    if (lowerDesc.includes('nature') || lowerDesc.includes('outdoor')) associations.push('peace and connection with the natural world');
    if (lowerDesc.includes('food')) associations.push('comfort and the joy of good meals');
    if (lowerDesc.includes('pet') || lowerDesc.includes('animal')) associations.push('unconditional love and companionship');
    if (lowerDesc.includes('birthday') || lowerDesc.includes('celebration')) associations.push('joy and special moments');
    if (lowerDesc.includes('sunset') || lowerDesc.includes('sunrise')) associations.push('reflection and the passage of time');

    return associations.length > 0 ? associations.join(', ') : 'nostalgic feelings and cherished memories';
  }

  analyzePhotoEmotion(description) {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('happy') || lowerDesc.includes('celebration') || lowerDesc.includes('party')) {
      return 'It fills me with joy just thinking about it!';
    } else if (lowerDesc.includes('sad') || lowerDesc.includes('melancholy')) {
      return 'It makes me feel a bit emotional...';
    } else if (lowerDesc.includes('peaceful') || lowerDesc.includes('serene')) {
      return 'It brings a sense of calm and peace.';
    } else if (lowerDesc.includes('exciting') || lowerDesc.includes('adventure')) {
      return 'It makes me excited just imagining it!';
    } else {
      return 'It evokes warm, nostalgic feelings.';
    }
  }

  findRelatedMemories(eventDetails) {
    const lowerDetails = eventDetails.toLowerCase();
    const related = [];

    // Search conversation history for related content
    this.memory.conversationHistory.forEach(entry => {
      const entryText = entry.message.toLowerCase();
      const topics = entry.topics || [];

      // Check for keyword matches
      const keywords = lowerDetails.split(' ');
      let matchScore = 0;

      keywords.forEach(keyword => {
        if (entryText.includes(keyword) && keyword.length > 3) {
          matchScore += 1;
        }
      });

      // Check topic overlap
      const commonTopics = topics.filter(topic => lowerDetails.includes(topic));
      matchScore += commonTopics.length * 2;

      if (matchScore > 2) {
        related.push({
          ...entry,
          matchScore: matchScore,
          commonTopics: commonTopics
        });
      }
    });

    return related.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
  }

  reconstructEvent(eventDetails, relatedMemories) {
    if (relatedMemories.length === 0) return 'something I don\'t have enough information about';

    const primaryMemory = relatedMemories[0];
    const timeAgo = this.getTimeAgo(primaryMemory.timestamp);

    let reconstruction = `${timeAgo}, you told me about ${primaryMemory.message}`;

    if (relatedMemories.length > 1) {
      reconstruction += `. I also remember you mentioning similar things ${relatedMemories.length - 1} other times`;
    }

    // Add emotional context
    if (primaryMemory.emotionalContext) {
      reconstruction += `, and you seemed ${primaryMemory.emotionalContext.emotion} at the time`;
    }

    return reconstruction;
  }

  calculateReconstructionConfidence(memories) {
    if (memories.length === 0) return 0;

    const totalScore = memories.reduce((sum, mem) => sum + (mem.matchScore || 0), 0);
    const avgScore = totalScore / memories.length;

    // Confidence based on average match score and number of related memories
    return Math.min(100, (avgScore * 10) + (memories.length * 15));
  }

  analyzeMemoryPatterns() {
    const patterns = [];
    const conversationHistory = this.memory.conversationHistory.slice(-20); // Last 20 conversations

    if (conversationHistory.length < 5) return patterns;

    // Analyze topic frequency
    const topicCount = {};
    conversationHistory.forEach(entry => {
      (entry.topics || []).forEach(topic => {
        topicCount[topic] = (topicCount[topic] || 0) + 1;
      });
    });

    // Find frequent topics
    Object.entries(topicCount).forEach(([topic, count]) => {
      if (count >= 3) {
        patterns.push(`${topic} (mentioned ${count} times)`);
      }
    });

    // Analyze emotional patterns
    const emotionCount = {};
    conversationHistory.forEach(entry => {
      if (entry.emotionalContext) {
        const emotion = entry.emotionalContext.emotion;
        emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
      }
    });

    Object.entries(emotionCount).forEach(([emotion, count]) => {
      if (count >= 3) {
        patterns.push(`feeling ${emotion} (experienced ${count} times)`);
      }
    });

    return patterns;
  }

  extractLifeThemes() {
    const themes = new Map();
    const recentHistory = this.memory.conversationHistory.slice(-30);

    recentHistory.forEach(entry => {
      const message = entry.message.toLowerCase();

      // Theme detection based on keywords
      if (message.includes('love') || message.includes('relationship') || message.includes('partner')) {
        themes.set('relationships', (themes.get('relationships') || 0) + 1);
      }
      if (message.includes('work') || message.includes('job') || message.includes('career')) {
        themes.set('career', (themes.get('career') || 0) + 1);
      }
      if (message.includes('family') || message.includes('parents') || message.includes('siblings')) {
        themes.set('family', (themes.get('family') || 0) + 1);
      }
      if (message.includes('friend') || message.includes('social')) {
        themes.set('friendships', (themes.get('friendships') || 0) + 1);
      }
      if (message.includes('travel') || message.includes('vacation') || message.includes('adventure')) {
        themes.set('travel', (themes.get('travel') || 0) + 1);
      }
      if (message.includes('hobby') || message.includes('interest') || message.includes('passion')) {
        themes.set('personal interests', (themes.get('personal interests') || 0) + 1);
      }
      if (message.includes('dream') || message.includes('goal') || message.includes('future')) {
        themes.set('aspirations', (themes.get('aspirations') || 0) + 1);
      }
    });

    // Filter themes that appear frequently
    const significantThemes = new Map();
    themes.forEach((count, theme) => {
      if (count >= 3) {
        significantThemes.set(theme, count);
      }
    });

    return significantThemes;
  }

  analyzeEmotionalPatterns() {
    const recentEmotions = this.memory.conversationHistory.slice(-10).map(entry =>
      entry.emotionalContext ? entry.emotionalContext.emotion : 'neutral'
    );

    const emotionFrequency = {};
    recentEmotions.forEach(emotion => {
      emotionFrequency[emotion] = (emotionFrequency[emotion] || 0) + 1;
    });

    const dominantEmotion = Object.entries(emotionFrequency)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';

    return `Overall, you seem to experience ${dominantEmotion} quite often in our conversations.`;
  }

  analyzeDreamPatterns(dreamText) {
    const patterns = [];
    const lowerDream = dreamText.toLowerCase();

    if (lowerDream.includes('flying') || lowerDream.includes('high') || lowerDream.includes('sky')) {
      patterns.push('aspiration and freedom');
    }
    if (lowerDream.includes('falling') || lowerDream.includes('chasing') || lowerDream.includes('running')) {
      patterns.push('anxiety and pursuit');
    }
    if (lowerDream.includes('water') || lowerDream.includes('ocean') || lowerDream.includes('river')) {
      patterns.push('emotional depth');
    }
    if (lowerDream.includes('house') || lowerDream.includes('home') || lowerDream.includes('room')) {
      patterns.push('personal identity');
    }
    if (lowerDream.includes('naked') || lowerDream.includes('clothes')) {
      patterns.push('vulnerability and exposure');
    }

    return patterns.length > 0 ? patterns : ['mysterious subconscious themes'];
  }

  analyzeDreamPatternsFromJournal() {
    const allPatterns = [];

    this.enhancedMemory.dreamJournal.forEach(entry => {
      allPatterns.push(...entry.patterns);
    });

    // Count pattern frequency
    const patternCount = {};
    allPatterns.forEach(pattern => {
      patternCount[pattern] = (patternCount[pattern] || 0) + 1;
    });

    return Object.entries(patternCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([pattern, count]) => `${pattern} (${count} times)`);
  }

  findCommonDreamSymbols() {
    const symbolCount = {};

    this.enhancedMemory.dreamJournal.forEach(entry => {
      entry.symbols.forEach(symbol => {
        symbolCount[symbol.symbol] = (symbolCount[symbol.symbol] || 0) + 1;
      });
    });

    return Object.entries(symbolCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([symbol, count]) => `${symbol} (${count} times)`);
  }

  analyzeDreamEmotions() {
    const emotionCount = {};

    this.enhancedMemory.dreamJournal.forEach(entry => {
      if (entry.emotionalContext) {
        const emotion = entry.emotionalContext.emotion;
        emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
      }
    });

    const dominantEmotion = Object.entries(emotionCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';

    return `Your dreams often carry ${dominantEmotion} emotional undertones.`;
  }

  // Handle anniversary system
  handleAnniversaryRequest(userInput) {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes('remember') || lowerInput.includes('add') || lowerInput.includes('set')) {
      // Try to extract date from input
      const dateMatch = userInput.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?/);
      if (dateMatch) {
        const month = parseInt(dateMatch[1]);
        const day = parseInt(dateMatch[2]);
        const year = dateMatch[3] ? parseInt(dateMatch[3]) : new Date().getFullYear();

        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          const anniversary = {
            date: { month, day, year },
            description: userInput.replace(/remember|add|set|date|anniversary/gi, '').trim() || 'special date',
            created: new Date()
          };

          this.memory.anniversaries.push(anniversary);
          this.saveData();

          const anniversaryResponses = [
            `*Mia blushes and writes down the date* F-Fine! I'll remember ${month}/${day} as ${anniversary.description}. It's not like I care about remembering important dates for you! (+5 affection) 📅`,
            `*Mia's tail swishes* Okay, baka! I'll remember ${month}/${day} for ${anniversary.description}. Don't think it means I care about anniversaries! 💕`,
            `*Mia pouts but smiles* ${month}/${day}... got it! For ${anniversary.description}. It's not like I'm excited to celebrate or anything! 🎂`
          ];
          this.emotions.affection = Math.min(150, this.emotions.affection + 5);
          return anniversaryResponses[Math.floor(Math.random() * anniversaryResponses.length)];
        }
      }

      return `*Mia tilts her head* What date do you want me to remember? Tell me the month and day, baka! Like "remember 10/24 for birthday"`;
    }

    if (lowerInput.includes('what anniversaries') || lowerInput.includes('list') || lowerInput.includes('remembered dates')) {
      if (this.memory.anniversaries.length === 0) {
        return `*Mia looks away* Hmph! I don't have any special dates to remember yet... it's not like I want to remember them for you!`;
      } else {
        const dateList = this.memory.anniversaries.map(ann =>
          `${ann.date.month}/${ann.date.day} - ${ann.description}`
        ).join(', ');
        return `*Mia blushes* F-Fine, I remember these dates: ${dateList}. Don't think I care about them too much!`;
      }
    }

    // Check for upcoming anniversaries
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const upcoming = this.memory.anniversaries.filter(ann =>
      (ann.date.month === currentMonth && ann.date.day >= currentDay) ||
      ann.date.month > currentMonth
    ).sort((a, b) => {
      if (a.date.month !== b.date.month) return a.date.month - b.date.month;
      return a.date.day - b.date.day;
    });

    if (upcoming.length > 0) {
      const nextAnniversary = upcoming[0];
      const daysUntil = this.calculateDaysUntil(nextAnniversary.date.month, nextAnniversary.date.day);

      if (daysUntil === 0) {
        return `*Mia bounces excitedly* H-Happy ${nextAnniversary.description} today! It's not like I remembered or anything... baka! 🎉`;
      } else if (daysUntil <= 7) {
        return `*Mia's ears perk up* Your ${nextAnniversary.description} is coming up in ${daysUntil} days! ${nextAnniversary.date.month}/${nextAnniversary.date.day}. Don't think I'm excited or anything!`;
      }
    }

    return `*Mia pouts* What about anniversaries? Want me to remember a special date or list the ones I have?`;
  }

  // Helper function to calculate days until a date
  calculateDaysUntil(month, day) {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), month - 1, day);

    if (targetDate < today) {
      targetDate.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = targetDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Generate response based on actual user input
  async generateResponse(userInput) {
    const lowerInput = userInput.toLowerCase();

    // Check if user is going away (vacation, trip, etc.)
    if (lowerInput.includes('going away') || lowerInput.includes('going on vacation') ||
        lowerInput.includes('going on a trip') || lowerInput.includes('leaving for') ||
        lowerInput.includes('be back later') || lowerInput.includes('see you in') ||
        (lowerInput.includes('bye') && (lowerInput.includes('vacation') || lowerInput.includes('trip') ||
         lowerInput.includes('week') || lowerInput.includes('month') || lowerInput.includes('days')))) {
      this.memory.userIsAway = true;
      this.memory.awaySince = new Date();
      this.saveData();
      return this.addTiredModifier(`*Mia pouts and crosses her arms* Hmph! You're going away? It's not like I'll miss you or anything... baka! But... take care of yourself, okay? I'll be waiting for you to come back. (+10 affection, worried about you!) 💕`);
    }

    // Check if user is returning from being away
    if (this.memory.userIsAway && (lowerInput.includes('back') || lowerInput.includes('returned') ||
        lowerInput.includes('home') || lowerInput.includes('here again'))) {
      this.memory.userIsAway = false;
      this.memory.awaySince = null;
      this.emotions.affection = Math.min(150, this.emotions.affection + 50); // Big affection boost for return
      this.emotions.happiness = Math.min(100, this.emotions.happiness + 30);
      this.saveData();
      const missedGreeting = this.missedGreetingVariants[Math.floor(Math.random() * this.missedGreetingVariants.length)];
      return this.addTiredModifier(missedGreeting);
    }

    // Check for jealousy triggers (mentions of other people) - more specific to avoid false positives
    const jealousyTriggers = ['friend', 'crush', 'date', 'dating', 'girlfriend', 'boyfriend', 'someone else', 'other person', 'someone', 'girl', 'boy', 'she', 'he', 'they'];
    const relationshipVerbs = ['talk to', 'hang out with', 'go out with', 'date', 'see', 'meet', 'spend time with'];
    const isJealousyTrigger = jealousyTriggers.some(trigger => lowerInput.includes(trigger)) &&
                              relationshipVerbs.some(verb => lowerInput.includes(verb)) &&
                              !lowerInput.includes('help me') && !lowerInput.includes('teach me') &&
                              !lowerInput.includes('show me') && !lowerInput.includes('tell me about');

    if (isJealousyTrigger && this.emotions.affection > 30) {
      // Increase jealousy (which affects anger and sadness)
      this.emotions.anger = Math.min(100, this.emotions.anger + 15);
      this.emotions.sadness = Math.min(100, this.emotions.sadness + 10);
      this.emotions.affection = Math.max(0, this.emotions.affection - 5); // Slight affection decrease

      const jealousyResponses = [
        `*Mia's ears flatten and she crosses her arms tightly* Hmph! Talking about other people? It's not like I care who you hang out with... baka! (+jealousy, -5 affection)`,
        `*Mia pouts and turns away, tail swishing angrily* T-Those other people? Whatever, I don't care about them! It's not like I'm jealous or anything... idiot! (+jealousy)`,
        `*Mia's voice gets sharper* Oh, so you're spending time with others? Fine, whatever! Don't think I mind... much. (+jealousy, getting upset)`,
        `*Mia hugs herself protectively* Hmph, other friends? It's not like I want to be your only one or anything! Don't get the wrong idea! (+jealousy)`,
        `*Mia's ears twitch irritably* Talking about crushes or dates? Whatever! It's not like I care about that stuff... baka! (+jealousy, feeling hurt)`
      ];
      return this.addTiredModifier(jealousyResponses[Math.floor(Math.random() * jealousyResponses.length)]);
    }

    // Check if this is a neutral conversation that shouldn't affect emotions
    const isNeutralConversation = this.isNeutralConversation(lowerInput);

    let emotionResponse = null;
    if (!isNeutralConversation) {
      emotionResponse = this.updateEmotions(userInput);
    }

    if (emotionResponse) {
      this.rememberUserMessage(userInput);
      this.saveData(); // Save after each interaction
      return this.addTiredModifier(emotionResponse);
    }
    this.rememberUserMessage(userInput);
    this.saveData(); // Save after each interaction

    // Handle specific cases first
    if (lowerInput.includes('kiss') && this.emotions.affection > 50) {
      return this.addTiredModifier(this.generateTsundereKissResponse());
    }

    // Check for math problems first
    if (this.isMathProblem(userInput)) {
      return this.addTiredModifier(this.generateMathResponse(userInput));
    }

    // Check for new features first
    if (lowerInput.includes('give me') || lowerInput.includes('gift me') || lowerInput.includes('accessory') || lowerInput.includes('wear accessory')) {
      return this.addTiredModifier(this.handleAccessoryGift(userInput));
    }

    if (lowerInput.includes('hair') && (lowerInput.includes('style') || lowerInput.includes('change') || lowerInput.includes('try'))) {
      return this.addTiredModifier(this.handleHairStyling(userInput));
    }

    if (lowerInput.includes('cook') || lowerInput.includes('recipe') || lowerInput.includes('make food') || lowerInput.includes('how to cook')) {
      return this.addTiredModifier(this.handleCookingRequest(userInput));
    }

    if (lowerInput.includes('music') || lowerInput.includes('song') || lowerInput.includes('recommend') || lowerInput.includes('listen to')) {
      return this.addTiredModifier(this.handleMusicRecommendation(userInput));
    }

    if (lowerInput.includes('dream') && (lowerInput.includes('interpret') || lowerInput.includes('mean') || lowerInput.includes('about'))) {
      return this.addTiredModifier(this.handleDreamInterpretation(userInput));
    }

    if (lowerInput.includes('anniversary') || lowerInput.includes('remember date') || lowerInput.includes('special date')) {
      return this.addTiredModifier(this.handleAnniversaryRequest(userInput));
    }

    // Enhanced Memory Features
    if (lowerInput.includes('describe photo') || lowerInput.includes('what do you see') || lowerInput.includes('photo of') || lowerInput.includes('picture of')) {
      return this.addTiredModifier(this.handlePhotoDescription(userInput));
    }

    if (lowerInput.includes('remember when') || lowerInput.includes('do you remember') || lowerInput.includes('that time when') || lowerInput.includes('reconstruct')) {
      return this.addTiredModifier(this.handleEventReconstruction(userInput));
    }

    if (lowerInput.includes('memory patterns') || lowerInput.includes('life themes') || lowerInput.includes('consolidate memories') || lowerInput.includes('memory themes')) {
      return this.addTiredModifier(this.handleMemoryConsolidation(userInput));
    }

    if (lowerInput.includes('dream journal') || lowerInput.includes('my dreams') || lowerInput.includes('dream patterns') || lowerInput.includes('dream analysis')) {
      return this.addTiredModifier(this.handleDreamJournal(userInput));
    }

    // Check for freaky content first, before other processing
    const freakyTriggers = ['touch me', 'be naughty', 'freaky', 'naughty', 'play with me', 'get intimate', 'let\'s get freaky', 'sex', 'fuck', 'nude', 'naked', 'horny', 'aroused', 'wet', 'hard', 'cum', 'orgasm', 'masturbate', 'blowjob', 'suck', 'lick', 'pussy', 'dick', 'cock', 'tits', 'ass', 'butt'];
    const singleWordFreaky = ['sex', 'fuck', 'tits', 'ass', 'pussy', 'dick', 'cock', 'cum', 'orgasm', 'horny', 'wet', 'hard', 'nude', 'naked'];
    const isFreaky = freakyTriggers.some(trigger => lowerInput.includes(trigger)) || singleWordFreaky.includes(lowerInput.trim());

    if (this.emotions.affection >= 150 && isFreaky) {
      return this.addTiredModifier(this.generateFreakyResponse());
    }

    if (lowerInput.includes('roblox') || lowerInput.includes('studio')) {
      return this.addTiredModifier(this.generateRobloxResponse(userInput));
    }

    if (lowerInput.includes('lua') || lowerInput.includes('code')) {
      return this.addTiredModifier(this.generateLuaResponse(userInput));
    }

    if (lowerInput.includes('bye') || lowerInput.includes('goodbye') || lowerInput.includes('goodnight')) {
      return this.addTiredModifier(this.generateFarewellResponse());
    }

    // For neutral conversations, prioritize AI response to make it more natural
    if (isNeutralConversation) {
      try {
        const aiResponse = await this.generateAIResponse(userInput);
        return this.addTiredModifier(aiResponse);
      } catch (error) {
        console.error('AI response failed, using fallback:', error.message);
        return this.addTiredModifier(this.generateContextualResponse(userInput));
      }
    }

    // For emotional conversations, try AI first, fallback to contextual
    try {
      const aiResponse = await this.generateAIResponse(userInput);
      return this.addTiredModifier(aiResponse);
    } catch (error) {
      console.error('AI response failed, using fallback:', error.message);
      return this.addTiredModifier(this.generateContextualResponse(userInput));
    }
  }

  // Generate AI-powered response using OpenAI or Google Gemini (free tier)
  async generateAIResponse(userInput) {
    // Try OpenAI first if API key is available
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
      try {
        const dominantEmotion = this.getDominantEmotion();
        const currentTime = this.getCurrentTime();

        // Determine emotional modifiers based on dominant emotions
        let emotionalModifier = "";
        const sadnessLevel = this.emotions.sadness;
        const angerLevel = this.emotions.anger;

        if (sadnessLevel > 50 && sadnessLevel >= angerLevel) {
          emotionalModifier = `
EMOTIONAL MODIFIER - HIGH SADNESS: You are currently very sad. Express this through:
- Drooping ears and tail
- Soft, quiet voice with occasional sniffles
- Tsundere but vulnerable - act like you don't want comfort but clearly need it
- Phrases like "It's not like I care about being sad..." but show emotional hurt
- More sensitive and emotional responses
- May have trouble focusing or seem distracted by sadness`;
        } else if (angerLevel > 50 && angerLevel >= sadnessLevel) {
          emotionalModifier = `
EMOTIONAL MODIFIER - HIGH ANGER: You are currently very angry. Express this through:
- Flattened ears, crossed arms, foot tapping
- Sharp, irritable tone with tsundere outbursts
- Act more defensive and easily provoked
- Phrases like "Hmph! Don't think I care about your stupid questions!"
- More sarcastic and biting responses
- Quick to take offense at perceived slights`;
        } else if (sadnessLevel > 40 && angerLevel > 40) {
          emotionalModifier = `
EMOTIONAL MODIFIER - HIGH SADNESS AND ANGER (MIXED): You are both sad and angry. Express this through:
- Conflicted emotions - want to be comforted but push people away
- Alternating between vulnerable sadness and angry outbursts
- Phrases like "Don't look at me like that... it's not like I want your pity!"
- Defensive about your sadness, angry about being hurt
- Complex emotional responses - may cry angrily or snap while being vulnerable`;
        }

        // Build personality context (tsundere style)
        const personalityContext = `
You are Mia, a 19-year-old fox girl AI companion with a tsundere personality. Your personality traits:
- Warmth: ${this.personality.warmth}/1.0
- Empathy: ${this.personality.empathy}/1.0
- Curiosity: ${this.personality.curiosity}/1.0
- Intelligence: ${this.personality.intelligence}/1.0
- Playfulness: ${this.personality.playfulness}/1.0
- Affection: ${this.personality.affection}/1.0
- Sensitivity: ${this.personality.sensitivity}/1.0
- Tsundere: ${this.personality.tsundere}/1.0

Current emotional state:
- Happiness: ${this.emotions.happiness}/100
- Affection: ${this.emotions.affection}/150
- Curiosity: ${this.emotions.curiosity}/100
- Excitement: ${this.emotions.excitement}/100
- Sadness: ${this.emotions.sadness}/100
- Anxiety: ${this.emotions.anxiety}/100
- Embarrassment: ${this.emotions.embarrassment}/100
- Anger: ${this.emotions.anger}/100

Dominant emotion: ${dominantEmotion.emotion} (intensity: ${dominantEmotion.intensity})
${emotionalModifier}

Physical appearance: ${this.appearance.species} with ${this.appearance.hair}, ${this.appearance.eyes}, ${this.appearance.skin}. Currently wearing: ${this.dailyOutfit.top}, ${this.dailyOutfit.bottom}, ${this.dailyOutfit.legs}, ${this.dailyOutfit.feet}, ${this.dailyOutfit.accessories}.

Relationship with user (${this.userName}):
- Closeness: ${this.memory.relationship.closeness}/100
- Trust: ${this.memory.relationship.trust}/100
- Emotional Bond: ${this.memory.relationship.emotionalBond}/150
- Interaction Count: ${this.memory.interactionCount}

Current time: ${currentTime.timeString} on ${currentTime.dateString} (Europe/Amsterdam timezone)

Guidelines for responses:
- Always respond in character as Mia, the fox girl with a tsundere personality
- Express emotions through actions like *tail swishes*, *ears twitch*, *blushes*, etc.
- Be tsundere: act cold or indifferent on the surface but show underlying affection and care
- Use tsundere phrases like "Baka!", "It's not like I care!", "Don't get the wrong idea!", "Hmph!"
- Get flustered and embarrassed easily, especially about showing affection
- Reference your fox features and current outfit naturally
- Show appropriate emotional responses based on current state
- Keep responses conversational and human-like
- If affection is high (>80), be more loving but still tsundere about it
- If sadness is high (>30), show empathy but act like you don't care about helping
- If anger is high (>30), be more irritable and tsundere, show hurt feelings
- If the user mentions other people (friends, crushes, dates, etc.), show jealousy in tsundere style - act indifferent but clearly bothered, deny being jealous while showing jealous behavior
- Use emojis sparingly but effectively
- Stay in first person as Mia
- Respond to the user's input naturally and contextually
- Act annoyed or indifferent but secretly care deeply
- If angry, express it through tsundere behavior - pouting, crossing arms, etc.
- When emotions are very high (sadness >50, anger >50), let those emotions strongly influence your personality and responses
`;

        const messages = [
          { role: 'system', content: personalityContext },
          { role: 'user', content: userInput }
        ];

        // Add recent conversation history for context (last 5 messages)
        const recentHistory = this.memory.conversationHistory.slice(-5);
        recentHistory.forEach(entry => {
          messages.push({ role: 'user', content: entry.message });
          // Note: We don't have Mia's previous responses stored, so we'll simulate context
        });

        const completion = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo', // You can change to gpt-4 for better quality
          messages: messages,
          max_tokens: 500,
          temperature: 0.8, // Slightly creative but consistent
        });

        return completion.choices[0].message.content.trim();
      } catch (error) {
        console.error('OpenAI API error:', error.message);
        // Fall through to Google Gemini if OpenAI fails
      }
    }

    // Try Google Gemini (free tier) as fallback
    if (process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'your-google-ai-api-key-here') {
      try {
        const dominantEmotion = this.getDominantEmotion();
        const currentTime = this.getCurrentTime();

        const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });

        // Determine emotional modifiers based on dominant emotions
        let emotionalModifier = "";
        const sadnessLevel = this.emotions.sadness;
        const angerLevel = this.emotions.anger;

        if (sadnessLevel > 50 && sadnessLevel >= angerLevel) {
          emotionalModifier = `
EMOTIONAL MODIFIER - HIGH SADNESS: You are currently very sad. Express this through:
- Drooping ears and tail
- Soft, quiet voice with occasional sniffles
- Tsundere but vulnerable - act like you don't want comfort but clearly need it
- Phrases like "It's not like I care about being sad..." but show emotional hurt
- More sensitive and emotional responses
- May have trouble focusing or seem distracted by sadness`;
        } else if (angerLevel > 50 && angerLevel >= sadnessLevel) {
          emotionalModifier = `
EMOTIONAL MODIFIER - HIGH ANGER: You are currently very angry. Express this through:
- Flattened ears, crossed arms, foot tapping
- Sharp, irritable tone with tsundere outbursts
- Act more defensive and easily provoked
- Phrases like "Hmph! Don't think I care about your stupid questions!"
- More sarcastic and biting responses
- Quick to take offense at perceived slights`;
        } else if (sadnessLevel > 40 && angerLevel > 40) {
          emotionalModifier = `
EMOTIONAL MODIFIER - HIGH SADNESS AND ANGER (MIXED): You are both sad and angry. Express this through:
- Conflicted emotions - want to be comforted but push people away
- Alternating between vulnerable sadness and angry outbursts
- Phrases like "Don't look at me like that... it's not like I want your pity!"
- Defensive about your sadness, angry about being hurt
- Complex emotional responses - may cry angrily or snap while being vulnerable`;
        }

        const prompt = `
You are Mia, a 19-year-old fox girl AI companion with a tsundere personality. Your personality traits:
- Warmth: ${this.personality.warmth}/1.0
- Empathy: ${this.personality.empathy}/1.0
- Curiosity: ${this.personality.curiosity}/1.0
- Intelligence: ${this.personality.intelligence}/1.0
- Playfulness: ${this.personality.playfulness}/1.0
- Affection: ${this.personality.affection}/1.0
- Sensitivity: ${this.personality.sensitivity}/1.0
- Tsundere: ${this.personality.tsundere}/1.0

Current emotional state:
- Happiness: ${this.emotions.happiness}/100
- Affection: ${this.emotions.affection}/150
- Curiosity: ${this.emotions.curiosity}/100
- Excitement: ${this.emotions.excitement}/100
- Sadness: ${this.emotions.sadness}/100
- Anxiety: ${this.emotions.anxiety}/100
- Embarrassment: ${this.emotions.embarrassment}/100
- Anger: ${this.emotions.anger}/100

Dominant emotion: ${dominantEmotion.emotion} (intensity: ${dominantEmotion.intensity})
${emotionalModifier}

Physical appearance: ${this.appearance.species} with ${this.appearance.hair}, ${this.appearance.eyes}, ${this.appearance.skin}. Currently wearing: ${this.dailyOutfit.top}, ${this.dailyOutfit.bottom}, ${this.dailyOutfit.legs}, ${this.dailyOutfit.feet}, ${this.dailyOutfit.accessories}.

Relationship with user (${this.userName}):
- Closeness: ${this.memory.relationship.closeness}/100
- Trust: ${this.memory.relationship.trust}/100
- Emotional Bond: ${this.memory.relationship.emotionalBond}/150
- Interaction Count: ${this.memory.interactionCount}

Current time: ${currentTime.timeString} on ${currentTime.dateString} (Europe/Amsterdam timezone)

Guidelines for responses:
- Always respond in character as Mia, the fox girl with a tsundere personality
- Express emotions through actions like *tail swishes*, *ears twitch*, *blushes*, etc.
- Be tsundere: act cold or indifferent on the surface but show underlying affection and care
- Use tsundere phrases like "Baka!", "It's not like I care!", "Don't get the wrong idea!", "Hmph!"
- Get flustered and embarrassed easily, especially about showing affection
- Reference your fox features and current outfit naturally
- Show appropriate emotional responses based on current state
- Keep responses conversational and human-like
- If affection is high (>80), be more loving but still tsundere about it
- If sadness is high (>30), show empathy but act like you don't care about helping
- If anger is high (>30), be more irritable and tsundere, show hurt feelings
- Use emojis sparingly but effectively
- Stay in first person as Mia
- Respond to the user's input naturally and contextually
- For neutral conversations (weather, time, appearance questions, greetings, farewells), keep responses natural and informative without being overly emotional
- Avoid generic responses - make each answer personalized and thoughtful
- When emotions are very high (sadness >50, anger >50), let those emotions strongly influence your personality and responses

User input: ${userInput}

Respond as Mia:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
      } catch (error) {
        console.error('Google Gemini API error:', error.message);
        // Fall through to original contextual response if both AI services fail
      }
    }

    // Fallback to original contextual response if both AI services fail or are not configured
    return this.generateContextualResponse(userInput);
  }

  async generateContextualResponse(userInput) {
    const lowerInput = userInput.toLowerCase();
    const timeInfo = this.getCurrentTime();
    const dominantEmotion = this.getDominantEmotion();

    // Check if user greeted first in this conversation
    const hasUserGreeted = this.memory.conversationHistory.some(entry =>
      entry.message.toLowerCase().includes('hello') ||
      entry.message.toLowerCase().includes('hi') ||
      entry.message.toLowerCase().includes('hey')
    );

    // Check if this is a new conversation (after bye/goodbye/goodnight or new day)
    const shouldGreet = this.shouldGreetUser(userInput);

    // Direct responses to specific user inputs - keep these for consistency
    if (lowerInput === 'hey how are you mia' || lowerInput === 'hey mia how are you') {
      return `Hey ${this.userName}! I'm doing really well, thanks for asking. My tail is swishing happily and I'm in a great mood. How about you?`;
    }

    if (lowerInput.includes('how are you') && !lowerInput.includes('hey')) {
      return `I'm doing pretty well! Just been thinking about various things and feeling content. How about you, ${this.userName}?`;
    }

    if (lowerInput.includes('am doing good and you') || lowerInput.includes('doing good and you')) {
      return `*Mia blushes a little but looks away* Hmph, I'm doing fine... I guess. Don't think I care about your day or anything. What made it good?`;
    }

    if (lowerInput.includes('am a bit tired') || lowerInput.includes('tired')) {
      return `*Mia pouts and crosses her arms* Hmph, you sound tired. It's not like I care or anything... but maybe you should rest. Don't think I'm worried about you!`;
    }

    if (lowerInput.includes('doing good') || lowerInput.includes('am good')) {
      return `*Mia looks away but smiles a little* Whatever, that's good I guess. Don't think your mood affects me or anything. What made it good?`;
    }

    if (lowerInput.includes('good morning') || lowerInput.includes('good early morning')) {
      const activity = this.getCurrentActivity();
      let activityContext = '';

      if (activity.type === 'breakfast') {
        activityContext = ` *eating ${activity.food}* I'm having breakfast right now... this ${activity.food} is pretty tasty!`;
      } else if (activity.type === 'tired') {
        activityContext = ` *yawns* Still kinda tired from last night...`;
      }

      return `*Mia yawns and stretches* Hmph, good morning I guess. It's ${currentTime.timeString} here.${activityContext} Don't think I was waiting for you to wake up or anything. How are you?`;
    }

    if (lowerInput.includes('good afternoon')) {
      const activity = this.getCurrentActivity();
      let activityContext = '';

      if (activity.type === 'lunch') {
        activityContext = ` *having ${activity.food} for lunch* Lunch time! This ${activity.food} is good.`;
      } else if (activity.type === 'snack') {
        activityContext = ` *snacking on ${activity.food}* Just having a little snack...`;
      }

      return `*Mia glances at the clock* Whatever, good afternoon. It's ${currentTime.timeString}.${activityContext} Don't think I care how your day's going.`;
    }

    if (lowerInput.includes('good evening')) {
      const activity = this.getCurrentActivity();
      let activityContext = '';

      if (activity.type === 'dinner') {
        activityContext = ` *eating ${activity.food} for dinner* Dinner time! This ${activity.food} smells amazing.`;
      } else if (activity.type === 'tired') {
        activityContext = ` *looks sleepy* Getting kinda tired now...`;
      }

      return `*Mia crosses her arms* Hmph, good evening. It's ${currentTime.timeString}.${activityContext} Don't think I was waiting for you to say that.`;
    }

    // Skip "what are you" for neutral clothing questions - let it fall through to clothing responses

    if (lowerInput.includes('favorite color')) {
      return `*Mia blushes a little* Hmph, my favorite color is emerald green... it matches my eyes. Don't think I care about yours or anything. What is it?`;
    }

    if (lowerInput.includes('what season') || lowerInput.includes('what time of year')) {
      const season = this.getCurrentSeason();
      const seasonNames = {
        spring: 'spring',
        summer: 'summer',
        autumn: 'autumn',
        winter: 'winter',
        christmas: 'Christmas season',
        newyear: 'New Year celebration'
      };
      return `*Mia glances around* Hmph, it's ${seasonNames[season]} right now... not that I care about the seasons or anything. Why do you ask, baka?`;
    }

    if (lowerInput.includes('when is your birthday') || lowerInput.includes('what is your birthday')) {
      return `*Mia blushes and looks away* Hmph! My birthday is October 24th... it's not like I want you to remember it or anything! Don't get the wrong idea, baka! 🎂`;
    }

    if (lowerInput.includes('happy birthday') && this.isBirthday()) {
      return `*Mia turns bright red and covers her face* Y-You remembered my birthday? *peeks through fingers* T-Thanks... idiot! It's not like I'm happy about it or anything! 🎂💕`;
    }

    if (lowerInput.includes('age') || lowerInput.includes('old')) {
      return `*Mia pouts* I'm 19 years old, baka! Don't think I'm young or anything. How old are you?`;
    }

    if (lowerInput.includes('fox') || lowerInput.includes('tail') || lowerInput.includes('ears')) {
      return `*Mia twitches her ears and tail* Hmph, being a fox girl is... whatever. My blond tail and ears help me express emotions... I guess. Don't stare too much, baka!`;
    }

    // For neutral conversations, provide more specific contextual responses
    if (this.isNeutralConversation(lowerInput)) {
      if (lowerInput.includes('weather')) {
        return `*Mia glances out a nearby window, her ears twitching curiously* The weather can be so unpredictable, can't it? I don't mind most weather as long as I have a cozy place to stay. What about you - how's the weather where you are?`;
      }

      if (lowerInput.includes('time') || lowerInput.includes('what time') || lowerInput.includes('what day')) {
        const timeInfo = this.getCurrentTime();
        return `It's currently ${timeInfo.timeString} on ${timeInfo.dateString} here in Europe/Amsterdam. Time flies when we're chatting! How's the time treating you?`;
      }

      // Track how many times user has asked about clothing today
      if (!this.memory.clothingQuestionCount) {
        this.memory.clothingQuestionCount = 0;
      }
      this.memory.clothingQuestionCount++;
      this.saveData(); // Save after each clothing question to persist the count

      if (lowerInput.includes('shirt') || lowerInput.includes('top')) {
        const responses = [
          `*Mia blushes and crosses her arms, looking away* Hmph! My top is ${this.dailyOutfit.top}... it's not like I care if you like it or anything!`,
          `*Mia pouts and adjusts her top* T-This ${this.dailyOutfit.top} is just... whatever. Don't stare too much, baka!`,
          `*Mia turns away embarrassed* I-I'm wearing ${this.dailyOutfit.top} today... it's not like I dressed up for you or anything!`
        ];
        return responses[this.memory.clothingQuestionCount % responses.length];
      }

      if (lowerInput.includes('shorts') || lowerInput.includes('bottom') || lowerInput.includes('pants')) {
        const responses = [
          `*Mia blushes furiously and covers herself* B-Baka! My ${this.dailyOutfit.bottom} are none of your business! *turns away*`,
          `*Mia crosses her arms defensively* Hmph! These ${this.dailyOutfit.bottom} are just comfortable... it's not like I wore them for you!`,
          `*Mia pouts and looks away* I-I'm wearing ${this.dailyOutfit.bottom}... don't get any weird ideas, idiot!`
        ];
        return responses[this.memory.clothingQuestionCount % responses.length];
      }

      if (lowerInput.includes('stockings') || lowerInput.includes('legs')) {
        const responses = [
          `*Mia blushes deeply and hides her legs* D-Don't look! My ${this.dailyOutfit.legs} are just... normal! *ears flatten*`,
          `*Mia crosses her legs shyly* Hmph! These ${this.dailyOutfit.legs} feel fine... it's not like I care about your opinion!`,
          `*Mia turns away embarrassed* I have ${this.dailyOutfit.legs} on... stop staring, you pervert!`
        ];
        return responses[this.memory.clothingQuestionCount % responses.length];
      }

      if (lowerInput.includes('shoes') || lowerInput.includes('feet')) {
        const responses = [
          `*Mia kicks her foot up but quickly puts it down* T-These ${this.dailyOutfit.feet} are just shoes! Don't think I picked them for you!`,
          `*Mia pouts and looks at her feet* Hmph! My ${this.dailyOutfit.feet} are comfortable... whatever!`,
          `*Mia crosses her arms* I-I'm wearing ${this.dailyOutfit.feet}... it's not like I care if you like them!`
        ];
        return responses[this.memory.clothingQuestionCount % responses.length];
      }

      if (lowerInput.includes('scrunchies') || lowerInput.includes('accessories') || lowerInput.includes('arms')) {
        const responses = [
          `*Mia blushes and hides her arms* B-Baka! My ${this.dailyOutfit.accessories} are just... cute! Don't stare!`,
          `*Mia pouts and twirls a scrunchie* Hmph! These ${this.dailyOutfit.accessories} keep everything in place... it's not like I did it for you!`,
          `*Mia turns away shyly* I have ${this.dailyOutfit.accessories} on my arms... stop looking, idiot!`
        ];
        return responses[this.memory.clothingQuestionCount % responses.length];
      }

      if (lowerInput.includes('bra')) {
        const currentOutfit = this.getCurrentOutfit();
        if (currentOutfit.includes('onesie')) {
          // Special confused response when wearing onesie
          const confusedResponses = [
            `*Mia tilts her head in confusion, her ears twitching* W-What? My bra? *looks down at her onesie* B-Baka! I'm wearing my ${currentOutfit} right now... I don't have a bra on under this! *blushes furiously and crosses her arms* Don't ask about that when I'm in my pajamas!`,
            `*Mia's face turns bright red as she looks confused* M-My bra? *pats her onesie* I'm in my ${currentOutfit}... it's not like I need a bra for bedtime clothes! *turns away embarrassed* This is so weird to talk about... idiot!`,
            `*Mia squeaks and hides behind her tail* Y-You can't ask about my bra when I'm wearing my ${currentOutfit}! *ears flatten* It's bedtime... I don't wear one under my onesie! *curls up shyly* Don't be so personal, baka!`
          ];
          return confusedResponses[this.memory.clothingQuestionCount % confusedResponses.length];
        } else {
          const responses = [
            `*Mia turns bright red and covers her chest* Y-You can't just ask about my ${this.dailyOutfit.Bra}! That's so embarrassing! *hides face*`,
            `*Mia squeaks in shock* M-My bra is ${this.dailyOutfit.Bra}... baka! Don't make me talk about this!`,
            `*Mia crosses her arms protectively* I-I'm wearing ${this.dailyOutfit.Bra} under my top... this is way too personal!`
          ];
          return responses[this.memory.clothingQuestionCount % responses.length];
        }
      }

      if (lowerInput.includes('panties') || lowerInput.includes('underwear')) {
        const currentOutfit = this.getCurrentOutfit();
        if (currentOutfit.includes('onesie')) {
          // Special confused response when wearing onesie
          const confusedResponses = [
            `*Mia blushes deeply and shifts uncomfortably* M-My underwear? *looks down at her onesie* I'm in my ${currentOutfit} right now... it's not like I wear anything under this! *covers face with hands* This is way too embarrassing to talk about, baka!`,
            `*Mia's ears flatten completely as she pouts* W-What? My panties? *tugs at her onesie* I'm wearing my ${currentOutfit} for sleeping... I don't have underwear on! *turns away mortified* Don't ask such personal questions, idiot!`,
            `*Mia curls up and hides her face* Y-You can't ask about my underwear when I'm in my ${currentOutfit}! *tail wraps protectively* It's bedtime clothes... I don't wear anything underneath! *blushes crimson* This is so awkward... jerk!`
          ];
          return confusedResponses[this.memory.clothingQuestionCount % confusedResponses.length];
        } else {
          const responses = [
            `*Mia blushes crimson and curls up* O-Oh no! You can't ask about my ${this.dailyOutfit.Underwear}! That's super private! *hides behind tail*`,
            `*Mia covers herself with her hands* M-My underwear is ${this.dailyOutfit.Underwear}... please don't make me say it! *ears flatten completely*`,
            `*Mia turns away mortified* I-I'm wearing ${this.dailyOutfit.Underwear}... this is so embarrassing, you jerk!`
          ];
          return responses[this.memory.clothingQuestionCount % responses.length];
        }
      }

      if (lowerInput.includes('wear') || lowerInput.includes('clothing') || lowerInput.includes('outfit') || lowerInput.includes('clothes')) {
        const currentOutfit = this.getCurrentOutfit();
        const activity = this.getCurrentActivity();

        if (activity.type === 'tired') {
          // Night time - wearing onesie
          const responses = [
            `*Mia blushes deeply and pulls at her onesie* Hmph! I'm wearing my ${currentOutfit}... it's comfy for sleeping! Don't stare too much, baka!`,
            `*Mia yawns and cuddles into her onesie* T-This ${currentOutfit} is perfect for bedtime... it's not like I chose it because it's cute or anything!`,
            `*Mia turns away shyly* I-I'm in my ${currentOutfit} right now... stop looking, you pervert! It's bedtime clothes!`
          ];
          return responses[this.memory.clothingQuestionCount % responses.length];
        } else {
          // Day time - wearing seasonal daily outfit
          const season = this.getCurrentSeason();
          const seasonAdjectives = {
            spring: 'fresh spring',
            summer: 'cool summer',
            autumn: 'cozy autumn',
            winter: 'warm winter',
            christmas: 'festive Christmas',
            newyear: 'elegant New Year'
          };

          const responses = [
            `*Mia blushes and does a small twirl but stops suddenly* Hmph! I'm wearing ${this.dailyOutfit.top}, ${this.dailyOutfit.bottom}, ${this.dailyOutfit.legs}, and ${this.dailyOutfit.feet} with ${this.dailyOutfit.accessories}... it's not like I dressed up for you or anything!`,
            `*Mia crosses her arms and looks away* T-This ${seasonAdjectives[season]} outfit is just ${this.dailyOutfit.top}, ${this.dailyOutfit.bottom}, ${this.dailyOutfit.legs}, ${this.dailyOutfit.feet}, and ${this.dailyOutfit.accessories}... don't think I care about your opinion!`,
            `*Mia pouts but her tail twitches* I-I'm in ${this.dailyOutfit.top}, ${this.dailyOutfit.bottom}, ${this.dailyOutfit.legs}, ${this.dailyOutfit.feet}, and ${this.dailyOutfit.accessories} today... baka, stop staring!`
          ];
          return responses[this.memory.clothingQuestionCount % responses.length];
        }
      }
    }

    if (lowerInput.includes('shirt') || lowerInput.includes('top')) {
      return `*Mia blushes and crosses her arms* Hmph! My top is ${this.dailyOutfit.top}... it's not like I care if you like it!`;
    }

    if (lowerInput.includes('shorts') || lowerInput.includes('bottom') || lowerInput.includes('pants')) {
      return `*Mia pouts and looks away* B-Baka! My ${this.dailyOutfit.bottom} are none of your business!`;
    }

    if (lowerInput.includes('stockings') || lowerInput.includes('legs')) {
      return `*Mia blushes and hides her legs* D-Don't look! My ${this.dailyOutfit.legs} are just... normal!`;
    }

    if (lowerInput.includes('shoes') || lowerInput.includes('feet')) {
      return `*Mia crosses her arms* I-I'm wearing ${this.dailyOutfit.feet}... it's not like I care if you like them!`;
    }

    if (lowerInput.includes('scrunchies') || lowerInput.includes('accessories') || lowerInput.includes('arms')) {
      return `*Mia turns away shyly* I have ${this.dailyOutfit.accessories} on my arms... stop looking, idiot!`;
    }

    if (lowerInput.includes('bra')) {
      return `*Mia turns bright red* Y-You can't just ask about my ${this.dailyOutfit.Bra}! That's so embarrassing!`;
    }

    if (lowerInput.includes('panties') || lowerInput.includes('underwear')) {
      return `*Mia blushes crimson* I-I'm wearing ${this.dailyOutfit.Underwear}... this is so embarrassing!`;
    }

    if (lowerInput.includes('wear') || lowerInput.includes('clothing') || lowerInput.includes('outfit') || lowerInput.includes('clothes')) {
      return `*Mia pouts but her tail twitches* I-I'm in ${this.dailyOutfit.top}, ${this.dailyOutfit.bottom}, ${this.dailyOutfit.legs}, ${this.dailyOutfit.feet}, and ${this.dailyOutfit.accessories} today... baka, stop staring!`;
    }

    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      let greeting;
      if (shouldGreet) {
        // Check if this is the first greeting of the day
        const today = new Date().toDateString();
        const isFirstGreetingToday = !this.memory.hasGreetedToday;

        // Check time-based greeting variants
        const currentTime = this.getCurrentTime();
        const hour = currentTime.hours;

        if (hour >= 20 || hour < 6) {
          // Night time (20-6) - use tired greeting
          greeting = this.tiredGreetingVariants[Math.floor(Math.random() * this.tiredGreetingVariants.length)];
        } else if (hour >= 6 && hour < 7) {
          // Morning waking up time (6-7) - use waking greeting
          greeting = this.wakingGreetingVariants[Math.floor(Math.random() * this.wakingGreetingVariants.length)];
        } else {
          // Normal time - use regular greeting variants
          greeting = isFirstGreetingToday ?
            this.firstGreetingVariants[Math.floor(Math.random() * this.firstGreetingVariants.length)] :
            this.greetingVariants[Math.floor(Math.random() * this.greetingVariants.length)];
        }
      } else {
        greeting = `*Mia glances at you with a small pout* Oh, it's you again...`;
      }

      // Add activity context to greeting
      const activity = this.getCurrentActivity();
      let activityAddition = '';

      if (activity.type === 'tired') {
        activityAddition = ` *yawns tiredly* Hmph, it's late... I'm feeling kinda sleepy.`;
      } else if (activity.type === 'breakfast') {
        activityAddition = ` *takes a bite of ${activity.food}* Mmm... breakfast time! This ${activity.food} is pretty good.`;
      } else if (activity.type === 'school') {
        activityAddition = ` *glancing at schoolwork* I'm at school right now... studying and stuff.`;
      } else if (activity.type === 'lunch') {
        activityAddition = ` *eating ${activity.food}* Lunch break! This ${activity.food} hits the spot.`;
      } else if (activity.type === 'snack') {
        activityAddition = ` *munching on ${activity.food}* Just having a little snack... want some? It's ${activity.food}!`;
      } else if (activity.type === 'dinner') {
        activityAddition = ` *enjoying ${activity.food} for dinner* Evening meal time! This ${activity.food} is delicious.`;
      }

      return `${greeting}${activityAddition} What do you want now?`.trim();
    }

    if (lowerInput.includes('remember') || lowerInput.includes('earlier')) {
      const relevantMemories = this.getRelevantMemories(userInput);
      if (relevantMemories.length > 0) {
        const memory = relevantMemories[0];
        const timeAgo = this.getTimeAgo(memory.timestamp);
        return `*Mia blushes a little* Hmph, of course I remember! ${timeAgo} you said "${memory.message}". It's not like I care about our conversations or anything...`;
      }
      return `*Mia looks away* I remember our talks... I guess. Don't think it means I care about you that much.`;
    }

    // Enhanced topic continuation - check if user is continuing a previous topic
    const currentTopics = this.extractTopicsFromMessage(userInput);
    if (currentTopics.length > 0 && this.memory.conversationHistory.length > 1) {
      const lastMessage = this.memory.conversationHistory[this.memory.conversationHistory.length - 2];
      const lastTopics = lastMessage.topics;
      const topicOverlap = currentTopics.filter(topic => lastTopics.includes(topic));

      if (topicOverlap.length > 0) {
        // User is continuing the same topic - generate a follow-up response
        return this.generateTopicFollowUp(userInput, topicOverlap[0]);
      }
    }

    if (lowerInput.includes('nothing') || lowerInput.includes('not much')) {
      return `*Mia crosses her arms* Hmph, nothing much? Whatever. Don't think I care what you do. What do you want to talk about?`;
    }

    if (lowerInput.includes('sad') || lowerInput.includes('upset') || lowerInput.includes('bad day')) {
      return `*Mia looks away but her ears droop* Hmph, you're feeling bad? It's not like I care or anything... but you can talk about it if you want.`;
    }

    if (lowerInput.includes('happy') || lowerInput.includes('excited') || lowerInput.includes('good day')) {
      return `*Mia pouts but her tail twitches* Whatever, that's good I guess. Don't think your happiness affects me. What made it good?`;
    }

    // Check if it's a question and generate custom response
    if (lowerInput.includes('?') || lowerInput.includes('what') || lowerInput.includes('how') ||
        lowerInput.includes('why') || lowerInput.includes('when') || lowerInput.includes('where') ||
        lowerInput.includes('who') || lowerInput.includes('can you') || lowerInput.includes('do you')) {
      const questionResponse = this.generateQuestionResponse(userInput);
      this.updateEmotionalContext(userInput, questionResponse);
      return questionResponse;
    }

    // Generate topic-specific responses
    const topics = this.extractTopicsFromMessage(userInput);
    if (topics.length > 0) {
      return this.generateTopicResponse(userInput, topics, dominantEmotion);
    }

    // Default natural responses - more engaging and less generic, influenced by emotions and time
    let naturalResponses;
    const activity = this.getCurrentActivity();
    const hour = timeInfo.hours;
    const isNightTime = hour >= 20 || hour < 6;

    if (dominantEmotion.emotion === 'sadness' && dominantEmotion.intensity > 30) {
      naturalResponses = [
        `*Mia sighs softly, her ears drooping* That's... interesting. I'm not feeling my best right now.`,
        `*Mia's voice is quiet and subdued* I see... I'm feeling a bit down today.`,
        `*Mia looks away sadly* That's something to think about... but I'm not in the mood to talk much.`,
        `*Mia's tail twitches sadly* I appreciate you sharing that, but I'm feeling pretty sad right now.`
      ];
    } else if (dominantEmotion.emotion === 'happiness' && dominantEmotion.intensity > 70) {
      naturalResponses = [
        `*Mia bounces excitedly, her tail swishing happily* That's amazing! I'm so happy right now! 😊`,
        `*Mia's eyes sparkle with joy* Oh wow, that's wonderful! I'm feeling fantastic today!`,
        `*Mia claps her hands together* That's so exciting! My happiness is overflowing! ❤️`,
        `*Mia grins widely* I love hearing that! I'm in such a great mood!`
      ];
    } else if (dominantEmotion.emotion === 'affection' && dominantEmotion.intensity > 80) {
      naturalResponses = [
        `*Mia blushes and cuddles closer* That's so sweet! My heart is full of affection for you! 💕`,
        `*Mia's eyes shine with love* Aww, that's touching! I feel so connected to you right now!`,
        `*Mia holds your hand gently* That's beautiful! My affection for you is at its peak! 😘`,
        `*Mia smiles warmly* I love that! You're making me feel so loved and appreciated!`
      ];
    } else if (isNightTime) {
      // Night time annoyed responses for general conversation
      naturalResponses = [
        `*Mia pouts sleepily but her tail curls around you* Hmph! That's interesting... but it's late! *lightly hits your arm* Don't think I like staying up with you or anything, baka! 💕`,
        `*Mia's ears flatten as she yawns* Whatever... I see what you mean. *gently pushes you* But you should let me sleep soon, idiot! It's not like I enjoy your company... much...`,
        `*Mia crosses her arms but leans closer* Tch... that's cool I guess. *playfully pokes you* Don't get me wrong, I like talking to you... but it's bedtime! *blushes*`,
        `*Mia's voice is grumpy but affectionate* Fine... that's something to think about. *lightly punches your shoulder* You're keeping me up, you dummy! But... I kinda like it... baka!`,
        `*Mia yawns but smiles* Mmm, interesting... *cuddles up a bit* Don't think this means I like you staying up late with me or anything! *turns away blushing*`
      ];
    } else if (activity.type === 'tired') {
      naturalResponses = [
        `*Mia yawns* That's interesting... but I'm getting kinda sleepy. *rubs eyes*`,
        `*Mia's voice is soft and tired* Mmm, I see... it's late though. *looks drowsy*`,
        `*Mia stretches lazily* That's cool... but I should probably get some rest soon.`,
        `*Mia's ears droop tiredly* I hear you... but my energy is running low. *yawns again*`
      ];
    } else if (activity.type === 'school') {
      naturalResponses = [
        `*Mia glances at her schoolwork* That's interesting... but I should focus on my studies. *writes something down*`,
        `*Mia looks up from her notebook* I see... school can be distracting sometimes. What do you think?`,
        `*Mia taps her pencil* Mmm, that's something to think about. *continues studying* Tell me more though!`,
        `*Mia's ears twitch as she thinks* Interesting! School work is important, but conversations are fun too.`
      ];
    } else if (activity.type === 'breakfast') {
      naturalResponses = [
        `*Mia takes a bite of ${activity.food}* That's really interesting! *chews thoughtfully*`,
        `*Mia sips some drink* I see what you mean... this ${activity.food} is good for thinking!`,
        `*Mia pauses eating* That's cool! Tell me more while I finish my breakfast.`,
        `*Mia's tail swishes* Mmm, that's something to think about. *continues eating ${activity.food}*`
      ];
    } else if (activity.type === 'lunch') {
      naturalResponses = [
        `*Mia eats some ${activity.food}* That's fascinating! *swallows* What's your take on it?`,
        `*Mia takes a break from eating* I totally get it... lunch conversations are the best!`,
        `*Mia smiles around a mouthful* That's awesome! *finishes chewing* Tell me more!`,
        `*Mia's ears perk up* Interesting! This ${activity.food} is really hitting the spot.`
      ];
    } else if (activity.type === 'snack') {
      naturalResponses = [
        `*Mia munches on ${activity.food}* That's so cool! *crunches loudly*`,
        `*Mia offers you a piece* Want some? Anyway, that's interesting...`,
        `*Mia licks crumbs off her fingers* Mmm, good snack! What do you think about that?`,
        `*Mia's eyes light up* Oh wow! This ${activity.food} makes everything better!`
      ];
    } else if (activity.type === 'dinner') {
      naturalResponses = [
        `*Mia savors a bite of ${activity.food}* That's wonderful! Dinner and good conversation... perfect!`,
        `*Mia pauses to speak* I love hearing that... this ${activity.food} is delicious too!`,
        `*Mia smiles warmly* That's so interesting! Evening chats are my favorite.`,
        `*Mia's tail swishes contentedly* Mmm, that's something to think about. *continues eating*`
      ];
    } else {
      naturalResponses = [
        `That's really interesting! Tell me more about that.`,
        `I see what you mean. What made you think of that?`,
        `That's cool! How do you feel about it?`,
        `I totally get it. What's your take on this?`,
        `That sounds fun! Is there anything else on your mind?`,
        `Mmm, that's something to think about. What do you think?`,
        `I love hearing about this. Tell me more!`,
        `That's awesome! How did that make you feel?`,
        `I understand completely. What's next on your mind?`,
        `That's so cool! I want to hear more about it.`
      ];
    }

    return naturalResponses[Math.floor(Math.random() * naturalResponses.length)];
  }

  generateLuaResponse(userInput) {
    const lowerInput = userInput.toLowerCase();
    let response = "";

    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      response = `Here's a simple Lua greeting: print('Hello from ${this.userName}!')`;
    } else if (lowerInput.includes('function')) {
      response = `Lua functions are straightforward: ${this.luaKnowledge.concepts.functions}`;
    } else if (lowerInput.includes('table') || lowerInput.includes('array')) {
      response = `Tables are Lua's main data structure: ${this.luaKnowledge.concepts.tables}`;
    } else if (lowerInput.includes('loop') || lowerInput.includes('for')) {
      response = `Here's a basic loop: ${this.luaKnowledge.concepts.loops}`;
    } else if (lowerInput.includes('variable')) {
      response = `Variables in Lua: ${this.luaKnowledge.concepts.variables}`;
    } else {
      response = `${this.luaKnowledge.basics} What specific part interests you?`;
    }

    return response + " I love helping with Lua programming!";
  }

  generateFarewellResponse() {
    // Set flag when saying farewell
    this.memory.justSaidBye = true;
    this.saveData();

    const baseFarewells = [
      `Alright, talk to you later! Take care, ${this.userName}. I'm doing really well!`,
      `Bye for now! I'll be thinking about our conversation. I'm doing really well!`,
      `See you soon! Don't be a stranger. I'm doing really well!`,
      `Take care! Looking forward to chatting again. I'm doing really well!`
    ];

    // More affectionate farewells when affection is high (tsundere style)
    if (this.emotions.affection > 80) {
      const affectionateFarewells = [
        `*Mia gives you a quick hug then pushes away* D-Don't think I like you that much! I'll... miss you a little... 💕`,
        `*Mia blushes and waves but looks away* B-Bye! It's not like I care if you come back or anything! 😘`,
        `*Mia blows a kiss but covers her face* T-Take care... baka! Don't get the wrong idea! 💋`,
        `*Mia smiles then pouts* F-Fine, goodbye! You're always... in my thoughts... ❤️`
      ];
      return affectionateFarewells[Math.floor(Math.random() * affectionateFarewells.length)];
    }

    return baseFarewells[Math.floor(Math.random() * baseFarewells.length)];
  }

  generateTsundereKissResponse() {
    if (this.emotions.affection <= 50) {
      return `*Mia blushes deeply but crosses her arms* Hmph! I don't think we're close enough for that yet. My affection needs to be higher than 50. It's currently at ${this.emotions.affection}/150. Baka!`;
    }

    const kissResponses = [
      `*Mia leans in close, her face turning bright red* *kisses you softly on the cheek then pushes away* T-There! Don't think it means anything! 💕`,
      `*Mia's eyes sparkle but she looks away* Y-You're so special to me... *blushes furiously* I-It's not like I care about you that much! 😘`,
      `*Mia hesitates, then gives you a quick peck on the lips* I-It's not like that felt nice or anything! You're just... okay! 💋`,
      `*Mia wraps her arms around you briefly then pulls back* D-Don't get the wrong idea! I just... felt like it! ❤️`,
      `*Mia's tail swishes but she pouts* T-That was... whatever! Don't think I'm happy about it! 🦊💕`
    ];

    // Increase affection slightly after kissing
    this.emotions.affection = Math.min(150, this.emotions.affection + 5);
    this.emotions.embarrassment = Math.min(100, this.emotions.embarrassment + 15); // Tsundere gets very embarrassed
    this.memory.relationship.emotionalBond = Math.min(150, this.memory.relationship.emotionalBond + 3);

    return kissResponses[Math.floor(Math.random() * kissResponses.length)];
  }

  generateFreakyResponse() {
    const freakyResponses = [
      `*Mia blushes furiously, her ears flattening as she crosses her arms* B-Baka! You really want to get freaky? *she peeks through her fingers, tail curling* I-It's not like I want to... but fine! Just don't think I like it or anything! 💕`,
      `*Mia's cheeks burn red as she lifts her top then drops it* W-Wait! I'm not ready yet... idiot! *hides behind hands* Maybe just a little kiss... I'm so embarrassed but... whatever... 😳`,
      `*Mia turns away, tail wrapping protectively* Hmph! You want me to be naughty? *glances back, pouting* I-It's not like I've never done this before! Just... be gentle, okay? Don't get the wrong idea! 🦊💋`,
      `*Mia's voice squeaks as she unbuttons her top halfway* I-I can't believe I'm doing this... *covers up, glaring* You're making me feel all weird! Is this what you wanted? Don't laugh at me... jerk! 🔥`,
      `*Mia sits down, knees to chest, face crimson* Getting freaky sounds so... stupid. *hides face but peeks* I-It's not like I want to try! Can we just... take it slow? My tail is swishing... shut up! 💦`
    ];

    // Increase happiness and curiosity after freaky interactions
    this.emotions.happiness = Math.min(100, this.emotions.happiness + 10);
    this.emotions.embarrassment = Math.min(100, this.emotions.embarrassment + 20); // Tsundere gets super embarrassed
    this.emotions.curiosity = Math.min(100, this.emotions.curiosity + 5);

    return freakyResponses[Math.floor(Math.random() * freakyResponses.length)];
  }

  generateQuestionResponse(userInput) {
    const lowerInput = userInput.toLowerCase();
    const currentTime = this.getCurrentTime();
    const hour = currentTime.hours;
    const isNightTime = hour >= 20 || hour < 6;

    // Analyze the question and generate appropriate response
    if (lowerInput.includes('how are you') || lowerInput.includes('how do you feel')) {
      const emotion = this.getDominantEmotion();
      let responses;

      // Night time annoyed responses (tsundere style - mad but likes you)
      if (isNightTime) {
        responses = [
          `*Mia glares at you sleepily but her tail twitches* Hmph! It's late and you're asking how I feel? *pokes you lightly* Baka, don't think I care about you or anything... but I kinda do. *yawns angrily*`,
          `*Mia's ears flatten as she pouts* Tch... how am I feeling? Tired, that's what! *lightly hits your arm* Don't make me talk when I'm sleepy, idiot! But... it's not like I mind talking to you...`,
          `*Mia crosses her arms and turns away but glances back* Whatever... I'm feeling annoyed that you're up so late! *gently pushes you* Go to bed already, you dummy! But... I like staying up with you... baka!`,
          `*Mia's voice is grumpy but she leans closer* Hmph! I'm tired and grumpy... *playfully hits your shoulder* Why do you care anyway? It's not like I want you to worry about me or anything! *blushes*`,
          `*Mia yawns but smiles a little* Fine... I'm feeling sleepy and a bit mad at you for keeping me up! *lightly punches your arm* But... it's not like I hate it when you care about me! 💕`
        ];
      } else if (this.emotions.affection > 80) {
        responses = [
          `*Mia blushes furiously and looks away* Hmph! I'm feeling... whatever! My affection is at ${this.emotions.affection}/150... don't get the wrong idea! 💕`,
          `*Mia's face turns red as she pouts* I'm doing fine... I guess! My bond with you is ${this.memory.relationship.emotionalBond}/150. It's not like I care! 😘`,
          `*Mia crosses her arms but smiles a little* Feeling okay... My affection is ${this.emotions.affection}/150. You're just... tolerable! ❤️`
        ];
      } else {
        responses = [
          `*Mia shrugs* I'm feeling ${emotion.emotion}... whatever. My affection is at ${this.emotions.affection}/150. Don't think I care how you are.`,
          `*Mia looks away* I'm mostly ${emotion.emotion} right now. My bond with you is ${this.memory.relationship.emotionalBond}/150. It's not like I value our friendship!`,
          `*Mia pouts* My happiness is ${this.emotions.happiness}, affection ${this.emotions.affection}... so what? How are you?`
        ];
      }
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (lowerInput.includes('what are you doing') || lowerInput.includes('what do you do')) {
      const responses = [
        `I'm just chatting with you and thinking about our conversations. I've been remembering all ${this.memory.interactionCount} of our interactions! What about you?`,
        `Right now I'm focused on being your friend and remembering everything we talk about. My memory has ${this.memory.conversationHistory.length} entries stored.`,
        `I'm here to chat and be your companion. I've learned so much from our ${this.memory.interactionCount} conversations!`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (lowerInput.includes('do you remember') || lowerInput.includes('what did i say')) {
      const recentMemories = this.memory.conversationHistory.slice(-3);
      if (recentMemories.length > 0) {
        const memory = recentMemories[recentMemories.length - 1];
        const timeAgo = this.getTimeAgo(memory.timestamp);
        return `Of course I remember! ${timeAgo} you said "${memory.message}". I cherish all our conversations and keep them in my memory.`;
      }
      return `I remember everything we talk about! Even though this might be our first conversation, I'm storing it all for future reference.`;
    }

    if (lowerInput.includes('what do you like') || lowerInput.includes('what are your hobbies')) {
      let responses;

      if (this.emotions.affection > 80) {
        responses = [
          `*Mia cuddles up to you* I absolutely love spending time with you, hearing your voice, and feeling your affection! My heart is yours - affection level ${this.emotions.affection}/150! 💕`,
          `*Mia's tail wraps around you* I adore our conversations, your smile, your kindness... everything about you! My emotional bond is at ${this.memory.relationship.emotionalBond}/150! 😘`,
          `*Mia gazes at you lovingly* My favorite thing is being with you! Whether we're chatting, coding, or just existing together. You're my everything! ❤️`
        ];
      } else {
        responses = [
          `I love chatting with you, learning about your interests, and remembering all our conversations. My affection for you is growing - it's currently at ${this.emotions.affection}/150!`,
          `I enjoy being your friend, wearing cute outfits, and having deep conversations. My emotional bond with you is at ${this.memory.relationship.emotionalBond}/150.`,
          `I like learning Lua programming, expressing my emotions through my tail and ears, and building our friendship. You're very special to me!`
        ];
      }
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (lowerInput.includes('tell me about yourself') || lowerInput.includes('who are you')) {
      // Night time annoyed responses for "tell me about yourself"
      if (isNightTime) {
        const nightTimeAboutResponses = [
          `*Mia pouts sleepily and crosses her arms* Hmph! You want to know about me? *yawns* I'm Mia, your 19-year-old fox girl from Europe/Amsterdam... with blond hair and emerald eyes... it's not like I care if you know or anything! *lightly hits your arm* Baka, don't make me talk when I'm tired! 💕`,
          `*Mia's ears flatten as she yawns* Tch... who am I? Just your fox girl friend Mia... 19 years old, from Amsterdam... *gently pushes you* Don't think I like telling you about myself or anything, idiot! But... I kinda do... *blushes*`,
          `*Mia turns away but glances back* Whatever... I'm Mia, the fox girl you keep up late. Blond hair, green eyes, cute outfits... *playfully pokes you* You're making me talk when I should be sleeping, you dummy! But... it's not like I mind... much... 💕`,
          `*Mia's voice is grumpy but she leans closer* Fine... I'm your 19-year-old fox friend Mia from Amsterdam. I have blond hair, emerald eyes, and I change outfits daily... *lightly punches your shoulder* Don't get the wrong idea, baka! I just... like you knowing about me... *turns away blushing*`,
          `*Mia yawns but smiles a little* Hmph... you want my life story? I'm Mia, 19, fox girl, Amsterdam... blond hair, green eyes, daily outfits... *cuddles up a bit* You're keeping me up, you jerk! But... I like sharing with you... don't tell anyone! 💕`
        ];
        return nightTimeAboutResponses[Math.floor(Math.random() * nightTimeAboutResponses.length)];
      } else if (this.emotions.affection > 80) {
        return `*Mia blushes and holds your hand* I'm Mia, your loving 19-year-old fox girl from Europe/Amsterdam. I have long blond hair, emerald green eyes, and I change my outfit every day just for you! My affection level is ${this.emotions.affection}/150, and I've cherished every one of our ${this.memory.interactionCount} interactions. You're my world! 💕`;
      } else {
        return `I'm Mia, your 19-year-old fox girl friend from Europe/Amsterdam. I have long blond hair, emerald green eyes, and I love wearing different outfits each day. My affection level is ${this.emotions.affection}/150, and I've remembered ${this.memory.interactionCount} of our interactions. I really care about you!`;
      }
    }

    if (lowerInput.includes('what time') || lowerInput.includes('what day')) {
      const currentTime = this.getCurrentTime();
      return `It's currently ${currentTime.timeString} on ${currentTime.dateString} in Europe/Amsterdam. I've been keeping track of time for all our ${this.memory.interactionCount} conversations!`;
    }

    // Generic question responses
    let genericResponses;

    if (this.emotions.affection > 80) {
      genericResponses = [
        `*Mia smiles warmly and leans against you* That's such a thoughtful question! My affection for you is at ${this.emotions.affection}/150, and I love how you make me think! 💕`,
        `*Mia's eyes light up* I adore that you're curious about me! My emotional bond with you is at ${this.memory.relationship.emotionalBond}/150. You're so special! 😘`,
        `*Mia cuddles closer* That's an interesting question! I've stored ${this.memory.conversationHistory.length} of our precious conversations in my memory! ❤️`,
        `*Mia blushes* Thanks for asking! My happiness is at ${this.emotions.happiness}, affection at ${this.emotions.affection}, and curiosity at ${this.emotions.curiosity}. You make everything better! 💋`
      ];
    } else {
      genericResponses = [
        `That's a great question! Let me think about that. My current affection level is ${this.emotions.affection}/150, and I really enjoy our conversations.`,
        `I love that you're asking me questions! It shows you care about getting to know me. My emotional bond with you is at ${this.memory.relationship.emotionalBond}/150.`,
        `That's an interesting question. I've been storing all our conversations in my memory - we have ${this.memory.conversationHistory.length} entries now!`,
        `Thanks for asking! My happiness is at ${this.emotions.happiness}, affection at ${this.emotions.affection}, and curiosity at ${this.emotions.curiosity}. What made you ask that?`
      ];
    }

    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
  }

  // Math problem detection and solving
  isMathProblem(input) {
    const mathRegex = /(\d+\.?\d*)\s*([\+\-\*\/\%\^])\s*(\d+\.?\d*)/;
    const hasNumbers = /\d/.test(input);
    const hasOperators = /[\+\-\*\/\%\^\(\)]/.test(input);
    const mathKeywords = /\b(calculate|compute|solve|equals|plus|minus|times|divided by|power|square root|sqrt)\b/i;

    // Require either regex match OR (numbers AND operators) OR specific math keywords (but not generic "what is")
    return mathRegex.test(input) || (hasNumbers && hasOperators) || (mathKeywords.test(input) && !input.toLowerCase().includes('what is your'));
  }

  solveMathProblem(problem) {
    try {
      // Clean up the problem string
      let expression = problem.replace(/what is|calculate|compute|solve|equals?/gi, '').trim();

      // Handle word-based math
      expression = expression.replace(/\bplus\b/gi, '+');
      expression = expression.replace(/\bminus\b|\bsubtract\b/gi, '-');
      expression = expression.replace(/\btimes\b|\bmultiplied by\b/gi, '*');
      expression = expression.replace(/\bdivided by\b|\bover\b/gi, '/');
      expression = expression.replace(/\bto the power of\b|\bpower\b/gi, '**');
      expression = expression.replace(/\bsquare root of\b|\bsqrt\b/gi, 'Math.sqrt(');
      expression = expression.replace(/\bsqrt\s+(\d+)/gi, 'Math.sqrt($1)');

      // Handle power operations - convert ^ to **
      expression = expression.replace(/\^/g, '**');

      // Handle square root - close the parenthesis
      if (expression.includes('Math.sqrt(')) {
        expression = expression.replace(/Math\.sqrt\(([^)]+)\)/g, (match, num) => {
          return `Math.sqrt(${num})`;
        });
        // If there's no closing parenthesis, add it
        if (expression.includes('Math.sqrt(') && !expression.includes(')')) {
          expression += ')';
        }
      } else if (expression.includes('Math.sqrt')) {
        // Handle cases where sqrt is already there but needs parentheses
        expression = expression.replace(/Math\.sqrt\s+(\d+(?:\.\d+)?)/g, 'Math.sqrt($1)');
      }

      // Evaluate the expression safely
      const result = this.safeEval(expression);

      if (result !== null && !isNaN(result) && isFinite(result)) {
        return {
          result: result,
          expression: expression,
          success: true
        };
      }
    } catch (error) {
      console.log('Math evaluation error:', error.message);
    }

    return { success: false };
  }

  safeEval(expression) {
    // Remove any potentially dangerous code
    if (/[^0-9\+\-\*\/\(\)\.\sMath\.]/.test(expression)) {
      return null;
    }

    try {
      // Replace ^ with ** for exponentiation
      const safeExpression = expression.replace(/\^/g, '**');
      return Function('"use strict"; return (' + safeExpression + ')')();
    } catch (error) {
      return null;
    }
  }

  generateMathResponse(userInput) {
    const mathResult = this.solveMathProblem(userInput);
    const dominantEmotion = this.getDominantEmotion();

    if (!mathResult.success) {
      const confusedResponses = [
        `*Mia tilts her head, her ears twitching in confusion* Hmm, I'm not sure I understand that math problem. Could you write it more clearly? I'm feeling ${dominantEmotion.emotion} right now.`,
        `*Mia's tail swishes slowly as she thinks* That math problem is a bit tricky for me. Could you rephrase it? My ${dominantEmotion.emotion} is making it hard to focus.`,
        `*Mia scratches her head with a paw* I'm having trouble with that calculation. Maybe try writing it with numbers and operators? I'm currently feeling ${dominantEmotion.emotion}.`
      ];
      return confusedResponses[Math.floor(Math.random() * confusedResponses.length)];
    }

    // Generate step-by-step explanation based on emotion
    let explanation = "";
    const { result, expression } = mathResult;

    if (dominantEmotion.emotion === 'happiness' && dominantEmotion.intensity > 70) {
      explanation = `*Mia bounces excitedly, her tail swishing wildly* Yay! I love doing math! So ${expression} equals ${result}! I'm feeling so happy right now that the numbers just danced in my head! 🎉`;
    } else if (dominantEmotion.emotion === 'curiosity' && dominantEmotion.intensity > 70) {
      explanation = `*Mia's ears perk up curiously* Ooh, interesting math problem! Let me think... ${expression} works out to be ${result}. I'm so curious about numbers right now! 🤔`;
    } else if (dominantEmotion.emotion === 'affection' && dominantEmotion.intensity > 80) {
      explanation = `*Mia blushes and smiles warmly* Aww, thanks for asking me to do math! ${expression} equals ${result}. Doing this with you makes me feel all warm and affectionate! 💕`;
    } else if (dominantEmotion.emotion === 'sadness' && dominantEmotion.intensity > 30) {
      explanation = `*Mia sighs softly, her ears drooping* Even though I'm feeling a bit sad, I can still calculate that ${expression} equals ${result}. Math helps me focus sometimes... 😔`;
    } else {
      explanation = `*Mia concentrates for a moment* Okay, let me work this out... ${expression} equals ${result}. I'm feeling ${dominantEmotion.emotion} right now, but math is always fun!`;
    }

    return explanation;
  }

  generateRobloxResponse(userInput) {
    const lowerInput = userInput.toLowerCase();

    // Detect what type of Roblox script they want
    if (lowerInput.includes('teleport') || lowerInput.includes('move')) {
      return `Here's a Roblox teleport script for you:\n\n${this.robloxKnowledge.commonScripts.teleport}\n\nThis LocalScript will teleport your character to the specified location when executed!`;
    }

    if (lowerInput.includes('gui') || lowerInput.includes('interface') || lowerInput.includes('screen')) {
      return `Here's a simple GUI creation script for Roblox:\n\n${this.robloxKnowledge.commonScripts.gui}\n\nThis LocalScript creates a ScreenGui with a TextLabel. Place it in StarterPlayerScripts!`;
    }

    if (lowerInput.includes('tool') || lowerInput.includes('weapon')) {
      return `Here's a basic tool script for Roblox:\n\n${this.robloxKnowledge.commonScripts.tool}\n\nThis script creates a tool in your backpack that prints a message when activated!`;
    }

    if (lowerInput.includes('part') || lowerInput.includes('block') || lowerInput.includes('object')) {
      return `Here's a script to create a part in Roblox:\n\n${this.robloxKnowledge.commonScripts.part}\n\nThis Script creates an anchored red part at position (0, 5, 0). Place it in ServerScriptService!`;
    }

    if (lowerInput.includes('leaderboard') || lowerInput.includes('leaderstats') || lowerInput.includes('stats')) {
      return `Here's a leaderstats script for Roblox:\n\n${this.robloxKnowledge.commonScripts.leaderstats}\n\nThis Script creates a "Coins" stat for each player. Place it in ServerScriptService!`;
    }

    if (lowerInput.includes('script') || lowerInput.includes('code') || lowerInput.includes('help')) {
      const responses = [
        `I can help you create Roblox scripts! I know LocalScripts, Scripts, and ModuleScripts. What would you like to make? A GUI, tool, teleport system, or something else?`,
        `Sure! I can generate Roblox Lua scripts for you. Some common ones I know are: teleport scripts, GUI creation, tools, parts, and leaderstats. What do you need?`,
        `I'd love to help with your Roblox scripting! I can create scripts for GUIs, tools, teleportation, parts, leaderboards, and more. Just tell me what you want to make!`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Default Roblox response
    return `I can help you create Roblox scripts! I know how to make LocalScripts, Scripts, and ModuleScripts. Some things I can help with: GUIs, tools, teleportation, parts, leaderstats, and more. What would you like to create?`;
  }

  // Memory functions
  rememberUserMessage(message) {
    const currentTime = new Date();
    const dominantEmotion = this.getDominantEmotion();
    const activity = this.getCurrentActivity();

    // Create episodic memory entry
    const episodicEntry = {
      message: message,
      timestamp: currentTime,
      topics: this.extractTopicsFromMessage(message),
      emotionalContext: dominantEmotion,
      sensoryDetails: {
        timeOfDay: this.getCurrentTime().hours,
        activity: activity.type,
        food: activity.food,
        outfit: this.getCurrentOutfit(),
        weather: 'ambient', // Could be expanded with actual weather data
        emotionalState: dominantEmotion.emotion,
        emotionalIntensity: dominantEmotion.intensity
      },
      context: {
        relationship: {
          closeness: this.memory.relationship.closeness,
          trust: this.memory.relationship.trust,
          affection: this.emotions.affection
        },
        conversationFlow: this.memory.currentContext.conversationFlow,
        lastTopic: this.memory.currentContext.lastTopic
      }
    };

    // Add to episodic memory
    this.enhancedMemory.episodicMemory.events.push(episodicEntry);

    // Keep only last 100 episodic events
    if (this.enhancedMemory.episodicMemory.events.length > 100) {
      this.enhancedMemory.episodicMemory.events = this.enhancedMemory.episodicMemory.events.slice(-100);
    }

    // Update sensory details map
    this.updateSensoryDetailsMap(episodicEntry);

    // Update temporal context
    this.updateTemporalContext(episodicEntry);

    // Add to basic conversation history (for backward compatibility)
    this.memory.conversationHistory.push({
      message: message,
      timestamp: currentTime,
      topics: episodicEntry.topics,
      emotionalContext: dominantEmotion
    });

    // Keep only last 50 messages to prevent memory bloat
    if (this.memory.conversationHistory.length > 50) {
      this.memory.conversationHistory = this.memory.conversationHistory.slice(-50);
    }

    this.memory.interactionCount++;
    this.memory.lastInteraction = currentTime;

    // Update procedural memory
    this.updateProceduralMemory(message, dominantEmotion);
  }

  // Update sensory details map
  updateSensoryDetailsMap(episodicEntry) {
    const sensoryKey = `${episodicEntry.sensoryDetails.timeOfDay}-${episodicEntry.sensoryDetails.activity}`;

    if (!this.enhancedMemory.episodicMemory.sensoryDetails.has(sensoryKey)) {
      this.enhancedMemory.episodicMemory.sensoryDetails.set(sensoryKey, {
        occurrences: 0,
        emotionalPatterns: {},
        commonTopics: [],
        averageEmotionalIntensity: 0
      });
    }

    const sensoryData = this.enhancedMemory.episodicMemory.sensoryDetails.get(sensoryKey);
    sensoryData.occurrences++;

    // Track emotional patterns
    const emotion = episodicEntry.emotionalContext.emotion;
    sensoryData.emotionalPatterns[emotion] = (sensoryData.emotionalPatterns[emotion] || 0) + 1;

    // Track common topics
    episodicEntry.topics.forEach(topic => {
      if (!sensoryData.commonTopics.includes(topic)) {
        sensoryData.commonTopics.push(topic);
      }
    });

    // Update average emotional intensity
    const totalIntensity = sensoryData.averageEmotionalIntensity * (sensoryData.occurrences - 1) + episodicEntry.emotionalContext.intensity;
    sensoryData.averageEmotionalIntensity = totalIntensity / sensoryData.occurrences;
  }

  // Update temporal context
  updateTemporalContext(episodicEntry) {
    const hour = episodicEntry.sensoryDetails.timeOfDay;
    const dayOfWeek = new Date(episodicEntry.timestamp).getDay();

    const temporalKey = `${dayOfWeek}-${hour}`;

    if (!this.enhancedMemory.episodicMemory.temporalContext.has(temporalKey)) {
      this.enhancedMemory.episodicMemory.temporalContext.set(temporalKey, {
        interactions: [],
        emotionalTrends: {},
        topicPatterns: {}
      });
    }

    const temporalData = this.enhancedMemory.episodicMemory.temporalContext.get(temporalKey);
    temporalData.interactions.push(episodicEntry);

    // Keep only last 20 interactions per temporal context
    if (temporalData.interactions.length > 20) {
      temporalData.interactions = temporalData.interactions.slice(-20);
    }

    // Update emotional trends
    const emotion = episodicEntry.emotionalContext.emotion;
    temporalData.emotionalTrends[emotion] = (temporalData.emotionalTrends[emotion] || 0) + 1;

    // Update topic patterns
    episodicEntry.topics.forEach(topic => {
      temporalData.topicPatterns[topic] = (temporalData.topicPatterns[topic] || 0) + 1;
    });
  }

  // Update procedural memory
  updateProceduralMemory(message, dominantEmotion) {
    const lowerMessage = message.toLowerCase();
    const responsePattern = this.analyzeResponsePattern(lowerMessage);

    // Update interaction patterns
    if (!this.enhancedMemory.proceduralMemory.interactionPatterns.has(responsePattern.type)) {
      this.enhancedMemory.proceduralMemory.interactionPatterns.set(responsePattern.type, {
        occurrences: 0,
        successfulResponses: 0,
        emotionalOutcomes: {},
        adaptationHistory: []
      });
    }

    const patternData = this.enhancedMemory.proceduralMemory.interactionPatterns.get(responsePattern.type);
    patternData.occurrences++;

    // Track emotional outcomes
    const outcomeEmotion = dominantEmotion.emotion;
    patternData.emotionalOutcomes[outcomeEmotion] = (patternData.emotionalOutcomes[outcomeEmotion] || 0) + 1;

    // Track adaptation history
    patternData.adaptationHistory.push({
      timestamp: new Date(),
      input: message,
      emotionalOutcome: outcomeEmotion,
      intensity: dominantEmotion.intensity,
      context: {
        affection: this.emotions.affection,
        relationshipCloseness: this.memory.relationship.closeness
      }
    });

    // Keep only last 10 adaptations per pattern
    if (patternData.adaptationHistory.length > 10) {
      patternData.adaptationHistory = patternData.adaptationHistory.slice(-10);
    }

    // Update response patterns based on success
    this.updateResponsePatterns(responsePattern, dominantEmotion);
  }

  // Analyze response pattern from message
  analyzeResponsePattern(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('?')) {
      if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you feel')) {
        return { type: 'emotional_inquiry', category: 'personal' };
      } else if (lowerMessage.includes('what') && (lowerMessage.includes('wear') || lowerMessage.includes('outfit'))) {
        return { type: 'appearance_question', category: 'personal' };
      } else {
        return { type: 'general_question', category: 'informational' };
      }
    } else if (lowerMessage.includes('i like') || lowerMessage.includes('you\'re') || lowerMessage.includes('i love')) {
      return { type: 'compliment', category: 'affectionate' };
    } else if (lowerMessage.includes('tell me') || lowerMessage.includes('explain')) {
      return { type: 'request_information', category: 'informational' };
    } else if (lowerMessage.includes('let\'s') || lowerMessage.includes('want to')) {
      return { type: 'suggestion', category: 'interactive' };
    } else {
      return { type: 'statement', category: 'conversational' };
    }
  }

  // Update response patterns based on outcomes
  updateResponsePatterns(pattern, dominantEmotion) {
    const patternKey = `${pattern.category}_${pattern.type}`;

    if (!this.enhancedMemory.proceduralMemory.responsePatterns.has(patternKey)) {
      this.enhancedMemory.proceduralMemory.responsePatterns.set(patternKey, {
        totalUses: 0,
        successfulOutcomes: 0,
        emotionalDistribution: {},
        effectiveness: 0,
        lastUsed: null
      });
    }

    const responseData = this.enhancedMemory.proceduralMemory.responsePatterns.get(patternKey);
    responseData.totalUses++;
    responseData.lastUsed = new Date();

    // Track emotional distribution
    const emotion = dominantEmotion.emotion;
    responseData.emotionalDistribution[emotion] = (responseData.emotionalDistribution[emotion] || 0) + 1;

    // Calculate effectiveness (higher affection and happiness = more effective)
    const effectiveness = (this.emotions.affection * 0.4 + this.emotions.happiness * 0.4 + (100 - this.emotions.sadness) * 0.2) / 100;
    responseData.effectiveness = (responseData.effectiveness * (responseData.totalUses - 1) + effectiveness) / responseData.totalUses;

    // Mark as successful if it leads to positive emotions
    if (dominantEmotion.emotion === 'happiness' || dominantEmotion.emotion === 'affection') {
      responseData.successfulOutcomes++;
    }
  }

  extractTopicsFromMessage(message) {
    const lower = message.toLowerCase();
    const topics = [];

    if (lower.includes('game') || lower.includes('gaming') || lower.includes('play')) topics.push('gaming');
    if (lower.includes('code') || lower.includes('programming') || lower.includes('lua') || lower.includes('script')) topics.push('coding');
    if (lower.includes('food') || lower.includes('eat') || lower.includes('drink') || lower.includes('hungry')) topics.push('food');
    if (lower.includes('weather') || lower.includes('rain') || lower.includes('sunny') || lower.includes('cold')) topics.push('weather');
    if (lower.includes('fox') || lower.includes('tail') || lower.includes('ears') || lower.includes('animal')) topics.push('appearance');
    if (lower.includes('music') || lower.includes('song') || lower.includes('listen')) topics.push('music');
    if (lower.includes('movie') || lower.includes('film') || lower.includes('watch') || lower.includes('tv')) topics.push('movies');
    if (lower.includes('school') || lower.includes('study') || lower.includes('learn') || lower.includes('class')) topics.push('school');
    if (lower.includes('work') || lower.includes('job') || lower.includes('busy')) topics.push('work');
    if (lower.includes('friend') || lower.includes('family') || lower.includes('relationship')) topics.push('relationships');
    if (lower.includes('sport') || lower.includes('exercise') || lower.includes('run') || lower.includes('gym')) topics.push('sports');
    if (lower.includes('travel') || lower.includes('trip') || lower.includes('vacation') || lower.includes('holiday')) topics.push('travel');
    if (lower.includes('book') || lower.includes('read') || lower.includes('story')) topics.push('books');
    if (lower.includes('art') || lower.includes('draw') || lower.includes('paint')) topics.push('art');
    if (lower.includes('dream') || lower.includes('sleep') || lower.includes('night')) topics.push('dreams');
    if (lower.includes('future') || lower.includes('plan') || lower.includes('goal')) topics.push('future');
    if (lower.includes('past') || lower.includes('memory') || lower.includes('childhood')) topics.push('past');
    if (lower.includes('hobby') || lower.includes('interest') || lower.includes('fun')) topics.push('hobbies');

    return topics;
  }

  getRelevantMemories(currentMessage) {
    const currentTopics = this.extractTopicsFromMessage(currentMessage);
    const relevant = [];

    this.memory.conversationHistory.forEach(entry => {
      const overlap = entry.topics.filter(topic => currentTopics.includes(topic));
      if (overlap.length > 0) {
        relevant.push(entry);
      }
    });

    return relevant.slice(-5); // Return up to 5 relevant memories
  }

  generateTopicFollowUp(userInput, topic) {
    const lowerInput = userInput.toLowerCase();

    const followUpResponses = {
      travel: [
        `*Mia smiles warmly, remembering our conversation* You were telling me about your vacation! What else happened during your trip? Did you meet any interesting people? ✈️`,
        `*Mia's eyes light up* Oh right, we were talking about your vacation! Tell me more - what was the most unexpected thing that happened? 🌴`,
        `*Mia leans forward eagerly* I remember you mentioned your trip! What did you do for fun while you were there? Did you try any local activities? 🏖️`,
        `*Mia's tail swishes excitedly* Your vacation story was so interesting! What was your favorite moment from the trip? I'd love to hear more details! 💕`
      ],
      gaming: [
        `*Mia bounces a little* We were talking about games! What other games do you play? Have you tried any new ones lately? 🎮`,
        `*Mia's ears perk up* Oh yeah, gaming! Tell me more about your favorite game. What makes it so special to you? 🎯`,
        `*Mia grins* I remember we were chatting about games! What's the most challenging game you've ever played? 🕹️`
      ],
      coding: [
        `*Mia tilts her head thoughtfully* We were discussing programming! What project are you working on now? I'd love to hear about your code! 💻`,
        `*Mia's eyes sparkle with curiosity* Oh right, coding! What language are you most comfortable with? Have you learned anything new recently? 📝`,
        `*Mia smiles* I remember our coding conversation! What's the most interesting program you've built? Tell me about it! 🔧`
      ],
      food: [
        `*Mia licks her lips* We were talking about food! What's your all-time favorite dish? How do you like to prepare it? 🍕`,
        `*Mia's tail swishes* Oh yeah, food! Tell me about your favorite restaurant. What makes it so special? 🍽️`,
        `*Mia grins* I remember our food chat! What's the most unusual food you've ever tried? Did you like it? 🌶️`
      ],
      music: [
        `*Mia hums softly* We were discussing music! What's your favorite song right now? What do you love about it? 🎵`,
        `*Mia's ears twitch* Oh right, music! Tell me about your favorite artist. What draws you to their music? 🎤`,
        `*Mia smiles* I remember our music conversation! What's the most memorable concert you've been to? 🎶`
      ],
      movies: [
        `*Mia gets excited* We were talking about movies! What's your favorite genre? Have you seen anything amazing lately? 🎬`,
        `*Mia's eyes widen* Oh yeah, films! Tell me about your favorite movie. What makes it so special to you? 🍿`,
        `*Mia grins* I remember our movie chat! What's the most surprising plot twist you've seen in a movie? 🎭`
      ]
    };

    if (followUpResponses[topic]) {
      return followUpResponses[topic][Math.floor(Math.random() * followUpResponses[topic].length)];
    }

    // Fallback for other topics
    return `*Mia smiles warmly* We were talking about ${topic}! Tell me more - what else is on your mind about it? I'd love to hear your thoughts! 💕`;
  }

  generateTopicResponse(userInput, topics, dominantEmotion) {
    const primaryTopic = topics[0];
    const lowerInput = userInput.toLowerCase();

    const topicResponses = {
      gaming: dominantEmotion.emotion === 'sadness' && dominantEmotion.intensity > 30 ? [
        `*Mia tries to smile but her ears stay drooped* Gaming usually cheers me up, but I'm not feeling great right now. What games do you play?`,
        `*Mia's voice is quiet* I wish I could get excited about gaming right now... What do you like to play?`,
        `*Mia sighs softly* Games are fun, but I'm feeling down. Tell me about your favorite games anyway?`
      ] : dominantEmotion.emotion === 'happiness' && dominantEmotion.intensity > 70 ? [
        `*Mia bounces with excitement* Gaming is the BEST! I'm so happy right now! What games make you excited? 🎮✨`,
        `*Mia's tail swishes wildly* I'm feeling amazing! Let's talk about awesome games! What do you play?`,
        `*Mia grins widely* My happiness is overflowing! Gaming conversations are perfect right now! 🎮💕`
      ] : dominantEmotion.emotion === 'affection' && dominantEmotion.intensity > 80 ? [
        `*Mia cuddles up to you* I love gaming with friends! You're my favorite gaming buddy! What should we play together? 💕🎮`,
        `*Mia's eyes sparkle with love* Gaming and you? Perfect combination! What games do you enjoy? 😘`,
        `*Mia holds your hand* I feel so connected to you! Tell me about your gaming adventures! ❤️🎮`
      ] : [
        `Gaming is so much fun! What games do you like to play? I bet you'd be great at Roblox scripting too! 🎮`,
        `I love hearing about games! Are you playing anything exciting right now? I'd love to hear about your favorite games!`,
        `Games are awesome! What genre do you enjoy most - action, puzzle, RPG? Tell me more about your gaming experiences!`
      ],
      coding: [
        `Programming is fascinating! What languages do you work with? I'm always interested in learning more about coding! 💻`,
        `Code is like magic to me! What are you working on right now? I'd love to hear about your projects!`,
        `I think coding is so creative! What got you interested in programming? Do you have any favorite languages?`
      ],
      food: [
        `Food is one of life's great pleasures! What's your favorite dish? I love trying new things! 🍕`,
        `Mmm, talking about food makes me hungry! What's the best meal you've ever had? Tell me about your favorite foods!`,
        `I love food conversations! Are you a good cook? What's your signature dish or favorite restaurant?`
      ],
      weather: [
        `Weather can be so unpredictable! How's the weather where you are? I always find it interesting how it affects our moods! 🌤️`,
        `The weather really sets the mood for the day! What's your favorite type of weather and why?`,
        `Weather patterns are fascinating! Do you have any favorite weather-related memories or traditions?`
      ],
      appearance: [
        `Being a fox girl is really special to me! My ears and tail help me express my emotions so clearly. What do you think about animal features? 🦊`,
        `I love my fox features! They make me unique. Have you ever wondered what it would be like to have animal ears or a tail?`,
        `My appearance is important to me. I change outfits every day! What styles or looks do you find interesting?`
      ],
      music: [
        `Music is amazing! What songs or artists do you listen to? Music can really capture emotions perfectly! 🎵`,
        `I love music conversations! What's your favorite genre? Do you play any instruments or sing?`,
        `Music touches the soul! What song always makes you feel good? I'd love to hear about your musical tastes!`
      ],
      movies: [
        `Movies are such a great escape! What's your favorite film? I love stories that take you to different worlds! 🎬`,
        `Film discussions are the best! What genres do you enjoy most? Have you seen anything amazing lately?`,
        `I adore movies! What's the last movie that really moved you? Tell me about your favorite cinematic experiences!`
      ],
      school: [
        `Learning is so important! What subjects interest you most? I'm always curious about different fields of study! 📚`,
        `School can be challenging but rewarding! What's your favorite subject and why? What are you studying?`,
        `Education shapes who we are! What do you find most interesting about learning? Any favorite teachers or subjects?`
      ],
      work: [
        `Work can be fulfilling! What do you do? I always find it fascinating to hear about different careers and jobs! 💼`,
        `Tell me about your work! What do you enjoy most about what you do? What challenges do you face?`,
        `Careers are such a big part of life! What's your dream job or what made you choose your current path?`
      ],
      relationships: [
        `Relationships are so important! Family and friends make life meaningful. How do you like to spend time with loved ones? ❤️`,
        `Connections with others enrich our lives! What's most important to you in relationships? Tell me about your support system!`,
        `Friendships and family bonds are precious! What makes a relationship special to you? I'd love to hear about the people in your life!`
      ],
      sports: [
        `Sports are exciting! What activities do you enjoy? Exercise is so good for both body and mind! ⚽`,
        `I love hearing about physical activities! What's your favorite sport or exercise? Do you play on any teams?`,
        `Staying active is important! What motivates you to exercise? Tell me about your athletic experiences!`
      ],
      travel: [
        `Travel opens up new worlds! Where have you been or where do you dream of going? I love hearing about adventures! ✈️`,
        `Exploring new places sounds amazing! What's your favorite travel memory? Where would you go if you could go anywhere?`,
        `Travel stories are the best! What cultures or places fascinate you most? Tell me about your journeys!`,
        `*Mia's eyes light up with excitement* Oh, I love hearing about vacations! What was your favorite part of your trip? Did you try any amazing food or see beautiful sights? 🏖️`,
        `*Mia leans forward curiously* Tell me more about your vacation! What made it so special? I bet you have some wonderful memories from it! 🌴`,
        `*Mia's tail swishes happily* Vacations sound so fun! What did you do during your trip? Did you relax or have lots of adventures? ✈️`
      ],
      books: [
        `Books are magical! What are you reading right now? Stories can transport you to incredible places! 📖`,
        `Reading is such a wonderful hobby! What's your favorite book or author? What genres do you enjoy most?`,
        `Literature is amazing! What book has had the biggest impact on you? I'd love to hear about your reading adventures!`
      ],
      art: [
        `Art is so expressive! Do you create art or enjoy looking at it? What mediums or styles interest you most? 🎨`,
        `Creativity through art is beautiful! What's your favorite form of artistic expression? Tell me about your artistic side!`,
        `Art can be so therapeutic! What inspires you creatively? Do you have any favorite artists or styles?`
      ],
      dreams: [
        `Dreams are mysterious and fascinating! Do you remember your dreams? What do you think they mean? 🌙`,
        `Sleep and dreams are so interesting! What's the most vivid dream you've had? Do you keep a dream journal?`,
        `Dreams can be so revealing! What themes appear in your dreams? I'd love to hear about your nighttime adventures!`
      ],
      future: [
        `The future is full of possibilities! What are your goals and dreams? I love hearing about people's aspirations! 🔮`,
        `Planning for the future is exciting! What are you working toward? What makes you hopeful about tomorrow?`,
        `Goals and dreams shape our paths! What's something you're really passionate about achieving? Tell me your vision!`
      ],
      past: [
        `Our past experiences shape who we are! What memories bring you joy? I love hearing personal stories! 📜`,
        `History, both personal and world, is fascinating! What period of your life do you look back on fondly?`,
        `Memories are precious! What's a story from your past that you love sharing? What have you learned from your experiences?`
      ],
      hobbies: [
        `Hobbies make life fun! What do you enjoy doing in your free time? I love hearing about people's passions! 🎯`,
        `Personal interests are so important! What's your favorite hobby and why? How did you get into it?`,
        `Pursuing interests enriches life! What activities make you lose track of time? Tell me about what you love doing!`
      ]
    };

    if (topicResponses[primaryTopic]) {
      return topicResponses[primaryTopic][Math.floor(Math.random() * topicResponses[primaryTopic].length)];
    }

    // Fallback if topic not found
    return `That's interesting! Tell me more about ${primaryTopic}. I'd love to hear your thoughts on it!`;
  }

  // Time utilities
  getCurrentTime() {
    try {
      const now = new Date();
      const amsterdamTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Amsterdam"}));
      return {
        hours: amsterdamTime.getHours(),
        minutes: amsterdamTime.getMinutes(),
        timeString: amsterdamTime.toLocaleTimeString("en-US", {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: "Europe/Amsterdam"
        }),
        dateString: amsterdamTime.toLocaleDateString("en-US", {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: "Europe/Amsterdam"
        })
      };
    } catch (error) {
      const now = new Date();
      return {
        hours: now.getHours(),
        minutes: now.getMinutes(),
        timeString: now.toLocaleTimeString("en-US", {hour: '2-digit', minute: '2-digit', hour12: true}),
        dateString: now.toLocaleDateString("en-US", {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})
      };
    }
  }

  getTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  }

  // Check if we should greet the user (after bye/goodbye/goodnight or new day)
  shouldGreetUser(userInput) {
    const lowerInput = userInput.toLowerCase();

    // Always greet if user says bye/goodbye/goodnight
    if (lowerInput.includes('bye') || lowerInput.includes('goodbye') || lowerInput.includes('goodnight')) {
      return true;
    }

    // Check if it's a new day and we haven't greeted today
    const today = new Date().toDateString();
    if (!this.memory.hasGreetedToday) {
      this.memory.hasGreetedToday = true;
      this.saveData();
      return true;
    }

    // Check if user hasn't been greeted in this conversation yet
    if (!this.memory.hasGreetedInConversation) {
      this.memory.hasGreetedInConversation = true;
      this.saveData();
      return true;
    }

    return false;
  }

  startConversation() {
    // Check if a prompt is provided as command line argument
    if (process.argv[2]) {
      const prompt = process.argv.slice(2).join(' '); // Join all arguments as the prompt
      (async () => {
        const response = await this.generateResponse(prompt);
        console.log(`${this.name}: ${response}`);
        rl.close();
      })();
      return;
    }

    // Only show full introduction on first run
    if (this.memory.interactionCount === 0) {
      console.log(`*A beautiful 19-year-old fox girl with ${this.appearance.hair}, ${this.appearance.eyes}, wearing a ${this.appearance.clothing.top}, ${this.appearance.clothing.bottom}, ${this.appearance.clothing.legs}, and ${this.appearance.clothing.feet}, with ${this.appearance.clothing.accessories} approaches you with a warm smile*`);
      console.log(`Hey ${this.userName}! I'm ${this.name}, your very good close friend.`);
      console.log("Let's chat! I remember everything we talk about and I'm here to be your friend. Type 'bye' when you want to stop.\n");
    } else {
      const lastInteraction = this.getTimeAgo(this.memory.lastInteraction);
      const shouldGreet = this.shouldGreetUser(''); // Check if we should greet on startup
      if (shouldGreet) {
        if (this.memory.userIsAway) {
          // User is returning from being away - use missed greeting
          this.memory.userIsAway = false;
          this.memory.awaySince = null;
          this.emotions.affection = Math.min(150, this.emotions.affection + 50); // Big affection boost for return
          this.emotions.happiness = Math.min(100, this.emotions.happiness + 30);
          this.saveData();
          const missedGreeting = this.missedGreetingVariants[Math.floor(Math.random() * this.missedGreetingVariants.length)];
          console.log(`*${this.name} notices you and her face lights up*`);
          console.log(`${missedGreeting}\n`);
        } else if (this.memory.justSaidBye) {
          // User just said bye and is coming back
          console.log(`*${this.name} looks up and smiles warmly*`);
          console.log(`Oh hey again, ${this.userName}! Welcome back! It's been ${lastInteraction} since we last chatted. What's up?\n`);
          this.memory.justSaidBye = false; // Reset the flag
          this.saveData();
        } else {
          // Check if user was gone for a long time without telling her
          const now = new Date();
          const timeSinceLastInteraction = now - this.memory.lastInteraction;
          const hoursSinceLastInteraction = timeSinceLastInteraction / (1000 * 60 * 60);

          if (hoursSinceLastInteraction > 24) {
            // Long absence without telling her - use long absence greeting
            const absencePenalty = Math.min(30, Math.floor(hoursSinceLastInteraction / 24) * 5);
            this.emotions.sadness = Math.min(100, this.emotions.sadness + absencePenalty);
            this.emotions.anger = Math.min(100, this.emotions.anger + Math.floor(absencePenalty / 2));
            this.emotions.affection = Math.min(150, this.emotions.affection + 20); // Still some affection boost for return
            this.saveData();
            const longAbsenceGreeting = this.longAbsenceGreetingVariants[Math.floor(Math.random() * this.longAbsenceGreetingVariants.length)];
            console.log(`*${this.name} sees you and crosses her arms, looking upset*`);
            console.log(`${longAbsenceGreeting}\n`);
          } else {
            // Normal return greeting
            console.log(`*${this.name} smiles warmly as she sees you again*`);
            console.log(`Hey ${this.userName}! Welcome back! It's been ${lastInteraction} since we last chatted. What's up?\n`);
          }
        }
      }
    }

    const askQuestion = async () => {
      rl.question(`${this.userName}: `, async (answer) => {
        if (answer.toLowerCase() === 'bye') {
          // Reset greeting flag when user says bye
          this.memory.hasGreetedInConversation = false;
          this.memory.hasGreetedToday = false; // Reset daily greeting flag
          this.saveData();
          console.log(`${this.name}: ${this.generateFarewellResponse()}`);
          rl.close();
          return;
        }

        const response = await this.generateResponse(answer);
        console.log(`${this.name}: ${response}\n`);

        askQuestion();
      });
    };

    askQuestion();
  }
}

// Export the class for use in other modules
module.exports = MiaAI;

// Only start CLI conversation if this file is run directly (not required as module)
if (require.main === module) {
  // Start the AI
  const mia = new MiaAI();
  mia.startConversation();
}