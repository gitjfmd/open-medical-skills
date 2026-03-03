#!/usr/bin/env python3
"""
CBT Therapeutic Techniques Guide
=================================
Evidence-based Cognitive Behavioral Therapy tools implementing core CBT
techniques including thought records, cognitive restructuring, behavioral
activation scheduling, and cognitive distortion identification.

Clinical Purpose:
    Provides structured CBT worksheets and exercises for clinicians and
    patients. Implements Beck's cognitive model with standardized thought
    record formats, common cognitive distortion taxonomy, and behavioral
    activation planning tools.

References:
    - Beck AT. Cognitive Therapy and the Emotional Disorders. 1976.
    - Burns DD. Feeling Good: The New Mood Therapy. 1980.
    - Hofmann SG, et al. "The Efficacy of CBT: A Review of Meta-Analyses."
      Cognitive Therapy and Research. 2012;36(5):427-440.
    - Cuijpers P, et al. "A Meta-Analysis of CBT for Adult Depression."
      J Consult Clin Psychol. 2013;81(3):456-467.

DISCLAIMER: This tool is for clinical decision support and patient education
only. It does not constitute psychotherapy and does not replace the
therapeutic relationship with a licensed mental health professional.
"""

import json
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from enum import Enum


class CognitiveDistortion(Enum):
    """
    Common cognitive distortions (Burns, 1980; Beck, 1976).
    These are systematic errors in thinking that maintain negative beliefs.
    """
    ALL_OR_NOTHING = "all_or_nothing_thinking"
    OVERGENERALIZATION = "overgeneralization"
    MENTAL_FILTER = "mental_filter"
    DISQUALIFYING_POSITIVE = "disqualifying_the_positive"
    JUMPING_TO_CONCLUSIONS = "jumping_to_conclusions"
    MIND_READING = "mind_reading"
    FORTUNE_TELLING = "fortune_telling"
    MAGNIFICATION = "magnification_or_minimization"
    EMOTIONAL_REASONING = "emotional_reasoning"
    SHOULD_STATEMENTS = "should_statements"
    LABELING = "labeling"
    PERSONALIZATION = "personalization"
    CATASTROPHIZING = "catastrophizing"
    BLAME = "blame"


DISTORTION_DESCRIPTIONS = {
    CognitiveDistortion.ALL_OR_NOTHING: {
        "name": "All-or-Nothing Thinking",
        "description": "Seeing things in black-and-white categories. If performance falls short of perfect, you see yourself as a total failure.",
        "example": "I didn't get an A, so I'm a complete failure.",
        "challenge": "Is there a middle ground? Can something be partially successful?",
    },
    CognitiveDistortion.OVERGENERALIZATION: {
        "name": "Overgeneralization",
        "description": "Seeing a single negative event as a never-ending pattern of defeat.",
        "example": "I got rejected once; I'll always be rejected.",
        "challenge": "Is this truly always the case, or is this one instance?",
    },
    CognitiveDistortion.MENTAL_FILTER: {
        "name": "Mental Filter",
        "description": "Picking out a single negative detail and dwelling on it exclusively.",
        "example": "I got one negative comment on my presentation even though 20 were positive.",
        "challenge": "What is the full picture? What positives am I filtering out?",
    },
    CognitiveDistortion.CATASTROPHIZING: {
        "name": "Catastrophizing",
        "description": "Expecting the worst possible outcome or magnifying the importance of negative events.",
        "example": "If I fail this exam, my entire career is over.",
        "challenge": "What is the most likely outcome? What would I tell a friend?",
    },
    CognitiveDistortion.EMOTIONAL_REASONING: {
        "name": "Emotional Reasoning",
        "description": "Assuming that negative emotions reflect the way things really are.",
        "example": "I feel anxious, so something bad must be about to happen.",
        "challenge": "Feelings are not facts. What evidence exists beyond my emotions?",
    },
    CognitiveDistortion.SHOULD_STATEMENTS: {
        "name": "Should Statements",
        "description": "Motivating yourself with 'shoulds' and 'musts,' leading to guilt and frustration.",
        "example": "I should always be productive. I must never make mistakes.",
        "challenge": "Is this a preference or a rigid demand? What happens if I replace 'should' with 'prefer'?",
    },
    CognitiveDistortion.PERSONALIZATION: {
        "name": "Personalization",
        "description": "Seeing yourself as the cause of a negative event you were not primarily responsible for.",
        "example": "My patient didn't improve; it must be because I'm a bad clinician.",
        "challenge": "What other factors contributed? Am I taking responsibility for things outside my control?",
    },
    CognitiveDistortion.MIND_READING: {
        "name": "Mind Reading",
        "description": "Assuming you know what others are thinking without evidence.",
        "example": "My supervisor thinks I'm incompetent.",
        "challenge": "Do I have concrete evidence for this? Have I asked directly?",
    },
    CognitiveDistortion.FORTUNE_TELLING: {
        "name": "Fortune Telling",
        "description": "Predicting negative outcomes without evidence.",
        "example": "I'm going to fail the interview tomorrow.",
        "challenge": "Can I really predict the future? What evidence supports a different outcome?",
    },
    CognitiveDistortion.LABELING: {
        "name": "Labeling",
        "description": "Attaching a global label to yourself or others based on a single event.",
        "example": "I made a mistake, so I'm an idiot.",
        "challenge": "Am I defining myself by one event? Would I label someone else this way?",
    },
    CognitiveDistortion.MAGNIFICATION: {
        "name": "Magnification/Minimization",
        "description": "Exaggerating the importance of negative events or minimizing positive ones.",
        "example": "My small error is a disaster, but my promotion was just luck.",
        "challenge": "Am I keeping things in proportion? How significant will this be in a year?",
    },
    CognitiveDistortion.DISQUALIFYING_POSITIVE: {
        "name": "Disqualifying the Positive",
        "description": "Rejecting positive experiences by insisting they don't count.",
        "example": "They only said I did well to be nice.",
        "challenge": "Why can't positive feedback be genuine? What evidence contradicts my dismissal?",
    },
    CognitiveDistortion.JUMPING_TO_CONCLUSIONS: {
        "name": "Jumping to Conclusions",
        "description": "Making negative interpretations without definite facts to support the conclusion.",
        "example": "She didn't reply to my text; she must be angry with me.",
        "challenge": "What are other possible explanations?",
    },
    CognitiveDistortion.BLAME: {
        "name": "Blame",
        "description": "Holding other people entirely responsible for your distress, or blaming yourself for everything.",
        "example": "It's all their fault that I feel this way.",
        "challenge": "What is within my control? What responsibility belongs elsewhere?",
    },
}


