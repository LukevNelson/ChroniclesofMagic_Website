// Quiz Data and Logic
// Safe wrapper to call populateNames from whichever module exported it
function callPopulateNames(personality, species, magicalDiscipline, userGender, moralJourney, personalityProfile) {
    const fn = (typeof window !== 'undefined' && window.populateNames) ||
               (typeof window !== 'undefined' && window.nameDatabase && typeof window.nameDatabase.populateNames === 'function' && window.nameDatabase.populateNames) ||
               (typeof populateNames === 'function' && populateNames) ||
               null;
    if (!fn) {
        console.error('populateNames is not available in any known scope');
        return;
    }
    try {
        return fn(personality, species, magicalDiscipline, userGender, moralJourney, personalityProfile);
    } catch (e) {
        console.error('Error calling populateNames:', e);
    }
}
let currentUser = {
    givenFirstName: '',
    givenLastName: '',
    age: 0,
    species: '',
    answers: [],
    personality: {
        elemental: 0,
        adept: 0,
        aggressive: 0,
        defensive: 0,
        scholarly: 0,
        intuitive: 0,
        leader: 0,
        follower: 0,
        light: 0,
        dark: 0
    },
    takenFirstName: '',
    takenLastName: '',
    trueName: '',
    discipline: '',
    abilities: []
};

const personalityQuestions = [
    {
        question: "A child stumbles into your magical sanctuary, bleeding from mortal wounds. You could save them instantly with blood magic—but doing so would bind a fragment of their soul to yours forever, making them feel your pain and you theirs. The child has minutes to live.",
        answers: [
            { text: "Save them immediately, accepting the eternal bond and responsibility for their wellbeing", traits: { light: 4, defensive: 3 } },
            { text: "Let them die rather than curse them with such a connection to you", traits: { dark: 3, defensive: 2 } },
            { text: "Try conventional healing first, even if they might die while you attempt it", traits: { scholarly: 3, light: 2 } },
            { text: "Save them, but plan to find a way to sever the bond later, regardless of the cost", traits: { dark: 2, aggressive: 3 } }
        ]
    },
    {
        question: "You discover your closest friend has been practicing necromancy to speak with their deceased child. The magic is slowly consuming their life force, but it's the only thing keeping them from complete despair. They beg you not to interfere.",
        answers: [
            { text: "Destroy their necromantic tools to save their life, even if they never forgive you", traits: { light: 4, aggressive: 2 } },
            { text: "Help them perfect the magic so it doesn't kill them, knowing you're enabling something forbidden", traits: { dark: 3, scholarly: 2 } },
            { text: "Stay by their side and comfort them as they slowly die, respecting their choice", traits: { compassion: 4, wisdom: 2 } },
            { text: "Learn the necromancy yourself to take on the burden instead of them", traits: { dark: 4, leader: 2 } }
        ]
    },
    {
        question: "A plague spreads through the city. You possess the power to stop it instantly, but the ritual requires sacrificing someone you love—their life force would fuel the healing magic that saves thousands. Your beloved volunteers willingly.",
        answers: [
            { text: "Perform the ritual, honoring their sacrifice and carrying the weight of their death forever", traits: { dark: 4, leader: 3 } },
            { text: "Refuse and work tirelessly to find another solution, even as more people die each day", traits: { light: 4, scholarly: 2 } },
            { text: "Sacrifice yourself instead, trusting others to complete the ritual", traits: { light: 4, defensive: 1 } },
            { text: "Find a stranger to sacrifice instead, preserving your loved one but becoming a murderer", traits: { dark: 4, aggressive: 3 } }
        ]
    },
    {
        question: "You witness a fellow mage torturing prisoners for information that could prevent a war. The torture is working—they're about to reveal crucial intelligence. You have the power to stop this immediately, but doing so might doom thousands to die in the coming conflict.",
        answers: [
            { text: "Stop the torture immediately, refusing to let innocents suffer regardless of consequences", traits: { light: 4, defensive: 3 } },
            { text: "Allow it to continue, accepting that sometimes terrible means serve necessary ends", traits: { dark: 4, scholarly: 2 } },
            { text: "Kill the torturer quickly to end the suffering, then try to extract the information yourself through gentler means", traits: { aggressive: 3, light: 2 } },
            { text: "Use mind magic to make the prisoners forget the torture while they reveal what's needed", traits: { dark: 3, adept: 3 } }
        ]
    },
    {
        question: "Your magical abilities are fading due to a curse, and you've discovered the only cure requires stealing the magical essence from another mage, permanently crippling them. Without your powers, you cannot protect those who depend on you, and they will surely die.",
        answers: [
            { text: "Accept the loss of your powers and find non-magical ways to help others", traits: { light: 4, defensive: 2 } },
            { text: "Take the essence from a criminal mage who has hurt others", traits: { dark: 3, aggressive: 2 } },
            { text: "Seek out someone willing to make the sacrifice, even knowing they don't understand the full cost", traits: { dark: 2, scholarly: 3 } },
            { text: "Research tirelessly for another solution, knowing people will die while you search", traits: { scholarly: 4, light: 1 } }
        ]
    },
    {
        question: "You discover that your own existence is tied to a dimensional rift that's slowly destroying reality. Closing the rift would save countless worlds but erase you from existence entirely—not just killing you, but making it so you never existed. No one would remember you.",
        answers: [
            { text: "Close the rift immediately, accepting complete erasure to save reality", traits: { light: 4, defensive: 4 } },
            { text: "Seek a way to transfer your existence to someone else before closing the rift", traits: { dark: 3, scholarly: 3 } },
            { text: "Try to stabilize the rift instead of closing it, risking everything for a chance to live", traits: { dark: 2, aggressive: 3 } },
            { text: "Tell others the truth and let them decide your fate", traits: { light: 2, follower: 3 } }
        ]
    },
    {
        question: "A tyrant ruler with immense magical power oppresses your people. You could assassinate them easily, but they're also the only barrier holding back an ancient evil that would consume the world. Their death would free your people but doom humanity.",
        answers: [
            { text: "Kill the tyrant and dedicate your life to fighting the ancient evil they held back", traits: { aggressive: 4, light: 2 } },
            { text: "Support the tyrant's rule to protect the world from greater evil", traits: { dark: 3, defensive: 3 } },
            { text: "Try to reform the tyrant through influence and time, hoping to create a better solution", traits: { leader: 3, light: 2 } },
            { text: "Seek the power to replace them as both ruler and guardian, no matter the personal cost", traits: { dark: 4, leader: 3 } }
        ]
    },
    {
        question: "You can peer into the future and see that someone you care about will become a monster who destroys everything you hold dear. You could prevent this by killing them now while they're still innocent, or by binding their will to yours forever.",
        answers: [
            { text: "Trust that people can change their fate and do nothing", traits: { light: 4, follower: 2 } },
            { text: "Bind their will to prevent the dark future, destroying their free will to save others", traits: { dark: 4, leader: 2 } },
            { text: "Kill them now to prevent the suffering they would cause", traits: { dark: 3, aggressive: 4 } },
            { text: "Dedicate yourself to guiding them toward a better path, accepting the risk", traits: { light: 3, defensive: 3 } }
        ]
    },
    {
        question: "You've mastered magic that could erase traumatic memories from victims of great suffering, giving them peace. However, these memories also contain crucial wisdom about recognizing and preventing future evil. The victims beg you to take away their pain.",
        answers: [
            { text: "Erase their memories completely, giving them the peace they desperately need", traits: { light: 3, defensive: 3 } },
            { text: "Refuse, believing their wisdom through suffering serves a greater purpose", traits: { dark: 3, scholarly: 3 } },
            { text: "Alter the memories to remove the pain but preserve the lessons", traits: { adept: 4, scholarly: 2 } },
            { text: "Teach them to bear their memories with strength, offering support instead of escape", traits: { light: 2, leader: 3 } }
        ]
    },
    {
        question: "A parallel version of yourself from another dimension arrives, claiming that in their world, you became a tyrant who destroyed everything. They demand you let them kill you to prevent the same fate. They show you convincing evidence of the future you could become.",
        answers: [
            { text: "Allow them to kill you, accepting that your potential for evil outweighs your good", traits: { light: 4, follower: 3 } },
            { text: "Fight them, believing you can choose a different path than your alternate self", traits: { aggressive: 3, light: 2 } },
            { text: "Try to understand what led your other self to darkness and actively work to avoid it", traits: { scholarly: 4, defensive: 2 } },
            { text: "Kill them instead, deciding that their version of events doesn't define your destiny", traits: { dark: 3, aggressive: 4 } }
        ]
    },
    {
        question: "You can give a homeless, dying person incredible magical power that would let them reshape their life completely. However, you know that power corrupts, and they would likely become dangerous to others. They're dying tonight without intervention.",
        answers: [
            { text: "Give them the power and trust them to use it wisely, believing everyone deserves a chance", traits: { light: 3, leader: 2 } },
            { text: "Let them die rather than risk them becoming a threat to innocents", traits: { dark: 3, defensive: 3 } },
            { text: "Give them limited power with safeguards, even though it might not be enough to save them", traits: { scholarly: 3, light: 2 } },
            { text: "Offer them a different kind of help—healing their body but not granting magical power", traits: { light: 4, defensive: 1 } }
        ]
    },
    {
        question: "You discover that every time you use your most powerful magic, somewhere in the world, a random person experiences excruciating pain for the exact duration of your spell. You've unknowingly caused hundreds of people to suffer. Your magic has also saved thousands of lives.",
        answers: [
            { text: "Never use that magic again, even if it means being unable to help people you could have saved", traits: { light: 4, defensive: 3 } },
            { text: "Continue using it only in the most dire circumstances, weighing each use carefully", traits: { scholarly: 3, dark: 2 } },
            { text: "Research obsessively to find a way to remove this curse, neglecting current problems", traits: { scholarly: 4, defensive: 1 } },
            { text: "Accept this as the price of power and continue using your magic to help the many", traits: { dark: 4, leader: 2 } }
        ]
    },
    {
        question: "A dying god offers to grant you their power, making you immortal and able to prevent most suffering in the world. However, accepting means you can never again form close relationships—your divine nature would either destroy those you love or leave you watching them age and die for eternity.",
        answers: [
            { text: "Accept the power, sacrificing personal happiness to serve humanity for eternity", traits: { light: 4, leader: 4 } },
            { text: "Refuse, choosing to remain mortal and treasure the relationships you can have", traits: { light: 3, defensive: 2 } },
            { text: "Accept but plan to find ways around the restriction on relationships", traits: { dark: 2, adept: 3 } },
            { text: "Ask for time to say goodbye to everyone you love before accepting", traits: { light: 2, scholarly: 2 } }
        ]
    },
    {
        question: "You realize that your very existence anchors evil in the world—as long as you live, darkness grows stronger everywhere. However, your death would also release all the evil you've contained throughout your life in one catastrophic burst, potentially ending civilization before slowly making the world a better place.",
        answers: [
            { text: "End your life immediately, accepting the catastrophe to ensure a better future", traits: { light: 4, aggressive: 3 } },
            { text: "Live as long as possible while seeking a solution, even as evil grows stronger", traits: { defensive: 4, scholarly: 3 } },
            { text: "Find a way to transfer this burden to someone willing to bear it", traits: { dark: 3, leader: 2 } },
            { text: "Use your connection to evil to understand and combat it more effectively", traits: { dark: 4, scholarly: 2 } }
        ]
    },
    {
        question: "In the final question, you face the ultimate choice: You can rewrite reality itself to create a perfect world where no one suffers, but doing so would erase free will from every living being. Everyone would be happy, but they would essentially become puppets following a script you write.",
        answers: [
            { text: "Create the perfect world, believing happiness without choice is better than suffering with freedom", traits: { dark: 4, leader: 4 } },
            { text: "Preserve free will and accept that suffering is the price of authentic existence", traits: { light: 4, defensive: 3 } },
            { text: "Create a compromise—reduce suffering while preserving most free will, even if imperfect", traits: { light: 3, scholarly: 3 } },
            { text: "Refuse to make the choice, letting others decide the fate of reality", traits: { follower: 4, defensive: 2 } }
        ]
    }
];

