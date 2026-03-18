"""Hidden gems data for the Colaba Heritage Walk tour."""

HIDDEN_GEMS = {
    "gateway-of-india": [
        {
            "id": "gateway-shivaji-statue",
            "name": "Chhatrapati Shivaji Maharaj Statue",
            "description": "This grand equestrian bronze statue of the Maratha warrior king was installed in 1961. Shivaji founded the Maratha Empire in the 17th century and is considered one of India's greatest heroes.",
            "hint": "Look for the warrior king on horseback near the waterfront",
            "visual_cues": ["equestrian statue", "horse statue", "bronze statue on horseback", "Shivaji statue"],
        },
        {
            "id": "gateway-stone-elephants",
            "name": "Stone Elephants of the Gateway",
            "description": "The Gateway arch features intricate stone elephant carvings inspired by the Gwalior Fort style. These were added during the original construction (1911-1924) and symbolize the grandeur of the British Raj.",
            "hint": "Look closely at the archway itself for some majestic animal carvings",
            "visual_cues": ["stone elephants", "elephant carvings", "carved elephants on arch", "gateway arch details"],
        },
    ],
    "taj-mahal-palace": [
        {
            "id": "taj-iconic-dome",
            "name": "The Taj Dome & Turrets",
            "description": "The iconic red Mangalore-tiled dome was inspired by the Florentine Renaissance. Fun fact: the hotel was built facing the sea because founder Jamsetji Tata was allegedly denied entry to a European hotel for being Indian.",
            "hint": "Look up at the most iconic part of the hotel skyline",
            "visual_cues": ["dome", "red dome", "hotel dome", "turrets", "Taj dome"],
        },
        {
            "id": "taj-sea-lounge-wing",
            "name": "The Sea Lounge Wing",
            "description": "The sea-facing wing houses the legendary Sea Lounge, a favourite of Mumbai's elite since 1903. During WWII, the Taj served as a hospital for British soldiers.",
            "hint": "Find the elegant wing that faces the Arabian Sea",
            "visual_cues": ["sea facing wing", "sea lounge", "waterfront wing", "hotel wing facing sea"],
        },
    ],
    "regal-cinema": [
        {
            "id": "regal-art-deco-facade",
            "name": "Art Deco Facade Details",
            "description": "Regal Cinema's facade is a stunning example of Art Deco architecture. Mumbai has the world's second largest collection of Art Deco buildings after Miami, and Regal was one of the first to showcase this style in India.",
            "hint": "Study the geometric patterns and ornamental details on the cinema's exterior",
            "visual_cues": ["art deco facade", "geometric patterns", "cinema exterior", "art deco building", "deco ornaments"],
        },
        {
            "id": "regal-causeway-art",
            "name": "Colaba Causeway Street Scene",
            "description": "The bustling Colaba Causeway (Shahid Bhagat Singh Road) stretching from Regal Cinema is one of Mumbai's most iconic street shopping destinations, dating back to the 1800s British era.",
            "hint": "Look down the famous shopping street stretching away from the cinema",
            "visual_cues": ["Colaba Causeway", "street market", "busy street", "shopping street", "Causeway road"],
        },
    ],
    "kala-ghoda": [
        {
            "id": "kala-ghoda-black-horse",
            "name": "The Black Horse Statue",
            "description": "Kala Ghoda literally means 'Black Horse' — named after a black stone horse statue of King Edward VII that once stood here. The original was removed in 1965, but a new abstract black horse sculpture was installed in 2017.",
            "hint": "Find the statue that gave this entire district its name",
            "visual_cues": ["black horse", "horse statue", "Kala Ghoda statue", "horse sculpture", "black horse sculpture"],
        },
        {
            "id": "kala-ghoda-sassoon-library",
            "name": "David Sassoon Library",
            "description": "This beautiful Venetian Gothic building was built in 1870 by David Sassoon, a Baghdadi Jewish philanthropist. The clock tower is one of Kala Ghoda's most recognizable features.",
            "hint": "Spot the striking Venetian Gothic building with a clock tower",
            "visual_cues": ["Sassoon Library", "Venetian Gothic building", "clock tower", "library building", "gothic architecture"],
        },
        {
            "id": "kala-ghoda-street-art",
            "name": "Kala Ghoda Street Art Murals",
            "description": "During the annual Kala Ghoda Arts Festival (held every February), local and international artists create vibrant murals. Many remain year-round, making this Mumbai's unofficial outdoor art gallery.",
            "hint": "Look for colourful walls that tell stories without words",
            "visual_cues": ["street art", "mural", "wall art", "graffiti art", "painted wall", "colourful mural"],
        },
    ],
    "asiatic-library": [
        {
            "id": "asiatic-grand-columns",
            "name": "The Neoclassical Columns",
            "description": "The Asiatic Society Library features grand Doric columns inspired by the Temple of Athena in Rome. Built in 1833, it houses over 100,000 books including rare manuscripts dating back to the 1st century.",
            "hint": "Count the imposing columns that guard the entrance",
            "visual_cues": ["columns", "Doric columns", "neoclassical columns", "library entrance", "grand pillars"],
        },
        {
            "id": "asiatic-horniman-circle",
            "name": "Horniman Circle Garden",
            "description": "This beautifully manicured circular garden is surrounded by Victorian-era buildings. Originally called Elphinstone Circle, it was renamed after Benjamin Horniman, a British newspaper editor who supported Indian independence.",
            "hint": "Find the peaceful circular garden hidden behind grand buildings",
            "visual_cues": ["circular garden", "Horniman Circle", "park", "round garden", "garden with Victorian buildings"],
        },
    ],
}


def get_gems_for_stop(stop_id: str) -> list[dict]:
    """Return hidden gems for a given stop ID."""
    return HIDDEN_GEMS.get(stop_id, [])