@dataclass
class ThoughtRecord:
    """
    Standard 7-column CBT thought record (Beck, 1995).
    Used to identify, evaluate, and restructure automatic thoughts.
    """
    record_id: str = ""
    date: str = ""
    situation: str = ""
    emotions: list = field(default_factory=list)  # [{"emotion": str, "intensity": 0-100}]
    automatic_thoughts: list = field(default_factory=list)
    cognitive_distortions: list = field(default_factory=list)
    evidence_for: list = field(default_factory=list)
    evidence_against: list = field(default_factory=list)
    balanced_thought: str = ""
    new_emotion_rating: list = field(default_factory=list)  # [{"emotion": str, "intensity": 0-100}]

    def __post_init__(self):
        if not self.date:
            self.date = datetime.now().strftime("%Y-%m-%d %H:%M")
        if not self.record_id:
            self.record_id = f"TR-{datetime.now().strftime('%Y%m%d%H%M%S')}"


@dataclass
class BehavioralActivationEntry:
    """
    Behavioral activation schedule entry.
    Tracks activity, predicted vs actual mood, and mastery/pleasure ratings.
    """
    date: str
    time_block: str  # morning, afternoon, evening
    planned_activity: str
    activity_type: str  # mastery, pleasure, necessary
    predicted_mood: int = 5  # 0-10
    actual_mood: Optional[int] = None
    mastery_rating: Optional[int] = None  # 0-10
    pleasure_rating: Optional[int] = None  # 0-10
    completed: bool = False