let currentQuestionIndex = 0;
let selectedAnswer = null;

function startQuiz() {
    // Validate registration form
    const firstName = document.getElementById('givenFirstName').value.trim();
    const lastName = document.getElementById('givenLastName').value.trim();
    const age = parseInt(document.getElementById('age').value);
    
    if (!firstName || !lastName || !age || !currentUser.species) {
        showNotification('Please fill in all fields and select a species before starting the quiz.', 'error');
        return;
    }
    
    if (age < 10 || age > 999) {
        showNotification('Please enter a valid age between 10 and 999.', 'error');
        return;
    }
    
    // Save user data
    currentUser.givenFirstName = firstName;
    currentUser.givenLastName = lastName;
    currentUser.age = age;
    // Species is already saved in selectSpecies function
    
    // Start personality test
    showStep('personality-test');
    loadQuestion();
}

function showStep(stepId) {
    document.querySelectorAll('.quiz-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(stepId).classList.add('active');
}

function loadQuestion() {
    const question = personalityQuestions[currentQuestionIndex];
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    document.getElementById('total-questions').textContent = personalityQuestions.length;
    
    // Update progress
    const progress = ((currentQuestionIndex + 1) / personalityQuestions.length) * 50; // 50% for questions
    document.getElementById('quiz-progress').style.width = progress + '%';
    
    // Load answers
    const answersContainer = document.getElementById('answers-container');
    answersContainer.innerHTML = '';
    
    question.answers.forEach((answer, index) => {
        const answerDiv = document.createElement('div');
        answerDiv.className = 'answer-option';
        answerDiv.textContent = answer.text;
        answerDiv.onclick = () => selectAnswer(index);
        answerDiv.dataset.index = index;
        answersContainer.appendChild(answerDiv);
    });
    
    // Reset selection
    selectedAnswer = null;
    updateNavigationButtons();
}

function selectAnswer(answerIndex) {
    // Remove previous selection
    document.querySelectorAll('.answer-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Select new answer
    document.querySelector(`[data-index="${answerIndex}"]`).classList.add('selected');
    selectedAnswer = answerIndex;
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-question');
    const nextBtn = document.getElementById('next-question');
    
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = selectedAnswer === null;
    
    if (currentQuestionIndex === personalityQuestions.length - 1) {
        nextBtn.textContent = 'Complete Quiz';
    } else {
        nextBtn.textContent = 'Next';
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        // Save current answer if selected
        if (selectedAnswer !== null) {
            saveCurrentAnswer();
        }
        
        currentQuestionIndex--;
        loadQuestion();
        
        // Restore previous answer if exists
        if (currentUser.answers[currentQuestionIndex] !== undefined) {
            selectAnswer(currentUser.answers[currentQuestionIndex]);
        }
    }
}

function nextQuestion() {
    if (selectedAnswer === null) return;
    
    // Save current answer
    saveCurrentAnswer();
    
    if (currentQuestionIndex < personalityQuestions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
        
        // Restore answer if exists
        if (currentUser.answers[currentQuestionIndex] !== undefined) {
            selectAnswer(currentUser.answers[currentQuestionIndex]);
        }
    } else {
        // Quiz complete, calculate personality
        calculatePersonality();
        showNameSelection();
    }
}

function saveCurrentAnswer() {
    currentUser.answers[currentQuestionIndex] = selectedAnswer;
    
    // Apply personality traits
    const question = personalityQuestions[currentQuestionIndex];
    const answer = question.answers[selectedAnswer];
    
    Object.entries(answer.traits).forEach(([trait, value]) => {
        currentUser.personality[trait] += value;
    });
}

function calculatePersonality() {
    // Determine dominant traits
    const personality = currentUser.personality;
    
    // Calculate personality-based character stats and abilities
    const personalityProfile = calculateAdvancedPersonalityProfile(personality);
    currentUser.personalityProfile = personalityProfile;
    
    // Determine primary discipline
    if (personality.elemental > personality.adept) {
        if (personality.aggressive > personality.defensive) {
            currentUser.discipline = 'Elemental (Aggressive)';
        } else {
            currentUser.discipline = 'Elemental (Defensive)';
        }
    } else {
        if (personality.intuitive > personality.scholarly) {
            currentUser.discipline = 'Adept (Intuitive)';
        } else {
            currentUser.discipline = 'Adept (Scholarly)';
        }
    }
    
    // Determine alignment
    currentUser.alignment = personality.light > personality.dark ? 'Light' : 'Dark';
    
    // Determine leadership style
    currentUser.leadership = personality.leader > personality.follower ? 'Leader' : 'Follower';
    
    // Generate gameplay mechanics based on personality
    currentUser.gameplayMechanics = generateGameplayMechanics(personalityProfile, currentUser.species);
}

function calculateAdvancedPersonalityProfile(personality) {
    // Calculate trait intensities (0-100 scale)
    const traits = {
        elemental: Math.round((personality.elemental / Math.max(personality.elemental + personality.adept, 1)) * 100),
        adept: Math.round((personality.adept / Math.max(personality.elemental + personality.adept, 1)) * 100),
        light: Math.round((personality.light / Math.max(personality.light + personality.dark, 1)) * 100),
        dark: Math.round((personality.dark / Math.max(personality.light + personality.dark, 1)) * 100),
        aggressive: Math.round((personality.aggressive / Math.max(personality.aggressive + personality.defensive, 1)) * 100),
        defensive: Math.round((personality.defensive / Math.max(personality.aggressive + personality.defensive, 1)) * 100),
        leader: Math.round((personality.leader / Math.max(personality.leader + personality.follower, 1)) * 100),
        follower: Math.round((personality.follower / Math.max(personality.leader + personality.follower, 1)) * 100),
        intuitive: Math.round((personality.intuitive / Math.max(personality.intuitive + personality.scholarly, 1)) * 100),
        scholarly: Math.round((personality.scholarly / Math.max(personality.intuitive + personality.scholarly, 1)) * 100)
    };
    
    // Determine dominant personality archetype
    const archetype = determinePersonalityArchetype(traits);
    
    // Calculate character attributes based on personality
    const attributes = calculatePersonalityAttributes(traits);
    
    // Determine roleplay tendencies
    const roleplayTendencies = calculateRoleplayTendencies(traits);
    
    // Calculate learning bonuses and penalties
    const learningModifiers = calculateLearningModifiers(traits);
    
    return {
        traits,
        archetype,
        attributes,
        roleplayTendencies,
        learningModifiers,
        personalityStrength: calculatePersonalityStrength(traits)
    };
}

function determinePersonalityArchetype(traits) {
    const archetypes = [
        {
            name: "The Destroyer",
            description: "Aggressive elemental mage who solves problems with overwhelming force",
            requirements: { elemental: 60, aggressive: 60 },
            bonus: "200% elemental damage when health is below 50%"
        },
        {
            name: "The Guardian",
            description: "Defensive mage who protects others through magical barriers and healing",
            requirements: { defensive: 70, light: 60 },
            bonus: "All protective spells affect nearby allies automatically"
        },
        {
            name: "The Scholar",
            description: "Intellectual mage who excels at magical research and complex spellwork",
            requirements: { scholarly: 70, adept: 60 },
            bonus: "Can memorize 50% more spells and cast them with increased precision"
        },
        {
            name: "The Mystic",
            description: "Intuitive mage who understands magic through feeling and instinct",
            requirements: { intuitive: 70, elemental: 50 },
            bonus: "Can sense magical auras and predict enemy actions in combat"
        },
        {
            name: "The Warlord",
            description: "Natural leader who commands respect and leads from the front",
            requirements: { leader: 70, aggressive: 60 },
            bonus: "Party members gain combat bonuses when following your lead"
        },
        {
            name: "The Shadow",
            description: "Dark mage who embraces forbidden knowledge and hidden powers",
            requirements: { dark: 70, scholarly: 50 },
            bonus: "Access to forbidden spells and enhanced night vision abilities"
        },
        {
            name: "The Sage",
            description: "Wise counselor who guides others through knowledge and insight",
            requirements: { light: 70, scholarly: 60, leader: 50 },
            bonus: "Can teach other characters spells and provide wisdom bonuses"
        },
        {
            name: "The Strategist",
            description: "Tactical genius who wins through planning and preparation",
            requirements: { adept: 60, scholarly: 60, defensive: 50 },
            bonus: "Can prepare elaborate magical traps and contingency spells"
        },
        {
            name: "The Berserker",
            description: "Wild mage whose emotions fuel incredible but unpredictable power",
            requirements: { elemental: 70, aggressive: 70, intuitive: 60 },
            bonus: "Magical power increases with emotional intensity but becomes harder to control"
        },
        {
            name: "The Diplomat",
            description: "Charismatic mage who solves conflicts through words rather than spells",
            requirements: { light: 60, leader: 60, defensive: 50 },
            bonus: "Enhanced persuasion abilities and can calm hostile creatures"
        }
    ];
    
    // Find matching archetypes
    const matches = archetypes.filter(archetype => 
        Object.entries(archetype.requirements).every(([trait, required]) => 
            traits[trait] >= required
        )
    );
    
    // Return best match or default
    if (matches.length > 0) {
        // Sort by total requirement points (more specific archetypes first)
        matches.sort((a, b) => {
            const aTotal = Object.values(a.requirements).reduce((sum, val) => sum + val, 0);
            const bTotal = Object.values(b.requirements).reduce((sum, val) => sum + val, 0);
            return bTotal - aTotal;
        });
        return matches[0];
    }
    
    return {
        name: "The Balanced Mage",
        description: "A well-rounded practitioner who adapts their approach to each situation",
        requirements: {},
        bonus: "Moderate bonuses to all magical schools and social interactions"
    };
}

function calculatePersonalityAttributes(traits) {
    return {
        magicalPower: Math.max(traits.elemental, traits.adept),
        wisdom: Math.max(traits.scholarly, traits.light),
        charisma: Math.max(traits.leader, traits.light),
        willpower: Math.max(traits.defensive, traits.dark),
        intuition: Math.max(traits.intuitive, traits.elemental),
        focus: Math.max(traits.scholarly, traits.adept),
        empathy: Math.max(traits.light, traits.follower),
        determination: Math.max(traits.aggressive, traits.leader)
    };
}

function calculateRoleplayTendencies(traits) {
    const tendencies = [];
    
    if (traits.aggressive > 70) tendencies.push("Prefers direct action over negotiation");
    if (traits.defensive > 70) tendencies.push("Prioritizes protecting others over personal gain");
    if (traits.light > 70) tendencies.push("Seeks to help others and do good in the world");
    if (traits.dark > 70) tendencies.push("Willing to use morally questionable methods for the greater good");
    if (traits.leader > 70) tendencies.push("Naturally takes charge in group situations");
    if (traits.follower > 70) tendencies.push("Prefers to support others rather than lead");
    if (traits.scholarly > 70) tendencies.push("Approaches problems through research and careful planning");
    if (traits.intuitive > 70) tendencies.push("Trusts gut feelings and makes quick decisions");
    if (traits.elemental > 70) tendencies.push("Emotions strongly influence magical ability");
    if (traits.adept > 70) tendencies.push("Treats magic as a precise science requiring discipline");
    
    return tendencies;
}

function calculateLearningModifiers(traits) {
    return {
        elementalMagic: (traits.elemental - 50) / 50, // -1.0 to +1.0 modifier
        adeptMagic: (traits.adept - 50) / 50,
        combatSkills: (traits.aggressive - 50) / 50,
        defensiveAbilities: (traits.defensive - 50) / 50,
        socialSkills: (traits.leader + traits.light - 100) / 100,
        academicStudies: (traits.scholarly - 50) / 50,
        intuitiveMagic: (traits.intuitive - 50) / 50,
        forbiddenKnowledge: (traits.dark - 50) / 50
    };
}

function calculatePersonalityStrength(traits) {
    // Calculate how strongly defined the personality is
    const polarities = [
        Math.abs(traits.elemental - traits.adept),
        Math.abs(traits.light - traits.dark),
        Math.abs(traits.aggressive - traits.defensive),
        Math.abs(traits.leader - traits.follower),
        Math.abs(traits.intuitive - traits.scholarly)
    ];
    
    return Math.round(polarities.reduce((sum, val) => sum + val, 0) / polarities.length);
}

function generateGameplayMechanics(personalityProfile, species) {
    const mechanics = {
        startingAbilities: [],
        progressionBonuses: [],
        roleplayBonuses: [],
        specialMechanics: [],
        characterStats: personalityProfile.attributes
    };
    
    // Add archetype-specific abilities
    mechanics.startingAbilities.push({
        name: personalityProfile.archetype.name + " Trait",
        description: personalityProfile.archetype.bonus,
        type: "archetype"
    });
    
    // Add personality-based starting abilities
    const traits = personalityProfile.traits;
    
    if (traits.elemental > 70) {
        mechanics.startingAbilities.push({
            name: "Elemental Affinity",
            description: "Your emotions directly affect your elemental magic power",
            type: "elemental"
        });
    }
    
    if (traits.adept > 70) {
        mechanics.startingAbilities.push({
            name: "Magical Precision",
            description: "Your spells have improved accuracy and reduced failure chance",
            type: "adept"
        });
    }
    
    if (traits.light > 70) {
        mechanics.startingAbilities.push({
            name: "Radiant Presence",
            description: "You inspire confidence in allies and can calm hostile emotions",
            type: "social"
        });
    }
    
    if (traits.dark > 70) {
        mechanics.startingAbilities.push({
            name: "Shadow Knowledge",
            description: "You can learn forbidden spells and resist mental intrusion",
            type: "forbidden"
        });
    }
    
    if (traits.leader > 70) {
        mechanics.startingAbilities.push({
            name: "Natural Commander",
            description: "Party members perform better when following your orders",
            type: "leadership"
        });
    }
    
    // Add progression bonuses based on learning modifiers
    Object.entries(personalityProfile.learningModifiers).forEach(([skill, modifier]) => {
        if (modifier > 0.3) {
            mechanics.progressionBonuses.push({
                skill: skill,
                bonus: `+${Math.round(modifier * 100)}% experience gain`,
                description: `Your personality naturally aligns with ${skill.replace(/([A-Z])/g, ' $1').toLowerCase()}`
            });
        } else if (modifier < -0.3) {
            mechanics.progressionBonuses.push({
                skill: skill,
                penalty: `${Math.round(modifier * 100)}% experience gain`,
                description: `Your personality makes ${skill.replace(/([A-Z])/g, ' $1').toLowerCase()} more challenging to learn`
            });
        }
    });
    
    // Add species-personality synergies
    const speciesSynergies = getSpeciesPersonalitySynergies(species, personalityProfile);
    mechanics.specialMechanics.push(...speciesSynergies);
    
    return mechanics;
}

function getSpeciesPersonalitySynergies(species, personalityProfile) {
    const synergies = [];
    const traits = personalityProfile.traits;
    
    switch(species) {
        case 'vampire':
            if (traits.dark > 60) {
                synergies.push({
                    name: "Embraced Darkness",
                    description: "Your vampiric nature and dark personality create powerful blood magic synergies"
                });
            }
            if (traits.leader > 70) {
                synergies.push({
                    name: "Vampiric Dominance",
                    description: "Your natural leadership combines with vampiric hypnosis for enhanced mind control"
                });
            }
            break;
            
        case 'werewolf':
            if (traits.aggressive > 70) {
                synergies.push({
                    name: "Primal Fury",
                    description: "Your aggressive nature enhances werewolf transformation and pack combat tactics"
                });
            }
            if (traits.intuitive > 60) {
                synergies.push({
                    name: "Pack Instincts",
                    description: "Your intuitive nature allows you to sense pack members' emotions and coordinate perfectly"
                });
            }
            break;
            
        case 'human':
            if (personalityProfile.personalityStrength > 70) {
                synergies.push({
                    name: "Human Determination",
                    description: "Your strong personality allows you to overcome natural limitations through pure will"
                });
            }
            break;
            
        case 'angel':
            if (traits.light > 80) {
                synergies.push({
                    name: "Divine Harmony",
                    description: "Your pure nature resonates with angelic essence, enhancing all light-based abilities"
                });
            }
            break;
            
        case 'demon':
            if (traits.dark > 70 && traits.aggressive > 60) {
                synergies.push({
                    name: "Infernal Synergy",
                    description: "Your dark aggressive nature perfectly aligns with demonic powers"
                });
            }
            break;
    }
    
    return synergies;
}

function showNameSelection() {
    showStep('name-selection');
    populateNameOptions();
}

function populateNameOptions() {
    // Map discipline to magical discipline category for name generation
    let magicalDiscipline = null;
    
    switch(currentUser.discipline) {
        case 'Elemental (Aggressive)':
        case 'Elemental (Defensive)':
            magicalDiscipline = 'elemental';
            break;
        case 'Adept (Intuitive)':
        case 'Adept (Scholarly)':
            magicalDiscipline = 'adept';
            break;
        // Add future disciplines here
        default:
            magicalDiscipline = null;
    }
    
    // Check if user has necromancy or other specific disciplines from future tests
    if (currentUser.necromancy) {
        magicalDiscipline = 'necromancy';
    } else if (currentUser.teleportation) {
        magicalDiscipline = 'teleportation';
    } else if (currentUser.energyThrowing) {
        magicalDiscipline = 'energy_throwing';
    }
    
    // Get user's gender from character creation data
    const characterCreationData = JSON.parse(localStorage.getItem('characterCreationData') || '{}');
    const userGender = characterCreationData.gender || 'prefer-not-to-say';
    
    // Analyze moral journey for name generation
    const moralJourney = analyzeMoralJourney(currentUser.answers);
    
    // Enhanced name population with both personality and moral journey analysis
    try {
        if (typeof window !== 'undefined' && window.nameDatabase && window.nameDatabase.ready && typeof window.nameDatabase.ready.then === 'function') {
            window.nameDatabase.ready.then(function() {
                try { callPopulateNames(currentUser.personality, currentUser.species, magicalDiscipline, userGender, moralJourney, currentUser.personalityProfile); } catch(e){}
            });
        } else {
            callPopulateNames(currentUser.personality, currentUser.species, magicalDiscipline, userGender, moralJourney, currentUser.personalityProfile);
        }
    } catch (e) {
        try { callPopulateNames(currentUser.personality, currentUser.species, magicalDiscipline, userGender, moralJourney, currentUser.personalityProfile); } catch(e){}
    }
}

// Inserted: Filtered population functions to only show names available in the global registry
function populateFirstNamesPage() {
    const firstNamesGrid = document.getElementById('first-names-grid');
    if (!firstNamesGrid) return;
    firstNamesGrid.innerHTML = '';

    const startIndex = (firstNamesPagination.currentPage - 1) * firstNamesPagination.itemsPerPage;
    const endIndex = startIndex + firstNamesPagination.itemsPerPage;
    let currentPageNames = (firstNamesPagination.allNames || []).slice(startIndex, endIndex);

    // If names.js exposes availability helpers, use them to filter taken names
    if (typeof window !== 'undefined' && window.isNameAvailable && window.takenNameRegistry) {
        currentPageNames = currentPageNames.filter(nameObj => {
            // nameObj may be an object { name: 'Foo', meaning: '...' }
            const firstName = typeof nameObj === 'string' ? nameObj : nameObj.name;
            return window.isNameAvailable(firstName, null);
        });
    }

    currentPageNames.forEach(nameObj => {
        const nameElement = createNameElement(nameObj, 'first');
        firstNamesGrid.appendChild(nameElement);
    });
}

function populateLastNamesPage() {
    const lastNamesGrid = document.getElementById('last-names-grid');
    if (!lastNamesGrid) return;
    lastNamesGrid.innerHTML = '';

    const startIndex = (lastNamesPagination.currentPage - 1) * lastNamesPagination.itemsPerPage;
    const endIndex = startIndex + lastNamesPagination.itemsPerPage;
    let currentPageNames = (lastNamesPagination.allNames || []).slice(startIndex, endIndex);

    if (typeof window !== 'undefined' && window.isNameAvailable && window.takenNameRegistry) {
        currentPageNames = currentPageNames.filter(nameObj => {
            const lastName = typeof nameObj === 'string' ? nameObj : nameObj.name;
            return window.isNameAvailable(null, lastName);
        });
    }

    currentPageNames.forEach(nameObj => {
        const nameElement = createNameElement(nameObj, 'last');
        lastNamesGrid.appendChild(nameElement);
    });
}

// Listen for global events when names are taken/removed and update the UI
if (typeof window !== 'undefined') {
    window.addEventListener('takenNameAdded', (e) => {
        const detail = e.detail || {};
        const full = (detail.full || '').trim();
        if (!full) return;
    // Disable matching elements in the grids (support both .name-option and legacy .name-item)
    document.querySelectorAll('.name-grid .name-option, .name-grid .name-item').forEach(el => {
            const name = el.getAttribute('data-name');
            if (!name) return;
            // name items store either full or single depending on type - compare appropriately
            if (name === full || full.endsWith(' ' + name) || full.startsWith(name + ' ')) {
                el.classList.add('taken');
                el.setAttribute('aria-disabled', 'true');
                const btn = el.querySelector('button');
                if (btn) btn.disabled = true;
                // Flash indicator
                el.classList.add('taken-recent');
                setTimeout(() => el.classList.remove('taken-recent'), 2500);
            }
        });
    });

    window.addEventListener('takenNameRemoved', (e) => {
        const detail = e.detail || {};
        const full = (detail.full || '').trim();
        if (!full) return;
    document.querySelectorAll('.name-grid .name-option, .name-grid .name-item').forEach(el => {
            const name = el.getAttribute('data-name');
            if (!name) return;
            if (name === full || full.endsWith(' ' + name) || full.startsWith(name + ' ')) {
                el.classList.remove('taken');
                el.removeAttribute('aria-disabled');
                const btn = el.querySelector('button');
                if (btn) btn.disabled = false;
            }
        });
    });
}

// Notify user if a taken-name conflict occurs (someone else claimed the name)
if (typeof window !== 'undefined') {
    window.addEventListener('takenNameConflict', (e) => {
        try {
            const detail = e.detail || {};
            const conflictedFull = (detail.full || '').trim();

            // If the conflict affects the user's current selection, try an automatic swap
            const myFull = `${selectedFirstName} ${selectedLastName}`.trim();
            if (conflictedFull && myFull && conflictedFull.toLowerCase() === myFull.toLowerCase()) {
                // Try to find an alternative using the same context
                let maybeAlt = null;
                try {
                    const userSpecies = (typeof window !== 'undefined' && window.currentUser && window.currentUser.species) ? window.currentUser.species : null;
                    const userDiscipline = (typeof window !== 'undefined' && window.currentUser && window.currentUser.discipline) ? window.currentUser.discipline : null;
                    if (typeof window !== 'undefined' && typeof window.findAlternativeName === 'function') {
                        maybeAlt = window.findAlternativeName(selectedFirstName, selectedLastName, userSpecies, userDiscipline);
                    }
                } catch (err) {
                    console.warn('Automatic alternative lookup failed', err);
                }

                const _applyAlt = (alternative) => {
                    if (alternative && alternative.firstName && alternative.lastName) {
                        try { selectName(alternative.firstName, 'first'); } catch (e) {}
                        try { selectName(alternative.lastName, 'last'); } catch (e) {}
                        if (typeof showNotification === 'function') {
                            showNotification(`That name was just taken — we substituted an available alternative: ${alternative.firstName} ${alternative.lastName}`, 'info');
                        }
                        return true;
                    }
                    return false;
                };

                try {
                    if (maybeAlt && typeof maybeAlt.then === 'function') {
                        maybeAlt.then((alternative) => {
                            if (_applyAlt(alternative)) return;
                        }).catch((err) => console.warn('Automatic alternative lookup failed', err));
                    } else {
                        if (_applyAlt(maybeAlt)) return;
                    }
                } catch (err) {
                    console.warn('Automatic alternative processing failed', err);
                }
            }

            // Fallback: notify user and refresh name options
            if (typeof showNotification === 'function') {
                showNotification('That name was just taken by someone else. Please choose another.', 'error');
            } else {
                alert('That name was just taken by someone else. Please choose another.');
            }
            // Refresh name options to remove the taken name from the list
            populateNameOptions();
        } catch (err) {
            console.warn('takenNameConflict handler error', err);
        }
    });
}

function analyzeMoralJourney(answers) {
    const moralProfile = {
        sacrifice: 0,          // Willingness to sacrifice for others
        pragmatism: 0,         // Practical vs idealistic choices
        selflessness: 0,       // Putting others before self
        burden: 0,             // Accepting heavy responsibilities
        wisdom: 0,             // Choosing knowledge/understanding
        defiance: 0,           // Standing against authority/fate
        compassion: 0,         // Showing mercy and understanding
        power: 0,              // Seeking or accepting power
        justice: 0,            // Upholding moral principles
        redemption: 0,         // Believing in second chances
        isolation: 0,          // Tendency to bear burdens alone
        legacy: 0,             // Concern for lasting impact
        transformation: 0,     // Embracing change and growth
        protection: 0,         // Defensive/protective instincts
        ambition: 0           // Drive for personal achievement
    };
    
    // Analyze each answer based on the moral dilemma structure
    answers.forEach((answerIndex, questionIndex) => {
        if (answerIndex === undefined) return;
        
        const question = personalityQuestions[questionIndex];
        const chosenAnswer = question.answers[answerIndex];
        
        // Analyze moral implications of each choice
        switch(questionIndex) {
            case 0: // Blood magic child dilemma
                if (answerIndex === 0) { // Save with bond
                    moralProfile.sacrifice += 3;
                    moralProfile.burden += 4;
                    moralProfile.compassion += 4;
                } else if (answerIndex === 1) { // Let die
                    moralProfile.wisdom += 2;
                    moralProfile.pragmatism += 3;
                } else if (answerIndex === 2) { // Try conventional
                    moralProfile.justice += 3;
                    moralProfile.compassion += 2;
                } else if (answerIndex === 3) { // Save then sever
                    moralProfile.pragmatism += 4;
                    moralProfile.ambition += 2;
                }
                break;
                
            case 1: // Friend's necromancy dilemma
                if (answerIndex === 0) { // Destroy tools
                    moralProfile.protection += 4;
                    moralProfile.burden += 2;
                } else if (answerIndex === 1) { // Help perfect it
                    moralProfile.compassion += 3;
                    moralProfile.defiance += 3;
                } else if (answerIndex === 2) { // Stay and comfort
                    moralProfile.compassion += 4;
                    moralProfile.wisdom += 2;
                } else if (answerIndex === 3) { // Take burden
                    moralProfile.sacrifice += 4;
                    moralProfile.selflessness += 4;
                }
                break;
                
            case 2: // Plague sacrifice dilemma
                if (answerIndex === 0) { // Accept sacrifice
                    moralProfile.burden += 4;
                    moralProfile.pragmatism += 3;
                    moralProfile.legacy += 3;
                } else if (answerIndex === 1) { // Find another way
                    moralProfile.justice += 4;
                    moralProfile.wisdom += 3;
                } else if (answerIndex === 2) { // Sacrifice self
                    moralProfile.sacrifice += 4;
                    moralProfile.selflessness += 4;
                } else if (answerIndex === 3) { // Find stranger
                    moralProfile.pragmatism += 4;
                    moralProfile.power += 2;
                }
                break;
                
            case 3: // Torture for information dilemma
                if (answerIndex === 0) { // Stop torture
                    moralProfile.justice += 4;
                    moralProfile.compassion += 3;
                } else if (answerIndex === 1) { // Allow continuation
                    moralProfile.pragmatism += 4;
                    moralProfile.burden += 3;
                } else if (answerIndex === 2) { // Kill torturer
                    moralProfile.protection += 3;
                    moralProfile.defiance += 3;
                } else if (answerIndex === 3) { // Mind magic
                    moralProfile.wisdom += 3;
                    moralProfile.pragmatism += 2;
                }
                break;
                
            case 4: // Stealing essence dilemma
                if (answerIndex === 0) { // Accept loss
                    moralProfile.justice += 4;
                    moralProfile.sacrifice += 2;
                } else if (answerIndex === 1) { // Take from criminal
                    moralProfile.pragmatism += 3;
                    moralProfile.justice += 2;
                } else if (answerIndex === 2) { // Find willing sacrifice
                    moralProfile.burden += 3;
                    moralProfile.ambition += 2;
                } else if (answerIndex === 3) { // Research solution
                    moralProfile.wisdom += 4;
                    moralProfile.isolation += 2;
                }
                break;
                
            case 5: // Existence rift dilemma
                if (answerIndex === 0) { // Close immediately
                    moralProfile.sacrifice += 4;
                    moralProfile.selflessness += 4;
                    moralProfile.legacy += 3;
                } else if (answerIndex === 1) { // Transfer existence
                    moralProfile.ambition += 3;
                    moralProfile.wisdom += 2;
                } else if (answerIndex === 2) { // Try to stabilize
                    moralProfile.defiance += 4;
                    moralProfile.ambition += 3;
                } else if (answerIndex === 3) { // Let others decide
                    moralProfile.wisdom += 2;
                    moralProfile.burden -= 2;
                }
                break;
                
            case 6: // Tyrant vs ancient evil dilemma
                if (answerIndex === 0) { // Kill and fight evil
                    moralProfile.defiance += 4;
                    moralProfile.burden += 4;
                    moralProfile.transformation += 3;
                } else if (answerIndex === 1) { // Support tyrant
                    moralProfile.pragmatism += 4;
                    moralProfile.burden += 2;
                } else if (answerIndex === 2) { // Reform tyrant
                    moralProfile.wisdom += 3;
                    moralProfile.compassion += 3;
                    moralProfile.redemption += 4;
                } else if (answerIndex === 3) { // Replace them
                    moralProfile.ambition += 4;
                    moralProfile.power += 4;
                    moralProfile.burden += 3;
                }
                break;
                
            case 7: // Future monster dilemma
                if (answerIndex === 0) { // Trust fate
                    moralProfile.compassion += 3;
                    moralProfile.redemption += 4;
                } else if (answerIndex === 1) { // Bind will
                    moralProfile.protection += 4;
                    moralProfile.power += 3;
                } else if (answerIndex === 2) { // Kill them
                    moralProfile.pragmatism += 4;
                    moralProfile.burden += 4;
                } else if (answerIndex === 3) { // Guide them
                    moralProfile.compassion += 4;
                    moralProfile.wisdom += 3;
                    moralProfile.redemption += 3;
                }
                break;
        }
    });
    
    // Determine dominant moral themes
    const themes = [];
    const threshold = 8; // Minimum score to be considered a dominant theme
    
    Object.entries(moralProfile).forEach(([theme, score]) => {
        if (score >= threshold) {
            themes.push({ theme, intensity: score });
        }
    });
    
    // Sort themes by intensity
    themes.sort((a, b) => b.intensity - a.intensity);
    
    return {
        profile: moralProfile,
        dominantThemes: themes.slice(0, 3), // Top 3 themes
        moralComplexity: themes.length, // How many moral dimensions they showed
        totalMoralWeight: Object.values(moralProfile).reduce((sum, val) => sum + val, 0)
    };
}

// Initialize quiz when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set up hamburger menu for quiz page
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    console.log('🎭 Quiz system initialized!');
});

