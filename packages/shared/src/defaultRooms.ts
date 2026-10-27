import type { RoomContent } from "./schemas"

const split = (s: string) => s.split(" / ")

/**
 * The museum's built-in curriculum. Used to seed the CMS database and as the
 * museum's offline fallback when the API is unreachable. Array order matters:
 * it drives each room's angle around the lobby.
 */
export const defaultRooms: RoomContent[] = [
  {
    slug: "tenses",
    name: "Verb Tenses",
    nameEs: "Tiempos verbales",
    accent: "tenses",
    kind: "corridor",
    panels: [
      { wall: "west", slot: 0, title: "Past Simple", subtitle: "verb + -ed / irregular", body: ["I visited Caracas last year."] },
      { wall: "east", slot: 0, title: "Past Continuous", subtitle: "was/were + -ing", body: ["I was cooking when you called."] },
      { wall: "west", slot: 1, title: "Past Perfect", subtitle: "had + past participle", body: ["The train had left when we arrived."] },
      { wall: "east", slot: 1, title: "Past Perfect Continuous", subtitle: "had been + -ing", body: ["She had been waiting for two hours."] },
      { wall: "west", slot: 2, title: "Present Simple", subtitle: "verb / verb + s", body: ["Water boils at 100°C.", "I work from home."] },
      { wall: "east", slot: 2, title: "Present Continuous", subtitle: "am/is/are + -ing", body: ["I am learning English right now."] },
      { wall: "west", slot: 3, title: "Present Perfect", subtitle: "have/has + past participle", body: ["I have visited Mérida three times."] },
      { wall: "east", slot: 3, title: "Present Perfect Continuous", subtitle: "have/has been + -ing", body: ["It has been raining all day."] },
      { wall: "west", slot: 4, title: "Future Simple", subtitle: "will + verb", body: ["I will call you tomorrow."] },
      { wall: "east", slot: 4, title: "Going to", subtitle: "am/is/are going to + verb", body: ["We are going to move next month."] },
      { wall: "west", slot: 5, title: "Future Continuous", subtitle: "will be + -ing", body: ["This time tomorrow, I'll be flying to Madrid."] },
      { wall: "east", slot: 5, title: "Future Perfect", subtitle: "will have + past participle", body: ["By 2030, I will have finished my degree."] },
    ],
  },
  {
    slug: "conditionals",
    name: "Conditionals",
    nameEs: "Condicionales",
    accent: "conditionals",
    kind: "room",
    panels: [
      {
        wall: "north", slot: 0,
        title: "Zero Conditional",
        subtitle: "Facts & general truths — If + present simple, present simple",
        body: split("If you heat water to 100°C, it boils. / If it rains, the ground gets wet. / Plants die if they don't get water."),
      },
      {
        wall: "north", slot: 1,
        title: "First Conditional",
        subtitle: "Real future possibility — If + present simple, will + verb",
        body: split("If it rains tomorrow, I will stay home. / If you study, you will pass the exam. / I'll call you if I finish early."),
      },
      {
        wall: "north", slot: 2,
        title: "Second Conditional",
        subtitle: "Unreal present / hypothetical — If + past simple, would + verb",
        body: split("If I had a million dollars, I would travel the world. / If I were you, I would apologize. / She would be happier if she lived near the beach."),
      },
      {
        wall: "east", slot: 1,
        title: "Third Conditional",
        subtitle: "Unreal past / regret — If + past perfect, would have + past participle",
        body: split("If I had studied, I would have passed. / If you had told me, I would have helped you. / They wouldn't have missed the flight if they had left earlier."),
      },
      {
        wall: "west", slot: 1,
        title: "Mixed Conditionals",
        subtitle: "Past cause → present result — If + past perfect, would + verb",
        body: split("If I had saved money, I would be rich now. / If she hadn't missed the bus, she would be here."),
      },
      {
        wall: "south", slot: 0,
        title: "Tip",
        body: ['"If I were you..." — use were for all persons in the second conditional.'],
      },
    ],
  },
  {
    slug: "passive",
    name: "Passive Voice",
    nameEs: "Voz pasiva",
    accent: "passive",
    kind: "room",
    panels: [
      {
        wall: "north", slot: 0,
        title: "What is the passive?",
        subtitle: "Object becomes subject: be + past participle",
        body: ["Active: Shakespeare wrote Hamlet.", "→ Passive: Hamlet was written by Shakespeare."],
      },
      {
        wall: "north", slot: 1,
        title: "Present passive",
        subtitle: "am / is / are + past participle",
        body: split("English is spoken here. / These phones are made in Vietnam. / The house is being painted right now."),
      },
      {
        wall: "north", slot: 2,
        title: "Past passive",
        subtitle: "was / were + past participle",
        body: split("The pyramids were built thousands of years ago. / My bike was stolen last night. / The road was being repaired when we arrived."),
      },
      {
        wall: "east", slot: 1,
        title: "Perfect passive",
        subtitle: "have / has / had been + past participle",
        body: split("The report has been finished. / The tickets had been sold before we arrived."),
      },
      {
        wall: "west", slot: 1,
        title: "Modal passive",
        subtitle: "modal + be + past participle",
        body: split("This form must be signed. / The problem can be solved. / Rules should be followed."),
      },
      {
        wall: "south", slot: 0,
        title: "Tip",
        body: ['Use the passive when the doer is unknown, obvious, or unimportant. Use "by + agent" only when the doer matters.'],
      },
    ],
  },
  {
    slug: "relatives",
    name: "Relative Clauses",
    nameEs: "Oraciones de relativo",
    accent: "relatives",
    kind: "room",
    // North, left to right: the pronouns, then defining and non-defining.
    // Each side wall runs from its north corner toward the door:
    // east = whom, whose, where/when; west = the comma pair, omitting.
    // East slots count from the door (see Room.tsx), so whom is east slot 2,
    // beside the pronouns; west slots count from the north corner, so the
    // comma pair is west slot 0, beside non-defining. Panels are listed in
    // this walking order, the same as the rows in the spec's §5.5.
    // Every body line is measured to fit WallPanel (≤ 8 text lines in all).
    panels: [
      {
        wall: "north", slot: 0,
        title: "Relative pronouns",
        subtitle: "who = subject, whom = object (people)",
        body: [
          "who: The woman who called is my sister.",
          "whom: The man whom you met is my uncle.",
          "whose (possession): The student whose phone rang was embarrassed.",
          "which (things): The car which is red is mine.",
          "that (people or things): The movie that we watched was fantastic.",
        ],
      },
      {
        wall: "north", slot: 1,
        title: "Defining clauses",
        subtitle: "tells you which one — no commas",
        body: [
          "The woman who called is my sister. (Which woman? The one who called.)",
          "Students who study hard get good grades. (only those students)",
          '"that" can replace who, whom or which.',
          "All five pronoun examples are defining.",
        ],
      },
      {
        wall: "north", slot: 2,
        title: "Non-defining clauses",
        subtitle: 'extra info about a known noun — commas, never "that", keep the pronoun',
        body: [
          "Incorrect: Paris, that is the capital of France, is beautiful.",
          "Correct: Paris, which is the capital of France, is beautiful.",
          "Without the extra info: Paris is beautiful.",
        ],
      },
      {
        wall: "east", slot: 2,
        title: "Who or whom?",
        subtitle: "whom = the object · more formal English",
        body: [
          "The man whom I met was very kind. (I met him: the man receives the action.)",
          "The man who met me was very kind. (He met me: the man does the action.)",
        ],
      },
      {
        wall: "east", slot: 1,
        title: "Whose",
        subtitle: "possession — whose replaces a word like his, her, their, our…",
        body: [
          "My neighbor lives in apartment 3D. Her cat is orange.",
          "Her cat becomes whose cat:",
          "My neighbor, whose cat is orange, lives in apartment 3D.",
        ],
      },
      {
        wall: "east", slot: 0,
        title: "Where / When",
        subtitle: "where = place, when = time",
        body: split("This is the town where I grew up. / I remember the day when we met."),
      },
      {
        wall: "west", slot: 0,
        title: "With or without commas?",
        subtitle: "same words, different meaning",
        body: [
          "Defining: My brother who lives in Madrid is visiting. (I have more than one brother.)",
          "Non-defining: My brother, who lives in Madrid, is visiting. (I have only one brother.)",
        ],
      },
      {
        wall: "west", slot: 1,
        title: "Omitting the pronoun",
        subtitle: "only when it's the object, and only in defining clauses",
        body: [
          "The man (whom) you met is my uncle.",
          "The movie (that) we watched was fantastic.",
          "Keep a subject: The car which is red is mine.",
          "Commas? Keep it: My uncle, whom you met, is a doctor.",
        ],
      },
    ],
  },
  {
    slug: "modals",
    name: "Modal Verbs Hall",
    nameEs: "Verbos modales",
    accent: "modals",
    kind: "room",
    panels: [
      {
        wall: "north", slot: 0,
        title: "Can / Could",
        subtitle: "ability, permission, possibility",
        body: split("She can swim very well. / Could you open the window? / I could read when I was four."),
      },
      {
        wall: "north", slot: 1,
        title: "May / Might",
        subtitle: "possibility, formal permission",
        body: split("It may rain later. / She might not come to the party. / May I come in?"),
      },
      {
        wall: "north", slot: 2,
        title: "Must / Have to",
        subtitle: "obligation, strong deduction",
        body: split("You must wear a seatbelt. / I have to work on Saturday. / He must be tired — he ran a marathon."),
      },
      {
        wall: "east", slot: 0,
        title: "Mustn't vs. Don't have to",
        subtitle: "prohibition vs. no obligation",
        body: split("You mustn't smoke here (prohibited). / You don't have to pay (it's free — not necessary)."),
      },
      {
        wall: "east", slot: 2,
        title: "Should / Ought to",
        subtitle: "advice, expectation",
        body: split("You should see a doctor. / We ought to leave now. / The bus should arrive at 9."),
      },
      {
        wall: "west", slot: 0,
        title: "Would / Will",
        subtitle: "requests, habits, willingness",
        body: split("Would you help me, please? / When I was a kid, I would play outside all day. / I'll carry that for you."),
      },
      {
        wall: "west", slot: 2,
        title: "Modals of deduction",
        subtitle: "must / might / can't + be",
        body: split("She must be at home — the lights are on. / He can't be the thief — he was with me. / They might be lost."),
      },
    ],
  },
  {
    slug: "reported",
    name: "Reported Speech",
    nameEs: "Estilo indirecto",
    accent: "reported",
    kind: "room",
    panels: [
      {
        wall: "north", slot: 0,
        title: "What is reported speech?",
        subtitle: "direct words → reported words, usually one tense back",
        body: ['Direct: "I am tired," she said.', "→ Reported: She said (that) she was tired."],
      },
      {
        wall: "north", slot: 1,
        title: "Tense backshift",
        subtitle: "present → past · past → past perfect · will → would · can → could",
        body: [
          '"I work here." → He said he worked there.',
          '"I finished it." → She said she had finished it.',
          '"I will help." → He said he would help.',
          '"I can swim." → She said she could swim.',
        ],
      },
      {
        wall: "north", slot: 2,
        title: "Reported questions",
        subtitle: "statement word order · if / whether for yes–no questions",
        body: [
          '"Where do you live?" → She asked me where I lived.',
          '"Do you like coffee?" → He asked if I liked coffee.',
          '"What time is it?" → She asked what time it was.',
        ],
      },
      {
        wall: "east", slot: 1,
        title: "Commands & requests",
        subtitle: "tell / ask + object + (not) to + verb",
        body: [
          '"Close the door." → He told me to close the door.',
          '"Please wait." → She asked us to wait.',
          '"Don\'t be late." → Mom told me not to be late.',
        ],
      },
      {
        wall: "west", slot: 1,
        title: "Time & place changes",
        subtitle: "now → then · today → that day · tomorrow → the next day · here → there",
        body: [
          '"I\'ll call you tomorrow." → She said she would call me the next day.',
          '"I saw him yesterday." → He said he had seen him the day before.',
          '"We live here." → They said they lived there.',
        ],
      },
      {
        wall: "south", slot: 0,
        title: "Say vs. Tell",
        subtitle: "say something · tell someone something",
        body: split("She said (that) she was busy. / She told me (that) she was busy. / Never: She said me..."),
      },
    ],
  },
  {
    slug: "connectors",
    name: "Connectors",
    nameEs: "Conectores",
    accent: "connectors",
    kind: "room",
    panels: [
      {
        wall: "north", slot: 0,
        title: "Addition",
        subtitle: "and, also, in addition, moreover, furthermore",
        body: ["She speaks English. Moreover, she is fluent in French."],
      },
      {
        wall: "north", slot: 1,
        title: "Contrast",
        subtitle: "but, however, although, even though, despite, whereas",
        body: split("Although it was raining, we went out. / Despite the traffic, we arrived on time."),
      },
      {
        wall: "north", slot: 2,
        title: "Cause & Effect",
        subtitle: "because, since, so, therefore, as a result",
        body: split("He was late because of the traffic. / It rained heavily; therefore, the match was cancelled."),
      },
      {
        wall: "east", slot: 1,
        title: "Purpose",
        subtitle: "to, in order to, so that",
        body: split("I study every day in order to improve. / She spoke slowly so that everyone could understand."),
      },
      {
        wall: "west", slot: 1,
        title: "Sequence",
        subtitle: "first, then, next, after that, finally, meanwhile",
        body: ["First, mix the ingredients. Then bake for 30 minutes. Finally, let it cool."],
      },
      {
        wall: "south", slot: 0,
        title: "Condition & Concession",
        subtitle: "unless, as long as, in case, nevertheless",
        body: split("You'll miss the bus unless you hurry. / Take an umbrella in case it rains."),
      },
    ],
  },
  {
    slug: "gerunds",
    name: "Gerunds & Infinitives",
    nameEs: "Gerundios e infinitivos",
    accent: "gerunds",
    kind: "room",
    panels: [
      {
        wall: "north", slot: 0,
        title: "Verb + gerund",
        subtitle: "enjoy, avoid, finish, mind, suggest, keep, practice + -ing",
        body: split("I enjoy swimming. / He avoided answering. / She keeps making the same mistake. / Do you mind waiting?"),
      },
      {
        wall: "north", slot: 1,
        title: "Verb + infinitive",
        subtitle: "want, decide, hope, plan, agree, promise, refuse + to",
        body: split("I want to learn English. / They decided to move. / She promised to call. / He refused to help."),
      },
      {
        wall: "north", slot: 2,
        title: "Both, same meaning",
        subtitle: "begin, start, continue, like, love, hate",
        body: split("It started to rain. = It started raining. / I love to cook. = I love cooking."),
      },
      {
        wall: "east", slot: 1,
        title: "Both, DIFFERENT meaning",
        subtitle: "remember, stop, try, forget",
        body: split("I stopped smoking (quit) vs. I stopped to smoke (paused in order to smoke). / Remember to lock the door (future duty) vs. I remember locking the door (past memory)."),
      },
      {
        wall: "west", slot: 1,
        title: "After prepositions → gerund",
        subtitle: "preposition + -ing, always",
        body: split("She's good at drawing. / I'm interested in learning. / Thanks for coming. / He left without saying goodbye."),
      },
      {
        wall: "south", slot: 0,
        title: "Gerund as subject",
        subtitle: "-ing form starts the sentence",
        body: split("Swimming is great exercise. / Learning a language takes time."),
      },
    ],
  },
  {
    slug: "phrasals",
    name: "Phrasal Verbs",
    nameEs: "Verbos compuestos",
    accent: "phrasals",
    kind: "room",
    panels: [
      {
        wall: "north", slot: 0,
        title: "GET",
        body: split("get up (rise from bed) — I get up at 6. / get along (have a good relationship) — We get along well. / get over (recover) — She got over the flu. / get away with (escape punishment) — He got away with cheating."),
      },
      {
        wall: "north", slot: 1,
        title: "TAKE",
        body: split("take off (plane departs; remove) — The plane took off late. / take up (start a hobby) — I took up yoga. / take after (resemble family) — She takes after her mother. / take care of (look after) — I take care of my plants."),
      },
      {
        wall: "north", slot: 2,
        title: "PUT",
        body: split("put on (wear) — Put on your jacket. / put off (postpone) — They put off the meeting. / put up with (tolerate) — I can't put up with this noise."),
      },
      {
        wall: "east", slot: 1,
        title: "LOOK",
        body: split("look for (search) — I'm looking for my keys. / look after (care for) — She looks after her brother. / look forward to (anticipate) — I look forward to seeing you. / look up (search info) — Look it up in the dictionary."),
      },
      {
        wall: "west", slot: 1,
        title: "GIVE / GO",
        body: split("give up (quit) — He gave up smoking. / give back (return) — Give me back my pen. / go on (continue) — The show must go on. / go out (socialize) — We go out on Fridays."),
      },
      {
        wall: "south", slot: 0,
        title: "TURN / RUN",
        body: split("turn on / turn off — Turn off the lights. / turn down (reject; lower) — She turned down the job. / run out of (have none left) — We ran out of milk. / run into (meet by chance) — I ran into an old friend."),
      },
    ],
  },
  {
    slug: "idioms",
    name: "Idioms",
    nameEs: "Modismos",
    accent: "idioms",
    kind: "room",
    panels: [
      {
        wall: "north", slot: 0,
        title: "Everyday life",
        body: split("piece of cake — very easy — The test was a piece of cake. / hit the sack — go to bed — I'm exhausted; time to hit the sack. / under the weather — slightly sick — I'm feeling under the weather today."),
      },
      {
        wall: "north", slot: 1,
        title: "Money & work",
        body: split("cost an arm and a leg — very expensive — That car costs an arm and a leg. / call it a day — stop working — Let's call it a day. / cut corners — do something cheaply/badly — Don't cut corners on safety."),
      },
      {
        wall: "north", slot: 2,
        title: "Communication",
        body: split("break the ice — start a conversation — He told a joke to break the ice. / spill the beans — reveal a secret — Who spilled the beans about the party? / get the wrong end of the stick — misunderstand — You got the wrong end of the stick."),
      },
      {
        wall: "east", slot: 1,
        title: "Effort & luck",
        body: split("break a leg — good luck! — Break a leg at your audition! / once in a blue moon — very rarely — We eat out once in a blue moon. / the ball is in your court — it's your decision — I made my offer; the ball is in your court."),
      },
      {
        wall: "west", slot: 1,
        title: "Feelings",
        body: split("over the moon — very happy — She was over the moon about the news. / cold feet — sudden nervousness — He got cold feet before the wedding. / on cloud nine — extremely happy — I've been on cloud nine since I got the job."),
      },
    ],
  },
]