def identify_distortions(thought: str) -> list:
    """
    Analyze an automatic thought and identify potential cognitive distortions.

    This uses keyword pattern matching as a screening aid. Clinical judgment
    should always be applied to the final interpretation.
    """
    thought_lower = thought.lower()
    identified = []

    # All-or-nothing indicators
    if any(w in thought_lower for w in ["always", "never", "nothing", "everything",
                                         "completely", "totally", "perfect"]):
        identified.append(CognitiveDistortion.ALL_OR_NOTHING)

    # Overgeneralization
    if any(w in thought_lower for w in ["always", "never", "everyone", "no one",
                                         "every time", "nothing ever"]):
        identified.append(CognitiveDistortion.OVERGENERALIZATION)

    # Catastrophizing
    if any(w in thought_lower for w in ["worst", "terrible", "disaster", "horrible",
                                         "catastrophe", "end of", "ruined"]):
        identified.append(CognitiveDistortion.CATASTROPHIZING)

    # Should statements
    if any(w in thought_lower for w in ["should", "must", "ought to", "have to",
                                         "supposed to"]):
        identified.append(CognitiveDistortion.SHOULD_STATEMENTS)

    # Mind reading
    if any(w in thought_lower for w in ["they think", "he thinks", "she thinks",
                                         "everyone thinks", "they must think",
                                         "probably thinks"]):
        identified.append(CognitiveDistortion.MIND_READING)

    # Emotional reasoning
    if any(w in thought_lower for w in ["i feel like", "i feel that",
                                         "it feels like", "feels wrong"]):
        identified.append(CognitiveDistortion.EMOTIONAL_REASONING)

    # Labeling
    if any(w in thought_lower for w in ["i'm a ", "i am a ", "i'm such a",
                                         "idiot", "failure", "loser", "worthless"]):
        identified.append(CognitiveDistortion.LABELING)

    # Personalization
    if any(w in thought_lower for w in ["my fault", "because of me",
                                         "i caused", "blame myself"]):
        identified.append(CognitiveDistortion.PERSONALIZATION)

    # Fortune telling
    if any(w in thought_lower for w in ["going to fail", "will never", "won't work",
                                         "bound to", "doomed"]):
        identified.append(CognitiveDistortion.FORTUNE_TELLING)

    # Remove duplicates while preserving order
    seen = set()
    unique = []
    for d in identified:
        if d not in seen:
            seen.add(d)
            unique.append(d)

    return unique


def create_thought_record(situation: str, emotions: list,
                          automatic_thoughts: list) -> dict:
    """
    Create a structured CBT thought record and guide the restructuring process.

    Args:
        situation: Description of the triggering situation
        emotions: List of dicts [{"emotion": str, "intensity": int}]
        automatic_thoughts: List of automatic thoughts (hot thoughts)

    Returns:
        Structured thought record with distortion analysis and restructuring prompts
    """
    record = ThoughtRecord(
        situation=situation,
        emotions=emotions,
        automatic_thoughts=automatic_thoughts,
    )

    # Identify cognitive distortions across all automatic thoughts
    all_distortions = []
    thought_analysis = []
    for thought in automatic_thoughts:
        distortions = identify_distortions(thought)
        distortion_details = []
        for d in distortions:
            info = DISTORTION_DESCRIPTIONS.get(d, {})
            distortion_details.append({
                "distortion": info.get("name", d.value),
                "description": info.get("description", ""),
                "challenge_question": info.get("challenge", ""),
            })
            all_distortions.append(d)

        thought_analysis.append({
            "thought": thought,
            "identified_distortions": distortion_details,
        })

    record.cognitive_distortions = list(set(all_distortions))

    # Generate restructuring prompts
    restructuring_prompts = [
        "What is the evidence FOR this thought?",
        "What is the evidence AGAINST this thought?",
        "Is there an alternative explanation?",
        "What is the worst that could happen? Could I survive it?",
        "What is the best that could happen?",
        "What is the MOST REALISTIC outcome?",
        "What would I tell a close friend who had this thought?",
        "What is the effect of believing this thought? Of changing my thinking?",
    ]

    return {
        "thought_record": {
            "record_id": record.record_id,
            "date": record.date,
            "situation": record.situation,
            "emotions": record.emotions,
            "automatic_thoughts": thought_analysis,
            "restructuring_prompts": restructuring_prompts,
            "next_steps": [
                "1. Examine the evidence for and against each automatic thought",
                "2. Generate a balanced/alternative thought",
                "3. Re-rate your emotion intensity (0-100) after restructuring",
                "4. Note any changes in how you feel",
            ],
        },
        "disclaimer": "This is a clinical support tool, not a substitute for psychotherapy.",
    }