// Species selection functions
function selectSpecies(speciesValue) {
    // Remove previous selection
    document.querySelectorAll('.species-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Select new species
    const selectedCard = document.querySelector(`[data-species="${speciesValue}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Store the selected species
    currentUser.species = speciesValue;
    
    // Show detailed information
    showSpeciesDetails(speciesValue);
}

function showSpeciesDetails(species) {
    const speciesData = getSpeciesLore(species);
    const preview = document.getElementById('selected-species-preview');
    const nameElement = document.getElementById('selected-species-name');
    const descriptionElement = document.getElementById('selected-species-description');
    const loreElement = document.getElementById('selected-species-lore');
    
    if (preview && nameElement && descriptionElement && loreElement) {
        nameElement.textContent = speciesData.name;
        
        // Check if we have comprehensive lore or basic lore
        if (speciesData.quickDescription && speciesData.origins) {
            // Comprehensive lore system
            descriptionElement.textContent = speciesData.quickDescription;
            loreElement.innerHTML = `
                <div class="comprehensive-lore">
                    <div class="lore-section">
                        <h5>${speciesData.origins.title}</h5>
                        <p class="lore-excerpt">${speciesData.origins.text.substring(0, 300)}...</p>
                        <button class="expand-lore-btn" onclick="showFullSpeciesLore('${species}')">Read Full History</button>
                    </div>
                    
                    <div class="lore-highlights">
                        <h6>Key Relationships:</h6>
                        <div class="relationship-summary">
                            ${Object.entries(speciesData.relationships || {}).slice(0, 3).map(([relSpecies, rel]) => `
                                <div class="relationship-item">
                                    <span class="rel-species">${relSpecies.charAt(0).toUpperCase() + relSpecies.slice(1)}</span>
                                    <span class="rel-status">${rel.status}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    ${speciesData.notableQuotes && speciesData.notableQuotes.length > 0 ? `
                        <div class="lore-quote">
                            <blockquote>"${speciesData.notableQuotes[0]}"</blockquote>
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            // Basic lore system fallback
            descriptionElement.textContent = speciesData.description;
            loreElement.innerHTML = `
                <h5>${speciesData.lore.title}</h5>
                <p>${speciesData.lore.text}</p>
            `;
        }
        
        preview.style.display = 'block';
    }
}

function showFullSpeciesLore(species) {
    const modal = document.createElement('div');
    modal.className = 'lore-modal';
    modal.innerHTML = `
        <div class="lore-modal-content">
            <div class="lore-modal-header">
                <h2>Complete Lore: ${species.charAt(0).toUpperCase() + species.slice(1)}</h2>
                <button class="close-modal" onclick="this.closest('.lore-modal').remove()">&times;</button>
            </div>
            <div class="lore-modal-body">
                <div id="full-lore-content">Loading comprehensive lore...</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Load the full lore content
    const speciesData = getSpeciesLore(species);
    const contentDiv = document.getElementById('full-lore-content');
    
    if (speciesData.origins) {
        contentDiv.innerHTML = `
            <div class="full-lore-section">
                <h3>${speciesData.origins.title}</h3>
                <p>${speciesData.origins.text}</p>
            </div>
            
            <div class="full-lore-section">
                <h3>${speciesData.ancientHistory.title}</h3>
                <p>${speciesData.ancientHistory.text}</p>
            </div>
            
            <div class="full-lore-section">
                <h3>${speciesData.culturalDevelopment.title}</h3>
                <p>${speciesData.culturalDevelopment.text}</p>
            </div>
            
            <div class="full-lore-section">
                <h3>${speciesData.modernSociety.title}</h3>
                <p>${speciesData.modernSociety.text}</p>
            </div>
            
            <div class="full-lore-section">
                <h3>Relationships with Other Species</h3>
                <div class="relationships-grid">
                    ${Object.entries(speciesData.relationships || {}).map(([relSpecies, rel]) => `
                        <div class="relationship-card">
                            <h4>${relSpecies.charAt(0).toUpperCase() + relSpecies.slice(1)}</h4>
                            <div class="status-badge ${rel.status.toLowerCase().replace(/\s+/g, '-')}">${rel.status}</div>
                            <p>${rel.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="full-lore-section">
                <h3>Notable Quotes</h3>
                <div class="quotes-collection">
                    ${(speciesData.notableQuotes || []).map(quote => `
                        <blockquote class="full-lore-quote">${quote}</blockquote>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Add click outside to close
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function getSpeciesLore(species) {
    // Use the comprehensive lore system if available, otherwise fall back to basic lore
    if (window.ComprehensiveLore && window.ComprehensiveLore.getComprehensiveSpeciesLore) {
        return window.ComprehensiveLore.getComprehensiveSpeciesLore(species);
    }
    
    // Fallback basic lore system
    const speciesLore = {
        human: {
            name: 'Human',
            description: 'The most adaptable of all species, humans have spread across every corner of the magical world through determination and ingenuity.',
            lore: {
                title: 'Masters of Adaptation',
                text: 'While lacking the inherent magical abilities of other species, humans compensate with remarkable adaptability and determination. They excel at learning diverse magical disciplines and often become powerful mages through pure will and study. Many of the greatest magical innovations come from human ingenuity.'
            }
        },
        vampire: {
            name: 'Vampire',
            description: 'Ancient undead beings with supernatural abilities, vampires possess centuries of accumulated knowledge and power.',
            lore: {
                title: 'Eternal Predators',
                text: 'Vampires are creatures of the night, sustained by blood and gifted with supernatural strength, speed, and mental abilities. Their immortality allows them to accumulate vast knowledge over centuries. Many become master manipulators and political schemers, using their hypnotic abilities to influence mortal affairs.'
            }
        },
        werewolf: {
            name: 'Werewolf',
            description: 'Shapeshifters who balance human intellect with primal wolf instincts, forming strong pack bonds.',
            lore: {
                title: 'Children of Two Worlds',
                text: 'Werewolves exist between the civilized and wild worlds, able to shift between human and wolf forms. They possess enhanced senses in both forms and share deep emotional bonds with their pack members. Their dual nature makes them excellent trackers and fierce protectors of their chosen family.'
            }
        },
        sorcerer: {
            name: 'Sorcerer',
            description: 'Born with innate magical abilities, sorcerers wield raw arcane power through natural talent rather than study.',
            lore: {
                title: 'Conduits of Raw Magic',
                text: 'Sorcerers are born with magic flowing through their veins, making spells as natural as breathing. Unlike wizards who study magic, sorcerers feel magic instinctively. This raw connection makes them incredibly powerful but sometimes unpredictable, as their emotions can influence their magical output.'
            }
        },
        skeleton: {
            name: 'Skeleton',
            description: 'Undead beings freed from the constraints of flesh, gaining unique perspectives on existence and mortality.',
            lore: {
                title: 'Beyond Death\'s Veil',
                text: 'Skeletons have moved beyond physical needs and emotional attachments that bind the living. This freedom allows them to approach problems with pure logic and see patterns others miss. They are immune to fear, pain, and many forms of mental manipulation, making them excellent strategists and scholars.'
            }
        },
        zombie: {
            name: 'Zombie',
            description: 'Reanimated beings with incredible physical resilience and fragments of their former memories.',
            lore: {
                title: 'Echoes of the Past',
                text: 'Zombies retain pieces of their former lives while gaining supernatural durability and strength. They feel less pain and can continue fighting through injuries that would fell other beings. Many struggle with fragmented memories, creating a unique perspective on identity and the nature of consciousness.'
            }
        },
        witch: {
            name: 'Witch',
            description: 'Practitioners of ancient natural magic, deeply connected to the rhythms of nature and traditional spellcraft.',
            lore: {
                title: 'Keepers of Ancient Ways',
                text: 'Witches follow traditions passed down through generations, working with natural forces and brewing potions. They often serve as healers and advisors in their communities, using their connection to nature to predict weather, find lost items, and cure ailments. Their magic is grounded in the natural world.'
            }
        },
        demon: {
            name: 'Demon',
            description: 'Otherworldly beings with access to forbidden knowledge and dark magical powers.',
            lore: {
                title: 'Harbingers of Forbidden Power',
                text: 'Demons come from planes where different rules apply, giving them access to magic and knowledge forbidden to most beings. They often make contracts and deals, trading power for services. Their alien perspective on morality and existence makes them unpredictable but potentially valuable allies.'
            }
        },
        angel: {
            name: 'Angel',
            description: 'Celestial beings guided by divine purpose, wielding holy powers and unwavering moral conviction.',
            lore: {
                title: 'Servants of Higher Purpose',
                text: 'Angels are beings of pure purpose, driven by divine missions and unwavering moral codes. They possess healing abilities and can channel divine light to banish darkness. Their rigid moral structure can make them inflexible, but their dedication to their cause is absolute and inspiring.'
            }
        },
        gist: {
            name: 'Gist',
            description: 'Spectral entities existing between life and death, masters of ethereal magic and spiritual communication.',
            lore: {
                title: 'Walkers Between Worlds',
                text: 'Gists exist partially in the spirit realm, able to phase between material and ethereal states. They can communicate with other spirits and see magical auras invisible to most beings. Their connection to the spirit world makes them excellent mediums and investigators of supernatural mysteries.'
            }
        },
        'faceless-one': {
            name: 'Faceless One',
            description: 'Mysterious beings without fixed form, masters of disguise and infiltration.',
            lore: {
                title: 'Masters of Identity',
                text: 'Faceless Ones have no true form, existing as shapeshifting entities that can perfectly mimic others. They excel at infiltration and espionage, able to blend into any society. Their fluid nature makes them excellent at understanding different perspectives, though they may struggle with personal identity.'
            }
        },
        remnant: {
            name: 'Remnant',
            description: 'Echoes of once-powerful beings, carrying fragments of ancient knowledge and diminished power.',
            lore: {
                title: 'Shadows of Former Glory',
                text: 'Remnants are what remains when powerful beings are destroyed but not entirely eliminated. They retain fragments of their former knowledge and abilities, making them repositories of ancient wisdom. Though diminished, they often possess insight into historical events and forgotten magics.'
            }
        }
    };
    
    return speciesLore[species] || speciesLore.human;
}

// Enhanced discipline selection functions
function selectDiscipline(disciplineValue) {
    // Remove previous selection
    document.querySelectorAll('.discipline-card-enhanced').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Select new discipline
    const selectedCard = document.querySelector(`[data-discipline="${disciplineValue}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Store the selected discipline
    selectedMagicalDiscipline = disciplineValue;
    
    // Show detailed information
    showDisciplineDetails(disciplineValue);
}

function showDisciplineDetails(discipline) {
    const disciplineData = getDisciplineDetails(discipline);
    const preview = document.getElementById('discipline-detailed-preview');
    const nameElement = document.getElementById('selected-discipline-name');
    const combatElement = document.getElementById('discipline-combat-style');
    const roleplayElement = document.getElementById('discipline-roleplay');
    const skillsElement = document.getElementById('discipline-skills');
    const synergyElement = document.getElementById('discipline-species-synergy');
    
    if (preview && nameElement && combatElement && roleplayElement && skillsElement && synergyElement) {
        nameElement.textContent = disciplineData.name;
        combatElement.textContent = disciplineData.combatStyle;
        roleplayElement.textContent = disciplineData.roleplay;
        
        // Create skill progression display
        skillsElement.innerHTML = disciplineData.skills.map((skill, index) => `
            <div class="skill-tier">
                <span class="skill-tier-number">${index + 1}</span>
                <span>${skill}</span>
            </div>
        `).join('');
        
        // Show species synergy based on current selection
        const currentSpecies = currentUser.species || 'human';
        synergyElement.textContent = disciplineData.speciesSynergies[currentSpecies] || disciplineData.speciesSynergies.default;
        
        preview.style.display = 'block';
    }
}

function getDisciplineDetails(discipline) {
    const disciplineDetails = {
        elemental: {
            name: 'Elemental Magic',
            combatStyle: 'High damage output with area-of-effect capabilities. Elemental mages excel at battlefield control and devastating magical attacks.',
            roleplay: 'Often viewed as powerful but unpredictable. Great for characters who embrace their emotions and prefer direct approaches to problems.',
            skills: [
                'Elemental Bolt - Basic elemental projectile attack',
                'Elemental Shield - Protective barrier of chosen element',
                'Elemental Burst - Medium-range area damage',
                'Elemental Storm - Large-scale environmental manipulation',
                'Elemental Avatar - Temporary transformation into pure elemental force'
            ],
            speciesSynergies: {
                human: 'Humans excel at balancing multiple elements, making them versatile elemental mages.',
                vampire: 'Vampires often gravitate toward fire magic, using it to compensate for their cold nature.',
                werewolf: 'Werewolves have natural affinity for earth and air magic, connecting to their wild nature.',
                sorcerer: 'Sorcerers show exceptional raw power in elemental magic, often specializing in one element.',
                demon: 'Demons excel at fire magic and often combine it with their natural hellfire abilities.',
                angel: 'Angels typically favor light-based elemental magic and purifying flames.',
                default: 'Most species can learn elemental magic, though natural affinities vary.'
            }
        },
        adept: {
            name: 'Adept Magic',
            combatStyle: 'Tactical battlefield control with versatile offensive and defensive options. Balanced approach to magical combat.',
            roleplay: 'Intellectuals and strategists who approach magic as a science. Perfect for analytical characters who value precision.',
            skills: [
                'Magic Missile - Precise force projectiles that never miss',
                'Force Shield - Protective barriers of pure magical energy',
                'Teleportation - Short-range instant movement',
                'Lightning Storm - Controlled electrical attacks',
                'Reality Warp - Advanced manipulation of magical forces'
            ],
            speciesSynergies: {
                human: 'Humans make excellent adepts due to their analytical nature and adaptability.',
                sorcerer: 'Sorcerers as adepts combine raw power with refined technique for devastating results.',
                skeleton: 'Skeletons excel at the logical aspects of adept magic, making them formidable tactical mages.',
                remnant: 'Remnants often retain advanced adept knowledge from their former existence.',
                'faceless-one': 'Faceless Ones use adept magic for precision shapeshifting and reality manipulation.',
                default: 'Adept magic requires discipline and study, making it suitable for intellectual species.'
            }
        },
        necromancy: {
            name: 'Necromancy',
            combatStyle: 'Attrition-based warfare using undead minions and life-draining attacks. Focuses on outlasting opponents.',
            roleplay: 'Morally complex characters who deal with themes of death, morality, and the price of power. Often misunderstood.',
            skills: [
                'Bone Dart - Sharp projectiles from summoned bone',
                'Animate Dead - Create temporary undead servants',
                'Life Drain - Absorb health from living targets',
                'Death Ray - Concentrated necromantic energy beam',
                'Necromantic Mastery - Command over death itself'
            ],
            speciesSynergies: {
                skeleton: 'Skeletons have natural affinity for necromancy, being undead themselves.',
                zombie: 'Zombies can enhance their undead nature through necromantic study.',
                vampire: 'Vampires often dabble in necromancy to better understand their undead condition.',
                remnant: 'Remnants have intimate knowledge of death, making them powerful necromancers.',
                gist: 'Gists exist between life and death, giving them unique necromantic insights.',
                default: 'Living species can learn necromancy, though it may conflict with their nature.'
            }
        },
        symbol: {
            name: 'Symbol Magic',
            combatStyle: 'Preparation-based magic with powerful delayed effects. Focuses on area control and magical enhancement.',
            roleplay: 'Scholarly mages who value knowledge and preparation. Perfect for characters who enjoy puzzles and ancient mysteries.',
            skills: [
                'Symbol Glow - Basic runic activation and illumination',
                'Binding Circle - Magical containment and restriction',
                'Protective Ward - Long-lasting defensive symbols',
                'Reality Anchor - Symbols that stabilize magical reality',
                'Master Sigil - Complex symbols with reality-altering power'
            ],
            speciesSynergies: {
                human: 'Humans excel at learning and creating new symbolic systems.',
                remnant: 'Remnants often remember ancient symbols from their past existence.',
                skeleton: 'Skeletons appreciate the logical structure of symbolic magic.',
                witch: 'Witches combine traditional symbols with natural magic for unique effects.',
                angel: 'Angels use divine symbols and sacred geometry in their magic.',
                default: 'Symbol magic requires patience and study, rewarding dedicated practitioners.'
            }
        },
        sensitive: {
            name: 'Sensitive Magic',
            combatStyle: 'Information warfare and mental manipulation. Focuses on prediction, control, and psychological effects.',
            roleplay: 'Empathetic or manipulative characters who understand the power of information and mental influence.',
            skills: [
                'Thought Read - Basic telepathic contact and surface thoughts',
                'Future Glimpse - Brief visions of possible outcomes',
                'Mental Link - Extended telepathic communication',
                'Psychic Assault - Direct attacks on the mind',
                'Mind Mastery - Complete control over thoughts and memories'
            ],
            speciesSynergies: {
                gist: 'Gists naturally exist in mental realms, making them powerful sensitives.',
                vampire: 'Vampires often develop telepathic abilities to enhance their hypnotic powers.',
                'faceless-one': 'Faceless Ones use sensitive magic to understand and mimic other minds.',
                witch: 'Witches combine intuition with sensitive magic for powerful divination.',
                remnant: 'Remnants may retain psychic echoes from their past.',
                default: 'Sensitive magic requires mental discipline and emotional control.'
            }
        },
        unknown: {
            name: 'Unknown Magic',
            combatStyle: 'Unpredictable and chaotic. Effects vary wildly, making every encounter unique and potentially dangerous.',
            roleplay: 'Mysterious characters with unusual backgrounds. Perfect for those who enjoy uncertainty and unique storylines.',
            skills: [
                'Random Effect - Unpredictable magical manifestation',
                'Chaos Bolt - Randomly typed magical projectile',
                'Reality Glitch - Minor alterations to local reality',
                'Paradigm Break - Major disruption of magical laws',
                'Wild Surge - Massive uncontrolled magical release'
            ],
            speciesSynergies: {
                'faceless-one': 'Faceless Ones\' fluid nature resonates with unknown magic.',
                remnant: 'Remnants may manifest unusual magic from their fragmented past.',
                demon: 'Demons sometimes possess otherworldly magic that defies classification.',
                gist: 'Gists exist outside normal reality, making unknown magic more comprehensible.',
                default: 'Unknown magic is mysterious and unpredictable for all species.'
            }
        }
    };
    
    return disciplineDetails[discipline] || disciplineDetails.unknown;
}

// Dynamic Background Story Generation
function generateDynamicBackground(personality, species, discipline, takenName) {
    const backgroundElements = getBackgroundElements(personality, species, discipline);
    const story = constructBackgroundStory(backgroundElements, takenName);
    return story;
}

// safeConfirmName — prevent duplicate submits when confirming a taken name
let __confirmInProgress = false;
async function safeConfirmName() {
    try {
        if (__confirmInProgress) return;
        const btn = document.getElementById('confirm-name');
        if (btn) btn.disabled = true;
        __confirmInProgress = true;

        if (typeof generateTrueName === 'function') {
            try {
                const result = generateTrueName();
                if (result && typeof result.then === 'function') {
                    // Await the promise so we don't navigate away before save completes
                    await result;
                }
                // After save completes, navigate to results (quiz.js/viewProfile will handle storage)
                try { if (typeof viewProfile === 'function') viewProfile(); } catch(e) { try { window.location.href = 'quiz-results.html'; } catch(_){} }
            } catch (err) {
                console.warn('safeConfirmName: error calling generateTrueName', err);
                // Even if saving failed, proceed to results so user sees outcome
                try { if (typeof viewProfile === 'function') viewProfile(); } catch(e) { try { window.location.href = 'quiz-results.html'; } catch(_){} }
            } finally {
                __confirmInProgress = false;
                if (btn) btn.disabled = false;
            }
        } else {
            console.warn('safeConfirmName: generateTrueName() not found');
            __confirmInProgress = false;
            if (btn) btn.disabled = false;
        }
    } catch (e) {
        console.warn('safeConfirmName unexpected error', e);
        __confirmInProgress = false;
        try { if (typeof viewProfile === 'function') viewProfile(); } catch(e) { try { window.location.href = 'quiz-results.html'; } catch(_){} }
    }
}

function getBackgroundElements(personality, species, discipline) {
    // Determine primary personality traits
    const traits = {
        primaryAlignment: personality.light > personality.dark ? 'light' : 'dark',
        primaryApproach: personality.elemental > personality.adept ? 'elemental' : 'adept',
        leadership: personality.leader > personality.follower ? 'leader' : 'follower',
        learning: personality.intuitive > personality.scholarly ? 'intuitive' : 'scholarly'
    };
    
    // Get species-specific background elements
    const speciesElements = getSpeciesBackgroundElements(species);
    
    // Get discipline-specific background elements
    const disciplineElements = getDisciplineBackgroundElements(discipline);
    
    // Get personality-driven story elements
    const personalityElements = getPersonalityElements(traits);
    
    return {
        species: speciesElements,
        discipline: disciplineElements,
        personality: personalityElements,
        traits: traits
    };
}

function getSpeciesBackgroundElements(species) {
    const speciesBackgrounds = {
        human: {
            origin: ['grew up in a bustling magical city', 'was raised in a small town on the edge of the magical world', 'lived among both magical and non-magical communities'],
            motivation: ['seeking to prove that humans can be as powerful as any magical being', 'determined to bridge the gap between magical and mundane worlds', 'driven by curiosity about the supernatural realm'],
            challenge: ['often underestimated by other species', 'struggled with lacking natural magical abilities', 'faced discrimination in magical society']
        },
        vampire: {
            origin: ['was turned centuries ago and has watched civilizations rise and fall', 'recently embraced their vampiric nature after being turned', 'comes from an ancient vampire bloodline with deep traditions'],
            motivation: ['seeking redemption for past dark deeds', 'hunting those who prey on the innocent', 'protecting other vampires from persecution'],
            challenge: ['battling their bloodthirsty nature', 'dealing with the loneliness of immortality', 'avoiding vampire hunters and religious zealots']
        },
        werewolf: {
            origin: ['was born into a proud werewolf pack in the wilderness', 'was bitten and struggled to control their new nature', 'comes from a family that has hidden their werewolf heritage for generations'],
            motivation: ['protecting their pack from external threats', 'finding balance between human civilization and wild nature', 'seeking to unite scattered werewolf clans'],
            challenge: ['controlling their transformation during emotional stress', 'keeping their dual nature secret from humans', 'dealing with pack politics and territorial disputes']
        },
        sorcerer: {
            origin: ['manifested incredible magical power at a young age', 'discovered their abilities through a traumatic magical event', 'was born into a family of powerful sorcerers'],
            motivation: ['mastering their overwhelming magical abilities', 'using their power to protect those who cannot protect themselves', 'uncovering the source of their magical heritage'],
            challenge: ['preventing their emotions from causing magical outbursts', 'dealing with the responsibility of great power', 'avoiding those who would exploit their abilities']
        },
        skeleton: {
            origin: ['awakened in an ancient tomb with no memory of their past life', 'was raised from death by a necromancer but broke free of control', 'chose undeath to continue pursuing their life\'s work'],
            motivation: ['seeking to understand the purpose of their continued existence', 'protecting the balance between life and death', 'pursuing knowledge that was interrupted by death'],
            challenge: ['lacking the emotional connections they once had', 'being feared and misunderstood by the living', 'dealing with fragmentary memories of their past life']
        },
        zombie: {
            origin: ['was reanimated by dark magic but retained their consciousness', 'returned to life through sheer force of will', 'was brought back by loved ones who couldn\'t let go'],
            motivation: ['seeking justice for their untimely death', 'protecting others from the fate that befell them', 'finding a way to feel truly alive again'],
            challenge: ['dealing with their decaying physical form', 'struggling with incomplete memories', 'facing rejection from the living world']
        },
        witch: {
            origin: ['learned traditional magic from a wise elder in a remote village', 'discovered their abilities while communing with nature', 'inherited magical knowledge passed down through generations'],
            motivation: ['preserving ancient magical traditions', 'serving as a healer and guide for their community', 'protecting natural places from destructive forces'],
            challenge: ['balancing traditional ways with modern magical practices', 'overcoming superstitions and fear from non-magical people', 'finding others who understand their connection to nature']
        },
        demon: {
            origin: ['crossed over from another realm seeking new experiences', 'was summoned but broke free of their binding', 'chose to abandon their hellish realm for the mortal world'],
            motivation: ['exploring concepts of morality foreign to their nature', 'seeking redemption for their demonic past', 'finding purpose beyond destruction and chaos'],
            challenge: ['resisting their inherent destructive urges', 'gaining trust despite their demonic nature', 'adapting to moral concepts alien to their realm']
        },
        angel: {
            origin: ['was cast down from the heavens for questioning divine will', 'chose to walk among mortals to better understand them', 'was sent on a divine mission that became personal'],
            motivation: ['guiding mortals toward righteousness and justice', 'protecting the innocent from supernatural threats', 'finding purpose beyond rigid divine commandments'],
            challenge: ['maintaining their moral purity in a corrupt world', 'dealing with the weight of divine expectations', 'understanding mortal emotions and motivations']
        },
        gist: {
            origin: ['died in a magical accident but couldn\'t move on to the afterlife', 'was caught between life and death during a necromantic ritual', 'chose to remain as a spirit to complete unfinished business'],
            motivation: ['helping other lost souls find peace', 'serving as a bridge between the living and the dead', 'unraveling the mystery of their spectral existence'],
            challenge: ['existing in a state between life and death', 'communicating with the living world', 'resisting the pull of the true afterlife']
        },
        'faceless-one': {
            origin: ['emerged from the spaces between realities', 'was once human but lost their identity through magical experimentation', 'exists as a collective consciousness seeking individual identity'],
            motivation: ['discovering what it means to have a true identity', 'exploring different perspectives through shapeshifting', 'helping others who have lost themselves'],
            challenge: ['maintaining a sense of self without a fixed form', 'being trusted despite their shape-changing nature', 'resisting the urge to lose themselves in other identities']
        },
        remnant: {
            origin: ['is all that remains of a once-powerful magical being', 'survived the destruction of their original form through sheer will', 'was preserved by ancient magic when their body was destroyed'],
            motivation: ['reclaiming fragments of their lost power and memories', 'sharing ancient knowledge with the modern world', 'finding a new purpose beyond their past existence'],
            challenge: ['dealing with the loss of their former glory', 'adapting to their diminished state', 'piecing together fragmented memories of their past']
        }
    };
    
    return speciesBackgrounds[species] || speciesBackgrounds.human;
}

function getDisciplineBackgroundElements(discipline) {
    const disciplineBackgrounds = {
        elemental: {
            training: ['studied under a master elementalist in a remote monastery', 'discovered their powers during a natural disaster', 'was taught by spirits of the elements themselves'],
            focus: ['mastering the balance between opposing elements', 'learning to channel raw elemental fury without being consumed', 'exploring the connections between emotion and elemental power'],
            reputation: ['known for their spectacular magical displays', 'feared for their destructive potential', 'respected as a force of nature made manifest']
        },
        adept: {
            training: ['studied at a prestigious magical academy', 'learned through rigorous self-study and experimentation', 'was mentored by a renowned magical theorist'],
            focus: ['perfecting precise magical techniques', 'pushing the boundaries of magical theory', 'developing new applications for fundamental magical principles'],
            reputation: ['admired for their technical magical skill', 'consulted for complex magical problems', 'known as a perfectionist and innovator']
        },
        necromancy: {
            training: ['learned from a reclusive necromancer in exchange for service', 'discovered their abilities through a near-death experience', 'studied forbidden texts in hidden libraries'],
            focus: ['understanding the boundary between life and death', 'mastering communication with spirits and undead', 'exploring the ethical implications of death magic'],
            reputation: ['viewed with suspicion and fear by most', 'sought out by those dealing with death and loss', 'known for their pragmatic approach to mortality']
        },
        symbol: {
            training: ['studied ancient texts in monastery libraries', 'learned from archaeological discoveries of lost civilizations', 'was taught by a secret society of symbol mages'],
            focus: ['deciphering ancient magical languages', 'creating new symbolic systems for modern magic', 'preserving knowledge that might otherwise be lost'],
            reputation: ['respected as a scholar and historian', 'consulted for matters involving ancient magic', 'known for their methodical and careful approach']
        },
        sensitive: {
            training: ['developed their abilities through meditation and mental discipline', 'was trained by other psychics in secluded communities', 'learned to control their natural empathic abilities'],
            focus: ['protecting their mind from psychic intrusion', 'learning to help others through mental healing', 'exploring the connections between all conscious minds'],
            reputation: ['trusted as a counselor and advisor', 'sometimes feared for their ability to read thoughts', 'known for their deep understanding of others']
        },
        unknown: {
            training: ['manifested unusual abilities that no teacher could explain', 'learned through trial and error with unpredictable results', 'was guided by mysterious visions and dreams'],
            focus: ['understanding the nature of their strange abilities', 'finding others who might share similar powers', 'learning to control chaos and unpredictability'],
            reputation: ['viewed as an enigma by other mages', 'both feared and fascinated for their unusual magic', 'known for achieving impossible things through unknown means']
        }
    };
    
    return disciplineBackgrounds[discipline] || disciplineBackgrounds.unknown;
}

function getPersonalityElements(traits) {
    const elements = {
        motivation: [],
        conflict: [],
        strength: [],
        quirk: []
    };
    
    // Light vs Dark motivations
    if (traits.primaryAlignment === 'light') {
        elements.motivation.push('protecting innocent people from supernatural threats');
        elements.motivation.push('bringing justice to those who abuse magical power');
        elements.strength.push('unwavering moral compass');
        elements.conflict.push('struggling with the temptation to use dark methods for good ends');
    } else {
        elements.motivation.push('gaining power to control their own destiny');
        elements.motivation.push('exploring forbidden knowledge regardless of consequences');
        elements.strength.push('willingness to do what others cannot');
        elements.conflict.push('battling their darker impulses when they threaten what they care about');
    }
    
    // Leadership vs Follower
    if (traits.leadership === 'leader') {
        elements.motivation.push('building alliances and protecting their followers');
        elements.strength.push('natural charisma and strategic thinking');
        elements.conflict.push('bearing responsibility for others\' wellbeing');
        elements.quirk.push('always planning three steps ahead');
    } else {
        elements.motivation.push('finding someone worthy of their loyalty and trust');
        elements.strength.push('exceptional dedication and support abilities');
        elements.conflict.push('struggling with self-doubt and decision-making');
        elements.quirk.push('preferring to observe before acting');
    }
    
    // Intuitive vs Scholarly
    if (traits.learning === 'intuitive') {
        elements.strength.push('ability to understand complex situations instinctively');
        elements.quirk.push('making unexpected connections others miss');
        elements.conflict.push('difficulty explaining their reasoning to others');
    } else {
        elements.strength.push('vast knowledge and analytical problem-solving');
        elements.quirk.push('collecting rare books and scrolls');
        elements.conflict.push('overthinking situations that require quick action');
    }
    
    // Elemental vs Adept approach
    if (traits.primaryApproach === 'elemental') {
        elements.quirk.push('emotions directly affecting their magical abilities');
        elements.strength.push('incredible magical power when passionate');
    } else {
        elements.quirk.push('treating magic like a precise science');
        elements.strength.push('maintaining calm under pressure');
    }
    
    return elements;
}

function constructBackgroundStory(elements, takenName) {
    // Select random elements for variety
    const origin = elements.species.origin[Math.floor(Math.random() * elements.species.origin.length)];
    const training = elements.discipline.training[Math.floor(Math.random() * elements.discipline.training.length)];
    const motivation = elements.species.motivation[Math.floor(Math.random() * elements.species.motivation.length)];
    const personalMotivation = elements.personality.motivation[Math.floor(Math.random() * elements.personality.motivation.length)];
    const challenge = elements.species.challenge[Math.floor(Math.random() * elements.species.challenge.length)];
    const personalConflict = elements.personality.conflict[Math.floor(Math.random() * elements.personality.conflict.length)];
    const strength = elements.personality.strength[Math.floor(Math.random() * elements.personality.strength.length)];
    const quirk = elements.personality.quirk[Math.floor(Math.random() * elements.personality.quirk.length)];
    const reputation = elements.discipline.reputation[Math.floor(Math.random() * elements.discipline.reputation.length)];
    
    const story = {
        title: `The Chronicle of ${takenName}`,
        sections: {
            origins: {
                title: "Origins & Early Life",
                text: `${takenName} ${origin}. From an early age, they showed signs of the challenges that would define their existence: ${challenge}. This shaped their worldview and drove them toward ${motivation}.`
            },
            training: {
                title: "Magical Development", 
                text: `Their magical education began when they ${training}. Through dedication and natural talent, they developed their abilities and became ${reputation}. Their approach to magic is characterized by ${strength}, though they sometimes struggle with ${personalConflict}.`
            },
            motivation: {
                title: "Driving Purpose",
                text: `What truly drives ${takenName} is ${personalMotivation}. This personal mission often puts them in situations where they must balance their goals with their moral compass. They are known for ${quirk}, which sometimes surprises both allies and enemies.`
            },
            currentSituation: {
                title: "Present Circumstances",
                text: `Today, ${takenName} continues their journey in the magical world, using their unique combination of abilities and experiences to navigate the complex political and social landscape. Their past has prepared them for the challenges ahead, though new trials await that will test everything they believe about themselves and their place in the world.`
            }
        },
        traits: {
            strengths: [strength, elements.species.motivation[0]],
            challenges: [challenge, personalConflict],
            quirks: [quirk],
            reputation: [reputation]
        }
    };
    
    return story;
}