def generate_behavioral_activation_plan(current_mood: int,
                                        interests: list,
                                        barriers: list = None) -> dict:
    """
    Generate a behavioral activation schedule.

    Behavioral activation is an evidence-based treatment for depression that
    focuses on increasing engagement in valued activities to improve mood.

    Args:
        current_mood: Self-rated mood (0-10, where 10 is best)
        interests: List of activities the patient enjoys or used to enjoy
        barriers: List of perceived barriers to activity

    Returns:
        Structured weekly activity schedule with graded activities
    """
    barriers = barriers or []

    # Activity difficulty grading based on current mood
    if current_mood <= 3:
        difficulty = "gentle"
        activity_duration = "15-30 minutes"
        daily_target = 2
        guidance = ("Start with very small, manageable activities. The goal is "
                    "simply to begin moving, not to achieve a specific outcome. "
                    "Even getting dressed or taking a 5-minute walk counts.")
    elif current_mood <= 6:
        difficulty = "moderate"
        activity_duration = "30-60 minutes"
        daily_target = 3
        guidance = ("Build on small successes with moderately engaging activities. "
                    "Mix necessary tasks with pleasurable ones. Notice the "
                    "connection between activity and mood.")
    else:
        difficulty = "full"
        activity_duration = "60+ minutes"
        daily_target = 4
        guidance = ("Maintain your activity level and add new challenges. "
                    "Focus on activities that align with your values and "
                    "provide both mastery and pleasure.")

    # Categorize activities
    mastery_activities = [
        "Complete one household task",
        "Prepare a healthy meal",
        "Organize one small area",
        "Learn something new for 15 minutes",
        "Practice a skill or hobby",
    ]

    pleasure_activities = [
        "Listen to music you enjoy",
        "Spend time in nature (even 10 minutes)",
        "Connect with a friend or family member",
        "Read something enjoyable",
        "Practice mindful relaxation",
    ]

    # Add personalized activities from interests
    for interest in interests[:5]:
        pleasure_activities.append(f"Engage in {interest} (even briefly)")

    schedule = {
        "difficulty_level": difficulty,
        "activity_duration": activity_duration,
        "daily_target": daily_target,
        "guidance": guidance,
        "mastery_activities": mastery_activities,
        "pleasure_activities": pleasure_activities,
        "monitoring_instructions": [
            "Before each activity: rate your predicted mood (0-10)",
            "After each activity: rate your actual mood (0-10)",
            "Note: actual mood often exceeds predicted mood",
            "Rate mastery (sense of accomplishment, 0-10) and pleasure (0-10)",
            "Review patterns at end of week with your therapist",
        ],
    }

    if barriers:
        schedule["barrier_strategies"] = {
            barrier: "Break the activity into the smallest possible step. "
                     "Commit to just 2 minutes. You can always stop after 2 minutes."
            for barrier in barriers
        }

    return {
        "behavioral_activation_plan": schedule,
        "disclaimer": "Behavioral activation should be guided by a licensed therapist.",
    }


def run_cbt_tool(tool: str, **kwargs) -> str:
    """
    Main entry point for CBT tools.

    Tools:
        thought_record: Create a thought record
        identify_distortions: Analyze a thought for cognitive distortions
        behavioral_activation: Generate an activation plan
        distortion_reference: Get reference for all cognitive distortions
    """
    if tool == "thought_record":
        result = create_thought_record(
            kwargs.get("situation", ""),
            kwargs.get("emotions", []),
            kwargs.get("automatic_thoughts", []),
        )
    elif tool == "identify_distortions":
        thought = kwargs.get("thought", "")
        distortions = identify_distortions(thought)
        result = {
            "thought": thought,
            "distortions": [
                DISTORTION_DESCRIPTIONS[d] for d in distortions
            ],
        }
    elif tool == "behavioral_activation":
        result = generate_behavioral_activation_plan(
            kwargs.get("current_mood", 5),
            kwargs.get("interests", []),
            kwargs.get("barriers", []),
        )
    elif tool == "distortion_reference":
        result = {
            "cognitive_distortions": {
                d.value: DISTORTION_DESCRIPTIONS[d]
                for d in CognitiveDistortion
                if d in DISTORTION_DESCRIPTIONS
            },
        }
    else:
        result = {
            "error": f"Unknown tool: {tool}",
            "available_tools": ["thought_record", "identify_distortions",
                                "behavioral_activation", "distortion_reference"],
        }

    return json.dumps(result, indent=2)


if __name__ == "__main__":
    print("=== Thought Record Example ===")
    print(run_cbt_tool(
        "thought_record",
        situation="Presented at morning conference and stumbled over a question",
        emotions=[{"emotion": "anxiety", "intensity": 75},
                  {"emotion": "shame", "intensity": 60}],
        automatic_thoughts=[
            "Everyone thinks I'm incompetent",
            "I should always know the answer",
            "My career is going to fail because of this",
        ],
    ))
